/* Local portrait adapter: the final muxed video owns both picture and sound. */
(function () {
  'use strict';
  const pause = (ms, signal) => new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error('CANCELED'));
    const abort = () => { clearTimeout(timer); reject(new Error('CANCELED')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
  async function request(path, options = {}) {
    const response = await fetch('/api/portrait/' + path, options);
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || '로컬 엔진 연결 실패');
    return result;
  }
  async function wavBase64(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('음성을 불러오지 못했습니다.');
    const context = new (window.AudioContext || window.webkitAudioContext)();
    let audio;
    try { audio = await context.decodeAudioData(await response.arrayBuffer()); }
    finally { await context.close(); }
    if (signal.aborted) throw new Error('CANCELED');
    if (audio.duration > 8) throw new Error('현재 PC의 실사 영상은 한 번에 8초까지 지원합니다. 음성으로 재생합니다.');
    const rate = Math.min(audio.sampleRate, 48000);
    const samples = Math.ceil(audio.duration * rate);
    const offline = new OfflineAudioContext(1, samples, rate);
    const source = offline.createBufferSource();
    source.buffer = audio; source.connect(offline.destination); source.start();
    const mono = (await offline.startRendering()).getChannelData(0);
    const bytes = new Uint8Array(44 + samples * 2), view = new DataView(bytes.buffer);
    const ascii = (offset, value) => [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
    ascii(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); ascii(8, 'WAVE');
    ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    ascii(36, 'data'); view.setUint32(40, samples * 2, true);
    for (let i = 0; i < samples; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, mono[i])) * 32767, true);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(binary);
  }
  window.NuriPortraitRenderer = class {
    constructor(video, report) { this.video = video; this.report = report; }
    onError(error) { this.report('영상 생성 실패: ' + error.message + ' 기존 음성으로 재생합니다.'); }
    async prepare(url, signal) {
      this.report('입 모양 영상을 만들고 있습니다. 첫 생성에는 시간이 걸립니다.');
      const audio = await wavBase64(url, signal);
      if (signal.aborted) throw new Error('CANCELED');
      // Receive the job id even if stop happens during POST, so its worker can be canceled.
      const job = await request('jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio }) });
      if (job.status !== 'ready') this.report('CPU로 영상 생성 중 · 약 ' + Math.ceil(job.estimatedSeconds / 60) + '분 예상 · 중지 가능');
      const cancel = () => request('jobs/' + job.id + '/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
      if (signal.aborted) { cancel(); throw new Error('CANCELED'); }
      signal.addEventListener('abort', cancel, { once: true });
      try {
        const deadline = Date.now() + 1800000;
        while (Date.now() < deadline) {
          const state = await request('jobs/' + job.id, { signal });
          if (state.status === 'ready') {
            this.report('실사 립싱크 · 선택한 TTS 음성으로 재생');
            return { url: '/api/portrait/jobs/' + job.id + '/video', element: this.video };
          }
          if (['error', 'canceled'].includes(state.status)) throw new Error(state.error || 'CANCELED');
          await pause(1000, signal);
        }
        cancel(); throw new Error('영상 생성 제한 시간 초과');
      } catch (error) { cancel(); throw error; }
      finally { signal.removeEventListener('abort', cancel); }
    }
  };
  document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('portraitEnabled');
    if (!toggle) return;
    const report = text => { document.getElementById('portraitStatus').textContent = text; };
    const video = document.getElementById('portraitVideo');
    if (!['127.0.0.1', 'localhost'].includes(location.hostname)) {
      report('실사 립싱크는 PC의 누리 로컬 스튜디오에서 사용할 수 있습니다.');
      toggle.disabled = true; return;
    }
    try {
      const state = await request('status');
      toggle.disabled = !state.ready;
      if (state.photo) video.poster = '/api/portrait/photo';
      report(state.ready ? '생성 후 재생 · 8초 이내 음성 · CPU 생성은 수 분 이상 걸립니다.' : '실사 립싱크 모델을 준비 중입니다.');
    } catch (_) { toggle.disabled = true; report('누리 로컬 서버 연결을 확인해 주세요.'); }
    toggle.addEventListener('change', () => {
      window.OurVoiceMasterEngine.setPortraitRenderer(toggle.checked ? new window.NuriPortraitRenderer(video, report) : null);
      video.hidden = !toggle.checked;
      report(toggle.checked ? '다음 음성을 실사 영상으로 생성합니다.' : '기존 음성 재생 모드');
    });
  });
})();
