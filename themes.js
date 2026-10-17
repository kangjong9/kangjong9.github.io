'use strict';
(() => {
  const names = {lilac:'라일락',midnight:'미드나이트',forest:'숲속 작업실',retro:'레트로 PC',ivory:'아이보리'};
  const storageKey = 'coding-playground.desktop-theme.v1';
  const buttons = [...document.querySelectorAll('[data-theme-choice]')];
  const valid = value => Object.prototype.hasOwnProperty.call(names, value);
  let initial = 'lilac';
  try { const stored = localStorage.getItem(storageKey); if (valid(stored)) initial = stored; } catch { /* file previews and restricted storage still work */ }
  const requested = new URLSearchParams(location.search).get('theme');
  if (valid(requested)) initial = requested;
  function applyTheme(theme, announce = true) {
    if (!valid(theme)) return;
    document.body.dataset.theme = theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
    document.querySelector('#theme-name').textContent = names[theme];
    document.title = '코딩놀이터OS, 개인홈페이지';
    document.querySelector('#theme-status').textContent = announce ? `${names[theme]} 테마가 적용되었습니다.` : '';
    try { localStorage.setItem(storageKey, theme); } catch { /* selection remains active for this visit */ }
    if (announce) {
      try { const url = new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(null,'',url.href); } catch { /* some local file contexts forbid history mutation */ }
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice)));
  applyTheme(initial, false);
})();
