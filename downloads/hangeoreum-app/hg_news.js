/* 한걸음 '오늘의 뉴스' 회화 (HGNEWS)
   오늘의 일상 대화 → 빠른 선택 맨 끝 [📰 오늘의 뉴스]
   1) 실제 뉴스 헤드라인 조회: 안드로이드 앱은 기기에서 구글 뉴스(한국) RSS를 직접 받는다(Native 'fetchNews').
      브라우저(체험판)는 RSS가 CORS로 막히므로 Gemini 키가 있으면 구글 검색 도구로 오늘 헤드라인을 받는다.
   2) 고른 기사(기본 3개)를 맥락으로 Gemini가 현재 레벨 난이도의 4라운드 회화 세트를 만든다.
   3) 만든 세트를 지금 레벨·세트 자리의 수업으로 바로 적용한다 (4라운드를 마치면 원래 다음 세트로 이어진다). */
(function () {
  const RSS = 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko';
  const ROUND_LABELS = ['핵심 청크', '기본 문장', '맥락 확장', '실전 발화'];
  const MAX_PICK = 3;
  let articles = [];   // [{ title, source, pick }]
  let busy = false;
  let reqSeq = 0;
  const waiting = {};

  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';
  const hasNative = () => !!(window.Native && typeof window.Native.call === 'function');
  const apiKey = () => !!(window.HGV2 && HGV2.aiAvailable && HGV2.aiAvailable());

  function box() {
    let el = document.getElementById('hgNewsBox');
    if (el) return el;
    const btn = document.getElementById('hgNewsQuickBtn');
    if (!btn) return null;
    el = document.createElement('div');
    el.id = 'hgNewsBox';
    el.style.cssText = 'background:#f8fafc;border:2px solid #cbd5e1;border-radius:16px;padding:12px;font-size:15px;line-height:1.5;color:#0f172a';
    btn.insertAdjacentElement('afterend', el);
    return el;
  }
  function show(html) { const b = box(); if (b) { b.style.display = ''; b.innerHTML = html; } }

  /* ---------- 1. 헤드라인 조회 ---------- */
  window.HGNewsCallback = function (id, res) { const w = waiting[id]; if (w) { delete waiting[id]; w(res || {}); } };

  function nativeRss() {
    return new Promise((resolve, reject) => {
      const id = ++reqSeq;
      const timer = setTimeout(() => { delete waiting[id]; reject(new Error('뉴스 응답 시간 초과')); }, 15000);
      waiting[id] = (r) => { clearTimeout(timer); r.ok ? resolve(r.xml || '') : reject(new Error(r.error || '뉴스 조회 실패')); };
      try {
        const r = JSON.parse(window.Native.call('fetchNews', JSON.stringify({ id, url: RSS })) || '{}');
        if (r.ok === false) { clearTimeout(timer); delete waiting[id]; reject(new Error(r.error || '뉴스 조회 실패')); }
      } catch (e) { clearTimeout(timer); delete waiting[id]; reject(e); }
    });
  }

  function parseRss(xml) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    return Array.from(doc.querySelectorAll('item')).map(it => {
      const raw = (it.querySelector('title') || {}).textContent || '';
      const src = (it.querySelector('source') || {}).textContent || '';
      const title = src && raw.endsWith(' - ' + src) ? raw.slice(0, -(src.length + 3)) : raw;
      return { title: title.trim(), source: src.trim() };
    }).filter(a => a.title);
  }

  async function geminiHeadlines() {
    const today = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'long' }).format(new Date());
    const text = await HGV2.geminiCall({
      contents: [{ parts: [{ text: `구글 검색으로 ${today} 한국의 실제 주요 뉴스 헤드라인 6개를 찾아 주세요. 정치 갈등·사건사고보다 일상·경제·문화·과학·스포츠를 우선합니다. 다른 말 없이 한 줄에 하나씩 "제목 | 언론사" 형식으로만 출력하세요.` }] }],
      tools: [{ google_search: {} }]
    }, 20000);
    return text.split('\n').map(l => l.replace(/^[\s\-*\d.)]+/, '').trim()).filter(l => l.includes('|'))
      .map(l => { const [t, s] = l.split('|'); return { title: t.trim(), source: (s || '').trim() }; }).filter(a => a.title);
  }

  async function fetchHeadlines() {
    if (hasNative()) return parseRss(await nativeRss());
    try {  // 브라우저: RSS 직접 (대부분 CORS로 막힘)
      const res = await fetch(RSS, { cache: 'no-store' });
      if (res.ok) { const list = parseRss(await res.text()); if (list.length) return list; }
    } catch (e) { /* CORS → Gemini 검색 */ }
    if (apiKey()) return geminiHeadlines();
    throw new Error('체험판(브라우저)에서는 Gemini API 키가 있어야 오늘 뉴스를 불러올 수 있어요. 앱에서는 키 없이도 뉴스 목록을 볼 수 있어요.');
  }

  async function open() {
    if (typeof soundTap === 'function') soundTap();
    if (busy) return;
    const provider=HGV2.aiName();
    busy = true;
    show('📡 오늘의 실제 뉴스를 불러오는 중이에요...');
    try {
      const list = await fetchHeadlines();
      if (!list.length) throw new Error('불러온 기사가 없어요.');
      articles = list.slice(0, 6).map((a, i) => Object.assign(a, { pick: i < MAX_PICK }));
      renderList();
      const input = document.getElementById('dailyTextInput');
      if (input) input.value = '오늘의 뉴스: ' + articles.filter(a => a.pick).map(a => a.title).join(' / ');
    } catch (e) {
      show(`⚠️ ${esc(e.message)}<br><button type="button" class="btn-3d btn-secondary" style="margin-top:8px;width:100%" onclick="HGNEWS.open()">🔄 다시 불러오기</button>`);
    } finally { busy = false; }
  }

  function renderList(note) {
    const rows = articles.map((a, i) => `
      <label style="display:flex;gap:8px;align-items:flex-start;padding:8px 4px;border-bottom:1px solid #e2e8f0;cursor:pointer">
        <input type="checkbox" ${a.pick ? 'checked' : ''} onchange="HGNEWS.toggle(${i}, this.checked)" style="width:20px;height:20px;margin-top:2px;flex:none">
        <span><b>${esc(a.title)}</b>${a.source ? `<br><small style="color:#64748b">${esc(a.source)}</small>` : ''}</span>
      </label>`).join('');
    const n = articles.filter(a => a.pick).length;
    show(`<div style="font-weight:900;margin-bottom:4px">📰 오늘의 뉴스 — 회화에 쓸 기사를 골라 주세요 (최대 ${MAX_PICK}개)</div>${rows}
      ${note ? `<div style="margin-top:8px;color:#e11d48;font-weight:800">${note}</div>` : ''}
      <button type="button" class="btn-3d btn-green" style="margin-top:10px;width:100%" ${n ? '' : 'disabled'} onclick="HGNEWS.start()">📰 이 기사 ${n}개로 회화 시작</button>`);
  }

  function toggle(i, on) {
    if (on && articles.filter(a => a.pick).length >= MAX_PICK) { renderList(`기사는 ${MAX_PICK}개까지 고를 수 있어요.`); return; }
    articles[i].pick = on;
    const input = document.getElementById('dailyTextInput');
    if (input) input.value = '오늘의 뉴스: ' + articles.filter(a => a.pick).map(a => a.title).join(' / ');
    renderList();
  }

  /* ---------- 2. 기사 맥락 회화 세트 생성 ---------- */
  function buildPrompt(picked) {
    const lv = typeof currentLevel !== 'undefined' ? currentLevel : 1;
    const band = HGV2.bandOf(lv);
    const L = HGV2.LANG_NAME[lang()];
    return `당신은 한국인 학습자를 위한 ${L} 회화 커리큘럼 작가입니다.
세계관: 안드로메다에서 지구로 유배 온 AI 튜터 '엑자일'이 학습자와 오늘의 실제 뉴스를 이야기하며 회화를 가르칩니다.

[오늘의 실제 뉴스 기사]
${picked.map((a, i) => `${i + 1}. ${a.title}${a.source ? ` (${a.source})` : ''}`).join('\n')}

[이번 세트]
- 레벨: Lv.${lv} (구간 '${band.name}') — 난이도 기준: ${band.spec}
- 위 기사들의 맥락으로, 친구와 "오늘 뉴스 봤어?"처럼 뉴스를 화제로 나누는 자연스러운 일상 대화를 만듭니다.
- 4라운드 안에서 고른 기사들을 골고루 다루고, 기사에 없는 사실을 지어내지 마세요(의견·감상 표현은 좋음).
- 1라운드 핵심 청크 → 2 기본 문장 → 3 맥락 확장 → 4 실전 발화로 갈수록 길고 어려워집니다. 레벨 난이도를 넘지 마세요.

반드시 아래 JSON만 출력하세요:
{"title":"상황 제목(한국어 15자 이내)","situationKo":"상황 설명(한국어 50자 이내)","keywords":"키워드1,키워드2,키워드3","art":"이모지 2~3개",
"rounds":[{"ko":"한국어 뜻","target":"${L} 표현","phonetic":"[한글 발음${lang() === 'cn' ? ' · 병음' : ''}]","note":"어느 기사 이야기인지와 짧은 활용 팁(한국어)","emoji":"이모지 1개"}, ...총 4개]}`;
  }

  async function start() {
    const picked = articles.filter(a => a.pick);
    if (!picked.length || busy) return;
    if (!apiKey()) { renderList('기사로 회화를 만들려면 설정에서 ChatGPT를 연결해 주세요.'); return; }
    const provider=HGV2.aiName();
    busy = true;
    show('🌌 엑자일이 기사 내용으로 오늘의 회화를 만드는 중이에요... (10초 정도)');
    try {
      let set = null;
      for (let attempt = 0; attempt < 2 && !set; attempt++) {
        const text = await HGV2.geminiCall({ contents: [{ parts: [{ text: buildPrompt(picked) }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.8 } }, 20000);
        set = HGV2._validateSet(JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()), lang());
      }
      if (!set) throw new Error('회화 세트를 만들지 못했어요. 다시 시도해 주세요.');
      set.provider=provider;
      apply(set, picked);
    } catch (e) {
      renderList(`⚠️ ${esc(e.message)}`);
    } finally { busy = false; }
  }

  /* ---------- 3. 지금 세트 자리에 적용 ---------- */
  function apply(set, picked) {
    const L = lang(), lv = currentLevel, k = HGV2.getSetIdx();
    currentStoryQuote = '오늘의 뉴스: ' + picked.map(a => a.title).join(' / ');
    try { localStorage.setItem('hangeoreum_daily_quote', currentStoryQuote); } catch (e) { /* 무시 */ }
    // id를 지금 레벨·세트와 같게 해서 이 세트를 마칠 때까지 수업 화면이 그대로 쓰고, 끝나면 원래 다음 세트로 넘어간다
    activeSessionCase = {
      id: `v2_${L}_${lv}_${k}`, title: set.title, situationKo: set.situationKo, keywords: set.keywords, art: set.art || '📰',
      rounds: set.rounds.map((r, i) => ({ round: i + 1, type: `${ROUND_LABELS[i]} · 오늘의 뉴스`, ...r })),
      theme: currentTheme, lang: L, level: lv, set: k, news: picked.map(a => a.title),
      source: '📰 오늘의 뉴스 · 실제 기사 맥락 · ' + (set.provider || 'AI')
    };
    if (typeof applySessionCaseToUI === 'function') applySessionCaseToUI(activeSessionCase);
    const q = document.getElementById('activeDailyStoryQuote');
    if (q) q.textContent = `"${currentStoryQuote}"`;
    if (typeof closeDailyCheckinModal === 'function') closeDailyCheckinModal(false);  // 아래 updateLevelUI가 수업 시작
    const b = document.getElementById('hgNewsBox');
    if (b) b.style.display = 'none';
    currentRound = 1;
    roundPassed = [false, false, false, false];
    if (typeof updateLevelUI === 'function') updateLevelUI();
    if (window.HGUX && HGUX.sfx) HGUX.sfx('fanfare');
  }

  window.HGNEWS = { open, toggle, start, parseRss, buildPrompt, _apply: apply };
})();
