/* 한걸음 음성 입력 공통층 (HGVOICE)
   1) 안드로이드 WebView에는 브라우저 음성인식이 없으므로, 기기 음성인식(Native.call('sttStart'))을
      SpeechRecognition과 같은 모양으로 감싸서 제공한다.
   2) 앱의 모든 음성인식(수업·롤플레잉·입문 문자)을 한 곳에서 감싸서
      - 마이크가 실제로 켜지는 순간(start) → 입력 알림음 1번
      - 사용자 입력이 끝나 최종 결과가 확정된 순간(final result) → 입력완료음 1번
      을 확실하게 울린다. 각 화면 코드는 효과음을 따로 울리지 않는다. */
(function () {
  const hasNative = () => !!(window.Native && typeof window.Native.call === 'function');

  /* ---------- 기기 음성인식 → SpeechRecognition 모양 ---------- */
  let nativeActive = null;
  class NativeSpeechRecognition extends EventTarget {
    constructor() {
      super();
      this.lang = 'en-US';
      this.continuous = false;
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.onstart = this.onresult = this.onerror = this.onend = this.onspeechend = null;
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
      try { window.Native.call('sttStart', JSON.stringify({ lang: this.lang })); }
      catch (e) { this._fire('error', { error: 'aborted' }); this._fire('end'); nativeActive = null; }
    }
    stop() { this.abort(); }
    abort() {
      if (nativeActive !== this) return;
      nativeActive = null;
      try { window.Native.call('sttStop', '{}'); } catch (e) { /* 무시 */ }
    }
  }
  // MainActivity가 보내는 이벤트: {type:'start'|'result'|'error'|'end', alts:[...], error}
  window.HGNativeStt = function (evt) {
    const r = nativeActive;
    if (!r || !evt) return;
    if (evt.type === 'start') r._fire('start');
    else if (evt.type === 'result') {
      const max = Math.max(1, r.maxAlternatives || 1);
      const alts = (evt.alts || []).slice(0, max).map(t => ({ transcript: String(t || ''), confidence: 0.9 }));
      if (!alts.length) alts.push({ transcript: '', confidence: 0 });
      const res = Object.assign(alts, { isFinal: true });
      r._fire('speechend');
      r._fire('result', { resultIndex: 0, results: [res] });
    } else if (evt.type === 'error') r._fire('error', { error: evt.error || 'aborted' });
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

  /* ---------- 모든 음성인식 감싸기 ---------- */
  const Base = window.SpeechRecognition || window.webkitSpeechRecognition || (hasNative() ? NativeSpeechRecognition : null);
  if (!Base) return;
  function HGSpeechRecognition() {
    const r = new Base();
    let listening = false, finished = false;
    r.addEventListener('start', () => { if (!listening) { listening = true; finished = false; cue('listen'); } });
    r.addEventListener('result', (ev) => {
      const res = ev.results && ev.results[ev.resultIndex || 0];
      if (!finished && (!res || res.isFinal !== false)) { finished = true; cue('done'); }
    });
    r.addEventListener('end', () => { listening = false; });
    return r;  // new HGSpeechRecognition() → 실제 인식기 객체 (기존 코드의 onstart/onresult 그대로 동작)
  }
  window.SpeechRecognition = HGSpeechRecognition;
  window.webkitSpeechRecognition = HGSpeechRecognition;
  window.HGVOICE = { cue, native: hasNative };
})();
