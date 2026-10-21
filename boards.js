'use strict';
// 공개 제안글은 서버, 관리자 노트는 GitHub 권한으로 보호된 파일에 저장한다.
const REQUESTS_API = 'https://jonggoo-kang.smartdrum2048.chatgpt.site/api/requests';
const NOTES_API = 'https://api.github.com/repos/kangjong9/kangjong9.github.io/contents/notes-data.json';
function boardElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
async function boardFetch(url, options = {}) {
  const response = await fetch(url, {cache:'no-store', signal:AbortSignal.timeout(20000), ...options});
  let data; try {data = await response.json();} catch {throw new Error('서버 응답을 읽지 못했어요. 잠시 후 다시 시도해 주세요.');}
  if (!response.ok) throw new Error(data.error || (response.status === 409 ? '다른 창에서 글이 바뀌었어요. 새로고침 후 다시 시도해 주세요.' : '요청을 처리하지 못했어요. 로그인 또는 연결 상태를 확인해 주세요.'));
  return data;
}
function decodeNotes(meta) {
  const bytes = Uint8Array.from(atob(meta.content.replace(/\s/g,'')), char => char.charCodeAt(0));
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!Array.isArray(data.posts) || !data.posts.every(p => p && typeof p.id==='string' && typeof p.title==='string' && typeof p.message==='string' && Number.isFinite(Date.parse(p.created)))) throw new Error('노트 데이터를 확인하지 못했어요. 기존 글을 보호하기 위해 저장하지 않습니다.');
  return data.posts;
}
async function changeNotes(token, operation) {
  if (!token) throw new Error('관리자 로그인 후 작성해 주세요.');
  await verifyGitHubAdmin(token);
  const headers = {Accept:'application/vnd.github+json', Authorization:`Bearer ${token}`};
  const meta = await boardFetch(NOTES_API, {headers});
  const posts = decodeNotes(meta);
  const next = operation(posts);
  const bytes = new TextEncoder().encode(JSON.stringify({posts:next},null,2)+'\n');
  let binary=''; for(const byte of bytes) binary+=String.fromCharCode(byte);
  await boardFetch(NOTES_API, {method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'feat(notes): 생각 노트 게시글 갱신',sha:meta.sha,content:btoa(binary)})});
  return next;
}
async function initBoard(content, kind) {
  // 모달 컨테이너는 재사용되므로 이번 게시판 패널에만 이벤트를 연결한다.
  content = content.querySelector('.board-panel');
  if (!content) return;
  const isNotes = kind === 'notes';
  const form = content.querySelector('[data-board-form]');
  const list = content.querySelector('[data-board-list]');
  const status = content.querySelector('[data-board-status]');
  const more = content.querySelector('[data-board-more]');
  const refresh = content.querySelector('[data-board-refresh]');
  const authButton = content.querySelector('[data-board-auth]');
  const authForm = content.querySelector('[data-board-login]');
  let posts=[], next=null, busy=false, admin=false, loading=false;
  let submissionId=crypto.randomUUID();
  let submissionText='';
  const message = text => {status.textContent=text;};
  function updateAuth() {
    // 작성과 삭제는 GitHub 및 서버에서도 반드시 인증한다.
    form.hidden = isNotes && !admin;
    authButton.textContent = admin ? '관리자 로그아웃' : '관리자 로그인';
    content.querySelector('[data-board-write-hint]').textContent = isNotes ? (admin ? '주인아저씨의 새 이야기를 남겨 주세요.' : '누구나 읽고, 주인아저씨만 쓰는 노트예요.') : '닉네임으로 남긴 글은 방문자 모두에게 공개됩니다.';
  }
  function render() {
    list.replaceChildren(...posts.map(post => {
      const item=boardElement('li',undefined,'board-post');
      const detail=boardElement('details');
      const summary=boardElement('summary');
      summary.append(boardElement('strong',post.title),boardElement('span',`${isNotes?'주인아저씨':post.nickname} · ${new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium'}).format(new Date(post.created))}`,'board-meta'));
      const body=boardElement('p',post.message,'board-message');
      detail.append(summary,body);item.append(detail);
      if(admin) {
        const remove=boardElement('button','삭제','board-delete');remove.type='button';
        remove.addEventListener('click',async()=>{
          if(busy || loading || !confirm('이 글을 삭제할까요?'))return;
          busy=true;remove.disabled=true;
          try {
            const token=getAdminToken();if(!token)throw new Error('관리자 로그인이 필요합니다.');
            if(isNotes) posts=await changeNotes(token,current=>current.filter(p=>p.id!==post.id));
            else {await boardFetch(`${REQUESTS_API}?id=${encodeURIComponent(post.id)}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});posts=posts.filter(p=>p.id!==post.id);}
            render();message('글을 삭제했어요.');
          }catch(error){message(error.message);}finally{busy=false;remove.disabled=false;}
        });item.append(remove);
      }
      return item;
    }));
    content.querySelector('[data-board-empty]').hidden=posts.length>0;
    content.querySelector('[data-board-count]').textContent=`${posts.length}개의 이야기${next?' · 더 있어요':''}`;
    more.hidden=!next;
  }
  async function load(append=false) {
    if(loading || busy)return;loading=true;refresh.disabled=true;more.disabled=true;message('이야기를 불러오는 중…');
    try {
      if(isNotes) {
        const token=getAdminToken();
        try {posts=decodeNotes(await boardFetch(NOTES_API,{headers:{Accept:'application/vnd.github+json',...(token?{Authorization:`Bearer ${token}`}:{})}}));}
        catch(error) {if(token)throw error;const data=await boardFetch('./notes-data.json');if(!Array.isArray(data.posts))throw error;posts=data.posts;}
      } else {
        const data=await boardFetch(REQUESTS_API+(append&&next?'?before='+encodeURIComponent(next):''));
        posts=append?[...posts,...data.posts.filter(p=>!posts.some(old=>old.id===p.id))]:data.posts;next=data.next;
      }
      render();message('');
    } catch(error){message(error.message || '연결이 잠시 끊겼어요. 새로고침해 주세요.');}
    finally{loading=false;refresh.disabled=false;more.disabled=false;}
  }
  async function authenticate() {
    const token=getAdminToken();admin=false;
    if(token)try {await verifyGitHubAdmin(token);admin=getAdminToken()===token;}catch{message('관리자 로그인이 만료됐어요. 다시 로그인해 주세요.');}
    updateAuth();render();
  }
  const authChanged=()=>{if(content.isConnected)authenticate();else window.removeEventListener('playroom-auth-change',authChanged);};
  window.addEventListener('playroom-auth-change',authChanged);
  authButton.addEventListener('click',()=>{
    if(admin){setAdminToken('');admin=false;updateAuth();render();message('로그아웃했어요.');}
    else {authForm.hidden=!authForm.hidden;if(!authForm.hidden)authForm.elements.password.focus();}
  });
  authForm.addEventListener('submit',async event=>{
    event.preventDefault();const button=authForm.querySelector('button');button.disabled=true;
    try {const token=await unlockAdminVault(authForm.elements.password.value.trim());authForm.reset();authForm.hidden=true;setAdminToken(token);await authenticate();message('관리자로 로그인했어요.');}
    catch(error){message(error.message);}finally{button.disabled=false;}
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    if(loading){message('목록을 불러오는 중이에요. 잠시 후 게시해 주세요.');return;}
    if(isNotes && (!admin || !getAdminToken())){message('관리자만 노트를 작성할 수 있어요.');return;}
    const title=form.elements.title.value.trim(),body=form.elements.message.value.trim();
    const nickname=isNotes?'주인아저씨':form.elements.nickname.value.trim();
    if(!title || !body || !nickname || title.length>80 || body.length>2000 || nickname.length>24){message('닉네임·제목·내용을 길이에 맞게 적어 주세요.');return;}
    if(!isNotes && isReservedOwnerName(nickname)){message('주인아저씨는 관리자 전용 이름이에요. 다른 닉네임을 적어 주세요.');return;}
    const fingerprint=JSON.stringify([nickname,title,body]);
    if(submissionText && submissionText!==fingerprint)submissionId=crypto.randomUUID();
    submissionText=fingerprint;
    busy=true;const controls=[...form.querySelectorAll('input,textarea,button')];controls.forEach(control=>{control.disabled=true;});message('글을 저장하는 중…');
    const post={id:submissionId,title,message:body,nickname,created:new Date().toISOString()};
    try {
      if(isNotes) posts=await changeNotes(getAdminToken(),current=>current.some(p=>p.id===post.id)?current:[post,...current]);
      else {const data=await boardFetch(REQUESTS_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...post,website:form.elements.website.value})});posts=[data.post,...posts.filter(p=>p.id!==data.post.id)];}
      form.elements.title.value='';form.elements.message.value='';submissionId=crypto.randomUUID();submissionText='';render();
      message(isNotes?'노트를 게시했어요. 다른 방문자도 읽을 수 있어요.':'말 잘 들었어요 ㅋㅋ. 글이 게시됐습니다. 제작 약속은 아직 아니에요!');
    }catch(error){message(error.message || '저장 여부를 확인하지 못했어요. 입력 내용은 그대로 두었습니다.');}
    finally{busy=false;controls.forEach(control=>{control.disabled=false;});}
  });
  refresh.addEventListener('click',()=>load());more.addEventListener('click',()=>load(true));
  updateAuth();await Promise.all([load(),authenticate()]);
}
