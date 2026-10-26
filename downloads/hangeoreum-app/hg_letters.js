/* 한걸음 문자표 공통 엔진 (HGLETTERS)
   - 언어마다 데이터 파일 letters/<코드>/data.json 하나만 두면 같은 엔진으로 문자표·플래시카드·퀴즈가 동작한다.
     새 언어 추가 = LANGS에 한 줄 + letters/<코드>/data.json 추가.
   - 데이터 형식: { 언어, 코드, 음성, 제목, 대상, 안내, 단계:[{단계,제목,설명}], 표:[{id,단계,제목,부제,행수,열수,행머리?,열머리?,설명?}],
                   항목:[{id,단계,표,order,row,col,글자,한글발음,이름?,소리?,읽기?,예시단어,예시발음?,예시병음?,단어뜻,병음?,성조?,한자음?,설명?}] }
   - 학습 흐름: ① 표 보기 → ② 플래시카드 → ③ 퀴즈 → 다음 단계
   - 앱 안에서는 표·플래시카드 화면의 '🎙️ 핸즈프리로 따라 읽기'로 그 단계를 입문 문자 코스(HGSCRIPT, 문자표 기준)로 넘긴다:
     엑자일 시범 → 따라 읽기 → 판정이 자동으로 이어짐. 열고 닫을 때 window 'hg-letters' 이벤트(open/close/handoff)를 보낸다.
   - 앱 안: HGLETTERS.open(lang) 전체 화면, 단독 페이지: HGLETTERS.mount(요소, {lang})
   - 진행 상태: localStorage hg_letters_<코드> = { stage, step, known:{id:1}, best:{단계:점수} } (막혀 있어도 동작) */
(function () {
  const LANGS = [
    { code: 'ja', name: '일본어', flag: '🇯🇵', stt: 'ja-JP' },
    { code: 'cn', name: '중국어', flag: '🇨🇳', stt: 'zh-CN' },
    { code: 'en', name: '영어', flag: '🇺🇸', stt: 'en-US' },
    { code: 'fr', name: '프랑스어', flag: '🇫🇷', stt: 'fr-FR' },
    { code: 'es', name: '스페인어', flag: '🇪🇸', stt: 'es-ES' },
    { code: 'ru', name: '러시아어', flag: '🇷🇺', stt: 'ru-RU' }
  ];
  const BASE = (() => {  // 이 스크립트가 있는 폴더 기준으로 letters/ 를 찾는다(앱·체험판·단독 페이지 공통)
    const s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^/]*$/, '') : '';
  })();
  const QUIZ_LEN = 10;

  const cache = {};
  let root = null, overlay = null, data = null, lang = 'fr', st = null, quiz = null, card = 0, flipped = false, detail = null;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } }
  };
  const saveSt = () => store.set(`hg_letters_${lang}`, st);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sfx = n => { try { if (window.HGUX && HGUX.sfx) HGUX.sfx(n); } catch (e) { /* 효과음 없음 */ } };

  /* ---------- 소리: 앱이면 누리 보이스(원어민 Edge 목소리), 아니면 브라우저 음성 ---------- */
  // Edge 일본어 목소리가 い/イ 한 글자를 '이키'처럼 읽는 문제 보정 (hg_script.js TTS_FIX와 같은 기준)
  const TTS_FIX = { 'い': 'い。', 'イ': 'イ。' };
  function speak(text) {
    if (!text || !data) return;
    let clean = String(text).replace(/[↗↘‾·→]/g, ' ').trim();
    clean = TTS_FIX[clean] || clean;
    if (typeof window.speakTextWithFallback === 'function') { window.speakTextWithFallback(clean, lang); return; }
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = data.음성; u.rate = 0.85;
      const v = speechSynthesis.getVoices().find(x => x.lang.replace('_', '-').toLowerCase().startsWith(data.음성.slice(0, 2).toLowerCase()));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* 음성 장치 없음 */ }
  }
  const sayOf = it => it.읽기 || it.글자;

  /* ---------- 데이터 ---------- */
  async function loadLang(code) {
    if (cache[code]) return cache[code];
    const res = await fetch(`${BASE}letters/${code}/data.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`letters/${code}/data.json ${res.status}`);
    const d = await res.json();
    d.항목.sort((a, b) => a.order - b.order);
    cache[code] = d;
    return d;
  }
  const stages = () => data.단계;
  const itemsOf = n => data.항목.filter(it => it.단계 === n);
  const tablesOf = n => data.표.filter(t => t.단계 === n);
  const isAlpha = it => it.이름 != null && it.소리 != null;
  const soundLine = it => isAlpha(it) ? `${it.이름} / ${it.소리}` : it.한글발음;
  // 표 칸에는 짧게: "마 (높고 평평하게 ‾)" → "마" (전체 설명은 아래 상세 칸·플래시카드에)
  const shortSound = s => { s = String(s || ''); return s.length > 6 && s.includes(' (') ? s.slice(0, s.indexOf(' (')) : s; };

  /* ---------- 스타일 ---------- */
  function injectStyle() {
    if (document.getElementById('hgLettersStyle')) return;
    const css = `
.hgl{--t:#0f766e;--t2:#14b8a6;--tl:#f0fdfa;--tb:#99f6e4;--ink:#0f172a;--sub:#475569;--line:#e2e8f0;--bad:#e11d48;--bg:#f8fafc;
  font-family:inherit;color:var(--ink);background:var(--bg);box-sizing:border-box}
.hgl *{box-sizing:border-box}
.hgl-ov{position:fixed;inset:0;z-index:99990;overflow-y:auto;-webkit-overflow-scrolling:touch}
.hgl-in{max-width:920px;margin:0 auto;padding:12px 12px 48px}
.hgl-head{background:linear-gradient(135deg,#0f766e,#0e7490);color:#fff;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px}
.hgl-head h2{margin:0;font-size:clamp(18px,5vw,22px);font-weight:900;flex:1}
.hgl-head small{display:block;font-size:13px;font-weight:700;opacity:.9}
.hgl-x{border:none;background:rgba(255,255,255,.2);color:#fff;font-size:20px;font-weight:900;width:44px;height:44px;border-radius:12px;cursor:pointer}
.hgl-langs{display:flex;gap:6px;overflow-x:auto;padding:10px 0 2px}
.hgl-chip{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:999px;padding:0 14px;min-height:40px;font-size:15px;font-weight:800;cursor:pointer;color:var(--ink)}
.hgl-chip.on{background:var(--t);border-color:var(--t);color:#fff}
.hgl-note{background:var(--tl);border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.55;color:var(--sub);margin-top:8px}
.hgl-stages{display:flex;gap:6px;overflow-x:auto;padding:10px 0 4px}
.hgl-stage{flex:0 0 auto;text-align:left;border:1px solid var(--line);background:#fff;border-radius:12px;padding:6px 12px;min-height:48px;cursor:pointer;color:var(--ink)}
.hgl-stage b{display:block;font-size:12px;color:var(--sub)}
.hgl-stage span{font-size:15px;font-weight:800}
.hgl-stage.on{border-color:var(--t2);box-shadow:inset 0 0 0 2px var(--t2)}
.hgl-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}
.hgl-step{border:none;border-radius:12px;min-height:48px;font-size:clamp(14px,4vw,16px);font-weight:900;cursor:pointer;background:#e2e8f0;color:#1e293b}
.hgl-step.on{background:var(--t2);color:#fff;box-shadow:0 3px 0 var(--t)}
.hgl-step.done{background:#ccfbf1;color:var(--t)}
.hgl-desc{font-size:15px;color:var(--sub);margin:4px 0 8px;line-height:1.55}
.hgl-tbl{margin:14px 0 4px}
.hgl-tbl h3{margin:0;font-size:18px;font-weight:900}
.hgl-tbl h3 small{font-size:13px;color:var(--sub);font-weight:700;margin-left:6px}
.hgl-tbl p{margin:2px 0 6px;font-size:13px;color:var(--sub)}
.hgl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}
.hgl-grid{display:grid;gap:4px;min-width:min-content}
.hgl-h{font-size:12px;font-weight:800;color:var(--t);display:flex;align-items:center;justify-content:center;text-align:center;padding:2px;line-height:1.25;word-break:keep-all}
.hgl-h.rh{position:sticky;left:0;z-index:1;background:var(--bg)}
.hgl-c{border:1px solid var(--line);background:#fff;border-radius:10px;min-width:56px;min-height:60px;padding:6px 3px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:var(--ink);font:inherit}
.hgl-c.known{border-color:var(--t2);background:var(--tl)}
.hgl-c.sel{box-shadow:0 0 0 3px var(--t2)}
.hgl-c .g{font-size:clamp(20px,6vw,26px);font-weight:900;line-height:1.15;word-break:keep-all}
.hgl-c .g.long{font-size:14px}
.hgl-c .k{font-size:12px;font-weight:700;color:var(--t);line-height:1.25;word-break:keep-all}
.hgl-c .k2{font-size:11px;color:var(--sub);line-height:1.2}
.hgl-e{border:1px dashed var(--line);border-radius:10px;min-height:60px}
.hgl-detail{position:sticky;bottom:8px;margin-top:10px;background:#fff;border:2px solid var(--tb);border-radius:16px;padding:12px 14px;box-shadow:0 6px 20px rgba(15,23,42,.12);display:flex;gap:12px;align-items:center}
.hgl-detail .dg{font-size:38px;font-weight:900;min-width:56px;text-align:center}
.hgl-detail .dt{flex:1;min-width:0;font-size:15px;line-height:1.5}
.hgl-detail .dt b{font-size:17px}
.hgl-detail .dt .s{color:var(--t);font-weight:800}
.hgl-detail .dt .n{color:var(--sub);font-size:13px}
.hgl-btn{border:none;border-radius:12px;min-height:48px;padding:0 14px;font-size:16px;font-weight:900;cursor:pointer;background:var(--t2);color:#fff;box-shadow:0 3px 0 var(--t)}
.hgl-btn.gray{background:#e2e8f0;color:#1e293b;box-shadow:0 3px 0 #cbd5e1}
.hgl-btn.sm{min-height:40px;font-size:14px;padding:0 10px}
.hgl-row{display:flex;gap:8px;margin-top:12px}
.hgl-row>*{flex:1}
.hgl-card{background:#fff;border:2px solid var(--tb);border-radius:20px;min-height:300px;padding:20px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;cursor:pointer;margin-top:8px}
.hgl-card .big{font-size:clamp(64px,22vw,104px);font-weight:900;line-height:1.1;word-break:keep-all}
.hgl-card .big.long{font-size:clamp(30px,9vw,44px)}
.hgl-card .snd{font-size:clamp(22px,6.5vw,28px);font-weight:900;color:#be185d}
.hgl-card .sub{font-size:16px;color:var(--t);font-weight:800}
.hgl-card .ex{font-size:18px;font-weight:800;margin-top:6px}
.hgl-card .ex small{display:block;font-size:15px;color:var(--sub);font-weight:700}
.hgl-card .hint{font-size:14px;color:var(--sub)}
.hgl-card .nt{font-size:14px;color:var(--sub);max-width:520px;line-height:1.5}
.hgl-meta{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--sub);font-weight:700;margin-top:6px}
.hgl-bar{height:8px;background:var(--line);border-radius:4px;overflow:hidden;margin-top:6px}
.hgl-bar>div{height:100%;background:var(--t2);transition:width .3s}
.hgl-q{background:#fff;border:2px solid var(--tb);border-radius:20px;padding:18px 14px;margin-top:8px;text-align:center}
.hgl-q .qq{font-size:clamp(48px,16vw,80px);font-weight:900;line-height:1.15;margin:6px 0;word-break:keep-all}
.hgl-q .qq.long{font-size:clamp(26px,8vw,38px)}
.hgl-q .qh{font-size:15px;color:var(--sub);font-weight:700}
.hgl-ch{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
.hgl-ch button{min-height:60px;border-radius:14px;border:2px solid var(--line);background:#fff;font-size:clamp(17px,5vw,22px);font-weight:900;cursor:pointer;color:var(--ink);padding:6px;word-break:keep-all}
.hgl-ch button.ok{border-color:#16a34a;background:#f0fdf4;color:#15803d}
.hgl-ch button.no{border-color:var(--bad);background:#fff1f2;color:var(--bad)}
.hgl-res{font-size:clamp(40px,12vw,56px);font-weight:900;color:var(--t)}
.hgl-err{padding:24px 12px;text-align:center;color:var(--sub);line-height:1.6}`;
    const el = document.createElement('style');
    el.id = 'hgLettersStyle';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ---------- 화면 ---------- */
  function shell() {
    const L = LANGS.find(l => l.code === lang) || { name: lang, flag: '' };
    const langs = LANGS.map(l => `<button class="hgl-chip ${l.code === lang ? 'on' : ''}" data-lang="${l.code}">${l.flag} ${l.name}</button>`).join('');
    const close = overlay ? '<button class="hgl-x" data-act="close" aria-label="닫기">✕</button>' : '';
    return `<div class="hgl-in">
      <div class="hgl-head"><h2>📋 ${esc(L.name)} 문자표<small>${data ? esc(data.제목) : ''}</small></h2>${close}</div>
      <div class="hgl-langs" role="group" aria-label="언어">${langs}</div>
      <div id="hglBody"></div></div>`;
  }

  function body() {
    if (!root) return;  // 퀴즈 다음 문제 타이머가 문자표를 닫은 뒤에 와도 오류 없이 끝낸다
    const b = root.querySelector('#hglBody');
    if (!b) return;
    if (!data) { b.innerHTML = '<div class="hgl-err">불러오는 중…</div>'; return; }
    const sg = stages().find(s => s.단계 === st.stage) || stages()[0];
    const stageTabs = stages().map(s => {
      const its = itemsOf(s.단계), kn = its.filter(i => st.known[i.id]).length;
      return `<button class="hgl-stage ${s.단계 === sg.단계 ? 'on' : ''}" data-stage="${s.단계}"><b>${s.단계}단계 · ${kn}/${its.length}</b><span>${esc(s.제목)}</span></button>`;
    }).join('');
    const stepNames = ['① 표 보기', '② 플래시카드', '③ 퀴즈'];
    const steps = stepNames.map((n, i) => `<button class="hgl-step ${i === st.step ? 'on' : (i < st.step ? 'done' : '')}" data-step="${i}">${n}</button>`).join('');
    let html = `${data.안내 && st.stage === stages()[0].단계 && st.step === 0 ? `<div class="hgl-note">${esc(data.안내)}</div>` : ''}
      <div class="hgl-stages">${stageTabs}</div>
      <div class="hgl-desc"><b>${sg.단계}단계 · ${esc(sg.제목)}</b> — ${esc(sg.설명)}</div>
      <div class="hgl-steps">${steps}</div>`;
    if (st.step === 0) html += tableView(sg);
    else if (st.step === 1) html += cardView(sg);
    else html += quizView(sg);
    b.innerHTML = html;
  }

  function cellHtml(it) {
    const long = [...it.글자].length > 4;
    const k = isAlpha(it) ? `<span class="k">${esc(it.이름)}</span><span class="k2">${esc(it.소리)}</span>`
      : `<span class="k">${esc(shortSound(it.한글발음))}</span>${it.병음 && it.병음 !== it.글자 && it.병음.length < 12 ? `<span class="k2">${esc(it.병음)}</span>` : ''}`;
    return `<button class="hgl-c ${st.known[it.id] ? 'known' : ''} ${detail === it.id ? 'sel' : ''}" data-cell="${esc(it.id)}"><span class="g ${long ? 'long' : ''}">${esc(it.글자)}</span>${k}</button>`;
  }

  function tableView(sg) {
    let html = '';
    tablesOf(sg.단계).forEach(t => {
      const its = data.항목.filter(it => it.표 === t.id);
      const at = {};
      its.forEach(it => { at[`${it.row},${it.col}`] = it; });
      const rh = Array.isArray(t.행머리), ch = Array.isArray(t.열머리);
      const cols = `${rh ? 'minmax(52px,auto) ' : ''}repeat(${t.열수}, minmax(56px,1fr))`;
      let g = '';
      if (ch) { if (rh) g += '<div></div>'; t.열머리.forEach(h => { g += `<div class="hgl-h">${esc(h)}</div>`; }); }
      for (let r = 0; r < t.행수; r++) {
        if (rh) g += `<div class="hgl-h rh">${esc(t.행머리[r])}</div>`;
        for (let c = 0; c < t.열수; c++) { const it = at[`${r},${c}`]; g += it ? cellHtml(it) : '<div class="hgl-e" aria-hidden="true"></div>'; }
      }
      html += `<section class="hgl-tbl"><h3>${esc(t.제목)}<small>${esc(t.부제 || '')}</small></h3>${t.설명 ? `<p>${esc(t.설명)}</p>` : ''}
        <div class="hgl-scroll"><div class="hgl-grid" style="grid-template-columns:${cols}">${g}</div></div></section>`;
    });
    const it = detail && data.항목.find(x => x.id === detail);
    if (it) {
      html += `<div class="hgl-detail"><div class="dg">${esc(it.글자)}</div><div class="dt">
        <div class="s">${esc(soundLine(it))}${it.한자음 ? ` · 한자음 ${esc(it.한자음)}` : ''}</div>
        <div><b>${esc(it.예시단어)}</b> ${it.예시병음 ? esc(it.예시병음) : ''} ${it.예시발음 ? `[${esc(it.예시발음)}]` : ''} — ${esc(it.단어뜻)}</div>
        ${it.설명 ? `<div class="n">${esc(it.설명)}</div>` : ''}</div>
        <button class="hgl-btn sm" data-say-word="${esc(it.id)}">🔊 단어</button></div>`;
    }
    html += `<div class="hgl-row"><button class="hgl-btn" data-step="1">플래시카드로 익히기 →</button></div>${handsFreeBtn()}`;
    return html;
  }

  function cardView(sg) {
    const its = itemsOf(sg.단계);
    if (!its.length) return '';
    card = Math.min(Math.max(0, card), its.length - 1);
    const it = its[card];
    const long = [...it.글자].length > 4;
    let face = `<div class="big ${long ? 'long' : ''}">${esc(it.글자)}</div>`;
    if (flipped) {
      face += `<div class="snd">${esc(soundLine(it))}</div>`;
      const sub = [it.성조, it.병음 && it.병음 !== it.글자 ? it.병음 : '', it.한자음 ? `한자음 ${it.한자음}` : ''].filter(Boolean).join(' · ');
      if (sub) face += `<div class="sub">${esc(sub)}</div>`;
      face += `<div class="ex">${esc(it.예시단어)} ${it.예시병음 ? esc(it.예시병음) : ''}<small>${it.예시발음 ? `[${esc(it.예시발음)}] ` : ''}${esc(it.단어뜻)}</small></div>`;
      if (it.설명) face += `<div class="nt">${esc(it.설명)}</div>`;
    } else face += '<div class="hint">눌러서 소리 듣고 뒤집기</div>';
    return `<div class="hgl-meta"><span>${card + 1} / ${its.length}</span><span>${its.filter(i => st.known[i.id]).length}개 익힘</span></div>
      <div class="hgl-bar"><div style="width:${Math.round((card + 1) / its.length * 100)}%"></div></div>
      <div class="hgl-card" data-act="flip">${face}</div>
      <div class="hgl-row"><button class="hgl-btn gray" data-act="prev">◀ 이전</button><button class="hgl-btn gray" data-act="say">🔊 듣기</button><button class="hgl-btn gray" data-act="sayword">🔊 단어</button></div>
      <div class="hgl-row"><button class="hgl-btn gray" data-act="again">🤔 다시 볼래요</button><button class="hgl-btn" data-act="know">✅ 알아요 · 다음</button></div>
      ${card === its.length - 1 ? '<div class="hgl-row"><button class="hgl-btn" data-step="2">퀴즈 풀기 →</button></div>' : ''}
      ${handsFreeBtn()}`;
  }

  function newQuiz(sg) {
    const its = itemsOf(sg.단계);
    const pool = shuffle(its).slice(0, Math.min(QUIZ_LEN, its.length));
    quiz = { stage: sg.단계, list: pool.map((it, i) => ({ it, kind: i % 2 ? 'read' : 'listen' })), i: 0, right: 0, picked: null };
  }
  function choicesFor(q, its) {
    const key = q.kind === 'listen' ? (x => x.글자) : (x => soundLine(x));
    const seen = new Set([key(q.it)]);
    const others = shuffle(its.filter(x => x.id !== q.it.id)).filter(x => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
    return shuffle([q.it, ...others]).map(x => ({ id: x.id, label: key(x) }));
  }
  function quizView(sg) {
    const its = itemsOf(sg.단계);
    if (its.length < 2) return '<div class="hgl-err">퀴즈를 내기엔 항목이 적어요.</div>';
    if (!quiz || quiz.stage !== sg.단계) newQuiz(sg);
    if (quiz.i >= quiz.list.length) {
      const best = Math.max(st.best[sg.단계] || 0, quiz.right);
      st.best[sg.단계] = best; saveSt();
      const nextStage = stages().find(s => s.단계 > sg.단계);
      return `<div class="hgl-q"><div class="qh">${sg.단계}단계 퀴즈 결과</div><div class="hgl-res">${quiz.right} / ${quiz.list.length}</div>
        <div class="qh">${quiz.right === quiz.list.length ? '모두 맞혔어요! 🎉' : '틀린 글자는 표에서 한 번 더 눌러 들어 보세요.'} · 최고 ${best}점</div></div>
        <div class="hgl-row"><button class="hgl-btn gray" data-act="requiz">🔁 다시 풀기</button><button class="hgl-btn gray" data-step="0">📋 표로 돌아가기</button></div>
        ${nextStage ? `<div class="hgl-row"><button class="hgl-btn" data-stage="${nextStage.단계}">다음: ${nextStage.단계}단계 ${esc(nextStage.제목)} →</button></div>` : ''}`;
    }
    const q = quiz.list[quiz.i];
    if (!q.choices) q.choices = choicesFor(q, its);
    const long = [...q.it.글자].length > 4;
    const ask = q.kind === 'listen'
      ? `<div class="qh">소리를 듣고 맞는 글자를 고르세요</div><div class="qq"><button class="hgl-btn" data-act="qsay">🔊 소리 듣기</button></div>`
      : `<div class="qh">이 글자는 어떻게 읽을까요?</div><div class="qq ${long ? 'long' : ''}">${esc(q.it.글자)}</div>`;
    const ch = q.choices.map(c => {
      let cls = '';
      if (quiz.picked) { if (c.id === q.it.id) cls = 'ok'; else if (c.id === quiz.picked) cls = 'no'; }
      return `<button class="${cls}" data-pick="${esc(c.id)}">${esc(c.label)}</button>`;
    }).join('');
    const after = quiz.picked ? `<div class="qh" style="margin-top:10px">${esc(q.it.글자)} — ${esc(soundLine(q.it))} · ${esc(q.it.예시단어)} (${esc(q.it.단어뜻)})</div>` : '';
    return `<div class="hgl-meta"><span>${quiz.i + 1} / ${quiz.list.length}</span><span>맞힘 ${quiz.right}</span></div>
      <div class="hgl-bar"><div style="width:${Math.round(quiz.i / quiz.list.length * 100)}%"></div></div>
      <div class="hgl-q">${ask}<div class="hgl-ch">${ch}</div>${after}</div>`;
  }

  // 앱 안(입문 문자 코스가 있을 때)에서만: 이 단계를 핸즈프리 3회차로
  function handsFreeBtn() {
    if (!overlay || !window.HGSCRIPT || !HGSCRIPT.startChart) return '';
    return '<div class="hgl-row"><button class="hgl-btn" data-act="handsfree" style="background:#6366f1;box-shadow:0 3px 0 #4338ca">🎙️ 이 단계 핸즈프리로 따라 읽기<br><small style="font-size:13px;font-weight:700">엑자일 시범 → 따라 읽기 → 판정 자동 진행</small></button></div>';
  }
  function handsFree() {
    const code = lang, stage = st.stage;
    if (typeof selectedLang !== 'undefined' && selectedLang !== code && typeof window.switchLang === 'function') window.switchLang(code);
    close({ handoff: true });
    HGSCRIPT.startChart(stage);
  }

  /* ---------- 동작 ---------- */
  function setStage(n) { st.stage = n; st.step = 0; card = 0; flipped = false; detail = null; quiz = null; saveSt(); body(); scrollTop(); }
  function setStep(n) { st.step = n; card = 0; flipped = false; if (n === 2) quiz = null; saveSt(); body(); scrollTop(); if (n === 2) autoAsk(); }
  function scrollTop() { const sc = overlay || document.scrollingElement; try { (sc === overlay ? overlay : window).scrollTo({ top: 0 }); } catch (e) { /* 무시 */ } }
  function autoAsk() { if (quiz && quiz.list[quiz.i] && quiz.list[quiz.i].kind === 'listen' && !quiz.picked) setTimeout(() => speak(sayOf(quiz.list[quiz.i].it)), 250); }

  function onClick(ev) {
    const t = ev.target.closest('button,[data-act]');
    if (!t || !root.contains(t)) return;
    const d = t.dataset;
    if (d.lang) { switchLang(d.lang); return; }
    if (d.stage) { setStage(+d.stage); return; }
    if (d.step) { setStep(+d.step); return; }
    if (d.cell) {
      const it = data.항목.find(x => x.id === d.cell);
      detail = it.id; speak(sayOf(it)); body(); return;
    }
    if (d.sayWord) { const it = data.항목.find(x => x.id === d.sayWord); speak(it.예시단어); return; }
    if (d.pick) {
      if (quiz.picked) return;
      const q = quiz.list[quiz.i];
      quiz.picked = d.pick;
      const ok = d.pick === q.it.id;
      if (ok) { quiz.right++; st.known[q.it.id] = 1; saveSt(); sfx('sparkle'); } else sfx('oops');
      if (q.kind === 'read') speak(sayOf(q.it));
      body();
      setTimeout(() => { if (!quiz || quiz.list[quiz.i] !== q) return; quiz.i++; quiz.picked = null; body(); autoAsk(); }, ok ? 900 : 1800);
      return;
    }
    const its = data && itemsOf(st.stage);
    switch (d.act) {
      case 'close': close(); break;
      case 'handsfree': handsFree(); break;
      case 'flip': flipped = !flipped; if (flipped) speak(sayOf(its[card])); body(); break;
      case 'say': speak(sayOf(its[card])); break;
      case 'sayword': speak(its[card].예시단어); break;
      case 'prev': card = Math.max(0, card - 1); flipped = false; body(); break;
      case 'again': flipped = false; card = Math.min(its.length - 1, card + 1); body(); break;
      case 'know': st.known[its[card].id] = 1; saveSt(); if (card < its.length - 1) { card++; flipped = false; body(); } else setStep(2); break;
      case 'qsay': speak(sayOf(quiz.list[quiz.i].it)); break;
      case 'requiz': quiz = null; body(); autoAsk(); break;
    }
  }

  async function switchLang(code) {
    lang = code; data = null; quiz = null; detail = null; card = 0; flipped = false;
    st = Object.assign({ stage: 1, step: 0, known: {}, best: {} }, store.get(`hg_letters_${code}`, {}));
    root.innerHTML = shell(); body();
    try {
      data = await loadLang(code);
      if (lang !== code) return;
      if (!stages().some(s => s.단계 === st.stage)) st.stage = stages()[0].단계;
      root.innerHTML = shell(); body();
    } catch (e) {
      const b = root.querySelector('#hglBody');
      if (b) b.innerHTML = `<div class="hgl-err">문자표 데이터를 읽지 못했어요.<br><small>${esc(e.message)}</small>
        ${location.protocol === 'file:' ? '<br>파일을 바로 열면 브라우저가 데이터 읽기를 막아요. 실행.bat으로 열어 주세요.' : ''}</div>`;
    }
  }

  function mount(el, opt) {
    injectStyle();
    root = el;
    root.classList.add('hgl');
    root.addEventListener('click', onClick);
    const want = (opt && opt.lang) || '';
    switchLang(LANGS.some(l => l.code === want) ? want : 'fr');
  }

  function open(code) {
    if (overlay) close();
    overlay = document.createElement('div');
    overlay.className = 'hgl-ov';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', '문자표');
    document.body.appendChild(overlay);
    const cur = code || (typeof selectedLang !== 'undefined' && selectedLang) || 'fr';
    mount(overlay, { lang: cur });
    overlay.classList.add('hgl');
    notify('open');
  }
  function close(opt) {
    if (!overlay) return;
    try { if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio(); } catch (e) { /* 무시 */ }
    overlay.remove();
    overlay = null; root = null;
    notify(opt && opt.handoff ? 'handoff' : 'close');
  }
  function notify(kind) { try { window.dispatchEvent(new CustomEvent('hg-letters', { detail: kind })); } catch (e) { /* 무시 */ } }

  window.HGLETTERS = { open, close, mount, langs: LANGS.map(l => l.code), load: loadLang };
})();
