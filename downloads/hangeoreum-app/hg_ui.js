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
  function announce(text) { if ($('hgUiNotice')) $('hgUiNotice').textContent = text; }
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
    epoch++;
    try { globalTtsSeq++; stopAllTTSAudio(); } catch (_) {}
    try { if (speechRecognizer) speechRecognizer.abort(); isRecordingSTT = false; } catch (_) {}
    try { if (roleplayRecognizer) roleplayRecognizer.abort(); isRoleplayRecording = false; } catch (_) {}
    if (window.HGSCRIPT) HGSCRIPT.hide();
  }
  function canPractice() {
    return route === 'lesson' && !document.hidden && !document.querySelector('.hgl-ov') &&
      !Array.from(document.querySelectorAll('.modal-backdrop')).some(e => !e.classList.contains('hidden') && e.getClientRects().length);
  }
  function show(next, focus = true) {
    if (next !== route) { persist(); stopMedia(); }
    route = next; document.body.dataset.hgRoute = next; document.body.dataset.hgMode = mode;
    const views = {home:'viewHome',languages:'viewLanguages',foundation:'viewFoundation',lesson:'viewCanvas',onboarding:'viewOnboarding'};
    Object.entries(views).forEach(([key,id]) => { if ($(id)) { $(id).classList.toggle('hidden', key !== next); $(id).setAttribute('aria-hidden', String(key !== next)); } });
    if (next !== 'onboarding' && $('openingSplashView')) $('openingSplashView').style.display = 'none';
    $('hgUiNav').hidden = !ready();
    markNav();
    if (next === 'home') renderHome();
    if (next === 'languages') renderLanguages();
    if (next === 'foundation') renderFoundation();
    if (focus) { window.scrollTo(0, 0); const heading = $(views[next])?.querySelector('[data-hg-heading]'); if (heading) heading.focus({preventScroll:true}); }
  }
  // 하단 메뉴 현재 위치: 수업 화면 안에서도 회화 모드면 '회화'에 표시
  function markNav() {
    const key = route === 'lesson' && mode === 'roleplay' ? 'roleplay' : route;
    document.querySelectorAll('[data-hg-nav]').forEach(el => el.setAttribute('aria-current', el.dataset.hgNav === key ? 'page' : 'false'));
  }
  function home() { if (!ready()) return show('onboarding'); show('home'); }
  function hero(kicker, title, sub) {
    return `<div class="hg-ui-hero"><div><p class="hg-ui-eyebrow">${kicker}</p><h1 tabindex="-1" data-hg-heading>${title}</h1><p class="hg-ui-muted">${sub}</p></div>${guide}</div>`;
  }
  function renderHome() {
    const l = lang(), st = state(), snapshot = read('hg_resume_snapshot', null);
    const resume = snapshot && snapshot.canvas && snapshot.lang === selectedLang ? snapshot : st;
    const set = window.HGV2 && HGV2.getSetSync(selectedLang, resume.level || 1, HGV2.getSetIdx());
    const title = resume.script ? '문자부터 차근차근' : (set?.title || '현재 단계의 표현 연습');
    $('viewHome').innerHTML = hero(`${l[3]} ${l[1]} · ${resume.script ? 'Lv.0 문자 입문' : 'Lv.' + resume.level + ' / 50'}`, '오늘도,<br>한 걸음 더.', '작은 한 문장으로 시작해요.') + `
      <article class="hg-ui-lesson-card"><div class="hg-ui-row"><span class="hg-ui-tag">이어서 할 레슨</span><button class="hg-ui-link" data-hg="languages">언어 변경 ↗</button></div>
      <h2>${esc(title)}</h2><p>${resume.script ? esc(l[4]) : `세트 ${window.HGV2 ? HGV2.getSetIdx() : 1} · 라운드 ${resume.round || 1} / 4`}</p>
      <button class="hg-ui-primary" data-hg="resume">이어서 공부하기 <span aria-hidden="true">→</span></button></article>
      <div class="hg-ui-section-title"><h2>무엇을 연습할까요?</h2><span>나에게 맞는 한 걸음</span></div>
      <div class="hg-ui-shortcuts">
      <button class="hg-ui-shortcut mint" data-hg="foundation"><span class="hg-ui-icon">Aa</span><strong>문자 기초</strong><small>${esc(l[4])}</small><span class="hg-ui-arrow">↗</span></button>
      <button class="hg-ui-shortcut sand" data-hg="words"><span class="hg-ui-icon">가</span><strong>단어·문장</strong><small>상황 속 표현 익히기</small><span class="hg-ui-arrow">↗</span></button>
      <button class="hg-ui-shortcut blue" data-hg="roleplay"><span class="hg-ui-icon">···</span><strong>AI 회화</strong><small>말하거나 입력해요</small><span class="hg-ui-arrow">↗</span></button>
      <button class="hg-ui-shortcut coral" data-hg="feedback"><span class="hg-ui-icon">♪</span><strong>말하기 피드백</strong><small>인식된 문장 확인</small><span class="hg-ui-arrow">↗</span></button></div>
      <div class="hg-ui-note">Exile은 안드로메다에서 지구로 유배 온 안내 AI예요. 내가 50단계를 마스터하면 Exile도 사면을 받아 고향 안드로메다로 돌아갈 수 있어요. 수업 음성은 설정에서 고른 목소리를 사용합니다.</div>`;
  }
  function renderLanguages() {
    pendingLanguage = pendingLanguage || selectedLang;
    $('viewLanguages').innerHTML = hero('MY LANGUAGE', '어떤 언어로<br>한 걸음 내딛을까요?', '언어마다 나의 학습 위치를 이어가요.') + `
      <label class="hg-ui-search">언어 찾기<input id="hgUiLanguageSearch" type="search" placeholder="언어 이름을 입력하세요" autocomplete="off"></label>
      <div class="hg-ui-language-grid" role="group" aria-label="학습 언어">${LANGS.map(l => {
        const pos = read(POSITIONS, {})[l[0]], letters = read('hg_letters_' + l[0], null);
        const status = pos ? (pos.script ? '문자 입문 이어하기' : `Lv.${pos.level} · 라운드 ${pos.round}`) : letters ? '문자 학습 기록 있음' : '저장된 학습 위치 없음';
        return `<button class="hg-ui-language" data-language="${l[0]}" aria-pressed="${l[0] === pendingLanguage}" data-search="${l.slice(0,3).join(' ')}"><span class="hg-ui-flag">${l[3]}</span><strong>${l[1]}</strong><span>${l[2]}</span><small>${l[4]}</small><em>${status}</em></button>`;
      }).join('')}</div><p id="hgUiNoLanguages" class="hg-ui-muted" hidden>일치하는 언어가 없습니다.</p>
      <button class="hg-ui-primary" data-hg="confirm-language">선택한 언어로 계속하기 →</button>`;
  }
  function renderFoundation() {
    $('viewFoundation').innerHTML = hero(`${lang()[3]} ${lang()[1]} · 문자 입문`, '소리와 글자를<br>함께 익혀요.', esc(lang()[4])) + `
      <article class="hg-ui-card"><span class="hg-ui-tag">실제 문자표에서 시작</span><h2>보고, 듣고, 기억해요.</h2><p class="hg-ui-muted">문자표 → 플래시카드 → 퀴즈 순서로 익혀요. 단계와 문제는 선택한 언어의 자료를 사용합니다.</p>
      <div class="hg-ui-path"><span>01<br><b>문자표</b></span><span>02<br><b>카드</b></span><span>03<br><b>퀴즈</b></span></div>
      <button class="hg-ui-primary" data-hg="letters">문자표 열기 →</button><button class="hg-ui-secondary" data-hg="script">듣고 따라하는 Lv.0 입문</button></article>
      <div class="hg-ui-note">이미 읽을 수 있다면 단어·문장 학습으로 이어가세요.</div><button class="hg-ui-secondary" data-hg="words">단어·문장 학습</button>`;
  }
  function study(kind) {
    if (!ready()) return show('onboarding');
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
  function back() {
    if (document.querySelector('.hgl-ov')) { HGLETTERS.close(); return; }
    const extras = ['hgv2Picker','hgVoiceLog','hgCelebrate'];
    for (const id of extras) { if ($(id)) { $(id).remove(); stopMedia(); return; } }
    const modal = Array.from(document.querySelectorAll('.modal-backdrop')).reverse().find(e => !e.classList.contains('hidden') && e.getClientRects().length);
    if (modal) { modal.classList.add('hidden'); stopMedia(); if (returnFocus) returnFocus.focus(); return; }
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
    wrap('openSettingsModal',(old,args)=>{returnFocus=document.activeElement;stopMedia();return old(...args);});
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
    header.innerHTML='<button class="hg-ui-brand" data-hg="home" aria-label="한걸음 홈">한걸음<span>매일, 나의 속도로</span></button><div><button class="hg-ui-icon-button" data-hg="languages" aria-label="언어 선택">文</button><button class="hg-ui-icon-button" data-hg="settings" aria-label="설정">⚙</button></div>';
    root.prepend(header);
    ['viewHome','viewLanguages','viewFoundation'].forEach(id=>{const section=document.createElement('section');section.id=id;section.className='hg-ui-page hidden';$('viewOnboarding').before(section);});
    const lessonHeader=document.createElement('div'); lessonHeader.id='hgUiLessonHeader';lessonHeader.className='hg-ui-lesson-header';
    lessonHeader.innerHTML=`<div><button class="hg-ui-link" data-hg="home">← 홈</button><p id="hgUiLessonMeta" class="hg-ui-eyebrow"></p><h1 id="hgUiLessonTitle" data-hg-heading tabindex="-1"></h1></div>${fox}`;
    const canvas=$('viewCanvas');canvas.prepend(lessonHeader);
    const advanced=document.createElement('details');advanced.className='hg-ui-advanced';advanced.innerHTML='<summary>학습 단계 · 맥락 · 고급 메뉴</summary>';
    Array.from(canvas.children).filter(e=>e!==lessonHeader && e.id!=='viewDrill' && e.id!=='viewRoleplay' && e.id!=='hgScriptView').forEach(e=>advanced.append(e));canvas.append(advanced);
    const modes=document.createElement('div');modes.id='hgUiModeButtons';modes.className='hg-ui-mode-buttons';modes.innerHTML='<button class="hg-ui-secondary" data-hg="words">표현 익히기</button><button class="hg-ui-primary" data-hg="feedback">따라 말하기</button>';
    lessonHeader.after(modes);
    const feedback=document.createElement('p');feedback.id='hgUiFeedbackNotice';feedback.className='hg-ui-note';feedback.textContent='음성인식 결과와 목표 문장의 일치도를 확인합니다. 음소·억양·자연스러움을 측정한 점수가 아닙니다.';modes.after(feedback);
    const targetCard=$('targetDisplay').parentElement;targetCard.classList.add('hg-ui-phrase-card');
    const micPanel=$('sttStatusText').parentElement;micPanel.classList.add('hg-ui-mic-panel');
    $('feedbackSheet').classList.add('hg-ui-result-card');$('sttStatusText').setAttribute('aria-live','polite');$('userSpokenFeedback').setAttribute('aria-live','polite');
    const replay=document.createElement('button');replay.className='hg-ui-secondary';replay.dataset.hg='listen';replay.textContent='↻ 다시 듣기';micPanel.after(replay);
    const rpTools=document.createElement('div');rpTools.className='hg-ui-rp-tools';rpTools.innerHTML='<p id="hgUiReplySource" class="hg-ui-note" role="status">AI 연결 전 · 키가 없거나 연결 실패 시 내장 연습 응답을 사용합니다.</p><button class="hg-ui-secondary" data-hg="rp-listen">↻ 상대방 다시 듣기</button>';$('viewRoleplay').prepend(rpTools);
    $('rpTextInput').setAttribute('aria-label','회화 답변 입력');
    const oldHeader=document.querySelector('.app-header');
    const more=document.createElement('details');more.className='hg-ui-advanced hg-ui-global-tools';more.innerHTML='<summary>음성·설정·Exile 고급 메뉴</summary><div class="hg-ui-tools"><button class="hg-ui-secondary" data-hg="settings">API·음성 설정</button><button class="hg-ui-secondary" data-hg="onboarding">호칭·튜터·수준 진단</button><button class="hg-ui-secondary" data-hg="exile">Exile 오프닝 다시 보기</button></div>';
    if(oldHeader)more.append(oldHeader);root.append(more);
    const nav=document.createElement('nav');nav.id='hgUiNav';nav.className='hg-ui-nav';nav.setAttribute('aria-label','주 메뉴');nav.innerHTML='<button data-hg="home" data-hg-nav="home"><span>⌂</span>홈</button><button data-hg="foundation" data-hg-nav="foundation"><span>Aa</span>기초</button><button data-hg="words" data-hg-nav="lesson"><span>▤</span>학습</button><button data-hg="roleplay" data-hg-nav="roleplay"><span>◌</span>회화</button><button data-hg="settings"><span>⚙</span>설정</button>';root.append(nav);
    const notice=document.createElement('p');notice.id='hgUiNotice';notice.className='hg-ui-status';notice.setAttribute('role','status');root.append(notice);
    document.addEventListener('click',e=>{
      const l=e.target.closest('[data-language]');if(l){pendingLanguage=l.dataset.language;document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b===l)));return;}
      const a=e.target.closest('[data-hg]');if(!a)return;
      switch(a.dataset.hg){
        case 'home':home();break;
        case 'languages':if(!ready()){show('onboarding');announce('호칭·음성 설정 후 언어를 선택해 주세요.');}else show('languages');break;
        case 'confirm-language':if(pendingLanguage!==selectedLang)switchLang(pendingLanguage);pendingLanguage=null;home();break;
        case 'foundation':show('foundation');break;
        case 'letters':stopMedia();HGLETTERS.open(selectedLang);break;
        case 'script':study('script');break;
        case 'words':study('words');break;
        case 'feedback':study('feedback');break;
        case 'roleplay':study('roleplay');break;
        case 'resume':resume();break;
        case 'settings':openSettingsModal();break;
        case 'onboarding':returnToOnboardingView();break;
        case 'exile':show('onboarding');goToInitialScreen();break;
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
    document.addEventListener('visibilitychange',()=>{if(document.hidden){persist();stopMedia();}});
    window.addEventListener('pagehide',persist);
    window.addEventListener('hg-letters',e=>{if(e.detail==='open')stopMedia(); if(e.detail==='handoff'){route='lesson';mode='script';show('lesson');updateLevelUI();}});
    document.querySelectorAll('#obStep2 .choice-card').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
    hooks();
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
