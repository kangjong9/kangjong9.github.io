/* 한걸음 음성 입력 공통층 (HGVOICE)
   1) 안드로이드 WebView에는 브라우저 음성인식이 없으므로, 기기 음성인식(Native.call('sttStart'))을
      SpeechRecognition과 같은 모양으로 감싸서 제공한다.
   2) 앱의 모든 음성인식(수업·롤플레잉·입문 문자)을 한 곳에서 감싸서
      - 마이크를 여는 순간 → 입력 알림음 1번 (알림음이 끝난 뒤 실제 인식 시작)
      - 사용자 입력이 끝나 최종 결과가 확정된 순간(final result) → 입력완료음 1번
      을 확실하게 울린다. 각 화면 코드는 효과음을 따로 울리지 않는다.
   3) 모든 강의 공통 판정 타이밍 (옵빠야 지시 2026-10-26)
      - 마이크가 켜진 뒤 NO_INPUT_MS(5초) 안에 말이 시작되지 않으면 → 'no-speech' 오류 = 불합격
        (각 화면이 기존대로 AI 시범 → 다시 입력 → 평가 → 판정을 반복)
      - 5초 안에 말이 시작되면 시간 제한 없이 말이 끝날 때까지 기다린다
      - 말이 끝나는 순간 바로 평가로 넘긴다: 최종 결과를 FINAL_GRACE_MS까지만 기다리고,
        그때까지 안 오면 마지막 중간 결과로 즉시 판정한다
   4) 불필요한 마이크 켜짐 방지 (2026-10-26)
      - 기기 인식 세션마다 번호(sid)를 붙여, 앞서 멈춘 세션의 늦은 end/error가 새 세션을 끝내지 못하게 한다
        (전에는 이 때문에 새로 켠 마이크가 바로 꺼져 "입력을 잘 못 받는" 현상이 났다)
      - 문자표·설정 등 창이 떠 있거나 앱이 뒤로 가 있으면 마이크를 켜지 않고 기다렸다가, 닫히면 그때 켠다
      - 알림음이 마이크에 녹음돼 말 시작으로 잘못 잡히지 않게, 알림음을 먼저 울리고 끝난 뒤 마이크를 연다 */
(function () {
  const NO_INPUT_MS = 5000;     // 마이크 켜짐 → 말 시작까지 허용 시간
  const FINAL_GRACE_MS = 300;   // 말 끝 → 최종 결과 대기 상한 (넘으면 중간 결과로 판정)
  const TAIL_LIMIT_MS = 4000;   // 말은 끝났는데 결과도 중간 결과도 없을 때의 안전 상한
  const CUE_GAP_MS = 260;       // 입력 알림음(약 0.2초)이 끝난 뒤 마이크를 연다
  const GATE_POLL_MS = 300;     // 마이크를 막는 창이 열리고 닫히는지 확인하는 간격

  const hasNative = () => !!(window.Native && typeof window.Native.call === 'function');

  /* ---------- 마이크를 켜면 안 되는 때 ---------- */
  let appPaused = false;
  const shown = (el) => !!(el && el.getClientRects().length);
  function micBlocked() {
    if (appPaused || document.hidden) return 'background';
    if (document.querySelector('.hgl-ov')) return 'letters';          // 문자표 화면이 덮고 있음
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
      try { window.Native.call('sttStart', JSON.stringify({ lang: this.lang, sid: this._sid })); }
      catch (e) { this._fire('error', { error: 'aborted' }); this._fire('end'); nativeActive = null; }
    }
    stop() { this.abort(); }
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
  const Base = window.SpeechRecognition || window.webkitSpeechRecognition || (hasNative() ? NativeSpeechRecognition : null);
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
      const s = this._s = { done: false, ended: false, started: false, began: false, partial: null, timers: [], r: null, opening: 0, seq: 0, poll: null };
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
      s.began = false; s.partial = null;          // 다시 열면 처음부터 듣는다 (5초 기준도 새로)
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
      if (kind === 'result') { cue('done'); this._emit('speechend'); this._emit('result', payload); }
      else if (kind === 'error') this._emit('error', payload);
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
      const mine = () => s.r === r && s.seq === seq && !s.done;
      const later = (fn, ms) => s.timers.push(setTimeout(() => { if (mine()) fn(); }, ms));
      const fromPartialOrFail = () => {
        if (hasText(s.partial)) this._finish('result', plainResult(s.partial));
        else this._finish('error', { error: 'no-speech' });
      };
      const began = () => {
        if (s.began) return;
        s.began = true;
        this._clearTimers();                         // 5초 안에 말 시작 → 끝날 때까지 기다림
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
        if (!s.started) { s.started = true; this._emit('start'); }
        later(() => this._finish('error', { error: 'no-speech' }), NO_INPUT_MS);   // 5초 무입력 = 불합격
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
        this._finish('error', { error: code || 'aborted' });
      };
      r.onend = () => { if (mine()) fromPartialOrFail(); };
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
  window.HGVOICE = { cue, native: hasNative, blocked: micBlocked, timing: { NO_INPUT_MS, FINAL_GRACE_MS, TAIL_LIMIT_MS, CUE_GAP_MS } };
})();
