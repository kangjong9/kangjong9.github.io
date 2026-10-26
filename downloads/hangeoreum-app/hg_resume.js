/* 한걸음 종료 시 저장·이어하기 (HGRESUME)
   종료 창에서 [저장하고 종료]를 누르면 지금 위치(언어·레벨·단계·주제, 입문 문자 위치)를 저장하고,
   다음 실행 때 오프닝·온보딩을 건너뛰고 바로 그 자리에서 시작한다. 저장본은 한 번 쓰면 지운다.
   [저장 안 하고 종료]는 저장본을 지우고 종료한다 (레벨 진도 자체는 지우지 않는다).
   입문 문자의 글자 위치는 hg_script_<lang>의 pos로 이미 저장되므로 여기서는 입문 중인지만 기억한다. */
(function () {
  const KEY = 'hg_resume_snapshot';

  function canvasOpen() {
    const c = document.getElementById('viewCanvas');
    return !!(c && !c.classList.contains('hidden'));
  }

  function snapshot() {
    return {
      v: 1, savedAt: Date.now(), canvas: canvasOpen(),
      lang: selectedLang, level: currentLevel, round: currentRound,
      roundPassed: Array.isArray(roundPassed) ? roundPassed.slice() : [false, false, false, false],
      theme: currentTheme, script: !!(window.HGSCRIPT && HGSCRIPT.isActive())
    };
  }

  function saveAndExit() {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot()));
      localStorage.setItem('hangeoreum_level', String(currentLevel));
      localStorage.setItem('hangeoreum_lang', selectedLang);
    } catch (e) { /* 저장소 차단 */ }
    if (typeof confirmExitApp === 'function') confirmExitApp();
  }

  function exitWithoutSave() {
    try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ }
    if (typeof confirmExitApp === 'function') confirmExitApp();
  }

  function take() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); localStorage.removeItem(KEY); } catch (e) { /* 무시 */ }
    return s && s.v === 1 ? s : null;
  }

  /* 실행 직후: 저장본이 있으면 바로 그 자리로 */
  function restore() {
    const s = take();
    if (!s || !s.canvas || localStorage.getItem('hangeoreum_onboarding_done') !== '1') return false;
    try { if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio(); } catch (e) { /* 무시 */ }
    const splash = document.getElementById('openingSplashView');
    if (splash) splash.style.display = 'none';
    document.getElementById('viewOnboarding').classList.add('hidden');
    document.getElementById('viewCanvas').classList.remove('hidden');
    selectedLang = s.lang || selectedLang;
    currentLevel = s.level || currentLevel;
    if (s.theme) currentTheme = s.theme;
    if (typeof applyDailyThemeUI === 'function') applyDailyThemeUI();
    const label = document.getElementById('lessonLangLabel');
    if (label) label.textContent = ({ fr: '🇫🇷 프랑스어', cn: '🇨🇳 중국어', ja: '🇯🇵 일본어', en: '🇺🇸 영어', es: '🇪🇸 스페인어' })[selectedLang] || selectedLang;
    const slider = document.getElementById('levelSlider');
    if (slider) slider.value = currentLevel;
    if (typeof initOrGetSessionCase === 'function') initOrGetSessionCase(currentTheme, selectedLang, currentLevel, false);
    currentRound = s.round || 1;
    roundPassed = Array.isArray(s.roundPassed) ? s.roundPassed : [false, false, false, false];
    if (s.script && window.HGSCRIPT) { const st = HGSCRIPT.load(); st.active = true; HGSCRIPT.save(st); }
    if (typeof updateLevelUI === 'function') updateLevelUI();
    if (!s.script && typeof speakExileTutor === 'function') {
      setTimeout(() => speakExileTutor(`${userName || '지구인'}! 멈췄던 곳부터 바로 이어서 할게.`, 'ko'), 300);
    }
    return true;
  }

  // 앱의 DOMContentLoaded 처리(오프닝·온보딩 표시)가 끝난 뒤에 덮어쓴다
  window.addEventListener('DOMContentLoaded', () => setTimeout(restore, 0));
  window.HGRESUME = { saveAndExit, exitWithoutSave, snapshot, restore };
})();
