/* 한걸음 '오늘의 다이얼로그' (HGDIALOG) — 2026-10-27 옵빠야 지시
   새 세트를 시작할 때마다, 그 세트의 상황 속에서 2~3명이 서로 다른 목소리로 주고받는 대화를
   채팅(좌우 말풍선) 형식으로 먼저 들려준다. 대화에는 이 세트 4라운드 문장이 그대로 들어가고(⭐ 표시),
   대화가 끝나면 바로 그 문장들로 기존 핸즈프리 수업(시범 → 따라 말하기 → 확인)이 이어진다.
   - 길이: 레벨별로 조절 (Lv.1~10 약 1분 8줄 → Lv.31 이상 약 3분 20~26줄)
   - Gemini 키(무료)가 있으면 대화를 새로 만들고 세트별로 저장, 없거나 실패하면 4라운드 문장으로 짧은 대화
   - 목소리: 언어별 원어민 Edge 남녀 목소리. 목소리가 2개뿐인 언어의 3번째 화자는 같은 성별 목소리를 빠르기만 달리 한다
   - 수업 진입점: index.html playTargetTTSAndAutoListen() 맨 앞의 HGDIALOG.intercept() */
(function () {
  const SEEN_KEY = 'hg_dlg_seen';
  const cacheKey = (c) => `hg_dlg_${c.id}`;
  const sig = (c) => `${c.id}|${c.title}`;

  const VOICES = {
    fr: { female: ['fr-FR-DeniseNeural'], male: ['fr-FR-HenriNeural'] },
    ja: { female: ['ja-JP-NanamiNeural'], male: ['ja-JP-KeitaNeural'] },
    cn: { female: ['zh-CN-XiaoxiaoNeural'], male: ['zh-CN-YunxiNeural', 'zh-CN-YunjianNeural', 'zh-CN-YunyangNeural'] },
    en: { female: ['en-US-JennyNeural', 'en-US-MichelleNeural', 'en-US-AriaNeural'], male: ['en-US-GuyNeural', 'en-US-EricNeural', 'en-US-ChristopherNeural'] },
    es: { female: ['es-ES-ElviraNeural'], male: ['es-ES-AlvaroNeural'] },
    ru: { female: ['ru-RU-SvetlanaNeural'], male: ['ru-RU-DmitryNeural'] }
  };
  // 키가 없을 때 짧은 대화의 두 사람
  const NAMES = {
    fr: [['Léa', 'female'], ['Hugo', 'male']], ja: [['さくら', 'female'], ['けんた', 'male']], cn: [['小美', 'female'], ['小明', 'male']],
    en: [['Emma', 'female'], ['Jake', 'male']], es: [['Lucía', 'female'], ['Pablo', 'male']], ru: [['Аня', 'female'], ['Миша', 'male']]
  };
  const SIDE_COLORS = [
    { bg: '#ecfdf5', border: '#99f6e4', name: '#0f766e', avatar: '#ccfbf1' },  // 0 왼쪽
    { bg: '#eef2ff', border: '#c7d2fe', name: '#4338ca', avatar: '#e0e7ff' },  // 1 오른쪽
    { bg: '#fffbeb', border: '#fde68a', name: '#b45309', avatar: '#fef3c7' }   // 2 왼쪽(세 번째 사람)
  ];

  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 공간 부족 등은 무시 */ } };
  const lang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';
  const norm = (s) => String(s || '').toLowerCase().normalize('NFC').replace(/[\s\p{P}\p{S}]/gu, '');
  const epoch = () => (window.HGUI && HGUI.epoch ? HGUI.epoch() : 0);

  let cur = null;          // { c, dlg, idx, playing, epoch, timer }
  const progress = {};     // sig → 들은 줄 수 (멈췄다 돌아오면 이어서)

  /* ---------- 길이: 레벨별 ---------- */
  // 대화 길이 기준(대략): 구간별 자연스러운 길이. 학습 문장 수에 맞춰 늘리지 않는다 —
  // 2026-10-28 옵빠야 지시: 대화는 주제대로 자연스럽게, 학습 문장은 그 대화에서 레벨 수만큼 고름. 단, 고를 문장 수보다는 몇 줄 더 길게
  function lineCount(level, n) {
    const base = level <= 10 ? 8 : level <= 20 ? 12 : level <= 30 ? 16 : level <= 40 ? 20 : 26;
    if (n == null) n = window.HGV2 && HGV2.sentenceCount ? HGV2.sentenceCount(level) : 4;
    return Math.max(base, n + 3);
  }

  /* ---------- 대화 만들기 ---------- */
  function buildPrompt(c) {
    const lv = c.level || (typeof currentLevel !== 'undefined' ? currentLevel : 1);
    const band = window.HGV2 ? HGV2.bandOf(lv) : { name: '', spec: '' };
    const L = (window.HGV2 && HGV2.LANG_NAME && HGV2.LANG_NAME[lang()]) || lang();
    const n = lineCount(lv, c.rounds.length);
    const rounds = c.rounds.map((r, i) => `${i + 1}. ${r.target} (뜻: ${r.ko})`).join('\n');
    return `당신은 한국인 학습자를 위한 ${L} 회화 대본 작가입니다.
세계관: 안드로메다에서 지구로 유배 온 AI 튜터 '엑자일'이 학습자에게 지구 사람들의 실제 대화를 엿듣게 해 줍니다.

[이번 세트]
- 상황: "${c.title}" — ${c.situationKo || ''}
- 키워드: ${(c.keywords || []).join(', ')}
- 레벨: Lv.${lv} (${band.name}) — 난이도 기준: ${band.spec}
${window.HGV2 && HGV2.roadmapLine ? HGV2.roadmapLine(lang(), lv) + '\n' : ''}- 이 세트에서 배울 문장 ${c.rounds.length}개 (대화 안에 철자 그대로, 이 순서대로, 각각 정확히 한 번씩 넣을 것):
${rounds}

[대본 규칙]
- 이 상황에 실제로 있을 법한 사람 2명 또는 3명 (상황에 맞게 정하기. 예: 손님·점원 2명, 친구 셋 3명).
- 전체 ${n}줄 안팎. 한 줄은 한 사람의 한 번 말하기.
- 배울 문장 외의 줄도 레벨 난이도를 넘지 말 것. 짧고 자연스러운 구어.
- 배울 문장이 나오기 전후 맥락이 자연스럽게 이어지게.

반드시 아래 JSON만 출력하세요:
{"speakers":[{"name":"${L} 이름","role":"역할(한국어 6자 이내)","gender":"female 또는 male","emoji":"이모지 1개"}, ...2~3명],
"lines":[{"s":화자 번호(0부터),"t":"${L} 대사","p":"[한글 발음${lang() === 'cn' ? ' · 병음' : ''}]","ko":"한국어 뜻"}, ...]}`;
  }

  function validate(obj, c) {
    if (!obj || !Array.isArray(obj.speakers) || !Array.isArray(obj.lines)) return null;
    const speakers = obj.speakers.slice(0, 3).map((s, i) => ({
      name: String(s.name || `#${i + 1}`).slice(0, 20), role: String(s.role || '').slice(0, 12),
      gender: s.gender === 'male' ? 'male' : 'female', emoji: String(s.emoji || '🙂').trim().slice(0, 8)
    }));
    if (speakers.length < 2) return null;
    const lines = obj.lines.map(l => ({
      s: Math.min(Math.max(0, parseInt(l.s, 10) || 0), speakers.length - 1),
      t: String(l.t || '').trim(), p: String(l.p || '').trim(), ko: String(l.ko || '').trim()
    })).filter(l => l.t).slice(0, 32);
    if (lines.length < 4) return null;
    // 배울 문장 표시: 대사 안에 그 문장이 들어 있으면 ⭐
    let found = 0;
    c.rounds.forEach((r, ri) => {
      const want = norm(r.target);
      const hit = want && lines.find(l => l.round == null && norm(l.t).includes(want));
      if (hit) { hit.round = ri + 1; found++; }
    });
    if (found !== c.rounds.length) return null;  // 수업 문장이 대화에 거의 안 나오면 '대화에서 나온 것으로 수업'이 깨지므로 다시
    return { speakers, lines, source: 'ai' };
  }

  // 키가 없거나 실패: 4라운드 문장을 두 사람이 번갈아 말하는 짧은 대화
  function fallback(c) {
    const names = NAMES[lang()] || NAMES.en;
    return {
      speakers: names.map(([name, gender], i) => ({ name, gender, role: i ? '친구' : '나', emoji: gender === 'male' ? '🧑' : '👩' })),
      lines: c.rounds.map((r, i) => ({ s: i % 2, t: r.target, p: r.phonetic || '', ko: r.ko || '', round: i + 1 })),
      source: 'builtin'
    };
  }

  function cachedDialog(c) {
    const cached = load(cacheKey(c), null);
    return cached && cached.sig === sig(c) && cached.dlg && validate(cached.dlg, c) ? cached.dlg : null;
  }
  // GPT 대본은 응답이 수십 초 걸릴 수 있어 세트 단위로 한 번만 만들고, 진행 중인 요청은 함께 기다린다.
  // 수업이 끝나기 전에 미리 만들어 두면(prefetch) 새 세트 시작 때 바로 재생된다.
  // 설정에서 고른 구독 AI (ChatGPT 또는 Claude). 준비되지 않았으면 null
  const llm = () => (window.HGLLM ? HGLLM.active() : (window.HGCHATGPT && HGCHATGPT.ready() ? { id: 'chatgpt', api: HGCHATGPT } : null));
  const isCancel = e => !!e && (e.code === 'CANCELLED' || e.name === 'AbortError');
  const gptPending = {};
  function gptDialog(c, background, ai) {
    const key = sig(c);
    if (gptPending[key]) return gptPending[key].promise;
    const ctrl = new AbortController();
    const promise = (async () => {
      const text = await ai.api.generate(buildPrompt(c), {kind:'dialogue', background, signal: ctrl.signal});
      const dlg = validate(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()), c);
      if (!dlg) throw new Error('학습 문장 4개가 모두 포함된 대본을 받지 못했어요.');
      dlg.source = ai.id;  // 실제 생성 출처: chatgpt | claude (저장 후 다시 열어도 유지)
      save(cacheKey(c), { sig: sig(c), dlg });
      return dlg;
    })().finally(() => { if (gptPending[key] && gptPending[key].ctrl === ctrl) delete gptPending[key]; });
    gptPending[key] = { promise, ctrl };
    return promise;
  }
  // 건너뛰기·내장 대본 대체로 이 세트 대본을 더 쓰지 않게 되면 생성을 멈춰 플랜 사용량을 아낀다 (다른 세트 미리 만들기는 유지)
  function cancelGpt(c) {
    const p = c && gptPending[sig(c)];
    if (p) { delete gptPending[sig(c)]; p.ctrl.abort(); }
  }
  // 2026-10-28: 오늘 주제 세트는 세트와 대본을 한 번에 받는다(HGV2.generateTopicSet) → 규칙 검사 후 이 세트 대본으로 저장
  function adopt(c, obj, source) {
    const dlg = validate(obj, c);
    if (!dlg) return false;
    dlg.source = source || 'gemini';
    save(cacheKey(c), { sig: sig(c), dlg });
    return true;
  }
  /** 다음 세트 대본을 뒤에서 미리 생성 (이미 들었거나 저장돼 있으면 생략) */
  function prefetch(c) {
    if (!c || !Array.isArray(c.rounds) || c.rounds.length < 4 || c.lang !== lang()) return;
    const ai = llm();
    if (!ai || cachedDialog(c) || load(SEEN_KEY, []).includes(sig(c))) return;
    gptDialog(c, true, ai).catch(e => console.warn('[HGDIALOG] 대본 미리 만들기 실패', e.message));
  }
  // 새 세트 시작 때 GPT 대본을 기다리는 최대 시간. 넘으면 내장 대본으로 바로 수업을 이어 가고,
  // 생성은 계속 진행돼 저장된다(다시 듣기·다음 방문에 사용). 수업 자동 시작이 멈추지 않게 한다.
  const GPT_WAIT_MS = 12000;

  async function getDialog(c) {
    const cached = cachedDialog(c);
    if (cached) return cached;
    let dlg = null;
    // 설정에서 고른 구독 AI(ChatGPT·Claude)는 대본만 생성한다. 음성은 기존 누리보이스 경로를 사용한다.
    const ai = llm();
    if (ai) {
      let timer;
      try {
        const late = new Promise(resolve => { timer = setTimeout(() => resolve(null), GPT_WAIT_MS); });
        dlg = await Promise.race([gptDialog(c, false, ai), late]);
        if (dlg) return dlg;
        cancelGpt(c);
        if (window.hgToast) hgToast(`${ai.label || 'AI'} 대본이 늦어 짧은 대화로 먼저 시작해요.`, 3500);
        return fallback(c);
      } catch (e) {
        if (isCancel(e)) return fallback(c);
        // 2026-10-28 옵빠야 지시: 한도·오류면 무료 Gemini(키가 있을 때, 아래) → 없거나 실패하면 내장 대본. 유료 경로로는 넘어가지 않는다.
        const next = window.HGV2 && HGV2.apiKey && HGV2.apiKey() ? '무료 Gemini 대본' : '내장 대본';
        if (window.hgToast) hgToast(esc(e.message) + `<br>${next}으로 이어갑니다.`, 4500);
      } finally { clearTimeout(timer); }
    }
    if (window.HGV2 && HGV2.apiKey && HGV2.apiKey()) {
      for (let attempt = 0; attempt < 2 && !dlg; attempt++) {
        try {
          const text = await HGV2.geminiCall({
            contents: [{ parts: [{ text: buildPrompt(c) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 }
          }, 20000, { geminiOnly: true });
          dlg = validate(JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()), c);
        } catch (e) {
          console.warn('[HGDIALOG] 대화 생성 실패', e.message);
          if (/NO_KEY|API 키 오류/.test(e.message)) break;
        }
      }
      if (dlg) { dlg.source = 'gemini'; save(cacheKey(c), { sig: sig(c), dlg }); }
    }
    return dlg || fallback(c);
  }

  /* ---------- 목소리 ---------- */
  function assignVoices(dlg) {
    const pool = VOICES[lang()] || VOICES.en;
    const used = { female: 0, male: 0 };
    dlg.speakers.forEach(s => {
      const list = pool[s.gender];
      const n = used[s.gender]++;
      s.voice = list[n % list.length];
      // 같은 목소리를 또 쓰게 되면 빠르기로 구별 (Edge 경로는 높낮이 조절이 없음)
      s.rate = n >= list.length ? 0.9 : 1.0;
    });
  }
  function speakLine(line, onDone) {
    const sp = cur.dlg.speakers[line.s];
    let fired = false;
    const once = () => { if (fired) return; fired = true; clearTimeout(guard); onDone(); };
    const guard = setTimeout(once, 15000 + line.t.length * 200);
    if (typeof speakTextWithFallback === 'function') {
      speakTextWithFallback(line.t, lang(), { forceEngine: 'edge', forceVoice: sp.voice, rate: sp.rate, onDone: once });
    } else setTimeout(once, 800);
  }
  // 다음 줄을 미리 합성해 두어 줄 사이 대기를 줄인다
  function prefetchLine(line) {
    if (!line) return;
    try {
      const eng = typeof getNuriMasterEngine === 'function' ? getNuriMasterEngine() : null;
      const sp = cur.dlg.speakers[line.s];
      if (eng && eng.prefetch) eng.prefetch(line.t, { engine: 'edge', voice: sp.voice, lang: nuriLangCode(lang()), rate: sp.rate });
    } catch (e) { /* 미리 받기 실패는 재생 때 다시 받음 */ }
  }

  /* ---------- 화면 ---------- */
  function injectStyle() {
    if (document.getElementById('hgDialogStyle')) return;
    const st = document.createElement('style');
    st.id = 'hgDialogStyle';
    st.textContent = `
#hgDialog{position:fixed;inset:0;z-index:9000;background:#f8fafc;display:flex;flex-direction:column;max-width:560px;margin:0 auto}
#hgDialog .hd-head{padding:14px 16px 10px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff}
#hgDialog .hd-kicker{font-size:13px;font-weight:800;opacity:.9}
#hgDialog .hd-topline{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
#hgDialog .hd-source{margin-left:auto;flex:none;font-size:12px;font-weight:800;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.2);color:#fff}
#hgDialog .hd-title{font-size:clamp(19px,5.4vw,22px);font-weight:900;margin-top:2px}
#hgDialog .hd-sit{font-size:14px;font-weight:700;opacity:.92;margin-top:4px;line-height:1.4}
#hgDialog .hd-cast{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#hgDialog .hd-cast span{background:rgba(255,255,255,.2);border-radius:999px;padding:3px 10px;font-size:13px;font-weight:800}
#hgDialog .hd-log{flex:1;overflow-y:auto;padding:14px 12px 8px;display:flex;flex-direction:column;gap:10px}
#hgDialog .hd-row{display:flex;gap:8px;align-items:flex-end;max-width:100%;animation:hdIn .25s ease}
#hgDialog .hd-row.r{flex-direction:row-reverse}
#hgDialog .hd-av{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px}
#hgDialog .hd-bub{border:1.5px solid;border-radius:16px;padding:9px 12px;max-width:78%;text-align:left}
#hgDialog .hd-row.r .hd-bub{text-align:left}
#hgDialog .hd-name{font-size:12px;font-weight:900;margin-bottom:2px}
#hgDialog .hd-t{font-size:clamp(17px,4.8vw,19px);font-weight:800;color:#0f172a;line-height:1.35}
#hgDialog .hd-p{font-size:13px;font-weight:700;color:#64748b;margin-top:2px}
#hgDialog .hd-ko{font-size:14px;font-weight:700;color:#334155;margin-top:3px}
#hgDialog.no-ko .hd-ko{display:none}
#hgDialog .hd-star{display:inline-block;margin-top:5px;font-size:12px;font-weight:900;color:#b45309;background:#fef3c7;border-radius:8px;padding:2px 7px}
#hgDialog .hd-row.now .hd-bub{box-shadow:0 0 0 3px #5eead4}
#hgDialog .hd-typing{font-size:20px;color:#94a3b8;letter-spacing:3px;padding:4px 14px}
#hgDialog .hd-bar{display:flex;gap:8px;padding:10px 12px calc(12px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #e2e8f0}
#hgDialog .hd-btn{flex:1;min-height:50px;border:1.5px solid #cbd5e1;border-radius:14px;background:#fff;color:#0f172a;font-size:clamp(15px,4.2vw,16px);font-weight:900;cursor:pointer}
#hgDialog .hd-btn.go{background:#14b8a6;border-color:#14b8a6;color:#fff}
#hgDialog .hd-prog{height:4px;background:#e2e8f0}
#hgDialog .hd-prog>div{height:100%;background:#14b8a6;transition:width .3s}
@keyframes hdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`;
    document.head.appendChild(st);
  }

  function bubble(line, i) {
    const d = cur.dlg, sp = d.speakers[line.s], col = SIDE_COLORS[line.s] || SIDE_COLORS[0];
    const right = line.s === 1;
    return `<div class="hd-row ${right ? 'r' : ''}" data-i="${i}">
      <div class="hd-av" style="background:${col.avatar}">${esc(sp.emoji)}</div>
      <div class="hd-bub" style="background:${col.bg};border-color:${col.border}">
        <div class="hd-name" style="color:${col.name}">${esc(sp.name)}${sp.role ? ` · ${esc(sp.role)}` : ''}</div>
        <div class="hd-t">${esc(line.t)}</div>
        ${line.p ? `<div class="hd-p">${esc(line.p)}</div>` : ''}
        ${line.ko ? `<div class="hd-ko">${esc(line.ko)}</div>` : ''}
        ${line.round ? `<span class="hd-star">⭐ 오늘 배울 문장 ${line.round}</span>` : ''}
      </div></div>`;
  }

  // 대본 출처 표시: 계정 호출로 만든 대본과 사용자가 직접 가져온 대본을 구별한다
  function sourceLabel(d) {
    if (d.source === 'import') return `${d.importedFrom || '직접'} 대본 · 직접 가져옴`;
    return ({ chatgpt: 'Chat-Gpt 대본', claude: 'Claude 대본', gemini: 'Gemini 대본' })[d.source] || '';
  }

  /** 공식 앱에서 만든 JSON 대본을 지금 세트에 가져온다 (규칙 검사 → 저장). from: 사용자가 고른 출처 이름 */
  function importDialog(text, from) {
    const c = typeof activeSessionCase !== 'undefined' ? activeSessionCase : null;
    if (!c || !Array.isArray(c.rounds) || c.rounds.length < 4) return { ok: false, message: '수업 세트를 먼저 열어 주세요.' };
    let obj;
    try { obj = JSON.parse(String(text || '').replace(/^[\s\S]*?```(?:json)?\s*|\s*```[\s\S]*$/g, '').trim()); }
    catch (e) { return { ok: false, message: 'JSON 형식이 아니에요. 대본 JSON만 붙여 넣어 주세요.' }; }
    const dlg = validate(obj, c);
    if (!dlg) return { ok: false, message: '지금 세트의 학습 문장 4개가 모두 들어 있지 않거나 화자·대사 형식이 맞지 않아요.' };
    dlg.source = 'import';
    dlg.importedFrom = ['Gemini', 'Claude', 'Chat-Gpt'].includes(from) ? from : '직접';
    save(cacheKey(c), { sig: sig(c), dlg });
    save(SEEN_KEY, load(SEEN_KEY, []).filter(s => s !== sig(c)));  // 가져온 대본을 다음 수업 시작 때 들을 수 있게
    delete progress[sig(c)];
    return { ok: true, message: `저장했어요: ${sourceLabel(dlg)} (${dlg.lines.length}줄). 이 세트를 1라운드부터 시작하면 재생돼요.` };
  }

  function frame(c, inner) {
    let el = document.getElementById('hgDialog');
    if (!el) { injectStyle(); el = document.createElement('div'); el.id = 'hgDialog'; document.body.appendChild(el); }
    const lv = c.level || currentLevel;
    if (lv > 20) el.classList.add('no-ko'); else el.classList.remove('no-ko');  // Lv.21부터 뜻은 숨김(버튼으로 보기)
    el.innerHTML = `<div class="hd-head">
        <div class="hd-topline"><div class="hd-kicker">🎧 오늘의 다이얼로그 · Lv.${lv}${c.set ? ` · 세트 ${c.set}/5` : ''}</div>${cur && cur.dlg && sourceLabel(cur.dlg) ? `<span class="hd-source">${esc(sourceLabel(cur.dlg))}</span>` : ''}</div>
        <div class="hd-title">${esc(c.art || '')} ${esc(c.title)}</div>
        ${c.situationKo ? `<div class="hd-sit">${esc(c.situationKo)}</div>` : ''}
        <div class="hd-cast" id="hdCast"></div></div>
      <div class="hd-prog"><div id="hdProg" style="width:0"></div></div>
      ${inner}`;
    return el;
  }

  function renderPlayer() {
    const { c, dlg } = cur;
    const el = frame(c, `<div class="hd-log" id="hdLog"></div>
      <div class="hd-bar">
        <button class="hd-btn" id="hdPause" onclick="HGDIALOG.toggle()">⏸ 잠깐 멈춤</button>
        <button class="hd-btn" onclick="HGDIALOG.toggleKo()">🇰🇷 뜻</button>
        <button class="hd-btn go" id="hdGo" onclick="HGDIALOG.skip()">⏭ 수업 시작</button>
      </div>`);
    el.querySelector('#hdCast').innerHTML = dlg.speakers.map(s => `<span>${esc(s.emoji)} ${esc(s.name)}${s.role ? ` (${esc(s.role)})` : ''}</span>`).join('')
      + (dlg.source === 'builtin' ? '<span>📚 내장 짧은 대화</span>' : '');
    const log = el.querySelector('#hdLog');
    log.innerHTML = dlg.lines.slice(0, cur.idx).map(bubble).join('');
    log.scrollTop = log.scrollHeight;
    updateProg();
  }
  function updateProg() {
    const p = document.getElementById('hdProg');
    if (p && cur) p.style.width = `${Math.round((cur.idx / cur.dlg.lines.length) * 100)}%`;
  }

  /* ---------- 재생 ---------- */
  function step() {
    if (!cur || !cur.playing) return;
    if (cur.epoch !== epoch()) { suspend(); return; }  // 홈·설정·백그라운드로 멈춤 → 돌아오면 이어서
    const { dlg } = cur;
    const log = document.getElementById('hdLog');
    if (!log) return;
    if (cur.idx >= dlg.lines.length) { finish(); return; }
    const i = cur.idx, line = dlg.lines[i];
    log.querySelectorAll('.hd-row.now').forEach(r => r.classList.remove('now'));
    log.insertAdjacentHTML('beforeend', bubble(line, i));
    const row = log.lastElementChild;
    row.classList.add('now');
    log.scrollTop = log.scrollHeight;
    prefetchLine(dlg.lines[i + 1]);
    const my = cur, t0 = Date.now();
    speakLine(line, () => {
      if (cur !== my || !cur.playing) return;
      cur.idx = i + 1;
      progress[sig(cur.c)] = cur.idx;
      updateProg();
      // 음성이 실패해 바로 끝나도(오프라인 등) 말풍선을 읽을 시간만큼은 보여 준다
      const minShow = 1000 + line.t.length * 60;
      cur.timer = setTimeout(step, Math.max(350, minShow - (Date.now() - t0)));
    });
  }

  function toggle() {
    if (!cur) return;
    const btn = document.getElementById('hdPause');
    if (cur.playing) {
      cur.playing = false;
      clearTimeout(cur.timer);
      if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio();
      // 말하던 줄은 다시 들을 수 있게 되돌린다
      const log = document.getElementById('hdLog');
      const last = log && log.querySelector(`.hd-row[data-i="${cur.idx}"]`);
      if (last) last.remove();
      if (btn) btn.textContent = '▶ 이어 듣기';
    } else {
      cur.playing = true;
      cur.epoch = epoch();
      if (btn) btn.textContent = '⏸ 잠깐 멈춤';
      step();
    }
  }
  function toggleKo() {
    const el = document.getElementById('hgDialog');
    if (el) el.classList.toggle('no-ko');
  }

  function close() {
    if (cur) clearTimeout(cur.timer);
    const el = document.getElementById('hgDialog');
    if (el) el.remove();
  }

  // 화면 이동 등으로 멈춤: 들은 위치만 기억하고 닫는다 (본 것으로 처리하지 않음 → 돌아오면 이어서)
  function suspend() {
    if (!cur) return;
    if (!cur.dlg) cancelGpt(cur.c);
    progress[sig(cur.c)] = cur.idx;
    cur = null;
    close();
  }

  function markSeen(c) {
    const seen = load(SEEN_KEY, []).filter(s => s !== sig(c));
    save(SEEN_KEY, [...seen, sig(c)].slice(-400));
    delete progress[sig(c)];
  }

  function startLesson() {
    if (typeof playTargetTTSAndAutoListen === 'function') playTargetTTSAndAutoListen();
  }

  function finish() {
    const c = cur.c, my = cur;
    cur.playing = false;
    updateProg();
    const go = document.getElementById('hdGo');
    if (go) go.textContent = '▶ 바로 수업 시작';
    const pause = document.getElementById('hdPause');
    if (pause) { pause.textContent = '🔁 다시 듣기'; pause.onclick = () => replay(); }
    const msg = '좋아! 방금 대화에 나온 별표 문장으로 하나씩 따라 말해 보자.';
    let fired = false;
    const next = () => { if (fired || cur !== my) return; fired = true; cur = null; markSeen(c); close(); startLesson(); };
    if (typeof speakExileTutor === 'function') speakExileTutor(msg, 'ko', () => setTimeout(next, 400));
    setTimeout(next, 6000 + msg.length * 120);
  }

  function replay() {
    if (!cur) return;
    // 새 토큰으로 바꿔 finish()가 걸어 둔 '수업 시작' 타이머가 다시 듣기를 끊지 않게 한다
    cur = Object.assign({}, cur, { idx: 0, playing: true, epoch: epoch(), timer: null });
    renderPlayer();
    step();
  }

  function skip() {
    if (!cur) { close(); return; }
    const c = cur.c;
    cancelGpt(c);
    clearTimeout(cur.timer);
    cur = null;
    if (typeof stopAllTTSAudio === 'function') stopAllTTSAudio();
    markSeen(c);
    close();
    if (typeof soundTap === 'function') soundTap();
    setTimeout(startLesson, 150);
  }

  async function open(c) {
    const token = { c, dlg: null, idx: progress[sig(c)] || 0, playing: false, epoch: epoch(), timer: null };
    cur = token;
    frame(c, `<div class="hd-log"><div class="hd-typing">🌌 엑자일이 오늘의 대화를 준비하고 있어요<br><span style="font-size:15px">• • •</span></div></div>
      <div class="hd-bar"><button class="hd-btn go" onclick="HGDIALOG.skip()">⏭ 건너뛰고 수업 시작</button></div>`);
    const dlg = await getDialog(c);
    if (cur !== token) return;
    if (token.epoch !== epoch()) { suspend(); return; }
    assignVoices(dlg);
    token.dlg = dlg;
    if (token.idx >= dlg.lines.length) token.idx = 0;
    token.playing = true;
    renderPlayer();
    const intro = token.idx > 0 ? '아까 듣던 대화를 이어서 들려줄게.' : '수업 전에 지구 사람들의 대화를 먼저 들어 보자. 별표 문장이 오늘 배울 문장이야.';
    let fired = false;
    const go = () => { if (fired || cur !== token) return; fired = true; step(); };
    if (typeof speakExileTutor === 'function') speakExileTutor(intro, 'ko', () => setTimeout(go, 300));
    setTimeout(go, 5000 + intro.length * 120);
  }

  /** playTargetTTSAndAutoListen() 맨 앞에서 호출. 이 세트의 대화를 아직 안 들었으면 대화를 열고 true(수업 문장 재생은 대화 뒤로) */
  function intercept() {
    // 그사이 화면 이동·백그라운드(stopMedia)가 있었으면 멈춘 대화를 정리하고 들은 곳부터 다시 연다
    if (cur && cur.epoch !== epoch()) suspend();
    if (cur || document.getElementById('hgDialog')) return true;
    const c = typeof activeSessionCase !== 'undefined' ? activeSessionCase : null;
    if (!c || !Array.isArray(c.rounds) || c.rounds.length < 4 || c.lang !== lang()) return false;
    if (typeof currentRound === 'undefined' || currentRound !== 1) return false;
    if (typeof roundPassed !== 'undefined' && roundPassed.some(Boolean)) return false;
    if (load(SEEN_KEY, []).includes(sig(c))) return false;
    open(c);
    return true;
  }

  const isOpen = () => !!document.getElementById('hgDialog');

  window.HGDIALOG = { intercept, isOpen, skip, prefetch, adopt, importDialog, sourceLabel, toggle, toggleKo, replay, lineCount, _validate: validate, _fallback: fallback, _buildPrompt: buildPrompt };
})();
