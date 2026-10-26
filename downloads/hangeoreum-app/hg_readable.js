/* 한걸음 시인성 보강 (HGREADABLE)
   화면 곳곳에 글자 크기가 px로 직접 적혀 있어서 CSS 한 줄로는 키울 수 없다.
   그래서 화면에 새 글자가 그려질 때마다 한 번씩 글자 크기를 조금 키운다.
   - 15px 미만: +2px (최소 14px) / 15~22px: +1px / 그보다 큰 제목·글자 카드는 그대로
   - 한 요소는 한 번만 키운다(data-hg-fs에 원래 크기 기록) — 다시 그려진 요소만 새로 처리
   폰 너비에 따른 배치는 hg_readable.css의 미디어 쿼리가 맡는다. */
(function () {
  const ROOTS = '#viewCanvas, #viewOnboarding, #openingSplashView, .modal-sheet, #hgCelebrate';
  const SKIP = 'svg, svg *, canvas, script, style, #hgSpeakWave, #hgSpeakWave *';

  function grow(px) {
    if (px < 15) return Math.max(14, px + 2);
    if (px <= 22) return px + 1;
    return px;
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
        const boosted = el.parentElement && el.parentElement.closest('[data-hg-fs]');
        if (boosted && !el.style.fontSize && px === parseFloat(getComputedStyle(el.parentElement).fontSize) && px !== parseFloat(boosted.dataset.hgFs)) {
          el.dataset.hgFs = boosted.dataset.hgFs;
          continue;
        }
        plan.push([el, px]);
      }
      for (const [el, px] of plan) {
        el.dataset.hgFs = String(px);
        const to = grow(px);
        if (to !== px) el.style.setProperty('font-size', to + 'px', 'important');
      }
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; boost(); });
  }

  function init() {
    boost();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.HGREADABLE = { boost };
})();
