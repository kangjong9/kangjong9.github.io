/* 한걸음 '오늘의 일상 대화' 빠른 선택 (HGDAILY)
   주제 선택 창의 빠른 선택 3개를 고정 문장 대신 매번 새로 만든다 — "살아 숨쉬는" 체크인.
   1) 창이 열리면 즉시: 내장 상황 묶음에서 지금 시간대·요일·계절에 맞는 3개 (최근에 보여 준 것은 제외)
   2) 동시에 Gemini 키가 있으면(무료) 날짜·시간대·계절·학습 언어·레벨·최근 고른 말을 반영한 3개를 받아 교체
   3) 🔄 다른 상황 버튼으로 언제든 새 3개
   직접 입력란·📰 오늘의 뉴스·시작 버튼과 고른 문장이 수업(hg_v2 세트 생성)으로 이어지는 흐름은 그대로 둔다. */
(function () {
  const SHOWN_KEY = 'hg_daily_shown';   // 최근에 보여 준 샘플 문장 (반복 방지)
  const PICKS_KEY = 'hg_daily_picks';   // 최근에 사용자가 고른/입력한 문장 (AI 맥락)
  const PICK_KEY = 'hg_daily_pick';     // 지금 고른 샘플의 이모지·라벨·태그 (홈 배지 표시용)
  const AI_KEY = 'hg_daily_ai';         // 미리 받아 둔 AI 샘플 { t, slot, list }
  const AI_TIMEOUT = 20000;             // 실기기 Gemini 응답 약 9초(2026-10-27 측정) → 9초 제한은 매번 시간 초과였다
  const AI_FRESH_MS = 30 * 60 * 1000;

  // 시간대 m 아침(5~10시) d 낮(11~16시) e 저녁(17~21시) n 밤(22~4시), 요일 wd 평일 / we 주말, 계절 sp su au wi
  // 생략하면 언제든 가능
  const POOL = [
    { e: '☀️', q: '알람 다섯 번 끄고 겨우 일어났어', l: '늦잠', t: '#아침 #늦잠', when: 'm' },
    { e: '🚇', q: '출근길 지하철이 꽉 차서 숨 막혔어', l: '출근길', t: '#출근 #지하철', when: 'm', day: 'wd' },
    { e: '☕', q: '아침에 커피 없으면 아무것도 못 하겠어', l: '모닝커피', t: '#커피 #아침', when: 'm' },
    { e: '🥐', q: '빵집에서 갓 나온 크루아상 사 먹었어', l: '아침 빵', t: '#빵집 #아침', when: 'm' },
    { e: '🏃', q: '아침 일찍 동네 한 바퀴 뛰고 왔어', l: '아침 운동', t: '#조깅 #운동', when: 'm' },
    { e: '🍱', q: '점심 메뉴 고르는 게 제일 어려워', l: '점심 고민', t: '#점심 #메뉴', when: 'd' },
    { e: '😪', q: '점심 먹고 나니까 너무 졸려', l: '식곤증', t: '#졸림 #오후', when: 'd' },
    { e: '📊', q: '오늘 회의가 세 개나 있어서 정신없어', l: '회의 폭탄', t: '#회의 #업무', when: 'md', day: 'wd' },
    { e: '📧', q: '메일 답장할 게 산더미처럼 쌓였어', l: '업무 메일', t: '#메일 #업무', when: 'md', day: 'wd' },
    { e: '🛍️', q: '세일한다고 해서 옷 하나 질렀어', l: '쇼핑', t: '#쇼핑 #세일', when: 'de' },
    { e: '📦', q: '기다리던 택배가 드디어 도착했어', l: '택배', t: '#택배 #설렘', when: 'de' },
    { e: '🏥', q: '감기 기운이 있어서 병원에 다녀왔어', l: '병원', t: '#감기 #병원', when: 'md' },
    { e: '💇', q: '머리를 잘랐는데 좀 망한 것 같아', l: '미용실', t: '#미용실 #헤어', when: 'de' },
    { e: '🏦', q: '은행 업무 보느라 한참 기다렸어', l: '은행', t: '#은행 #대기', when: 'd', day: 'wd' },
    { e: '🍺', q: '퇴근하고 시원한 맥주 한잔하고 싶어', l: '퇴근 맥주', t: '#맥주 #퇴근', when: 'en' },
    { e: '🌙', q: '오늘도 야근해서 너무 피곤해', l: '야근', t: '#야근 #피곤', when: 'en', day: 'wd' },
    { e: '🍜', q: '저녁은 간단하게 라면 끓여 먹을래', l: '저녁 메뉴', t: '#라면 #저녁', when: 'e' },
    { e: '🛒', q: '마트에서 장 보고 냉장고 채웠어', l: '장보기', t: '#마트 #장보기', when: 'de' },
    { e: '🍳', q: '오늘은 집에서 직접 요리해 봤어', l: '집밥', t: '#요리 #집밥', when: 'de' },
    { e: '🏋️', q: '헬스장에서 하체 운동해서 다리가 후들거려', l: '헬스', t: '#헬스 #운동', when: 'de' },
    { e: '📺', q: '드라마 정주행하다가 새벽까지 깨어 있었어', l: '드라마', t: '#드라마 #밤샘', when: 'en' },
    { e: '🎮', q: '친구랑 게임하다가 시간 가는 줄 몰랐어', l: '게임', t: '#게임 #친구', when: 'en' },
    { e: '😴', q: '잠이 안 와서 계속 뒤척이고 있어', l: '불면', t: '#잠 #밤', when: 'n' },
    { e: '🌃', q: '밤에 산책하니까 바람이 시원해', l: '밤 산책', t: '#산책 #밤', when: 'en' },
    { e: '📱', q: '휴대폰 보다가 할 일을 다 미뤘어', l: '미루기', t: '#휴대폰 #미루기', when: 'dn' },
    { e: '🧹', q: '주말이라 밀린 청소랑 빨래를 했어', l: '집안일', t: '#청소 #빨래', when: 'md', day: 'we' },
    { e: '🛌', q: '주말이니까 오늘은 하루 종일 뒹굴 거야', l: '주말 휴식', t: '#주말 #휴식', day: 'we' },
    { e: '🎬', q: '친구랑 영화 보러 가기로 했어', l: '영화 약속', t: '#영화 #약속', when: 'de', day: 'we' },
    { e: '🥾', q: '주말에 가까운 산에 등산 다녀왔어', l: '등산', t: '#등산 #주말', when: 'mde', day: 'we' },
    { e: '🍰', q: '분위기 좋은 카페에서 케이크 먹었어', l: '카페', t: '#카페 #디저트', when: 'de' },
    { e: '🎂', q: '오늘 친구 생일이라 선물을 샀어', l: '생일', t: '#생일 #선물', when: 'de' },
    { e: '✈️', q: '다음 달 여행 비행기표를 예약했어', l: '여행 계획', t: '#여행 #예약', when: 'den' },
    { e: '🐶', q: '강아지 산책시키다가 이웃이랑 인사했어', l: '반려견', t: '#강아지 #산책', when: 'me' },
    { e: '📚', q: '도서관에서 시험공부 하고 있어', l: '공부', t: '#공부 #시험', when: 'de' },
    { e: '💸', q: '이번 달 카드값 보고 깜짝 놀랐어', l: '카드값', t: '#돈 #지출', when: 'den' },
    { e: '🚗', q: '퇴근길에 차가 엄청 막혔어', l: '교통 체증', t: '#퇴근 #교통', when: 'e', day: 'wd' },
    { e: '📞', q: '오랜만에 부모님이랑 통화했어', l: '안부 전화', t: '#가족 #통화', when: 'den' },
    { e: '🤝', q: '새로운 사람을 만나서 좀 어색했어', l: '첫 만남', t: '#만남 #어색', when: 'de' },
    { e: '🎤', q: '노래방 가서 스트레스 확 풀었어', l: '노래방', t: '#노래방 #스트레스', when: 'en' },
    { e: '🌸', q: '벚꽃이 피어서 사진 엄청 찍었어', l: '꽃구경', t: '#벚꽃 #봄', season: 'sp' },
    { e: '🤧', q: '미세먼지 때문에 목이 칼칼해', l: '미세먼지', t: '#미세먼지 #봄', season: 'sp' },
    { e: '🍉', q: '너무 더워서 수박 한 통 다 먹었어', l: '더위', t: '#여름 #수박', season: 'su' },
    { e: '☔', q: '갑자기 비가 와서 홀딱 젖었어', l: '소나기', t: '#비 #장마', season: 'su' },
    { e: '🏖️', q: '바다 보러 가고 싶어서 휴가 계획 중이야', l: '휴가', t: '#휴가 #바다', season: 'su' },
    { e: '🍁', q: '단풍이 예뻐서 공원을 오래 걸었어', l: '단풍', t: '#단풍 #가을', season: 'au' },
    { e: '🧥', q: '아침저녁으로 쌀쌀해져서 겉옷을 꺼냈어', l: '환절기', t: '#날씨 #가을', season: 'au' },
    { e: '⛄', q: '눈이 펑펑 와서 출근길이 미끄러웠어', l: '눈 오는 날', t: '#눈 #겨울', season: 'wi', when: 'md' },
    { e: '🍠', q: '추워서 길에서 군고구마 사 먹었어', l: '겨울 간식', t: '#군고구마 #겨울', season: 'wi' },
    { e: '🎄', q: '연말이라 친구들이랑 모임이 많아', l: '연말 모임', t: '#연말 #모임', season: 'wi' }
  ];

  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 무시 */ } };
  const lang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';

  let current = [];  // 지금 화면의 3개 [{ e, q, l, t }]
  let reqSeq = 0;    // 늦게 도착한 AI 응답 무시용
  let touched = false;  // 사용자가 이미 골랐거나 입력 중이면 AI 결과로 덮어쓰지 않음

  /* ---------- 지금 상황(시간대·요일·계절) ---------- */
  function now() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hour: 'numeric', hourCycle: 'h23', month: 'numeric', weekday: 'short' })
      .formatToParts(new Date()).map(p => [p.type, p.value]));
    const h = +parts.hour, m = +parts.month;
    const slot = h >= 5 && h <= 10 ? 'm' : h <= 16 && h >= 11 ? 'd' : h >= 17 && h <= 21 ? 'e' : 'n';
    const day = (parts.weekday === 'Sat' || parts.weekday === 'Sun') ? 'we' : 'wd';
    const season = m >= 3 && m <= 5 ? 'sp' : m <= 8 && m >= 6 ? 'su' : m >= 9 && m <= 11 ? 'au' : 'wi';
    return { slot, day, season };
  }
  const SLOT_KO = { m: '아침', d: '낮', e: '저녁', n: '밤' };
  const SEASON_KO = { sp: '봄', su: '여름', au: '가을', wi: '겨울' };

  /* ---------- 1. 내장 묶음에서 3개 ---------- */
  function poolPick() {
    const c = now();
    const shown = load(SHOWN_KEY, []);
    const fits = POOL.filter(p => (!p.when || p.when.includes(c.slot)) && (!p.day || p.day === c.day) && (!p.season || p.season === c.season));
    let cand = fits.filter(p => !shown.includes(p.q));
    if (cand.length < 3) cand = fits.slice();  // 다 보여 줬으면 다시 처음부터
    // 계절 문장이 있으면 1개는 우선 넣어 '지금'이 느껴지게
    const shuffled = cand.sort(() => Math.random() - 0.5);
    const seasonal = shuffled.find(p => p.season);
    const out = seasonal ? [seasonal] : [];
    for (const p of shuffled) { if (out.length >= 3) break; if (!out.includes(p)) out.push(p); }
    return out.map(({ e, q, l, t }) => ({ e, q, l, t }));
  }

  /* ---------- 2. Gemini로 3개 (무료 키) ---------- */
  function buildPrompt() {
    const c = now();
    const today = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'full' }).format(new Date());
    const L = (window.HGV2 && HGV2.LANG_NAME && HGV2.LANG_NAME[lang()]) || lang();
    const lv = typeof currentLevel !== 'undefined' ? currentLevel : 1;
    const picks = load(PICKS_KEY, []).slice(-5);
    const shown = load(SHOWN_KEY, []).slice(-12);
    return `한국인 학습자가 ${L} 회화를 배우는 앱의 '오늘의 일상 대화' 화면입니다.
학습자가 한 번 눌러 고를 수 있는, 오늘 실제로 있었을 법한 한국어 일상 한마디 3개를 만들어 주세요.

[지금]
- 날짜: ${today} (${c.day === 'we' ? '주말' : '평일'}), 시간대: ${SLOT_KO[c.slot]}, 계절: ${SEASON_KO[c.season]}
- 학습 언어: ${L}, 현재 레벨: Lv.${lv}/50
${picks.length ? `- 학습자가 최근 골랐던 말: ${picks.map(p => `"${p}"`).join(', ')} (취향 참고, 똑같은 말 반복 금지)` : ''}
${shown.length ? `- 최근 보여 준 문장(반복 금지): ${shown.join(' / ')}` : ''}

[규칙]
- 지금 시간대·요일·계절에 어울릴 것. 3개는 서로 다른 생활 영역(일·음식·사람·취미·건강·날씨·쇼핑 등).
- 반말 구어체 한 문장, 25자 이내. 친구에게 오늘 일을 말하듯 구체적으로.
- 정치·사건사고·부정적으로 무거운 내용은 피할 것.

반드시 아래 JSON만 출력하세요:
{"samples":[{"emoji":"이모지 1개","quote":"한국어 한마디","label":"상황 이름 6자 이내","tags":"#태그1 #태그2"}, ...총 3개]}`;
  }

  function validate(obj) {
    const list = obj && Array.isArray(obj.samples) ? obj.samples : [];
    const out = list.map(s => ({
      e: String(s.emoji || '💬').trim().slice(0, 8),
      q: String(s.quote || '').trim().replace(/^["“]|["”]$/g, '').slice(0, 40),
      l: String(s.label || '').trim().slice(0, 12),
      t: String(s.tags || '').trim().slice(0, 30)
    })).filter(s => s.q);
    return out.length >= 3 ? out.slice(0, 3) : null;
  }

  let fetching = null;
  async function fetchAi() {
    if (!(window.HGV2 && HGV2.aiAvailable && HGV2.aiAvailable())) return null;
    if (fetching) return fetching;
    fetching = (async () => {
      try {
        const text = await HGV2.geminiCall({
          contents: [{ parts: [{ text: buildPrompt() }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 1.0 }
        }, AI_TIMEOUT);
        const provider = HGV2.lastProvider ? HGV2.lastProvider() : HGV2.aiName();  // 실제로 답한 AI (ChatGPT 한도 → Gemini 전환 반영)
        const list = validate(JSON.parse(text.replace(/^```(json)?|```$/g, '').trim()));
        return list && list.map(s => ({...s, provider}));
      } catch (e) {
        console.warn('[HGDAILY] AI 샘플 실패 — 내장 묶음 유지', e.message);
        return null;
      } finally { fetching = null; }
    })();
    return fetching;
  }
  // 다음에 창을 열 때 바로 보이도록 미리 받아 둔다
  async function prefetch() {
    const list = await fetchAi();
    if (list) save(AI_KEY, { t: Date.now(), slot: now().slot, list });
  }
  function takeCached() {
    const c = load(AI_KEY, null);
    if (!c || !Array.isArray(c.list) || Date.now() - c.t > AI_FRESH_MS || c.slot !== now().slot) return null;
    try { localStorage.removeItem(AI_KEY); } catch (e) { /* 무시 */ }  // 한 번 보여 준 묶음은 다시 쓰지 않음
    return c.list;
  }

  async function aiPick(seq) {
    const list = await fetchAi();
    if (list && seq === reqSeq && !touched && isOpen()) render(list, true);
    else if (list) save(AI_KEY, { t: Date.now(), slot: now().slot, list });  // 늦게 왔으면 다음 번에 사용
  }

  /* ---------- 화면 ---------- */
  const isOpen = () => { const m = document.getElementById('dailyCheckinModal'); return !!m && !m.classList.contains('hidden'); };

  function render(list, fromAi) {
    const box = document.getElementById('hgDailyQuick');
    if (!box) return;
    current = list;
    const shown = load(SHOWN_KEY, []).filter(q => !list.some(s => s.q === q));
    save(SHOWN_KEY, [...shown, ...list.map(s => s.q)].slice(-30));
    box.innerHTML = list.map((s, i) => `
      <button type="button" class="choice-card hg-daily-chip" style="padding:10px 14px;" onclick="HGDAILY.pick(${i})">
        <span>${esc(s.e)}</span>
        <span style="font-size:14px; font-weight:800;">"${esc(s.q)}"${s.t ? ` <span style="color:#64748b; font-weight:700;">(${esc(s.t)})</span>` : ''}</span>
      </button>`).join('');
    const src = document.getElementById('hgDailySrc');
    if (src) src.textContent = fromAi ? '✨ 엑자일이 지금 상황에 맞춰 골랐어요' : '';
    window.HGAI?.badge(box, fromAi && ['Chat-Gpt', 'Claude', 'Gemini'].includes(list[0]?.provider) ? list[0].provider : '');
    if (fromAi) box.querySelectorAll('.hg-daily-chip').forEach(b => { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = 'hgDailyIn .35s ease'; });
  }

  // 자유 입력·샘플 문장 → 기존 3대 테마(work/cafe/beer) 중 가까운 것 (submitDailyCheckin과 같은 기준)
  function themeOf(q) {
    if (/카페|커피|라떼|힐링|케이크|디저트|빵/.test(q)) return 'cafe';
    if (/친구|맥주|치맥|술|고기|모임|노래방/.test(q)) return 'beer';
    return 'work';
  }

  function pick(i) {
    const s = current[i];
    if (!s) return;
    touched = true;
    if (typeof soundTap === 'function') soundTap();
    const input = document.getElementById('dailyTextInput');
    if (input) input.value = s.q;
    if (typeof currentTheme !== 'undefined') currentTheme = themeOf(s.q);
    if (typeof currentStoryQuote !== 'undefined') currentStoryQuote = s.q;
    save(PICK_KEY, s);
  }

  // 시작 버튼을 누를 때 실제로 쓴 문장을 기억 (다음 AI 샘플의 취향 참고)
  function remember(q) {
    q = String(q || '').trim();
    if (!q || /^오늘의 뉴스:/.test(q)) return;
    const picks = load(PICKS_KEY, []).filter(p => p !== q);
    save(PICKS_KEY, [...picks, q].slice(-10));
    const p = load(PICK_KEY, null);
    if (p && p.q !== q) { try { localStorage.removeItem(PICK_KEY); } catch (e) { /* 무시 */ } }
  }

  /** 홈 배지용: 지금 문장이 고른 샘플이면 그 이모지·라벨·태그 */
  function badgeFor(q) {
    const p = load(PICK_KEY, null);
    return p && p.q === q ? p : null;
  }

  function refresh() {
    touched = false;
    const seq = ++reqSeq;
    const cached = takeCached();
    if (cached) { render(cached, true); prefetch(); return; }  // 미리 받아 둔 AI 묶음 즉시 + 다음 묶음 준비
    render(poolPick(), false);
    aiPick(seq);
  }

  // 창이 열릴 때마다 호출 (openDailyCheckinModal)
  function onOpen() {
    const input = document.getElementById('dailyTextInput');
    if (input && !input._hgDaily) { input._hgDaily = true; input.addEventListener('input', () => { touched = true; }); }
    refresh();
  }

  /** 시간대에 맞는 엑자일 첫마디 */
  function greeting(name) {
    const n = name ? `지구인 ${name}` : '지구인';
    return ({
      m: `${n}! 좋은 아침이야. 오늘 하루는 어떻게 시작했어? 편하게 이야기해 줘!`,
      d: `${n}! 오늘 낮은 어떻게 보내고 있어? 편하게 이야기해 줘!`,
      e: `${n}! 오늘 하루는 어땠어? 편하게 이야기해 줘!`,
      n: `${n}! 늦은 시간까지 고생했어. 오늘 무슨 일 있었어? 편하게 이야기해 줘!`
    })[now().slot];
  }

  // 앱이 뜨고 조금 뒤 한 번 미리 받아 둔다 (첫 체크인부터 AI 문장)
  setTimeout(() => { if (!takeCachedPeek()) prefetch(); }, 4000);
  function takeCachedPeek() {
    const c = load(AI_KEY, null);
    return !!(c && Date.now() - c.t <= AI_FRESH_MS && c.slot === now().slot);
  }

  const style = document.createElement('style');
  style.textContent = '@keyframes hgDailyIn{from{opacity:.2;transform:translateY(4px)}to{opacity:1;transform:none}}';
  (document.head || document.documentElement).appendChild(style);

  window.HGDAILY = { onOpen, refresh, pick, remember, badgeFor, greeting, poolPick, themeOf, _validate: validate, _buildPrompt: buildPrompt, _POOL: POOL };
})();
