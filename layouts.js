'use strict';
const ownerBio = '겉보기엔 멀쩡한 어른, 정신연령은 호기심 가득한 유딩입니다. 똘끼는 넉넉하고, 재밌는 냄새는 기가 막히게 맡죠. 한 번 꽂히면 겁도 브레이크도 잠시 실종! 일단 전력 질주하며 만들고 보는, 철들 틈 없이 바쁜 주인아저씨입니다. 😎';
function fillBio(root = document) { root.querySelectorAll('[data-bio]').forEach(el => { el.textContent = ownerBio; }); }
fillBio();
const stage = document.querySelector('.ex-stage');
if (stage) {
  const slides = [
    {type:'01 / WEB & TOOL',title:'MY PORTABLE\nDRIVE.',desc:'작업을 담아 두는 나만의 작은 공간.\nGitHub에 공개한 HTML 프로젝트입니다.',mark:'↗',label:'PORTABLE\nTHINKING.',link:'https://github.com/kangjong9/my-portable-drive',cta:'저장소 둘러보기 ↗'},
    {type:'02 / ANDROID APP',title:'MAENG\nDIET.',desc:'맹맹 다이어트 작전.\n직접 만든 안드로이드 앱의 소개를 준비하고 있습니다.',mark:'✿',label:'A LITTLE\nEVERYDAY.',link:'#owner',cta:'만든 사람 만나기 ↓'},
    {type:'03 / PERSONAL WEBSITE',title:'MY LITTLE\nPLAYGROUND.',desc:'지금 보고 있는 나만의 온라인 공간.\n만든 것과 만드는 이야기를 모읍니다.',mark:'✳',label:'STAY\nCURIOUS.',link:'./index.html',cta:'다른 레이아웃 보기 ↗'}
  ];
  let current = 0;
  function render() {
    const slide = slides[current]; stage.dataset.stage = String(current);
    for (const [id,key] of [['stage-type','type'],['stage-title','title'],['stage-desc','desc'],['object-mark','mark'],['object-label','label']]) document.getElementById(id).textContent = slide[key];
    const link=document.querySelector('#stage-link');link.href=slide.link;link.textContent=slide.cta;
    if (slide.link.startsWith('https:')) { link.target='_blank';link.rel='noopener noreferrer'; } else { link.removeAttribute('target');link.removeAttribute('rel'); }
    document.querySelector('#stage-status').textContent=`0${current+1} / 03 — ${slide.title.replace('\n',' ')}`;
  }
  document.querySelector('#previous').addEventListener('click',()=>{current=(current+slides.length-1)%slides.length;render();});
  document.querySelector('#next').addEventListener('click',()=>{current=(current+1)%slides.length;render();});
}
const dialog = document.querySelector('#app-window');
if (dialog) {
  const names={projects:'작업물 폴더',notes:'생각 노트',about:'주인아저씨 프로필',guestbook:'떠든 사람'};
  let opener=null;
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.open;
    if(key==='guestbook'){location.assign('https://jonggoo-kang.smartdrum2048.chatgpt.site/#guestbook');return;}
    const template=document.getElementById(`${key}-content`);
    if (!template) return;
    opener=button;
    document.querySelector('#app-window-title').textContent=names[key];
    const content=document.querySelector('#app-window-content');content.replaceChildren(template.content.cloneNode(true));fillBio(content);
    if (key === 'projects') initProjectFolders(content);
    if (key === 'guestbook') initGuestbook(content);
    dialog.showModal();dialog.querySelector('[data-close]').focus();
  }));
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{ if(opener)opener.focus(); });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  const clock=document.querySelector('#clock');
  function tick(){clock.textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit'}).format(new Date());}
  tick();setInterval(tick,30000);
  if (location.hash === '#projects') document.querySelector('[data-open="projects"]').click();
}

// Category membership and display order were supplied by the owner.
function initProjectFolders(content) {
  const categories = {fun: '심심해서 맹근', network: '네트워크 해봐?', work: '일하기 싫어서 제작'};
  const projects = {"fun": [["코딩놀이", "coding.svg"], ["귀염뽀짝 가계부", "ledger.svg"], ["맹맹 다이어트 작전(앱)", "maeng-app.svg"], ["다이어트 저리가(PC)", "diet-pc.svg"], ["유나세리나데", "yuna.svg"]], "network": [["포터블", "portable.svg"], ["현재 홈페이지", "homepage.png"]], "work": [["내역서 마스터", "estimate.svg"], ["AI친구들 전원 참여 회의실", "meeting.svg"]]};
  const root = content.querySelector('.project-root');
  const view = content.querySelector('.project-category-view');
  let selected = null;
  content.querySelectorAll('[data-project-category]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.projectCategory;
      if (!Object.prototype.hasOwnProperty.call(categories, key)) return;
      selected = button;
      content.querySelector('#category-title').textContent = categories[key];
      content.querySelector('#category-breadcrumb').textContent = categories[key];
      const gallery = content.querySelector('.project-gallery');
      gallery.replaceChildren(...projects[key].map(([name, file]) => {
        const card = document.createElement('figure');
        card.className = 'project-card';
        card.setAttribute('role', 'listitem');
        const image = document.createElement('img');
        image.src = `./assets/projects/${file}`;
        image.alt = file === 'homepage.png' ? '현재 홈페이지 화면' : `${name} 대표 이미지`;
        image.width = 400; image.height = 260;
        if (file === 'meeting.svg') image.className = 'project-app-icon';
        const caption = document.createElement('figcaption');
        caption.textContent = name;
        card.append(image, caption);
        return card;
      }));
      root.hidden = true;
      view.hidden = false;
      content.querySelector('#category-title').focus();
    });
  });
  content.querySelector('[data-project-back]').addEventListener('click', () => {
    view.hidden = true;
    root.hidden = false;
    if (selected) selected.focus();
  });
}

// Reserved name guard for the preview, not a substitute for server authentication.
// At publication, the server must derive the owner's name from the verified account.
function isReservedOwnerName(value) {
  const normalized = value.normalize('NFKC').replace(/[\p{White_Space}\p{Cf}\p{P}\p{S}\u115f\u1160\u3164]/gu, '');
  return normalized.includes('주인아저씨');
}

// Hosted guestbook stores shared posts on the server; browser drafts are never imported.
async function initGuestbook(content) {
 const form=content.querySelector('#guestbook-form'), feedback=content.querySelector('#guestbook-feedback'),list=content.querySelector('#guestbook-posts');
 const send=form.querySelector('button[type="submit"]');let admin=false,next=null,posts=[],busy=false;
 const more=document.createElement('button');more.type='button';more.textContent='이전 이야기 더 보기';more.hidden=true;list.after(more);
 async function api(path,options){const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});let data;try{data=await response.json();}catch{throw new Error('서버 응답을 확인하지 못했어요.');}if(!response.ok)throw new Error(data.error||'잠시 후 다시 시도해 주세요.');return data;}
 function render(){
  list.replaceChildren(...posts.map(post=>{
   const item=document.createElement('li');item.className='guestbook-post';const header=document.createElement('header'),name=document.createElement('strong'),time=document.createElement('time'),message=document.createElement('p');
   name.textContent=post.isAdmin?'주인아저씨 ✓ 관리자':post.nickname;time.dateTime=post.created;time.textContent=new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(post.created));message.textContent=post.message;header.append(name,time);item.append(header,message);
   if(admin){const remove=document.createElement('button');remove.type='button';remove.textContent='삭제';remove.addEventListener('click',async()=>{if(!confirm('이 글을 삭제할까요?'))return;remove.disabled=true;try{await api('/api/guestbook/'+encodeURIComponent(post.id),{method:'DELETE'});posts=posts.filter(x=>x.id!==post.id);render();feedback.textContent='글을 삭제했어요.';}catch(e){feedback.textContent=e.message;remove.disabled=false;}});header.append(remove);}return item;
  }));content.querySelector('#guestbook-count').textContent=posts.length+'개의 이야기'+(next?' · 더 있어요':'');content.querySelector('#guestbook-empty').hidden=posts.length>0;more.hidden=!next;
 }
 async function load(append=false){const data=await api('/api/guestbook'+(append&&next?'?before='+encodeURIComponent(next):''));posts=append?[...posts,...data.posts]:data.posts;next=data.next;render();}
 send.disabled=true;feedback.textContent='이야기를 불러오는 중…';
 try{const session=await api('/api/session');admin=session.admin;if(admin){form.elements.nickname.value='주인아저씨';form.elements.nickname.readOnly=true;content.querySelector('#guest-name-help').textContent='✓ 관리자로 작성하고 있어요.';}await load();feedback.textContent='';send.disabled=false;}catch(e){feedback.textContent=e.message;content.querySelector('#guestbook-empty').hidden=true;}
 more.addEventListener('click',async()=>{more.disabled=true;try{await load(true);}catch(e){feedback.textContent=e.message;}finally{more.disabled=false;}});
 form.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;busy=true;send.disabled=true;feedback.textContent='저장하는 중…';
 try{const data=await api('/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:form.elements.nickname.value,message:form.elements.message.value})});form.elements.message.value='';posts=[data.post,...posts];render();feedback.textContent='한마디 남겼어요. 놀러 와 줘서 고마워요!';}catch(e){feedback.textContent=e.message;}finally{busy=false;send.disabled=false;}
 });
}
if(location.hash==='#guestbook')document.querySelector('[data-open="guestbook"]')?.click();
