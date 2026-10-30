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
  window.dispatchEvent(new Event('playroom-auth-change'));
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
  const names={projects:'작업물 폴더',notes:'생각 노트',about:'주인아저씨 프로필',guestbook:'떠든 사람',requests:'이런거도 해줄까?'};
  let opener=null;
  function openAppModal(key, triggerButton = null, showAdminPrompt = false) {
    const template=document.getElementById(`${key}-content`);
    if (!template) return;
    opener=triggerButton;
    document.querySelector('#app-window-title').textContent=names[key];
    const content=document.querySelector('#app-window-content');content.replaceChildren(template.content.cloneNode(true));fillBio(content);
    if (key === 'projects') initProjectFolders(content);
    if (key === 'notes' || key === 'requests') initBoard(content, key);
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
  if (location.hash === '#notes') openAppModal('notes');
  if (location.hash === '#requests') openAppModal('requests');
  if (location.hash === '#projects') openAppModal('projects');
  if (location.hash === '#guestbook') openAppModal('guestbook');
  if (location.hash === '#admin') openAppModal('guestbook', null, true);
}

// Category membership and display order were supplied by the owner.
function initProjectFolders(content) {
  initGameEditorFolder(content);
  const categories = {fun: '심심해서 맹근', network: '네트워크 해봐?', work: '일하기 싫어서 제작', requested: '맹그러달라카니'};
  const projects = {
    "requested": [["레이더 툴킷[앱]", "radar-toolkit.svg"], ["레이더 툴킷[PC]", "radar-toolkit.svg"], ["보컬트레이너[앱]", "vocalmate.svg"], ["한걸음V1.0 Exile", "hangeoreum.svg"]],
    "fun": [
      ["코딩놀이", "coding.svg"],
      ["찌꺼기저리가[PC]", "cleaner.svg"],
      ["귀염뽀짝 가계부[앱]", "ledger-app.svg"],
      ["귀염뽀짝 가계부(PC)", "ledger.svg"],
      ["맹맹 다이어트 작전(앱)", "maeng-app.svg"],
      ["다이어트 저리가(PC)", "diet-pc.svg"],
      ["유나세리나데", "yuna.svg"],
      ["외장하드 안전제거[PC]", "safe-eject.svg"]
    ],
    "network": [
      ["누리보이스 스튜디오 TTS엔진", "nuri-studio.png"],
      ["누리보이스 STT엔진", "nuri-stt.svg"],
      ["포터블", "portable.svg"],
      ["현재 홈페이지", "homepage.png"]
    ],
    "work": [
      ["내역서 마스터[개발중 30%]", "estimate.svg"],
      ["AI친구들과 함께 실시간 회의실[개발중 90%]", "meeting.svg"]
    ]
  };
  const projectDownloads = {
    "레이더 툴킷[앱]": {
      tag: "레이더 툴킷 1.0.6 · Android 8 이상 · 자동 업데이트 안내 · 실기기 미검증 개발판",
      desc: "멀티캐스트 송신·수신을 독립 실행하고 각각 IP·포트를 설정합니다. TDELAY·북방위 계산과 역산에 소수점 0~10자리(기본 10)를 공통 적용하고 표시값 그대로 복사합니다. Android 8 이상 · 자동 업데이트 안내 · 실기기 미검증 개발판.",
      links: [
        { label: "레이더 툴킷 APK · 1.0.6 (72.5KB)", url: "./downloads/Radar-Toolkit-1.0.6.apk", download: "Radar-Toolkit-1.0.6.apk", primary: true },
        { label: "설치·사용 안내", url: "./downloads/Radar-Toolkit-guide.txt", download: "Radar-Toolkit-guide.txt", primary: false }
      ]
    },
    "레이더 툴킷[PC]": {
      "tag": "레이더 툴킷 PC 1.0.3 · Windows 10/11 64비트 · 포터블 ZIP",
      "desc": "Windows 10/11 64비트용 포터블 앱입니다. TDELAY·북방위 계산·역산에 소수점 0~10자리(기본 10)를 공통 적용하고 표시값 그대로 복사합니다. 멀티캐스트 송신·수신을 독립 실행합니다. 수신 IP·포트 설정 및 업데이트 확인을 지원합니다. Windows 10 별도 실측·현장 장비 통신은 미검증입니다.",
      "links": [
        {
          "label": "PC ZIP · 1.0.3 (13.3MB)",
          "url": "./downloads/radar-toolkit-pc/Radar-Toolkit-PC-1.0.3.zip",
          "download": "Radar-Toolkit-PC-1.0.3.zip",
          "primary": true
        },
        {
          "label": "압축 해제·실행 안내",
          "url": "./downloads/radar-toolkit-pc/사용안내.txt",
          "download": "Radar-Toolkit-PC-guide.txt",
          "primary": false
        }
      ]
    },

























    "한걸음 17 · 맞춤훈련": {
      tag: "별도 설치 · 감정 보이스 · AI 문장 통역",
      desc: "한국어·영어 감정 보이스, 누리 TTS 최적화, Google ML Kit 문장 단위 연속 통역. 첫 합성·통역은 기기에서 모델 준비가 필요해요.",
      links: [
        {label: "17번 APK 받기 · 478 MB · Android 8 이상", url: "https://github.com/kangjong9/kangjong9.github.io/releases/download/hangeoreum-training-37/Hangeoreum-Training-37.apk", external: true, primary: true},
        {label: "사용법 · 업데이트 안내", url: "./downloads/Hangeoreum-Training-guide.txt", external: true}
      ]
    },
    "한걸음V1.0 Exile": {
      tag: "한걸음V1.0 Exile · 안드로메다에서 유배 온 안내 AI Exile · 6개 언어 · 누리 보이스 TTS 엔진",
      links: [
        { label: "한걸음V1.0 Exile APK (1.7MB) · Android 8 이상", url: "./downloads/Hangeoreum-V1.0-Exile.apk", download: "Hangeoreum-V1.0-Exile.apk", primary: true },
        { label: "📎 한걸음 17 맞춤훈련 APK · 1.0.24 · Android 8 이상", url: "https://github.com/kangjong9/kangjong9.github.io/releases/download/hangeoreum-training-50/Hangeoreum-Training-50.apk", external: true },
        { label: "📎 한걸음 17 사용 안내", url: "./downloads/Hangeoreum-Training-guide.txt", external: true },
        { label: "화면 시안 체험 · 6개 언어 문자표 & 입문 문자 & 오늘의 뉴스", url: "./downloads/Hangeoreum-preview.html", external: true },
        { label: "사용 안내 · 안드로메다 유배 스토리 및 음성 코칭", url: "./downloads/Hangeoreum-guide.txt", download: "Hangeoreum-guide.txt", primary: false }
      ]
    },

    "누리보이스 STT엔진": {
      tag: "NuriVoice STT · 폰에서 음성을 글로 · 11개 언어 · GitHub 운영",
      desc: "녹음하거나 음성 파일을 고르면 브라우저 안에서 인식합니다. 일반 전사·프랑스어 음소 연구·청크 처리를 직접 확인하세요. 첫 사용에는 선택 모델 다운로드가 필요하며 음성은 서버로 보내지 않습니다.",
      links: [
        { label: "🎤 누리보이스 STT 열기 · 폰에서도 바로", url: "./nurivoice-stt/", external: true, primary: true }
      ]
    },
    "누리보이스 스튜디오 TTS엔진": {
      tag: "누리보이스 스튜디오 TTS엔진 · 5대 엔진 86종+ 목소리 · 일반/애니 캐릭터 모드 · 오프라인 대비 5계층",
      desc: "글자를 사람의 숨결로 — 5대 엔진 86종이 넘는 목소리를 한 화면에서 골라 듣고, 애니 캐릭터 립싱크까지. 인터넷이 흔들려도 다음 엔진이 이어받아 끝까지 말해 주는 누리 보이스 TTS 엔진이에요.",
      links: [
        { label: "🎙️ 누리보이스 스튜디오 바로 열기 · 설치 없이 웹에서", url: "./nuri-studio/index.html", external: true, primary: true }
      ]
    },
    "보컬트레이너[앱]": {
      tag: "VocalMate 0.12.0-dev · 노래방 녹음 코칭·리프·화음 연습 · Android 8 이상 · 실기기 미검증 개발판",
      links: [
        { label: "🎤 보컬트레이너 개발판 APK (0.12.0 · 89.4MB)", url: "./downloads/VocalMate-0.12.0-dev.apk", download: "VocalMate-0.12.0-dev.apk", primary: true },
        { label: "📄 설치 안내 · 지원 기능과 제한", url: "./downloads/VocalMate-설치안내.txt", download: "VocalMate-설치안내.txt", primary: false }
      ]
    },
    "코딩놀이": {
      tag: "🎮 AI 코딩놀이터 프로젝트 (최신본)",
      links: [
        { label: "📄 구글 무료배포 가이드 (사용자용 PDF)", url: "./downloads/구글_무료배포_가이드_사용자용.pdf", download: "구글_무료배포_가이드_사용자용.pdf", primary: true },
        { label: "🔒 구글 무료배포 가이드 (개발자용 PDF)", url: "./downloads/구글_무료배포_가이드_개발자용.pdf", download: "구글_무료배포_가이드_개발자용.pdf", primary: false, adminOnly: true }
      ]
    },
    "귀염뽀짝 가계부[앱]": {
      tag: "🌸 모바일 가계부 APK (v1.0 릴리즈 최신본)",
      links: [
        { label: "📲 귀염뽀짝 가계부 Release APK (1.2MB)", url: "./downloads/CuteLedger_v1.0_Release.apk", download: "CuteLedger_v1.0_Release.apk", primary: true },
        { label: "📄 구글 무료배포 실전 매뉴얼 (PDF)", url: "./downloads/구글_무료배포_가이드_사용자용.pdf", download: "구글_무료배포_가이드_사용자용.pdf", primary: false }
      ]
    },
    "귀염뽀짝 가계부(앱)": {
      tag: "🌸 모바일 가계부 APK (v1.0 릴리즈 최신본)",
      links: [
        { label: "📲 귀염뽀짝 가계부 Release APK (1.2MB)", url: "./downloads/CuteLedger_v1.0_Release.apk", download: "CuteLedger_v1.0_Release.apk", primary: true },
        { label: "📄 구글 무료배포 실전 매뉴얼 (PDF)", url: "./downloads/구글_무료배포_가이드_사용자용.pdf", download: "구글_무료배포_가이드_사용자용.pdf", primary: false }
      ]
    },
    "귀염뽀짝 가계부(PC)": {
      tag: "🌸 PC 가계부 실행파일 (최신본)",
      links: [
        { label: "💻 가계부 PC 실행파일 (12.9MB)", url: "./downloads/귀염뽀작_가계부.exe", download: "귀염뽀작_가계부.exe", primary: true }
      ]
    },
    "맹맹 다이어트 작전(앱)": {
      tag: "🏃‍♀️ 모바일 APK (v2.8 릴리즈 최신본)",
      links: [
        { label: "📲 MaengDiet v2.8 Release APK (1.7MB)", url: "./downloads/MaengDiet_v2.8_Release_GreenLight.apk", download: "MaengDiet_v2.8_Release_GreenLight.apk", primary: true }
      ]
    },
    "찌꺼기저리가[PC]": {
      tag: "🧹 PC 클리너 실행파일 (최신본)",
      links: [
        { label: "💻 찌꺼기저리가 실행파일 (12.5MB)", url: "./downloads/찌꺼기저리가.exe", download: "찌꺼기저리가.exe", primary: true }
      ]
    },
    "다이어트 저리가(PC)": {
      tag: "🥗 PC 다이어트 실행파일 (최신본)",
      links: [
        { label: "💻 MaengDiet PC 실행파일 (13.0MB)", url: "./downloads/MaengDiet.exe", download: "MaengDiet.exe", primary: true }
      ]
    },
    "외장하드 안전제거[PC]": {
      tag: "⏏️ 외장하드 안전 제거 실행파일 (최신본)",
      links: [
        { label: "💻 외장하드 안전제거 실행파일 (77KB)", url: "./downloads/외장하드_안전제거.exe", download: "외장하드_안전제거.exe", primary: true }
      ]
    }
  };
  const root = content.querySelector('.project-root');
  const view = content.querySelector('.project-category-view');
  let selected = null;
  content.querySelectorAll('[data-project-category]').forEach(button => {
    const key = button.dataset.projectCategory;
    if (projects[key]) {
      const countEl = button.querySelector('small');
      if (countEl) countEl.textContent = `${projects[key].length}개`;
    }
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
        if (projectDownloads[name] && projectDownloads[name].desc) {
          const desc = document.createElement('p');
          desc.className = 'project-desc';
          desc.textContent = projectDownloads[name].desc;
          desc.style.cssText = 'margin:6px 0 0; font-size:12px; line-height:1.55; font-weight:600; color:var(--ink); opacity:.85; text-align:left;';
          card.append(desc);
        }
        if (projectDownloads[name]) {
          card.style.cursor = 'pointer';
          card.title = `${name} 다운로드`;
          const triggerDownload = (item) => {
            if (item.external) {
              window.open(item.url, '_blank', 'noopener,noreferrer');
              return;
            }
            if (name.includes('한걸음')) {
              const a = document.createElement('a');
              a.href = item.url;
              a.download = item.download || '';
              document.body.appendChild(a);
              a.click();
              setTimeout(() => a.remove(), 200);
              return;
            }
            const targetName = item.download || item.label;
            const ok = window.confirm(`[${name}]\n'${targetName}' 파일을 다운로드하시겠습니까?`);
            if (!ok) return;

            if (name.includes('가계부') && (name.includes('앱') || (item.download && item.download.toLowerCase().endsWith('.apk')))) {
              alert('개인정보문제로 필요시 개발자에게 개별 요청하세요.');
              const statusEl = document.querySelector('#theme-status');
              if (statusEl) statusEl.textContent = '개인정보문제로 필요시 개발자에게 개별 요청하세요.';
              return;
            }

            const a = document.createElement('a');
            a.href = item.url;
            a.download = item.download || '';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => a.remove(), 200);
          };
          card.addEventListener('click', (e) => {
            const primaryItem = projectDownloads[name].links.find(l => l.primary) || projectDownloads[name].links[0];
            if (primaryItem) triggerDownload(primaryItem);
          });
          const actionRow = document.createElement('div');
          actionRow.className = 'project-download-row';
          actionRow.style.cssText = 'display:flex; flex-direction:column; gap:5px; margin-top:8px;';
          const isAdmin = Boolean(getAdminToken());
          projectDownloads[name].links.forEach(item => {
            if (item.adminOnly && !isAdmin) return;
            const btn = document.createElement('a');
            if (item.external) {
              btn.href = item.url;
              btn.target = '_blank';
              btn.rel = 'noopener noreferrer';
            } else {
              btn.href = item.url;
              btn.download = item.download;
            }
            btn.textContent = item.label;
            btn.className = item.primary ? 'project-dl-btn primary' : (item.adminOnly ? 'project-dl-btn admin-only' : 'project-dl-btn');
            let style = 'display:block; padding:7px 10px; font-size:12px; font-weight:800; border-radius:8px; text-decoration:none; text-align:center; cursor:pointer; ';
            if (item.primary) {
              style += 'background:#38bdf8; color:#0f172a; box-shadow:0 2px 8px rgba(56,189,248,0.3);';
            } else if (item.adminOnly) {
              style += 'background:rgba(236,72,153,0.18); color:#db2777; border:1px solid #f472b6; box-shadow:0 2px 8px rgba(236,72,153,0.2);';
            } else {
              style += 'background:rgba(255,255,255,0.15); color:var(--ink); border:1px solid var(--edge);';
            }
            btn.style.cssText = style;
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (name.includes('한걸음')) {
                // 브라우저 기본 a[download] / a[target=_blank] 동작 100% 보장 (먹통 방지)
                return;
              }
              e.preventDefault();
              triggerDownload(item);
            });
            actionRow.appendChild(btn);
          });
          card.appendChild(actionRow);
        }
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

const ADMIN_VAULT = {
  salt: '2e6fUK484cPMGXQE6MwaDQ==',
  cipher: '+aKOA6mcf0HfLR8czdfvGrIb4CH1ZmvyEIXLVn4TEszu7j5AqL0UzA==',
  tag: 'VHij4glVtwgU0wfsTn5ko6ezrGprl7NF',
  iterations: 100000
};

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function unlockAdminVault(inputValue) {
  if (inputValue.startsWith('ghp_') || inputValue.startsWith('github_pat_')) {
    await verifyGitHubAdmin(inputValue);
    return inputValue;
  }
  const saltBytes = b64ToBytes(ADMIN_VAULT.salt);
  const cipherBytes = b64ToBytes(ADMIN_VAULT.cipher);
  const tagBytes = b64ToBytes(ADMIN_VAULT.tag);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(inputValue),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: ADMIN_VAULT.iterations, hash: 'SHA-256' },
    keyMaterial,
    512
  );
  const dk = new Uint8Array(bits);
  let diff = 0;
  for (let i = 0; i < tagBytes.length; i++) {
    diff |= (dk[40 + i] ^ tagBytes[i]);
  }
  if (diff !== 0) {
    throw new Error('관리자 비밀번호가 올바르지 않아요. 다시 확인해 주세요.');
  }
  const plainBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    plainBytes[i] = cipherBytes[i] ^ dk[i];
  }
  const token = new TextDecoder().decode(plainBytes);
  await verifyGitHubAdmin(token);
  return token;
}

async function verifyGitHubAdmin(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('GitHub 관리자 인증에 실패했어요.');
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

  // Build inline admin password auth box
  const adminBox = document.createElement('div');
  adminBox.className = 'guestbook-admin-box';
  adminBox.hidden = !showAdminPrompt;
  adminBox.style.cssText = 'margin: 10px 0 14px; padding: 12px; border-radius: 10px; border: 1px dashed currentColor; display: grid; gap: 8px;';
  const adminLabel = document.createElement('label');
  adminLabel.textContent = '주인아저씨 관리자 비밀번호';
  adminLabel.style.fontWeight = '800';
  const adminInputRow = document.createElement('div');
  adminInputRow.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';
  const adminInput = document.createElement('input');
  adminInput.type = 'password';
  adminInput.placeholder = '관리자 비밀번호 입력';
  adminInput.autocomplete = 'current-password';
  adminInput.style.cssText = 'flex: 1; min-width: 180px; padding: 8px 10px; border-radius: 8px; border: 1px solid currentColor;';
  const adminConfirmBtn = document.createElement('button');
  adminConfirmBtn.type = 'button';
  adminConfirmBtn.className = 'os-primary';
  adminConfirmBtn.textContent = '로그인';
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
      nameHelp.textContent = '✓ 주인아저씨 관리자로 로그인되었어요. (글 작성·삭제가 모두에게 반영됩니다)';
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

  async function doAdminLogin() {
    const val = adminInput.value.trim();
    if (!val) { feedback.textContent = '관리자 비밀번호를 입력해 주세요.'; return; }
    adminConfirmBtn.disabled = true;
    feedback.textContent = '주인아저씨 비밀번호 확인 중…';
    try {
      const unlockedToken = await unlockAdminVault(val);
      admin = true;
      adminToken = unlockedToken;
      setAdminToken(unlockedToken);
      adminInput.value = '';
      applyAdminUI();
      render();
      feedback.textContent = '✓ 주인아저씨 관리자 모드로 로그인되었어요!';
    } catch (e) {
      feedback.textContent = e.message;
    } finally {
      adminConfirmBtn.disabled = false;
    }
  }

  adminConfirmBtn.addEventListener('click', doAdminLogin);
  adminInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      doAdminLogin();
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

// GAME 에디터: 기존 홈페이지 관리자 인증을 그대로 사용한다.
function initGameEditorFolder(content) {
  const folder = content.querySelector('[data-game-editors]');
  if (!folder) return;
  const endpoint = 'https://jonggoo-kang.smartdrum2048.chatgpt.site/api/game-editors';
  const root = content.querySelector('.project-root');
  const view = content.querySelector('.project-category-view');
  const gallery = content.querySelector('.project-gallery');
  let active = false;
  let transfer = null;
  const lifecycle = new AbortController();
  window.gameEditorLifecycle?.abort();
  window.gameEditorLifecycle = lifecycle;
  lifecycle.signal.addEventListener('abort', () => transfer?.abort());
  const message = text => {
    gallery.replaceChildren();
    const note = document.createElement('p');
    note.textContent = text;
    note.setAttribute('role', 'status');
    gallery.append(note);
    return note;
  };
  const needLogin = () => {
    transfer?.abort();
    message('홈페이지 관리자 로그인 후 내려받을 수 있습니다.');
    const button = document.createElement('button');
    button.className = 'os-primary'; button.type = 'button'; button.textContent = '관리자 로그인';
    button.addEventListener('click', () => {
      const afterLogin = () => {
        if (!getAdminToken()) return;
        queueMicrotask(() => {
          document.querySelector('[data-open="projects"]')?.click();
          document.querySelector('#app-window-content [data-game-editors]')?.click();
        });
      };
      window.addEventListener('playroom-auth-change', afterLogin, {once:true, signal:lifecycle.signal});
      document.querySelector('.toolbar-admin')?.click();
    });
    gallery.append(button);
  };
  async function download(item, button, status) {
    const token = getAdminToken();
    if (!token) { needLogin(); return; }
    if (transfer) { status.textContent = '진행 중인 다운로드를 기다려 주세요.'; return; }
    const controller = new AbortController(); transfer = controller;
    button.disabled = true; status.textContent = '내려받는 중…';
    try {
      const response = await fetch(endpoint+'?file='+encodeURIComponent(item.file), {
        headers:{Authorization:'Bearer '+token},cache:'no-store',signal:controller.signal});
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 401 && token === getAdminToken()) setAdminToken('');
        throw new Error(error.error || '다운로드하지 못했습니다. 다시 시도해 주세요.');
      }
      const buffer = await response.arrayBuffer();
      if (controller.signal.aborted || token !== getAdminToken()) throw new Error('로그아웃되어 다운로드가 취소됐습니다.');
      if (buffer.byteLength !== item.bytes) throw new Error('파일 크기가 일치하지 않습니다. 다시 시도해 주세요.');
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(x=>x.toString(16).padStart(2,'0')).join('');
      if (hash !== item.sha256) throw new Error('파일 검증에 실패했습니다. 다시 시도해 주세요.');
      if (controller.signal.aborted || token !== getAdminToken()) throw new Error('로그아웃되어 다운로드가 취소됐습니다.');
      const url = URL.createObjectURL(new Blob([buffer], {type:'application/octet-stream'}));
      const link = document.createElement('a'); link.href = url; link.download = item.file;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = '다운로드 완료';
    } catch (error) { status.textContent = error.name === 'AbortError' ? '다운로드가 취소됐습니다.' : error.message; }
    finally { if (transfer === controller) transfer = null; button.disabled = false; }
  }
  async function render() {
    const token = getAdminToken();
    if (!token) { needLogin(); return; }
    message('에디터 목록을 확인하는 중…');
    try {
      const response = await fetch(endpoint,{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:lifecycle.signal});
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 401) { if (token === getAdminToken()) { setAdminToken(''); if (active && content.isConnected) needLogin(); } return; }
        throw new Error(error.error || '목록을 불러오지 못했습니다. 폴더를 다시 열어 주세요.');
      }
      const data = await response.json();
      if (token !== getAdminToken() || !content.isConnected || !active) return;
      gallery.replaceChildren();
      for (const item of data.files) {
        const card = document.createElement('figure'); card.className = 'project-card'; card.setAttribute('role','listitem');
        const icon = document.createElement('img'); icon.src = './assets/game-editors/'+item.file.replace(/\.exe$/i,'.ico');
        icon.alt = item.title+' 게임 아이콘'; icon.width = 96; icon.height = 96;
        icon.style.cssText = 'width:96px;height:96px;object-fit:contain;margin:18px auto;display:block';
        const title = document.createElement('figcaption'); title.textContent = item.title+' · '+item.version;
        const desc = document.createElement('p'); desc.textContent = item.description;
        const status = document.createElement('p'); status.setAttribute('role','status');
        const button = document.createElement('button'); button.type = 'button'; button.className = 'os-primary';
        button.textContent = 'EXE 내려받기 · '+(item.bytes/1024/1024).toFixed(2)+' MB';
        button.addEventListener('click',()=>download(item,button,status));
        card.append(icon,title,desc,button,status); gallery.append(card);
      }
    } catch (error) { if (error.name !== 'AbortError' && content.isConnected && active && !lifecycle.signal.aborted) message(error.message); }
  }
  folder.addEventListener('click', () => {
    active = true; root.hidden = true; view.hidden = false;
    content.querySelector('#category-title').textContent = 'GAME 에디터';
    content.querySelector('#category-breadcrumb').textContent = 'GAME 에디터';
    content.querySelector('#category-title').focus(); render();
  });
  content.querySelector('[data-project-back]').addEventListener('click',()=>{active=false;transfer?.abort();});
  window.addEventListener('playroom-auth-change',()=>{
    if (active && content.isConnected) { if (!getAdminToken()) needLogin(); else render(); }
  },{signal:lifecycle.signal});
}
