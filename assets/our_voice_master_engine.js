/**
 * OurVoiceMasterEngine (v3.0.0 - 주헌법 제20조 5항 규격 완결판)
 * 워크스페이스 표준 통합 음성 합성(TTS) & 2D 캐릭터 캔버스 립싱크 엔진
 * 
 * [주헌법 제20조 5항 필수 규격 완성]
 * 1. 2대 공식 음성 모드 상호 전환:
 *    - 일반 사람 음성 모드 (Human Voice Mode)
 *    - 애니메이션 캐릭터 모드 (Anime Character Mode)
 * 2. 6대 공식 애니메이션 음성 프리셋:
 *    - ANIME_F_CUTE (루나 / 요정, pitch 1.35, rate 1.08)
 *    - ANIME_F_SOFT (세라 / 멘토, pitch 1.15, rate 0.95)
 *    - ANIME_F_BRIGHT (밍크 / 아이돌, pitch 1.45, rate 1.12)
 *    - ANIME_M_YOUTH (카이 / 소년, pitch 1.10, rate 1.10)
 *    - ANIME_M_CALM (레오 / 연구원, pitch 0.90, rate 0.95)
 *    - ANIME_M_DEEP (바론 / 대장, pitch 0.75, rate 0.90)
 * 3. 2D 캐릭터 캔버스 8대 상태 머신:
 *    - IDLE, LISTENING, THINKING, SPEAKING, HAPPY, CALM, INTERRUPTED, ERROR
 * 4. 자연스러운 눈 깜빡임 타이머 (2.5초~4.5초 주기)
 * 5. 오디오 PCM 실시간 RMS 볼륨 4단계 립싱크 (Lip Sync, 60FPS):
 *    - Level 0 (CLOSED): RMS < 250 (무음/끼어들기 즉시 닫힘)
 *    - Level 1 (SMALL): 250 <= RMS < 800
 *    - Level 2 (MEDIUM): 800 <= RMS < 1600
 *    - Level 3 (WIDE): RMS >= 1600
 * 6. 5대 전 엔진, 5계층 무중단 서킷 브레이커, 완전 오프라인 자립, 2계층 스마트 캐시 완벽 결합
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OurVoiceMasterEngine = factory();
    root.OurTTS = root.OurVoiceMasterEngine;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. 공식 카탈로그 데이터베이스 & 6대 애니메이션 프리셋
  // =========================================================================

  const ANIME_PRESETS = [
    { id: 'ANIME_F_CUTE', name: '요정 루나', gender: 'female', pitch: 1.35, rate: 1.08, desc: '귀엽고 발랄한 요정 루나 (깜찍하고 친근한 어조)', defaultVoice: 'ko-KR-SunHiNeural' },
    { id: 'ANIME_F_SOFT', name: '멘토 세라', gender: 'female', pitch: 1.15, rate: 0.95, desc: '차분하고 다정한 멘토 세라 (부드러운 힐링 톤)', defaultVoice: 'ko-KR-SunHiNeural' },
    { id: 'ANIME_F_BRIGHT', name: '아이돌 밍크', gender: 'female', pitch: 1.45, rate: 1.12, desc: '밝고 활기찬 아이돌 밍크 (긍정 비타민 어조)', defaultVoice: 'ko-KR-SunHiNeural' },
    { id: 'ANIME_M_YOUTH', name: '소년 카이', gender: 'male', pitch: 1.10, rate: 1.10, desc: '경쾌하고 활기찬 소년 카이 (자신감 넘치는 만화 주인공)', defaultVoice: 'ko-KR-InJoonNeural' },
    { id: 'ANIME_M_CALM', name: '연구원 레오', gender: 'male', pitch: 0.90, rate: 0.95, desc: '부드럽고 차분한 연구원 레오 (신뢰감 넘치는 중저음)', defaultVoice: 'ko-KR-InJoonNeural' },
    { id: 'ANIME_M_DEEP', name: '수호대장 바론', gender: 'male', pitch: 0.75, rate: 0.90, desc: '낮고 진중한 수호대장 바론 (묵직한 바리톤)', defaultVoice: 'ko-KR-InJoonNeural' }
  ];

  const EDGE_VOICES = [
    // 🇰🇷 한국어 공식 실존 신경망 모델 (최우선 디폴트 3종)
    { id: 'ko-KR-SunHiNeural', name: '선희 (SunHi - 한국어 대표 표준 여성)', lang: 'ko-KR', gender: 'female', desc: '한국어 대표 표준 여성 톤' },
    { id: 'ko-KR-InJoonNeural', name: '인준 (InJoon - 한국어 대표 신뢰 남성)', lang: 'ko-KR', gender: 'male', desc: '한국어 대표 신뢰 남성 톤' },
    { id: 'ko-KR-HyunsuMultilingualNeural', name: '현수 (Hyunsu - 다국어 청년 남성)', lang: 'ko-KR', gender: 'male', desc: '한국어 다국어 청년 톤' },
    // 🇺🇸 미국 영어 공식 모델 (6종)
    { id: 'en-US-JennyNeural', name: 'Jenny (US - 미국 대표 여성)', lang: 'en-US', gender: 'female', desc: '미국 대표 자연스러운 여성' },
    { id: 'en-US-GuyNeural', name: 'Guy (US - 미국 대표 남성)', lang: 'en-US', gender: 'male', desc: '미국 대표 편안한 남성' },
    { id: 'en-US-AriaNeural', name: 'Aria (US - 뉴스 앵커 스타일)', lang: 'en-US', gender: 'female', desc: '뉴스 앵커 스타일 여성' },
    { id: 'en-US-ChristopherNeural', name: 'Christopher (US - 멘토 남성)', lang: 'en-US', gender: 'male', desc: '안정적인 멘토 남성' },
    { id: 'en-US-EricNeural', name: 'Eric (US - 에너지 청년)', lang: 'en-US', gender: 'male', desc: '활기찬 에너지 남성' },
    { id: 'en-US-MichelleNeural', name: 'Michelle (US - 일상 대화 여성)', lang: 'en-US', gender: 'female', desc: '다정한 일상 대화 여성' },
    // 🇬🇧 영국 영어 모델 (4종)
    { id: 'en-GB-SoniaNeural', name: 'Sonia (UK - 영국 대표 여성)', lang: 'en-GB', gender: 'female', desc: '영국 대표 튜터 여성' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (UK - 영국 대표 청년)', lang: 'en-GB', gender: 'male', desc: '영국 대표 청년 남성' },
    { id: 'en-GB-LibbyNeural', name: 'Libby (UK - 맑은 영국 여성)', lang: 'en-GB', gender: 'female', desc: '또렷하고 맑은 영국 여성' },
    { id: 'en-GB-ThomasNeural', name: 'Thomas (UK - 영국 신사 남성)', lang: 'en-GB', gender: 'male', desc: '지적인 영국 신사 남성' },
    // 🇯🇵 일본어 모델 (2종)
    { id: 'ja-JP-NanamiNeural', name: 'Nanami (JP - 일본어 대표 여성)', lang: 'ja-JP', gender: 'female', desc: '일본어 대표 친절한 여성' },
    { id: 'ja-JP-KeitaNeural', name: 'Keita (JP - 일본어 대표 남성)', lang: 'ja-JP', gender: 'male', desc: '일본어 대표 지적인 남성' },
    // 🇨🇳 중국어 보통화 모델 (4종)
    { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (CN - 중국어 대표 여성)', lang: 'zh-CN', gender: 'female', desc: '중국어 대표 표준 여성' },
    { id: 'zh-CN-YunxiNeural', name: 'Yunxi (CN - 중국어 청년 남성)', lang: 'zh-CN', gender: 'male', desc: '중국어 대표 활기찬 청년' },
    { id: 'zh-CN-YunjianNeural', name: 'Yunjian (CN - 내레이션 남성)', lang: 'zh-CN', gender: 'male', desc: '중국어 대표 다큐/내레이션' },
    { id: 'zh-CN-YunyangNeural', name: 'Yunyang (CN - 뉴스 앵커 남성)', lang: 'zh-CN', gender: 'male', desc: '중국어 대표 뉴스 앵커' },
    // 🇫🇷 프랑스어 모델 (2종)
    { id: 'fr-FR-DeniseNeural', name: 'Denise (FR - 프랑스어 대표 여성)', lang: 'fr-FR', gender: 'female', desc: '프랑스어 대표 우아한 여성' },
    { id: 'fr-FR-HenriNeural', name: 'Henri (FR - 프랑스어 지적 남성)', lang: 'fr-FR', gender: 'male', desc: '프랑스어 대표 지적인 남성' },
    // 🇪🇺 유럽 다국어 모델 (2종)
    { id: 'de-DE-KatjaNeural', name: 'Katja (DE - 독일어 대표 여성)', lang: 'de-DE', gender: 'female', desc: '독일어 대표 표준 여성' },
    { id: 'es-ES-ElviraNeural', name: 'Elvira (ES - 스페인어 대표 여성)', lang: 'es-ES', gender: 'female', desc: '스페인어 대표 표준 여성' }
  ];

  const ELEVEN_VOICES = [
    // 👨 실제 사람 남성 공식 실존 모델 (8종)
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (아담)', gender: 'male', desc: '깊고 무게감 있는 대표 남성' },
    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian (브라이언)', gender: 'male', desc: '차분하고 깊이 있는 중저음' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (대니얼)', gender: 'male', desc: '신뢰감 있는 영국 신사 아나운서' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (조지)', gender: 'male', desc: '따뜻하고 몰입감 있는 스토리텔러' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum (칼럼)', gender: 'male', desc: '개성 넘치는 허스키 보이스' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (찰리)', gender: 'male', desc: '친근하고 발랄한 20대 청년' },
    { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric (에릭)', gender: 'male', desc: '또렷하고 자신감 넘치는 비즈니스' },
    { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris (크리스)', gender: 'male', desc: '편안하고 자연스러운 일상 대화' },
    // 👩 실제 사람 여성 공식 실존 모델 (8종)
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (세라)', gender: 'female', desc: '부드럽고 신뢰감 있는 대표 여성' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (로라)', gender: 'female', desc: '밝고 상냥한 20대 여성' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice (앨리스)', gender: 'female', desc: '차분하고 지적인 어학 튜터' },
    { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (제시카)', gender: 'female', desc: '발랄하고 에너지 넘치는 밝은 톤' },
    { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily (릴리)', gender: 'female', desc: '따뜻하고 포근한 나레이션' },
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda (마틸다)', gender: 'female', desc: '전문적이고 프로페셔널한 보컬' },
    { id: 'hpp4J3VqNfWAUOO0d1Us', name: 'Bella (벨라)', gender: 'female', desc: '상냥하고 사랑스러운 톤' },
    { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River (리버)', gender: 'female', desc: '차분하고 안정적인 내레이터' }
  ];

  // Kokoro-82M 실제 온디바이스 합성 (kokoro-js, 영어 전용 28종). 한국어 문장은 영어로 번역해 읽는다.
  const KOKORO_JS_URL = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm';
  const KOKORO_MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX'; // q8 약 92MB, 최초 1회 내려받아 브라우저 캐시에 보관
  const KOKORO_VOICES = [
    ['af_heart', 'Heart', '최고 평점 대표 여성'], ['af_bella', 'Bella', '맑고 상냥한 여성'], ['af_nicole', 'Nicole', '속삭이듯 부드러운 여성'],
    ['af_aoede', 'Aoede', '차분한 여성'], ['af_kore', 'Kore', '또렷한 여성'], ['af_sarah', 'Sarah', '친근한 여성'],
    ['af_nova', 'Nova', '밝은 여성'], ['af_sky', 'Sky', '경쾌한 하이톤 여성'], ['af_alloy', 'Alloy', '중성적 여성'],
    ['af_jessica', 'Jessica', '활발한 여성'], ['af_river', 'River', '잔잔한 여성'],
    ['am_michael', 'Michael', '지적이고 젠틀한 남성'], ['am_fenrir', 'Fenrir', '힘 있는 남성'], ['am_puck', 'Puck', '장난기 있는 남성'],
    ['am_echo', 'Echo', '울림 있는 남성'], ['am_eric', 'Eric', '자신감 있는 남성'], ['am_liam', 'Liam', '청년 남성'],
    ['am_onyx', 'Onyx', '깊은 저음 남성'], ['am_santa', 'Santa', '푸근한 남성'], ['am_adam', 'Adam', '바리톤 남성'],
    ['bf_emma', 'Emma', '영국 여성'], ['bf_isabella', 'Isabella', '우아한 영국 여성'], ['bf_alice', 'Alice', '단정한 영국 여성'],
    ['bf_lily', 'Lily', '부드러운 영국 여성'],
    ['bm_george', 'George', '영국 신사 남성'], ['bm_fable', 'Fable', '이야기꾼 영국 남성'], ['bm_lewis', 'Lewis', '품격 있는 영국 남성'],
    ['bm_daniel', 'Daniel', '차분한 영국 남성']
  ].map(([id, name, desc]) => ({
    id, name: `${name} (${id[0] === 'a' ? 'US' : 'UK'})`, desc,
    gender: id[1] === 'm' ? 'male' : 'female', lang: id[0] === 'a' ? 'en-US' : 'en-GB'
  }));

  const GEMINI_VOICE_CATALOG = [
    // 👩 1. 실제 사람 여성 (10종 + 💋히든 FH)
    { id: 'HUMAN_F1', name: 'F1. 다정한 표준 튜터', gender: 'female', cat: 'hf', icon: '👩‍🏫', desc: '따뜻하고 편안한 표준 어학 튜터 톤' },
    { id: 'HUMAN_F2', name: 'F2. 또렷한 뉴스 앵커', gender: 'female', cat: 'hf', icon: '📰', desc: '명확하고 정확한 표준 딕션' },
    { id: 'HUMAN_F3', name: 'F3. 활기찬 20대 일상', gender: 'female', cat: 'hf', icon: '✨', desc: '자연스러운 대화체와 산뜻한 호흡' },
    { id: 'HUMAN_F4', name: 'F4. 차분한 다큐 내레이터', gender: 'female', cat: 'hf', icon: '🎙️', desc: '신뢰감을 주는 깊은 호흡과 톤' },
    { id: 'HUMAN_F5', name: 'F5. 우아한 멘토 (알토)', gender: 'female', cat: 'hf', icon: '☕', desc: '부드러운 중저음과 고급스러운 톤' },
    { id: 'HUMAN_F6', name: 'F6. 스마트 비즈니스 프로', gender: 'female', cat: 'hf', icon: '💼', desc: '간결하고 명료한 프로페셔널 톤' },
    { id: 'HUMAN_F7', name: 'F7. 다정한 심리상담사', gender: 'female', cat: 'hf', icon: '🌿', desc: '마음을 편안하게 해주는 위로의 음색' },
    { id: 'HUMAN_F8', name: 'F8. 발랄한 여행 가이드', gender: 'female', cat: 'hf', icon: '✈️', desc: '기분 좋은 에너지와 명랑한 톤' },
    { id: 'HUMAN_F9', name: 'F9. 꼼꼼한 어학 교관', gender: 'female', cat: 'hf', icon: '🎯', desc: '발음 교정에 최적화된 리드미컬 톤' },
    { id: 'HUMAN_F10', name: 'F10. 친근한 동네 언니', gender: 'female', cat: 'hf', icon: '👭', desc: '장난기 있고 상냥한 일상 대화 톤' },
    { id: 'HUMAN_FH', name: 'FH. [히든] 매혹의 섹시녀', gender: 'female', cat: 'hf', icon: '💋', desc: '도발적이고 고혹적인 팜므파탈 톤' },
    // 👨 2. 실제 사람 남성 (10종 + 🎬히든 MH)
    { id: 'HUMAN_M1', name: 'M1. 20대 표준 청년', gender: 'male', cat: 'hm', icon: '👨‍🎓', desc: '가장 자연스러운 일상 표준 한국어' },
    { id: 'HUMAN_M2', name: 'M2. 지적인 설명 튜터', gender: 'male', cat: 'hm', icon: '📚', desc: '귀에 쏙쏙 박히는 명확한 딕션' },
    { id: 'HUMAN_M3', name: 'M3. 비즈니스 멘토', gender: 'male', cat: 'hm', icon: '👔', desc: '신뢰감과 품격이 느껴지는 비즈니스 톤' },
    { id: 'HUMAN_M4', name: 'M4. 경쾌한 에너지 청년', gender: 'male', cat: 'hm', icon: '⚡', desc: '밝고 긍정적인 파이팅 넘치는 톤' },
    { id: 'HUMAN_M5', name: 'M5. 묵직한 안정적 중저음', gender: 'male', cat: 'hm', icon: '🛡️', desc: '묵직하고 편안한 남성 보이스' },
    { id: 'HUMAN_M6', name: 'M6. 심야 라디오 DJ', gender: 'male', cat: 'hm', icon: '🌙', desc: '감미롭고 달콤한 심야 라디오 감성' },
    { id: 'HUMAN_M7', name: 'M7. 냉철한 분석가', gender: 'male', cat: 'hm', icon: '🔍', desc: '흐트러짐 없는 단단하고 깔끔한 톤' },
    { id: 'HUMAN_M8', name: 'M8. 호탕한 동아리 선배', gender: 'male', cat: 'hm', icon: '🎉', desc: '자신감 넘치고 시원시원한 호남형 톤' },
    { id: 'HUMAN_M9', name: 'M9. 침착한 수석 엔지니어', gender: 'male', cat: 'hm', icon: '⚙️', desc: '차분하고 정돈된 신뢰의 음색' },
    { id: 'HUMAN_M10', name: 'M10. 카리스마 스타트업 대표', gender: 'male', cat: 'hm', icon: '🚀', desc: '비전과 열정이 담긴 흡입력 있는 톤' },
    { id: 'HUMAN_MH', name: 'MH. [히든] 명품배우 유해진', gender: 'male', cat: 'hm', icon: '🎬', desc: '구수하고 위트 넘치는 친근한 삼촌' },
    // 🧚 3. 애니메이션 성우 여성 (10종 + 💙히든 AFH)
    { id: 'ANIME_F1', name: 'AF1. 루나 (상큼한 마법소녀)', gender: 'female', cat: 'af', icon: '🎀', desc: '통통 튀는 발랄함과 용기를 주는 음색' },
    { id: 'ANIME_F2', name: 'AF2. 세라 (다정한 치유계 멘토)', gender: 'female', cat: 'af', icon: '🕊️', desc: '모두를 감싸 안아주는 상냥한 누나' },
    { id: 'ANIME_F3', name: 'AF3. 밍크 (상큼발랄 아이돌)', gender: 'female', cat: 'af', icon: '🎤', desc: '스파클링처럼 톡 쏘는 밝은 에너지' },
    { id: 'ANIME_F4', name: 'AF4. 시온 (쿨뷰티 도서관 사서)', gender: 'female', cat: 'af', icon: '📖', desc: '차분하고 이지적인 문학 소녀 감성' },
    { id: 'ANIME_F5', name: 'AF5. 유리아 (신비로운 치유정령)', gender: 'female', cat: 'af', icon: '🌸', desc: '속삭이듯 영롱한 판타지 정령 톤' },
    { id: 'ANIME_F6', name: 'AF6. 스칼렛 (츤데레 명문 영애)', gender: 'female', cat: 'af', icon: '👑', desc: '도도하지만 속은 따뜻한 츤데레 톤' },
    { id: 'ANIME_F7', name: 'AF7. 클로에 (괴짜 메카닉 소녀)', gender: 'female', cat: 'af', icon: '🔧', desc: '호기심 폭발하는 장난꾸러기 천재' },
    { id: 'ANIME_F8', name: 'AF8. 에리스 (그림자 암살자)', gender: 'female', cat: 'af', icon: '🗡️', desc: '낮고 서늘하지만 치명적인 카리스마' },
    { id: 'ANIME_F9', name: 'AF9. 벨 (명랑 수인 격투가)', gender: 'female', cat: 'af', icon: '🐾', desc: '야생의 활력과 애교가 넘치는 톤' },
    { id: 'ANIME_F10', name: 'AF10. 프레야 (마도 제국 황녀)', gender: 'female', cat: 'af', icon: '🔮', desc: '기품과 위엄이 넘치는 여왕의 음색' },
    { id: 'ANIME_AFH', name: 'AFH. [히든] 렘 (저택 메이드)', gender: 'female', cat: 'af', icon: '💙', desc: '주인님을 향한 절대적인 헌신과 사랑' },
    // ⚔️ 4. 애니메이션 성우 남성 (10종 + ⚡히든 AMH)
    { id: 'ANIME_M1', name: 'AM1. 카이 (열혈 소년 용사)', gender: 'male', cat: 'am', icon: '🔥', desc: '포기를 모르는 왕도 소년만화 주인공' },
    { id: 'ANIME_M2', name: 'AM2. 레오 (천재 미소년 마법사)', gender: 'male', cat: 'am', icon: '✨', desc: '맑고 투명하지만 속 깊은 신동 톤' },
    { id: 'ANIME_M3', name: 'AM3. 레이 (냉철한 은발 라이벌)', gender: 'male', cat: 'am', icon: '❄️', desc: '차가운 이면에 뜨거운 신념을 품은 라이벌' },
    { id: 'ANIME_M4', name: 'AM4. 렌 (불꽃의 의리파 무도가)', gender: 'male', cat: 'am', icon: '🥊', desc: '주먹 하나로 세상을 헤쳐나가는 호걸' },
    { id: 'ANIME_M5', name: 'AM5. 바론 (왕실 수호기사대장)', gender: 'male', cat: 'am', icon: '🛡️', desc: '목숨을 바쳐 주군을 지키는 기사도 톤' },
    { id: 'ANIME_M6', name: 'AM6. 제피르 (바람의 음유시인)', gender: 'male', cat: 'am', icon: '🎶', desc: '자유로운 영혼과 낭만이 깃든 미성' },
    { id: 'ANIME_M7', name: 'AM7. 녹스 (어둠의 다크로드)', gender: 'male', cat: 'am', icon: '🖤', desc: '심연을 지배하는 압도적인 중저음 카리스마' },
    { id: 'ANIME_M8', name: 'AM8. 길버트 (완벽한 은발 집사)', gender: 'male', cat: 'am', icon: '☕', desc: '예의 바르고 빈틈없는 최상급 신사' },
    { id: 'ANIME_M9', name: 'AM9. 토르 (호걸 드워프 전사)', gender: 'male', cat: 'am', icon: '🍺', desc: '호탕한 웃음과 의리의 대장간 영웅' },
    { id: 'ANIME_M10', name: 'AM10. 신 (고독한 방랑 검객)', gender: 'male', cat: 'am', icon: '⚔️', desc: '말수가 적고 날카로운 바람 같은 목소리' },
    { id: 'ANIME_AMH', name: 'AMH. [히든] 아가츠마 젠이츠', gender: 'male', cat: 'am', icon: '⚡', desc: '벽력일섬! 번개의 호흡 극의' }
  ];

  // =========================================================================
  // 2. 2D 캐릭터 캔버스 렌더러 (8대 상태 머신 & 눈 깜빡임 & RMS 4단계 립싱크)
  // =========================================================================
  class Character2DCanvasRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.state = 'IDLE'; // IDLE, LISTENING, THINKING, SPEAKING, HAPPY, CALM, INTERRUPTED, ERROR
      this.lipLevel = 0;   // 0: CLOSED, 1: SMALL, 2: MEDIUM, 3: WIDE
      this.isBlinking = false;
      this.blinkTimer = null;
      this.animFrameId = null;

      if (this.canvas) {
        this._startBlinkLoop();
        this._startRenderLoop();
      }
    }

    _startBlinkLoop() {
      const scheduleBlink = () => {
        const nextMs = Math.random() * 2000 + 2500; // 2.5s ~ 4.5s
        this.blinkTimer = setTimeout(() => {
          this.isBlinking = true;
          setTimeout(() => {
            this.isBlinking = false;
            scheduleBlink();
          }, 150);
        }, nextMs);
      };
      scheduleBlink();
    }

    setState(newState) {
      this.state = newState;
      if (newState === 'INTERRUPTED' || newState === 'IDLE') {
        this.lipLevel = 0; // 즉각 닫힘
      }
    }

    setLipLevel(level) {
      this.lipLevel = Math.max(0, Math.min(3, level));
    }

    _startRenderLoop() {
      const render = () => {
        this._draw();
        this.animFrameId = requestAnimationFrame(render);
      };
      render();
    }

    _draw() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 배경 은은한 글로우
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w / 2);
      bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 1. 얼굴 원형 윤곽
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fillStyle = '#fdf2f8'; // 부드러운 살구빛
      ctx.shadowColor = 'rgba(236, 72, 153, 0.25)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f472b6';
      ctx.stroke();
      ctx.restore();

      // 2. 볼터치 (Blush)
      ctx.fillStyle = 'rgba(251, 113, 133, 0.35)';
      ctx.beginPath();
      ctx.arc(cx - 50, cy + 15, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 50, cy + 15, 14, 0, Math.PI * 2);
      ctx.fill();

      // 3. 눈 드로잉 (상태 및 깜빡임 연동)
      ctx.fillStyle = '#0f172a';
      if (this.isBlinking || this.state === 'HAPPY') {
        // 반달 웃는 눈/깜빡임
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 32, cy - 10, 14, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 32, cy - 10, 14, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      } else if (this.state === 'THINKING') {
        // 생각 중 시선 상향 이동
        ctx.beginPath();
        ctx.arc(cx - 32, cy - 16, 10, 0, Math.PI * 2);
        ctx.arc(cx + 32, cy - 16, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.state === 'INTERRUPTED' || this.state === 'ERROR') {
        // 놀란/당황 눈
        ctx.beginPath();
        ctx.arc(cx - 32, cy - 10, 13, 0, Math.PI * 2);
        ctx.arc(cx + 32, cy - 10, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 30, cy - 12, 5, 0, Math.PI * 2);
        ctx.arc(cx + 34, cy - 12, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // IDLE, SPEAKING, LISTENING 일반 또렷한 눈
        ctx.beginPath();
        ctx.arc(cx - 32, cy - 10, 11, 0, Math.PI * 2);
        ctx.arc(cx + 32, cy - 10, 11, 0, Math.PI * 2);
        ctx.fill();
        // 눈동자 하이라이트
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 29, cy - 13, 4, 0, Math.PI * 2);
        ctx.arc(cx + 35, cy - 13, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. 입 모양 드로잉 (4단계 립싱크 매핑)
      const mouthY = cy + 32;
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 2.5;

      if (this.lipLevel === 0) {
        // Level 0: CLOSED (다문 미소 입)
        ctx.beginPath();
        ctx.arc(cx, mouthY, 12, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      } else if (this.lipLevel === 1) {
        // Level 1: SMALL
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 2, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (this.lipLevel === 2) {
        // Level 2: MEDIUM
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 3, 14, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 혀 살짝
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(cx, mouthY + 9, 6, Math.PI, 0);
        ctx.fill();
      } else {
        // Level 3: WIDE (크게 열린 입)
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 5, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 혀 & 치아
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 10, mouthY - 7, 20, 5);
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(cx, mouthY + 12, 9, Math.PI, 0);
        ctx.fill();
      }

      // 5. 상단 상태 배지
      ctx.font = 'bold 11px Pretendard, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`[${this.state}] LIP-LV:${this.lipLevel}`, cx, h - 14);
    }

    destroy() {
      if (this.blinkTimer) clearTimeout(this.blinkTimer);
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }

  // 번역 캐시
  const translationCache = new Map();

  async function translateText(text, targetLang) {
    if (!text || targetLang === 'ko' || targetLang === 'ko-KR') return text;
    if (!/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text)) return text;

    const langCode = targetLang.split('-')[0].toLowerCase();
    const finalTarget = (targetLang.toLowerCase() === 'zh-cn' || langCode === 'zh') ? 'zh-CN' : langCode;
    const cacheKey = `${finalTarget}:${text}`;

    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

    try {
      const res = await fetch(`http://127.0.0.1:18880/api/translate?text=${encodeURIComponent(text)}&target=${finalTarget}`, {
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.translated) {
          translationCache.set(cacheKey, data.translated);
          return data.translated;
        }
      }
    } catch (e) {}

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${finalTarget}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        const resText = data[0].map(p => p[0]).filter(Boolean).join('');
        if (resText) {
          translationCache.set(cacheKey, resText);
          return resText;
        }
      }
    } catch (e) {}

    return text;
  }

  // 스마트 오디오 캐시 매니저
  class SmartAudioCache {
    constructor() {
      this.memCache = new Map();
      this.db = null;
      this.dbReadyPromise = this._initIndexedDB();
    }

    _initIndexedDB() {
      if (typeof indexedDB === 'undefined') return Promise.resolve(null);
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('OurVoiceEngineCacheDB', 1);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('audio_cache')) {
              db.createObjectStore('audio_cache', { keyPath: 'key' });
            }
          };
          req.onsuccess = (e) => {
            this.db = e.target.result;
            resolve(this.db);
          };
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    makeKey(engine, voice, text, rate = 1.0) {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
      }
      return `${engine}:${voice}:${rate}:${hash}`;
    }

    async get(key) {
      if (this.memCache.has(key)) return this.memCache.get(key);
      await this.dbReadyPromise;
      if (!this.db) return null;
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction('audio_cache', 'readonly');
          const store = tx.objectStore('audio_cache');
          const req = store.get(key);
          req.onsuccess = () => {
            if (req.result && req.result.blob) {
              this.memCache.set(key, req.result.blob);
              resolve(req.result.blob);
            } else resolve(null);
          };
          req.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
      });
    }

    async set(key, blob) {
      if (!key || !blob) return;
      this.memCache.set(key, blob);
      await this.dbReadyPromise;
      if (!this.db) return;
      try {
        const tx = this.db.transaction('audio_cache', 'readwrite');
        const store = tx.objectStore('audio_cache');
        store.put({ key, blob, timestamp: Date.now() });
      } catch (e) {}
    }

    async clear() {
      this.memCache.clear();
      translationCache.clear();
      await this.dbReadyPromise;
      if (!this.db) return;
      try {
        const tx = this.db.transaction('audio_cache', 'readwrite');
        const store = tx.objectStore('audio_cache');
        store.clear();
      } catch (e) {}
    }

    async getStats() {
      await this.dbReadyPromise;
      return {
        memoryCount: this.memCache.size,
        translationsCount: translationCache.size,
        indexedDBReady: Boolean(this.db)
      };
    }
  }

  const audioCache = new SmartAudioCache();

  // Android 네이티브 Edge 합성 요청 대기열 (요청 ID → resolve/reject)
  const NATIVE_WAITERS = {};
  let nativeSeq = 0;

  // =========================================================================
  // 3. OurVoiceMasterEngine 코어 클래스 (5단계 캐릭터 캔버스 & 립싱크 결합)
  // =========================================================================
  class OurVoiceMasterEngine {
    constructor(config = {}) {
      this.config = Object.assign({
        defaultMode: 'human',       // 'human' (일반 음성 모드) | 'anime' (애니 캐릭터 모드)
        defaultEngine: 'auto',
        defaultVoice: 'ko-KR-SunHiNeural',
        autoTranslate: false,
        enableFallback: true,
        enableCircuitBreaker: true,
        enableCache: true,
        serverUrl: 'http://127.0.0.1:18880',
        audioSamplesPath: './audio_samples/'
      }, config);

      this.currentMode = this.config.defaultMode;
      this.currentAudio = null;
      this.isPlaying = false;
      this.geminiEngine = null;
      this.characterCanvas = null;

      // Web Audio RMS 분석기
      this.audioCtx = null;
      this.analyser = null;
      this.rmsFrameId = null;

      this.circuitBreakers = {
        gemini: { state: 'CLOSED', failures: 0, lastFailure: 0, cooldownMs: 30000, lastError: '' },
        eleven: { state: 'CLOSED', failures: 0, lastFailure: 0, cooldownMs: 30000, lastError: '' },
        edge:   { state: 'CLOSED', failures: 0, lastFailure: 0, cooldownMs: 15000, lastError: '' },
        kokoro: { state: 'CLOSED', failures: 0, lastFailure: 0, cooldownMs: 10000, lastError: '' },
        system: { state: 'CLOSED', failures: 0, lastFailure: 0, cooldownMs: 5000,  lastError: '' }
      };

      this.syncedVoices = { eleven: [] };
      this.cache = audioCache;

      this.apiKeys = {
        gemini: typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_voice_api_key') || '' : '',
        eleven: typeof localStorage !== 'undefined' ? localStorage.getItem('eleven_voice_api_key') || '' : ''
      };
    }

    // 2D 캐릭터 캔버스 바인딩
    bindCharacterCanvas(canvasEl) {
      if (this.characterCanvas) this.characterCanvas.destroy();
      this.characterCanvas = new Character2DCanvasRenderer(canvasEl);
      return this.characterCanvas;
    }

    // 음성 모드 전환 (human <-> anime)
    setMode(mode) {
      this.currentMode = mode === 'anime' ? 'anime' : 'human';
      return this.currentMode;
    }

    getMode() {
      return this.currentMode;
    }

    setCharacterState(state) {
      if (this.characterCanvas) this.characterCanvas.setState(state);
    }

    setApiKey(engine, key) {
      if (!key) return;
      const cleanKey = key.trim();
      if (engine === 'gemini') {
        this.apiKeys.gemini = cleanKey;
        if (typeof localStorage !== 'undefined') localStorage.setItem('gemini_voice_api_key', cleanKey);
        this.geminiEngine = null;
        this.resetCircuitBreaker('gemini');
      } else if (engine === 'eleven') {
        this.apiKeys.eleven = cleanKey;
        if (typeof localStorage !== 'undefined') localStorage.setItem('eleven_voice_api_key', cleanKey);
        this.resetCircuitBreaker('eleven');
      }
    }

    getApiKey(engine) {
      return this.apiKeys[engine] || '';
    }

    resetCircuitBreaker(engine = 'all') {
      const targets = engine === 'all' ? Object.keys(this.circuitBreakers) : [engine];
      targets.forEach(e => {
        if (this.circuitBreakers[e]) {
          this.circuitBreakers[e].state = 'CLOSED';
          this.circuitBreakers[e].failures = 0;
          this.circuitBreakers[e].lastFailure = 0;
          this.circuitBreakers[e].lastError = '';
        }
      });
    }

    getEngineHealth() {
      const now = Date.now();
      const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
      const health = {};

      for (const [engine, cb] of Object.entries(this.circuitBreakers)) {
        if (!isOnline && (engine === 'gemini' || engine === 'eleven' || engine === 'edge')) {
          health[engine] = { status: 'OFFLINE', message: '인터넷 연결 끊김' };
          continue;
        }

        if (engine === 'gemini' && !this.getApiKey('gemini')) {
          health[engine] = { status: 'NO_KEY', message: 'API 키 미등록' };
          continue;
        }
        if (engine === 'eleven' && !this.getApiKey('eleven')) {
          health[engine] = { status: 'NO_KEY', message: 'API 키 미등록' };
          continue;
        }

        if (cb.state === 'OPEN') {
          const remaining = Math.max(0, Math.ceil((cb.cooldownMs - (now - cb.lastFailure)) / 1000));
          if (remaining > 0) {
            health[engine] = { status: 'COOLDOWN', remainingSeconds: remaining, reason: cb.lastError };
            continue;
          }
        }

        health[engine] = { status: 'HEALTHY', failures: cb.failures };
      }
      return health;
    }

    _isEngineAvailable(engine) {
      if (!this.config.enableCircuitBreaker) return true;
      const cb = this.circuitBreakers[engine];
      if (!cb) return true;

      const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
      if (!isOnline && (engine === 'gemini' || engine === 'eleven' || engine === 'edge')) return false;

      if (cb.state === 'OPEN') {
        const elapsed = Date.now() - cb.lastFailure;
        if (elapsed < cb.cooldownMs) return false;
        cb.state = 'HALF-OPEN';
      }
      return true;
    }

    _recordSuccess(engine) {
      const cb = this.circuitBreakers[engine];
      if (cb) {
        cb.state = 'CLOSED';
        cb.failures = 0;
        cb.lastError = '';
      }
    }

    _recordFailure(engine, error) {
      const cb = this.circuitBreakers[engine];
      if (cb) {
        cb.failures += 1;
        cb.lastFailure = Date.now();
        cb.lastError = error.message || String(error);
        cb.state = 'OPEN';
      }
    }

    async syncVoices(engine = 'eleven', apiKey = '') {
      const key = apiKey || this.getApiKey('eleven');
      if (!key) throw new Error('ElevenLabs API Key is required.');

      if (engine === 'eleven') {
        const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': key },
          signal: AbortSignal.timeout(6000)
        });
        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.detail?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        const voices = data.voices || [];
        this.syncedVoices.eleven = voices.map(v => ({
          id: v.voice_id,
          name: v.name,
          gender: v.labels?.gender || (v.category === 'premade' ? '남/여' : '보이스'),
          desc: v.labels?.description || v.labels?.accent || v.category || '계정 보이스',
          category: v.category
        }));
        this._recordSuccess('eleven');
        return this.syncedVoices.eleven;
      }
      return [];
    }

    getVoices(engine = 'all') {
      const result = {};
      if (engine === 'all' || engine === 'edge') result.edge = EDGE_VOICES;
      if (engine === 'all' || engine === 'kokoro') result.kokoro = KOKORO_VOICES;
      if (engine === 'all' || engine === 'anime_presets') result.anime_presets = ANIME_PRESETS;

      if (engine === 'all' || engine === 'eleven') {
        result.eleven = (this.syncedVoices.eleven && this.syncedVoices.eleven.length > 0)
          ? this.syncedVoices.eleven : ELEVEN_VOICES;
      }

      if (engine === 'all' || engine === 'gemini') {
        // Gemini 44종은 gemini_human_voice_engine.js의 VOICES(MASTER_VOICES_44)가 단일 원본
        result.gemini = (typeof GeminiHumanVoiceEngine !== 'undefined' && GeminiHumanVoiceEngine.VOICES)
          ? GeminiHumanVoiceEngine.VOICES : GEMINI_VOICE_CATALOG;
      }

      return engine === 'all' ? result : (result[engine] || []);
    }

    // 재생 중이거나 로딩 중인 오디오를 완전히 분리한다.
    // (pause만 하면 늦게 로딩된 오디오가 canplaythrough에서 다시 play()되어 겹쳐 들림)
    _detachAudio(audio) {
      if (!audio) return;
      try {
        audio.oncanplaythrough = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch (e) {}
    }

    stop() {
      // 토큰 증가: 진행 중인 모든 speak() 흐름은 이후 어떤 소리도 내지 않고 조용히 종료된다.
      this.currentPlayToken = (this.currentPlayToken || 0) + 1;
      this._stopRMSAnalysis();
      if (this.currentAudio) {
        this._detachAudio(this.currentAudio);
        this.currentAudio = null;
      }
      if (this._pendingPlay) {
        const p = this._pendingPlay;
        this._pendingPlay = null;
        p(new Error('CANCELED'));
      }
      {
        Object.keys(NATIVE_WAITERS).forEach(id => {
          const w = NATIVE_WAITERS[id];
          delete NATIVE_WAITERS[id];
          w.reject(new Error('CANCELED'));
        });
      }
      if (this.geminiEngine && typeof this.geminiEngine.stop === 'function') {
        try { this.geminiEngine.stop(); } catch(e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.isPlaying = false;
      if (this.characterCanvas) {
        this.characterCanvas.setState('IDLE');
        this.characterCanvas.setLipLevel(0);
      }
    }

    async getCacheStats() {
      return await this.cache.getStats();
    }

    async clearCache() {
      await this.cache.clear();
    }

    isOfflineCapable() {
      return true;
    }

    /**
     * 표준 발화 단일 인터페이스 (애니메이션 립싱크 60FPS 바인딩)
     */
    async speak(text, options = {}) {
      const opts = Object.assign({
        mode: this.currentMode,
        engine: this.config.defaultEngine,
        voice: this.config.defaultVoice,
        rate: 1.0,
        pitch: 1.0,
        translate: this.config.autoTranslate,
        fallback: this.config.enableFallback,
        useCache: this.config.enableCache,
        onStart: null,
        onEnd: null,
        onError: null,
        onFallback: null
      }, options);

      // 애니메이션 캐릭터 모드일 때 6대 프리셋 적용
      if (opts.mode === 'anime' && opts.preset) {
        const p = ANIME_PRESETS.find(pr => pr.id === opts.preset);
        if (p) {
          opts.pitch = p.pitch;
          opts.rate = p.rate;
          if (!options.voice) opts.voice = p.defaultVoice;
        }
      }

      if (!text || !text.trim()) {
        const err = new Error('Text is empty.');
        if (opts.onError) opts.onError(err);
        return { ok: false, error: err };
      }

      this.stop();
      const playToken = this.currentPlayToken;
      this.isPlaying = true;

      // 캔버스 상태: 말하기 준비 (THINKING -> SPEAKING)
      if (this.characterCanvas) {
        this.characterCanvas.setState('THINKING');
      }

      const canceledResult = () => ({ ok: false, canceled: true, error: 'CANCELED' });
      const isStale = () => playToken !== this.currentPlayToken;

      // 스마트 캐시 히트 검사 (0초 재생)
      if (opts.useCache) {
        const cacheKey = this.cache.makeKey(opts.engine, opts.voice, text, opts.rate);
        const cachedBlob = await this.cache.get(cacheKey);
        if (isStale()) return canceledResult();

        if (cachedBlob) {
          if (this.characterCanvas) this.characterCanvas.setState('SPEAKING');
          if (opts.onStart) opts.onStart({ text, options: opts, fromCache: true });
          const audioUrl = URL.createObjectURL(cachedBlob);
          try {
            await this._playAudioUrl(audioUrl, playToken);
          } catch (e) {
            if (isStale() || e.message === 'CANCELED') return canceledResult();
            throw e;
          }
          this.isPlaying = false;
          if (this.characterCanvas) {
            this.characterCanvas.setState('HAPPY');
            setTimeout(() => this.characterCanvas && this.characterCanvas.setState('IDLE'), 1200);
          }
          const cacheResult = {
            ok: true,
            engine: opts.engine,
            voice: opts.voice,
            spokenText: text,
            fromCache: true,
            mode: 'smart-local-cache-hit'
          };
          if (opts.onEnd) opts.onEnd(cacheResult);
          return cacheResult;
        }
      }

      if (opts.onStart) opts.onStart({ text, options: opts, fromCache: false });

      const allTiers = ['gemini', 'eleven', 'edge', 'kokoro', 'system'];
      let candidateQueue = [];

      const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

      if (opts.offline || !isOnline) {
        candidateQueue = ['kokoro', 'system'];
      } else if (opts.engine === 'auto') {
        const hasGeminiKey = Boolean(opts.apiKey || this.getApiKey('gemini'));
        const hasElevenKey = Boolean(opts.apiKey || this.getApiKey('eleven'));

        if (hasGeminiKey && this._isEngineAvailable('gemini')) candidateQueue.push('gemini');
        if (hasElevenKey && this._isEngineAvailable('eleven')) candidateQueue.push('eleven');
        if (this._isEngineAvailable('edge')) candidateQueue.push('edge');
        if (this._isEngineAvailable('kokoro')) candidateQueue.push('kokoro');
        candidateQueue.push('system');
      } else if (opts.fallback && opts.allowCrossEngine === true) {
        // 다른 엔진으로 넘어가는 폴백은 호출자가 명시적으로 허용할 때만 (기본: 금지)
        candidateQueue = [opts.engine, ...allTiers.filter(e => e !== opts.engine)];
      } else {
        // [기본] 사용자가 선택한 엔진 단독 사용: 실패 시 다른 TTS가 끼어들지 않고 즉시 중단
        candidateQueue = [opts.engine];
      }

      const fallbackHistory = [];
      let lastError = null;

      for (let i = 0; i < candidateQueue.length; i++) {
        const currentTier = candidateQueue[i];
        if (isStale()) return canceledResult();

        if (opts.engine === 'auto' && !this._isEngineAvailable(currentTier)) {
          continue;
        }

        try {
          if (this.characterCanvas) this.characterCanvas.setState('SPEAKING');
          let tierResult = null;
          const tierOpts = Object.assign({}, opts, { playToken });

          switch (currentTier) {
            case 'gemini':
              tierResult = await this._speakGemini(text, tierOpts);
              break;
            case 'eleven':
              tierResult = await this._speakEleven(text, tierOpts);
              break;
            case 'edge':
              tierResult = await this._speakEdge(text, tierOpts);
              break;
            case 'kokoro':
              tierResult = await this._speakKokoro(text, tierOpts);
              break;
            case 'system':
              tierResult = await this._speakSystemTTS(text, tierOpts);
              break;
            default:
              throw new Error(`알 수 없는 TTS 엔진: ${currentTier}`);
          }
          if (isStale()) return canceledResult();

          if (opts.useCache && tierResult.blob) {
            const saveKey = this.cache.makeKey(opts.engine, opts.voice, text, opts.rate);
            this.cache.set(saveKey, tierResult.blob);
          }

          this._recordSuccess(currentTier);
          this.isPlaying = false;
          if (this.characterCanvas) {
            this.characterCanvas.setState('HAPPY');
            setTimeout(() => this.characterCanvas && this.characterCanvas.setState('IDLE'), 1200);
          }

          const finalResult = {
            ok: true,
            engine: currentTier,
            fallbackHistory,
            fromCache: false,
            ...tierResult
          };
          if (opts.onEnd) opts.onEnd(finalResult);
          return finalResult;

        } catch (tierErr) {
          // 사용자가 정지/다른 발화를 요청해 끊긴 경우: 실패로 보지 않고 조용히 종료 (다음 엔진 재생 금지)
          if (isStale() || (tierErr && tierErr.message === 'CANCELED')) return canceledResult();
          lastError = tierErr;
          this._recordFailure(currentTier, tierErr);

          const nextTier = candidateQueue[i + 1];
          const errReason = tierErr.message || String(tierErr);
          fallbackHistory.push({ from: currentTier, to: nextTier || 'none', reason: errReason });

          if (nextTier && opts.onFallback) {
            opts.onFallback(currentTier, nextTier, errReason);
          }
        }
      }

      if (isStale()) return canceledResult();
      // 선택 엔진 실패: 남아 있는 소리를 즉시 모두 끊는다 (다른 TTS로 대체 재생하지 않음)
      this.stop();
      this.isPlaying = false;
      if (this.characterCanvas) this.characterCanvas.setState('ERROR');
      const finalErr = lastError || new Error('All TTS cascade tiers failed.');
      if (opts.onError) opts.onError(finalErr);
      return { ok: false, error: finalErr.message || finalErr, fallbackHistory };
    }

    // -----------------------------------------------------------------------
    // 엔진 1. Gemini
    // -----------------------------------------------------------------------
        // -----------------------------------------------------------------------
    // 엔진 1. Google Gemini 3.8 Flash 실제 사람 신경망 음성 합성
    // -----------------------------------------------------------------------
    async _speakGemini(rawText, opts) {
      const apiKey = opts.apiKey || this.getApiKey('gemini') || (typeof localStorage !== 'undefined' ? (localStorage.getItem('gemini_voice_api_key') || localStorage.getItem('hangeoreum_gemini_key')) : '');
      if (!apiKey) throw new Error('Gemini API key is not configured.');

      if (typeof GeminiHumanVoiceEngine === 'undefined') {
        throw new Error('GeminiHumanVoiceEngine library is not loaded.');
      }

      if (!this.geminiEngine || this.geminiEngine.apiKey !== apiKey) {
        // blockMechanicalTts: Gemini 실패 시 브라우저 기계음으로 몰래 대체 재생하지 않음
        this.geminiEngine = new GeminiHumanVoiceEngine({ apiKey, blockMechanicalTts: true });
      }
      if (typeof this.geminiEngine.setBlockMechanicalTts === 'function') {
        this.geminiEngine.setBlockMechanicalTts(true);
      }

      const voiceId = (opts.voice && (opts.voice.startsWith('HUMAN_') || opts.voice.startsWith('ANIME_')))
        ? opts.voice : 'HUMAN_F1';

      const gLang = opts.lang || 'ko';

      if (this.characterCanvas) {
        this.characterCanvas.setState('SPEAKING');
      }

      return new Promise(async (resolve, reject) => {
        try {
          const success = await this.geminiEngine.speak(voiceId, rawText, gLang, (ok) => {
            if (this.characterCanvas) {
              this.characterCanvas.setState('IDLE');
              this.characterCanvas.setLipLevel(0);
            }
            if (ok) {
              resolve({ voice: voiceId, spokenText: rawText, mode: 'gemini-3.8-flash' });
            } else {
              reject(new Error(this.geminiEngine.lastError?.message || 'Gemini speech failed.'));
            }
          });
          if (!success && this.geminiEngine.lastError) {
            reject(new Error(this.geminiEngine.lastError.message));
          }
        } catch (err) {
          reject(err);
        }
      });
    }

    // -----------------------------------------------------------------------
    // 엔진 2. ElevenLabs
    // -----------------------------------------------------------------------
    async _speakEleven(rawText, opts) {
      const apiKey = opts.apiKey || this.getApiKey('eleven');
      if (!apiKey) throw new Error('ElevenLabs API key is not configured.');

      const voiceId = opts.voice || 'pNInz6obpgDQGcFmaJgB';
      let speechText = rawText;
      if (opts.translate && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(rawText)) {
        speechText = await translateText(rawText, 'en');
      }

      const models = ['eleven_multilingual_v2', 'eleven_turbo_v2_5'];
      let lastErr = null;

      for (const modelId of models) {
        if (opts.playToken !== undefined && opts.playToken !== this.currentPlayToken) throw new Error('CANCELED');
        let blob = null;
        try {
          const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: speechText,
              model_id: modelId,
              voice_settings: { stability: 0.5, similarity_boost: 0.8 }
            }),
            signal: AbortSignal.timeout(15000)
          });

          if (!resp.ok) {
            const errJson = await resp.json().catch(() => ({}));
            lastErr = errJson.detail?.message || `HTTP ${resp.status}`;
            continue;
          }
          blob = await resp.blob();
        } catch (e) {
          lastErr = e.message;
          continue;
        }
        // 합성 성공 후 재생: 재생 오류는 다른 모델로 재요청하지 않음 (같은 문장 중복 발화 방지)
        const audioUrl = URL.createObjectURL(blob);
        await this._playAudioUrl(audioUrl, opts.playToken);
        return { voice: voiceId, spokenText: speechText, blob, mode: modelId };
      }

      throw new Error(`ElevenLabs API failed: ${lastErr}`);
    }

    // -----------------------------------------------------------------------
    // 엔진 3. Edge Neural TTS
    //  - Android 앱: 네이티브 브리지(EdgeTtsClient.java)로 선택 목소리 직접 합성
    //  - PC/웹: 포터블 스튜디오 서버(/api/edge-tts, edge-tts 패키지)
    //  - 다른 TTS(구글 번역 음성·기기 TTS)로 몰래 대체하지 않는다
    // -----------------------------------------------------------------------
    static resolveEdgeVoice(voice, text) {
      const known = EDGE_VOICES.find(v => v.id === voice);
      let voiceKey = known ? voice : 'ko-KR-SunHiNeural';
      // 한국어 문장을 외국어 목소리로 읽으면 발음이 깨지므로, 같은 성별의 한국어 목소리로 매핑
      if (/[가-힣]/.test(text || '') && !voiceKey.startsWith('ko-KR-')) {
        voiceKey = (known && known.gender === 'male') ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural';
      }
      return voiceKey;
    }

    _edgeViaAndroid(text, voiceKey, rate) {
      return new Promise((resolve, reject) => {
        const id = ++nativeSeq;
        const timer = setTimeout(() => {
          if (NATIVE_WAITERS[id]) { delete NATIVE_WAITERS[id]; reject(new Error('Edge(Android) 응답 시간 초과')); }
        }, 15000);
        NATIVE_WAITERS[id] = {
          resolve: (b) => { clearTimeout(timer); resolve(b); },
          reject: (e) => { clearTimeout(timer); reject(e); }
        };
        if (typeof window !== 'undefined' && !window.OurVoiceNativeCallback) {
          window.OurVoiceNativeCallback = (cbId, data) => {
            const w = NATIVE_WAITERS[cbId];
            if (!w) return;
            delete NATIVE_WAITERS[cbId];
            if (!data || !data.ok || !data.audio) { w.reject(new Error((data && data.error) || 'Edge(Android) 합성 실패')); return; }
            const bin = atob(data.audio);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            w.resolve(new Blob([bytes], { type: 'audio/mpeg' }));
          };
        }
        try {
          const ratePct = Math.round(((rate || 1.0) - 1.0) * 100);
          const res = JSON.parse(window.Native.call('edgeTts', JSON.stringify({ id, text, voice: voiceKey, rate: ratePct })) || '{}');
          if (res.ok === false) { delete NATIVE_WAITERS[id]; clearTimeout(timer); reject(new Error(res.error || 'edgeTts 호출 실패')); }
        } catch (e) {
          delete NATIVE_WAITERS[id]; clearTimeout(timer); reject(e);
        }
      });
    }

    async _speakEdge(rawText, opts) {
      const voiceKey = OurVoiceMasterEngine.resolveEdgeVoice(opts.voice, rawText);
      let blob = null;
      let mode = '';
      let lastErr = 'Edge 합성 경로 없음';

      const hasNative = typeof window !== 'undefined' && window.Native && typeof window.Native.call === 'function';
      if (hasNative) {
        try {
          blob = await this._edgeViaAndroid(rawText, voiceKey, opts.rate);
          mode = 'edge-android-native';
        } catch (e) {
          if (e.message === 'CANCELED') throw e;
          lastErr = e.message;
        }
      }
      if (!blob) {
        const endpoints = [
          `${this.config.serverUrl}/api/edge-tts?voice=${encodeURIComponent(voiceKey)}&text=${encodeURIComponent(rawText)}`,
          `/api/edge-tts?voice=${encodeURIComponent(voiceKey)}&text=${encodeURIComponent(rawText)}`
        ];
        for (const url of endpoints) {
          try {
            const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (resp.ok) { blob = await resp.blob(); mode = 'edge-server-streaming'; break; }
            lastErr = `HTTP ${resp.status}`;
          } catch (e) { lastErr = e.message; }
        }
      }
      if (opts.playToken !== undefined && opts.playToken !== this.currentPlayToken) throw new Error('CANCELED');
      if (!blob) throw new Error(`Edge Neural 합성 실패 (${voiceKey}): ${lastErr}`);

      const audioUrl = URL.createObjectURL(blob);
      await this._playAudioUrl(audioUrl, opts.playToken);
      return { voice: voiceKey, spokenText: rawText, blob, mode };
    }

    // -----------------------------------------------------------------------
    // 엔진 4. Kokoro-82M
    // -----------------------------------------------------------------------
    async _speakKokoro(rawText, opts) {
      const voiceKey = (opts.voice && KOKORO_VOICES.some(v => v.id === opts.voice)) ? opts.voice : 'af_heart';
      const voiceInfo = KOKORO_VOICES.find(v => v.id === voiceKey) || KOKORO_VOICES[0];

      const isStale = () => opts.playToken !== undefined && opts.playToken !== this.currentPlayToken;

      // Kokoro는 영어 전용: 한글이 있으면 영어로 번역해 읽는다 (번역 실패 시 한글을 영어 발음기로 읽지 않고 실패 처리)
      let speechText = rawText;
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(rawText)) {
        speechText = await translateText(rawText, 'en');
        if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(speechText)) throw new Error('Kokoro: 영어 번역 실패 (Kokoro는 영어 전용)');
      }
      if (isStale()) throw new Error('CANCELED');

      const tts = await this._loadKokoro();
      if (isStale()) throw new Error('CANCELED');
      const audio = await tts.generate(speechText, { voice: voiceInfo.id, speed: opts.rate || 1.0 });
      if (isStale()) throw new Error('CANCELED');

      const blob = audio.toBlob();
      await this._playAudioUrl(URL.createObjectURL(blob), opts.playToken);
      return { voice: voiceKey, spokenText: speechText, blob, mode: 'kokoro-on-device' };
    }

    /** Kokoro 모델을 한 번만 불러와 재사용 (최초 1회 약 92MB 다운로드, 이후 브라우저 캐시) */
    _loadKokoro() {
      if (!OurVoiceMasterEngine._kokoroPromise) {
        // 진행 상황 콜백은 앱이 내보낸 인스턴스에 지정한다 (예: OurVoiceMasterEngine.onKokoroStatus = msg => ...)
        let last = '';
        const report = (msg) => { if (msg !== last && typeof this.onKokoroStatus === 'function') { last = msg; this.onKokoroStatus(msg); } };
        report('Kokoro 모델 준비 중... (최초 1회 약 92MB)');
        OurVoiceMasterEngine._kokoroPromise = import(KOKORO_JS_URL)
          .then(m => m.KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
            dtype: 'q8', device: 'wasm',
            progress_callback: (p) => { if (p && p.status === 'progress' && /onnx/.test(p.file || '')) report(`Kokoro 모델 내려받는 중 ${Math.round(p.progress || 0)}%`); }
          }))
          .then(tts => { report('Kokoro 준비 완료'); return tts; })
          .catch(e => { OurVoiceMasterEngine._kokoroPromise = null; report('Kokoro 모델 불러오기 실패'); throw e; });
      }
      return OurVoiceMasterEngine._kokoroPromise;
    }

    // -----------------------------------------------------------------------
    // 엔진 5. System TTS
    // -----------------------------------------------------------------------
    async _speakSystemTTS(rawText, opts) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        throw new Error('System Web Speech API is not supported.');
      }

      return new Promise((resolve, reject) => {
        const utter = new SpeechSynthesisUtterance(rawText);
        utter.rate = opts.rate || 1.0;
        utter.pitch = opts.pitch || 1.0;

        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.startsWith('ko'));
        if (koVoice) utter.voice = koVoice;

        utter.onstart = () => {
          if (this.characterCanvas) this.characterCanvas.setState('SPEAKING');
        };
        utter.onend = () => {
          if (this.characterCanvas) {
            this.characterCanvas.setState('HAPPY');
            setTimeout(() => this.characterCanvas && this.characterCanvas.setState('IDLE'), 1000);
          }
          resolve({ voice: utter.voice ? utter.voice.name : 'System Default', spokenText: rawText, mode: 'system-os-tts' });
        };
        utter.onerror = (e) => {
          if (this.characterCanvas) this.characterCanvas.setState('ERROR');
          reject(new Error(`System TTS failed: ${e.error || 'unknown'}`));
        };

        window.speechSynthesis.speak(utter);
      });
    }

    // Web Audio AnalyserNode 기반 60FPS 실시간 RMS 4단계 립싱크 분석 루프
    _startRMSAnalysis(audioEl) {
      this._stopRMSAnalysis();
      if (!this.characterCanvas || typeof AudioContext === 'undefined') return;

      try {
        if (!this.audioCtx) {
          const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const source = this.audioCtx.createMediaElementSource(audioEl);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const updateRMS = () => {
          if (!this.isPlaying || !this.analyser) {
            if (this.characterCanvas) this.characterCanvas.setLipLevel(0);
            return;
          }

          this.analyser.getByteTimeDomainData(dataArray);

          // RMS 음량 진폭 계산
          let sumSquares = 0.0;
          for (let i = 0; i < dataArray.length; i++) {
            const norm = (dataArray[i] - 128) / 128; // -1.0 ~ 1.0
            sumSquares += norm * norm;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length) * 2000;

          // 4단계 립싱크 매핑 (주헌법 제20조 5항 규격)
          let level = 0;
          if (rms < 250) level = 0;        // Level 0: CLOSED
          else if (rms < 800) level = 1;   // Level 1: SMALL
          else if (rms < 1600) level = 2;  // Level 2: MEDIUM
          else level = 3;                  // Level 3: WIDE

          if (this.characterCanvas) this.characterCanvas.setLipLevel(level);
          this.rmsFrameId = requestAnimationFrame(updateRMS);
        };

        this.rmsFrameId = requestAnimationFrame(updateRMS);
      } catch (e) {
        // AudioContext 연결 오류 시 립싱크 패스
      }
    }

    _stopRMSAnalysis() {
      if (this.rmsFrameId) {
        cancelAnimationFrame(this.rmsFrameId);
        this.rmsFrameId = null;
      }
      if (this.characterCanvas) {
        this.characterCanvas.setLipLevel(0);
      }
    }

    /**
     * 단일 오디오 재생 (동시에 하나만 존재)
     * - playToken이 바뀌면(정지·새 발화) 즉시 분리되고 CANCELED로 끝난다.
     * - 로딩 시간 초과·오류 시에도 오디오를 완전히 분리하여 '늦게 울리는 소리'를 원천 차단한다.
     */
    _playAudioUrl(url, playToken) {
      const token = (playToken === undefined) ? this.currentPlayToken : playToken;
      if (this.currentAudio) {
        this._detachAudio(this.currentAudio);
        this.currentAudio = null;
      }
      return new Promise((resolve, reject) => {
        if (token !== this.currentPlayToken) { reject(new Error('CANCELED')); return; }
        const audio = new Audio();
        if (/^https?:/i.test(url)) audio.crossOrigin = 'anonymous';
        this.currentAudio = audio;
        let settled = false;
        let startTimer = null;
        let endTimer = null;

        const finish = (err) => {
          if (settled) return;
          settled = true;
          clearTimeout(startTimer);
          clearTimeout(endTimer);
          if (this._pendingPlay === finish) this._pendingPlay = null;
          this._stopRMSAnalysis();
          if (this.currentAudio === audio) this.currentAudio = null;
          if (err) this._detachAudio(audio);
          if (url.startsWith('blob:')) { try { URL.revokeObjectURL(url); } catch (e) {} }
          if (err) reject(err); else resolve();
        };
        this._pendingPlay = finish;

        let started = false;
        audio.oncanplaythrough = () => {
          if (started) return;
          if (token !== this.currentPlayToken) { finish(new Error('CANCELED')); return; }
          started = true;
          this._startRMSAnalysis(audio);
          audio.play().then(() => {
            clearTimeout(startTimer);
            // 재생 시작 후 안전 종료 타이머: 실제 길이 + 3초 (재생 중간에 끊지 않음)
            const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 60;
            endTimer = setTimeout(() => finish(null), (dur / (audio.playbackRate || 1)) * 1000 + 3000);
          }).catch(e => finish(new Error(`오디오 재생 거부: ${e.message}`)));
        };
        audio.onended = () => finish(null);
        audio.onerror = () => finish(new Error(`Failed to load audio from: ${url.slice(0, 50)}...`));
        // 로딩 시간 초과: 오디오를 분리하므로 이후 늦게 로딩되어도 절대 소리 나지 않음
        startTimer = setTimeout(() => { if (!started) finish(new Error('Audio playback timeout')); }, 12000);

        audio.src = url;
        audio.load();
      });
    }
  }

  const defaultInstance = new OurVoiceMasterEngine();
  defaultInstance.EngineClass = OurVoiceMasterEngine;
  defaultInstance.Character2DCanvasRenderer = Character2DCanvasRenderer;
  defaultInstance.isOfflineCapable = () => true;
  defaultInstance.cache = audioCache;
  defaultInstance.ANIME_PRESETS = ANIME_PRESETS;
  defaultInstance.VOICES = {
    edge: EDGE_VOICES,
    eleven: ELEVEN_VOICES,
    kokoro: KOKORO_VOICES,
    gemini: GEMINI_VOICE_CATALOG,
    anime_presets: ANIME_PRESETS
  };
  defaultInstance.translate = translateText;

  return defaultInstance;
}));
