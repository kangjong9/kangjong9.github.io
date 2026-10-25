/* 한걸음 UX 보강: 개성 효과음 · 말하는 동안 파동 애니메이션 · 레벨업 축하 카드 · 가독성 보정
 * window.HGUX 로 노출. index.html 전역(getSoundConfig, isRecordingSTT 등)은 함수 안에서만 참조한다. */
(function () {
  'use strict';

  // ---------------------------------------------------------------- 효과음
  const SFX = {
    bubble: '물방울 톡', popcorn: '팝콘 톡톡', boing: '통통 스프링', sparkle: '반짝 별가루',
    coin8: '8비트 코인', chirp: '새 지저귐', marimba: '마림바 똑딱', zap: '우주 레이저',
    whoosh: '휙 바람', fanfare: '8비트 팡파르', oops: '앗! 하강음', dingdong: '딩동'
  };

  function sfx(name, volMul = 1) {
    try {
      const cfg = typeof getSoundConfig === 'function' ? getSoundConfig() : { masterEnabled: true, masterVolume: 80 };
      if (!cfg.masterEnabled || !SFX[name]) return;
      const a = new Audio(`./sounds/sfx_${name}.wav`);
      a.volume = Math.max(0, Math.min(1, (cfg.masterVolume / 100) * 0.8 * volMul));
      a.play().catch(() => {});
    } catch (e) {}
  }

  // ---------------------------------------------------------------- 말하는 동안 파동
  let waveEl = null;
  function ensureWave() {
    if (waveEl) return waveEl;
    waveEl = document.createElement('div');
    waveEl.id = 'hgSpeakWave';
    waveEl.innerHTML = `
      <div class="hgw-ring"></div><div class="hgw-ring d2"></div><div class="hgw-ring d3"></div>
      <div class="hgw-core">🎙️</div>
      <div class="hgw-bars">${'<i></i>'.repeat(9)}</div>
      <div class="hgw-label">지금 말하세요!</div>`;
    document.body.appendChild(waveEl);
    return waveEl;
  }
  function isListening() {
    try {
      return (typeof isRecordingSTT !== 'undefined' && isRecordingSTT) ||
             (typeof isRoleplayRecording !== 'undefined' && isRoleplayRecording);
    } catch (e) { return false; }
  }
  let lastOn = false;
  setInterval(() => {
    const on = isListening();
    if (on === lastOn) return;
    lastOn = on;
    ensureWave().classList.toggle('on', on);
  }, 120);

  // ---------------------------------------------------------------- 레벨업·세트 축하
  const CHEERS = [
    (n, lv) => `${n}! Lv.${lv} 승급 축하해! 네 목소리가 점점 원어민처럼 들려. 이대로 쭉 가자!`,
    (n, lv) => `와, Lv.${lv}이야! ${n} 덕분에 안드로메다가 한 걸음 더 가까워졌어. 정말 자랑스러워!`,
    (n, lv) => `Lv.${lv} 달성! 어제의 ${n}보다 오늘의 ${n}가 확실히 더 강해. 오늘도 멋졌어!`,
    (n, lv) => `축하해 ${n}! Lv.${lv}부터는 조금 더 어려워지지만, 넌 이미 충분히 해낼 수 있어.`,
    (n, lv) => `대단해! Lv.${lv} 돌파! 틀려도 괜찮아, 계속 입 밖으로 내는 사람이 결국 이겨. 응원할게!`,
    (n, lv) => `Lv.${lv} 승급! ${n}, 꾸준함이 최고의 재능이야. 다음 장면도 함께 가 보자!`
  ];
  const BAND_CHEERS = {
    11: '이제 단어를 넘어 문장의 세계로! 기본 문장 구간에 들어왔어.',
    21: '과거와 미래까지 말할 수 있는 단계야. 이야기가 훨씬 풍부해질 거야.',
    31: '실전 의사소통 구간! 이제 현지에서 부탁하고 따질 수도 있어.',
    41: '마지막 고급 뉘앙스 구간이야. 여기만 넘으면 안드로메다 귀환이 눈앞이야!'
  };
  const SET_CHEERS = ['좋아, 리듬 탔어!', '완벽한 흐름이야!', '발음이 또렷해지고 있어!', '이 페이스 최고야!'];

  function userName_() { return (typeof userName !== 'undefined' && userName) ? userName : '지구인 친구'; }

  function levelUpMessage(lv) {
    const base = CHEERS[Math.floor(Math.random() * CHEERS.length)](userName_(), lv);
    return BAND_CHEERS[lv] ? `${base} ${BAND_CHEERS[lv]}` : base;
  }
  function setDoneMessage(k, nk, title) {
    return `세트 ${k} 완료! ${SET_CHEERS[(k - 1) % SET_CHEERS.length]} 이어서 세트 ${nk}, "${title}"로 넘어갈게.`;
  }

  function celebrate(title, msg, big = false) {
    sfx(big ? 'fanfare' : 'sparkle');
    if (big) setTimeout(() => sfx('sparkle', 0.7), 450);
    document.getElementById('hgCelebrate')?.remove();
    const el = document.createElement('div');
    el.id = 'hgCelebrate';
    const bits = Array.from({ length: big ? 26 : 12 }, (_, i) =>
      `<i style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * 0.5).toFixed(2)}s;background:${['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'][i % 5]}"></i>`).join('');
    el.innerHTML = `<div class="hgc-confetti">${bits}</div>
      <div class="hgc-card${big ? ' big' : ''}"><div class="hgc-title">${title}</div><div class="hgc-msg">${msg}</div></div>`;
    el.onclick = () => el.remove();
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), big ? 4200 : 2400);
    setTimeout(() => el.remove(), big ? 4800 : 3000);
  }

  // ---------------------------------------------------------------- 가독성 보정 (작은 인라인 글씨·흐린 회색)
  const FAINT = { '#94a3b8': '#475569', '#a1a1aa': '#52525b', '#cbd5e1': '#64748b', '#9ca3af': '#4b5563', '#64748b': '#334155' };
  const LIGHT_SCOPES = '#viewCanvas, #viewOnboarding, .modal-sheet';
  function boost(root) {
    if (!root || !root.querySelectorAll) return;
    const list = [root, ...root.querySelectorAll('[style]')];
    for (const el of list) {
      if (!el.style || el.dataset.hgr) continue;
      const fs = parseFloat(el.style.fontSize);
      if (fs && fs < 13.5) el.style.fontSize = (fs < 11 ? fs + 2.5 : fs + 1.5) + 'px';
      const c = (el.getAttribute('style') || '').match(/(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{6})/);
      if (c && FAINT[c[1].toLowerCase()] && el.closest(LIGHT_SCOPES)) el.style.color = FAINT[c[1].toLowerCase()];
      el.dataset.hgr = '1';
    }
  }
  function initReadable() {
    boost(document.body);
    new MutationObserver(ms => {
      for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) boost(n);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReadable);
  else initReadable();

  window.HGUX = { SFX, sfx, celebrate, levelUpMessage, setDoneMessage, isListening, _boost: boost };
})();
