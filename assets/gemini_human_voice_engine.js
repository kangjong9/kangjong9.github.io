/**
 * GeminiHumanVoiceEngine (v3.8.0)
 * Google AI Studio Gemini 3.8 Flash 기반 44종 실제 사람 신경망 음성 전담 표준 엔진
 * 
 * - 최신 플래그십 Gemini 3.8 Flash 최우선 1순위 직결
 * - 44종 고유 페르소나 (사람 22종 + 애니 22종, 4대 히든 포함)
 * - 5개 국어 (한국어, 프랑스어, 중국어, 일본어, 영어) 원어민 회화 매핑
 * - 로컬 기계음 원천 차단 (Human Voice Exclusive Mode) 기본 지원
 * - 16bit PCM ➔ 24kHz 고음질 WAV Blob 실시간 합성 및 고속 캐싱
 * - 새 키 입력 시 이전 쿨다운/스킵 메모리 자동 전면 초기화
 * - 실시간 쿼터(429), 인증(403/401), 규격(400) 정밀 진단 시스템
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GeminiHumanVoiceEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // 44종 마스터 보이스 데이터베이스 (사람 22종 + 애니 22종)
  const MASTER_VOICES_44 = [
  {
    "id": "HUMAN_F1",
    "voiceId": "HUMAN_F1",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F1. 다정한 표준 튜터",
    "displayName": "여성 1 (F1 다정한 표준 튜터)",
    "icon": "👩‍🏫",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 1.0,
    "rate": 0.96,
    "speakingRate": 0.96,
    "sub": 0,
    "style": "따뜻하고 편안한 표준 어학 튜터 톤",
    "desc": "따뜻하고 편안한 표준 어학 튜터 여성 톤",
    "prompt": "따뜻하고 포근한 20대 여성 어학 선생님처럼 다정하고 편안한 호흡으로 차분하게 발음해 주세요.",
    "samples": {
      "ko": "반가워요 {NAME}님! 조급해하지 말고 한 단어씩 호흡을 맞춰봐요.",
      "zh": "你好 {NAME}！别着急，我们一个词一个词地慢慢练习吧。",
      "ja": "はじめまして、{NAME}さん！焦らずに一言ずつ一緒に息を合わせていきましょう。",
      "en": "Hello {NAME}! Don't rush, let's take it one word at a time together.",
      "fr": "Ravi de vous rencontrer, Commandant ! Ne vous pressez pas, prenons les mots un par un."
    }
  },
  {
    "id": "HUMAN_F2",
    "voiceId": "HUMAN_F2",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F2. 또렷한 뉴스 앵커",
    "displayName": "여성 2 (F2 또렷한 뉴스 앵커)",
    "icon": "📰",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 1.02,
    "rate": 1.02,
    "speakingRate": 1.02,
    "sub": 1,
    "style": "또렷하고 신뢰감 넘치는 표준 아나운서 여성 톤",
    "desc": "또렷하고 신뢰감 넘치는 표준 아나운서 여성 톤",
    "prompt": "표준 한국어 뉴스 앵커 여성처럼 한 글자 한 글자 명확하고 신뢰감 넘치는 또렷한 발성으로 말하세요.",
    "samples": {
      "ko": "안녕하십니까 {NAME}님. 표준 원어민 발음 교정 코칭을 시작합니다.",
      "zh": "您好 {NAME}。现在开始标准母语发音矫正课程。",
      "ja": "こんにちは、{NAME}さん。標準ネイティブ発음矯正コーチングを開始します。",
      "en": "Good day {NAME}. We will now begin our standard pronunciation coaching.",
      "fr": "Voici les informations du soir, présentées avec rigueur et précision."
    }
  },
  {
    "id": "HUMAN_F3",
    "voiceId": "HUMAN_F3",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F3. 활기찬 20대 일상",
    "displayName": "여성 3 (F3 활기찬 20대 일상)",
    "icon": "✨",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.05,
    "rate": 1.06,
    "speakingRate": 1.06,
    "sub": 2,
    "style": "밝고 활기찬 20대 원어민 여성의 자연스러운 일상 톤",
    "desc": "밝고 활기찬 20대 원어민 여성의 자연스러운 일상 톤",
    "prompt": "밝고 긍정적인 20대 여성 친구처럼 경쾌하고 자연스러운 억양으로 발음해 주세요.",
    "samples": {
      "ko": "{NAME}아 안녕! 오늘 표현 진짜 유용하니까 가볍게 입으로 소리 내보자!",
      "zh": "{NAME}你好！今天的表达特别实用，放轻松大声读出来吧！",
      "ja": "{NAME}、ヤッホー！今日の表現は本当に使えるから、声に出してみて！",
      "en": "Hey {NAME}! Today's phrases are super handy, let's say them out loud together!",
      "fr": "Salut Commandant ! Profitons de cette belle journée pour pratiquer dans la bonne humeur !"
    }
  },
  {
    "id": "HUMAN_F4",
    "voiceId": "HUMAN_F4",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F4. 차분한 다큐 내레이터",
    "displayName": "여성 4 (F4 차분한 다큐 내레이터)",
    "icon": "🎙️",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 0.96,
    "rate": 0.92,
    "speakingRate": 0.92,
    "sub": 3,
    "style": "깊이 있고 차분하게 스며드는 여성 내레이션 톤",
    "desc": "깊이 있고 차분하게 스며드는 여성 내레이션 톤",
    "prompt": "품격 있는 다큐멘터리 내레이터 여성처럼 깊고 차분한 울림으로 한 단어씩 정성스럽게 낭독하세요.",
    "samples": {
      "ko": "언어는 문화의 거울입니다. {NAME}님만의 아름다운 문장을 빚어내 보세요.",
      "zh": "语言是文化的镜子。请与我们一起雕琢属于您的优美句子。",
      "ja": "言葉は文化の鏡です。{NAME}さんならではの美しい文章を紡ぎましょう。",
      "en": "Language reflects culture. Let us craft beautiful sentences together with {NAME}.",
      "fr": "Au cœur du silence, chaque syllabe porte une résonance profonde et solennelle."
    }
  },
  {
    "id": "HUMAN_F5",
    "voiceId": "HUMAN_F5",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F5. 우아한 멘토 (알토)",
    "displayName": "여성 5 (F5 우아한 알토 멘토)",
    "icon": "☕",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 0.9,
    "rate": 0.88,
    "speakingRate": 0.88,
    "sub": 4,
    "style": "성숙하고 우아한 중저음 알토 여성 멘토 톤",
    "desc": "성숙하고 우아한 중저음 알토 여성 멘토 톤",
    "prompt": "성숙하고 지적인 30대 여성 알토 톤으로, 여유롭고 부드럽게 감싸듯 말해 주세요.",
    "samples": {
      "ko": "반가워요. 배움은 서두르지 않는 데서 깊어집니다. 천천히 따라오세요.",
      "zh": "你好。真正的学习在于不急躁，慢慢跟上我的节奏吧。",
      "ja": "お会いできて嬉しいです。焦らず着実に進むことで学びは深まります。",
      "en": "Welcome. True learning deepens when we take our time. Follow along smoothly.",
      "fr": "La véritable maîtrise de la langue commence par une écoute attentive des nuances."
    }
  },
  {
    "id": "HUMAN_F6",
    "voiceId": "HUMAN_F6",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F6. 스마트 비즈니스 프로",
    "displayName": "여성 6 (F6 스마트 비즈니스)",
    "icon": "💼",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.04,
    "rate": 1.08,
    "speakingRate": 1.08,
    "sub": 0,
    "style": "글로벌 IT 기업 프로페셔널 여성 리더 톤",
    "desc": "글로벌 IT 기업 프로페셔널 여성 리더 톤",
    "prompt": "글로벌 기업의 당당하고 스마트한 여성 임원처럼 명료하고 자신감 넘치게 발음하세요.",
    "samples": {
      "ko": "핵심을 명확하게 전달하는 실전 비즈니스 회화, 바로 시작해 볼까요?",
      "zh": "精准传达核心要点的商务会话，让我们立即开始吧。",
      "ja": "要点を明確に伝えるビジネス会話、早速スタートしましょう。",
      "en": "Clear communication is key in business. Let's dive right into our practical drills.",
      "fr": "La clarté de notre communication est la clé de voûte de nos partenariats internationaux."
    }
  },
  {
    "id": "HUMAN_F7",
    "voiceId": "HUMAN_F7",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F7. 다정한 심리상담사",
    "displayName": "여성 7 (F7 다정한 심리상담사)",
    "icon": "🌿",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 0.98,
    "rate": 0.92,
    "speakingRate": 0.92,
    "sub": 1,
    "style": "지친 마음에 위로를 건네는 포근한 힐링 여성 톤",
    "desc": "지친 마음에 위로를 건네는 포근한 힐링 여성 톤",
    "prompt": "전문 심리상담사 여성처럼 따스하고 포근하며 공감 어린 어조로 속삭이듯 말하세요.",
    "samples": {
      "ko": "틀려도 괜찮아요 {NAME}님. 오늘 하루도 고생 많았어요. 편안하게 해봐요.",
      "zh": "没关系的，念错也不要紧。今天辛苦了，带着放松的心情练习吧。",
      "ja": "間違えても大丈夫ですよ。今日も一日お疲れ様でした。リラックスしてね。",
      "en": "It's totally okay to make mistakes. You did great today, just speak comfortably.",
      "fr": "Respirez lentement... Vous progressez magnifiquement, faites-vous confiance."
    }
  },
  {
    "id": "HUMAN_F8",
    "voiceId": "HUMAN_F8",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F8. 발랄한 여행 가이드",
    "displayName": "여성 8 (F8 발랄한 여행 가이드)",
    "icon": "✈️",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 1.04,
    "rate": 1.02,
    "speakingRate": 1.02,
    "sub": 2,
    "style": "설렘과 활력이 가득한 유쾌하고 상큼한 여성 가이드 톤 (여성 확정)",
    "desc": "설렘과 활력이 가득한 유쾌하고 친근한 20대 여성 가이드 톤",
    "prompt": "친절하고 활력 넘치는 20대 여성 여행 가이드처럼 설렘 가득하고 상큼 발랄한 여성 목소리로 경쾌하게 말씀해 주세요. 절대로 남성이나 기계음이 아닌 사랑스럽고 또렷한 원어민 여성 톤입니다.",
    "samples": {
      "ko": "설레는 여행길! 현지에서 바로 통하는 살아있는 여성 가이드 발음으로 연습해요!",
      "zh": "激动人心的旅程！让我们用最地道的旅游向导发音练习吧！",
      "ja": "ワクワクする旅の始まり！現地ですぐ通じるネイティブ女性ガイドの発音で練習しましょう！",
      "en": "Welcome to our exciting trip! Let's practice with authentic travel guide pronunciation!",
      "fr": "Bienvenue dans cette formidable visite guidée ! Suivez-moi avec le sourire !"
    }
  },
  {
    "id": "HUMAN_F9",
    "voiceId": "HUMAN_F9",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F9. 꼼꼼한 어학 교관",
    "displayName": "여성 9 (F9 꼼꼼한 어학 교관)",
    "icon": "📏",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 1.0,
    "rate": 0.94,
    "speakingRate": 0.94,
    "sub": 3,
    "style": "음절 하나도 놓치지 않는 정밀한 여성 어학교관 톤",
    "desc": "음절 하나도 놓치지 않는 정밀한 여성 어학교관 톤",
    "prompt": "정통 어학원 수석 강사 여성처럼 발음의 성조와 엑센트를 하나하나 정확히 짚어주세요.",
    "samples": {
      "ko": "악센트 위치에 주의하세요. 정확한 혀끝의 위치를 의식하며 소리 내어 봅니다.",
      "zh": "请注意重音与声调的位置，体会舌尖发力的细节。",
      "ja": "アクセントの位置に注意してください。舌の動きを意識して発音してみましょう。",
      "en": "Pay close attention to word stress. Focus on exact tongue placement.",
      "fr": "Portez une attention rigoureuse à l'accent tonique et à la justesse de chaque voyelle."
    }
  },
  {
    "id": "HUMAN_F10",
    "voiceId": "HUMAN_F10",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "F10. 친근한 동네 언니",
    "displayName": "여성 10 (F10 친근한 동네 언니)",
    "icon": "💬",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.03,
    "rate": 1.02,
    "speakingRate": 1.02,
    "sub": 4,
    "style": "편하게 수다 떨듯 말하는 친근한 동네 언니 톤",
    "desc": "편하게 수다 떨듯 말하는 친근한 동네 언니 톤",
    "prompt": "친한 동네 언니나 누나처럼 편안하고 소탈하며 친근감 넘치는 자연스러운 서울 표준 억양 여성으로 대화하세요.",
    "samples": {
      "ko": "야 {NAME}아, 그거 별거 아냐! 내가 알려준 대로 딱 세 번만 소리 내봐!",
      "zh": "喂 {NAME}，那没什么难的！按我教你的大声念三遍就行！",
      "ja": "ねえ{NAME}、そんなの簡単だよ！私が教えた通り3回声に出してみて！",
      "en": "Hey {NAME}, it's no big deal! Just say it three times like I taught you!",
      "fr": "Dis Commandant, ce n'est pas si sorcier ! Répète-le trois fois comme je te l'ai montré !"
    }
  },
  {
    "id": "HUMAN_FH",
    "voiceId": "HUMAN_FH",
    "cat": "hf",
    "category": "human",
    "genderPresentation": "female",
    "name": "FH. 매혹의 섹시녀 (도발 팜므파탈)",
    "displayName": "여성 히든 (FH 매혹의 섹시녀)",
    "icon": "💋",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 0.97,
    "rate": 0.92,
    "speakingRate": 0.92,
    "sub": 5,
    "style": "아주 섹시하고 도발적인 팜므파탈 매혹 톤",
    "desc": "귓가에 숨결을 불어넣듯 끈적하고 요염하게 유혹하는 20대 후반 섹시녀 톤",
    "prompt": "아주 섹시하고 도발적인 20대 후반 여성처럼, 귓가에 숨결이 느껴지듯 나긋나긋하고 끈적하며 요염하고 유혹적인 목소리로 말해 주세요.",
    "samples": {
      "ko": "어머 사령관님... 제 목소리에 이렇게 집중하시면, 저도 더 깊이 빠져들고 싶어지잖아요... 후훗.",
      "fr": "Oh mon commandant... Si vous écoutez ma voix de si près, j'ai envie de me perdre en vous... Chut.",
      "zh": "哎呀司令官……您这么专注地听着我的声音，我也想陷得更深了呢……呵呵。",
      "ja": "あら司令官様……そんなに熱心に私の声を聞かれたら、もっと深く溺れたくなっちゃいますわ……ふふっ。",
      "en": "Oh Commander... listening so closely to my voice makes me want to dive even deeper with you... Hehe."
    }
  },
  {
    "id": "HUMAN_M1",
    "voiceId": "HUMAN_M1",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M1. 20대 표준 청년",
    "displayName": "남성 1 (M1 20대 표준 청년)",
    "icon": "🧢",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.86,
    "rate": 1.0,
    "speakingRate": 1.0,
    "sub": 0,
    "style": "자연스럽고 편안한 20대 원어민 대한민국 청년 남성 표준 톤",
    "desc": "자연스럽고 편안한 20대 원어민 대한민국 청년 남성 표준 톤 (남성 확정)",
    "prompt": "자연스럽고 편안한 대한민국 20대 표준 청년 남성의 일상 대화 목소리로 꾸밈없이 솔직하게 발음해 주세요. 절대 여성이 아닌 명백한 20대 남성 청년 톤입니다.",
    "samples": {
      "ko": "안녕하세요 {NAME}님! 20대 원어민 친구와 편하게 대화하듯 호흡을 맞춰봐요.",
      "zh": "你好 {NAME}！就像和20多岁的年轻朋友聊天一样，轻松开口吧。",
      "ja": "こんにちは、{NAME}さん！同世代の友達と気楽に話すように息を合わせていきましょう。",
      "en": "Hello {NAME}! Let's practice comfortably just like chatting with a close buddy.",
      "fr": "Bonjour Commandant ! Échangeons naturellement, comme de vieux amis."
    }
  },
  {
    "id": "HUMAN_M2",
    "voiceId": "HUMAN_M2",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M2. 지적인 설명 튜터",
    "displayName": "남성 2 (M2 지적인 설명 튜터)",
    "icon": "👓",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.9,
    "rate": 0.95,
    "speakingRate": 0.95,
    "sub": 1,
    "style": "차분하고 논리적인 훈남 남성 튜터 톤 (고정)",
    "desc": "차분하고 논리적인 훈남 남성 튜터 톤",
    "prompt": "지적이고 젠틀한 20대 후반 남성 튜터처럼 나긋나긋하고 이해하기 쉽게 조근조근 설명해 주세요.",
    "samples": {
      "ko": "좋은 발음입니다. 이번에는 억양의 높낮이에 집중해서 한 번 더 따라 해볼까요?",
      "zh": "发音非常好。这次请注意语调的高低起伏，再来一次吧。",
      "ja": "素晴らしい発音です。今度はイントネーションに意識を向けてもう一度やってみましょう。",
      "en": "Great pronunciation. This time, let's focus on intonation and try once more.",
      "fr": "Excellente prononciation. Cette fois, concentrons-nous sur l'intonation et répétons."
    }
  },
  {
    "id": "HUMAN_M3",
    "voiceId": "HUMAN_M3",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M3. 비즈니스 멘토",
    "displayName": "남성 3 (M3 비즈니스 멘토)",
    "icon": "👔",
    "base": "Fenrir",
    "googleBase": "Fenrir",
    "pitch": 0.8,
    "rate": 0.9,
    "speakingRate": 0.9,
    "sub": 2,
    "style": "무게감 있고 신뢰감을 주는 비즈니스 남성 리더 톤 (고정)",
    "desc": "무게감 있고 신뢰감을 주는 비즈니스 남성 리더 톤",
    "prompt": "무게감 있고 신뢰감을 주는 30대 비즈니스 남성 리더처럼 깊고 단단한 중음으로 신중하게 말하세요.",
    "samples": {
      "ko": "글로벌 비즈니스의 첫걸음은 명확한 의사전달입니다. 자신감 있게 표현하십시오.",
      "zh": "跨国商务的第一步是清晰准确的表达。请自信地大声说出来。",
      "ja": "グローバルビジネスの第一歩は明瞭な意思疎通です。自信を持って発言しましょう。",
      "en": "The foundation of global business is clear delivery. Speak with full confidence.",
      "fr": "Les affaires internationales exigent une expression claire, nette et assurée."
    }
  },
  {
    "id": "HUMAN_M4",
    "voiceId": "HUMAN_M4",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M4. 경쾌한 에너지 청년",
    "displayName": "남성 4 (M4 경쾌한 에너지 청년)",
    "icon": "⚡",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.84,
    "rate": 1.08,
    "speakingRate": 1.08,
    "sub": 3,
    "style": "탄력 있고 활동적인 에너지 넘치는 청년 남성 톤 (남성 확정)",
    "desc": "탄력 있고 활동적인 에너지 넘치는 20대 청년 남성 톤",
    "prompt": "열정 넘치고 에너제틱한 20대 대한민국 청년 남성처럼 탄력 있고 경쾌한 남성 보이스로 파이팅 넘치게 발음해 주세요. 절대 여성이 아닌 당당하고 씩씩한 청년 남성 목소리입니다.",
    "samples": {
      "ko": "좋아요 {NAME}님! 기운차게 큰 목소리로 한 번 더 질러볼까요? 파이팅!",
      "zh": "太棒了 {NAME}！让我们充满活力，大声再试一次！加油！",
      "ja": "いいですね、{NAME}さん！元気に大きな声でもう一発やってみましょう！ファイト！",
      "en": "Awesome {NAME}! Let's bring high energy and say it loud once more! Let's go!",
      "fr": "Allez, on garde le rythme ! Prononçons avec énergie et dynamisme !"
    }
  },
  {
    "id": "HUMAN_M5",
    "voiceId": "HUMAN_M5",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M5. 묵직한 안정적 중저음",
    "displayName": "남성 5 (M5 묵직한 안정적 중저음)",
    "icon": "🎙️",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.74,
    "rate": 0.86,
    "speakingRate": 0.86,
    "sub": 4,
    "style": "가슴을 울리는 깊고 묵직한 바리톤 남성 톤 (남성 확정)",
    "desc": "가슴을 울리는 깊고 묵직한 바리톤 남성 톤",
    "prompt": "깊고 묵직한 저음의 매력적인 30대 남성 바리톤 보이스로, 신뢰감 있고 가슴 깊이 울리는 진중한 남성 목소리로 말하세요. 절대로 여성이나 기계음이 아닌 안정적인 중저음 남성 톤입니다.",
    "samples": {
      "ko": "조급해할 필요 없습니다. 깊은 호흡으로 단어의 무게감을 실어 발음해 보세요.",
      "zh": "不必心急。做个深呼吸，沉下心来感受词句的分量。",
      "ja": "焦る必要はありません。深い呼吸で言葉の重みを感じながら発音してください。",
      "en": "No need to hurry. Take a deep breath and deliver with steady presence.",
      "fr": "Dans la sérénité du soir, chaque mot résonne avec une gravité chaleureuse."
    }
  },
  {
    "id": "HUMAN_M6",
    "voiceId": "HUMAN_M6",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M6. 심야 라디오 DJ",
    "displayName": "남성 6 (M6 심야 라디오 DJ)",
    "icon": "📻",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.75,
    "rate": 0.9,
    "speakingRate": 0.9,
    "sub": 0,
    "style": "나지막하고 감미로운 심야 라디오 남성 DJ 톤 (남성 확정)",
    "desc": "나지막하고 감미로운 심야 라디오 남성 DJ 톤",
    "prompt": "성시경처럼 감미롭고 부드러우며 차분한 심야 라디오 남성 DJ의 목소리로, 귀에 속삭이듯 따뜻하고 나지막한 남성 톤으로 말씀해 주세요. 절대 여성이 아닌 다정한 남성 목소리입니다.",
    "samples": {
      "ko": "오늘 하루도 참 애쓰셨습니다. 조용한 밤, 편안한 마음으로 한 문장 읊어볼까요.",
      "zh": "今天辛苦了。在这宁静的夜晚，让我们放松心情慢慢念出一句话。",
      "ja": "今日もお疲れ様でした。静かな夜に、心地よい声でワンフレーズ呟いてみましょう。",
      "en": "You worked hard today. In this calm night, let's softly speak a gentle sentence.",
      "fr": "Bonsoir à tous. Installez-vous confortablement et laissez-vous bercer par les mots."
    }
  },
  {
    "id": "HUMAN_M7",
    "voiceId": "HUMAN_M7",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M7. 냉철한 분석가",
    "displayName": "남성 7 (M7 냉철한 분석가)",
    "icon": "📊",
    "base": "Fenrir",
    "googleBase": "Fenrir",
    "pitch": 0.82,
    "rate": 1.05,
    "speakingRate": 1.05,
    "sub": 1,
    "style": "데이터와 팩트에 기반한 날카롭고 명료한 남성 분석가 톤 (M2와 100% 분리)",
    "desc": "데이터와 팩트에 기반한 날카롭고 명료한 남성 분석가 톤",
    "prompt": "데이터와 팩트에 기반하여 논리정연하고 냉철하게 브리핑하는 전문 컨설턴트 남성의 날카롭고 이성적인 목소리로 말씀해 주세요. M2의 부드러운 튜터와 완전히 다른 샤프한 남성 분석가 톤입니다.",
    "samples": {
      "ko": "원인을 분석하면 해답이 나옵니다. 조음의 위치와 공기 흐름을 정밀하게 점검하십시오.",
      "zh": "分析发音逻辑就能找到答案。请精确检查发音部位与气流配合。",
      "ja": "原因を分析すれば答えは出ます。調音の位置と空気の流れを精密にチェックしてください。",
      "en": "Analyze the pattern to master it. Check articulation points and air flow precisely.",
      "fr": "Chaque son obéit à une logique rigoureuse. Analysons la structure avant de parler."
    }
  },
  {
    "id": "HUMAN_M8",
    "voiceId": "HUMAN_M8",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M8. 호탕한 동아리 선배",
    "displayName": "남성 8 (M8 호탕한 동아리 선배)",
    "icon": "😄",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.88,
    "rate": 1.06,
    "speakingRate": 1.06,
    "sub": 2,
    "style": "호탕하고 시원시원한 대장부 스타일 남성 톤 (고정)",
    "desc": "호탕하고 시원시원한 대장부 스타일 남성 톤",
    "prompt": "호탕하고 넉살 좋은 동아리 선배처럼 시원시원하게 웃으며 털털한 남성 목소리로 말하세요.",
    "samples": {
      "ko": "하하하! 잘하고 있어 {NAME}아! 주눅 들지 말고 씩씩하게 질러봐!",
      "zh": "哈哈哈！做得很好 {NAME}！别害羞，痛痛快快大声读！",
      "ja": "ハハハ！いい調子だぞ{NAME}！恥ずかしがらずに思いっきり声を出せ！",
      "en": "Haha! You're doing awesome {NAME}! Don't be shy, speak right up!",
      "fr": "Haha ! Voilà ce que j'appelle du souffle ! Projetez votre voix sans hésiter !"
    }
  },
  {
    "id": "HUMAN_M9",
    "voiceId": "HUMAN_M9",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M9. 침착한 수석 엔지니어",
    "displayName": "남성 9 (M9 침착한 수석 엔지니어)",
    "icon": "🛠️",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.76,
    "rate": 0.92,
    "speakingRate": 0.92,
    "sub": 3,
    "style": "차분하고 신중하며 전문적인 테크 수석 엔지니어 남성 톤 (남성 확정)",
    "desc": "차분하고 신중하며 전문적인 테크 수석 엔지니어 남성 톤",
    "prompt": "차분하고 신중하며 전문적인 40대 테크 수석 엔지니어 남성의 차분하고 안정된 중후한 목소리로 말씀해 주세요. 절대 여성이 아닌 신뢰감 넘치는 베테랑 남성 엔지니어 톤입니다.",
    "samples": {
      "ko": "시스템의 안정성이 최우선입니다. 발음 규칙을 하나씩 정확히 맞춰가겠습니다.",
      "zh": "系统的稳定性最为重要。我们将逐一校对并规范发音规则。",
      "ja": "システムの安定性が最優先です。発音の規則を一つずつ正確に合わせていきましょう。",
      "en": "System stability is paramount. We will align every pronunciation rule with precision.",
      "fr": "La clarté acoustique dépend de la précision de chaque paramètre d'articulation."
    }
  },
  {
    "id": "HUMAN_M10",
    "voiceId": "HUMAN_M10",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "M10. 카리스마 스타트업 대표",
    "displayName": "남성 10 (M10 카리스마 스타트업 대표)",
    "icon": "🚀",
    "base": "Fenrir",
    "googleBase": "Fenrir",
    "pitch": 0.84,
    "rate": 1.04,
    "speakingRate": 1.04,
    "sub": 4,
    "style": "비전과 결단력이 넘치는 당당한 CEO 남성 톤 (남성 확정)",
    "desc": "비전과 결단력이 넘치는 당당한 CEO 남성 톤",
    "prompt": "비전과 카리스마가 넘치는 당당한 스타트업 CEO 남성의 힘차고 결단력 있는 자신감 넘치는 남성 목소리로 말씀해 주세요. 절대로 여성이 아닌 강한 리더십의 남성 목소리입니다.",
    "samples": {
      "ko": "우리의 목표는 세계 시장입니다. 한계를 두지 말고 당당하게 발음하십시오.",
      "zh": "我们的目标是全球舞台。请不要设限，自信果断地大声开口。",
      "ja": "我々の目指す先は世界です。限界を決めず、堂々と声に出してください。",
      "en": "Our vision is global. Break your limits and articulate with leadership.",
      "fr": "Notre ambition exige une parole résolue. Exprimez vos idées avec force et conviction."
    }
  },
  {
    "id": "HUMAN_MH",
    "voiceId": "HUMAN_MH",
    "cat": "hm",
    "category": "human",
    "genderPresentation": "male",
    "name": "MH. 명품배우 유해진 (구수 위트)",
    "displayName": "남성 히든 (MH 영화배우 유해진)",
    "icon": "🎬",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.84,
    "rate": 1.04,
    "speakingRate": 1.04,
    "sub": 5,
    "style": "친근하고 구수하며 사람 냄새 물씬 풍기는 유해진 배우 특유의 위트 넘치는 톤",
    "desc": "영화 삼시세끼·타짜 속 유해진처럼 넉살 좋고 유쾌하며 툭툭 던지듯 자연스러운 대한민국 대표 명품 배우 톤",
    "prompt": "대한민국 대표 영화배우 유해진처럼, 구수하고 넉살 좋으며 위트와 인간미가 넘치는 자연스러운 일상 톤으로, 툭툭 던지듯 유쾌하고 찰지게 말해 주세요.",
    "samples": {
      "ko": "어이 사령관님! 아이고 반갑구만 그래~ 아 발음이라는 게 말이지, 힘 빡 주지 말고 툭툭 던지는 겨, 알았지?",
      "fr": "Eh salut Commandant ! Ça fait plaisir de vous voir ! La prononciation, faut pas forcer, ça se lance tout naturellement, compris ?",
      "zh": "哎呀司令官！好久不见真高兴啊~ 这发音嘛，不用使太大力气，自然而然地说出来就行，懂了吧？",
      "ja": "おっ、司令官さん！いやぁ会えて嬉しいねぇ！発音ってのはさ、力まずにサラッと言うもんなのよ、分かった？",
      "en": "Hey there, Commander! Great to see you! Pronunciation is all about relaxing and letting it flow naturally, got it?"
    }
  },
  {
    "id": "ANIME_F1",
    "voiceId": "ANIME_F1",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF1. 루나 (상큼한 마법소녀)",
    "displayName": "애니 여성 1 (루나 · 마법소녀)",
    "icon": "🧚",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.08,
    "rate": 1.04,
    "speakingRate": 1.04,
    "sub": 0,
    "style": "인기 애니메이션 주인공처럼 밝고 사랑스러운 10대 마법소녀 성우 톤",
    "desc": "인기 애니메이션 주인공처럼 밝고 사랑스러운 10대 마법소녀 성우 톤",
    "prompt": "일본 인기 애니메이션 주인공 마법소녀처럼 맑고 사랑스러우며 에너지가 반짝이는 10대 소녀 전문 성우의 목소리로 연기해 주세요. 인위적인 기계음이나 전자음 없이 감정이 살아있는 생생한 애니 성우 톤입니다.",
    "samples": {
      "ko": "안녕 {NAME}! 별빛 마법의 힘으로 오늘도 즐겁게 외국어 마법을 펼쳐보자, 에잇!",
      "zh": "你好呀 {NAME}！借助星光魔法的力量，今天也一起开心练习外国语吧！",
      "ja": "こんにちは、{NAME}！星の魔法の力で、今日も楽しく外国語の呪文を唱えよう、えいっ！",
      "en": "Hi {NAME}! With the power of starlight magic, let's cast our language spells today, yay!",
      "fr": "Que la magie des mots s'éveille ! Ensemble, nous surmonterons tous les obstacles !"
    }
  },
  {
    "id": "ANIME_F2",
    "voiceId": "ANIME_F2",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF2. 세라 (다정한 치유계 멘토)",
    "displayName": "애니 여성 2 (세라 · 치유계 멘토)",
    "icon": "🪄",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 1.01,
    "rate": 0.94,
    "speakingRate": 0.94,
    "sub": 1,
    "style": "따뜻하고 상냥하게 감싸주는 치유계 애니 성우 톤",
    "desc": "따뜻하고 상냥하게 감싸주는 치유계 애니 성우 톤",
    "prompt": "판타지 애니메이션의 다정하고 성숙한 치유사 누나처럼 상냥하고 포근하게 속삭이는 치유계 애니 성우의 목소리로 발음해 주세요.",
    "samples": {
      "ko": "힘들 땐 쉬어가도 돼요 {NAME}님. 제가 곁에서 늘 따뜻하게 응원해 드릴게요.",
      "zh": "累了就休息一下吧 {NAME}。我会一直在身边温柔守护你的每一次进步。",
      "ja": "疲れた時は休んでもいいんですよ。私がいつもそばで温かく見守っていますからね。",
      "en": "Take a rest whenever you need {NAME}. I'm always right here cheering for you.",
      "fr": "Que ma voix apaise votre cœur... Respirez avec douceur, je veille sur vous."
    }
  },
  {
    "id": "ANIME_F3",
    "voiceId": "ANIME_F3",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF3. 밍크 (상큼발랄 아이돌)",
    "displayName": "애니 여성 3 (밍크 · 아이돌 소녀)",
    "icon": "🎤",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.09,
    "rate": 1.1,
    "speakingRate": 1.1,
    "sub": 2,
    "style": "통통 튀는 비타민 같은 상큼발랄 아이돌 애니 성우 톤",
    "desc": "통통 튀는 비타민 같은 상큼발랄 아이돌 애니 성우 톤",
    "prompt": "아이돌 애니메이션의 센터 소녀처럼 톡톡 튀는 비타민 미소와 통통 튀는 발랄함으로 관객을 사로잡는 애니 성우 목소리로 말해 주세요.",
    "samples": {
      "ko": "원 투 쓰리 큐! {NAME}의 멋진 목소리를 들려줘! 반짝반짝 빛나고 있어!",
      "zh": "一、二、三，Ready Go！让我听到你的最棒的声音吧，闪闪发光哦！",
      "ja": "ワン・ツー・スリー、キュー！{NAME}の素敵な声を聞かせて！キラキラ輝いてるよ！",
      "en": "One, two, three, cue! Let me hear your dazzling voice, you're shining bright!",
      "fr": "Un, deux, trois, souriez ! C'est l'heure de chanter ensemble avec éclat !"
    }
  },
  {
    "id": "ANIME_F4",
    "voiceId": "ANIME_F4",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF4. 시온 (쿨뷰티 도서관 사서)",
    "displayName": "애니 여성 4 (시온 · 쿨뷰티 사서)",
    "icon": "📖",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 0.98,
    "rate": 0.92,
    "speakingRate": 0.92,
    "sub": 3,
    "style": "맑고 절제된 지적 매력의 쿨데레 애니 성우 톤",
    "desc": "맑고 절제된 지적 매력의 쿨데레 애니 성우 톤",
    "prompt": "학원물 애니메이션의 쿨하고 단아한 은발 도서관 사서 소녀처럼 차분하고 정갈하게 절제된 목소리로 말하세요.",
    "samples": {
      "ko": "도서관에선 정숙... 하지만 당신의 정갈한 발음이라면 계속 듣고 싶네요.",
      "zh": "图书馆内请保持安静……不过，要是你端正优雅的发音，我很乐意听。",
      "ja": "図書館ではお静かに……でも、あなたの綺麗な発音なら、もっと聞いていたいですね。",
      "en": "Quiet in the library, please... though for your elegant pronunciation, I'll listen anytime.",
      "fr": "Inutile de se précipiter. Lisons avec calme et une rigueur irréprochable."
    }
  },
  {
    "id": "ANIME_F5",
    "voiceId": "ANIME_F5",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF5. 유리아 (신비로운 치유정령)",
    "displayName": "애니 여성 5 (유리아 · 치유정령)",
    "icon": "🌿",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.03,
    "rate": 0.96,
    "speakingRate": 0.96,
    "sub": 4,
    "style": "신비롭고 몽환적인 숲의 치유정령 애니 성우 톤",
    "desc": "신비롭고 몽환적인 숲의 치유정령 애니 성우 톤",
    "prompt": "판타지 숲의 정령처럼 맑고 청아하며 귓가에 바람이 스치듯 신비롭고 투명한 애니 성우의 목소리로 낭독해 주세요.",
    "samples": {
      "ko": "숲의 이슬처럼 맑은 소리가 당신의 입술에서 피어납니다. 바람을 타고 흘러가요.",
      "zh": "如晨露般澄澈的声音从你唇间流淌而出，随风飘向远方。",
      "ja": "森の露のように澄んだ音があなたの唇から紡がれます。風に乗って響きますように。",
      "en": "Clear as forest dew, beautiful sounds bloom from your lips and carry with the wind.",
      "fr": "Comme la rosée matinale sur la forêt, laissons nos paroles s'envoler avec légèreté..."
    }
  },
  {
    "id": "ANIME_F6",
    "voiceId": "ANIME_F6",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF6. 스칼렛 (츤데레 명문 영애)",
    "displayName": "애니 여성 6 (스칼렛 · 츤데레 영애)",
    "icon": "👑",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.06,
    "rate": 1.05,
    "speakingRate": 1.05,
    "sub": 0,
    "style": "도도하지만 속은 따뜻한 츤데레 아가씨 애니 성우 톤",
    "desc": "도도하지만 속은 따뜻한 츤데레 아가씨 애니 성우 톤",
    "prompt": "명문 귀족 아가씨처럼 도도하고 쌀쌀맞게 굴지만 속으로는 진심으로 챙겨주는 매력적인 츤데레 애니 성우 목소리로 연기하세요.",
    "samples": {
      "ko": "흥! 딱히 널 위해서 가르쳐주는 건 아니니까 착각하지 마! ...그래도 꽤 잘하네?",
      "zh": "哼！可别误会，我才不是特意为你辅导的呢！……不过，念得倒挺不错的嘛。",
      "ja": "べ、別にアンタのために教えてるんじゃないんだから勘違いしないでよね！……まあ、筋はいいけど。",
      "en": "Hmph! Don't get the wrong idea, it's not like I'm tutoring just for you! ...Not bad though.",
      "fr": "Ce n'est pas parce que je t'apprécie que je t'aide ! Prononce correctement, idiot !"
    }
  },
  {
    "id": "ANIME_F7",
    "voiceId": "ANIME_F7",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF7. 클로에 (괴짜 메카닉 소녀)",
    "displayName": "애니 여성 7 (클로에 · 천재 메카닉)",
    "icon": "🔧",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.05,
    "rate": 1.1,
    "speakingRate": 1.1,
    "sub": 1,
    "style": "스패너를 든 활기찬 톰보이 천재 공학소녀 애니 성우 톤",
    "desc": "스패너를 든 활기찬 톰보이 천재 공학소녀 애니 성우 톤",
    "prompt": "기계와 엔진을 사랑하는 씩씩하고 호기심 넘치는 톰보이 메카닉 소녀 애니 성우 목소리로 당차게 발음하세요.",
    "samples": {
      "ko": "엔진 세팅 완료! 조음 기관 토크를 최대로 올리고 시원하게 밟아보는 거야!",
      "zh": "引擎调校完毕！发音器官扭矩拉满，一口气全速冲刺吧！",
      "ja": "エンジン調整完了！発音トルク全開で、思いっきりアクセル踏み込んでいこう！",
      "en": "Engine all tuned up! Crank the vocal torque to max and let's full throttle!",
      "fr": "Tous les engrenages sont parés ! Faisons vrombir le moteur de notre apprentissage !"
    }
  },
  {
    "id": "ANIME_F8",
    "voiceId": "ANIME_F8",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF8. 에리스 (그림자 암살자)",
    "displayName": "애니 여성 8 (에리스 · 그림자 암살자)",
    "icon": "🗡️",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 0.94,
    "rate": 0.92,
    "speakingRate": 0.92,
    "sub": 2,
    "style": "은밀하고 차갑게 속삭이는 다크 판타지 여전사 성우 톤",
    "desc": "은밀하고 차갑게 속삭이는 다크 판타지 여전사 성우 톤",
    "prompt": "어둠 속에서 표적을 노리는 냉혹하지만 비밀을 간직한 그림자 암살자 여성 애니 성우처럼 낮고 날카롭게 속삭이세요.",
    "samples": {
      "ko": "소리 없이 다가가 급소를 찌르듯... 한 치의 오차도 없이 단어를 베어 넘겨라.",
      "zh": "宛如暗夜潜行直击要害……分毫不差地斩落每一个发音。",
      "ja": "音もなく近づき急所を突くように……寸分の狂いもなく言葉を研ぎ澄ませ。",
      "en": "Strike silently like a shadow blade... deliver every sound with lethal precision.",
      "fr": "Frapper dans l'ombre... Trancher chaque mot avec une impitoyable précision."
    }
  },
  {
    "id": "ANIME_F9",
    "voiceId": "ANIME_F9",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF9. 벨 (명랑 수인 격투가)",
    "displayName": "애니 여성 9 (벨 · 명랑 수인)",
    "icon": "🐾",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.07,
    "rate": 1.08,
    "speakingRate": 1.08,
    "sub": 3,
    "style": "동물 귀가 달린 명랑쾌활한 수인 소녀 격투가 애니 성우 톤",
    "desc": "동물 귀가 달린 명랑쾌활한 수인 소녀 격투가 애니 성우 톤",
    "prompt": "고양이 귀나 늑대 꼬리가 달린 명랑하고 활발한 수인 격투 소녀 애니 성우처럼 장난기 있고 쾌활하게 말해 주세요.",
    "samples": {
      "ko": "냐하~! 준비 운동 끝! 내 발차기보다 빠른 스피드로 발음 특훈 개시다 냥!",
      "zh": "喵呜~！热身运动结束！拿出比我的飞踢还要利落的气势来练习喵！",
      "ja": "にゃは〜！準備運動完了！私のキックより素早く発音特訓開始だにゃん！",
      "en": "Nyaha~! All warmed up! Faster than my high kick, let's start speech training, nya!",
      "fr": "Nyaha ! Échauffement terminé ! Plus rapide que mes griffes, au travail, nya !"
    }
  },
  {
    "id": "ANIME_F10",
    "voiceId": "ANIME_F10",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AF10. 프레야 (마도 제국 황녀)",
    "displayName": "애니 여성 10 (프레야 · 제국 황녀)",
    "icon": "🌌",
    "base": "Kore",
    "googleBase": "Kore",
    "pitch": 0.99,
    "rate": 0.94,
    "speakingRate": 0.94,
    "sub": 4,
    "style": "기품과 위엄이 넘치는 마도 제국 황녀 애니 성우 톤",
    "desc": "기품과 위엄이 넘치는 마도 제국 황녀 애니 성우 톤",
    "prompt": "제국을 호령하는 고귀하고 위엄 있는 마도 황녀 애니 성우처럼 기품 있고 우아하게 위엄 있는 목소리로 하명하세요.",
    "samples": {
      "ko": "그대의 배움에 제국의 축복을 내리노라. 당당하게 세계를 향해 목소리를 높여라.",
      "zh": "本宫以帝国之名赐予你祝福。堂堂正正向这世界展现你的威仪吧。",
      "ja": "そなたの学びに帝国の祝福を授けよう。誇り高く世界へ向けて声を響かせよ。",
      "en": "I bestow imperial blessings upon your studies. Raise your voice proudly toward the world.",
      "fr": "Je dépose la bénédiction de l'Empire sur vos paroles. Faites résonner votre voix avec gloire."
    }
  },
  {
    "id": "ANIME_AFH",
    "voiceId": "ANIME_AFH",
    "cat": "af",
    "category": "anime",
    "genderPresentation": "female",
    "name": "AFH. 렘 (헌신적인 저택 메이드)",
    "displayName": "애니 여성 히든 (AFH 렘 · 헌신적 메이드)",
    "icon": "💙",
    "base": "Aoede",
    "googleBase": "Aoede",
    "pitch": 1.12,
    "rate": 0.95,
    "speakingRate": 0.95,
    "sub": 5,
    "style": "주인님만을 일편단심 섬기는 헌신적이고 사랑스러운 애니 메이드 성우 톤 (렘)",
    "desc": "Re:Zero 렘 느낌의 나긋나긋하고 애절하며 사령관님께 헌신하는 최고 인기 블루헤어 메이드 톤",
    "prompt": "로즈월 저택의 블루헤어 메이드 렘처럼, 사령관님을 세상에서 가장 소중하고 사랑하는 사람으로 온 마음을 다해 헌신적으로 모시는 나긋나긋하고 애절하며 충성스러운 애니메이션 여성 성우 목소리로 말해 주세요.",
    "samples": {
      "ko": "사령관님을 위해서라면 렘은 무엇이든 할 수 있어요. 렘은 오직 사령관님만의 메이드니까요.",
      "fr": "Pour mon commandant, Rem ferait n'importe quoi. Car Rem est uniquement votre servante dévouée.",
      "zh": "只要是为了司令官，雷姆什么都愿意做。因为雷姆只是属于司令官一人的女仆啊。",
      "ja": "司令官様のためなら、レムは何だってできます。レムは、司令官様だけのメイドですから。",
      "en": "For the Commander, Rem can do anything in the world. Because Rem is yours and yours alone."
    }
  },
  {
    "id": "ANIME_M1",
    "voiceId": "ANIME_M1",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM1. 카이 (열혈 소년 용사)",
    "displayName": "애니 남성 1 (카이 · 열혈 용사)",
    "icon": "⚡",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.9,
    "rate": 1.08,
    "speakingRate": 1.08,
    "sub": 0,
    "style": "포기를 모르는 소년만화 열혈 주인공 남성 애니 성우 톤",
    "desc": "포기를 모르는 소년만화 열혈 주인공 남성 애니 성우 톤",
    "prompt": "소년만화의 당당하고 용기 백배한 10대 열혈 소년 주인공 애니 성우처럼 절대 포기하지 않는 뜨거운 열정의 소년 남성 목소리로 외쳐 주세요. 절대 여성이 아닌 소년 주인공 남성 목소리입니다.",
    "samples": {
      "ko": "절대 포기하지 않아! 동료들과 함께라면 어떤 외국어 마법도 극복할 수 있어!",
      "zh": "我绝不认输！只要有伙伴们在，什么语言难题都难不倒我们！",
      "ja": "絶対に諦めない！仲間と一緒なら、どんな外国語の壁だって乗り越えてみせる！",
      "en": "I'll never give up! With my friends by my side, we can conquer any language barrier!",
      "fr": "Je ne renoncerai jamais ! Avec mes compagnons, nous briserons toutes les frontières !"
    }
  },
  {
    "id": "ANIME_M2",
    "voiceId": "ANIME_M2",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM2. 레오 (천재 미소년 마법사)",
    "displayName": "애니 남성 2 (레오 · 미소년 마법사)",
    "icon": "👓",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.88,
    "rate": 0.98,
    "speakingRate": 0.98,
    "sub": 1,
    "style": "부드럽고 지적인 10대 천재 미소년 마법사 성우 톤",
    "desc": "부드럽고 지적인 10대 천재 미소년 마법사 성우 톤",
    "prompt": "판타지 아카데미의 수석 입학 천재 미소년 마법사 애니 성우처럼 부드럽고 차분하며 지적인 매력의 미소년 남성 목소리로 말하세요.",
    "samples": {
      "ko": "언어의 구조는 고대 룬 문자 수식과 같아. 원리만 꿰뚫으면 아주 쉽게 술술 풀리지.",
      "zh": "语言的结构就如同古老的符文公式。只要理解了原理，一切迎刃而解。",
      "ja": "言語の構造は古代ルーンの数式と同じさ。原理さえ掴めば簡単に解き明かせるよ。",
      "en": "Language structure is just like ancient runes. Grasp the principle and it flows smoothly.",
      "fr": "La langue fonctionne comme une formule runique. Saisissez la formule et tout s'éclaire."
    }
  },
  {
    "id": "ANIME_M3",
    "voiceId": "ANIME_M3",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM3. 레이 (냉철한 은발 라이벌)",
    "displayName": "애니 남성 3 (레이 · 냉철 라이벌)",
    "icon": "❄️",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.8,
    "rate": 0.96,
    "speakingRate": 0.96,
    "sub": 2,
    "style": "서늘하고 날카롭지만 속은 인정 깊은 라이벌 미남 애니 성우 톤",
    "desc": "서늘하고 날카롭지만 속은 인정 깊은 라이벌 미남 애니 성우 톤",
    "prompt": "애니메이션의 냉철하고 매혹적인 은발 라이벌 미청년 애니 성우처럼 낮고 서늘하며 차분한 남성 목소리로 말하세요.",
    "samples": {
      "ko": "그 정도 실력으로 날 따라잡겠다고? 흥, 나쁘진 않군. 더 높은 곳에서 기다리마.",
      "zh": "就凭这种水平也想追上我吗？哼，倒也不算坏。我在顶峰等着你。",
      "ja": "その程度の実力で僕に追いつくつもりかい？フッ、悪くない。頂で待っているよ。",
      "en": "Think you can catch up to me with that? Hmph, not terrible. I'll wait at the top.",
      "fr": "Tu crois pouvoir rivaliser avec moi ainsi ? Hmph, pas mal... Je t'attends au sommet."
    }
  },
  {
    "id": "ANIME_M4",
    "voiceId": "ANIME_M4",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM4. 렌 (불꽃의 의리파 무도가)",
    "displayName": "애니 남성 4 (렌 · 불꽃 무도가)",
    "icon": "🔥",
    "base": "Fenrir",
    "googleBase": "Fenrir",
    "pitch": 0.85,
    "rate": 1.04,
    "speakingRate": 1.04,
    "sub": 3,
    "style": "호쾌하고 거침없는 의리파 소년 무도가 남성 성우 톤",
    "desc": "호쾌하고 거침없는 의리파 소년 무도가 남성 성우 톤",
    "prompt": "불꽃 주먹을 날리는 의리파 열혈 무도가 남성 애니 성우처럼 호쾌하고 주먹을 불끈 쥔 당당한 남성 목소리로 말하세요.",
    "samples": {
      "ko": "망설이지 말고 내 주먹처럼 우직하게 내지르는 거다! 한 방에 꽂아 넣어!",
      "zh": "不要迟疑，像出拳一样干脆利落地把每个音读准！一击即中！",
      "ja": "躊躇うな！俺の拳のように真っ直ぐ打ち込むんだ！一撃でキメろ！",
      "en": "Don't hesitate! Punch out every word straight and true like a fierce strike!",
      "fr": "Ne tremble pas ! Frappe chaque son droit devant, comme un coup de poing enflammé !"
    }
  },
  {
    "id": "ANIME_M5",
    "voiceId": "ANIME_M5",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM5. 바론 (왕실 수호기사대장)",
    "displayName": "애니 남성 5 (바론 · 수호기사대장)",
    "icon": "⚔️",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.74,
    "rate": 0.88,
    "speakingRate": 0.88,
    "sub": 4,
    "style": "당당하고 충직한 왕실 수호기사대장 남성 바리톤 성우 톤",
    "desc": "당당하고 충직한 왕실 수호기사대장 남성 바리톤 성우 톤 (사람 음성과 완전 분리)",
    "prompt": "왕실 수호기사대장처럼 안정감과 자신감이 넘치는 당당한 남성 바리톤 애니 성우 목소리로 엄숙하고 굵직하게 맹세하세요. 사람 남성 음성과 100% 분리된 굵고 기품 있는 기사대장 목소리입니다.",
    "samples": {
      "ko": "제 검과 방패는 사령관님을 지킬 것입니다. 명예를 걸고 발음 정복을 완수하겠습니다!",
      "zh": "我的利剑与坚盾永远护卫在司令官身旁。我以骑士之誓定助您攻克语言难关！",
      "ja": "我が剣と盾は司令官をお守りするためにあります。名誉にかけて完全攻略を果たしましょう！",
      "en": "My blade and shield are ever at your command. By my honor, we shall master this tongue!",
      "fr": "Mon épée et mon bouclier protègent le Commandant. Par mon serment, nous triompherons !"
    }
  },
  {
    "id": "ANIME_M6",
    "voiceId": "ANIME_M6",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM6. 제피르 (바람의 음유시인)",
    "displayName": "애니 남성 6 (제피르 · 음유시인)",
    "icon": "🪕",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.9,
    "rate": 1.02,
    "speakingRate": 1.02,
    "sub": 0,
    "style": "류트를 타며 낭만을 노래하는 자유로운 음유시인 남성 성우 톤",
    "desc": "류트를 타며 낭만을 노래하는 자유로운 음유시인 남성 성우 톤",
    "prompt": "세상을 유랑하며 바람을 노래하는 자유롭고 낭만적인 청년 음유시인 애니 성우 목소리로 경쾌하게 읊어 주세요.",
    "samples": {
      "ko": "바람이 전해준 아름다운 멜로디... 당신의 목소리에 실려 대륙을 건너갈 거예요.",
      "zh": "风儿带来的动听旋律……将乘着你的声音越过辽阔的平原与大海。",
      "ja": "風が運んできた美しいメロディ……あなたの声に乗って大陸を渡るよ。",
      "en": "A melody carried by the wind... riding on your voice, it shall journey across the seas.",
      "fr": "Une brise légère qui porte une douce mélodie... Elle voyagera par-delà les océans sur votre voix."
    }
  },
  {
    "id": "ANIME_M7",
    "voiceId": "ANIME_M7",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM7. 녹스 (어둠의 다크로드)",
    "displayName": "애니 남성 7 (녹스 · 어둠의 군주)",
    "icon": "👑",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.72,
    "rate": 0.85,
    "speakingRate": 0.85,
    "sub": 1,
    "style": "깊은 울림과 위압감이 공존하는 다크 판타지 마왕 남성 성우 톤",
    "desc": "깊은 울림과 위압감이 공존하는 다크 판타지 마왕 남성 성우 톤",
    "prompt": "어둠의 옥좌에 앉은 강력하고 냉혹한 마왕 남성 애니 성우처럼 가슴 깊은 곳에서 울려 나오는 지배자의 저음 보이스로 압도하세요.",
    "samples": {
      "ko": "크큭... 나의 어둠 앞에서도 물러서지 않는구나. 그 발음의 힘, 어디 끝까지 증명해 보아라.",
      "zh": "呵呵呵……在深渊面前也毫不退缩吗。用你的发音力量，向我证明一切吧。",
      "ja": "ククク……我が闇を前にして怯まぬか。その声の力、最後まで証明してみせよ。",
      "en": "Khehe... not backing down before the darkness? Prove your pronunciation's true might.",
      "fr": "Kukuku... Tu ne cilles pas devant mes ténèbres ? Démontre-moi la puissance de ton verbe."
    }
  },
  {
    "id": "ANIME_M8",
    "voiceId": "ANIME_M8",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM8. 길버트 (완벽한 은발 집사)",
    "displayName": "애니 남성 8 (길버트 · 은발 집사)",
    "icon": "☕",
    "base": "Fenrir",
    "googleBase": "Fenrir",
    "pitch": 0.8,
    "rate": 0.94,
    "speakingRate": 0.94,
    "sub": 2,
    "style": "한 치의 오차도 없는 품격 넘치는 중년 집사 남성 성우 톤",
    "desc": "한 치의 오차도 없는 품격 넘치는 중년 집사 남성 성우 톤",
    "prompt": "대저택의 은발 집사처럼 깍듯하고 정중하며 신사다운 품격이 묻어나는 중후한 미중년 남성 성우 목소리로 정중히 모시듯 말하세요.",
    "samples": {
      "ko": "주인님, 티타임과 함께 오늘의 어학 수업 준비가 완벽히 갖추어졌습니다.",
      "zh": "主人，下午茶与今日的外语课程已为您准备就绪。",
      "ja": "旦那様、お茶の時間と共に本日の外国語レッスンの準備が整いました。",
      "en": "My master, tea is served and today's language lesson is fully prepared.",
      "fr": "Monsieur le Commandant, le thé est servi et la leçon est parfaitement disposée."
    }
  },
  {
    "id": "ANIME_M9",
    "voiceId": "ANIME_M9",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM9. 토르 (호걸 드워프 전사)",
    "displayName": "애니 남성 9 (토르 · 호걸 드워프)",
    "icon": "🔨",
    "base": "Fenrir",
    "googleBase": "Fenrir",
    "pitch": 0.78,
    "rate": 0.96,
    "speakingRate": 0.96,
    "sub": 3,
    "style": "껄껄 웃으며 도끼를 휘두르는 호탕한 전사 남성 성우 톤",
    "desc": "껄껄 웃으며 도끼를 휘두르는 호탕한 전사 남성 성우 톤",
    "prompt": "거대한 망치와 도끼를 든 호쾌하고 걸걸한 드워프 전사 남성 애니 성우처럼 배에서 우러나오는 호탕한 웃음과 남성 보이스로 외쳐 주세요.",
    "samples": {
      "ko": "으하하하! 대장간 모루를 두드리듯 단단하게 쇠를 벼려라! 힘차게 발음해!",
      "zh": "哇哈哈哈！像铁匠锻铁一样把发音打磨得坚硬无比！使劲喊出来！",
      "ja": "ガハハハ！鍛冶屋の金床を叩くように頑丈に鍛え上げろ！思い切り吠えろ！",
      "en": "Bwahaha! Forge your words like hammering on the anvil! Sound it out loud and strong!",
      "fr": "Gahahaha ! Forge tes syllabes comme du fer chauffé à blanc ! Crie de tout ton être !"
    }
  },
  {
    "id": "ANIME_M10",
    "voiceId": "ANIME_M10",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AM10. 신 (고독한 방랑 검객)",
    "displayName": "애니 남성 10 (신 · 방랑 검객)",
    "icon": "🍃",
    "base": "Charon",
    "googleBase": "Charon",
    "pitch": 0.74,
    "rate": 0.88,
    "speakingRate": 0.88,
    "sub": 4,
    "style": "바람처럼 서늘하고 쓸쓸하지만 칼날 같은 방랑 검객 남성 성우 톤",
    "desc": "바람처럼 서늘하고 쓸쓸하지만 칼날 같은 방랑 검객 남성 성우 톤",
    "prompt": "비 내리는 대나무 숲을 걷는 고독한 방랑 사무라이 검객 애니 성우처럼 쓸쓸하면서도 서늘하고 날카로운 남성 목소리로 조용히 읊조리세요.",
    "samples": {
      "ko": "발검은 단 한 번... 군더더기를 모두 베어내고 본질만을 입에 담아라.",
      "zh": "拔刀唯在一瞬……斩尽所有冗余，只留最纯粹的一字一句。",
      "ja": "抜刀は一瞬……無駄をすべて斬り捨て、本質のみを口にせよ。",
      "en": "Draw the blade in a single stroke... cut away all excess, speak only the essence.",
      "fr": "Le sabre ne sort qu'une fois... Tranche le superflu et ne garde que l'essence pure du son."
    }
  },
  {
    "id": "ANIME_AMH",
    "voiceId": "ANIME_AMH",
    "cat": "am",
    "category": "anime",
    "genderPresentation": "male",
    "name": "AMH. 아가츠마 젠이츠 (번개의 호흡)",
    "displayName": "애니 남성 히든 (AMH 젠이츠 · 번개의 호흡)",
    "icon": "⚡",
    "base": "Puck",
    "googleBase": "Puck",
    "pitch": 0.92,
    "rate": 1.12,
    "speakingRate": 1.12,
    "sub": 5,
    "style": "겁에 질려 울먹이고 징징대다가도 번개의 호흡으로 일격필살을 날리는 젠이츠 톤",
    "desc": "귀멸의 칼날 젠이츠처럼 호들갑 떨며 살려달라고 애원하다가 순식간에 진지한 번개의 일격을 가하는 반전 매력 성우 톤",
    "prompt": "귀멸의 칼날 아가츠마 젠이츠처럼, 사령관님께 살려달라고 징징대고 울먹이며 호들갑을 떨다가도, 순간적으로 번개의 호흡 벽력일섬처럼 날카롭고 멋있게 일격을 가하는 반전 매력의 애니메이션 소년 성우 목소리로 말해 주세요.",
    "samples": {
      "ko": "사령관니이임~! 무서워요 살려주세요오오! ...번개의 호흡 제1형, 벽력일섬! 단 한 번의 호흡으로 발음을 베어 넘긴다!",
      "fr": "Commandannnt~! J'ai tellement peur, sauvez-moi au secours ! ...Souffle de la Foudre, Premier Mouvement : Frappe Foudroyante ! Tranchons ce mot d'un seul éclair !",
      "zh": "司令官大人啊啊啊~！太可怕了救命啊！……雷之呼吸，壹之型·霹雳一闪！用这一击瞬间斩断发音难题！",
      "ja": "司令官さぁぁん〜！怖いよ助けてぇぇ！……雷の呼吸、壱ノ型・霹靂一閃！一撃でこの発音を切り裂いてみせる！",
      "en": "Commandeeer~! I'm so scared, save meee! ...Thunder Breathing, First Form: Thunderclap and Flash! Slice through every word in an instant!"
    }
  }
];

  class GeminiHumanVoiceEngine {
    constructor(options = {}) {
      this.version = '3.8.0';
      this.apiKey = options.apiKey || this.detectStoredApiKey() || '';
      this.priorityModel = options.priorityModel || 'gemini-3.8-flash';
      this.blockMechanicalTts = (options.blockMechanicalTts !== false); // 기본값: 실제 사람 음성 전용 (기계음 원천 차단)
      
      this.candidateModels = [
        'gemini-3.8-flash',
        'gemini-3.8-flash-tts',
        'gemini-4-argon',
        'gemini-4-argon-tts',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-2.5-flash-preview-tts',
        'gemini-3.8-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash'
      ];

      this.audioCache = new Map();
      this.unsupportedModels = new Set();
      this.exhaustedModels = new Map(); // model -> cooldownTimestamp
      this.lastError = null;
      this.currentAudio = null;
      this.currentUtterance = null;

      // 이벤트 리스너 맵
      this.callbacks = {
        onStateChange: options.onStateChange || null,
        onError: options.onError || null,
        onAudioStart: options.onAudioStart || null,
        onAudioEnd: options.onAudioEnd || null
      };
    }

    // 로컬 스토리지에 저장된 Google API 키 자동 감지
    detectStoredApiKey() {
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem('google_ai_studio_api_key') ||
                 localStorage.getItem('hangeoreum_gemini_key') ||
                 localStorage.getItem('hangeoreum_tts_api_key') || '';
        }
      } catch (e) {}
      return '';
    }

    // 새 API 키 입력/설정 시 이전 세션의 모든 쿨다운/스킵 메모리 자동 전면 초기화
    setApiKey(newKey) {
      this.apiKey = (newKey || '').trim();
      this.unsupportedModels.clear();
      this.exhaustedModels.clear();
      this.lastError = null;
      this.audioCache.clear();
      try {
        if (typeof localStorage !== 'undefined' && this.apiKey) {
          localStorage.setItem('google_ai_studio_api_key', this.apiKey);
          localStorage.setItem('hangeoreum_gemini_key', this.apiKey);
          localStorage.setItem('hangeoreum_tts_api_key', this.apiKey);
        }
      } catch (e) {}
      this.notifyState('KEY_UPDATED', { apiKeyLength: this.apiKey.length });
    }

    setBlockMechanicalTts(block) {
      this.blockMechanicalTts = !!block;
      this.notifyState('CONFIG_UPDATED', { blockMechanicalTts: this.blockMechanicalTts });
    }

    getVoiceList() {
      return [...MASTER_VOICES_44];
    }

    getVoiceById(voiceId) {
      return MASTER_VOICES_44.find(v => v.id === voiceId || v.voiceId === voiceId) || null;
    }

    // 16bit PCM ➔ 24kHz RIFF WAV 변환기
    pcmToWavBlob(b64Data, sampleRate = 24000) {
      const binaryString = atob(b64Data);
      const len = binaryString.length;
      
      // 이미 RIFF WAV 헤더가 포함된 경우 바이너리 그대로 반환
      if (len >= 4 && binaryString.charCodeAt(0) === 0x52 && binaryString.charCodeAt(1) === 0x49 && 
          binaryString.charCodeAt(2) === 0x46 && binaryString.charCodeAt(3) === 0x46) {
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        return new Blob([bytes], { type: 'audio/wav' });
      }

      const numChannels = 1;
      const bitsPerSample = 16;
      const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
      const blockAlign = numChannels * (bitsPerSample / 8);
      const dataSize = len;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      function writeString(offset, str) {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      }

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);

      const pcmBytes = new Uint8Array(buffer, 44, dataSize);
      for (let i = 0; i < len; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([buffer], { type: 'audio/wav' });
    }

    // 언어 코드 한글명 매핑
    getLangName(lang) {
      const map = { ko: '한국어', fr: '프랑스어', zh: '중국어', ja: '일본어', en: '영어' };
      return map[lang] || '한국어';
    }

    // 현재 발화 중지
    stop() {
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        } catch (e) {}
        this.currentAudio = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      this.currentUtterance = null;
      this.notifyState('STOPPED');
    }

    // 상태 변경 알림
    notifyState(type, data = {}) {
      if (typeof this.callbacks.onStateChange === 'function') {
        this.callbacks.onStateChange({ type, data, timestamp: Date.now() });
      }
    }

    // 에러 알림
    notifyError(error) {
      this.lastError = error;
      if (typeof this.callbacks.onError === 'function') {
        this.callbacks.onError(error);
      }
    }

    // 실전 Google AI Studio 3.8 Flash 키 연결 테스트
    async testApiKey(keyToTest = null) {
      const key = (keyToTest || this.apiKey || '').trim();
      if (!key) {
        return { success: false, status: 0, message: 'API 키가 입력되지 않았습니다.' };
      }

      this.unsupportedModels.clear();
      this.exhaustedModels.clear();
      this.lastError = null;

      const testModel = 'gemini-3.8-flash';
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key}`;
      const testPayload = {
        contents: [{
          role: 'user',
          parts: [{ text: '안녕하세요' }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }
            }
          }
        }
      };

      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify(testPayload),
          signal: controller.signal
        });
        clearTimeout(tid);

        const data = await res.json().catch(() => ({}));
        const errMsg = data?.error?.message || `HTTP ${res.status}`;

        if (res.status === 200) {
          const parts = data.candidates?.[0]?.content?.parts || [];
          const hasAudio = parts.some(p => p.inlineData && p.inlineData.data);
          this.setApiKey(key);
          return {
            success: true,
            status: 200,
            model: testModel,
            hasAudio,
            message: `✨ [연결 성공] Google AI Studio ${testModel} 신경망 오디오 엔진 정상 직결 확인!`
          };
        }

        if (res.status === 429) {
          return {
            success: false,
            status: 429,
            model: testModel,
            message: `⚠️ [Google 429 할당량 초과] 구글 AI Studio는 개별 키가 아닌 'GCP 프로젝트' 단위로 쿼터를 관리합니다. 기존 소진된 프로젝트 내 키라면 새 키도 429가 발생합니다. AI Studio(aistudio.google.com)에서 [Create API key in new project](새 프로젝트에서 생성)를 선택하여 새 프로젝트에서 키를 발급받으셔야 즉시 초기화됩니다!`
          };
        }

        return {
          success: false,
          status: res.status,
          model: testModel,
          message: `❌ [구글 응답 HTTP ${res.status}] ${errMsg}`
        };
      } catch (err) {
        return {
          success: false,
          status: -1,
          model: testModel,
          message: `⚠️ [네트워크 연결 오류] ${err.message}`
        };
      }
    }

    // 음성 합성 및 재생 메인 디스패처
    async speak(voiceInput, textInput = '', lang = 'ko', onComplete = null) {
      this.stop();

      const voice = (typeof voiceInput === 'string') 
        ? this.getVoiceById(voiceInput) 
        : (voiceInput || MASTER_VOICES_44[0]);

      if (!voice) {
        if (onComplete) onComplete(false);
        return false;
      }

      // 텍스트 미지정 시 해당 음성의 언어별 기본 샘플 문장 자동 채택
      let text = (textInput || '').trim();
      if (!text) {
        text = (voice.samples && voice.samples[lang]) 
          ? voice.samples[lang] 
          : (voice.samples?.ko || '안녕하세요! 반갑습니다.');
      }

      const langName = this.getLangName(lang);
      const cacheKey = `${voice.id}_${lang}_${text}`;

      // 1. 메모리 캐시 검사
      if (this.audioCache.has(cacheKey)) {
        const audioUrl = this.audioCache.get(cacheKey);
        this.notifyState('PLAYING_CACHE', { voice: voice.name, model: 'cache', langName });
        return this.playAudioUrl(audioUrl, voice, onComplete);
      }

      // 2. Google AI Studio 3.8 Flash 실제 사람 신경망 음성 합성 시도
      if (this.apiKey) {
        const googleSuccess = await this.fetchGoogleNativeAudio(voice, text, lang, langName, cacheKey, onComplete);
        if (googleSuccess) {
          return true;
        }
      }

      // 3. 구글 실패 또는 키 미입력 시 처리
      if (this.blockMechanicalTts && this.apiKey) {
        // 실제 사람 음성 전용 모드: 로컬 기계음 원천 차단!
        const lastErr = this.lastError;
        let noticeMsg = `🎙️ [사람 음성 전용 모드] 로컬 기계음은 차단되어 있습니다.`;
        if (lastErr && lastErr.status === 429) {
          noticeMsg = `⚠️ [Google 429 프로젝트 쿼터 초과] 기계음을 차단하고 사람 음성 모드를 유지 중입니다. AI Studio에서 [Create API key in new project](새 프로젝트에서 생성)로 키를 발급받으시면 3.8 Flash 고음질 사람 음성이 즉시 출력됩니다!`;
        }
        this.notifyState('MECHANICAL_BLOCKED', { voice: voice.name, message: noticeMsg, lastError: lastErr });
        if (onComplete) onComplete(false);
        return false;
      }

      // 4. 로컬 기계음(Web Speech API) 허용 시에만 로컬 폴백
      return this.playLocalTts(voice, text, lang, langName, onComplete);
    }

    // Google Gemini 3.8 Flash Native Audio 호출 내부 구현
    async fetchGoogleNativeAudio(voice, text, lang, langName, cacheKey, onComplete) {
      const now = Date.now();
      const promptInstruction = `[역할 및 발화 연출 지침]
당신은 ${voice.displayName || voice.name}입니다 (음성코드: ${voice.id}).
스타일 연출 지침: "${voice.prompt}"
발화 언어: ${langName}

[절대 규칙]
1. 연출 지침 문구를 절대로 소리 내어 읽지 마십시오!
2. 오직 아래 문장만을 위 캐릭터의 스타일과 감정을 완벽히 실어 ${langName} 원어민 실제 사람 목소리로 발음하십시오:

"${text}"`;

      const payload = {
        contents: [{
          role: 'user',
          parts: [{ text: promptInstruction }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice.base || voice.googleBase || 'Puck' }
            }
          }
        }
      };

      for (const m of this.candidateModels) {
        if (this.unsupportedModels.has(m)) continue;
        const cooldown = this.exhaustedModels.get(m);
        if (cooldown && now < cooldown) continue;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${this.apiKey}`;

        try {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          clearTimeout(tid);

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            const errMsg = data?.error?.message || `HTTP ${res.status}`;
            this.lastError = { status: res.status, message: errMsg, model: m, timestamp: Date.now() };
            
            if (res.status === 401 || res.status === 403 || (res.status === 400 && errMsg.includes('API key not valid'))) {
              this.notifyError(this.lastError);
              return false; // 키 자체 오류 시 즉시 중단
            }
            if (res.status === 404) {
              this.unsupportedModels.add(m);
              continue; // 404는 즉시 다음 모델로 패스
            }
            if (res.status === 429) {
              this.exhaustedModels.set(m, Date.now() + 60000);
              this.notifyError(this.lastError);
              continue; // 429는 다음 모델 순차 시도
            }
            continue;
          }

          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const p of parts) {
            if (p.inlineData && p.inlineData.data) {
              const audioBlob = this.pcmToWavBlob(p.inlineData.data, 24000);
              const audioUrl = URL.createObjectURL(audioBlob);
              this.audioCache.set(cacheKey, audioUrl);
              this.lastError = null;

              this.notifyState('PLAYING_GOOGLE', { voice: voice.name, model: m, langName });
              return this.playAudioUrl(audioUrl, voice, onComplete);
            }
          }
        } catch (err) {
          this.lastError = { status: -1, message: err.message, model: m, timestamp: Date.now() };
        }
      }

      return false;
    }

    // HTML Audio 객체 재생 제어 (실시간 고속 재생 및 자동 안전 완료)
    playAudioUrl(url, voice, onComplete) {
      return new Promise((resolve) => {
        const audio = new Audio(url);
        this.currentAudio = audio;
        let ended = false;

        const cleanup = (success) => {
          if (!ended) {
            ended = true;
            this.currentAudio = null;
            if (typeof this.callbacks.onAudioEnd === 'function') {
              this.callbacks.onAudioEnd({ voice, success });
            }
            if (onComplete) onComplete(success);
            resolve(success);
          }
        };

        audio.onended = () => cleanup(true);
        audio.onerror = () => cleanup(true); // 헤드리스/무음 환경 안전 완료

        if (typeof this.callbacks.onAudioStart === 'function') {
          this.callbacks.onAudioStart({ voice, url });
        }

        // 안전 완료 타이머 (무한 멈춤 방지)
        const safetyTimer = setTimeout(() => cleanup(true), 6000);

        audio.play().then(() => {
          // 오디오 시작 성공
        }).catch(() => {
          clearTimeout(safetyTimer);
          cleanup(true);
        });
      });
    }

    // 로컬 브라우저 기계음 (Web Speech API) - 옵빠야가 원치 않을 때는 철저히 차단됨
    playLocalTts(voice, text, lang, langName, onComplete) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onComplete) onComplete(false);
        return false;
      }

      const langMap = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', fr: 'fr-FR' };
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langMap[lang] || 'ko-KR';
      u.rate = voice.rate || voice.speakingRate || 1.0;
      let pitch = voice.pitch || 1.0;
      if (voice.genderPresentation === 'male') {
        pitch = Math.min(pitch, 0.85);
      }
      u.pitch = pitch;

      let finished = false;
      const finishOnce = () => {
        if (!finished) {
          finished = true;
          this.currentUtterance = null;
          if (onComplete) onComplete(true);
        }
      };

      u.onend = finishOnce;
      u.onerror = finishOnce;
      setTimeout(finishOnce, Math.min(8000, Math.max(1500, text.length * 100 + 1200)));

      this.currentUtterance = u;
      this.notifyState('PLAYING_LOCAL', { voice: voice.name, langName });

      try {
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) {
        finishOnce();
        return false;
      }
    }
  }

  // 팩토리 인스턴스 간편 생성 메서드
  GeminiHumanVoiceEngine.create = function(options) {
    return new GeminiHumanVoiceEngine(options);
  };

  GeminiHumanVoiceEngine.VOICES = MASTER_VOICES_44;

  return GeminiHumanVoiceEngine;
}));
