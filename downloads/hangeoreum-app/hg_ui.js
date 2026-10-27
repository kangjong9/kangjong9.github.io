/* 한걸음 V3.1 UI 어댑터. 기존 콘텐츠/판정/음성 공급자와 Native 계약을 보존한다. */
(function () {
  'use strict';
  const LANGS = [
    ['en', '영어', 'English', '🇺🇸', '알파벳과 소리'], ['ja', '일본어', '日本語', '🇯🇵', '히라가나 · 가타카나'],
    ['cn', '중국어', '中文', '🇨🇳', '병음 · 성조'], ['fr', '프랑스어', 'Français', '🇫🇷', '알파벳 · 발음'],
    ['es', '스페인어', 'Español', '🇪🇸', '알파벳 · 발음'], ['ru', '러시아어', 'Русский', '🇷🇺', '키릴 문자']
  ];
  const POSITIONS = 'hg_ui_positions_v1';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } };
  const store = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { announce('학습 위치를 저장하지 못했습니다. 저장 공간을 확인해 주세요.'); } };
  const lang = () => LANGS.find(l => l[0] === selectedLang) || LANGS[3];
  const ready = () => localStorage.getItem('hangeoreum_onboarding_done') === '1';
  const fox = '<img class="hg-ui-fox" src="images/hg-guide-fox.svg" alt="학습 안내 친구 Exile" width="150" height="150">';
  // 원래 세계관: 안드로메다에서 지구로 유배 온 안내 AI Exile
  const guide = `<figure class="hg-ui-guide">${fox}<figcaption>Exile<small>안드로메다에서 온<br>안내 AI</small></figcaption></figure>`;
  let route = 'onboarding', mode = 'words', pendingLanguage = null, epoch = 0, busy = false, restoring = false;
  let returnFocus = null;
  // 안내 문구는 하단 메뉴 위에 잠깐 떴다가 사라짐(예전엔 화면 맨 아래에 계속 남아 자리를 차지해 스크롤이 생겼음)
  let announceTimer = 0;
  function announce(text) {
    const n = $('hgUiNotice'); if (!n) return;
    n.textContent = text; clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { n.textContent = ''; }, 4000);
  }
  function state() {
    return { level: currentLevel, round: currentRound, roundPassed: roundPassed.slice(), theme: currentTheme,
      script: !!(window.HGSCRIPT && HGSCRIPT.isActive()) };
  }
  function persist() {
    if (!ready() || restoring) return;
    const all = read(POSITIONS, {}); all[selectedLang] = state(); store(POSITIONS, all);
    try { localStorage.setItem('hangeoreum_lang', selectedLang); localStorage.setItem('hangeoreum_level', String(currentLevel)); } catch (_) {}
  }
  function stopMedia() {
    window.HGAI?.close();
    epoch++;
    try { globalTtsSeq++; stopAllTTSAudio(); } catch (_) {}
    try { if (speechRecognizer) speechRecognizer.abort(); isRecordingSTT = false; } catch (_) {}
    try { if (roleplayRecognizer) roleplayRecognizer.abort(); isRoleplayRecording = false; } catch (_) {}
    if (window.HGSCRIPT) HGSCRIPT.hide();
  }
  // 창을 닫거나 앱으로 돌아왔을 때 stopMedia로 멈춘 수업을 손대지 않아도 그 자리부터 다시 진행 (핸즈프리 유지)
  let resumeTimer = null;
  function resumeLesson() {
    clearTimeout(resumeTimer);
    // AI 회화는 다시 그리면 대화가 처음부터 시작되므로 제외 (문자·문장 수업만)
    resumeTimer = setTimeout(() => { if (canPractice() && mode !== 'roleplay' && $('viewRoleplay').classList.contains('hidden') && typeof updateLevelUI === 'function') updateLevelUI(); }, 200);
  }
  // 2026-10-27 옵빠야 지시: 수업 화면 좌우 스와이프 = 이전/다음 단계 + 슬라이드 모션
  // 오른쪽으로 밀기 → 이전, 왼쪽으로 밀기 → 다음(이미 통과·진행한 곳까지만). 못 가면 살짝 튕김
  function swipeTarget() {
    if (route !== 'lesson') return null;
    if (window.HGSCRIPT && HGSCRIPT.isActive()) {
      const v = $('hgScriptView'), s = HGSCRIPT.navState ? HGSCRIPT.navState() : { prev: false, next: false };
      return v ? { el: v, canPrev: s.prev, canNext: s.next, prev: () => HGSCRIPT.prev(), next: () => HGSCRIPT.next() } : null;
    }
    const d = $('viewDrill');
    if (!d || d.classList.contains('hidden')) return null;
    const set = window.HGV2 ? HGV2.getSetIdx() : 1;
    return { el: d,
      canPrev: !(currentLevel === 1 && currentRound === 1 && set === 1),  // 맨 처음에서 이전 = 온보딩 이동이라 막음
      canNext: !!roundPassed[currentRound - 1] || !!(window.HGV2 && HGV2.behindFar && HGV2.behindFar()),
      prev: () => goToPrevRoundOrLevel(), next: () => proceedNextRoundOrLevel() };
  }
  function slide(el, dir, action) {  // dir: -1 = 다음(왼쪽으로 나감), 1 = 이전(오른쪽으로 나감)
    if (!el.animate) { action(); return; }
    const out = el.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${dir * 60}px)`, opacity: 0 }], { duration: 150, easing: 'ease-in' });
    out.onfinish = () => {
      action();
      const t = swipeTarget(), target = t ? t.el : el;
      target.animate([{ transform: `translateX(${-dir * 60}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: 'ease-out' });
    };
  }
  function bounce(el, dir) {
    if (el.animate) el.animate([{ transform: 'none' }, { transform: `translateX(${dir * 18}px)` }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
  }
  function initSwipe() {
    if (window.__hgSwipeInit) return; window.__hgSwipeInit = true;  // 중복 등록 방지
    let sx = 0, sy = 0, st = 0, on = false, lastSwipe = 0;
    const skip = (t) => !t.closest || !t.closest('#viewCanvas') || t.closest('input,textarea,select,[type=range],.hgl-ov,#hgDialog,.modal-backdrop,#hgUiModeButtons');
    document.addEventListener('touchstart', e => {
      on = e.touches.length === 1 && !skip(e.target);
      if (on) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }
    }, { passive: true });
    document.addEventListener('touchend', e => {
      if (!on) return; on = false;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 70 || Math.abs(dy) > 50 || Date.now() - st > 700) return;
      if (Date.now() - lastSwipe < 500) return;  // 한 번 밀기에 두 칸 넘어가지 않게
      lastSwipe = Date.now();
      const target = swipeTarget(); if (!target) return;
      if (dx > 0) { if (target.canPrev) slide(target.el, 1, target.prev); else bounce(target.el, 1); }
      else { if (target.canNext) slide(target.el, -1, target.next); else { bounce(target.el, -1); announce('아직 진행하지 않은 단계예요.'); } }
    }, { passive: true });
  }
  function canPractice() {
    return route === 'lesson' && !document.hidden && !document.querySelector('.hgl-ov') && !settingsOpen() &&
      !Array.from(document.querySelectorAll('.modal-backdrop')).some(e => !e.classList.contains('hidden') && e.getClientRects().length);
  }
  function show(next, focus = true) {
    if (next !== route) { persist(); stopMedia(); }
    route = next; document.body.dataset.hgRoute = next; document.body.dataset.hgMode = mode;
    if ($('hgTutorVoice')) { $('hgTutorVoice').hidden = true; document.body.classList.remove('hg-tutor-open'); }  // 하단 메뉴로 다른 화면에 가면 튜터 설정 화면은 닫힘
    if (settingsOpen()) { $('settingsModal').classList.add('hidden'); document.body.classList.remove('hg-settings-open'); }  // 설정 화면도 같이 닫힘
    const views = {home:'viewHome',languages:'viewLanguages',foundation:'viewFoundation',lesson:'viewCanvas',onboarding:'viewOnboarding'};
    Object.entries(views).forEach(([key,id]) => { if ($(id)) { $(id).classList.toggle('hidden', key !== next); $(id).setAttribute('aria-hidden', String(key !== next)); } });
    if (next !== 'onboarding' && $('openingSplashView')) $('openingSplashView').style.display = 'none';
    $('hgUiNav').hidden = false;  // 2026-10-27 옵빠야 지시: 홈·기초·학습·회화·설정 하단 메뉴는 모든 화면 맨 아래에 (설정 전이면 각 메뉴가 안내 후 설정 화면으로)
    markNav();
    if (next === 'home') renderHome();
    if (next === 'languages') renderLanguages();
    if (next === 'foundation') renderFoundation();
    if (focus) { window.scrollTo(0, 0); const heading = $(views[next])?.querySelector('[data-hg-heading]'); if (heading) heading.focus({preventScroll:true}); }
    requestAnimationFrame(fitBubbles);
  }
  // 여우 말풍선 배치: 제목 첫 줄 옆 빈칸이 넉넉하면 거기(튜터 화면처럼), 메뉴 줄·위 글자(eyebrow)에 닿으면 먼저 아래로 내리고
  // 그래도 닿거나 폭이 좁으면(90px 미만) 제목 바로 아래로 옮김 — 글자를 가리지 않는 게 우선
  function fitBubbles() {
    const row = document.querySelector('.hg-ui-menu-row'); if (!row) return;
    const limit = row.getBoundingClientRect().bottom + 4;
    document.querySelectorAll('.hg-ui-fox-bubble').forEach(b => {
      if (!b.checkVisibility()) return;
      if (!b._home) b._home = b.parentElement;
      if (b.parentElement !== b._home) b._home.appendChild(b);
      b.classList.remove('is-below'); b.style.marginBottom = ''; b.style.fontSize = '';
      const eye = b.closest('.hg-ui-hero')?.querySelector('.hg-ui-eyebrow'), range = document.createRange();
      const eyeRect = eye ? (range.selectNodeContents(eye), range.getBoundingClientRect()) : null;
      const hits = () => { const r = b.getBoundingClientRect(); return r.top < limit || (eyeRect && r.top < eyeRect.bottom && r.left < eyeRect.right + 6); };
      let mb = parseFloat(getComputedStyle(b).marginBottom), fs = parseFloat(getComputedStyle(b).fontSize);
      while (hits() && mb > 0) { mb = Math.max(0, mb - 4); b.style.marginBottom = mb + 'px'; }
      while (hits() && fs > 11) { fs -= 0.5; b.style.fontSize = fs + 'px'; }
      if (hits() || b.getBoundingClientRect().width < 90) {
        b.style.marginBottom = ''; b.style.fontSize = '';
        b.classList.add('is-below'); b.closest('h1').after(b);
      }
    });
  }
  addEventListener('resize', () => requestAnimationFrame(fitBubbles));
  // 하단 메뉴 현재 위치: 수업 화면 안에서도 회화 모드면 '회화'에 표시
  function markNav() {
    const key = route === 'lesson' && mode === 'roleplay' ? 'roleplay' : route;
    document.querySelectorAll('[data-hg-nav]').forEach(el => el.setAttribute('aria-current', el.dataset.hgNav === key ? 'page' : 'false'));
  }
  function home() { if (!ready()) { show('onboarding'); announce('호칭·음성 설정을 먼저 마쳐 주세요.'); return; } show('home'); }
  // 2026-10-27 옵빠야 지시: 모든 화면의 안내 문구(sub)는 튜터 화면처럼 제목 첫 줄 옆 빈칸에 여우가 말하는 말풍선으로
  // (화면 읽기용 문구는 숨겨서 그대로 둠)
  function hero(kicker, title, sub) {
    const br = title.indexOf('<br>'), bubble = !!sub && br > 0;
    if (bubble) requestAnimationFrame(fitBubbles);  // 화면이 다시 그려질 때마다 말풍선 위치 맞춤
    const h1 = bubble ? `<span class="hg-ui-tutor-row1"><span>${title.slice(0, br)}</span><span class="hg-ui-fox-bubble" aria-hidden="true">${sub}</span></span>${title.slice(br + 4)}` : title;
    return `<div class="hg-ui-hero"><div><p class="hg-ui-eyebrow">${kicker}</p><h1 tabindex="-1" data-hg-heading>${h1}</h1><p class="${bubble ? 'hg-ui-sr' : 'hg-ui-muted'}">${sub}</p></div>${guide}</div>`;
  }
  function renderHome() {
    const l = lang(), st = state(), snapshot = read('hg_resume_snapshot', null);
    const resume = snapshot && snapshot.canvas && snapshot.lang === selectedLang ? snapshot : st;
    const set = window.HGV2 && HGV2.getSetSync(selectedLang, resume.level || 1, HGV2.getSetIdx());
    const title = resume.script ? '문자부터 차근차근' : (set?.title || '현재 단계의 표현 연습');
    // 2026-10-28 옵빠야 지시: 언어 변경은 레슨 카드 대신 위쪽 '🇺🇸 영어 · Lv.x'(국기 포함)를 눌러서 — 네모·밑줄 없이 ▾로만 표시
    const kicker = `<button type="button" class="hg-ui-lang-switch" data-hg="languages" aria-label="${l[1]} — 눌러서 언어 바꾸기">${l[3]} ${l[1]} · ${resume.script ? 'Lv.0 문자 입문' : 'Lv.' + resume.level + ' / 50'}<span class="hg-ui-lang-caret" aria-hidden="true">▾</span></button>`;
    $('viewHome').innerHTML = hero(kicker, '오늘도,<br>한 걸음 더.', '작은 한 문장으로 시작해요.') + `
      <article class="hg-ui-lesson-card"><div class="hg-ui-row"><span class="hg-ui-tag">이어서 할 레슨</span></div>
      <h2>${esc(title)}</h2><p>${resume.script ? esc(l[4]) : `세트 ${window.HGV2 ? HGV2.getSetIdx() : 1} · 라운드 ${resume.round || 1} / 4`}</p>
      <button class="hg-ui-primary" data-hg="resume">이어서 공부하기 <span aria-hidden="true">→</span></button></article>
      <div class="hg-ui-section-title"><h2>무엇을 연습할까요?</h2><span>나에게 맞는 한 걸음</span></div>
      <div class="hg-ui-shortcuts">
      <button class="hg-ui-shortcut mint" data-hg="foundation"><span class="hg-ui-icon">Aa</span><strong>문자 기초</strong><small>${esc(l[4])}</small><span class="hg-ui-arrow">↗</span></button>
      <button class="hg-ui-shortcut sand" data-hg="words"><span class="hg-ui-icon">가</span><strong>단어·문장</strong><small>상황 속 표현 익히기</small><span class="hg-ui-arrow">↗</span></button>
      <button class="hg-ui-shortcut blue" data-hg="roleplay"><span class="hg-ui-icon">···</span><strong>AI 회화</strong><small>말하거나 입력해요</small><span class="hg-ui-arrow">↗</span></button>
      <button class="hg-ui-shortcut coral" data-hg="feedback"><span class="hg-ui-icon">♪</span><strong>말하기 피드백</strong><small>인식된 문장 확인</small><span class="hg-ui-arrow">↗</span></button></div>`;  // Exile 소개 문구는 2026-10-27 옵빠야 지시로 '처음으로' 언어 선택(2단계) 아래로 이동 (index.html #obStep2)
  }
  // 2026-10-27 옵빠야 지시: 추가 예정 6개 언어도 첫 화면에서는 활성처럼 보이고, 누르면 분기 팝업에서 '개발중'
  const DEV_LANGS = [
    ['pt', '포르투갈어', 'Português', '🇵🇹'], ['it', '이탈리아어', 'Italiano', '🇮🇹'], ['de', '독일어', 'Deutsch', '🇩🇪'],
    ['no', '노르웨이어', 'Norsk', '🇳🇴'], ['da', '덴마크어', 'Dansk', '🇩🇰'], ['el', '그리스어', 'Ελληνικά', '🇬🇷']
  ];
  const INTRO = {
    en: '뉴욕 생활 회화 · 연음·억양 실전 코스', ja: '후리가나 온/오프 · 현지 구어체 뉘앙스 코스', cn: '4성 성조 피치 트래커 · 실전 생활 회화 코스',
    fr: '유럽 감성 회화 · Le/La 성수 관사 컬러 태깅 코스', es: '마드리드 감성 회화 · 또박또박 모음 발음 코스', ru: '모스크바 생활 회화 · 키릴 문자부터 차근차근 코스',
    pt: '리스본 생활 회화 · 포르투갈식/브라질식 선택 코스', it: '로마 생활 회화 · 노래하듯 또렷한 발음 코스', de: '베를린 생활 회화 · 명사 성별·격 차근차근 코스',
    no: '오슬로 생활 회화 · 노래하는 듯한 억양 코스', da: '코펜하겐 생활 회화 · 부드러운 발음 코스', el: '아테네 생활 회화 · 그리스 문자부터 차근차근 코스'
  };
  // 언어 카드 = 두 줄 (1줄 국기·언어(원어)·학습 위치 / 2줄 간략 소개)
  function renderLanguages() {
    pendingLanguage = pendingLanguage || selectedLang;
    const card = (l, status) => `<button class="hg-ui-language" data-language="${l[0]}" aria-pressed="${l[0] === pendingLanguage}" data-search="${l.slice(0,3).join(' ')}"><span class="hg-ui-lang-title"><span class="hg-ui-flag">${l[3]}</span><strong>${l[1]} <span class="hg-ui-native">(${l[2]})</span></strong><em>${status}</em></span><small>${INTRO[l[0]] || ''}</small></button>`;
    $('viewLanguages').innerHTML = hero('MY LANGUAGE', '어떤 언어로<br>한 걸음 내딛을까요?', '언어마다 나의 학습 위치를 이어가요.') + `
      <label class="hg-ui-search">언어 찾기<input id="hgUiLanguageSearch" type="search" placeholder="언어 이름을 입력하세요" autocomplete="off"></label>
      <div class="hg-ui-language-grid" role="group" aria-label="학습 언어">${LANGS.map(l => {
        const pos = read(POSITIONS, {})[l[0]], letters = read('hg_letters_' + l[0], null);
        return card(l, pos ? (pos.script ? '문자 입문 중' : `Lv.${pos.level} · 라운드 ${pos.round}`) : letters ? '문자 학습 중' : '처음 시작');
      }).join('')}${DEV_LANGS.map(l => card(l, '새 언어')).join('')}</div><p id="hgUiNoLanguages" class="hg-ui-muted" hidden>일치하는 언어가 없습니다.</p>`;
    requestAnimationFrame(fitLanguageList);
  }
  // 2026-10-27 옵빠야 지시: 언어 선택 화면은 '언어 찾기'까지 고정, 언어 목록만 스크롤
  function fitLanguageList() {
    const grid = document.querySelector('#viewLanguages .hg-ui-language-grid');
    if (!grid || !grid.offsetParent) return;
    window.scrollTo(0, 0);
    const nav = $('hgUiNav'), bottom = nav && nav.offsetParent ? nav.getBoundingClientRect().top : window.innerHeight;
    grid.style.maxHeight = Math.max(220, Math.floor(bottom - grid.getBoundingClientRect().top - 12)) + 'px';
  }
  window.addEventListener('resize', () => { if (route === 'languages') fitLanguageList(); });
  // 2026-10-27 옵빠야 지시: 언어를 누르면 바로 '이 언어로 계속하시겠습니까? 예/아니요' 팝업 (아래 '계속하기' 버튼 대신)
  // 2026-10-27 옵빠야 지시: 변형이 있는 언어는 팝업에서 분기 표시, 구현된 변형만 활성, 나머지는 작게 '개발중'
  // [변형 id, 이름, 설명, 국기, 구현 여부]
  const VARIANTS = {
    en: [['us', '미국식', '뉴욕·보스턴 배경', '🇺🇸', true], ['uk', '영국식', '런던 배경', '🇬🇧', false]],
    es: [['es', '스페인식', '마드리드 배경', '🇪🇸', true], ['latam', '중남미식', '멕시코·남미 배경', '🌎', false]],
    cn: [['cn', '대륙식 (간체)', '상하이 배경', '🇨🇳', true], ['tw', '대만식 (번체)', '타이베이 배경', '🇹🇼', false]],
    fr: [['fr', '프랑스식', '파리 배경', '🇫🇷', true], ['ca', '캐나다 퀘벡식', '몬트리올 배경', '🇨🇦', false]],
    pt: [['pt', '포르투갈식', '리스본 배경', '🇵🇹', false], ['br', '브라질식', '상파울루 배경', '🇧🇷', false]],
    it: [['it', '표준 이탈리아어', '로마 배경', '🇮🇹', false]],
    de: [['de', '표준 독일어', '베를린 배경', '🇩🇪', false]],
    no: [['nb', '표준 노르웨이어 (보크몰)', '오슬로 배경', '🇳🇴', false]],
    da: [['da', '표준 덴마크어', '코펜하겐 배경', '🇩🇰', false]],
    el: [['el', '표준 그리스어', '아테네 배경', '🇬🇷', false]]
  };
  const VARIANT_KEY = 'hg_variant';
  function confirmLanguage(code) {
    const dev = DEV_LANGS.find(x => x[0] === code);
    const l = LANGS.find(x => x[0] === code) || dev; if (!l) return;
    closeLanguageConfirm();
    const pos = read(POSITIONS, {})[code];
    const where = dev ? '아직 준비 중인 언어예요. 곧 만나요!' : pos ? (pos.script ? '문자 입문 이어하기' : `Lv.${pos.level} · 라운드 ${pos.round}부터 이어서`) : '처음부터 시작';
    const vs = VARIANTS[code];
    const box = document.createElement('div'); box.id = 'hgLangConfirm'; box.className = 'hg-ui-confirm';
    box.innerHTML = vs ? `<div class="hg-ui-confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="hgLangConfirmTitle">
      <div class="hg-ui-confirm-flag">${l[3]}</div>
      <h2 id="hgLangConfirmTitle">어떤 ${esc(l[1])}로 배울까요?</h2><p>${esc(where)}</p>
      <div class="hg-ui-variants">${vs.map(v => v[4]
        ? `<button class="hg-ui-variant" data-hg="lang-yes" data-code="${code}" data-variant="${v[0]}"><span class="hg-ui-variant-flag">${v[3]}</span><span><strong>${esc(v[1])}</strong><small>${esc(v[2])}</small></span></button>`
        : `<button class="hg-ui-variant is-dev" disabled aria-disabled="true"><span class="hg-ui-variant-flag">${v[3]}</span><span><strong>${esc(v[1])}</strong><small>${esc(v[2])}</small></span><em>개발중</em></button>`).join('')}</div>
      <button class="hg-ui-secondary hg-ui-variant-cancel" data-hg="lang-no">취소</button></div>`
      : `<div class="hg-ui-confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="hgLangConfirmTitle">
      <div class="hg-ui-confirm-flag">${l[3]}</div>
      <h2 id="hgLangConfirmTitle">${esc(l[1])}로 계속하시겠습니까?</h2><p>${esc(where)}</p>
      <div class="hg-ui-confirm-row"><button class="hg-ui-primary" data-hg="lang-yes" data-code="${code}">예</button><button class="hg-ui-secondary" data-hg="lang-no">아니요</button></div></div>`;
    document.body.appendChild(box);
    box.addEventListener('click', e => { if (e.target === box) { closeLanguageConfirm(); } });
    (box.querySelector('[data-hg="lang-yes"]') || box.querySelector('[data-hg="lang-no"]')).focus();
  }
  function saveVariant(code, variant) {
    if (!variant) return;
    try { const m = JSON.parse(localStorage.getItem(VARIANT_KEY) || '{}'); m[code] = variant; localStorage.setItem(VARIANT_KEY, JSON.stringify(m)); } catch (e) {}
  }
  function closeLanguageConfirm(keep) {
    const box = $('hgLangConfirm'); if (box) box.remove();
    if (!keep) { pendingLanguage = selectedLang; document.querySelectorAll('[data-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === selectedLang))); }
  }
  function renderFoundation() {
    $('viewFoundation').innerHTML = hero(`${lang()[3]} ${lang()[1]} · 문자 입문`, '소리와 글자를<br>함께 익혀요.', esc(lang()[4])) + `
      <article class="hg-ui-card"><span class="hg-ui-tag">실제 문자표에서 시작</span><h2>보고, 듣고, 기억해요.</h2><p class="hg-ui-muted">문자표 → 플래시카드 → 퀴즈 순서로 익혀요. 단계와 문제는 선택한 언어의 자료를 사용합니다.</p>
      <div class="hg-ui-path"><span>01<br><b>문자표</b></span><span>02<br><b>카드</b></span><span>03<br><b>퀴즈</b></span></div>
      <button class="hg-ui-primary" data-hg="letters">문자표 열기 →</button><button class="hg-ui-secondary" data-hg="script">듣고 따라하는 Lv.0 입문</button></article>
      <div class="hg-ui-note">이미 읽을 수 있다면 단어·문장 학습으로 이어가세요.</div><button class="hg-ui-secondary" data-hg="words">단어·문장 학습</button>`;
  }
  function study(kind) {
    if (!ready()) { show('onboarding'); announce('호칭·음성 설정을 먼저 마쳐 주세요.'); return; }
    if (route === 'lesson') stopMedia();
    mode = kind; show('lesson');
    if (kind === 'script') { HGSCRIPT.start(); }
    else {
      if (window.HGSCRIPT) HGSCRIPT.leave();
      initOrGetSessionCase(currentTheme, selectedLang, currentLevel, false);
      if (kind === 'roleplay') { $('viewDrill').classList.add('hidden'); $('viewRoleplay').classList.remove('hidden'); setupRoleplayView(); }
      else { $('viewDrill').classList.remove('hidden'); $('viewRoleplay').classList.add('hidden'); renderCurrentRoundUI(); }
    }
    updateLessonChrome();
  }
  function resume() {
    show('lesson'); mode = 'feedback'; document.body.dataset.hgMode = mode;
    restoring = true;
    let restored = false;
    const snapshot = read('hg_resume_snapshot', null);
    try { restored = snapshot?.lang === selectedLang && window.HGRESUME && HGRESUME.restore(); } finally { restoring = false; }
    if (!restored) {
      const pos = read(POSITIONS, {})[selectedLang];
      initOrGetSessionCase(currentTheme, selectedLang, currentLevel, false);
      if (pos) { currentRound = pos.round || 1; roundPassed = pos.roundPassed || [false,false,false,false]; }
      updateLevelUI();
    }
    updateLessonChrome();
  }
  function updateLessonChrome() {
    if (!$('hgUiLessonHeader')) return;
    const script = window.HGSCRIPT && HGSCRIPT.isActive();
    if (script) mode = 'script';
    else if (!$('viewRoleplay').classList.contains('hidden')) mode = 'roleplay';
    document.body.dataset.hgMode = mode;
    markNav();
    $('hgUiLessonTitle').textContent = ({words:'오늘의 단어·문장',feedback:'듣고, 따라 말해요',roleplay:'실전 AI 회화',script:'문자부터 차근차근'})[mode];
    $('hgUiLessonMeta').textContent = `${lang()[3]} ${lang()[1]} · ${script ? 'Lv.0' : `Lv.${currentLevel} / 50 · 라운드 ${currentRound} / 4`}`;
    $('hgUiModeButtons').hidden = script || mode === 'roleplay';
    $('hgUiFeedbackNotice').hidden = mode !== 'feedback';
  }
  // 2026-10-27 옵빠야 지시: 호칭과 튜터를 분리. 1단계의 AI 튜터 목소리 카드(엔진 탭 ~ '이 목소리로 샘플 듣기')를 잘라
  // 별도 화면(뒤로가기만)으로. 헤더 'AI튜터 설정'을 누르면 이 화면, 1단계에는 호칭만 남긴다.
  // 1단계에서 호칭을 고르거나 이름 입력을 마치면 이 화면으로 자동 이동. 카드 자체를 옮기므로 기존 동작(탭·속도·샘플)은 그대로
  function setupTutorVoice() {
    const tabs = $('fourVoiceTabsGroup'), card = tabs && tabs.parentElement;
    if (!card || $('hgTutorVoice')) return;
    const toTutor = () => { if (route === 'onboarding' && $('obStep1') && !$('obStep1').classList.contains('hidden')) setTimeout(() => { openTutorVoice(); tutorFromStep1 = true; }, 450); };
    const oldQuick = window.selectQuickName;
    if (typeof oldQuick === 'function') window.selectQuickName = function (...args) { const v = oldQuick.apply(this, args); toTutor(); return v; };
    // 2026-10-27 옵빠야 지시: 입력칸 안의 '저장' 버튼(또는 엔터)으로 입력 완료 판정
    const input = $('obUserNameInput');
    if (input && input.parentElement) {
      input.parentElement.classList.add('hg-ui-name-field');
      const save = document.createElement('button'); save.type = 'button'; save.className = 'hg-ui-name-save'; save.textContent = '저장';
      input.after(save);
      const done = () => {
        const v = input.value.trim();
        if (!v) { announce('호칭을 입력해 주세요.'); input.focus(); return; }
        if (typeof onInputUserName === 'function') onInputUserName(v);
        try { localStorage.setItem('hangeoreum_user_name', v); } catch (e) {}
        input.blur(); toTutor();
      };
      save.addEventListener('click', done);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(); } });
    }
    // 2026-10-27 옵빠야 지시: 튜터 화면에도 헤더(한걸음·메뉴 줄)와 여우 마스코트 영역까지 보이게 — 다른 화면처럼 메뉴 줄 아래의 일반 화면으로
    const box = document.createElement('section'); box.id = 'hgTutorVoice'; box.className = 'hg-ui-page hg-ui-tutor-page'; box.hidden = true;
    box.setAttribute('aria-labelledby', 'hgTutorVoiceTitle');
    // 2026-10-27 옵빠야 지시: 안내 문구는 'AI 튜터' 옆 빈 공간에 여우가 말하는 말풍선으로(화면 읽기용 문구는 숨겨서 그대로 둠)
    const tip = '수업에서 너를 가르칠 튜터의 목소리를 골라요.';  // 여우(Exile)가 사용자에게 하는 말이라 '너를'
    box.innerHTML = hero('AI TUTOR', 'AI 튜터<br>목소리 고르기', tip)
      .replace('<h1 tabindex="-1" data-hg-heading>', '<h1 id="hgTutorVoiceTitle" tabindex="-1" data-hg-heading>')
      + '<div class="hg-ui-tutor-body"></div>';  // 2026-10-27 옵빠야 지시: '← 뒤로' 버튼 삭제 — 폰 뒤로가기 키(HGUI.back)나 상단·하단 메뉴로 나감
    box.querySelector('.hg-ui-tutor-body').appendChild(card);
    // 2026-10-27 옵빠야 지시: 튜터 설정 '완료' 버튼 — '이 목소리 샘플 듣기' 아래 줄, 같은 폭으로
    const fin = document.createElement('button'); fin.type = 'button'; fin.className = 'hg-ui-tutor-done'; fin.dataset.hg = 'tutor-done'; fin.textContent = '✅ 설정 완료';
    box.querySelector('.hg-ui-tutor-body').appendChild(fin);
    const row = document.querySelector('.hg-ui-menu-row');
    if (row) row.after(box); else document.body.appendChild(box);
  }
  // 2026-10-28 옵빠야 지시: 설정도 별도 팝업 창이 아니라 튜터처럼 헤더·메뉴 줄 아래의 일반 화면으로.
  // 기존 #settingsModal(.modal-sheet 안의 모든 기능·id)을 그대로 옮겨 쓰고, 열기/닫기는 기존 open/closeSettingsModal 그대로
  const settingsOpen = () => !!$('settingsModal') && !$('settingsModal').classList.contains('hidden') && document.body.classList.contains('hg-settings-open');
  function setupSettingsPage() {
    const m = $('settingsModal'); if (!m || m.classList.contains('hg-ui-settings-page')) return;
    m.classList.remove('modal-backdrop'); m.classList.add('hg-ui-page', 'hg-ui-settings-page');
    m.setAttribute('aria-labelledby', 'hgSettingsTitle');
    const head = document.createElement('div');
    head.innerHTML = hero('SETTINGS', '설정<br>학습 AI·소리', '학습 AI와 소리를 여기서 바꿔요.')
      .replace('<h1 tabindex="-1" data-hg-heading>', '<h1 id="hgSettingsTitle" tabindex="-1" data-hg-heading>');
    m.prepend(head.firstElementChild);
    const row = document.querySelector('.hg-ui-menu-row');
    if (row) (($('hgTutorVoice')) || row).after(m);
  }
  let tutorFromStep1 = false;
  function openTutorVoice() {
    tutorFromStep1 = false;
    setupTutorVoice();
    const box = $('hgTutorVoice'); if (!box) return returnToOnboardingView();
    stopMedia();
    if (settingsOpen()) { $('settingsModal').classList.add('hidden'); document.body.classList.remove('hg-settings-open'); }
    box.hidden = false; document.body.classList.add('hg-tutor-open'); window.scrollTo(0, 0);
    box.querySelector('#hgTutorVoiceTitle').focus({preventScroll:true});
    requestAnimationFrame(fitBubbles);
  }
  // '설정 완료': 처음 설정(호칭 다음)에서 왔으면 — 예전에 언어를 골라 둔 사람은 홈, 처음인 사람은 언어 선택. 헤더로 열었으면 원래 화면
  function finishTutorVoice() {
    const onStep1 = route === 'onboarding' && typeof obStep !== 'undefined' && obStep === 1;
    if (onStep1 && ready()) {
      const box = $('hgTutorVoice'); box.hidden = true; document.body.classList.remove('hg-tutor-open'); tutorFromStep1 = false;
      try { stopAllTTSAudio(); } catch (e) {}
      const v = $('obUserNameInput') && $('obUserNameInput').value.trim();
      if (v) { try { userName = v; localStorage.setItem('hangeoreum_user_name', v); } catch (e) {} }
      home(); return;
    }
    if (onStep1) tutorFromStep1 = true;  // 처음인 사람: 닫히면서 언어 선택 단계로
    closeTutorVoice();
  }
  function closeTutorVoice() {
    const box = $('hgTutorVoice'); if (!box || box.hidden) return;
    box.hidden = true; document.body.classList.remove('hg-tutor-open'); window.scrollTo(0, 0);
    try { stopAllTTSAudio(); } catch (e) {}  // 샘플 듣기 중이면 멈춤
    // 처음 설정 1단계에서 호칭 저장으로 왔으면 뒤로 나올 때 바로 언어 선택 단계로 (헤더로 연 경우는 제자리)
    const fromStep1 = tutorFromStep1; tutorFromStep1 = false;
    if (fromStep1 && route === 'onboarding' && typeof obStep !== 'undefined' && obStep === 1 && typeof goToNextObStep === 'function') { goToNextObStep(); return; }
    resumeLesson();
  }
  function back() {
    if ($('hgTutorVoice') && !$('hgTutorVoice').hidden) { closeTutorVoice(); return; }
    if (settingsOpen()) { closeSettingsModal(); return; }
    if ($('hgLangConfirm')) { closeLanguageConfirm(); return; }  // 언어 확인 팝업 = 아니요
    if (window.HGDIALOG && HGDIALOG.isOpen()) { HGDIALOG.skip(); return; }  // 다이얼로그 닫고 수업 시작
    if (window.HGAI && HGAI.isOpen()) { HGAI.close(); return; }
    if (window.HGREVIEW && HGREVIEW.isOpen()) { HGREVIEW.close(); return; }
    if (document.querySelector('.hgl-ov')) { HGLETTERS.close(); return; }
    const extras = ['hgv2Picker','hgVoiceLog','hgCelebrate'];
    for (const id of extras) { if ($(id)) { $(id).remove(); stopMedia(); resumeLesson(); return; } }
    const modal = Array.from(document.querySelectorAll('.modal-backdrop')).reverse().find(e => !e.classList.contains('hidden') && e.getClientRects().length);
    if (modal && modal.id === 'dailyCheckinModal') { closeDailyCheckinModal(); return; }  // 닫으면서 멈춘 수업 재개
    if (modal) { modal.classList.add('hidden'); stopMedia(); if (returnFocus) returnFocus.focus(); resumeLesson(); return; }
    if (route === 'home' || route === 'onboarding') openExitConfirmModal(); else home();
  }
  function hooks() {
    const wrap = (name, fn) => { const old = window[name]; if (typeof old === 'function') window[name] = function (...args) { return fn(old, args); }; };
    wrap('switchLang', (old,args) => {
      const code = args[0]; if (!LANGS.some(l => l[0] === code)) return;
      const changing = selectedLang !== code;
      let pos = null;
      if (changing && ready()) { persist(); stopMedia(); pos=read(POSITIONS,{})[code]; currentLevel=pos?.level || 1; currentTheme=pos?.theme || 'work'; }
      const previousRestoring=restoring; restoring=true;
      let value;
      try {
        value=old(...args);
        if(changing && ready()) { if(pos) {currentRound=pos.round || 1;roundPassed=pos.roundPassed || [false,false,false,false];} if(route==='lesson') updateLevelUI(); }
      } finally { restoring=previousRestoring; }
      persist(); return value;
    });
    ['updateLevelUI','renderCurrentRoundUI'].forEach(name => wrap(name,(old,args)=>{const value=old(...args); updateLessonChrome(); persist(); return value;}));
    ['playTargetTTSAndAutoListen','triggerAutoMicListening','startVoiceRecognition','autoProceedNextRoundOrLevel'].forEach(name => wrap(name,(old,args)=> canPractice() && mode !== 'words' ? old(...args) : undefined));
    wrap('analyzePronunciationAndJudge',(old,args)=> canPractice() && mode !== 'words' ? old(...args) : undefined);
    wrap('speakExileTutor',(old,args)=> ['home','languages','foundation'].includes(route) ? Promise.resolve() : old(...args));
    wrap('resumePreviousLearning',()=>resume());
    wrap('completeOnboardingAndStartCanvas',(old,args)=>{route='lesson';mode='feedback';const value=old(...args);persist();$('hgUiNav').hidden=false;document.body.dataset.hgRoute='lesson';updateLessonChrome();return value;});
    wrap('returnToOnboardingView',(old,args)=>{show('onboarding');return old(...args);});
    wrap('openSettingsModal',(old,args)=>{
      returnFocus=document.activeElement;stopMedia();setupSettingsPage();
      if($('hgTutorVoice')&&!$('hgTutorVoice').hidden){$('hgTutorVoice').hidden=true;document.body.classList.remove('hg-tutor-open');}
      const value=old(...args);
      document.body.classList.add('hg-settings-open');window.scrollTo(0,0);
      document.querySelectorAll('[data-hg-nav]').forEach(el=>el.setAttribute('aria-current',el.dataset.hgNav==='settings'?'page':'false'));
      $('hgSettingsTitle')?.focus({preventScroll:true});requestAnimationFrame(fitBubbles);
      return value;
    });
    wrap('closeSettingsModal',(old,args)=>{const value=old(...args);document.body.classList.remove('hg-settings-open');markNav();window.scrollTo(0,0);resumeLesson();return value;});
    wrap('handleRoleplayUserTurn', async(old,args)=>{
      if(busy || !canPractice()) return;
      busy=true; const input=$('rpTextInput'); if(input) input.disabled=true; $('btnRpMic').disabled=true;
      try { return await old(...args); } finally {busy=false;if(input)input.disabled=false;$('btnRpMic').disabled=false;}
    });
    wrap('submitRoleplayUserText',(old,args)=>{if(!busy && !isRoleplayRecording)return old(...args);});
    window.onAndroidBackPressed = back;
  }
  function init() {
    document.body.classList.add('hg-ui-active');
    const root=document.querySelector('.app-root');
    const header=document.createElement('header'); header.className='hg-ui-header';
    header.innerHTML='<button class="hg-ui-brand" data-hg="home" aria-label="한걸음 홈">한걸음<span>매일, 나의 속도로</span></button><button type="button" class="hg-ui-exile-btn" data-hg="exile"><span>🎬</span>Exile 오프닝</button>';  // 2026-10-27: 文(언어)·⚙ 버튼은 뺌 — 언어는 홈 카드 '언어 변경', 설정은 하단 메뉴. 오른쪽 끝은 Exile 오프닝
    root.prepend(header);
    ['viewHome','viewLanguages','viewFoundation'].forEach(id=>{const section=document.createElement('section');section.id=id;section.className='hg-ui-page hidden';$('viewOnboarding').before(section);});
    const lessonHeader=document.createElement('div'); lessonHeader.id='hgUiLessonHeader';lessonHeader.className='hg-ui-lesson-header';
    lessonHeader.innerHTML=`<div><button class="hg-ui-link" data-hg="home">← 홈</button><p id="hgUiLessonMeta" class="hg-ui-eyebrow"></p><h1 id="hgUiLessonTitle" data-hg-heading tabindex="-1"></h1></div>${fox}`;
    const canvas=$('viewCanvas');canvas.prepend(lessonHeader);
    const advanced=document.createElement('details');advanced.className='hg-ui-advanced';advanced.innerHTML='<summary>학습 단계 · 맥락 · 고급 메뉴</summary>';
    Array.from(canvas.children).filter(e=>e!==lessonHeader && e.id!=='viewDrill' && e.id!=='viewRoleplay' && e.id!=='hgScriptView').forEach(e=>advanced.append(e));canvas.append(advanced);
    const modes=document.createElement('div');modes.id='hgUiModeButtons';modes.className='hg-ui-mode-buttons';modes.innerHTML='<button class="hg-ui-secondary" data-hg="words">표현 익히기</button><button class="hg-ui-primary" data-hg="feedback">따라 말하기</button>';
    lessonHeader.after(modes);
    const feedback=document.createElement('p');feedback.id='hgUiFeedbackNotice';feedback.className='hg-ui-note';feedback.textContent='시범을 듣고 따라 말하면 짧게 확인하고 이어가요. 종합 안내는 문자 카테고리와 10레벨 구간을 마칠 때 제공해요.';modes.after(feedback);
    const targetCard=$('targetDisplay').parentElement;targetCard.classList.add('hg-ui-phrase-card');
    const micPanel=$('sttStatusText').parentElement;micPanel.classList.add('hg-ui-mic-panel');
    $('feedbackSheet').classList.add('hg-ui-result-card');$('sttStatusText').setAttribute('aria-live','polite');$('userSpokenFeedback').setAttribute('aria-live','polite');
    const replay=document.createElement('button');replay.className='hg-ui-secondary';replay.dataset.hg='listen';replay.textContent='↻ 다시 듣기';micPanel.after(replay);
    const rpTools=document.createElement('div');rpTools.className='hg-ui-rp-tools';rpTools.innerHTML='<p id="hgUiReplySource" class="hg-ui-note" role="status">AI 연결 전 · 키가 없거나 연결 실패 시 내장 연습 응답을 사용합니다.</p><button class="hg-ui-secondary" data-hg="rp-listen">↻ 상대방 다시 듣기</button>';$('viewRoleplay').prepend(rpTools);
    $('rpTextInput').setAttribute('aria-label','회화 답변 입력');
    const oldHeader=document.querySelector('.app-header');
    // 2026-10-27 옵빠야 지시: 옛 헤더(한걸음 로고·🔊 음성 테스트·⏻ 종료)와 'API·음성 설정'(⚙과 중복)을 없애고 한 줄로 정리해
    // '한걸음' 헤더 바로 아래에 둔다. 왼쪽부터 처음으로 → AI튜터 설정 → AI통역사 (Exile 오프닝은 헤더 오른쪽 끝).
    // 설정은 하단 메뉴에만 둔다(하단 '설정' 5번 누르면 관리자 잠금 해제 — 옛 로고 🌌 5번 누르기 기능 이전)
    const menuRow=document.createElement('div');menuRow.className='hg-ui-menu-row';menuRow.innerHTML=''
      +'<button type="button" data-hg="restart"><span>🏠</span>처음으로</button>'
      +'<button type="button" data-hg="tutor-voice"><span>🧑‍🏫</span>AI튜터<br>설정</button>'
      +'<button type="button" onclick="openInterpreterComingSoon()"><span>🌐</span>AI<br>통역사</button>';
    if(oldHeader)oldHeader.remove();header.after(menuRow);
    // 고정 헤더 높이를 재서 메뉴 줄·여우 영역이 바로 아래에 붙어 고정되게(화면 크기·접힘 바뀌면 다시 잼)
    const pinTop=()=>{const h=header.offsetHeight;document.documentElement.style.setProperty('--hg-head-h',h+'px');document.documentElement.style.setProperty('--hg-top-h',(h+menuRow.offsetHeight)+'px');};
    pinTop();addEventListener('resize',pinTop);
    setupTutorVoice();
    // 2026-10-27 옵빠야 지시: '처음으로' 화면의 '직전 학습 이어서 하기' 배너 대신 홈과 같은 마스코트 영역(문구는 시작 화면용)
    if ($('viewOnboarding') && !$('hgObHero')) {
      const obHero = document.createElement('div'); obHero.id = 'hgObHero';
      obHero.innerHTML = hero('START', '처음부터,<br>한 걸음씩.', 'Exile과 함께 호칭·튜터·언어를 정해요.');
      $('viewOnboarding').prepend(obHero.firstElementChild);
    }
    const nav=document.createElement('nav');nav.id='hgUiNav';nav.className='hg-ui-nav';nav.setAttribute('aria-label','주 메뉴');nav.innerHTML='<button data-hg="home" data-hg-nav="home"><span>⌂</span>홈</button><button data-hg="foundation" data-hg-nav="foundation"><span>Aa</span>기초</button><button data-hg="words" data-hg-nav="lesson"><span>▤</span>학습</button><button data-hg="roleplay" data-hg-nav="roleplay"><span>◌</span>회화</button><button data-hg="settings"><span>⚙</span>설정</button>';root.append(nav);
    const notice=document.createElement('p');notice.id='hgUiNotice';notice.className='hg-ui-status';notice.setAttribute('role','status');root.append(notice);
    document.addEventListener('click',e=>{
      const l=e.target.closest('[data-language]');if(l){pendingLanguage=l.dataset.language;document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b===l)));confirmLanguage(l.dataset.language);return;}
      const a=e.target.closest('[data-hg]');if(!a)return;
      switch(a.dataset.hg){
        case 'home':home();break;
        case 'languages':if(!ready()){show('onboarding');announce('호칭·음성 설정 후 언어를 선택해 주세요.');}else show('languages');break;
        case 'confirm-language':if(pendingLanguage!==selectedLang)switchLang(pendingLanguage);pendingLanguage=null;home();break;
        case 'lang-yes':{const code=a.dataset.code;saveVariant(code,a.dataset.variant);closeLanguageConfirm(true);if(code!==selectedLang)switchLang(code);pendingLanguage=null;home();break;}
        case 'lang-no':closeLanguageConfirm();break;
        case 'foundation':if(!ready()){show('onboarding');announce('호칭·음성 설정을 먼저 마쳐 주세요.');}else show('foundation');break;
        case 'letters':stopMedia();HGLETTERS.open(selectedLang);break;
        case 'script':study('script');break;
        case 'words':study('words');break;
        case 'feedback':study('feedback');break;
        case 'roleplay':study('roleplay');break;
        case 'resume':resume();break;
        case 'settings':if(typeof handleSettingsGearClick==='function')handleSettingsGearClick(e);else openSettingsModal();break;  // 1번=설정, 5번 연속=관리자
        case 'onboarding':returnToOnboardingView();break;
        case 'tutor-voice':openTutorVoice();break;
        case 'tutor-done':finishTutorVoice();break;
        case 'restart':stopMedia();show('onboarding');goToInitialScreen(false);break;  // 오프닝 다음 화면으로
        case 'exile':stopMedia();show('onboarding');goToInitialScreen(true);break;
        case 'listen':stopMedia();playTargetTTS();break;
        case 'rp-listen':stopMedia();replayPersonaGreeting();break;
      }
    });
    document.addEventListener('input',e=>{if(e.target.id!=='hgUiLanguageSearch')return;const q=e.target.value.trim().toLowerCase();let count=0;document.querySelectorAll('[data-search]').forEach(b=>{b.hidden=!b.dataset.search.toLowerCase().includes(q);if(!b.hidden)count++;});$('hgUiNoLanguages').hidden=!!count;});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();back();}});
    // 키보드가 올라오면 하단 메뉴가 키보드 위로 따라와 회화 입력칸·전송 버튼을 가린다(실기기 2026-10-26) → 입력 중엔 메뉴 숨김
    const typing=e=>e.target&&e.target.matches&&e.target.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea');
    document.addEventListener('focusin',e=>{if(typing(e)){document.body.classList.add('hg-ui-typing');setTimeout(()=>{try{e.target.scrollIntoView({block:'center'});}catch(_){}},300);}});
    document.addEventListener('focusout',e=>{if(typing(e))document.body.classList.remove('hg-ui-typing');});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){persist();stopMedia();}else resumeLesson();});
    window.addEventListener('pagehide',persist);
    window.addEventListener('hg-letters',e=>{if(e.detail==='open')stopMedia(); if(e.detail==='handoff'){route='lesson';mode='script';show('lesson');updateLevelUI();}});
    document.querySelectorAll('#obStep2 .choice-card').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
    hooks();
    initSwipe();
    if(ready()){
      const snapshot=read('hg_resume_snapshot',null);
      if(snapshot?.canvas && snapshot.lang===selectedLang){currentLevel=snapshot.level || currentLevel;currentRound=snapshot.round || 1;roundPassed=snapshot.roundPassed || roundPassed;}
      const saved=read(POSITIONS,{})[selectedLang];
      if((!snapshot || snapshot.lang!==selectedLang) && saved){currentLevel=saved.level || currentLevel;currentRound=saved.round || 1;roundPassed=saved.roundPassed || roundPassed;if(saved.theme)currentTheme=saved.theme;}
      home();
    } else show('onboarding',false);
  }
  window.HGUI={home,study,resume,back,persist,canPractice,stopMedia,shouldDeferResume:()=>!restoring,route:()=>route,mode:()=>mode,epoch:()=>epoch,state,escape:esc};
  window.addEventListener('DOMContentLoaded',init);
})();
