/* 한걸음 음성 입력 공통층 (HGVOICE)
   1) 안드로이드 WebView에는 브라우저 음성인식이 없으므로, 기기 음성인식(Native.call('sttStart'))을
      SpeechRecognition과 같은 모양으로 감싸서 제공한다.
   2) 앱의 모든 음성인식(수업·롤플레잉·입문 문자)을 한 곳에서 감싸서
      - 마이크를 여는 순간 → 입력 알림음 1번 (알림음이 끝난 뒤 실제 인식 시작)
      - 사용자 입력이 끝나 최종 결과가 확정된 순간(final result) → 입력완료음 1번
      을 확실하게 울린다. 각 화면 코드는 효과음을 따로 울리지 않는다.
   3) 모든 강의 공통 판정 타이밍 (옵빠야 지시 2026-10-26)
      - 마이크가 켜진 뒤 NO_INPUT_MS(4초) 안에 말이 시작되지 않으면 → 'no-speech' = 인식 불가
        (각 화면이 기존대로 AI 시범 → 다시 입력을 반복하며, 발음 오답으로 단정하지 않는다)
      - 말이 시작되면 자연스러운 말 끝을 기다리되, 문자/따라 읽기/자유 회화별 종료 상한을 둔다
      - 말이 끝나는 순간 바로 평가로 넘긴다: 최종 결과를 FINAL_GRACE_MS까지만 기다리고,
        그때까지 안 오면 마지막 중간 결과로 즉시 판정한다
   4) 불필요한 마이크 켜짐 방지 (2026-10-26)
      - 기기 인식 세션마다 번호(sid)를 붙여, 앞서 멈춘 세션의 늦은 end/error가 새 세션을 끝내지 못하게 한다
        (전에는 이 때문에 새로 켠 마이크가 바로 꺼져 "입력을 잘 못 받는" 현상이 났다)
      - 문자표·설정 등 창이 떠 있거나 앱이 뒤로 가 있으면 마이크를 켜지 않고 기다렸다가, 닫히면 그때 켠다
      - 알림음이 마이크에 녹음돼 말 시작으로 잘못 잡히지 않게, 알림음을 먼저 울리고 끝난 뒤 마이크를 연다 */
(function () {
  const NO_INPUT_MS = 4000;     // 말 시작 대기. 무입력은 오답이 아니라 다시 듣기 안내.
  // 말 끝 → 최종 결과 대기 상한 (넘으면 중간 결과로 판정). 300ms였을 때 기기 인식기의 중간 결과가 말 뒷부분이
  // 빠진 채로 판정돼 '잘 못 알아듣는' 원인이 됐다 → 최종 결과가 보통 도착하는 800ms까지 기다린다 (2026-10-26)
  const FINAL_GRACE_MS = 800;
  const TAIL_LIMIT_MS = 1500;   // 말 끝 뒤 최종/중간 결과가 없으면 판정 불가로 종료
  const CUE_GAP_MS = 260;       // 입력 알림음(약 0.2초)이 끝난 뒤 마이크를 연다
  // 글자 하나·짧은 소리(목표 3자 이하)는 말 시작 후 이 시간만 듣고 바로 결과를 낸다. 주변 소음이 있으면 인식기가
  // 말 끝을 못 잡아 8초 넘게 듣다가 '못 알아들음'으로 끝났다 (실기기 2026-10-26: '베' 한 번에 8초·no-match)
  const SHORT_SPEECH_MS = 2500;
  const GATE_POLL_MS = 300;     // 마이크를 막는 창이 열리고 닫히는지 확인하는 간격

  const hasNative = () => !!(window.Native && typeof window.Native.call === 'function');

  /* ---------- 폰 안(온디바이스) 인식팩 (2026-10-27) ----------
     한 글자 카드는 폰 안 인식팩이 있으면 그쪽으로 듣는다(MainActivity letterOnDevice). 무료, 구글이 받아 준다.
     state: { installed:[...소문자 locale], supported:[...], busy:lang|'' } — 바뀌면 'hg-stt-pack' 이벤트 */
  const PACK = { installed: [], supported: [], known: false, busy: '' };
  window.HGSttModel = (o) => {
    if (!o) return;
    if (Array.isArray(o.installed)) PACK.installed = o.installed.map(s => String(s).toLowerCase());
    if (Array.isArray(o.supported)) PACK.supported = o.supported.map(s => String(s).toLowerCase());
    PACK.known = !o.error || PACK.known;
    if (PACK.busy && PACK.installed.includes(PACK.busy)) PACK.busy = '';
    try { window.dispatchEvent(new CustomEvent('hg-stt-pack', { detail: o })); } catch (e) { /* 무시 */ }
  };
  const packAsk = (lang, download) => { try { window.Native.call('sttModelDownload', JSON.stringify({ lang, download })); } catch (e) { /* 구버전 앱 */ } };
  // 앱 언어 → 폰 안 인식팩 언어 (중국어는 폰 안 인식기가 zh-CN 대신 cmn-Hans-CN을 쓴다)
  const PACK_LANG = { fr: 'fr-FR', es: 'es-ES', ru: 'ru-RU', cn: 'cmn-Hans-CN', en: 'en-US', ja: 'ja-JP' };
  window.HGSTTPACK = {
    langOf: (app) => PACK_LANG[app] || '',
    has: (lang) => PACK.installed.includes(String(lang).toLowerCase()),
    // 받을 수 있는데 아직 없음 (상태를 모르면 false → 안내하지 않는다)
    missing: (lang) => hasNative() && PACK.known && PACK.supported.includes(String(lang).toLowerCase()) && !PACK.installed.includes(String(lang).toLowerCase()),
    busy: () => PACK.busy,
    get(lang) {
      if (!hasNative() || PACK.busy) return;
      PACK.busy = String(lang).toLowerCase();
      packAsk(lang, true);
      // 다운로드는 조용히 진행된다 → 몇 초마다 다시 확인 (최대 3분)
      let n = 0;
      const t = setInterval(() => {
        if (!PACK.busy || ++n > 36) { clearInterval(t); if (PACK.busy) { PACK.busy = ''; window.HGSttModel({}); } return; }
        packAsk(lang, false);
      }, 5000);
    },
    refresh: (lang) => { if (hasNative()) packAsk(lang || 'fr-FR', false); },
  };
  if (hasNative()) {
    setTimeout(() => packAsk('fr-FR', false), 1500);   // 받아진 언어 목록은 언어와 무관하게 한 번에 온다
    // fr·es·ru·cn(10-28부터 en·ja도)을 고르면(또는 그 언어로 앱을 열면) 팩이 없을 때 바로 받는다 (옵빠야 지시 2026-10-27). 언어마다 한 번만 요청
    const asked = new Set();
    setInterval(() => {
      const lang = PACK_LANG[window.selectedLang];
      if (!lang || asked.has(lang) || !PACK.known || PACK.busy) return;
      asked.add(lang);
      if (window.HGSTTPACK.missing(lang)) window.HGSTTPACK.get(lang);
    }, 3000);
  }

  /* ---------- 마이크를 켜면 안 되는 때 ---------- */
  let appPaused = false;
  const shown = (el) => !!(el && el.getClientRects().length);
  function micBlocked() {
    if (appPaused || document.hidden) return 'background';
    if (window.HGUI && HGUI.route() !== 'lesson') return 'navigation';
    if (document.querySelector('.hgl-ov')) return 'letters';          // 문자표 화면이 덮고 있음
    if (document.getElementById('hgVoiceLog')) return 'log';          // 마이크 진단 기록을 보는 중
    if (shown(document.getElementById('hgCelebrate'))) return 'celebrate';   // 축하 카드가 떠 있는 동안
    for (const m of document.querySelectorAll('.modal-backdrop')) {   // 설정·종료 확인 등 창
      if (!m.classList.contains('hidden') && shown(m)) return 'modal';
    }
    return '';
  }

  /* ---------- 기기 음성인식 → SpeechRecognition 모양 ---------- */
  let nativeActive = null;
  let nativeSeq = 0;
  class NativeSpeechRecognition extends EventTarget {
    constructor() {
      super();
      this.lang = 'en-US';
      this.continuous = false;
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.onstart = this.onresult = this.onerror = this.onend = this.onspeechstart = this.onspeechend = null;
    }
    _fire(type, props) {
      const ev = new Event(type);
      Object.assign(ev, props || {});
      try { if (typeof this['on' + type] === 'function') this['on' + type](ev); } catch (e) { console.warn(e); }
      this.dispatchEvent(ev);
    }
    start() {
      if (nativeActive && nativeActive !== this) nativeActive.abort();
      nativeActive = this;
      this._sid = String(++nativeSeq);
      let lab = '';   // 진단 전용 인식기 설정(MainActivity sttLab). 평소엔 비어 있어 기존 동작
      try { lab = localStorage.getItem('hg_stt_lab') || ''; } catch (e) { /* 저장 불가 */ }
      try { window.Native.call('sttStart', JSON.stringify({ lang: this.lang, sid: this._sid, hints: this.hints || [], shortUtterance: !!this.shortUtterance, lab, letterOnDevice: !!this.letterOnDevice })); }
      catch (e) { this._fire('error', { error: 'aborted' }); this._fire('end'); nativeActive = null; }
    }
    stop() { this.abort(); }
    // 그만 듣고 지금까지 들은 소리로 결과를 내게 한다 (abort와 달리 result/error가 온다)
    finish() {
      if (nativeActive !== this) return;
      try { window.Native.call('sttFinish', JSON.stringify({ sid: this._sid })); } catch (e) { /* 무시 */ }
    }
    abort() {
      if (nativeActive !== this) return;
      nativeActive = null;
      try { window.Native.call('sttStop', JSON.stringify({ sid: this._sid })); } catch (e) { /* 무시 */ }
    }
  }
  const toResults = (alts, max, isFinal) => {
    const list = (alts || []).slice(0, Math.max(1, max || 1)).map(t => ({ transcript: String(t || ''), confidence: 0.9 }));
    if (!list.length) list.push({ transcript: '', confidence: 0 });
    return [Object.assign(list, { isFinal })];
  };
  // MainActivity가 보내는 이벤트: {type:'start'|'speechstart'|'partial'|'speechend'|'result'|'error'|'end', sid, alts:[...], error}
  // 앱이 뒤로 가거나 돌아오면 {type:'paused'|'resumed'}
  window.HGNativeStt = function (evt) {
    if (!evt) return;
    if (evt.type === 'paused') { appPaused = true; return; }
    if (evt.type === 'resumed') { appPaused = false; return; }
    const r = nativeActive;
    if (!r || (evt.sid && evt.sid !== r._sid)) return;   // 이미 멈춘 세션의 늦은 알림은 버린다
    if (evt.type === 'start') r._fire('start');
    else if (evt.type === 'speechstart') r._fire('speechstart');
    else if (evt.type === 'speechend') r._fire('speechend');
    else if (evt.type === 'partial') r._fire('result', { resultIndex: 0, results: toResults(evt.alts, r.maxAlternatives, false) });
    else if (evt.type === 'result') r._fire('result', { resultIndex: 0, results: toResults(evt.alts, r.maxAlternatives, true) });
    else if (evt.type === 'error') r._fire('error', { error: evt.error || 'aborted' });
    else if (evt.type === 'end') { nativeActive = null; r._fire('end'); }
  };

  /* ---------- 입력 알림음 / 입력완료음 ---------- */
  function beep(freqs) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = (typeof getAudioContext === 'function') ? getAudioContext() : new AC();
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.12;
        o.frequency.value = f; o.type = 'sine';
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.2);
      });
    } catch (e) { /* 소리 장치 없음 */ }
  }
  function cue(kind) {
    if (kind === 'listen') {
      if (typeof soundMicStart === 'function') soundMicStart(); else beep([660, 990]);
    } else {
      if (typeof soundMicEnd === 'function') soundMicEnd(); else beep([990, 660]);
    }
    try { window.dispatchEvent(new CustomEvent('hg-voice-cue', { detail: kind })); } catch (e) { /* 무시 */ }
  }

  /* ---------- 모든 음성인식 감싸기: 화면 코드에는 기존과 같은 모양으로 보인다 ---------- */
  // 앱(Native 브리지)에서는 항상 기기 음성인식을 쓴다. Android WebView 155부터 webkitSpeechRecognition이 생겨서
  // 그쪽이 먼저 잡히면 무음 대기·후보 5개·목표 힌트·세션 번호 보호가 모두 빠진 채로 듣게 된다 (실기기 2026-10-26)
  const Base = hasNative() ? NativeSpeechRecognition : (window.SpeechRecognition || window.webkitSpeechRecognition || null);
  if (!Base) return;

  const plainResult = (res) => {
    // 브라우저 결과 객체를 화면 코드가 쓰는 모양(results[0][i].transcript)의 일반 배열로 바꾼다
    const alts = Array.from(res || []).map(a => ({ transcript: String(a && a.transcript || ''), confidence: a && a.confidence || 0 }));
    if (!alts.length) alts.push({ transcript: '', confidence: 0 });
    return { resultIndex: 0, results: [Object.assign(alts, { isFinal: true })] };
  };
  const hasText = (res) => !!(res && res[0] && String(res[0].transcript || '').trim());

  class HGSpeechRecognition {
    constructor() {
      this.lang = 'en-US';
      this.continuous = false;
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.onstart = this.onresult = this.onerror = this.onend = this.onspeechend = null;
      this._s = null;
    }
    _emit(type, props) {
      const ev = new Event(type);
      Object.assign(ev, props || {});
      try { if (typeof this['on' + type] === 'function') this['on' + type].call(this, ev); } catch (e) { console.warn(e); }
    }
    // 화면 코드에는 start() 한 번 = 판정(result/error) 한 번 + end 한 번으로 보인다.
    // 그 사이 마이크를 막는 창이 열리면 실제 인식기는 조용히 닫았다가, 창이 닫히면 알림음부터 다시 연다.
    start() {
      this._quiet();
      const s = this._s = { t0: Date.now(), done: false, ended: false, started: false, began: false, partial: null, timers: [], r: null, opening: 0, seq: 0, poll: null };
      s.poll = setInterval(() => this._gate(), GATE_POLL_MS);
      this._gate();
    }
    _gate() {
      const s = this._s;
      if (!s || s.done) return;
      const blocked = !!micBlocked();
      if (blocked && (s.r || s.opening)) this._suspend();
      else if (!blocked && !s.r && !s.opening) this._open();
    }
    _clearTimers() { const s = this._s; s.timers.forEach(clearTimeout); s.timers = []; }
    _suspend() {
      const s = this._s;
      this._clearTimers();
      s.seq++; s.opening = 0;
      const r = s.r; s.r = null;
      s.began = false; s.partial = null;          // 다시 열면 무입력 대기도 새로 시작한다
      if (r) { try { r.abort(); } catch (e) { /* 이미 끝남 */ } }
    }
    _open() {
      const s = this._s;
      const seq = ++s.seq;
      s.opening = seq;
      cue('listen');                                 // 알림음 먼저 → 끝난 뒤 마이크 (알림음이 말 시작으로 잡히지 않게)
      setTimeout(() => {
        if (s.done || s.seq !== seq) return;
        s.opening = 0;
        if (micBlocked()) return;                    // 그사이 창이 열림 → 다음 확인 때 다시
        this._listen(seq);
      }, CUE_GAP_MS);
    }
    _finish(kind, payload) {
      const s = this._s;
      if (!s || s.done) return;
      s.done = true;
      clearInterval(s.poll);
      this._clearTimers();
      const r = s.r; s.r = null; s.seq++;
      if (r) { try { r.abort(); } catch (e) { /* 이미 끝남 */ } }
      record(this, kind, payload, s);
      if (kind === 'result') { cue('done'); this._emit('speechend'); this._emit('result', payload); }
      // heard: 말소리는 감지됐지만 글자로 못 바꿈(no-match 포함) ↔ 무음. 화면 안내만 다르게, 통과로 치지 않는다
      else if (kind === 'error') this._emit('error', Object.assign({}, payload, { heard: !!(s.began || s.why === 'no-match') }));
      if (!s.ended) { s.ended = true; this._emit('end'); }
    }
    _listen(seq) {
      const s = this._s;
      const r = new Base();
      s.r = r;
      r.lang = this.lang;
      r.continuous = false;
      r.interimResults = true;                       // 말 진행 상황(중간 결과)을 받아 말 끝 즉시 판정
      r.maxAlternatives = Math.max(1, this.maxAlternatives || 1);
      r.hints = Array.isArray(this.hints) ? this.hints.filter(Boolean).map(String) : [];   // 목표 글자·문장 → 기기 인식 힌트
      r.shortUtterance = !!this.shortUtterance;
      r.letterOnDevice = !!this.letterOnDevice;
      const mine = () => s.r === r && s.seq === seq && !s.done;
      const later = (fn, ms) => s.timers.push(setTimeout(() => { if (mine()) fn(); }, ms));
      const fromPartialOrFail = () => {
        if (hasText(s.partial)) { s.usedPartial = true; this._finish('result', plainResult(s.partial)); }
        else this._finish('error', { error: 'no-speech' });
      };
      const short = r.hints.length && [...r.hints[0].replace(/\s/g, '')].length <= 3;
      const maxSpeech = this.practiceMode === 'letters' ? 4500 : this.practiceMode === 'drill' ? Math.min(12000, Math.max(5000, (r.hints[0] || '').length * 220)) : 45000;
      let finishing = false;
      const requestFinish = () => {
        if (finishing) return;
        finishing = true;
        try { typeof r.finish === 'function' ? r.finish() : r.stop(); } catch (_) {}
        later(fromPartialOrFail, TAIL_LIMIT_MS);
      };
      const began = () => {
        if (s.began) return;
        s.began = true;
        this._clearTimers();
        // 이름+예시 단어 카드도 반드시 상한 적용. 말 끝 이벤트가 누락되어도 무한 청취하지 않는다.
        later(requestFinish, short ? SHORT_SPEECH_MS : maxSpeech);
      };
      const speechEnded = () => {
        if (!s.began) return;
        this._clearTimers();
        later(() => {                                // 최종 결과가 늦으면 중간 결과로 즉시 판정
          if (hasText(s.partial)) fromPartialOrFail();
          else later(fromPartialOrFail, TAIL_LIMIT_MS - FINAL_GRACE_MS);
        }, FINAL_GRACE_MS);
      };

      r.onstart = () => {
        if (!mine()) return;
        this._clearTimers();
        if (!s.started) { s.started = true; this._emit('start'); }
        later(() => this._finish('error', { error: 'no-speech' }), NO_INPUT_MS);   // 무입력은 인식 불가
      };
      r.onspeechstart = () => { if (mine()) began(); };
      r.onspeechend = () => { if (mine()) speechEnded(); };
      r.onresult = (ev) => {
        if (!mine()) return;
        const list = ev.results || [];
        for (let i = ev.resultIndex || 0; i < list.length; i++) {
          const res = list[i];
          if (!res) continue;
          if (res.isFinal !== false) {
            // 빈 최종 결과(잡음만 들림)는 앞서 들린 중간 결과가 있으면 그것으로, 없으면 못 들음으로
            if (hasText(res)) this._finish('result', plainResult(res)); else fromPartialOrFail();
            return;
          }
          if (hasText(res)) { s.partial = res; began(); }
        }
      };
      r.onerror = (ev) => {
        if (!mine()) return;
        const code = ev && ev.error;
        if (code === 'aborted' && micBlocked()) return;   // 창이 열려 닫힌 것 → 창이 닫히면 다시 연다
        // 말한 내용이 중간 결과로 남아 있으면(기기 인식기의 '일치 없음' 등) 그걸로 판정
        if (code !== 'not-allowed' && code !== 'service-not-allowed' && hasText(s.partial)) { this._finish('result', plainResult(s.partial)); return; }
        // 내부에서 몰래 두 번 듣지 않는다. 화면에 판정 불가를 알리고 사용자가 흐름을 알 수 있게 한다.
        if (code === 'no-match') {
          s.why = 'no-match';
          this._finish('error', { error: 'no-speech' });
          return;
        }
        this._finish('error', { error: code || 'aborted' });
      };
      r.onend = () => { if (mine()) fromPartialOrFail(); };
      later(() => this._finish('error', { error: 'audio-capture' }), 4000); // 인식기 시작 콜백 누락 보호
      try { r.start(); }
      catch (e) { s.r = null; this._finish('error', { error: 'aborted' }); }
    }
    // 사용자가 직접 멈춤(롤플레잉 버튼): 들린 말이 있으면 그걸로 즉시 판정, 없으면 조용히 종료
    stop() {
      const s = this._s;
      if (!s || s.done) return;
      if (hasText(s.partial)) this._finish('result', plainResult(s.partial));
      else this._finish('end');
    }
    // 취소: 판정 없이 조용히 종료(onend만 1번)
    abort() {
      const s = this._s;
      if (!s || s.done) return;
      this._finish('end');
    }
    _quiet() {
      // 같은 객체를 다시 start하면 이전 인식은 알림 없이 정리
      const s = this._s;
      if (s && !s.done) {
        s.done = true; s.ended = true; s.seq++;
        clearInterval(s.poll);
        s.timers.forEach(clearTimeout);
        if (s.r) { try { s.r.abort(); } catch (e) { /* 무시 */ } }
        s.r = null;
      }
    }
  }
  window.SpeechRecognition = HGSpeechRecognition;
  window.webkitSpeechRecognition = HGSpeechRecognition;
  /* ---------- 마이크 진단 기록 (⚙️ 설정 → 🎙️ 마이크 진단) ----------
     실기기에서 '잘 못 알아듣는다'를 확인할 수 있게 최근 30번의 인식 결과를 남긴다:
     언어·경로(기기/브라우저)·결과(들린 말 후보)·오류·걸린 시간·중간 결과 사용 여부, 화면이 붙인 점수(note) */
  const LOG = [];
  function record(rec, kind, payload, s) {
    const alts = kind === 'result' ? Array.from((payload.results && payload.results[0]) || []).map(a => a.transcript) : [];
    LOG.push({ at: new Date().toTimeString().slice(0, 8), lang: rec.lang, path: Base === NativeSpeechRecognition ? '기기' : '브라우저',
      kind, alts, error: kind === 'error' ? (s.why || (payload && payload.error)) : '', ms: Date.now() - s.t0, partial: !!s.usedPartial, rematched: !!s.rematched });
    if (LOG.length > 30) LOG.shift();
  }
  // 화면(수업·입문 문자)이 판정 뒤 붙이는 정보: 목표 문장·점수·합격 여부
  function note(info) { const last = LOG[LOG.length - 1]; if (last) Object.assign(last, info); }
  function showLog() {
    if (document.getElementById('hgVoiceLog')) return;
    const esc = (x) => String(x == null ? '' : x).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const rows = LOG.slice().reverse().map(e => `<div style="border-bottom:1px solid #e2e8f0;padding:8px 0;font-size:15px;line-height:1.5">
      <b>${esc(e.at)}</b> · ${esc(e.lang)} · ${esc(e.path)} · ${(e.ms / 1000).toFixed(1)}초${e.partial ? ' · 중간 결과로 판정' : ''}${e.rematched ? ' · 한 번 더 들음' : ''}<br>
      ${e.kind === 'result' ? `🗣️ 들린 말: <b>${esc(e.alts.join(' / '))}</b>` : (e.kind === 'error' ? `⚠️ ${esc(e.error === 'no-speech' ? '인식 결과 없음' : e.error === 'no-match' ? '들렸지만 알아듣지 못함' : e.error)}` : '⏹ 취소')}
      ${e.target ? `<br>🎯 목표: ${esc(e.target)}` : ''}${e.score != null ? ` · ${esc(e.score)}점` : ''}${e.pass != null ? (e.pass ? ' · ✅ 통과' : ' · ❌ 불합격') : ''}</div>`).join('')
      || '<div style="padding:16px 0;font-size:15px;color:#475569">아직 기록이 없어요. 수업에서 한 번 말해 본 뒤 다시 열어 주세요.</div>';
    const box = document.createElement('div');
    box.id = 'hgVoiceLog';
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483002;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center';
    box.innerHTML = `<div style="background:#fff;width:100%;max-width:560px;max-height:85vh;overflow-y:auto;border-radius:20px 20px 0 0;padding:16px 16px 24px;color:#0f172a">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b style="font-size:18px">🎙️ 마이크 진단 (최근 ${LOG.length}번)</b>
      <button type="button" data-x style="border:none;background:#e2e8f0;border-radius:10px;min-width:44px;min-height:44px;font-size:18px;font-weight:900;cursor:pointer">✕</button></div>
      <div style="font-size:14px;color:#475569;margin:6px 0 4px;line-height:1.5">말한 내용이 어떻게 들렸는지 보여줘요. '말소리 없음'이 많으면 마이크·권한, 들린 말이 목표와 다르면 판정 문제예요.</div>${rows}</div>`;
    box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('[data-x]')) box.remove(); });
    document.body.appendChild(box);
  }
  // ⚙️ 설정 창 맨 아래에 '🎙️ 마이크 진단' 버튼
  function injectLogButton() {
    const sheet = document.querySelector('#settingsModal .modal-sheet');
    if (!sheet || document.getElementById('hgVoiceLogBtn')) return;
    const b = document.createElement('button');
    b.id = 'hgVoiceLogBtn'; b.type = 'button';
    b.textContent = '🎙️ 마이크 진단 — 최근 인식 결과 보기';
    b.style.cssText = 'width:100%;margin-top:14px;min-height:48px;border:1.5px solid #c7d2fe;border-radius:12px;background:#eef2ff;color:#3730a3;font-size:16px;font-weight:900;cursor:pointer';
    b.addEventListener('click', showLog);
    sheet.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectLogButton); else injectLogButton();

  window.HGVOICE = { cue, native: hasNative, blocked: micBlocked, log: LOG, note, showLog, timing: { NO_INPUT_MS, FINAL_GRACE_MS, TAIL_LIMIT_MS, CUE_GAP_MS } };
})();
