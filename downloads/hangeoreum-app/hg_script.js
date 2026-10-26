/* 한걸음 입문 Lv.0 — 문자 배우기 (HGSCRIPT)
   유닛마다 글자 → 그 글자로 만든 단어 순서로, 각 3회차 반복한다.
   1회차: 글자(원어) + 한글 읽기 + 그림①, 엑자일이 읽음 → 사용자가 따라 읽음 → 발음 판정 → 통과면 다음, 실패면 같은 글자 1회차 반복
   2회차: 글자(원어만) + 다른 그림②, 엑자일이 읽음 → 따라 읽기 → 판정 (실패 시 반복)
   3회차: 글자(원어만) + 또 다른 그림③, 엑자일은 읽지 않고 바로 사용자 입력 → 판정 (실패 시 반복)
   그림은 script_pics.js(HG_SCRIPT_PICS)의 "그 글자가 쓰인 대표 단어" 그림이다.
   진행 상태는 언어별 localStorage hg_script_<lang> = { active, unit, phase('c'|'w'), pass, done, order, pos }
   order·pos는 이어하기용(종료 후 다음 실행 때 같은 글자부터). */
(function () {
  const DATA = () => (window.HG_SCRIPT_DATA || {});
  const PICS = () => (window.HG_SCRIPT_PICS || {});
  const curLang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';
  const KEY = () => `hg_script_${curLang()}`;
  const STT_LANG = { fr: 'fr-FR', cn: 'zh-CN', ja: 'ja-JP', en: 'en-US', es: 'es-ES' };
  const PHASE_NAME = { c: '글자 익히기', w: '단어 읽기' };
  const PASS_NAME = { 1: '원어+한글 · 엑자일 시범', 2: '원어만 · 엑자일 시범', 3: '원어만 · 혼자 읽기' };
  const MAX_AUTO_RETRY = 3;  // 같은 글자 연속 실패가 이만큼이면 자동 반복을 멈추고 다시/넘어가기를 고르게 한다

  let session = null;  // { key, queue, pos, status, heard, fails, paused }
  let speakSeq = 0;
  let recognizer = null;
  let flowTimer = null;

  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function langData() { return DATA()[curLang()] || null; }
  function units() { const d = langData(); return d ? d.units : []; }
  function scriptName(lang) { const d = DATA()[lang || curLang()]; return d ? d.name : '문자'; }

  function load() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch (e) {}
    return Object.assign({ active: false, unit: 0, phase: 'c', pass: 1, done: false, order: null, pos: 0 }, st || {});
  }
  function save(st) { try { localStorage.setItem(KEY(), JSON.stringify(st)); } catch (e) {} }

  function parse(line) {
    const [c, k, s, m, p] = line.split('|');
    return { c, k: k || '', s: s || c, m: m || '', p: p || '' };
  }

  /* 회차별 그림: 글자는 서로 다른 그림 3개, 단어는 그 단어 그림 하나 */
  function pictures(item, phase) {
    const lp = PICS()[curLang()] || {};
    if (phase === 'w') {
      const e = (lp.w || {})[item.c];
      return e ? [{ e, w: '', m: '' }] : [];
    }
    const raw = (lp.c || {})[`${item.c}#${item.s}`] || (lp.c || {})[item.c] || '';
    return raw ? raw.split(';').map(x => { const [e, w, m] = x.split('|'); return { e, w: w || '', m: m || '' }; }) : [];
  }
  function pictureFor(item, phase, pass) {
    const ps = pictures(item, phase);
    return ps.length ? ps[(pass - 1) % ps.length] : null;
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function stateKey(st) { return `${curLang()}_${st.unit}_${st.phase}_${st.pass}`; }

  function buildSession(st) {
    const u = units()[st.unit];
    const items = (u ? u[st.phase] : []).map(parse);
    // 저장된 순서가 이 회차 것이면 그대로 이어서, 아니면 새로 (2·3회차는 섞기)
    let order = Array.isArray(st.order) && st.order.length === items.length && st.orderKey === stateKey(st) ? st.order : null;
    if (!order) {
      order = items.map((_, i) => i);
      if (st.pass > 1) shuffle(order);
      st.order = order; st.orderKey = stateKey(st); st.pos = 0;
      save(st);
    }
    const pos = Math.min(Math.max(0, st.pos || 0), items.length - 1);
    session = { key: stateKey(st), queue: order.map(i => items[i]), pos, status: '', heard: '', fails: 0, paused: false };
  }
  function savePos() {
    const st = load();
    if (session && st.orderKey === session.key) { st.pos = session.pos; save(st); }
  }

  function isActive() { return load().active === true && units().length > 0; }

  function checkinOpen() {
    const m = document.getElementById('dailyCheckinModal');
    return !!(m && !m.classList.contains('hidden'));
  }

  /* ---------- 음성 ---------- */
  function sayItem(item, onDone) {
    // 완료 신호가 오지 않는 엔진이 있어도 멈추지 않게 안전 타이머를 두고, 둘 중 먼저 온 것 한 번만 처리
    let fired = false;
    const once = () => { if (fired) return; fired = true; clearTimeout(guard); if (onDone) onDone(); };
    const guard = setTimeout(once, 8000 + String(item && item.s || '').length * 300);
    if (item && typeof speakTextWithFallback === 'function') speakTextWithFallback(item.s, curLang(), { onDone: once });
    else setTimeout(once, 300);
  }
  function exileSay(msg, onDone) {
    let fired = false;
    const once = () => { if (fired) return; fired = true; clearTimeout(guard); onDone(); };
    const guard = setTimeout(once, 8000 + msg.length * 250);
    if (typeof speakExileTutor === 'function') speakExileTutor(msg, 'ko', once); else once();
  }
  function sfx(n) { if (window.HGUX && HGUX.sfx) HGUX.sfx(n); }
  function clearFlow() { if (flowTimer) { clearTimeout(flowTimer); flowTimer = null; } }

  function passIntro(st) {
    const u = units()[st.unit];
    if (st.pass === 1 && st.phase === 'c') return `입문 ${st.unit + 1}단원, ${u.t}! ${u.tip} 내가 먼저 읽으면, 삐 소리 뒤에 따라 읽어 봐.`;
    if (st.pass === 1) return '이번엔 방금 배운 글자로 만든 단어야. 내가 먼저 읽으면 삐 소리 뒤에 따라 읽어 봐.';
    if (st.pass === 2) return '두 번째! 이번엔 한글 없이 글자만 보여 줄게. 내 소리를 듣고 따라 읽어 봐.';
    return '마지막 세 번째! 이번엔 내가 읽어 주지 않아. 삐 소리가 나면 글자를 보고 혼자 읽어 봐.';
  }

  /* ---------- 화면 ---------- */
  function injectStyle() {
    if (document.getElementById('hgScriptStyle')) return;
    const css = `
#hgScriptView{flex:1;display:flex;flex-direction:column;gap:clamp(8px,2.2vw,12px)}
#hgScriptView .hs-head{background:linear-gradient(135deg,#0f766e,#0e7490);color:#fff;border-radius:16px;padding:12px 14px}
#hgScriptView .hs-badge{display:inline-block;background:rgba(255,255,255,.22);border-radius:6px;padding:2px 8px;font-size:14px;font-weight:800}
#hgScriptView .hs-title{font-size:clamp(18px,5vw,22px);font-weight:900;margin-top:4px}
#hgScriptView .hs-sub{font-size:15px;font-weight:700;opacity:.95;margin-top:2px}
#hgScriptView .hs-dots{display:flex;gap:6px;margin-top:8px}
#hgScriptView .hs-dot{flex:1;text-align:center;font-size:clamp(12px,3.3vw,14px);font-weight:800;padding:4px 2px;border-radius:7px;background:rgba(255,255,255,.15);line-height:1.3}
#hgScriptView .hs-dot.on{background:#fff;color:#0f766e}
#hgScriptView .hs-dot.done{background:rgba(255,255,255,.4)}
#hgScriptView .hs-bar{height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden}
#hgScriptView .hs-bar>div{height:100%;background:#14b8a6;transition:width .3s}
#hgScriptView .hs-card{background:#fff;border:2px solid #99f6e4;border-radius:20px;padding:clamp(14px,4vw,22px) 14px;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px}
#hgScriptView .hs-char{font-size:clamp(64px,22vw,96px);font-weight:900;color:#0f172a;line-height:1.1;word-break:keep-all}
#hgScriptView .hs-char.long{font-size:clamp(40px,12vw,58px)}
#hgScriptView .hs-p{font-size:clamp(18px,5vw,22px);font-weight:800;color:#0e7490}
#hgScriptView .hs-k{font-size:clamp(24px,7vw,30px);font-weight:900;color:#be185d}
#hgScriptView .hs-m{font-size:18px;font-weight:700;color:#334155}
#hgScriptView .hs-pic{display:flex;align-items:center;justify-content:center;gap:12px;background:#f0fdfa;border-radius:16px;padding:8px 16px;margin-top:4px;max-width:100%}
#hgScriptView .hs-pic-e{font-size:clamp(52px,16vw,72px);line-height:1}
#hgScriptView .hs-pic-w{font-size:clamp(20px,6vw,26px);font-weight:900;color:#0f172a;word-break:keep-all}
#hgScriptView .hs-pic-m{font-size:16px;font-weight:700;color:#475569}
#hgScriptView .hs-status{font-size:clamp(16px,4.6vw,19px);font-weight:900;color:#0f766e;min-height:1.5em}
#hgScriptView .hs-status.ok{color:#16a34a}
#hgScriptView .hs-status.ng{color:#e11d48}
#hgScriptView .hs-heard{font-size:16px;font-weight:700;color:#475569}
#hgScriptView .hs-row{display:flex;gap:8px}
#hgScriptView .hs-btn{flex:1;border:none;border-radius:14px;padding:15px 6px;font-size:clamp(16px,4.6vw,18px);font-weight:900;cursor:pointer;color:#fff;background:#14b8a6;box-shadow:0 3px 0 #0f766e}
#hgScriptView .hs-btn.gray{background:#e2e8f0;color:#1e293b;box-shadow:0 3px 0 #cbd5e1}
#hgScriptView .hs-btn.blue{background:#6366f1;box-shadow:0 3px 0 #4338ca}
#hgScriptView .hs-skip{background:none;border:none;color:#64748b;font-size:15px;font-weight:700;text-decoration:underline;cursor:pointer;align-self:center;padding:6px}`;
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
    if (!v || !session) return;
    const st = load();
    const us = units();
    const u = us[st.unit];
    if (!u) return;
    const item = session.queue[session.pos];
    const total = session.queue.length;
    const dots = [1, 2, 3].map(n => `<div class="hs-dot ${n === st.pass ? 'on' : (n < st.pass ? 'done' : '')}">${n}회차<br>${PASS_NAME[n]}</div>`).join('');
    let card = `<div class="hs-char ${item.c.length > 4 ? 'long' : ''}">${esc(item.c)}</div>`;
    // 보조 표기(중국어 한자·병음, 영어 예시 단어)는 그 언어의 문자이므로 모든 회차에 보인다. 한글은 1회차만.
    if (item.p) card += `<div class="hs-p">${esc(item.p)}</div>`;
    if (st.pass === 1) {
      card += `<div class="hs-k">${esc(item.k)}</div>`;
      if (item.m) card += `<div class="hs-m">뜻: ${esc(item.m)}</div>`;
    }
    const pic = pictureFor(item, st.phase, st.pass);
    if (pic) {
      card += `<div class="hs-pic"><span class="hs-pic-e" aria-hidden="true">${pic.e}</span>`;
      if (pic.w) card += `<span><div class="hs-pic-w">${esc(pic.w)}</div>${st.pass === 1 && pic.m ? `<div class="hs-pic-m">${esc(pic.m)}</div>` : ''}</span>`;
      card += `</div>`;
    }
    const cls = /^🎯/.test(session.status) ? 'ok' : (/^❌/.test(session.status) ? 'ng' : '');
    card += `<div class="hs-status ${cls}" data-hs-status>${session.status}</div>`;
    if (session.heard) card += `<div class="hs-heard">${session.heard}</div>`;

    let btns;
    if (session.paused === 'self') {
      // 음성인식이 없는 환경: 스스로 확인
      btns = `<div class="hs-row"><button class="hs-btn gray" onclick="HGSCRIPT.retry()">🔁 다시 듣기</button><button class="hs-btn" onclick="HGSCRIPT.pass()">✅ 따라 읽었어요</button></div>`;
    } else if (session.paused) {
      btns = `<div class="hs-row"><button class="hs-btn blue" onclick="HGSCRIPT.retry()">🔁 다시 하기</button><button class="hs-btn gray" onclick="HGSCRIPT.pass()">⏭ 넘어가기</button></div>`;
    } else {
      btns = `<div class="hs-row"><button class="hs-btn gray" onclick="HGSCRIPT.retry()">${st.pass < 3 ? '🔊 처음부터 다시 듣기' : '🎙️ 다시 읽기'}</button></div>`;
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

  function setStatus(text, heard) {
    if (!session) return;
    session.status = text;
    if (heard !== undefined) session.heard = heard;
    render();
  }

  function syncHeader(st) {
    const lv = document.getElementById('currentLevelText');
    if (lv) lv.textContent = 'Lv. 0';
    const tn = document.getElementById('tierNameText');
    if (tn) tn.textContent = `입문: 문자 배우기 · ${st.unit + 1}/${units().length}단원`;
    const b = document.getElementById('quickTier0');
    if (b) { b.style.background = '#14b8a6'; b.style.color = '#fff'; }
  }

  /* ---------- 한 글자 진행: (시범) → 입력 → 판정 → 통과/반복 ---------- */
  function runItem(intro) {
    if (!session) return;
    clearFlow();
    stopListen();
    const my = ++speakSeq;
    const st = load();
    const item = session.queue[session.pos];
    session.paused = false;
    session.heard = '';
    if (checkinOpen()) { session.needVoice = true; setStatus(''); return; }  // 데일리 체크인 대사와 겹치지 않게
    const afterDemo = () => {
      if (my !== speakSeq) return;
      if (!sttAvailable()) { session.paused = 'self'; setStatus('👄 소리 내어 따라 읽은 뒤 버튼을 눌러 주세요'); return; }
      flowTimer = setTimeout(() => { if (my === speakSeq) listen(); }, 250);
    };
    if (st.pass === 3) {
      // 3회차: 엑자일은 읽지 않고 바로 입력
      setStatus('🎙️ 삐 소리 뒤에 글자를 보고 읽어 보세요');
      if (intro) exileSay(intro, afterDemo);
      else flowTimer = setTimeout(afterDemo, 500);
      return;
    }
    setStatus('🔊 엑자일이 먼저 읽어요. 잘 들어 보세요');
    const demo = () => { if (my === speakSeq) sayItem(item, afterDemo); };
    if (intro) exileSay(intro, () => { if (my === speakSeq) flowTimer = setTimeout(demo, 250); });
    else demo();
  }

  function judged(ok, heard) {
    if (!session) return;
    const my = speakSeq;
    if (ok) {
      sfx('sparkle');
      session.fails = 0;
      setStatus('🎯 통과! 잘 읽었어요', heard ? `들린 소리: ${esc(heard)}` : '');
      flowTimer = setTimeout(() => { if (my === speakSeq) advance(); }, 800);
      return;
    }
    sfx('oops');
    session.fails++;
    const st = load();
    const heardText = heard ? `들린 소리: "${esc(heard)}"` : '소리가 들리지 않았어요';
    if (session.fails >= MAX_AUTO_RETRY) {
      session.paused = true;
      setStatus(`❌ ${session.fails}번 연속 아쉬워요. 다시 하거나 넘어갈 수 있어요`, heardText);
      return;
    }
    setStatus(`❌ 다시 해 봐요! ${st.pass < 3 ? '엑자일이 한 번 더 읽어 줄게요' : '삐 소리 뒤에 다시 읽어 보세요'}`, heardText);
    flowTimer = setTimeout(() => { if (my === speakSeq) runItem(); }, 1000);  // 실패: 같은 글자, 같은 회차 처음부터
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
      session.needVoice = false;
      // 회차 첫 글자면 안내부터, 이어하기로 중간부터면 바로 그 글자
      runItem(session.pos === 0 ? passIntro(st) : '이어서 해 볼까? 여기부터야.');
    }
  }

  function hide() {
    const v = document.getElementById('hgScriptView');
    if (v) v.style.display = 'none';
    const b = document.getElementById('quickTier0');
    if (b) { b.style.background = 'rgba(20,184,166,0.1)'; b.style.color = '#0f766e'; }
    clearFlow();
    stopListen();
  }

  function start() {
    const st = load();
    if (st.done) Object.assign(st, { unit: 0, phase: 'c', pass: 1, done: false, order: null, pos: 0 });
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

  function retry() { sfx('bubble'); if (session) session.fails = 0; runItem(); }
  function pass() { sfx('coin8'); if (session) session.fails = 0; advance(); }

  function advance() {
    if (!session) return;
    clearFlow();
    stopListen();
    const st = load();
    session.pos++;
    session.status = '';
    session.heard = '';
    session.fails = 0;
    if (session.pos < session.queue.length) {
      savePos();
      if (st.pass === 1) sfx('bubble');
      render();
      runItem();
      return;
    }
    passDone(st);
  }

  function passDone(st) {
    st.order = null; st.pos = 0;
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
    st.unit++; st.phase = 'c'; st.pass = 1; st.order = null; st.pos = 0;
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
    Object.assign(st, { active: false, done: true, unit: 0, phase: 'c', pass: 1, order: null, pos: 0 });
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

  /* ---------- 발음 판정 (음성 인식) ---------- */
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))  // 가타카나 → 히라가나로 맞춰 비교
    .replace(/[\s.,!?¡¿'"·\-_ー~()（）、。，！？]/g, '');

  function isHit(alts, item, pic) {
    const targets = [item.s, item.c, item.p, pic && pic.w].map(norm).filter(Boolean);
    return alts.some(a => { const n = norm(a); return n && targets.some(t => n.includes(t) || t.includes(n)); });
  }

  function stopListen() {
    if (recognizer) { const r = recognizer; recognizer = null; try { r.abort(); } catch (e) {} }
    try { isRecordingSTT = false; } catch (e) {}
  }

  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !session) return;
    stopListen();
    if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio();
    const st = load();
    const item = session.queue[session.pos];
    const pic = pictureFor(item, st.phase, st.pass);
    const r = new SR();
    recognizer = r;
    let got = false;
    r.lang = STT_LANG[curLang()] || 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.onstart = () => { try { isRecordingSTT = true; } catch (e) {} setStatus('🎙️ 지금 읽어 보세요!'); };
    r.onresult = (ev) => {
      if (recognizer !== r) return;
      got = true;
      const alts = Array.from(ev.results[0] || []).map(a => a.transcript || '');
      judged(isHit(alts, item, pic), alts[0] || '');
    };
    r.onerror = (ev) => {
      if (recognizer !== r) return;
      got = true;
      const code = ev && ev.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        session.paused = 'self';
        setStatus('⚠️ 마이크 권한이 필요해요. 권한을 허용하거나, 따라 읽은 뒤 버튼을 눌러 주세요');
        return;
      }
      judged(false, '');  // 못 들음·잡음 = 실패 → 반복
    };
    r.onend = () => {
      try { isRecordingSTT = false; } catch (e) {}
      if (recognizer === r) { recognizer = null; if (!got) judged(false, ''); }
    };
    try { r.start(); } catch (e) { recognizer = null; judged(false, ''); }
  }

  window.HGSCRIPT = { scriptName, units, isActive, show, hide, start, leave, retry, pass, listen, skipToLevel1, load, save, pictures };
})();
