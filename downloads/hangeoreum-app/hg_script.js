/* 한걸음 입문 Lv.0 — 문자 배우기 (HGSCRIPT)
   유닛마다 글자 → 그 글자로 만든 단어 순서로, 각 3회차 반복한다.
   1회차: 글자 + 한글 읽기 + 원어민 발음 / 2·3회차: 순서를 섞어 글자만 보고 읽은 뒤 정답 확인.
   진행 상태는 언어별 localStorage hg_script_<lang> = { active, unit, phase('c'|'w'), pass, done } */
(function () {
  const DATA = () => (window.HG_SCRIPT_DATA || {});
  const curLang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';
  const KEY = () => `hg_script_${curLang()}`;
  const STT_LANG = { fr: 'fr-FR', cn: 'zh-CN', ja: 'ja-JP', en: 'en-US', es: 'es-ES' };
  const PHASE_NAME = { c: '글자 익히기', w: '단어 읽기' };

  let session = null;  // { key, queue, pos, revealed, extra:{}, heard }
  let speakSeq = 0;
  let recognizer = null;

  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function langData() { return DATA()[curLang()] || null; }
  function units() { const d = langData(); return d ? d.units : []; }
  function scriptName(lang) { const d = DATA()[lang || curLang()]; return d ? d.name : '문자'; }

  function load() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch (e) {}
    return Object.assign({ active: false, unit: 0, phase: 'c', pass: 1, done: false }, st || {});
  }
  function save(st) { try { localStorage.setItem(KEY(), JSON.stringify(st)); } catch (e) {} }

  function parse(line) {
    const [c, k, s, m, p] = line.split('|');
    return { c, k: k || '', s: s || c, m: m || '', p: p || '' };
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function stateKey(st) { return `${curLang()}_${st.unit}_${st.phase}_${st.pass}`; }

  function buildSession(st) {
    const u = units()[st.unit];
    const items = (u ? u[st.phase] : []).map(parse);
    session = { key: stateKey(st), queue: st.pass === 1 ? items : shuffle(items.slice()), pos: 0, revealed: st.pass === 1, extra: {}, heard: '' };
  }

  function isActive() { return load().active === true && units().length > 0; }

  function checkinOpen() {
    const m = document.getElementById('dailyCheckinModal');
    return !!(m && !m.classList.contains('hidden'));
  }

  /* ---------- 음성 ---------- */
  function sayItem(item) {
    if (item && typeof speakTextWithFallback === 'function') speakTextWithFallback(item.s, curLang());
  }
  function exileThen(msg, item) {
    const my = ++speakSeq;
    if (checkinOpen()) return;  // 데일리 체크인 대사와 겹치지 않게
    if (typeof speakExileTutor !== 'function') { sayItem(item); return; }
    speakExileTutor(msg, 'ko', () => { if (my === speakSeq && item) setTimeout(() => { if (my === speakSeq) sayItem(item); }, 250); });
  }
  function sfx(n) { if (window.HGUX && HGUX.sfx) HGUX.sfx(n); }

  function passIntro(st) {
    const u = units()[st.unit];
    if (st.pass === 1 && st.phase === 'c') return `입문 ${st.unit + 1}단원, ${u.t}! ${u.tip} 먼저 글자와 한글 읽기를 같이 볼게. 잘 듣고 따라 읽어 봐.`;
    if (st.pass === 1) return '이번엔 방금 배운 글자로 만든 단어야. 한글과 함께 읽어 볼게.';
    if (st.pass === 2) return '좋아! 이제 한글 없이 글자만 보고 읽어 봐. 두 번째야.';
    return '마지막 세 번째! 순서를 섞었어. 글자만 보고 소리 내어 읽어 봐.';
  }

  /* ---------- 화면 ---------- */
  function injectStyle() {
    if (document.getElementById('hgScriptStyle')) return;
    const css = `
#hgScriptView{flex:1;display:flex;flex-direction:column;gap:10px}
#hgScriptView .hs-head{background:linear-gradient(135deg,#0f766e,#0e7490);color:#fff;border-radius:14px;padding:10px 12px}
#hgScriptView .hs-badge{display:inline-block;background:rgba(255,255,255,.22);border-radius:6px;padding:1px 7px;font-size:12px;font-weight:800}
#hgScriptView .hs-title{font-size:17px;font-weight:900;margin-top:4px}
#hgScriptView .hs-sub{font-size:13px;font-weight:700;opacity:.92;margin-top:2px}
#hgScriptView .hs-dots{display:flex;gap:6px;margin-top:6px}
#hgScriptView .hs-dot{flex:1;text-align:center;font-size:12px;font-weight:800;padding:3px 0;border-radius:6px;background:rgba(255,255,255,.15)}
#hgScriptView .hs-dot.on{background:#fff;color:#0f766e}
#hgScriptView .hs-dot.done{background:rgba(255,255,255,.4)}
#hgScriptView .hs-bar{height:6px;background:#e2e8f0;border-radius:4px;overflow:hidden}
#hgScriptView .hs-bar>div{height:100%;background:#14b8a6;transition:width .3s}
#hgScriptView .hs-card{background:#fff;border:2px solid #99f6e4;border-radius:18px;padding:18px 14px;text-align:center;min-height:200px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px}
#hgScriptView .hs-char{font-size:64px;font-weight:900;color:#0f172a;line-height:1.15;word-break:keep-all}
#hgScriptView .hs-char.long{font-size:40px}
#hgScriptView .hs-p{font-size:18px;font-weight:800;color:#0e7490}
#hgScriptView .hs-k{font-size:24px;font-weight:900;color:#be185d}
#hgScriptView .hs-m{font-size:16px;font-weight:700;color:#334155}
#hgScriptView .hs-hide{font-size:15px;font-weight:800;color:#64748b}
#hgScriptView .hs-heard{font-size:14px;font-weight:700;color:#475569}
#hgScriptView .hs-row{display:flex;gap:8px}
#hgScriptView .hs-btn{flex:1;border:none;border-radius:12px;padding:13px 6px;font-size:16px;font-weight:900;cursor:pointer;color:#fff;background:#14b8a6;box-shadow:0 3px 0 #0f766e}
#hgScriptView .hs-btn.gray{background:#e2e8f0;color:#1e293b;box-shadow:0 3px 0 #cbd5e1}
#hgScriptView .hs-btn.pink{background:#f43f5e;box-shadow:0 3px 0 #be123c}
#hgScriptView .hs-btn.blue{background:#6366f1;box-shadow:0 3px 0 #4338ca}
#hgScriptView .hs-skip{background:none;border:none;color:#64748b;font-size:13px;font-weight:700;text-decoration:underline;cursor:pointer;align-self:center}`;
    const el = document.createElement('style');
    el.id = 'hgScriptStyle';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function ensureView() {
    let v = document.getElementById('hgScriptView');
    if (v) return v;
    injectStyle();
    const drill = document.getElementById('viewDrill');
    if (!drill || !drill.parentNode) return null;
    v = document.createElement('div');
    v.id = 'hgScriptView';
    drill.parentNode.insertBefore(v, drill);
    return v;
  }

  function sttAvailable() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }

  function render() {
    const v = ensureView();
    if (!v) return;
    const st = load();
    const us = units();
    const u = us[st.unit];
    if (!u) return;
    const item = session.queue[session.pos];
    const total = session.queue.length;
    const showAll = st.pass === 1 || session.revealed;
    const dots = [1, 2, 3].map(n => `<div class="hs-dot ${n === st.pass ? 'on' : (n < st.pass ? 'done' : '')}">${n}회차 ${n === 1 ? '한글과 함께' : '글자만'}</div>`).join('');
    let card = `<div class="hs-char ${item.c.length > 4 ? 'long' : ''}">${esc(item.c)}</div>`;
    if (showAll) {
      if (item.p) card += `<div class="hs-p">${esc(item.p)}</div>`;
      card += `<div class="hs-k">${esc(item.k)}</div>`;
      if (item.m) card += `<div class="hs-m">뜻: ${esc(item.m)}</div>`;
    } else {
      card += `<div class="hs-hide">🤔 한글 없이 소리 내어 읽어 보세요</div>`;
    }
    if (session.heard) card += `<div class="hs-heard">${session.heard}</div>`;

    let btns;
    const mic = sttAvailable() ? `<button class="hs-btn blue" onclick="HGSCRIPT.listen()">🎙️ 읽어 보기</button>` : '';
    if (st.pass === 1) {
      btns = `<div class="hs-row"><button class="hs-btn gray" onclick="HGSCRIPT.replay()">🔊 다시 듣기</button>${mic}</div>
        <div class="hs-row"><button class="hs-btn" onclick="HGSCRIPT.next()">다음 ➔</button></div>`;
    } else if (!session.revealed) {
      btns = `<div class="hs-row">${mic}<button class="hs-btn" onclick="HGSCRIPT.reveal()">👀 정답 확인</button></div>`;
    } else {
      btns = `<div class="hs-row"><button class="hs-btn gray" onclick="HGSCRIPT.replay()">🔊 다시 듣기</button></div>
        <div class="hs-row"><button class="hs-btn pink" onclick="HGSCRIPT.mark(false)">🔁 헷갈려요</button><button class="hs-btn" onclick="HGSCRIPT.mark(true)">✅ 맞췄어요</button></div>`;
    }

    v.innerHTML = `
      <div class="hs-head">
        <span class="hs-badge">🔤 입문 Lv.0 · ${esc(scriptName())}</span>
        <div class="hs-title">${st.unit + 1}/${us.length}단원 · ${esc(u.t)}</div>
        <div class="hs-sub">${PHASE_NAME[st.phase]} · ${session.pos + 1}/${total}</div>
        <div class="hs-dots">${dots}</div>
      </div>
      <div class="hs-bar"><div style="width:${Math.round((session.pos / total) * 100)}%"></div></div>
      <div class="hs-card">${card}</div>
      ${btns}
      <button class="hs-skip" onclick="HGSCRIPT.skipToLevel1()">문자는 이미 읽을 수 있어요 → Lv.1로 건너뛰기</button>`;
  }

  function syncHeader(st) {
    const lv = document.getElementById('currentLevelText');
    if (lv) lv.textContent = 'Lv. 0';
    const tn = document.getElementById('tierNameText');
    if (tn) tn.textContent = `입문: 문자 배우기 · ${st.unit + 1}/${units().length}단원`;
    const b = document.getElementById('quickTier0');
    if (b) { b.style.background = '#14b8a6'; b.style.color = '#fff'; }
  }

  /* ---------- 진행 ---------- */
  function show() {
    const st = load();
    if (!st.active) return;
    if (st.unit >= units().length) { finishAll(); return; }
    ['viewDrill', 'viewRoleplay'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    const v = ensureView();
    if (v) v.style.display = '';
    syncHeader(st);
    const fresh = !session || session.key !== stateKey(st);
    if (fresh) buildSession(st);
    render();
    if (fresh || session.needVoice) {
      session.needVoice = checkinOpen();
      exileThen(passIntro(st), st.pass === 1 ? session.queue[0] : null);
    }
  }

  function hide() {
    const v = document.getElementById('hgScriptView');
    if (v) v.style.display = 'none';
    const b = document.getElementById('quickTier0');
    if (b) { b.style.background = 'rgba(20,184,166,0.1)'; b.style.color = '#0f766e'; }
    stopListen();
  }

  function start() {
    const st = load();
    if (st.done) Object.assign(st, { unit: 0, phase: 'c', pass: 1, done: false });
    st.active = true;
    save(st);
    session = null;
    if (typeof updateLevelUI === 'function') updateLevelUI(); else show();
  }

  function leave() {
    const st = load();
    if (st.active) { st.active = false; save(st); }
    session = null;
    speakSeq++;
    hide();
  }

  function replay() { sfx('bubble'); speakSeq++; sayItem(session && session.queue[session.pos]); }

  function reveal() {
    if (!session) return;
    session.revealed = true;
    sfx('sparkle');
    render();
    speakSeq++;
    sayItem(session.queue[session.pos]);
  }

  function mark(ok) {
    if (!session) return;
    const item = session.queue[session.pos];
    if (!ok) {
      sfx('boing');
      const n = session.extra[item.c] || 0;
      if (n < 2) { session.extra[item.c] = n + 1; session.queue.push(item); }  // 헷갈린 글자는 이번 회차 끝에 한 번 더
    } else sfx('coin8');
    next();
  }

  function next() {
    if (!session) return;
    stopListen();
    const st = load();
    session.pos++;
    session.heard = '';
    session.revealed = st.pass === 1;
    if (session.pos < session.queue.length) {
      if (st.pass === 1) sfx('bubble');
      render();
      speakSeq++;
      if (st.pass === 1) sayItem(session.queue[session.pos]);
      return;
    }
    passDone(st);
  }

  function passDone(st) {
    if (st.pass < 3) {
      st.pass++;
    } else if (st.phase === 'c') {
      st.phase = 'w'; st.pass = 1;
      sfx('chirp');
    } else {
      unitDone(st);
      return;
    }
    save(st);
    show();
  }

  function unitDone(st) {
    const u = units()[st.unit];
    st.unit++; st.phase = 'c'; st.pass = 1;
    save(st);
    if (st.unit >= units().length) { finishAll(); return; }
    sfx('fanfare');
    if (window.HGUX && HGUX.celebrate) HGUX.celebrate(`🔤 ${u.t} 완료!`, '글자도 단어도 세 번씩 읽었어요. 다음 단원으로!', false);
    session = null;
    setTimeout(() => { if (isActive()) show(); }, 900);
  }

  function enterLevel1() {
    session = null;
    speakSeq++;
    hide();
    currentLevel = 1;
    currentRound = 1;
    roundPassed = [false, false, false, false];
    try { localStorage.setItem('hangeoreum_level', '1'); } catch (e) {}
    const sl = document.getElementById('levelSlider');
    if (sl) sl.value = 1;
    if (typeof initOrGetSessionCase === 'function') initOrGetSessionCase(currentTheme, curLang(), 1, true);
    if (typeof updateLevelUI === 'function') updateLevelUI();
  }

  function finishAll() {
    const st = load();
    Object.assign(st, { active: false, done: true, unit: 0, phase: 'c', pass: 1 });
    save(st);
    sfx('fanfare');
    const name = (typeof userName !== 'undefined' && userName) ? userName : '지구인';
    const msg = `대단해 ${name}! ${scriptName()}를 모두 읽을 수 있게 됐어. 이제 Lv.1부터 진짜 문장을 배워 보자!`;
    if (window.HGUX && HGUX.celebrate) HGUX.celebrate('🎓 문자 입문 완료!', msg, true);
    enterLevel1();
    // enterLevel1이 레벨 1 문장을 읽기 시작하므로 축하 대사는 그 뒤에 덮어쓰지 않도록 짧게 앞서 말한다
    if (typeof speakExileTutor === 'function') setTimeout(() => speakExileTutor(msg, 'ko'), 300);
  }

  function skipToLevel1() {
    sfx('whoosh');
    leave();
    enterLevel1();
  }

  /* ---------- 읽어 보기 (음성 인식, 선택) ---------- */
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s.,!?¡¿'"·\-_ー~()（）、。，！？]/g, '');

  function stopListen() {
    if (recognizer) { try { recognizer.abort(); } catch (e) {} recognizer = null; }
    try { isRecordingSTT = false; } catch (e) {}
  }

  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !session) return;
    stopListen();
    speakSeq++;
    if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio();
    const item = session.queue[session.pos];
    const r = new SR();
    recognizer = r;
    r.lang = STT_LANG[curLang()] || 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onstart = () => { try { isRecordingSTT = true; } catch (e) {} sfx('zap'); };
    r.onresult = (ev) => {
      const alts = Array.from(ev.results[0] || []).map(a => a.transcript || '');
      const heard = alts[0] || '';
      const targets = [item.s, item.c, item.p].map(norm).filter(Boolean);
      const hit = alts.some(a => { const n = norm(a); return n && targets.some(t => n.includes(t) || t.includes(n)); });
      session.heard = hit ? `🎯 정확해요! (들린 소리: ${esc(heard)})` : `👂 들린 소리: "${esc(heard)}" — 정답과 비교해 보세요`;
      if (hit) sfx('sparkle'); else sfx('oops');
      session.revealed = true;
      render();
      sayItem(item);
    };
    r.onerror = () => { session.heard = '🎙️ 소리를 못 들었어요. 다시 해 보거나 정답 확인을 눌러 주세요.'; render(); };
    r.onend = () => { try { isRecordingSTT = false; } catch (e) {} recognizer = null; };
    try { r.start(); } catch (e) { recognizer = null; }
  }

  window.HGSCRIPT = { scriptName, units, isActive, show, hide, start, leave, next, replay, reveal, mark, listen, skipToLevel1, load, save };
})();
