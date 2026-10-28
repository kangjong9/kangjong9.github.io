/*
 * 한걸음 리뉴얼 v2 커리큘럼 엔진 (HGV2)
 *
 * - 50레벨 × 레벨당 5세트(세트마다 4단계: 핵심 청크 → 기본 문장 → 맥락 확장 → 실전).
 *   세트당 문장 수는 구간마다 4·6·8·10·12개, 구간 안 6번째 레벨부터 +1 (sentenceCount).
 * - 1~10 / 11~20 / 21~30 / 31~40 / 41~50 다섯 구간, 구간 안에서도 레벨마다 점진적으로 어려워진다.
 * - 1세트 = 앱 내장 기본 세트(curriculum_v2_<언어>.js), 2~5세트 = Gemini가 직전 세트의 맥락을 이어 새 주제로 생성.
 *   키가 없거나 생성에 실패하면 같은 구간의 다른 레벨 기본 세트를 빌려 와 레벨 안 5세트가 서로 겹치지 않게 한다.
 * - 50레벨을 마치면 사용자가 상대 AI를 골라(프리셋 또는 직접 만들기) 실전 롤플레잉 대화를 한다.
 *
 * index.html의 전역 상태(currentLevel, currentRound, roundPassed, selectedLang, currentTheme, activeSessionCase 등)를
 * 함수 실행 시점에만 참조한다. (이 파일은 본문보다 먼저 로드되므로 최상위에서 참조하지 않는다)
 */
(function () {
  'use strict';

  const SETS_PER_LEVEL = 5;
  const ROUND_LABELS = ['[1단계: 핵심 청크]', '[2단계: 기본 문장]', '[3단계: 맥락 확장]', '[4단계: 실전 발화]'];
  const LANG_NAME = { fr: '프랑스어(French)', ja: '일본어(Japanese)', cn: '중국어 간체(Simplified Chinese)', en: '영어(American English)', es: '스페인어(Spanish, Spain)', ru: '러시아어(Russian)' };

  // 레벨 주제별 장면 일러스트 (6개 언어 공통 주제 순서와 일치)
  const TOPIC_ART = [
    '👋🙂', '🌏🙋', '🏷️💰', '☕🥐', '🗺️🚇', '🚄🎫', '🏨🔑', '🍽️🧾', '👕📏', '🙏👋',
    '⏰🌅', '🎧🚲', '👨‍👩‍👧📷', '☀️☔', '📅🕒', '🏠🪟', '🌶️🍲', '💼🎨', '🍎🧺', '📞💬',
    '🖼️🍝', '🏖️✈️', '💊🤒', '🚌⏰', '🍜⭐', '🌧️🎬', '💱🏦', '👛🔍', '🎂🎉', '🎿✨',
    '🎬🍿', '🚕🚶', '🖼️📸', '🛏️🚿', '👔🧾', '📆🤝', '📶🛠️', '🧭🙋', '🏢⚖️', '💡🫂',
    '🏺💸', '🤝📄', '📊🎤', '🗣️👥', '🫂💗', '📰💻', '🌏🙇', '✉️📎', '⚖️🕊️', '🚀🌌'
  ];
  // 글 생성 폴백 순서: 3.8 Flash부터 하위 Flash → Lite (TTS 모델은 제외, 음성은 TTS 엔진이 TTS 모델만 호출)
  // 실제 호출 순서 = 직전 성공 모델 → 키로 조회해 확인된 모델(최신순) → 이 기본 목록. 404 모델은 이번 실행 동안 건너뜀.
  const GEMINI_MODELS = [
    'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash',
    'gemini-3.8-flash-lite', 'gemini-3.7-flash-lite', 'gemini-3.6-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.0-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'
  ];
  const missingModels = new Set();

  // 다섯 구간 난이도 기준 (AI 생성 지시와 화면 표시에 함께 사용)
  const BANDS = [
    { from: 1, to: 10, name: '기초 생존 청크', spec: '인사·숫자·주문·길묻기 등 생존 표현. 첫 문장은 1~3단어 청크, 마지막 문장도 6단어 이하의 짧은 현재형 문장.' },
    { from: 11, to: 20, name: '기본 문장', spec: '주어+동사+목적어 기본 문장, 질문과 대답, 부정문, 일상 루틴. 문장 4~8단어 수준.' },
    { from: 21, to: 30, name: '시제·이유 확장', spec: '과거·미래 시제, 이유·조건 접속 표현(왜냐하면, 만약), 경험 말하기. 문장 6~11단어 수준.' },
    { from: 31, to: 40, name: '실전 의사소통', spec: '의견·제안·부탁·불만·문제 해결, 비교와 조언. 두 절을 잇는 복문 8~14단어 수준.' },
    { from: 41, to: 50, name: '고급 뉘앙스', spec: '협상·설득·감정 뉘앙스·관용 표현·격식체와 비격식체 구분, 시사 의견. 10~18단어의 자연스러운 긴 문장.' }
  ];

  // 50레벨 이후 롤플레잉 프리셋 상대 (언어별 6명)
  const PARTNER_PRESETS = {
    fr: [
      { id: 'fr_camille', name: 'Camille', role: '파리 카페 점원', avatar: '☕', gender: 'female', personality: '밝고 수다스러움', greeting: "Bonjour ! Qu'est-ce que je vous sers aujourd'hui ?", greetingKo: '안녕하세요! 오늘은 무엇을 드릴까요?' },
      { id: 'fr_julien', name: 'Julien', role: '회사 동료', avatar: '💼', gender: 'male', personality: '차분하고 꼼꼼함', greeting: 'Salut ! Tu as eu le temps de regarder le dossier ?', greetingKo: '안녕! 그 자료 볼 시간 있었어?' },
      { id: 'fr_marc', name: 'Marc', role: '파리 택시 기사', avatar: '🚕', gender: 'male', personality: '유머러스하고 말이 빠름', greeting: 'Bonsoir ! On va où ce soir ?', greetingKo: '안녕하세요! 오늘 밤 어디로 갈까요?' },
      { id: 'fr_lefevre', name: 'Madame Lefèvre', role: '집주인', avatar: '🏠', gender: 'female', personality: '정중하지만 깐깐함', greeting: "Bonjour, vous êtes bien installé dans l'appartement ?", greetingKo: '안녕하세요, 아파트에는 잘 자리 잡으셨나요?' },
      { id: 'fr_lea', name: 'Léa', role: '대학 친구', avatar: '🎒', gender: 'female', personality: '호기심 많고 친근함', greeting: "Coucou ! Tu fais quoi ce week-end ?", greetingKo: '안녕! 이번 주말에 뭐 해?' },
      { id: 'fr_antoine', name: 'Antoine', role: '서점 주인', avatar: '📚', gender: 'male', personality: '박식하고 느긋함', greeting: 'Bonjour, vous cherchez un livre en particulier ?', greetingKo: '안녕하세요, 특별히 찾는 책이 있으신가요?' }
    ],
    ja: [
      { id: 'ja_yui', name: 'ゆい (유이)', role: '카페 점원', avatar: '☕', gender: 'female', personality: '상냥하고 밝음', greeting: 'いらっしゃいませ！ご注文はお決まりですか？', greetingKo: '어서 오세요! 주문은 정하셨나요?' },
      { id: 'ja_tanaka', name: '田中 (다나카)', role: '회사 선배', avatar: '💼', gender: 'male', personality: '엄격하지만 배려심 있음', greeting: 'お疲れさま。例の資料、もう見てくれた？', greetingKo: '수고했어. 그 자료 벌써 봤어?' },
      { id: 'ja_kenji', name: '健二 (겐지)', role: '이자카야 사장', avatar: '🏮', gender: 'male', personality: '호탕하고 정이 많음', greeting: 'いらっしゃい！今日は何にする？', greetingKo: '어서 와! 오늘은 뭘로 할래?' },
      { id: 'ja_sato', name: '佐藤 (사토)', role: '호텔 프런트', avatar: '🏨', gender: 'female', personality: '매우 정중함', greeting: 'いらっしゃいませ。チェックインでございますか？', greetingKo: '어서 오십시오. 체크인이십니까?' },
      { id: 'ja_haruto', name: '陽斗 (하루토)', role: '대학 친구', avatar: '🎒', gender: 'male', personality: '장난스럽고 활발함', greeting: 'よっ！週末なにしてた？', greetingKo: '야! 주말에 뭐 했어?' },
      { id: 'ja_mika', name: '美香 (미카)', role: '미용사', avatar: '💇', gender: 'female', personality: '수다스럽고 세심함', greeting: 'こんにちは！今日はどんな感じにしますか？', greetingKo: '안녕하세요! 오늘은 어떤 느낌으로 할까요?' }
    ],
    cn: [
      { id: 'cn_xiaomei', name: '小美 (샤오메이)', role: '카페 점원', avatar: '☕', gender: 'female', personality: '활발하고 친절함', greeting: '你好！今天想喝点什么？', greetingKo: '안녕하세요! 오늘은 뭘 드시겠어요?' },
      { id: 'cn_wanglei', name: '王磊 (왕레이)', role: '회사 동료', avatar: '💼', gender: 'male', personality: '성실하고 직설적임', greeting: '早！昨天的报告你看完了吗？', greetingKo: '좋은 아침! 어제 보고서 다 봤어?' },
      { id: 'cn_laoli', name: '老李 (라오리)', role: '택시 기사', avatar: '🚕', gender: 'male', personality: '수다스럽고 유쾌함', greeting: '您好！去哪儿？', greetingKo: '안녕하세요! 어디 가세요?' },
      { id: 'cn_chen', name: '陈阿姨 (천 아주머니)', role: '집주인', avatar: '🏠', gender: 'female', personality: '잔소리가 많지만 따뜻함', greeting: '小伙子，房子住得还习惯吗？', greetingKo: '젊은이, 집은 지낼 만해요?' },
      { id: 'cn_xiaolin', name: '小林 (샤오린)', role: '대학 친구', avatar: '🎒', gender: 'male', personality: '느긋하고 농담을 좋아함', greeting: '嘿！周末有什么安排？', greetingKo: '야! 주말에 무슨 계획 있어?' },
      { id: 'cn_liuting', name: '刘婷 (류팅)', role: '상하이 가이드', avatar: '🗺️', gender: 'female', personality: '똑 부러지고 열정적임', greeting: '欢迎来到上海！今天想先去哪儿看看？', greetingKo: '상하이에 오신 걸 환영해요! 오늘은 어디부터 가 볼까요?' }
    ],
    en: [
      { id: 'en_emma', name: 'Emma', role: '뉴욕 카페 바리스타', avatar: '☕', gender: 'female', personality: '쾌활하고 말이 빠름', greeting: "Hey there! What can I get started for you?", greetingKo: '안녕하세요! 뭘로 준비해 드릴까요?' },
      { id: 'en_jake', name: 'Jake', role: '스타트업 동료', avatar: '💼', gender: 'male', personality: '느긋하고 농담을 좋아함', greeting: "Morning! Did you get a chance to look at the deck?", greetingKo: '좋은 아침! 발표 자료 볼 시간 있었어?' },
      { id: 'en_mike', name: 'Mike', role: '우버 기사', avatar: '🚕', gender: 'male', personality: '수다스럽고 친근함', greeting: "Hi! Heading downtown, right?", greetingKo: '안녕하세요! 시내로 가시는 거죠?' },
      { id: 'en_linda', name: 'Linda', role: '아파트 관리인', avatar: '🏠', gender: 'female', personality: '정중하지만 원칙적임', greeting: "Hello! How are you settling into the apartment?", greetingKo: '안녕하세요! 아파트 생활은 적응 잘 하고 계세요?' },
      { id: 'en_olivia', name: 'Olivia', role: '대학 친구', avatar: '🎒', gender: 'female', personality: '호기심 많고 밝음', greeting: "Hey! Any plans for the weekend?", greetingKo: '안녕! 주말에 계획 있어?' },
      { id: 'en_daniel', name: 'Daniel', role: '면접관', avatar: '🧑‍💼', gender: 'male', personality: '차분하고 날카로움', greeting: "Thanks for coming in today. Tell me a little about yourself.", greetingKo: '오늘 와 주셔서 감사합니다. 자기소개를 간단히 해 주세요.' }
    ],
    es: [
      { id: 'es_lucia', name: 'Lucía', role: '마드리드 카페 점원', avatar: '☕', gender: 'female', personality: '밝고 다정함', greeting: '¡Hola! ¿Qué te pongo hoy?', greetingKo: '안녕하세요! 오늘은 뭘 드릴까요?' },
      { id: 'es_javier', name: 'Javier', role: '회사 동료', avatar: '💼', gender: 'male', personality: '열정적이고 직설적임', greeting: '¡Buenos días! ¿Has visto el informe de ayer?', greetingKo: '좋은 아침! 어제 보고서 봤어?' },
      { id: 'es_paco', name: 'Paco', role: '택시 기사', avatar: '🚕', gender: 'male', personality: '유쾌하고 말이 많음', greeting: '¡Buenas! ¿Adónde vamos?', greetingKo: '안녕하세요! 어디로 갈까요?' },
      { id: 'es_carmen', name: 'Doña Carmen', role: '집주인', avatar: '🏠', gender: 'female', personality: '잔소리가 많지만 따뜻함', greeting: '¿Qué tal, hijo? ¿Te gusta el piso?', greetingKo: '어때요? 집은 마음에 들어요?' },
      { id: 'es_sofia', name: 'Sofía', role: '대학 친구', avatar: '🎒', gender: 'female', personality: '활발하고 장난스러움', greeting: '¡Ey! ¿Qué haces este finde?', greetingKo: '야! 이번 주말에 뭐 해?' },
      { id: 'es_diego', name: 'Diego', role: '타파스 바 주인', avatar: '🍤', gender: 'male', personality: '호탕하고 정이 많음', greeting: '¡Bienvenido! ¿Qué te apetece tomar?', greetingKo: '어서 와요! 뭐 드시고 싶어요?' }
    ],
    ru: [
      { id: 'ru_anya', name: 'Аня (아냐)', role: '모스크바 카페 점원', avatar: '☕', gender: 'female', personality: '밝고 친절함', greeting: 'Здравствуйте! Что будете заказывать?', greetingKo: '안녕하세요! 무엇을 주문하시겠어요?' },
      { id: 'ru_dmitry', name: 'Дмитрий (드미트리)', role: '회사 동료', avatar: '💼', gender: 'male', personality: '차분하고 꼼꼼함', greeting: 'Привет! Ты уже посмотрел отчёт?', greetingKo: '안녕! 보고서 벌써 봤어?' },
      { id: 'ru_sergey', name: 'Сергей (세르게이)', role: '택시 기사', avatar: '🚕', gender: 'male', personality: '수다스럽고 유쾌함', greeting: 'Добрый вечер! Куда едем?', greetingKo: '안녕하세요! 어디로 갈까요?' },
      { id: 'ru_galina', name: 'Галина Петровна (갈리나)', role: '집주인', avatar: '🏠', gender: 'female', personality: '잔소리가 많지만 따뜻함', greeting: 'Ну как, вам нравится квартира?', greetingKo: '어때요, 아파트는 마음에 들어요?' },
      { id: 'ru_masha', name: 'Маша (마샤)', role: '대학 친구', avatar: '🎒', gender: 'female', personality: '호기심 많고 활발함', greeting: 'Привет! Что делаешь в выходные?', greetingKo: '안녕! 주말에 뭐 해?' },
      { id: 'ru_ivan', name: 'Иван (이반)', role: '상트페테르부르크 가이드', avatar: '🗺️', gender: 'male', personality: '박식하고 열정적임', greeting: 'Добро пожаловать в Петербург! С чего начнём?', greetingKo: '페테르부르크에 오신 걸 환영해요! 어디부터 시작할까요?' }
    ]
  };

  // ---------------------------------------------------------------- 저장소
  function load(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  const curLang = () => (typeof selectedLang !== 'undefined' && selectedLang) ? selectedLang : 'fr';
  const apiKey = () => (typeof getActiveApiKey === 'function' ? getActiveApiKey() : '');
  const norm = (s) => String(s || '').toLowerCase().replace(/[\s\p{P}]/gu, '');

  function bandOf(level) {
    return BANDS.find(b => level >= b.from && level <= b.to) || BANDS[BANDS.length - 1];
  }
  // 2026-10-28 옵빠야 지시: 세트당 학습 문장 수 = 구간마다 4·6·8·10·12개, 구간 안 6번째 레벨부터 +1
  // (Lv.1~5 4개, 6~10 5개, 11~15 6개 … 41~45 12개, 46~50 13개). 4단계(핵심 청크→기본 문장→맥락 확장→실전 발화)는 문장 수에 고르게 나눔
  const BAND_SENTENCES = [4, 6, 8, 10, 12];
  function sentenceCount(level) {
    const b = bandOf(level), i = BANDS.indexOf(b);
    return BAND_SENTENCES[i] + (level - b.from + 1 > 5 ? 1 : 0);
  }
  // 2026-10-28 옵빠야 지시: 기초 탭 '50단계 실전 로드맵'의 단계(T0~T5)와 AI 맥락 생성을 같은 기준으로 연동
  const TIER_NAMES = ['문자', '청크', '기본문', '복합문', '고급문', '고급'];
  const tierOf = (level) => level < 1 ? 0 : Math.min(5, Math.ceil(level / 10));
  const tierLabel = (level) => `T${tierOf(level)}:${TIER_NAMES[tierOf(level)]}`;
  const roadmapLine = (lang, level) => `- 로드맵 단계: ${tierLabel(level)} · Lv.${level}/50 — 학습자가 지금 실제로 진행 중인 ${LANG_NAME[lang] || lang} 단계(기초 탭 로드맵과 연동). 이 단계보다 쉽거나 어려운 표현으로 벗어나지 말 것.`;
  const stageOf = (i, n) => Math.min(3, Math.floor(i * 4 / n));   // i번째 문장(0부터) → 4단계 중 몇 번째
  /** 지금 수업 세트의 문장(라운드) 수 — 예전 세트·내장 세트는 4개일 수 있어 세트 기준 */
  const roundCount = () => (typeof activeSessionCase !== 'undefined' && activeSessionCase && Array.isArray(activeSessionCase.rounds) && activeSessionCase.rounds.length) || 4;
  window.hgRoundCount = roundCount;

  // 세트 번호(1~5)는 언어별로 저장
  function getSetIdx() {
    const st = load('hg_v2_set', {});
    const s = st[curLang()];
    return (s && s.level === currentLevel && s.set >= 1 && s.set <= SETS_PER_LEVEL) ? s.set : 1;
  }
  function setSetIdx(n) {
    const st = load('hg_v2_set', {});
    st[curLang()] = { level: currentLevel, set: n };
    save('hg_v2_set', st);
  }

  // ---------------------------------------------------------------- 세트 데이터
  function baseSet(lang, level) {
    const data = (window.HG_V2_DATA && window.HG_V2_DATA[lang]) || [];
    const raw = data[level - 1];
    if (!raw) return null;
    const [title, situationKo, keywords, rounds] = raw;
    return {
      title, situationKo, keywords: String(keywords).split(','), art: TOPIC_ART[level - 1] || '🌟',
      rounds: rounds.map(([ko, target, phonetic, note]) => ({ ko, target, phonetic, note }))
    };
  }

  // 키가 없을 때 2~5세트: 같은 구간의 다른 레벨 기본 세트를 순서대로 빌려 온다 (레벨 안 5세트는 서로 다름)
  function fallbackSet(lang, level, k) {
    const band = bandOf(level);
    const span = band.to - band.from + 1;
    const lv = band.from + ((level - band.from) + (k - 1)) % span;
    const s = baseSet(lang, lv);
    if (s) s.source = `📚 내장 세트 (Lv.${lv} 응용)`;
    return s;
  }

  // ---------------------------------------------------------------- 1~10레벨 이어지는 맥락(스레드)
  // 처음 학습을 시작한 세트의 맥락(예: 첫 만남 인사)을 출발점으로 삼아, 10레벨까지 이후 세트는 모두
  // 같은 장면 안에서 다음 대화로 이어지게 만든다 (인사 → 안부 → 이름 → 출신 …). 출발점 이전 위치는 기존 방식.
  const THREAD_TO = 10;
  const anchorKey = (lang) => `hg_v2_anchor_${lang}`;
  const getAnchor = (lang) => load(anchorKey(lang), null);
  function isThreadPos(lang, level, k) {
    const a = getAnchor(lang);
    return !!a && level <= THREAD_TO && (level > a.level || (level === a.level && k > a.k));
  }
  function ensureAnchor(lang, level, k) {
    if (level > THREAD_TO || getAnchor(lang)) return;
    const s = getSetSync(lang, level, k);
    if (s) save(anchorKey(lang), { level, k, title: s.title, situationKo: s.situationKo, keywords: s.keywords });
  }
  function threadTitles(lang, level, k) {
    const a = getAnchor(lang);
    const out = [];
    for (let lv = a.level; lv <= level; lv++) {
      for (let s = (lv === a.level ? a.k : 1); s <= SETS_PER_LEVEL; s++) {
        if (lv === level && s >= k) return out.slice(-12);
        const set = (lv === a.level && s === a.k) ? a : load(cacheKey(lang, lv, s), null);
        if (set && set.title) out.push(set.title);
      }
    }
    return out.slice(-12);
  }

  const cacheKey = (lang, level, k) => isThreadPos(lang, level, k) ? `hg_v2_th_${lang}_${level}_${k}` : `hg_v2_ai_${lang}_${level}_${k}`;
  // 1세트도 문장 수가 4개를 넘는 레벨(6번째 레벨부터)은 AI가 그 수만큼 만든다 (내장 1세트는 4문장)
  const needsAi = (lang, level, k) => k > 1 || isThreadPos(lang, level, k) || sentenceCount(level) > 4;

  function usedTargets(lang) { return load(`hg_v2_used_${lang}`, []); }
  function rememberTargets(lang, set) {
    const used = usedTargets(lang);
    set.rounds.forEach(r => { const n = norm(r.target); if (n && !used.includes(n)) used.push(n); });
    save(`hg_v2_used_${lang}`, used.slice(-500));
  }

  // ---------------------------------------------------------------- 오늘의 주제 (2026-10-28 옵빠야 지시)
  // 주제를 고르거나 바꾸면 그 주제로 지금 세트부터 AI(고른 구독 AI → 무료 Gemini)가 4문장 + 대본을 한 번에 새로 만든다.
  // 주제 세트는 주제 번호(id)와 함께 따로 저장하고, 주제가 바뀌면 이전 주제 세트는 버린다(내장·이전 세트로 돌아가지 않게).
  const TOPIC_KEY = 'hg_topic';
  const topic = () => load(TOPIC_KEY, null);
  const tpKey = (lang, level, k) => `hg_v2_tp_${lang}_${level}_${k}`;
  function topicSet(lang, level, k) {
    const t = topic(), s = t && load(tpKey(lang, level, k), null);
    return s && s.topicId === t.id && s.rounds && s.rounds.length >= sentenceCount(level) ? s : null;
  }
  // AI 캐시 세트 — 문장 수 규칙(2026-10-28) 전에 만든 4문장 세트는 그 레벨 문장 수보다 적으면 새로 만들 대상으로 본다
  function aiSet(lang, level, k) {
    const s = load(cacheKey(lang, level, k), null);
    return s && s.rounds && s.rounds.length >= sentenceCount(level) ? s : null;
  }
  function setTopic(q) {
    q = String(q || '').trim();
    if (!q) return null;
    const t = topic();
    if (t && t.q === q) return t;   // 같은 주제를 다시 고르면 만들어 둔 세트를 그대로 쓴다
    const next = { q, id: Date.now() };
    save(TOPIC_KEY, next);
    // 이전 주제로 만든 세트는 지운다 (지금 언어만 — 다른 언어는 id가 달라 쓰이지 않고, 그 언어를 열 때 새로 만든다)
    const prefix = `hg_v2_tp_${curLang()}_`;
    try { Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    return next;
  }
  const hasSet = (lang, level, k) => !!topicSet(lang, level, k) || !needsAi(lang, level, k) || !!aiSet(lang, level, k);
  const wantTopicSet = (lang, level, k) => !!topic() && aiAvailable() && !topicSet(lang, level, k);
  const providerId = (label) => ({ 'Chat-Gpt': 'chatgpt', Claude: 'claude', Gemini: 'gemini' })[label] || 'gemini';
  const tpPending = {};
  /** 지금 주제로 세트 + 대본을 한 번의 AI 호출로 만든다. 실패 시 null (호출부는 기존 세트로 진행) */
  function generateTopicSet(lang, level, k, background = false) {
    const t = topic();
    if (!t || !aiAvailable()) return Promise.resolve(null);
    const have = topicSet(lang, level, k);
    if (have) return Promise.resolve(have);
    const pk = `${tpKey(lang, level, k)}_${t.id}`;
    if (tpPending[pk]) return tpPending[pk];
    const prev = k > 1 ? getSetSync(lang, level, k - 1) : (level > 1 ? getSetSync(lang, level - 1, SETS_PER_LEVEL) : null);
    const ns = sentenceCount(level);
    tpPending[pk] = (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const prompt = dialogFirstPrompt(lang, level, k, prev);
          const text = await geminiCall({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.95 }
          }, 50000, { background });  // 대화+문장을 한 번에 → 실기기 ChatGPT 최대 50초 관측
          const obj = JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
          const set = validateSet(obj, lang, ns, ns);
          if (!set) { console.warn('[HGV2] 주제 세트 반려(형식·반복)', attempt + 1); continue; }
          if ((topic() || {}).id !== t.id) return null;   // 그사이 주제가 또 바뀜
          const provider = lastProvider || aiName();
          set.source = `🎯 오늘 주제 · ${provider}`;
          set.topicId = t.id; set.topic = t.q;
          save(tpKey(lang, level, k), set);
          // 대본도 이 세트의 수업 화면 id·제목으로 바로 저장 → 세트를 시작하면 기다림 없이 재생
          if (obj.dialog && window.HGDIALOG && HGDIALOG.adopt) HGDIALOG.adopt(toSessionCase(set, lang, level, k), obj.dialog, providerId(provider));
          return set;
        } catch (e) {
          console.warn('[HGV2] 주제 세트 생성 실패', e.message);
          if (/NO_KEY|API 키 오류/.test(e.message) || (window.HGLLM && HGLLM.isCancel(e))) break;
        }
      }
      return null;
    })().finally(() => { delete tpPending[pk]; });
    return tpPending[pk];
  }
  // 2026-10-28 옵빠야 지시: 다이얼로그를 레벨 숫자만큼 만드는 게 아니라, (주제에 맞는) 자연스러운 대화를 먼저 쓰고
  // 그 대화의 대사 중에서 레벨에 맞는 학습 문장 수(sentenceCount)만큼 골라 수업 문장으로 쓴다. 세트+대본 한 번의 AI 호출.
  function dialogFirstPrompt(lang, level, k, prev) {
    const ns = sentenceCount(level), L = LANG_NAME[lang], t = topic();
    const n = window.HGDIALOG && HGDIALOG.lineCount ? HGDIALOG.lineCount(level, ns) : Math.max(8, ns + 3);
    return buildSetPrompt(lang, level, k, prev).replace(/\n반드시 아래 JSON만 출력하세요:[\s\S]*$/, '') + `
[작성 순서 — 대화 먼저, 학습 문장은 그 대화에서 고르기]
1) 먼저 ${t ? '오늘 주제' : '이 세트 상황'} 속 실제 사람 2~3명이 주고받는 자연스러운 대화(dialog)를 쓰세요.
   길이는 대화가 자연스럽게 시작해 마무리되는 만큼(대략 ${n}줄 안팎). 줄 수를 학습 문장 수에 맞추지 마세요.
   대사는 레벨 난이도 안의 자연스러운 구어로, ${t ? '오늘 주제가 대화 내내 살아 있게' : '장면이 생생하게'}.
2) 그 대화의 대사 중에서 이 레벨에 맞는 학습 문장 ${ns}개를 골라 rounds로 만드세요.
   - target은 대사에 나온 그대로(철자·문장부호 그대로, 긴 대사면 그 안의 한 문장이나 구를 그대로), 대화에 나오는 순서대로.
   - 위 [학습 문장 ${ns}개 구성]처럼 앞쪽은 짧고 뒤로 갈수록 길고 어렵게, 서로 겹치지 않게, 이미 학습한 표현은 피하기.

반드시 아래 JSON만 출력하세요:
{"title":"상황 제목(한국어 15자 이내)","situationKo":"상황 설명(한국어 50자 이내)","keywords":"키워드1,키워드2,키워드3","art":"장면을 그림처럼 표현한 이모지 2~3개",
"dialog":{"speakers":[{"name":"${L} 이름","role":"역할(한국어 6자 이내)","gender":"female 또는 male","emoji":"이모지 1개"}, ...2~3명],
"lines":[{"s":화자 번호(0부터),"t":"${L} 대사","p":"[한글 발음${lang === 'cn' ? ' · 병음' : ''}]","ko":"한국어 뜻"}, ...]},
"rounds":[{"ko":"한국어 뜻","target":"대사에서 고른 ${L} 문장 그대로","phonetic":"[한글 발음${lang === 'cn' ? ' · 병음' : ''}]","note":"짧은 활용 팁(한국어)","emoji":"이 문장의 핵심 단어를 나타내는 이모지 1개"}, ...총 ${ns}개]}`;
  }
  /** 주제를 정하고(바뀌었으면) 지금 세트를 그 주제로 만든다. waitMs 안에 못 받으면 false(생성은 뒤에서 계속) */
  async function applyTopic(q, waitMs = 25000) {
    if (!setTopic(q)) return false;
    const lang = curLang(), lv = currentLevel, k = getSetIdx();
    if (!wantTopicSet(lang, lv, k)) return !!topicSet(lang, lv, k);
    const job = generateTopicSet(lang, lv, k);
    const set = await Promise.race([job, new Promise(r => setTimeout(() => r(null), waitMs))]);
    return !!set;
  }

  /** 세트 데이터 즉시 반환 (오늘 주제 세트 → AI 캐시 → 1세트는 내장 → 없으면 내장 응용) */
  function getSetSync(lang, level, k) {
    const tp = topicSet(lang, level, k);
    if (tp) return tp;
    if (k === 1) {
      const ai = needsAi(lang, level, k) ? aiSet(lang, level, k) : null;
      if (ai) return ai;
      const s = baseSet(lang, level); if (s) s.source = '📚 내장 기본 세트'; return padRounds(s, lang, level);
    }
    return aiSet(lang, level, k) || padRounds(fallbackSet(lang, level, k), lang, level);
  }
  // 내장 세트(4문장)는 AI가 없을 때만 쓰인다 → 그 레벨 문장 수만큼 같은 구간 다른 내장 세트의 문장을 이어 붙여 채움(겹치는 문장 제외)
  function padRounds(s, lang, level) {
    const n = sentenceCount(level);
    if (!s || s.rounds.length >= n) return s;
    const band = bandOf(level), seen = new Set(s.rounds.map(r => norm(r.target)));
    for (let d = 1; d <= band.to - band.from && s.rounds.length < n; d++) {
      const lv = band.from + ((level - band.from) + d) % (band.to - band.from + 1), other = baseSet(lang, lv);
      for (const r of (other ? other.rounds : [])) { if (s.rounds.length >= n) break; if (!seen.has(norm(r.target))) { seen.add(norm(r.target)); s.rounds.push(r); } }
    }
    return s;
  }

  // ---------------------------------------------------------------- Gemini
  const modelVer = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');

  /** 이 키로 실제 쓸 수 있는 Flash 모델을 구글에서 조회 (무료, 하루 1번) — 새 버전이 나오면 자동으로 최신부터 사용 */
  async function discoverModels(key) {
    const c = load('hg_v2_models', null);
    if (c && Date.now() - c.t < 864e5 && Array.isArray(c.list)) return c.list;
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(key)}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) return [];
      const data = await res.json();
      const list = (data.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => String(m.name || '').replace(/^models\//, ''))
        .filter(n => /^gemini-\d/.test(n) && /flash/.test(n) && !/tts|image|live|audio|embed|exp|computer|native|thinking|8b/.test(n))
        .sort((a, b) => (/lite/.test(a) - /lite/.test(b)) || (modelVer(b) - modelVer(a)) || (/preview/.test(a) - /preview/.test(b)))
        .slice(0, 14);
      save('hg_v2_models', { t: Date.now(), list });
      return list;
    } catch (e) { return []; }
  }

  // 2.5 계열은 '생각' 단계를 꺼서 응답 시간을 단축 (다른 버전은 기본 설정 그대로)
  function thinkingOff(model) {
    return /2\.5/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {};
  }
  const cachedModels = () => (load('hg_v2_models', null) || {}).list || [];

  // 설정에서 고른 구독 AI(ChatGPT·Claude, HGLLM) → 없으면 무료 Gemini 키
  const llm = () => window.HGLLM ? HGLLM.active() : null;
  const aiAvailable = () => !!llm() || !!apiKey();
  const aiName = () => llm()?.label || 'Gemini';
  // 마지막으로 실제 답을 준 AI (출처 배지·세트 출처 표시용)
  let lastProvider = '';
  // 2026-10-28 옵빠야 지시: ChatGPT 한도·오류 → 무료 Gemini(키가 있을 때) → 그것도 안 되면 호출부의 로컬(내장) 학습
  async function geminiCall(body, timeoutMs, options = {}) {
    const ai = !options.geminiOnly && llm();
    if (ai) {
      try { const text = await ai.api.request(body, options); lastProvider = ai.label; return text; }
      catch (e) {
        if (HGLLM.isCancel(e) || !apiKey()) throw e;
        console.warn(`[HGV2] ${ai.label} 실패 → 무료 Gemini`, e.message);
      }
    }
    const key = apiKey();
    if (!key) throw new Error('NO_KEY');
    let lastErr = 'Gemini 응답 없음';
    const good = load('hg_v2_fast_model', null);
    const found = await discoverModels(key);
    const models = [...new Set([good, ...found, ...GEMINI_MODELS].filter(Boolean))];
    for (const model of models) {
      if (missingModels.has(model)) continue;
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), timeoutMs);
      const b = { ...body, generationConfig: { ...(body.generationConfig || {}), ...thinkingOff(model) } };
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b), signal: ctrl.signal
        });
        clearTimeout(tid);
        if (res.status === 401 || res.status === 403) throw new Error(`API 키 오류 (HTTP ${res.status})`);
        if (res.status === 400) {
          const t = await res.text().catch(() => '');
          if (/API[_ ]?key/i.test(t)) throw new Error('API 키 오류 (HTTP 400)');
          lastErr = `${model} HTTP 400`; continue; // 모델별 미지원 옵션 → 다음 모델
        }
        if (res.status === 404) missingModels.add(model);
        if (!res.ok) { lastErr = `${model} HTTP ${res.status}`; continue; } // 404 미지원·429 한도 → 다음 모델
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
        if (text) { if (good !== model) save('hg_v2_fast_model', model); lastProvider = 'Gemini'; return text; }
        lastErr = `${model} 빈 응답`;
      } catch (e) {
        clearTimeout(tid);
        if (/API 키 오류/.test(e.message)) throw e;
        lastErr = e.name === 'AbortError' ? `${model} 시간 초과` : e.message;
      }
    }
    throw new Error(lastErr);
  }

  function buildSetPrompt(lang, level, k, prev) {
    const band = bandOf(level);
    const stepInBand = level - band.from + 1;
    const n = sentenceCount(level);
    const used = usedTargets(lang).slice(-80);
    const t = topic();
    const daily = t ? '' : (typeof currentStoryQuote !== 'undefined' && currentStoryQuote) ? currentStoryQuote : '';
    const a = isThreadPos(lang, level, k) ? getAnchor(lang) : null;
    // 2026-10-28 옵빠야 지시: 학습자가 고른 오늘의 주제가 이 세트의 장면·대화 소재 (레벨 난이도·배울 순서는 유지)
    const topicLine = t ? `\n[오늘의 회화 주제 — 최우선]
- 학습자가 방금 고른 주제: "${t.q}"
- 이 세트의 장면·인물·대화 소재는 반드시 이 주제에서 나옵니다. 주제와 동떨어진 일반 상황(공항·호텔 등)으로 바꾸지 마세요.
- 레벨 난이도와 ${a ? '이어지는 대화의 배울 순서(인사→안부→…)는 지키되 그 대화가 이 주제 속에서 일어나게' : '직전 세트와 겹치지 않는 표현은 지키되 주제 안에서 새 장면으로'} 만드세요.` : '';
    const flow = a ? `- 1~${THREAD_TO}레벨은 하나로 이어지는 맥락입니다. 출발 맥락: "${a.title}" — ${a.situationKo} (키워드: ${(a.keywords || []).join(', ')})
- 지금까지 이어진 흐름: ${threadTitles(lang, level, k).join(' → ') || a.title}
- 직전 세트: "${prev ? prev.title : a.title}" — ${prev ? prev.situationKo : a.situationKo}
  → 직전 세트 대화 바로 다음에 나올 법한 질문·대답으로 이어 가세요. 장소·상대·상황을 바꾸지 말고, 같은 만남·장면 안에서 대화를 한 걸음씩 넓힙니다.
    (예: 첫 인사 → "어떻게 지냈어?" 안부 → "이름이 뭐야?" → 어디서 왔는지 → 무슨 일 하는지 → 취미 → 연락처 교환 → 다음 만남 약속)
${daily ? `- 학습자가 오늘 체크인에서 한 말: "${daily}" (이어지는 대화 안에서 자연스러울 때만 반영)` : ''}`
      : `- 직전 세트: "${prev ? prev.title : '없음'}" — ${prev ? prev.situationKo : ''}
  → 직전 상황에서 자연스럽게 이어지되, 새로운 장면·새로운 주제로 전환하세요.
${daily ? `- 학습자가 오늘 체크인에서 한 말: "${daily}" (주제 선택에 자연스럽게 반영)` : ''}`;
    return `당신은 한국인 학습자를 위한 ${LANG_NAME[lang]} 회화 커리큘럼 작가입니다.
세계관: 안드로메다에서 지구로 유배 온 AI 튜터 '엑자일'이 학습자를 데리고 지구 곳곳을 다니며 회화를 가르칩니다.

[이번 세트]
- 레벨: Lv.${level} (구간 ${band.from}~${band.to} '${band.name}'의 ${stepInBand}/10단계 — 구간 안에서 단계가 오를수록 조금씩 더 어렵게)
${roadmapLine(lang, level)}
- 구간 난이도 기준: ${band.spec}
${window.HGREVIEW && HGREVIEW.learningContext ? HGREVIEW.learningContext(lang, level) : ""}
- 이 레벨의 ${k}/5번째 세트 (${a ? '앞 세트와 표현이 겹치면 안 됨' : '같은 레벨의 다른 세트와 주제·표현이 겹치면 안 됨'})
${flow}
- 이미 학습한 표현(절대 반복 금지): ${used.join(' | ') || '없음'}${topicLine}

[학습 문장 ${n}개 구성] 하나의 연속된 상황 안에서 1→${n}번째 문장으로 갈수록 길고 어려워집니다.
${stagePlan(n)}

반드시 아래 JSON만 출력하세요:
{"title":"상황 제목(한국어 15자 이내)","situationKo":"상황 설명(한국어 50자 이내)","keywords":"키워드1,키워드2,키워드3","art":"장면을 그림처럼 표현한 이모지 2~3개",
"rounds":[{"ko":"한국어 뜻","target":"${LANG_NAME[lang]} 표현","phonetic":"[한글 발음${lang === 'cn' ? ' · 병음' : ''}]","note":"짧은 활용 팁(한국어)","emoji":"이 문장의 핵심 단어를 나타내는 이모지 1개"}, ...총 ${n}개]}`;
  }
  // 문장 n개를 4단계에 고르게 나눈 안내 (예: 6개 → 1~2번 핵심 청크, 3번 기본 문장, 4~5번 맥락 확장, 6번 실전 발화)
  function stagePlan(n) {
    const names = ['핵심 청크', '기본 문장', '맥락 확장', '실전 발화'], parts = [];
    for (let s = 0; s < 4; s++) {
      const idx = []; for (let i = 0; i < n; i++) if (stageOf(i, n) === s) idx.push(i + 1);
      if (idx.length) parts.push(`${idx.length > 1 ? idx[0] + '~' + idx[idx.length - 1] : idx[0]}번 ${names[s]}`);
    }
    return parts.join(', ') + '.';
  }

  // n: 이 레벨 문장 수. maxUsed: 이미 배운 표현이 이만큼 이상 섞이면 반려(기본: 문장 수의 1/3, 최소 2).
  // 오늘 주제 세트는 낮은 레벨의 짧은 표현이 겹치기 쉬워 n까지 허용(전부 반복일 때만 반려)
  function validateSet(obj, lang, maxUsed, n = 4) {
    if (maxUsed == null) maxUsed = Math.max(2, Math.ceil(n / 3));
    if (!obj || !Array.isArray(obj.rounds) || obj.rounds.length < n) return null;
    const used = new Set(usedTargets(lang));
    const rounds = obj.rounds.slice(0, n).map(r => ({
      ko: String(r.ko || '').trim(), target: String(r.target || '').trim(),
      phonetic: String(r.phonetic || '').trim(), note: String(r.note || '').trim(),
      emoji: String(r.emoji || '').trim().slice(0, 8)
    }));
    if (rounds.some(r => !r.ko || !r.target)) return null;
    // 이미 배운 표현이 2개 이상 섞이면 반려 (1개는 자연스러운 연결로 허용)
    if (rounds.filter(r => used.has(norm(r.target))).length >= maxUsed) return null;
    return {
      title: String(obj.title || '새로운 상황').slice(0, 30),
      situationKo: String(obj.situationKo || '').slice(0, 120),
      keywords: String(obj.keywords || '').split(/[,，]/).map(s => s.trim()).filter(Boolean).slice(0, 5),
      art: String(obj.art || '').trim().slice(0, 16) || '🌟',
      rounds
    };
  }

  const pending = {};
  /** k번째 세트를 AI로 생성해 캐시 (이미 있거나 진행 중이면 재사용). 실패 시 null */
  function generateSet(lang, level, k, force, background = false) {
    const ck = cacheKey(lang, level, k);
    if (!force && aiSet(lang, level, k)) return Promise.resolve(aiSet(lang, level, k));
    if (pending[ck]) return pending[ck];
    if (!aiAvailable()) return Promise.resolve(null);
    const prev = k > 1 ? getSetSync(lang, level, k - 1) : (level > 1 ? getSetSync(lang, level - 1, SETS_PER_LEVEL) : null);
    pending[ck] = (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          // 2026-10-28: 일반 세트도 대화 먼저 → 그 대화에서 레벨 문장 수만큼 골라 수업 문장 (대본은 바로 저장)
          const text = await geminiCall({
            contents: [{ parts: [{ text: dialogFirstPrompt(lang, level, k, prev) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.95 }
          }, 50000, {background});
          const obj = JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
          const set = validateSet(obj, lang, null, sentenceCount(level));
          if (set) {
            const provider = lastProvider || aiName();
            set.source = isThreadPos(lang, level, k) ? '🔗 1~10레벨 이어지는 맥락 · ' + provider : '✨ ' + provider + ' AI 맥락 연결 생성';
            save(ck, set);
            if (obj.dialog && window.HGDIALOG && HGDIALOG.adopt) HGDIALOG.adopt(toSessionCase(set, lang, level, k), obj.dialog, providerId(provider));
            return set;
          }
        } catch (e) {
          console.warn('[HGV2] 세트 생성 실패', e.message);
          if (/NO_KEY|API 키 오류/.test(e.message) || (window.HGLLM && HGLLM.isCancel(e))) break;
          if (!apiKey()) break; // 구독 AI만 있고 실패 → 내장 세트로
        }
      }
      return null;
    })().finally(() => { delete pending[ck]; });
    return pending[ck];
  }

  // ---------------------------------------------------------------- 세션 적용
  function toSessionCase(set, lang, level, k) {
    return {
      id: `v2_${lang}_${level}_${k}`, title: set.title, situationKo: set.situationKo, keywords: set.keywords,
      art: set.art || TOPIC_ART[level - 1] || '🌟',
      rounds: set.rounds.map((r, i, a) => ({ round: i + 1, type: `${ROUND_LABELS[stageOf(i, a.length)]} 세트 ${k}/5`, ...r })),
      theme: currentTheme, lang, level, set: k,
      source: `${set.source || ''} · 세트 ${k}/${SETS_PER_LEVEL}`
    };
  }

  /** 현재 레벨·세트를 화면 세션(activeSessionCase)으로 적용하고 다음 세트를 미리 준비 */
  function applyCurrent() {
    const lang = curLang();
    const k = getSetIdx();
    ensureAnchor(lang, currentLevel, k);
    const set = getSetSync(lang, currentLevel, k);
    if (!set) return null;
    activeSessionCase = toSessionCase(set, lang, currentLevel, k);
    rememberTargets(lang, set);
    if (typeof applySessionCaseToUI === 'function') applySessionCaseToUI(activeSessionCase);
    prefetchNext();
    return activeSessionCase;
  }

  function nextPos(level, k) {
    return k < SETS_PER_LEVEL ? { level, k: k + 1 } : (level < 50 ? { level: level + 1, k: 1 } : null);
  }

  // 다음 2개 세트를 미리 순서대로 만들어 둬서 넘어갈 때 기다림이 없게 한다
  async function prefetchNext() {
    // GPT 연결 시 '오늘의 다이얼로그' 대본도 미리 만들어 새 세트 시작 때 기다리지 않게 한다 (지금 세트 → 다음 세트 순)
    const dialog = (set, level, k) => { if (set && window.HGDIALOG && HGDIALOG.prefetch) HGDIALOG.prefetch(toSessionCase(set, curLang(), level, k)); };
    // 오늘 주제가 있으면 다음 2개를 주제 세트(+대본)로 뒤에서 만든다. 지금 세트는 주제를 고를 때(applyTopic)만 바꾼다
    // (수업 도중 뒤에서 도착한 세트로 문장이 바뀌지 않게)
    if (activeSessionCase) dialog(getSetSync(curLang(), currentLevel, getSetIdx()), currentLevel, getSetIdx());
    let pos = { level: currentLevel, k: getSetIdx() };
    for (let i = 0; i < 2; i++) {
      pos = nextPos(pos.level, pos.k);
      if (!pos) return;
      if (wantTopicSet(curLang(), pos.level, pos.k)) { await generateTopicSet(curLang(), pos.level, pos.k, true); continue; }
      const set = needsAi(curLang(), pos.level, pos.k) ? await generateSet(curLang(), pos.level, pos.k, false, true) : getSetSync(curLang(), pos.level, pos.k);
      if (i === 0) dialog(set, pos.level, pos.k);
    }
  }

  function isSessionCurrent() {
    return !!(activeSessionCase && activeSessionCase.id === `v2_${curLang()}_${currentLevel}_${getSetIdx()}`);
  }

  function setNotice(html) {
    const el = document.getElementById('gatekeeperNotice');
    if (el) el.innerHTML = html;
  }

  /** 엑자일이 다 말한 뒤 다음 문장 화면으로 (말이 끊기지 않게, 응답이 없으면 안전 시간 후 진행) */
  function speakThen(msg) {
    let done = false;
    const token = `${curLang()}_${currentLevel}_${getSetIdx()}`;
    const go = () => {
      if (done) return;
      done = true;
      // 그사이 레벨·세트·언어가 바뀌었으면(사용자가 이미 다른 화면으로 이동) 늦은 갱신을 하지 않는다
      if (token !== `${curLang()}_${currentLevel}_${getSetIdx()}`) return;
      if (typeof updateLevelUI === 'function') updateLevelUI();
    };
    if (typeof speakExileTutor === 'function') speakExileTutor(msg, 'ko', () => setTimeout(go, 400));
    setTimeout(go, 4000 + msg.length * 180);
  }

  /** 4라운드를 모두 통과한 뒤 호출: 다음 세트 또는 다음 레벨로 이동 */
  async function advanceAfterSet() {
    const lang = curLang();
    const k = getSetIdx();
    const completedLevel = currentLevel;
    if (k === SETS_PER_LEVEL && completedLevel % 10 === 0 && window.HGREVIEW) {
      if (HGREVIEW.isOpen()) return;
      const proceed = await HGREVIEW.checkpoint({lang,kind:'levels',level:completedLevel}, `Lv.${completedLevel - 9}~${completedLevel}`);
      if (!proceed || lang !== curLang() || currentLevel !== completedLevel || getSetIdx() !== k) return;
    }

    if (k < SETS_PER_LEVEL) {
      const nk = k + 1;
      if (wantTopicSet(lang, currentLevel, nk)) {
        setNotice(`<span style="color:#6366f1; font-weight:800;">🎯 엑자일이 오늘 주제로 다음 세트(${nk}/5)를 만드는 중입니다...</span>`);
        if (!await generateTopicSet(lang, currentLevel, nk) && !hasSet(lang, currentLevel, nk)) await generateSet(lang, currentLevel, nk);
      } else if (!hasSet(lang, currentLevel, nk) && aiAvailable()) {
        setNotice(`<span style="color:#6366f1; font-weight:800;">🌌 엑자일이 다음 세트(${nk}/5)를 맥락에 이어 준비 중입니다...</span>`);
        await generateSet(lang, currentLevel, nk);
      }
      setSetIdx(nk);
      currentRound = 1;
      roundPassed = [false, false, false, false];
      applyCurrent();
      setNotice('');
      const msg = window.HGUX ? HGUX.setDoneMessage(k, nk, activeSessionCase.title) : `세트 ${k} 완료! 이어서 세트 ${nk}, "${activeSessionCase.title}"로 넘어갈게.`;
      if (window.HGUX) HGUX.celebrate(`✨ 세트 ${k}/${SETS_PER_LEVEL} 클리어!`, msg);
      speakThen(msg);
      return;
    }

    if (currentLevel < 50) {
      if (wantTopicSet(lang, currentLevel + 1, 1)) {
        setNotice(`<span style="color:#6366f1; font-weight:800;">🎯 엑자일이 오늘 주제로 Lv.${currentLevel + 1}을 만드는 중입니다...</span>`);
        await generateTopicSet(lang, currentLevel + 1, 1);
        setNotice('');
      } else if (needsAi(lang, currentLevel + 1, 1) && !aiSet(lang, currentLevel + 1, 1) && aiAvailable()) {
        setNotice(`<span style="color:#6366f1; font-weight:800;">🔗 엑자일이 Lv.${currentLevel + 1}을 지금 대화에 이어 준비 중입니다...</span>`);
        await generateSet(lang, currentLevel + 1, 1);
        setNotice('');
      }
      currentLevel++;
      setSetIdx(1);
      currentRound = 1;
      roundPassed = [false, false, false, false];
      try { localStorage.setItem('hangeoreum_level', currentLevel); } catch (e) {}
      const slider = document.getElementById('levelSlider');
      if (slider) slider.value = currentLevel;
      applyCurrent();
      const msg = window.HGUX ? HGUX.levelUpMessage(currentLevel) : `Lv.${currentLevel} 승급! 새로운 장면으로 이동할게.`;
      if (window.HGUX) HGUX.celebrate(`🚀 Lv.${currentLevel} 승급!`, `${msg}<div style="margin-top:10px;font-size:34px;">${activeSessionCase.art || ''}</div>`, true);
      else if (typeof showLevelUpAutoToast === 'function') showLevelUpAutoToast(currentLevel);
      speakThen(msg);
      return;
    }

    // 50레벨 5세트 완료 → 실전 롤플레잉 개방
    save(`hg_v2_freetalk_${lang}`, true);
    if (typeof speakExileTutor === 'function') speakExileTutor('50레벨 완주! 이제 대화 상대를 골라 실전 롤플레잉을 시작하자.', 'ko');
    if (typeof updateLevelUI === 'function') updateLevelUI();
    openPartnerPicker();
  }

  // ---------------------------------------------------------------- 가장 멀리 진행한 위치 (뒤로 갔다가 다시 앞으로)
  // 2026-10-27: 이전 단계로 돌아가면 통과 기록(roundPassed)이 지금 세트 것만 남아 다시 앞으로 갈 수 없던 문제 → 언어별 최원 위치 기억
  // 2026-10-28: 세트당 문장이 최대 13개 → 라운드 자리를 두 자리로 (hg_far2_). 예전 hg_far_ 값은 한 번 옮겨 담는다
  const farKey = (lang) => {
    const k2 = `hg_far2_${lang}`;
    try {
      const old = parseInt(localStorage.getItem(`hg_far_${lang}`), 10);
      if (old > 0 && localStorage.getItem(k2) == null) save(k2, (Math.floor(old / 10)) * 100 + old % 10);
      localStorage.removeItem(`hg_far_${lang}`);
    } catch (e) {}
    return k2;
  };
  const posVal = (lv, k, r) => (lv * 10 + k) * 100 + r;
  function noteFar() {
    const v = posVal(currentLevel, getSetIdx(), currentRound);
    if (v > load(farKey(curLang()), 0)) save(farKey(curLang()), v);
  }
  function behindFar() { return posVal(currentLevel, getSetIdx(), currentRound) < load(farKey(curLang()), 0); }
  /** 이미 진행했던 곳이면 통과 없이 한 단계 앞으로. 반환: 'round' | 'set' | 'level' | false */
  function forward() {
    if (!behindFar()) return false;
    if (currentRound < roundCount()) { currentRound++; return 'round'; }
    const k = getSetIdx();
    currentRound = 1;
    roundPassed = [false, false, false, false];
    if (k < SETS_PER_LEVEL) { setSetIdx(k + 1); applyCurrent(); return 'set'; }
    if (currentLevel < 50) {
      currentLevel++;
      setSetIdx(1);
      try { localStorage.setItem('hangeoreum_level', currentLevel); } catch (e) {}
      const slider = document.getElementById('levelSlider');
      if (slider) slider.value = currentLevel;
      applyCurrent();
      return 'level';
    }
    return false;
  }

  /** 이전 라운드 또는 이전 세트로 */
  function goBack() {
    if (currentRound > 1) { currentRound--; return true; }
    const k = getSetIdx();
    if (k > 1) { setSetIdx(k - 1); applyCurrent(); currentRound = roundCount(); return true; }
    return false; // 레벨 이동은 기존 로직에 맡김
  }

  /** 현재 세트를 AI로 다시 만들기 (2~5세트만, 1세트는 내장 기본) */
  async function regenerateCurrent() {
    const lang = curLang();
    const k = getSetIdx();
    if (!needsAi(lang, currentLevel, k) || !aiAvailable()) return false;
    setNotice('<span style="color:#6366f1; font-weight:800;">🌌 이 세트를 새 맥락으로 다시 만드는 중...</span>');
    const set = await generateSet(lang, currentLevel, k, true);
    setNotice('');
    if (!set) return false;
    currentRound = 1;
    roundPassed = [false, false, false, false];
    applyCurrent();
    if (typeof updateLevelUI === 'function') updateLevelUI();
    return true;
  }

  // ---------------------------------------------------------------- 50레벨 이후 실전 롤플레잉
  const isFreeTalk = () => currentLevel >= 50 && !!load(`hg_v2_freetalk_${curLang()}`, false);
  const getPartner = () => load(`hg_v2_partner_${curLang()}`, null);
  let chatHistory = [];

  function nativeVoice(gender) {
    const map = { fr: { female: 'fr-FR-DeniseNeural', male: 'fr-FR-HenriNeural' }, ja: { female: 'ja-JP-NanamiNeural', male: 'ja-JP-KeitaNeural' }, cn: { female: 'zh-CN-XiaoxiaoNeural', male: 'zh-CN-YunxiNeural' },
      en: { female: 'en-US-JennyNeural', male: 'en-US-GuyNeural' }, es: { female: 'es-ES-ElviraNeural', male: 'es-ES-AlvaroNeural' },
      ru: { female: 'ru-RU-SvetlanaNeural', male: 'ru-RU-DmitryNeural' } };
    return (map[curLang()] || map.fr)[gender === 'male' ? 'male' : 'female'];
  }

  function speakPartner(text) {
    const p = getPartner();
    if (typeof speakTextWithFallback === 'function') speakTextWithFallback(text, curLang(), { forceEngine: 'edge', forceVoice: nativeVoice(p && p.gender) });
  }

  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function setupFreeTalkView() {
    const p = getPartner();
    if (!p) { openPartnerPicker(); return; }
    chatHistory = [{ role: 'partner', text: p.greeting }];
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('personaAvatar', p.avatar || '🗣️');
    set('personaName', p.name);
    set('personaRole', `${p.role} · 실전 롤플레잉`);
    set('rpSessionCaseTitle', `실전 롤플레잉 — ${p.name} (${p.role})`);
    if (typeof currentPersonaGreetingText !== 'undefined') currentPersonaGreetingText = p.greeting;
    const log = document.getElementById('chatLog');
    if (log) {
      log.innerHTML = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:6px;">
          <button type="button" onclick="HGV2.openPartnerPicker()" style="font-size:12px; font-weight:800; padding:5px 10px; border-radius:10px; border:1.5px solid #c7d2fe; background:#eef2ff; color:#4338ca; cursor:pointer;">🔄 대화 상대 바꾸기</button>
        </div>
        <div style="display:flex; gap:8px; align-items:flex-start;">
          <div style="width:32px; height:32px; border-radius:50%; background:#e0e7ff; display:flex; align-items:center; justify-content:center; font-size:16px;">${esc(p.avatar)}</div>
          <div style="background:#ffffff; border:1.5px solid #e2e8f0; padding:10px 14px; border-radius:14px; font-size:14px; text-align:left; max-width:85%;">
            <strong>${esc(p.greeting)}</strong>
            <div style="font-size:12px; color:#64748b; margin-top:4px;">(${esc(p.greetingKo)})</div>
          </div>
        </div>`;
    }
    window.HGAI?.badge(log?.lastElementChild?.lastElementChild, ['Chat-Gpt', 'Claude', 'Gemini'].includes(p.provider) ? p.provider : '');
    setTimeout(() => speakPartner(p.greeting), 300);
  }

  /** 학습자 발화에 대한 상대 AI 답변 {text, ko} (키 없으면 null → 기존 오프라인 답변 사용) */
  async function partnerReply(userText) {
    const p = getPartner();
    if (!p || !aiAvailable()) return null;
    chatHistory.push({ role: 'learner', text: userText });
    const convo = chatHistory.slice(-12).map(m => `${m.role === 'partner' ? p.name : '학습자'}: ${m.text}`).join('\n');
    const prompt = `당신은 ${LANG_NAME[curLang()]} 원어민 '${p.name}'(${p.role}, 성격: ${p.personality})입니다. 한국인 학습자와 실전 회화를 이어 갑니다.
대화 내용:
${convo}
규칙: 역할과 성격을 유지하며 1~2문장으로 자연스럽게 답하고, 대화가 이어지도록 가끔 질문을 던지세요. 학습자의 문장이 어색하면 답변 속에서 자연스러운 표현으로 되받아 주세요.
반드시 JSON만 출력: {"text":"${LANG_NAME[curLang()]} 답변","ko":"한국어 번역"}`;
    try {
      const raw = await geminiCall({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.9, maxOutputTokens: 300 } }, 12000);
      const obj = JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim());
      if (obj && obj.text) { chatHistory.push({ role: 'partner', text: obj.text }); return { text: String(obj.text), ko: String(obj.ko || ''), provider: lastProvider }; }
    } catch (e) { console.warn('[HGV2] 롤플레잉 답변 실패', e.message); }
    return null;
  }

  function choosePartner(partner) {
    save(`hg_v2_partner_${curLang()}`, partner);
    const m = document.getElementById('hgv2PartnerModal');
    if (m) m.remove();
    if (typeof updateLevelUI === 'function') updateLevelUI();
  }

  async function createCustomPartner() {
    const v = (id) => (document.getElementById(id)?.value || '').trim();
    const role = v('hgv2Role') || '현지 친구';
    const personality = v('hgv2Personality') || '친절함';
    const gender = document.querySelector('input[name="hgv2Gender"]:checked')?.value || 'female';
    const name = v('hgv2Name') || (gender === 'male' ? 'Alex' : 'Mia');
    const fallbackGreeting = { fr: ['Bonjour ! Enchanté de vous rencontrer.', '안녕하세요! 만나서 반가워요.'], ja: ['こんにちは！はじめまして。', '안녕하세요! 처음 뵙겠습니다.'], cn: ['你好！很高兴认识你。', '안녕하세요! 만나서 반가워요.'],
      en: ['Hi there! Nice to meet you.', '안녕하세요! 만나서 반가워요.'], es: ['¡Hola! Encantado de conocerte.', '안녕하세요! 만나서 반가워요.'], ru: ['Здравствуйте! Очень приятно.', '안녕하세요! 만나서 반가워요.'] }[curLang()] || ['Hello!', '안녕하세요!'];
    let greeting = fallbackGreeting[0], greetingKo = fallbackGreeting[1], provider = 'builtin';
    if (aiAvailable()) {
      try {
        const raw = await geminiCall({ contents: [{ parts: [{ text: `${LANG_NAME[curLang()]} 원어민 '${name}'(${role}, 성격: ${personality})가 한국인 학습자에게 건네는 자연스러운 첫마디 1문장. JSON만: {"text":"원어","ko":"한국어 번역"}` }] }], generationConfig: { responseMimeType: 'application/json' } }, 15000);
        const o = JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim());
        if (o && o.text) { greeting = o.text; greetingKo = o.ko || ''; provider=lastProvider; }
      } catch (e) {}
    }
    choosePartner({ id: `custom_${Date.now()}`, name, role, personality, gender, avatar: gender === 'male' ? '🧑' : '👩', greeting, greetingKo, provider });
  }

  function openPartnerPicker() {
    document.getElementById('hgv2PartnerModal')?.remove();
    const list = PARTNER_PRESETS[curLang()] || PARTNER_PRESETS.fr;
    const wrap = document.createElement('div');
    wrap.id = 'hgv2PartnerModal';
    wrap.style.cssText = 'position:fixed; inset:0; z-index:99990; background:rgba(15,23,42,0.55); display:flex; align-items:center; justify-content:center; padding:16px;';
    wrap.innerHTML = `
      <div style="background:#fff; border-radius:20px; max-width:440px; width:100%; max-height:90vh; overflow:auto; padding:18px; box-shadow:0 20px 50px rgba(0,0,0,0.3);">
        <div style="font-size:17px; font-weight:900; color:#1e1b4b; margin-bottom:4px;">🗣️ 실전 롤플레잉 대화 상대 고르기</div>
        <div style="font-size:12.5px; color:#64748b; margin-bottom:12px;">상대는 원어민 목소리로 말합니다. ${aiAvailable() ? '' : '(AI 연결이 없으면 내장 답변을 사용합니다)'}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
          ${list.map((p, i) => `<button type="button" data-i="${i}" class="hgv2-preset" style="text-align:left; padding:10px; border-radius:14px; border:2px solid #e2e8f0; background:#f8fafc; cursor:pointer;">
            <div style="font-size:20px;">${p.avatar}</div>
            <div style="font-size:13.5px; font-weight:900; color:#0f172a;">${esc(p.name)}</div>
            <div style="font-size:11.5px; color:#475569;">${esc(p.role)} · ${p.gender === 'male' ? '남성' : '여성'}</div>
            <div style="font-size:11px; color:#94a3b8;">${esc(p.personality)}</div></button>`).join('')}
        </div>
        <div style="border-top:1.5px dashed #e2e8f0; padding-top:12px;">
          <div style="font-size:14px; font-weight:900; color:#334155; margin-bottom:8px;">✏️ 직접 만들기</div>
          <input id="hgv2Name" placeholder="이름 (예: Sophie)" style="width:100%; box-sizing:border-box; padding:9px; border-radius:10px; border:1.5px solid #cbd5e1; margin-bottom:6px;">
          <input id="hgv2Role" placeholder="역할 (예: 와인 가게 주인, 면접관)" style="width:100%; box-sizing:border-box; padding:9px; border-radius:10px; border:1.5px solid #cbd5e1; margin-bottom:6px;">
          <input id="hgv2Personality" placeholder="성격 (예: 깐깐하지만 유머 있음)" style="width:100%; box-sizing:border-box; padding:9px; border-radius:10px; border:1.5px solid #cbd5e1; margin-bottom:6px;">
          <div style="display:flex; gap:14px; font-size:13px; font-weight:800; color:#334155; margin-bottom:10px;">
            <label><input type="radio" name="hgv2Gender" value="female" checked> 여성</label>
            <label><input type="radio" name="hgv2Gender" value="male"> 남성</label>
          </div>
          <button type="button" id="hgv2CreateBtn" style="width:100%; padding:11px; border-radius:12px; border:none; background:#4f46e5; color:#fff; font-weight:900; cursor:pointer;">이 상대와 대화 시작</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.querySelectorAll('.hgv2-preset').forEach(btn => btn.addEventListener('click', () => choosePartner(list[+btn.dataset.i])));
    wrap.querySelector('#hgv2CreateBtn').addEventListener('click', createCustomPartner);
  }

  // ---------------------------------------------------------------- 장면 일러스트 (문장 카드 옆)
  let lastArtKey = '';
  function renderArt() {
    const anchor = document.getElementById('koreanPrompt');
    if (!anchor || !activeSessionCase || !String(activeSessionCase.id || '').startsWith('v2_')) return;
    let card = document.getElementById('hgArtCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'hgArtCard';
      anchor.parentNode.insertBefore(card, anchor);
    }
    const r = activeSessionCase.rounds[currentRound - 1] || {};
    const scene = activeSessionCase.art || '🌟';
    const main = r.emoji || [...scene][0] || '🌟';
    const key = `${activeSessionCase.id}_${currentRound}`;
    card.innerHTML = `<div class="hga-main">${esc(main)}</div>
      <div class="hga-side"><div class="hga-scene">${esc(scene)}</div><div class="hga-title">${esc(activeSessionCase.title)}</div></div>`;
    if (key !== lastArtKey) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); lastArtKey = key; }
  }

  window.HGV2 = {
    SETS_PER_LEVEL, BANDS, PARTNER_PRESETS, TOPIC_ART, LANG_NAME, GEMINI_MODELS, cachedModels,
    lastProvider: () => lastProvider, bandOf, getSetIdx, setSetIdx, getSetSync, generateSet, applyCurrent, isSessionCurrent,
    advanceAfterSet, goBack, noteFar, behindFar, forward, regenerateCurrent, renderArt, getAnchor, isThreadPos, sentenceCount, roundCount, _dialogFirstPrompt: dialogFirstPrompt,
    TIER_NAMES, tierOf, tierLabel, roadmapLine,
    isFreeTalk, getPartner, setupFreeTalkView, partnerReply, speakPartner, openPartnerPicker,
    _validateSet: validateSet, _buildSetPrompt: buildSetPrompt,
    topic, setTopic, applyTopic, generateTopicSet, topicSet, prefetch: prefetchNext,
    saveTopicSet: (lang, level, k, set) => { const t = topic(); if (t) save(tpKey(lang, level, k), { ...set, topicId: t.id, topic: t.q }); },
    geminiCall, apiKey, aiAvailable, aiName  // 오늘의 뉴스(hg_news.js)가 같은 모델 폴백 경로를 쓴다
  };
})();
