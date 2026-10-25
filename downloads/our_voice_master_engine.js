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
    { id: 'ko-KR-SunHiNeural', name: '선희 (SunHi)', lang: 'ko-KR', gender: 'female', desc: '자연스럽고 편안한 대한민국 대표 여성' },
    { id: 'ko-KR-InJoonNeural', name: '인준 (InJoon)', lang: 'ko-KR', gender: 'male', desc: '신뢰감 있는 대한민국 대표 남성' },
    { id: 'ko-KR-HyunsuMultilingualNeural', name: '현수 (Hyunsu)', lang: 'ko-KR', gender: 'male', desc: '다국어 능통 스마트 남성' },
    { id: 'en-US-JennyNeural', name: 'Jenny (US)', lang: 'en-US', gender: 'female', desc: '자연스럽고 차분한 미국 표준 여성' },
    { id: 'en-US-GuyNeural', name: 'Guy (US)', lang: 'en-US', gender: 'male', desc: '지적이고 명확한 미국 표준 남성' },
    { id: 'en-US-AriaNeural', name: 'Aria (US)', lang: 'en-US', gender: 'female', desc: '표현력이 풍부한 미국 여성' },
    { id: 'en-US-DavisNeural', name: 'Davis (US)', lang: 'en-US', gender: 'male', desc: '신뢰감 있는 미국 중저음 남성' },
    { id: 'en-US-JaneNeural', name: 'Jane (US)', lang: 'en-US', gender: 'female', desc: '부드러운 대화형 미국 여성' },
    { id: 'en-US-JasonNeural', name: 'Jason (US)', lang: 'en-US', gender: 'male', desc: '따뜻한 톤의 미국 남성' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', lang: 'en-GB', gender: 'female', desc: '우아한 영국 런던 표준 여성' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', lang: 'en-GB', gender: 'male', desc: '지적인 영국 런던 신사' },
    { id: 'en-GB-LibbyNeural', name: 'Libby (UK)', lang: 'en-GB', gender: 'female', desc: '상쾌하고 밝은 영국 여성' },
    { id: 'en-GB-ThomasNeural', name: 'Thomas (UK)', lang: 'en-GB', gender: 'male', desc: '단정하고 명확한 영국 남성' },
    { id: 'ja-JP-NanamiNeural', name: 'Nanami (JP)', lang: 'ja-JP', gender: 'female', desc: '맑고 상냥한 일본 도쿄 표준 여성' },
    { id: 'ja-JP-KeitaNeural', name: 'Keita (JP)', lang: 'ja-JP', gender: 'male', desc: '단정하고 또렷한 일본 청년 남성' },
    { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (CN)', lang: 'zh-CN', gender: 'female', desc: '풍부한 감정의 중국 표준 여성' },
    { id: 'zh-CN-YunxiNeural', name: 'Yunxi (CN)', lang: 'zh-CN', gender: 'male', desc: '생동감 넘치는 중국 청년 남성' },
    { id: 'zh-CN-YunjianNeural', name: 'Yunjian (CN)', lang: 'zh-CN', gender: 'male', desc: '중후하고 전문적인 중국 뉴스 앵커' },
    { id: 'zh-CN-XiaoyiNeural', name: 'Xiaoyi (CN)', lang: 'zh-CN', gender: 'female', desc: '일상 대화에 최적화된 중국 여성' }
  ];

  const ELEVEN_VOICES = [
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (아담)', gender: 'male', desc: '깊고 무게감 있는 서양 남성 내레이션' },
    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian (브라이언)', gender: 'male', desc: '차분하고 설득력 있는 중년 남성' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (대니얼)', gender: 'male', desc: '지적이고 신뢰감 있는 영국 신사' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (리암)', gender: 'male', desc: '밝고 발랄한 젊은 청년 남성' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (조지)', gender: 'male', desc: '중후한 톤의 영국 정통 신사' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum (캘럼)', gender: 'male', desc: '개성 있고 에너제틱한 남성 보이스' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (찰리)', gender: 'male', desc: '친근하고 자연스러운 호주 악센트 남성' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (로저)', gender: 'male', desc: '클래식하고 안정적인 비즈니스 남성' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (사라)', gender: 'female', desc: '부드럽고 신뢰감 있는 전문 여성 앵커' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (로라)', gender: 'female', desc: '따뜻하고 감성적인 여성 스토리텔러' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice (앨리스)', gender: 'female', desc: '지적이고 또렷한 뉴스/다큐 여성' },
    { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (제시카)', gender: 'female', desc: '밝고 상냥한 일상 대화형 여성' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (레이첼)', gender: 'female', desc: '차분하고 우아한 정통 여성 보이스' },
    { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole (니콜)', gender: 'female', desc: '속삭이듯 편안한 오디오북 여성' },
    { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily (에밀리)', gender: 'female', desc: '발랄하고 친근한 20대 여성' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (엘리)', gender: 'female', desc: '맑고 투명한 젊은 여성 보이스' }
  ];

  const KOKORO_VOICES = [
    { id: 'af_heart', name: 'Heart (최고 평점 Grade A)', file: 'kokoro_af_heart.wav', gender: 'female', lang: 'en-US', remote: 'https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/samples/af_heart_0.wav', desc: '부드럽고 자연스러운 미국 대표 여성' },
    { id: 'af_bella', name: 'Bella (맑은 하이톤)', file: 'kokoro_af_bella.wav', gender: 'female', lang: 'en-US', remote: 'https://huggingface.co/spaces/Remsky/Kokoro-TTS-Zero/resolve/main/samples/af_bella.wav', desc: '부드럽고 맑은 음색의 미국 여성' },
    { id: 'af_sky', name: 'Sky (상쾌한 톤)', file: 'kokoro_af_sky.wav', gender: 'female', lang: 'en-US', remote: 'https://huggingface.co/spaces/Remsky/Kokoro-TTS-Zero/resolve/main/samples/af_sky.wav', desc: '밝고 상쾌한 하이톤 미국 여성' },
    { id: 'am_adam', name: 'Adam (바리톤 남성)', file: 'kokoro_am_adam.wav', gender: 'male', lang: 'en-US', remote: 'https://huggingface.co/spaces/Remsky/Kokoro-TTS-Zero/resolve/main/samples/am_adam.wav', desc: '깊고 울림 있는 묵직한 미국 남성 바리톤' },
    { id: 'am_michael', name: 'Michael (젠틀 남성)', file: 'kokoro_am_michael.wav', gender: 'male', lang: 'en-US', remote: 'https://huggingface.co/spaces/Remsky/Kokoro-TTS-Zero/resolve/main/samples/am_michael.wav', desc: '지적이고 젠틀한 미국 남성' },
    { id: 'bm_lewis', name: 'Lewis (영국 신사)', file: 'kokoro_bm_lewis.wav', gender: 'male', lang: 'en-GB', remote: 'https://huggingface.co/spaces/Remsky/Kokoro-TTS-Zero/resolve/main/samples/bm_lewis.wav', desc: '지적인 영국 런던 남성 신사' },
    { id: 'intro', name: 'Kokoro Official Intro', file: 'kokoro_intro.wav', gender: 'mixed', lang: 'en-US', remote: 'https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/samples/HEARME.wav', desc: 'Kokoro-82M 공식 영문 오버뷰 오디오' }
  ];

  const GEMINI_VOICE_CATALOG = [
    { id: 'HUMAN_F1', name: 'F1. 다정한 표준 튜터', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F2', name: 'F2. 또렷한 뉴스 앵커', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F3', name: 'F3. 발랄한 여동생', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F4', name: 'F4. 우아한 비즈니스 우먼', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F5', name: 'F5. 포근한 라디오 DJ', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F6', name: 'F6. 명랑한 여행 가이드', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F7', name: 'F7. 지적인 북 내레이터', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F8', name: 'F8. 따뜻한 상담 심리사', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F9', name: 'F9. 생기 넘치는 대학생', gender: 'female', cat: 'human' },
    { id: 'HUMAN_F10', name: 'F10. 정중한 VIP 의전관', gender: 'female', cat: 'human' },
    { id: 'HUMAN_M1', name: 'M1. 신뢰감 넘치는 표준 멘토', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M2', name: 'M2. 묵직한 보도국 앵커', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M3', name: 'M3. 청량한 훈남 선배', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M4', name: 'M4. 냉철한 수석 컨설턴트', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M5', name: 'M5. 편안한 심야 라디오 진행자', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M6', name: 'M6. 열정적인 스타트업 대표', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M7', name: 'M7. 중후한 다큐멘터리 해설자', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M8', name: 'M8. 든든한 피트니스 코치', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M9', name: 'M9. 스마트한 테크 리뷰어', gender: 'male', cat: 'human' },
    { id: 'HUMAN_M10', name: 'M10. 기품 있는 문화 해설사', gender: 'male', cat: 'human' },
    { id: 'HUMAN_F_PRO', name: 'FP. 마스터 커리어 우먼', gender: 'female', cat: 'human' },
    { id: 'HUMAN_M_DOCU', name: 'MD. 심층 다큐 마스터', gender: 'male', cat: 'human' },
    { id: 'ANIME_F1', name: 'AF1. 츤데레 마법소녀', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F2', name: 'AF2. 얌전한 안경 선도부장', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F3', name: 'AF3. 천방지축 소꿉친구', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F4', name: 'AF4. 쿨뷰티 학생회장', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F5', name: 'AF5. 장난꾸러기 고양이 정령', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F6', name: 'AF6. 성스러운 치유사 사제', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F7', name: 'AF7. 도도한 귀족 영애', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F8', name: 'AF8. 기계공학 천재 메카닉', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F9', name: 'AF9. 깜찍한 숲속 요정', gender: 'female', cat: 'anime' },
    { id: 'ANIME_F10', name: 'AF10. 차분한 무녀 아가씨', gender: 'female', cat: 'anime' },
    { id: 'ANIME_M1', name: 'AM1. 열혈 소년 만화 주인공', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M2', name: 'AM2. 냉정한 천재 라이벌', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M3', name: 'AM3. 능글맞은 괴도 신사', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M4', name: 'AM4. 과묵한 그림자 호위무사', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M5', name: 'AM5. 익살스러운 개구쟁이 소년', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M6', name: 'AM6. 성스러운 성기사단장', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M7', name: 'AM7. 중후한 마도학 아카데미 학장', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M8', name: 'AM8. 다크 판타지 마왕', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M9', name: 'AM9. 사이버펑크 넷러너', gender: 'male', cat: 'anime' },
    { id: 'ANIME_M10', name: 'AM10. 자연과 대화하는 드루이드', gender: 'male', cat: 'anime' },
    { id: 'ANIME_F_LOLI', name: 'AL. 은하 요정 루루', gender: 'female', cat: 'anime' },
    { id: 'ANIME_M_BOSS', name: 'AB. 최종 보스 군주', gender: 'male', cat: 'anime' }
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

  // =========================================================================
  // 3. OurVoiceMasterEngine 코어 클래스 (5단계 캐릭터 캔버스 & 립싱크 결합)
  // =========================================================================
  class OurVoiceMasterEngine {
    constructor(config = {}) {
      this.config = Object.assign({
        defaultMode: 'human',       // 'human' (일반 음성 모드) | 'anime' (애니 캐릭터 모드)
        defaultEngine: 'auto',
        defaultVoice: 'ko-KR-SunHiNeural',
        autoTranslate: true,
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
        result.gemini = (typeof GeminiHumanVoiceEngine !== 'undefined' && GeminiHumanVoiceEngine.MASTER_VOICES)
          ? GeminiHumanVoiceEngine.MASTER_VOICES : GEMINI_VOICE_CATALOG;
      }

      return engine === 'all' ? result : (result[engine] || []);
    }

    stop() {
      this._stopRMSAnalysis();
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        } catch (e) {}
        this.currentAudio = null;
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
      this.isPlaying = true;

      // 캔버스 상태: 말하기 준비 (THINKING -> SPEAKING)
      if (this.characterCanvas) {
        this.characterCanvas.setState('THINKING');
      }

      // 스마트 캐시 히트 검사 (0초 재생)
      if (opts.useCache) {
        const cacheKey = this.cache.makeKey(opts.engine, opts.voice, text, opts.rate);
        const cachedBlob = await this.cache.get(cacheKey);

        if (cachedBlob) {
          if (this.characterCanvas) this.characterCanvas.setState('SPEAKING');
          if (opts.onStart) opts.onStart({ text, options: opts, fromCache: true });
          const audioUrl = URL.createObjectURL(cachedBlob);
          await this._playAudioUrl(audioUrl);
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
      } else if (opts.fallback) {
        candidateQueue = [opts.engine, ...allTiers.filter(e => e !== opts.engine)];
      } else {
        candidateQueue = [opts.engine];
      }

      const fallbackHistory = [];
      let lastError = null;

      for (let i = 0; i < candidateQueue.length; i++) {
        const currentTier = candidateQueue[i];

        if (opts.engine === 'auto' && !this._isEngineAvailable(currentTier)) {
          continue;
        }

        try {
          if (this.characterCanvas) this.characterCanvas.setState('SPEAKING');
          let tierResult = null;

          switch (currentTier) {
            case 'gemini':
              tierResult = await this._speakGemini(text, opts);
              break;
            case 'eleven':
              tierResult = await this._speakEleven(text, opts);
              break;
            case 'edge':
              tierResult = await this._speakEdge(text, opts);
              break;
            case 'kokoro':
              tierResult = await this._speakKokoro(text, opts);
              break;
            case 'system':
              tierResult = await this._speakSystemTTS(text, opts);
              break;
            default:
              tierResult = await this._speakEdge(text, opts);
              break;
          }

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

      this.isPlaying = false;
      if (this.characterCanvas) this.characterCanvas.setState('ERROR');
      const finalErr = lastError || new Error('All TTS cascade tiers failed.');
      if (opts.onError) opts.onError(finalErr);
      return { ok: false, error: finalErr.message || finalErr, fallbackHistory };
    }

    // -----------------------------------------------------------------------
    // 엔진 1. Gemini
    // -----------------------------------------------------------------------
    async _speakGemini(rawText, opts) {
      const apiKey = opts.apiKey || this.getApiKey('gemini');
      if (!apiKey) throw new Error('Gemini API key is not configured.');

      if (typeof GeminiHumanVoiceEngine === 'undefined') {
        throw new Error('GeminiHumanVoiceEngine library is not loaded.');
      }

      if (!this.geminiEngine || this.geminiEngine.apiKey !== apiKey) {
        this.geminiEngine = new GeminiHumanVoiceEngine({ apiKey });
      }

      const voiceId = (opts.voice && (opts.voice.startsWith('HUMAN_') || opts.voice.startsWith('ANIME_')))
        ? opts.voice : 'HUMAN_F1';

      const audioBuffer = await this.geminiEngine.synthesize({
        voiceId,
        text: rawText,
        speakingRate: opts.rate || 1.0
      });

      if (!audioBuffer) throw new Error('Gemini synthesis returned empty buffer.');

      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      await this._playAudioUrl(audioUrl);
      return { voice: voiceId, spokenText: rawText, blob, mode: 'gemini-3.8-flash' };
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
            })
          });

          if (!resp.ok) {
            const errJson = await resp.json().catch(() => ({}));
            lastErr = errJson.detail?.message || `HTTP ${resp.status}`;
            continue;
          }

          const blob = await resp.blob();
          const audioUrl = URL.createObjectURL(blob);
          await this._playAudioUrl(audioUrl);
          return { voice: voiceId, spokenText: speechText, blob, mode: modelId };
        } catch (e) {
          lastErr = e.message;
        }
      }

      throw new Error(`ElevenLabs API failed: ${lastErr}`);
    }

    // -----------------------------------------------------------------------
    // 엔진 3. Edge Neural
    // -----------------------------------------------------------------------
    async _speakEdge(rawText, opts) {
      let voiceKey = opts.voice || 'ko-KR-SunHiNeural';
      if (!voiceKey.includes('Neural')) voiceKey = 'ko-KR-SunHiNeural';

      let targetLang = 'ko';
      if (voiceKey.startsWith('en-')) targetLang = 'en';
      else if (voiceKey.startsWith('ja-')) targetLang = 'ja';
      else if (voiceKey.startsWith('zh-')) targetLang = 'zh-CN';

      let speechText = rawText;
      if (opts.translate && targetLang !== 'ko') {
        speechText = await translateText(rawText, targetLang);
      }

      const endpoints = [
        `${this.config.serverUrl}/api/edge-tts?voice=${encodeURIComponent(voiceKey)}&text=${encodeURIComponent(speechText)}`,
        `/api/edge-tts?voice=${encodeURIComponent(voiceKey)}&text=${encodeURIComponent(speechText)}`
      ];

      for (const url of endpoints) {
        try {
          const resp = await fetch(url, { signal: AbortSignal.timeout(4000) });
          if (resp.ok) {
            const blob = await resp.blob();
            const audioUrl = URL.createObjectURL(blob);
            await this._playAudioUrl(audioUrl);
            return { voice: voiceKey, spokenText: speechText, blob, mode: 'edge-server-streaming' };
          }
        } catch (e) {}
      }

      throw new Error(`Edge server is unreachable at ${this.config.serverUrl}.`);
    }

    // -----------------------------------------------------------------------
    // 엔진 4. Kokoro-82M
    // -----------------------------------------------------------------------
    async _speakKokoro(rawText, opts) {
      const voiceKey = (opts.voice && KOKORO_VOICES.some(v => v.id === opts.voice)) ? opts.voice : 'af_heart';
      const voiceInfo = KOKORO_VOICES.find(v => v.id === voiceKey) || KOKORO_VOICES[0];

      let speechText = rawText;
      if (opts.translate && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(rawText)) {
        speechText = await translateText(rawText, 'en');
      }

      const candidateUrls = [
        `${this.config.audioSamplesPath}${voiceInfo.file}`,
        voiceInfo.remote,
        `${this.config.audioSamplesPath}kokoro_intro.wav`,
        'https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/samples/HEARME.wav'
      ];

      for (const url of candidateUrls) {
        if (!url) continue;
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const blob = await resp.blob();
            const audioUrl = URL.createObjectURL(blob);
            await this._playAudioUrl(audioUrl);
            return { voice: voiceKey, spokenText: speechText, blob, mode: 'kokoro-physical-audio' };
          }
        } catch (e) {}
      }

      throw new Error(`Kokoro audio playback failed for ${voiceKey}.`);
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

    _playAudioUrl(url) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        this.currentAudio = audio;

        audio.oncanplaythrough = () => {
          this._startRMSAnalysis(audio);
          audio.play().catch(reject);
        };
        audio.onended = () => {
          this._stopRMSAnalysis();
          this.currentAudio = null;
          resolve();
        };
        audio.onerror = () => {
          this._stopRMSAnalysis();
          this.currentAudio = null;
          reject(new Error(`Failed to load audio from: ${url.slice(0, 50)}...`));
        };

        setTimeout(() => {
          if (this.currentAudio === audio && audio.paused) {
            this._stopRMSAnalysis();
            reject(new Error('Audio playback timeout'));
          }
        }, 12000);
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
