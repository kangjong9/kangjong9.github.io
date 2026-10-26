/* 한걸음 입문 Lv.0 — 문자 배우기 (HGSCRIPT)
   유닛마다 글자 → 그 글자로 만든 단어 순서로, 각 3회차 반복한다.
   1회차: 글자(원어) + 한글 읽기 + 그림①, 엑자일이 읽음 → 사용자가 따라 읽음 → 발음 판정 → 통과면 다음, 실패면 같은 글자 1회차 반복
   2회차: 글자(원어만) + 다른 그림②, 엑자일이 읽음 → 따라 읽기 → 판정 (실패 시 반복)
   3회차: 글자(원어만) + 또 다른 그림③, 엑자일은 읽지 않고 바로 사용자 입력 → 판정 (실패 시 반복)
   그림은 script_pics.js(HG_SCRIPT_PICS)의 "그 글자가 쓰인 대표 단어" 그림이다.
   진행 상태는 언어별 localStorage hg_script_<lang> = { active, unit, phase('c'|'w'), pass, done, order, pos }
   order·pos는 이어하기용(종료 후 다음 실행 때 같은 글자부터).
   학습 기준 (2026-10-26): 처음 시작할 때 사용자가 고른다 — localStorage hg_script_basis_<lang>
   - 'units': 입문 단원 코스(script_data.js, 그림 3회차)
   - 'chart': 문자표 기준(letters/<lang>/data.json의 단계·표 순서). 표를 읽는 방향대로 묶는다:
     50음도처럼 세로로 읽는 표는 열(あ행·か행…), 알파벳·키릴·병음표처럼 가로로 읽는 표는 줄 단위. 진행은 hg_script_<lang>_chart
     = '문자표 마스터 코스': 문자표의 단계가 곧 문자 익힘 단계. 1단계부터 순서대로, 앞 단계를 마스터해야 다음 단계가 열리고
       마지막 단계까지 마치면 '문자 마스터'. 단계 시작마다 엑자일이 단계를 안내한다(코스 첫 시작은 전체 단계 순서까지).
     'units'는 당장 급한 사람을 위한 '빠른 입문 코스'. 수업 방식(시범→따라 읽기→판정 3회차)은 두 코스가 같다. */
(function () {
  const DATA = () => (window.HG_SCRIPT_DATA || {});
  const PICS = () => (window.HG_SCRIPT_PICS || {});
  const curLang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';
  const BASIS_KEY = () => `hg_script_basis_${curLang()}`;
  function basis() { try { return localStorage.getItem(BASIS_KEY()) || ''; } catch (e) { return ''; } }
  function setBasis(b) { try { localStorage.setItem(BASIS_KEY(), b); } catch (e) { /* 저장 불가 환경 */ } }
  const KEY = () => basis() === 'chart' ? `hg_script_${curLang()}_chart` : `hg_script_${curLang()}`;
  const CHUNK_MAX = 8;  // 문자표 기준 한 묶음 최대 글자 수
  const STT_LANG = { fr: 'fr-FR', cn: 'zh-CN', ja: 'ja-JP', en: 'en-US', es: 'es-ES', ru: 'ru-RU' };
  const PHASE_NAME = { c: '글자 익히기', w: '단어 읽기' };
  const PASS_NAME = { 1: '원어+한글 · 엑자일 시범', 2: '원어만 · 엑자일 시범', 3: '원어만 · 혼자 읽기' };
  const MAX_AUTO_RETRY = 3;  // 같은 글자 연속 실패가 이만큼이면 자동 반복을 멈추고 다시/넘어가기를 고르게 한다
  // Edge 일본어 목소리는 い/イ 한 글자를 '이키'처럼 두 소리로 읽는다 → 끝에 。를 붙이면 '이' 한 소리 (2026-10-26 합성 비교).
  // 모든 글자에 。를 붙이면 こ。 등이 오히려 길게 읽히므로 확인된 글자만 고친다.
  const TTS_FIX = { 'い': 'い。', 'イ': 'イ。' };

  let session = null;  // { key, queue, pos, status, heard, fails, paused }
  let speakSeq = 0;
  let recognizer = null;
  let flowTimer = null;
  let choosing = false;  // 학습 기준 고르기 화면

  // 받침에 맞는 조사: josa('성조 4개 + 경성', '을', '를') → '…경성을'. 한글로 안 끝나면(숫자·원어) 받침 없는 쪽
  const josa = (w, withB, noB) => {
    const s = String(w || '').replace(/[\s)）\]]+$/, ''), c = s.charCodeAt(s.length - 1);
    return w + (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? withB : noB);
  };
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function langData() { return DATA()[curLang()] || null; }
  function units() {
    if (basis() === 'chart') return chartUnits(curLang());
    const d = langData(); return d ? d.units : [];
  }
  function scriptName(lang) { const d = DATA()[lang || curLang()]; return d ? d.name : '문자'; }

  /* ---------- 문자표 기준 코스: letters/<lang>/data.json → 단원(묶음) ---------- */
  const chartCache = {}, chartLoading = {};
  function chartUnits(lang) {
    if (chartCache[lang]) return chartCache[lang].units;
    loadChart(lang);
    return [];
  }
  function loadChart(lang) {
    if (chartCache[lang]) return Promise.resolve(chartCache[lang]);
    if (chartLoading[lang]) return chartLoading[lang];
    if (!window.HGLETTERS) return Promise.resolve(null);
    chartLoading[lang] = HGLETTERS.load(lang).then(d => {
      chartCache[lang] = buildChart(d, lang);
      chartLoading[lang] = null;
      // 이어하기로 문자표 코스가 켜져 있었으면 데이터가 온 뒤 화면을 연다
      if (curLang() === lang && basis() === 'chart' && load().active && typeof updateLevelUI === 'function') updateLevelUI();
      return chartCache[lang];
    }).catch(e => { chartLoading[lang] = null; console.warn('문자표 데이터', e); return null; });
    return chartLoading[lang];
  }
  function buildChart(d, lang) {
    const clean = s => String(s == null ? '' : s).replace(/\|/g, '/');
    const kor = it => (it.이름 != null && it.소리 != null) ? (it.이름 === it.소리 ? it.이름 : `${it.이름} / ${it.소리}`) : (it.한글발음 || '');
    const aux = it => [it.병음 && it.병음 !== it.글자 ? it.병음 : '', it.성조 || ''].filter(Boolean).join(' · ');
    // 말할 대상: 읽기가 없는데 글자가 규칙 이름(한글·기호: '끝 자음 묵음', 'c · r · f · l')이거나 철자 조합(ch·gn·ou)이면
    // TTS가 한국어나 철자를 읽고 그대로는 합격할 수 없다 → 예시 단어를 읽고 말하게 하고 카드 보조 표기로 보여 준다 (실기기 2026-10-26)
    const say = it => {
      // 프랑스어·스페인어·러시아어 글자 카드: 인식기가 글자 이름 한 음절('베'·'으')은 연속 빈 결과, 예시 단어('bébé')는 첫 번에 인식
      // → 시범은 '이름, 단어'로 읽고 따라 말하게 한다. 영어(글자 이름 인식이 잘 됨)는 그대로 (실기기 2026-10-26)
      // 읽기 없는 소리 카드(러시아어 'б'·'é')도 같은 이유로 '글자, 단어'
      if (it.예시단어 && ['fr', 'es', 'ru'].includes(lang) && /^\S( \S)?$/.test(it.글자)) {
        const nm = it.읽기 || it.글자;
        return nm.includes(it.예시단어) ? nm : `${nm}, ${it.예시단어}`;  // 'hola, hola' 같은 되풀이 방지
      }
      if (it.읽기) return it.읽기;
      const g = String(it.글자 || '');
      const odd = /[가-힣ㄱ-ㅎ·→…\/()\[\]~]|^-|-$/.test(g) || /^[a-zà-ÿœ]{2,4}$/i.test(g);
      return odd && it.예시단어 ? it.예시단어 : g;
    };
    const auxOf = it => aux(it) || (say(it) !== (it.읽기 || it.글자) ? it.예시단어 || say(it) : '');
    const out = { title: d.제목, units: [], stages: [] };
    d.단계.forEach(sg => {
      const first = out.units.length;
      let count = 0;
      d.표.filter(t => t.단계 === sg.단계).forEach(t => {
        const its = d.항목.filter(it => it.표 === t.id).sort((a, b) => a.order - b.order);
        if (!its.length) return;
        count += its.length;
        // 읽는 순서가 세로로 이어지는 표(50음도)는 열 단위, 가로로 이어지는 표(알파벳·키릴·병음표)는 줄 단위로 묶는다
        let down = 0;
        for (let i = 1; i < its.length; i++) if (its[i].col === its[i - 1].col) down++;
        const byCol = down > (its.length - 1) / 2;
        const groups = [];
        its.forEach(it => {
          const k = byCol ? it.col : it.row;
          let g = groups[groups.length - 1];
          if (!g || g.k !== k) groups.push(g = { k, items: [] });
          g.items.push(it);
        });
        const parts = [];
        groups.forEach(g => { for (let i = 0; i < g.items.length; i += CHUNK_MAX) parts.push({ k: g.k, items: g.items.slice(i, i + CHUNK_MAX) }); });
        parts.forEach((p, pi) => {
          const head = byCol ? (t.열머리 && t.열머리[p.k]) : (t.행머리 && t.행머리[p.k]);
          const a = p.items[0].글자, z = p.items[p.items.length - 1].글자;
          const label = head ? String(head) : (p.items.length > 1 ? `${a} ~ ${z}` : a);
          const seen = new Set();
          const w = [];
          p.items.forEach(it => {
            if (!it.예시단어 || seen.has(it.예시단어)) return;
            seen.add(it.예시단어);
            w.push([it.예시단어, it.예시발음 || '', it.예시단어, it.단어뜻 || '', it.예시병음 || ''].map(clean).join('|'));
          });
          out.units.push({
            t: `${t.제목} · ${label}`,
            tip: pi === 0 ? (t.설명 || sg.설명 || '') : `이번엔 ${label}!`,
            // '이름, 단어' 카드는 1회차 한글 줄에 단어 발음도 ('베 / ㅂ · 바부쉬까') — 키릴 문자를 못 읽어도 따라 말하게
            c: p.items.map(it => [it.글자, kor(it) + (it.예시발음 && say(it).endsWith(', ' + it.예시단어) ? ` · ${it.예시발음}` : ''), say(it), '', auxOf(it)].map(clean).join('|')),
            w, stage: sg.단계
          });
        });
      });
      if (out.units.length > first) out.stages.push({ n: sg.단계, title: sg.제목, desc: sg.설명, count, first, last: out.units.length - 1 });
    });
    return out;
  }

  // 문자표 마스터 코스: 단계는 순서대로 — 앞 단계를 마스터해야 다음 단계가 열린다 (진행 hg_script_<lang>_chart.mastered)
  function chartInfo() { return chartCache[curLang()] || null; }
  function chartState() { return Object.assign({ unit: 0, mastered: [] }, readState(`hg_script_${curLang()}_chart`) || {}); }
  function stageAt(unitIdx) { const ch = chartInfo(); return ch ? ch.stages.find(s => unitIdx >= s.first && unitIdx <= s.last) || null : null; }
  function stageOpen(n, st) {
    const ch = chartInfo();
    if (!ch) return false;
    const i = ch.stages.findIndex(s => s.n === n);
    if (i < 0) return false;
    const m = (st || chartState()).mastered || [];
    return i === 0 || m.includes(n) || m.includes(ch.stages[i - 1].n);
  }

  function load() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch (e) {}
    return Object.assign({ active: false, unit: 0, phase: 'c', pass: 1, done: false, order: null, pos: 0, mastered: [] }, st || {});
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

  function isActive() { return choosing || (load().active === true && units().length > 0); }

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
    if (item && typeof speakTextWithFallback === 'function') speakTextWithFallback(TTS_FIX[item.s] || item.s, curLang(), { onDone: once });
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
    if (st.pass === 1 && st.phase === 'c' && basis() === 'chart') {
      const sg = stageAt(st.unit), ch = chartInfo();
      if (sg && st.unit === sg.first) {
        // 단계 첫 묶음: 단계 안내 (코스 맨 처음이면 전체 단계 순서까지)
        const road = st.unit === 0 ? `문자표 마스터 코스는 모두 ${ch.stages.length}단계야. ${ch.stages.map(s => `${s.n}단계 ${s.title}`).join(', ')}. 한 단계를 마스터해야 다음 단계가 열려. ` : '';
        return `${road}${sg.n}단계, ${sg.title} 시작! ${sg.desc || ''} 먼저 ${u.t.split(' · ').pop()}부터. 내가 먼저 읽으면, 삐 소리 뒤에 따라 읽어 봐.`;
      }
      return `${u.t}. ${u.tip} 내가 먼저 읽으면, 삐 소리 뒤에 따라 읽어 봐.`;
    }
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
#hgScriptView .hs-stages{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
#hgScriptView .hs-st{font-size:13px;font-weight:800;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.15)}
#hgScriptView .hs-st.on{background:#fff;color:#0f766e}
#hgScriptView .hs-st.done{background:rgba(255,255,255,.38)}
#hgScriptView .hs-pick.lock{opacity:.55;border-style:dashed}
#hgScriptView .hs-pick{display:flex;flex-direction:column;gap:3px;text-align:left;width:100%;border:2px solid #99f6e4;background:#fff;border-radius:16px;padding:14px;cursor:pointer;color:#0f172a}
#hgScriptView .hs-pick.on{border-color:#14b8a6;background:#f0fdfa}
#hgScriptView .hs-pick b{font-size:clamp(17px,4.8vw,19px);font-weight:900}
#hgScriptView .hs-pick span{font-size:15px;font-weight:700;color:#475569;line-height:1.45}
#hgScriptView .hs-pick em{font-style:normal;font-size:15px;font-weight:900;color:#0f766e}
#hgScriptView .hs-group{display:flex;flex-direction:column;gap:8px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:18px;padding:12px}
#hgScriptView .hs-group.on{border-color:#14b8a6}
#hgScriptView .hs-group>b{font-size:clamp(17px,4.8vw,19px);font-weight:900;color:#0f172a}
#hgScriptView .hs-group>span{font-size:15px;font-weight:700;color:#475569;line-height:1.45}
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
        <span class="hs-badge">${basis() === 'chart' ? '📋 문자표 기준' : '🔤 입문 단원'} · ${esc(scriptName())}</span>
        ${window.HGLETTERS ? '<button class="hs-badge" style="border:none;cursor:pointer;color:#fff;margin-left:6px" onclick="HGLETTERS.open()">📋 문자표 보기</button>' : ''}
        <button class="hs-badge" style="border:none;cursor:pointer;color:#fff;margin-left:6px" onclick="HGSCRIPT.start({choose:true})">🔀 기준 바꾸기</button>
        <div class="hs-title">${st.unit + 1}/${us.length}${basis() === 'chart' ? '' : '단원'} · ${esc(u.t)}</div>
        <div class="hs-sub">${PHASE_NAME[st.phase]} · ${session.pos + 1}/${total}</div>
        ${stageRoad(st)}
        <div class="hs-dots">${dots}</div>
      </div>
      <div class="hs-bar"><div style="width:${Math.round((session.pos / total) * 100)}%"></div></div>
      <div class="hs-card">${card}</div>
      ${btns}
      <button class="hs-skip" onclick="HGSCRIPT.skipToLevel1()">문자는 이미 읽을 수 있어요 → Lv.1로 건너뛰기</button>`;
  }

  // 문자표 마스터 코스의 단계 지도: ✅ 마스터 / ▶ 지금 / 🔒 아직
  function stageRoad(st) {
    const ch = basis() === 'chart' && chartInfo();
    if (!ch) return '';
    const cur = stageAt(st.unit);
    return '<div class="hs-stages">' + ch.stages.map(s => {
      const done = (st.mastered || []).includes(s.n), on = cur && cur.n === s.n;
      return `<span class="hs-st ${on ? 'on' : (done ? 'done' : '')}">${on ? '▶' : (done ? '✅' : '🔒')} ${s.n}단계 ${esc(s.title)}</span>`;
    }).join('') + '</div>';
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
    if (tn) tn.textContent = choosing ? '입문: 문자 배우기 · 기준 고르기'
      : `입문: ${basis() === 'chart' ? '문자표' : '문자 배우기'} · ${st.unit + 1}/${units().length}${basis() === 'chart' ? '' : '단원'}`;
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
    if (ok && ok.near) {  // 1·2회차 근접 통과: 넘어가되 무엇이 달랐는지 알려 준다 (혼자 읽는 3회차는 정확해야 통과)
      sfx('sparkle');
      session.fails = 0;
      const W = ok.want.toUpperCase(), N = ok.near.toUpperCase();
      const tip = /[vв]/.test(ok.want) ? `${W}는 윗니를 아랫입술에 살짝 대고 목을 울려 내요`
        : /[fф]/.test(ok.want) ? `${W}는 윗니를 아랫입술에 대고 바람만 내요`
        : /[bdgzбдгзж]/.test(ok.want) ? `${W}는 목을 울려 부드럽게, ${N}는 목을 울리지 않고 내요` : `${W}는 목을 울리지 않고, ${N}는 목을 울려 내요`;
      setStatus(`🙂 통과! 다만 ${N}처럼 들렸어요. ${tip}`, heard ? `들린 소리: ${esc(heard)}` : '');
      flowTimer = setTimeout(() => { if (my === speakSeq) advance(); }, 2200);
      return;
    }
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
    if (choosing) { renderChooser(); return; }
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

  function start(opts) {
    if (!basis() || (opts && opts.choose)) { openChooser(); return; }
    choosing = false;
    const st = load();
    if (st.done) Object.assign(st, { unit: 0, phase: 'c', pass: 1, done: false, order: null, pos: 0 });
    st.active = true;
    save(st);
    session = null;
    if (typeof updateLevelUI === 'function') updateLevelUI(); else show();
  }

  function leave() {
    choosing = false;
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
    } else if (st.phase === 'c' && ((units()[st.unit] || {}).w || []).length) {
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
    const sg = basis() === 'chart' ? stageAt(st.unit) : null;
    st.unit++; st.phase = 'c'; st.pass = 1; st.order = null; st.pos = 0;
    const stageDone = sg && st.unit > sg.last;
    if (stageDone) { st.mastered = st.mastered || []; if (!st.mastered.includes(sg.n)) st.mastered.push(sg.n); }
    save(st);
    if (st.unit >= units().length) { finishAll(); return; }
    sfx('fanfare');
    if (stageDone) {
      const next = stageAt(st.unit);
      if (window.HGUX && HGUX.celebrate) HGUX.celebrate(`🏅 ${sg.n}단계 마스터!`, `${josa(sg.title, '을', '를')} 모두 읽을 수 있어요.${next ? ` 이제 ${next.n}단계 ${josa(next.title, '이', '가')} 열렸어요!` : ''}`, true);
    } else if (window.HGUX && HGUX.celebrate) HGUX.celebrate(`🔤 ${u.t} 완료!`, '글자도 단어도 세 번씩 읽었어요. 다음 묶음으로!', false);
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
    const ch = basis() === 'chart' && chartInfo();
    const msg = ch
      ? `대단해 ${name}! 문자표 ${ch.stages.length}단계를 모두 마스터했어. 이제 ${scriptName()}는 문자 마스터야! Lv.1부터 진짜 문장을 배워 보자!`
      : `대단해 ${name}! ${scriptName()}를 모두 읽을 수 있게 됐어. 이제 Lv.1부터 진짜 문장을 배워 보자!`;
    if (window.HGUX && HGUX.celebrate) HGUX.celebrate(ch ? '🎓 문자 마스터!' : '🎓 문자 입문 완료!', msg, true);
    enterLevel1();
    // enterLevel1이 레벨 1 문장을 읽기 시작하므로 축하 대사는 그 뒤에 덮어쓰지 않도록 짧게 앞서 말한다
    if (typeof speakExileTutor === 'function') setTimeout(() => speakExileTutor(msg, 'ko'), 300);
  }

  function skipToLevel1() {
    sfx('whoosh');
    leave();
    enterLevel1();
  }

  /* ---------- 학습 기준 고르기: 입문 단원 코스 / 문자표 기준(단계 선택) ---------- */
  function readState(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }

  function openChooser() {
    choosing = true;
    session = null;
    speakSeq++;
    clearFlow();
    stopListen();
    if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio();
    if (typeof updateLevelUI === 'function') updateLevelUI(); else show();
    const lang = curLang();
    loadChart(lang).then(() => { if (choosing && curLang() === lang) renderChooser(); });
  }

  function renderChooser() {
    const v = ensureView();
    if (!v) return;
    ['viewDrill', 'viewRoleplay'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    v.style.display = '';
    syncHeader(load());
    const lang = curLang();
    const d = langData();
    const ch = chartCache[lang];
    const cur = basis();
    const uUnits = d ? d.units : [];
    // 진행 중인 코스가 있으면 '이어서' 표시
    const resume = (st, list) => (st && !st.done && (st.unit > 0 || st.pos > 0 || st.pass > 1 || st.phase === 'w') && list[st.unit]) ? list[st.unit].t : '';
    let html = `<div class="hs-head"><span class="hs-badge">🔤 입문 Lv.0 · ${esc(scriptName())}</span>
      <div class="hs-title">문자를 어떤 기준으로 배울까요?</div>
      <div class="hs-sub">고른 기준으로 엑자일 시범 → 따라 읽기 → 판정이 손대지 않아도 이어져요</div></div>`;
    // ① 문자표 마스터 코스(추천): 문자표의 단계 = 문자 익힘 단계, 1단계부터 순서대로 마스터
    if (ch) {
      const cst = chartState();
      const r = resume(readState(`hg_script_${lang}_chart`), ch.units);
      const curSg = r ? stageAt(cst.unit) : null;
      html += `<div class="hs-group ${cur === 'chart' ? 'on' : ''}"><b>🏆 문자표 마스터 코스 (추천)</b>
        <span>${esc(ch.title)} · 1단계부터 ${ch.stages.length}단계까지 순서대로 모두 마스터하면 문자 마스터! 표 순서대로 한 행·한 줄씩 글자 → 예시 단어를 3회차로 익혀요.</span>`;
      html += r
        ? `<button class="hs-pick on" onclick="HGSCRIPT.choose('chart')"><b>▶ 이어서 하기</b><span>${curSg ? `${curSg.n}단계 · ` : ''}${esc(r)}</span></button>`
        : `<button class="hs-pick on" onclick="HGSCRIPT.choose('chart', ${ch.stages[0].n})"><b>▶ 1단계부터 시작</b><span>${esc(ch.stages[0].title)}</span></button>`;
      ch.stages.forEach(s => {
        const done = (cst.mastered || []).includes(s.n), open = stageOpen(s.n, cst), now = curSg && curSg.n === s.n;
        const mark = done ? '✅ 마스터' : (now ? '▶ 진행 중' : (open ? '🔓 열림' : '🔒 잠김'));
        html += `<button class="hs-pick ${open ? '' : 'lock'}" onclick="HGSCRIPT.choose('chart', ${s.n})"><b>${s.n}단계 · ${esc(s.title)} <small style="font-size:14px;color:#0f766e">${mark}</small></b><span>${s.count}개 · ${esc(s.desc || '')}</span></button>`;
      });
      html += '</div>';
    } else if (window.HGLETTERS) {
      html += '<div class="hs-group"><b>🏆 문자표 마스터 코스 (추천)</b><span>문자표를 불러오는 중…</span></div>';
      loadChart(lang).then(c => { if (c && choosing && curLang() === lang) renderChooser(); });
    }
    // ② 빠른 입문 코스: 당장 급할 때 (일본어는 50음도 핵심 순서)
    if (uUnits.length) {
      const r = resume(readState(`hg_script_${lang}`), uUnits);
      html += `<button class="hs-pick ${cur === 'units' ? 'on' : ''}" onclick="HGSCRIPT.choose('units')">
        <b>⚡ 빠른 입문 코스</b><span>당장 급할 때 — ${lang === 'ja' ? '50음도 핵심 순서로 ' : ''}그림 카드와 함께 ${uUnits.length}단원 · 글자 → 단어를 3회차씩</span>${r ? `<em>▶ 이어서: ${esc(r)}</em>` : ''}</button>`;
    }
    html += '<button class="hs-skip" onclick="HGSCRIPT.skipToLevel1()">문자는 이미 읽을 수 있어요 → Lv.1로 건너뛰기</button>';
    v.innerHTML = html;
  }

  // b: 'units' | 'chart', stageN: 문자표 단계(주면 그 단계 처음부터, 안 주면 이어서)
  function choose(b, stageN) {
    const ch = chartCache[curLang()];
    if (b === 'chart' && !ch) return;
    sfx('bubble');
    choosing = false;
    setBasis(b);
    const st = load();
    if (st.done) Object.assign(st, { unit: 0, phase: 'c', pass: 1, done: false, order: null, pos: 0 });
    if (b === 'chart' && stageN != null) {
      const sg = ch.stages.find(s => s.n === stageN);
      if (sg && !stageOpen(sg.n, st)) {
        const prev = ch.stages[ch.stages.indexOf(sg) - 1];
        if (window.hgToast) hgToast(`🔒 ${sg.n}단계는 아직 잠겨 있어요<br><span style="font-size:14px">${prev.n}단계 ${esc(josa(prev.title, '을', '를'))} 먼저 마스터해 주세요</span>`, 2600);
      } else if (sg && stageAt(st.unit) !== sg) Object.assign(st, { unit: sg.first, phase: 'c', pass: 1, order: null, pos: 0 });
    }
    st.active = true;
    save(st);
    session = null;
    // 문자표 화면(기초 탭)에서 시작하면 수업 화면으로 옮겨야 마이크가 열린다. 수업 화면 밖에서는 micBlocked()가
    // 'navigation'으로 막아 문자표 코스 전체가 '마이크 입력을 못 받는' 상태였다 (실기기 2026-10-26)
    if (window.HGUI && HGUI.route() !== 'lesson') { HGUI.study('script'); return; }
    if (typeof updateLevelUI === 'function') updateLevelUI(); else show();
  }

  // 문자표 화면(② 플래시카드)의 '핸즈프리로 따라 읽기' → 그 단계부터 문자표 기준으로
  function startChart(stageN) {
    return loadChart(curLang()).then(ch => { if (ch) choose('chart', stageN); });
  }

  // 문자표 화면이 덮으면 시범·마이크를 멈추고, 닫히면 그 글자부터 다시 (불필요한 마이크 켜짐 방지)
  window.addEventListener('hg-letters', (e) => {
    if (!session) return;
    if (e.detail === 'open') {
      speakSeq++;
      clearFlow();
      stopListen();
      session.needVoice = true;
      session.status = '';
    } else if (e.detail === 'close' && isActive()) {
      const v = document.getElementById('hgScriptView');
      if (v && v.style.display !== 'none') show();
    }
  });

  /* ---------- 발음 판정 (음성 인식) ---------- */
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC').toLowerCase()  // NFC: 탁점(が·じ) 재결합
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))  // 가타카나 → 히라가나로 맞춰 비교
    .replace(/[\s.,!?¡¿'"·\-_ー~()（）、。，！？]/g, '');

  /* 글자 하나만 말하면 인식기는 그 글자 대신 소리가 같은 단어·한자를 돌려준다 (C→"see", か→"蚊", b→"八"→"吧").
     그래서 "읽기 → 인식기가 흔히 돌려주는 표기" 별칭표로 같은 소리를 통과시킨다. 다른 글자로 오인될 별칭(ы→и 등)은 넣지 않는다. */
  const ALIAS_SRC = {
    en: 'a:hey,eh,ay,ah;b:be,bee;c:see,sea,si;d:dee,the;e:ee,he;f:ef,eff,if;g:gee,jee,ji;h:age,aitch,eight,8;i:eye,aye,hi;j:jay;k:kay,okay,ok;l:el,elle,ell;m:em,am;n:en,and,in;o:oh,owe;p:pee,pea;q:queue,cue;r:are,our,or;s:es,yes,ass;t:tea,tee;u:you,yu;v:vee,we;w:double u,double you;x:ex,eggs;y:why;z:zee,zed',
    fr: "a:à,ah;b:bé,bébé;c:c'est,ces,ses,sait;d:dé,des;e:eux,euh,œufs;f:effe,ef;g:j'ai,geai,gé;h:hache,ache;i:il,y,hi;j:ji,gi;k:ka,ca,ça,cas;l:elle,el;m:aime,emme;n:haine,aine;o:eau,au,oh,haut;p:paix,pé,pet;q:cul,qu,ku;r:air,erre,hair;s:esse,es;t:thé,té,tes;u:eu,hu,eut;v:vé,vais;w:double vé;x:ixe,iks;y:i grec,igrec;z:zed,zède",
    es: 'a:ah,ha;e:eh,he;i:y,hi;o:oh,ho;u:uh;be:b,ve,bebe;ce:c,se,sé;de:d,dé;efe:f;ge:g,je,he;hache:h,ache;jota:j;ka:k,ca,qa;ele:l,el;eme:m;ene:n;eñe:ñ;pe:p;cu:q,qu,ku;erre:r,ere;ese:s,es;te:t,té;uve:v,ube;uve doble:w,doble uve,doble ve;equis:x;ye:y,i griega,lle;zeta:z,ceta,seta',
    ru: 'бэ:бе,б;вэ:ве,в;гэ:ге,г;дэ:де,д;жэ:же,ж;зэ:зе,з;ка:к;эль:эл,ель,л;эм:ем,м;эн:ен,н;пэ:пе,п;эр:ер,р;эс:ес,с;тэ:те,т;эф:еф,ф;ха:х;цэ:це,ц;че:ч,чё;ша:ш;ща:щ;и краткое:и краткий,й;твёрдый знак:твердый,твёрдый,ъ;мягкий знак:мягкий,ь',
    ja: 'あ:亜,阿;い:胃,井,意,位,医;う:鵜,卯;え:絵,江,柄,会;お:尾,御,緒;か:蚊,課,可,科,化,火;き:木,気,器,機,黄,期;く:九,区,句,苦,9;け:毛;こ:子,個,粉,小,湖;さ:差,左,佐;し:市,死,詩,四,氏,師,4;す:酢,巣;せ:背,瀬,世;そ:祖,素;た:田,他,多;ち:血,地,知,値,千;つ:津;て:手;と:戸,都,十;な:名,菜,奈;に:二,荷,似,2;ぬ:奴;ね:根,音,寝;の:野,乃;は:歯,葉,刃,派,羽,波;ひ:日,火,比,非,灯;ふ:府,布,負,不,夫;へ:屁,経;ほ:帆,穂,歩,保;ま:間,魔,真,馬;み:身,実,見,三,3;む:無,六,夢;め:目,芽;も:藻,喪;や:矢,屋,夜,野;ゆ:湯,油;よ:世,夜,四,余;ら:等,羅;り:理,利,里;る:留,流;れ:例,礼,令;ろ:炉,路,呂;わ:輪,和,環;を:お,尾,御;ん:うん,運;が:我,画,蛾;ぎ:義,技;ぐ:具;げ:下,外;ご:後,五,語,碁,5;ざ:座;じ:字,時,地,次,事;ず:図,頭;ぜ:是;だ:打,駄;ぢ:じ,地;づ:ず,図;で:出;ど:度,土;ば:場,婆;び:美,微;ぶ:部,分;べ:辺;ぼ:母,簿;きゃ:客,脚;きゅ:急,九;きょ:去,巨,虚,今日;しゃ:者,社,写,車,斜;しゅ:主,種,酒,朱;しょ:書,所,諸,署;ちゃ:茶;ちゅ:中;ちょ:著;にょ:女;ひゃ:百;ひょ:表,票;みょ:妙;りゃ:略;りゅ:竜,龍;りょ:旅,料,両,量;ぎゃ:逆;ぎょ:魚;じゃ:蛇,邪;じゅ:十,受;じょ:女,序;びょ:秒,病',
    cn: '妈:妈妈,抹;麻:嘛,蟆;马:码,蚂,玛;骂:蚂;诗:师,湿,失,狮,施;十:时,石,实,识,食,拾,10;使:始,史,驶;是:事,市,试,室,世,式,视,示,士;啊:阿,呀,a;我:哦,喔,窝,噢;饿:鹅,额,俄,恶;一:衣,医,依,1;五:无,屋,舞,乌,武,5;鱼:于,雨,语,余;二:而,儿,耳,2;爱:哎,唉;黑:嘿;好:号;狗:够;家:加,佳;谢谢:谢;小:笑,晓;六:刘,流,6;花:华,话;快:块;月:越,约;饭:范,反;忙:芒;门:们;听:厅;红:洪,虹;天:田;两:亮,俩;熊:雄;晚:万,碗;春:纯;黄:皇;远:院,元;云:运,允;八:吧,爸,巴,拔,8;怕:爬,趴;飞:非,菲;大:达,打;他:她,它,塔;你:呢,泥;来:啦,拉;哥哥:哥,歌,个;开:凯;喝:和,河,合,呵;鸡:机,几,基,级;七:期,起,气,7;西:洗,喜,系,息;中:种,钟,终;吃:迟,池;书:输,叔,舒;热:日;字:子,自;菜:才,财,彩;四:死,思,丝,4;三:伞,散,3;九:酒,久,就,旧,9;人:仁,任;国:过,果,锅;上:尚;下:吓,夏;有:又,友,右;水:谁,睡;火:伙,或;口:扣;不:部,步,布'
  };
  /* 단어를 일본어 인식기는 한자로 돌려준다(ねこ→猫). 단어 판정 전에 한자 표기를 가나로 되돌린다(긴 것부터). */
  const JA_YOMI_SRC = '本を読む:ほんをよむ;有難う:ありがとう;有り難う:ありがとう;愛:あい;藍:あい;青:あお;秋:あき;朝:あさ;兄:あに;雨:あめ;飴:あめ;家:いえ;池:いけ;椅子:いす;糸:いと;犬:いぬ;上:うえ;嘘:うそ;海老:えび;海:うみ;駅:えき;鉛筆:えんぴつ;甥:おい;お菓子:おかし;御菓子:おかし;菓子:かし;お茶:おちゃ;顔:かお;家具:かぐ;傘:かさ;風邪:かぜ;風:かぜ;家族:かぞく;鞄:かばん;乾杯:かんぱい;学校:がっこう;菊:きく;聞く:きく;切手:きって;茸:きのこ;客:きゃく;胡瓜:きゅうり;今日:きょう;金魚:きんぎょ;逆:ぎゃく;牛乳:ぎゅうにゅう;銀行:ぎんこう;靴:くつ;熊:くま;車:くるま;煙:けむり;元気:げんき;鯉:こい;恋:こい;米:こめ;蒟蒻:こんにゃく;ご飯:ごはん;御飯:ごはん;魚:さかな;桜:さくら;三百:さんびゃく;300:さんびゃく;散歩:さんぽ;雑誌:ざっし;塩:しお;写真:しゃしん;宿題:しゅくだい;食事:しょくじ;白:しろ;城:しろ;時間:じかん;邪魔:じゃま;授業:じゅぎょう;上手:じょうず;寿司:すし;鮨:すし;雀:すずめ;世界:せかい;席:せき;咳:せき;外:そと;蕎麦:そば;空:そら;象:ぞう;蛸:たこ;凧:たこ;卵:たまご;玉子:たまご;蒲公英:たんぽぽ;大学:だいがく;地下鉄:ちかてつ;地図:ちず;注意:ちゅうい;一寸:ちょっと;月:つき;続く:つづく;手紙:てがみ;手:て;天気:てんき;天ぷら:てんぷら;天麩羅:てんぷら;電話:でんわ;時計:とけい;動物:どうぶつ;夏:なつ;肉:にく;日本:にほん;入学:にゅうがく;布:ぬの;猫:ねこ;海苔:のり;八百:はっぴゃく;800:はっぴゃく;鼻血:はなぢ;花:はな;鼻:はな;薔薇:ばら;飛行機:ひこうき;人:ひと;百:ひゃく;100:ひゃく;豹:ひょう;表:ひょう;平仮名:ひらがな;病院:びょういん;船:ふね;舟:ふね;豚:ぶた;臍:へそ;部屋:へや;弁当:べんとう;星:ほし;本:ほん;帽子:ぼうし;窓:まど;蜜柑:みかん;水:みず;耳:みみ;脈:みゃく;苗字:みょうじ;名字:みょうじ;虫:むし;娘:むすめ;目:め;桃:もも;森:もり;山:やま;雪:ゆき;夜:よる;来年:らいねん;略語:りゃくご;竜:りゅう;龍:りゅう;旅行:りょこう;林檎:りんご;留守:るす;歴史:れきし;蝋燭:ろうそく;私:わたし;三日月:みかづき;餃子:ぎょうざ;茗荷:みょうが;量:りょう;料:りょう;漁:りょう';
  let ALIAS = null, JA_YOMI = null;
  function aliasOf(lang, t) {
    if (!ALIAS) {
      ALIAS = {};
      Object.keys(ALIAS_SRC).forEach(l => {
        const m = ALIAS[l] = {};
        ALIAS_SRC[l].split(';').forEach(e => {
          const [k, v] = e.split(':');
          if (k && v) m[norm(k)] = (m[norm(k)] || []).concat(v.split(',').map(norm).filter(Boolean));
        });
        // 라틴·키릴 언어는 거꾸로도 찾는다: 문자표 소리 칸의 대상이 'б'이면 이름 'бэ'와 그 별칭(бе)도 같은 소리 (한자·가나는 오인 합격 우려로 제외)
        if (l === 'ru' || l === 'es' || l === 'fr') Object.keys(m).forEach(k => m[k].forEach(v => {
          if (v === k || ALIAS_SRC[l].split(';').some(e => norm(e.split(':')[0]) === v)) return;
          m[v] = (m[v] || []).concat(k, m[k].filter(x => x !== v));
        }));
      });
    }
    return (ALIAS[lang] || {})[t] || [];
  }
  function jaKana(s) {
    if (!JA_YOMI) JA_YOMI = JA_YOMI_SRC.split(';').map(e => e.split(':')).filter(e => e[0] && e[1]).sort((a, b) => b[0].length - a[0].length);
    let out = String(s || '');
    JA_YOMI.forEach(([k, v]) => { if (out.includes(k)) out = out.split(k).join(v); });
    return out;
  }
  function editSim(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return 1 - prev[b.length] / Math.max(a.length, b.length);
  }
  // 한 대상(t)과 들린 소리 하나(raw)가 같은 소리인가
  function hitOne(lang, raw, t) {
    const n = norm(raw);
    if (!n) return false;
    if (n === t) return true;
    const al = aliasOf(lang, t);
    if (al.includes(n)) return true;
    const latin = /[a-zа-я]/.test(t);
    if (latin) {
      // "the letter c" · "c c" 처럼 낱말로 끊어 말한 경우: 낱말 하나가 정확히 대상/별칭이면 통과
      const toks = String(raw).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[\s.,!?¡¿"·\-_~()]+/).map(norm).filter(Boolean);
      if (toks.some(w => w === t || al.includes(w))) return true;
    } else if (n.split(t).join('') === '') return true;  // 妈妈 · かか 처럼 같은 글자를 되풀이
    // 짧은 대상은 부분 일치를 허용하지 않는다(かさ를 か로, bebe를 be로 통과시키지 않음). 가나·한자는 2글자(ねこ)부터 '猫です'처럼 포함 허용
    if (t.length < (latin ? 3 : 2)) return false;
    if (n.includes(t)) return true;
    if (t.length < 3) return false;
    if (t.includes(n) && n.length >= t.length * 0.6) return true;
    return editSim(n, t) >= (t.length <= 4 ? 0.75 : 0.6);  // 짧은 낱말은 한 글자 차이도 다른 글자(efe≠ese)
  }
  /* 알파벳·키릴 글자 카드: 인식기는 글자 하나를 "PvP"·"pie"처럼 흐트러뜨려 돌려주므로 짧은 낱말의 첫 자음으로 본다.
     초보자용 1회차는 유성·무성 짝(B↔P 등)도 '근접 통과'로 넘기고 차이를 알려 준다. 2·3회차는 같은 자음이어야 한다 (실기기 2026-10-26: 한국어 '베'가 P로 인식) */
  const VOICE_PAIR = { b: 'p', p: 'b', d: 't', t: 'd', g: 'k', k: 'g', v: 'f', f: 'v', z: 's', s: 'z',
    'б': 'п', 'п': 'б', 'д': 'т', 'т': 'д', 'г': 'к', 'к': 'г', 'в': 'ф', 'ф': 'в', 'з': 'с', 'с': 'з', 'ж': 'ш', 'ш': 'ж' };
  const LIP_NEAR = { v: ['b', 'p'], f: ['p'], 'в': ['б', 'п'], 'ф': ['п'] };
  const firstCons =(s) => (String(s).match(/[bcdfghjklmnpqrstvwxzбвгджзйклмнпрстфхцчшщ]/) || [])[0] || '';
  function consonantHit(alts, item) {
    if (!['en', 'fr', 'es', 'ru'].includes(curLang()) || !/^\S( \S)?$/.test(item.c || '')) return false;
    const want = firstCons(String(item.c).toLowerCase());  // 카드 글자 자체의 자음 (말하기 대상 'e, petit'의 p가 아니라)
    if (!want) return false;  // 모음 글자는 기존 별칭·단어 판정
    // 짧은 말(글자 이름)은 첫 자음, 긴 단어는 그 자음으로 시작할 때만 ('déterminant' ← '데, 도미노')
    const heard = alts.flatMap(a => String(a).toLowerCase().split(/[\s.,!?¡¿'"·\-_~()]+/)).map(norm)
      .filter(w => w && (w.length <= 4 || firstCons(w) === w[0])).map(firstCons);
    if (heard.includes(want)) return true;
    // 스페인어 b·v는 같은 소리 ('ballena' → 'vayana')
    if (curLang() === 'es' && (want === 'b' || want === 'v') && heard.includes(want === 'b' ? 'v' : 'b')) return true;
    // 한국어에 없는 v·f는 b·p로 나기 쉽다 ('вода' → 'Пада', 실기기 2026-10-26)
    const nearOf = [VOICE_PAIR[want], ...(LIP_NEAR[want] || [])].filter(Boolean);
    // 딱딱한 c·q도 k 소리 ('gâteau' → 'catin'). 시범이 있는 1·2회차만 근접 통과, 혼자 읽는 3회차는 정확해야
    const near = load().pass <= 2 && heard.find(h => nearOf.includes(h) || (nearOf.includes('k') && (h === 'c' || h === 'q')));
    if (near) return { near, want };
    return false;
  }
  function isHit(alts, item, pic) {
    const lang = curLang();
    // '이름, 단어' 시범이면 이름만 말해도 정답 (모음 'a, ami' ← 'ah')
    const targets = [item.s, String(item.s || '').split(', ')[0], item.c, item.p, pic && pic.w].map(norm).filter(Boolean);
    const hit = alts.some(a => {
      const cand = lang === 'ja' ? [a, jaKana(a)] : [a];
      return cand.some(c => targets.some(t => hitOne(lang, c, t)));
    });
    return hit || consonantHit(alts, item);
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
    r.hints = [item.s, item.c, pic && pic.w].filter(Boolean);   // 한 음절도 알아듣게 목표 글자를 인식기에 힌트로
    r.onstart = () => { try { isRecordingSTT = true; } catch (e) {} setStatus('🎙️ 지금 읽어 보세요!'); };
    r.onresult = (ev) => {
      if (recognizer !== r) return;
      got = true;
      const alts = Array.from(ev.results[0] || []).map(a => a.transcript || '');
      const ok = isHit(alts, item, pic);
      if (window.HGVOICE && HGVOICE.note) HGVOICE.note({ target: item.s || item.c, pass: ok });
      judged(ok, alts[0] || '');
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

  window.HGSCRIPT = { scriptName, units, isActive, show, hide, start, leave, retry, pass, listen, skipToLevel1, load, save, pictures, choose, startChart, basis, isHit };
})();
