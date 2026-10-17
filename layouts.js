'use strict';
const ownerBio = '겉보기엔 멀쩡한 어른, 정신연령은 호기심 가득한 유딩입니다. 똘끼는 넉넉하고, 재밌는 냄새는 기가 막히게 맡죠. 한 번 꽂히면 겁도 브레이크도 잠시 실종! 일단 전력 질주하며 만들고 보는, 철들 틈 없이 바쁜 주인아저씨입니다. 😎';
function fillBio(root = document) { root.querySelectorAll('[data-bio]').forEach(el => { el.textContent = ownerBio; }); }
fillBio();

const OWNER_GITHUB_LOGIN = 'kangjong9';
const OWNER_GITHUB_ID = 268236575;
const GUESTBOOK_REPO = 'kangjong9/kangjong9.github.io';
const GUESTBOOK_DATA_PATH = 'guestbook-data.json';
const LOCAL_STORAGE_KEY = 'playroom-guestbook-v1';
const ADMIN_SESSION_KEY = 'playroom-gh-admin-token';

const SEED_POSTS = [
  {
    id: '4503cce9-be15-433d-8660-d2ff222291a9',
    nickname: '주인아저씨',
    message: '인사도, 수다도 아무말도 좋아요 ㅋㅋ',
    isAdmin: 1,
    created: '2026-10-17T08:53:42.085Z'
  }
];

function getAdminToken() {
  try { return sessionStorage.getItem(ADMIN_SESSION_KEY) || ''; } catch { return ''; }
}
function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(ADMIN_SESSION_KEY, token);
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
  updateToolbarAdminButtons();
}
function updateToolbarAdminButtons() {
  const active = Boolean(getAdminToken());
  document.querySelectorAll('.toolbar-admin').forEach(btn => {
    btn.textContent = active ? '관리자 로그아웃' : '관리자 로그인';
  });
}
updateToolbarAdminButtons();

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
  function openAppModal(key, triggerButton = null, showAdminPrompt = false) {
    const template=document.getElementById(`${key}-content`);
    if (!template) return;
    opener=triggerButton;
    document.querySelector('#app-window-title').textContent=names[key];
    const content=document.querySelector('#app-window-content');content.replaceChildren(template.content.cloneNode(true));fillBio(content);
    if (key === 'projects') initProjectFolders(content);
    if (key === 'guestbook') initGuestbook(content, showAdminPrompt);
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[data-close]').focus();
  }
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    openAppModal(button.dataset.open, button, false);
  }));
  document.querySelectorAll('.toolbar-admin').forEach(button=>button.addEventListener('click', event => {
    event.preventDefault();
    if (getAdminToken()) {
      setAdminToken('');
      if (dialog.open && document.querySelector('#guestbook-form')) {
        openAppModal('guestbook', button, false);
      }
      const statusEl = document.querySelector('#theme-status');
      if (statusEl) statusEl.textContent = '관리자 모드에서 로그아웃되어 일반 방문자 화면으로 전환되었습니다.';
      return;
    }
    openAppModal('guestbook', button, true);
  }));
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{ if(opener)opener.focus(); });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  const clock=document.querySelector('#clock');
  function tick(){clock.textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit'}).format(new Date());}
  tick();setInterval(tick,30000);
  if (location.hash === '#projects') openAppModal('projects');
  if (location.hash === '#guestbook') openAppModal('guestbook');
  if (location.hash === '#admin') openAppModal('guestbook', null, true);
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

function isReservedOwnerName(value) {
  const normalized = String(value || '').normalize('NFKC').replace(/[\p{White_Space}\p{Cf}\p{P}\p{S}\u115f\u1160\u3164]/gu, '');
  return normalized.includes('주인아저씨');
}

function readLocalPosts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(saved)) return { posts: [], readable: false };
    const valid = saved.filter(p => p && typeof p.nickname === 'string' && typeof p.message === 'string' && typeof p.created === 'string' && Number.isFinite(Date.parse(p.created))).slice(0, 100);
    return { posts: valid, readable: true };
  } catch {
    return { posts: [], readable: false };
  }
}

function writeLocalPosts(posts) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts.slice(0, 100)));
}

async function fetchSharedPosts() {
  try {
    const res = await fetch(`./${GUESTBOOK_DATA_PATH}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return SEED_POSTS;
    const data = await res.json();
    if (data && Array.isArray(data.posts)) return data.posts;
  } catch {}
  return SEED_POSTS;
}

async function verifyGitHubAdmin(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('GitHub 인증에 실패했어요. 토큰을 확인해 주세요.');
  const user = await res.json();
  if (user.login !== OWNER_GITHUB_LOGIN && user.id !== OWNER_GITHUB_ID) {
    throw new Error('주인아저씨(@kangjong9) 계정만 관리자로 로그인할 수 있어요.');
  }
  return user;
}

async function syncPostsToGitHub(token, posts, commitMessage) {
  const getRes = await fetch(`https://api.github.com/repos/${GUESTBOOK_REPO}/contents/${GUESTBOOK_DATA_PATH}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });
  let sha = undefined;
  if (getRes.ok) {
    const meta = await getRes.json();
    sha = meta.sha;
  }
  const jsonText = JSON.stringify({ posts }, null, 2) + '\n';
  const bytes = new TextEncoder().encode(jsonText);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  const contentB64 = btoa(binary);
  const putRes = await fetch(`https://api.github.com/repos/${GUESTBOOK_REPO}/contents/${GUESTBOOK_DATA_PATH}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: contentB64,
      ...(sha ? { sha } : {})
    })
  });
  if (!putRes.ok) throw new Error('GitHub 저장소 동기화에 실패했어요.');
}

async function initGuestbook(content, showAdminPrompt = false) {
  const form = content.querySelector('#guestbook-form');
  const feedback = content.querySelector('#guestbook-feedback');
  const list = content.querySelector('#guestbook-posts');
  const send = form.querySelector('button[type="submit"]');
  const adminLink = content.querySelector('[data-admin-login]');
  const nameHelp = content.querySelector('#guest-name-help');

  let admin = false;
  let adminToken = getAdminToken();
  let sharedPosts = [];
  let localState = readLocalPosts();
  let busy = false;

  // Build inline admin auth box
  const adminBox = document.createElement('div');
  adminBox.className = 'guestbook-admin-box';
  adminBox.hidden = !showAdminPrompt;
  adminBox.style.cssText = 'margin: 10px 0 14px; padding: 12px; border-radius: 10px; border: 1px dashed currentColor; display: grid; gap: 8px;';
  const adminLabel = document.createElement('label');
  adminLabel.textContent = '주인아저씨(@kangjong9) GitHub 관리자 토큰';
  adminLabel.style.fontWeight = '700';
  const adminInputRow = document.createElement('div');
  adminInputRow.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';
  const adminInput = document.createElement('input');
  adminInput.type = 'password';
  adminInput.placeholder = 'ghp_... 토큰 입력';
  adminInput.style.cssText = 'flex: 1; min-width: 180px; padding: 8px 10px; border-radius: 8px; border: 1px solid currentColor;';
  const adminConfirmBtn = document.createElement('button');
  adminConfirmBtn.type = 'button';
  adminConfirmBtn.className = 'os-primary';
  adminConfirmBtn.textContent = '인증 확인';
  adminInputRow.append(adminInput, adminConfirmBtn);
  adminBox.append(adminLabel, adminInputRow);
  form.before(adminBox);

  function mergePosts() {
    const byId = new Map();
    for (const p of sharedPosts) {
      if (p && p.id) byId.set(p.id, { ...p, isShared: true });
    }
    for (const p of localState.posts) {
      const id = p.id || `${p.created}-${p.nickname}`;
      if (!byId.has(id)) {
        byId.set(id, { ...p, id, isAdmin: 0, isShared: false });
      }
    }
    return Array.from(byId.values()).sort((a, b) => Date.parse(b.created) - Date.parse(a.created));
  }

  function applyAdminUI() {
    if (admin) {
      form.elements.nickname.value = '주인아저씨';
      form.elements.nickname.readOnly = true;
      nameHelp.textContent = '✓ 관리자로 작성하고 있어요. (GitHub 저장소에 영구 반영됩니다)';
      if (adminLink) adminLink.textContent = '관리자 로그아웃';
      adminBox.hidden = true;
    } else {
      if (form.elements.nickname.readOnly) form.elements.nickname.value = '';
      form.elements.nickname.readOnly = false;
      nameHelp.textContent = '‘주인아저씨’는 관리자 전용 이름이에요.';
      if (adminLink) adminLink.textContent = '관리자 로그인';
    }
    updateToolbarAdminButtons();
  }

  function render() {
    const allPosts = mergePosts();
    list.replaceChildren(...allPosts.map(post => {
      const item = document.createElement('li');
      item.className = 'guestbook-post';
      const header = document.createElement('header');
      const name = document.createElement('strong');
      const time = document.createElement('time');
      const message = document.createElement('p');
      const isPostAdmin = Boolean(post.isAdmin && post.isShared);
      name.textContent = isPostAdmin ? '주인아저씨 ✓ 관리자' : (isReservedOwnerName(post.nickname) ? '방문자 (예약 이름)' : post.nickname.slice(0, 24));
      time.dateTime = post.created;
      time.textContent = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(post.created));
      message.textContent = post.message.slice(0, 500);
      header.append(name, time);
      if (admin || !post.isShared) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '삭제';
        remove.addEventListener('click', async () => {
          if (!confirm('이 글을 삭제할까요?')) return;
          remove.disabled = true;
          try {
            if (admin && post.isShared) {
              const nextShared = sharedPosts.filter(x => x.id !== post.id);
              await syncPostsToGitHub(adminToken, nextShared, 'chore(guestbook): 방명록 게시글 삭제');
              sharedPosts = nextShared;
            }
            localState.posts = localState.posts.filter(x => (x.id || `${x.created}-${x.nickname}`) !== post.id);
            if (localState.readable) writeLocalPosts(localState.posts);
            render();
            feedback.textContent = '글을 삭제했어요.';
          } catch (e) {
            feedback.textContent = e.message;
            remove.disabled = false;
          }
        });
        header.append(remove);
      }
      item.append(header, message);
      return item;
    }));
    content.querySelector('#guestbook-count').textContent = `${allPosts.length}개의 이야기`;
    content.querySelector('#guestbook-empty').hidden = allPosts.length > 0;
  }

  if (adminLink) {
    adminLink.addEventListener('click', event => {
      event.preventDefault();
      if (admin) {
        admin = false;
        adminToken = '';
        setAdminToken('');
        applyAdminUI();
        render();
        feedback.textContent = '관리자 모드에서 로그아웃했어요.';
      } else {
        adminBox.hidden = !adminBox.hidden;
        if (!adminBox.hidden) adminInput.focus();
      }
    });
  }

  adminConfirmBtn.addEventListener('click', async () => {
    const val = adminInput.value.trim();
    if (!val) { feedback.textContent = 'GitHub 토큰을 입력해 주세요.'; return; }
    adminConfirmBtn.disabled = true;
    feedback.textContent = '주인아저씨 계정 확인 중…';
    try {
      await verifyGitHubAdmin(val);
      admin = true;
      adminToken = val;
      setAdminToken(val);
      adminInput.value = '';
      applyAdminUI();
      render();
      feedback.textContent = '✓ 주인아저씨(@kangjong9) 관리자 모드가 활성화되었어요!';
    } catch (e) {
      feedback.textContent = e.message;
    } finally {
      adminConfirmBtn.disabled = false;
    }
  });

  sharedPosts = await fetchSharedPosts();
  if (adminToken) {
    try {
      await verifyGitHubAdmin(adminToken);
      admin = true;
    } catch {
      admin = false;
      adminToken = '';
      setAdminToken('');
    }
  }
  applyAdminUI();
  render();
  if (showAdminPrompt && !admin) {
    adminBox.hidden = false;
    adminInput.focus();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const nickname = admin ? '주인아저씨' : form.elements.nickname.value.trim();
    const message = form.elements.message.value.trim();
    if (!nickname || !message) {
      feedback.textContent = '닉네임과 이야기를 모두 적어 주세요.';
      return;
    }
    if (!admin && (isReservedOwnerName(nickname) || isReservedOwnerName(nickname.slice(0, 24)))) {
      feedback.textContent = '주인아저씨는 관리자 전용 이름이에요. 다른 닉네임을 사용해 주세요.';
      form.elements.nickname.focus();
      return;
    }
    busy = true;
    send.disabled = true;
    const newPost = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `post-${Date.now()}`,
      nickname: nickname.slice(0, 24),
      message: message.slice(0, 500),
      isAdmin: admin ? 1 : 0,
      created: new Date().toISOString()
    };
    try {
      if (admin && adminToken) {
        feedback.textContent = 'GitHub 저장소에 주인아저씨 글을 반영하는 중…';
        const nextShared = [newPost, ...sharedPosts];
        await syncPostsToGitHub(adminToken, nextShared, 'feat(guestbook): 주인아저씨 방명록 글 등록');
        sharedPosts = nextShared;
      } else {
        if (!localState.readable) {
          throw new Error('기존 글을 보호하기 위해 저장을 멈췄어요. 브라우저 저장 설정을 확인해 주세요.');
        }
        const nextLocal = [newPost, ...localState.posts];
        writeLocalPosts(nextLocal);
        localState.posts = nextLocal;
      }
      form.elements.message.value = '';
      render();
      feedback.textContent = '한마디 남겼어요. 놀러 와 줘서 고마워요!';
    } catch (e) {
      feedback.textContent = e.message || '저장 공간이 부족하거나 저장이 차단되어 글을 남기지 못했어요.';
    } finally {
      busy = false;
      send.disabled = false;
    }
  });
}
