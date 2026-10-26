/* 한걸음 시인성 보강 (HGREADABLE)
   화면 곳곳에 글자 크기가 px로 직접 적혀 있어서 CSS 한 줄로는 키울 수 없다.
   그래서 화면에 새 글자가 그려질 때마다 한 번씩 글자 크기를 조금 키운다.
   - 15px 미만: +2px (최소 14px) / 15~22px: +1px / 그보다 큰 제목·글자 카드는 그대로
   - 여기에 글자 크기 단계(보통 1.0 / 크게 1.12 / 아주 크게 1.25)를 곱한다. 본문(22px 이하)은 그대로 곱하고,
     제목(23~40px)은 절반만, 큰 글자 카드·이모지(40px 초과)는 키우지 않는다(화면 넘침 방지).
   - 앱은 WebView 배율을 100%로 고정하므로(MainActivity setTextZoom) 폰마다 글자가 제각각 커지지 않는다.
     첫 실행 단계는 폰의 시스템 글자 크기(Native displayInfo.fontScale)를 보고 고르고, 설정 창에서 바꿀 수 있다.
   - 한 요소는 원래 크기(data-hg-fs)를 한 번만 기록한다 — 단계를 바꾸면 기록된 원래 크기로 다시 계산
   폰 너비에 따른 배치는 hg_readable.css의 미디어 쿼리가 맡는다. */
(function () {
  const ROOTS = '#viewCanvas, #viewOnboarding, #openingSplashView, .modal-sheet, #hgCelebrate, .hgl-ov';
  const SKIP = 'svg, svg *, canvas, script, style, #hgSpeakWave, #hgSpeakWave *, #hgTextSizeRow, #hgTextSizeRow *';
  const LEVELS = { normal: ['보통', 1], large: ['크게', 1.12], xlarge: ['아주 크게', 1.25] };
  const KEY = 'hg_text_size';

  function nativeFontScale() {
    try {
      if (window.Native && Native.call) return JSON.parse(Native.call('displayInfo', '{}')).fontScale || 1;
    } catch (e) {}
    return 1;
  }
  function initialLevel() {
    try { const v = localStorage.getItem(KEY); if (LEVELS[v]) return v; } catch (e) {}
    const fs = nativeFontScale();
    return fs >= 1.25 ? 'xlarge' : fs >= 1.1 ? 'large' : 'normal';
  }
  let level = initialLevel();

  function grow(px) {
    const k = LEVELS[level][1];
    let to = px < 15 ? Math.max(14, px + 2) : px <= 22 ? px + 1 : px;
    if (px <= 22) to *= k; else if (px <= 40) to *= 1 + (k - 1) / 2;
    return Math.round(to * 2) / 2;
  }

  function apply(el) {
    const px = parseFloat(el.dataset.hgFs);
    const to = grow(px);
    if (to !== px) el.style.setProperty('font-size', to + 'px', 'important');
    else if (el.dataset.hgSet) el.style.removeProperty('font-size');
    if (to !== px) el.dataset.hgSet = '1';
  }

  function boost(scope) {
    const roots = scope ? [scope] : document.querySelectorAll(ROOTS);
    roots.forEach(root => {
      if (!root || !root.querySelectorAll) return;
      const els = [root, ...root.querySelectorAll('*')];
      // 먼저 원래 크기를 모두 읽고 나서 한꺼번에 바꾼다 (부모를 키운 뒤 자식을 읽으면 두 번 커지므로)
      const plan = [];
      for (const el of els) {
        if (el.dataset.hgFs || el.matches(SKIP)) continue;
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName)) continue;
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (!px) continue;
        // 이미 키운 부모에게서 크기를 물려받은 경우(새로 그려진 자식)는 그대로 둔다
        const boosted = el.parentElement && el.parentElement.closest('[data-hg-own]');
        if (boosted && !el.style.fontSize && px === parseFloat(getComputedStyle(el.parentElement).fontSize) && px !== parseFloat(boosted.dataset.hgFs)) {
          el.dataset.hgFs = boosted.dataset.hgFs;
          continue;
        }
        plan.push([el, px]);
      }
      for (const [el, px] of plan) {
        el.dataset.hgFs = String(px);
        el.dataset.hgOwn = '1';
        apply(el);
      }
    });
  }

  function setLevel(v) {
    if (!LEVELS[v] || v === level) return;
    level = v;
    try { localStorage.setItem(KEY, v); } catch (e) {}
    document.documentElement.dataset.hgSize = v;
    document.querySelectorAll('[data-hg-own]').forEach(apply);
    syncRow();
  }

  // 설정 창(⚙️) 맨 위에 '글자 크기' 줄을 넣는다
  function syncRow() {
    document.querySelectorAll('#hgTextSizeRow button').forEach(b => {
      const on = b.dataset.v === level;
      b.style.background = on ? '#4f46e5' : '#fff';
      b.style.color = on ? '#fff' : '#334155';
      b.style.borderColor = on ? '#4f46e5' : '#cbd5e1';
    });
  }
  function injectRow() {
    const sheet = document.querySelector('#settingsModal .modal-sheet');
    if (!sheet || document.getElementById('hgTextSizeRow')) return;
    const row = document.createElement('div');
    row.id = 'hgTextSizeRow';
    row.style.cssText = 'margin:0 0 16px; padding:12px; border:1.5px solid #c7d2fe; border-radius:14px; background:#eef2ff;';
    row.innerHTML = '<div style="font-size:16px; font-weight:900; color:#1e1b4b; margin-bottom:8px;">🔠 글자 크기</div>'
      + '<div style="display:flex; gap:6px;">' + Object.keys(LEVELS).map(v =>
        `<button type="button" data-v="${v}" style="flex:1; padding:10px 4px; border:2px solid #cbd5e1; border-radius:10px; font-weight:900; cursor:pointer; white-space:nowrap; font-size:${[15, 17, 19][Object.keys(LEVELS).indexOf(v)]}px !important;">${LEVELS[v][0]}</button>`).join('')
      + '</div>';
    row.addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b) setLevel(b.dataset.v); });
    const head = sheet.firstElementChild;
    head ? head.after(row) : sheet.prepend(row);
    syncRow();
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; boost(); });
  }

  function init() {
    // 설치된 앱(태블릿·폴더블 포함)에서는 웹 체험판용 폰 모양 테두리를 빼고 화면 폭에 맞춘다
    if (window.Native) document.documentElement.classList.add('hg-app');
    document.documentElement.dataset.hgSize = level;  // hg_readable.css가 큰 글자 단계에서 촘촘한 줄을 2단으로 바꾼다
    injectRow();
    boost();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.HGREADABLE = { boost, setLevel, get level() { return level; } };
})();
