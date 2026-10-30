// 음성은 로컬 Worker로만 전달하며 네트워크로 전송하지 않습니다.
const $ = id => document.getElementById(id);
let worker, workerKind, activeId = 0, busy = false, recording = false;
let stream, recorder, recordTimer, recordStarted, chunks = [], lastResult = null;
let pendingResolve = null;
const MAX_SECONDS = 60, MAX_BYTES = 32 * 1024 * 1024;

function ensureWorker() {
  const kind=$('task').value==='streaming'?'streaming':'general';
  if(worker&&workerKind!==kind){worker.terminate();worker=null;}
  if (worker) return worker;
  workerKind=kind;
  worker = kind==='streaming'?new Worker(new URL('./stream-worker.js',import.meta.url)):new Worker(new URL('./worker.js', import.meta.url), {type: 'module'});
  worker.onmessage = ({data}) => {
    if (data.id !== activeId) return;
    if (data.type === 'progress') {
      $('progressText').textContent = data.message || '음성을 인식하고 있습니다';
      if (Number.isFinite(data.progress)) $('progress').value = data.progress <= 1 ? data.progress * 100 : data.progress;
      else $('progress').removeAttribute('value');
    } else if (data.type === 'partial') {
      $('empty').hidden=true;$('resultArea').hidden=false;
      $('transcript').textContent=data.transcript||'';
    } else if (data.type === 'result') {
      renderResult(data.result); finish();
      if (pendingResolve) { pendingResolve(data.result); pendingResolve = null; }
    } else if (data.type === 'error') fail(data.message || '인식 중 오류가 발생했습니다.');
  };
  worker.onerror = event => {
    event.preventDefault();
    worker?.terminate(); worker = null;
    fail(event.message || '음성 엔진을 시작하지 못했습니다. 페이지를 새로고침해 주세요.');
  };
  return worker;
}
function setControls() {
  document.querySelectorAll('select, #vad, [data-sample], #audioFile').forEach(el => el.disabled = busy || recording);
  $('record').disabled = busy || recording;
  $('vad').disabled = busy || recording || $('task').value==='streaming';
  document.querySelector('.file-button').style.pointerEvents = busy || recording ? 'none' : '';
  $('record').hidden = recording; $('stop').hidden = !recording;
  $('progressArea').hidden = !busy;
  $('recordZone').classList.toggle('recording', recording);
}
function begin(message) {
  activeId++; busy = true; $('error').hidden = true;
  $('statusBadge').textContent = '처리 중'; $('progressText').textContent = message;
  $('progress').removeAttribute('value'); setControls(); return activeId;
}
function finish() { busy = false; setControls(); }
function fail(message) {
  $('error').textContent = message; $('error').hidden = false;
  $('statusBadge').textContent = '확인 필요'; finish();
  if (pendingResolve) { pendingResolve({status:'error', message}); pendingResolve = null; }
}
function stopTracks() {
  stream?.getTracks().forEach(track => track.stop()); stream = null;
  clearInterval(recordTimer); recording = false; setControls();
}
function cancel() {
  activeId++;
  if (recorder?.state === 'recording') { recorder.onstop = null; recorder.stop(); }
  recorder = null; chunks = []; stopTracks();
  worker?.terminate(); worker = null; busy = false;
  $('statusBadge').textContent = '취소됨'; $('recordHint').textContent = '준비되면 편하게 말해주세요';
  if (pendingResolve) { pendingResolve({status:'cancelled'}); pendingResolve = null; }
  setControls();
}
function renderResult(result) {
  lastResult = result; $('empty').hidden = true; $('resultArea').hidden = false;
  $('copy').textContent = '텍스트 복사';
  $('json').textContent = JSON.stringify(result, null, 2);
  const phones = result.phone_hypotheses;
  $('transcript').textContent = result.transcript || (phones?.length ? JSON.stringify(phones, null, 2) : result.reject_reason || '인식된 텍스트가 없습니다.');
  if(result.status==='error'){$('error').textContent=result.error||result.reject_reason||'인식 오류';$('error').hidden=false;}
  const status = {recognized:'인식 완료', rejected:'입력 확인', unsupported:'지원 범위 확인', error:'오류', phoneme_hypothesis:'음소 가설'};
  $('statusBadge').textContent = status[result.status] || result.status || '처리 완료';
  $('resultMeta').replaceChildren();
  for (const [label, value] of [['언어',result.language],['모델',result.model_id],['처리 시간',Number.isFinite(result.runtime_ms) ? `${(result.runtime_ms/1000).toFixed(2)}초` : null],['검증 상태',result.validated ? '검증됨' : '실험 결과 · 검증되지 않음']]) {
    if (value == null) continue;
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label; dd.textContent = value; $('resultMeta').append(dt,dd);
  }
  $('copy').disabled = !result.transcript; $('download').disabled = false;
}
async function decodeAudio(buffer) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !window.OfflineAudioContext) throw new Error('이 브라우저는 음성 파일 변환을 지원하지 않습니다. 최신 Safari 또는 Chrome을 사용하세요.');
  const context = new AudioContextClass();
  let decoded;
  try { decoded = await context.decodeAudioData(buffer); }
  catch { throw new Error('이 음성 형식을 읽을 수 없습니다. WAV 또는 브라우저가 지원하는 MP3/M4A 파일을 선택하세요.'); }
  finally { await context.close(); }
  if (!decoded.length || decoded.duration > MAX_SECONDS) throw new Error('0초보다 길고 60초 이하인 음성을 선택하세요.');
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration*16000), 16000);
  const source = offline.createBufferSource(); source.buffer = decoded; source.connect(offline.destination); source.start();
  const rendered = await offline.startRendering();
  const audio = new Float32Array(rendered.getChannelData(0));
  if (!audio.every(Number.isFinite)) throw new Error('음성 파일에 유효하지 않은 샘플이 있습니다.');
  return audio;
}
async function recognizeBuffer(buffer, id) {
  $('progressText').textContent = '음성을 준비하고 있습니다';
  const audio = await decodeAudio(buffer);
  if (id !== activeId) return;
  const payload = {id, type:'recognize', audio, task:$('task').value, language:$('language').value, model:$('model').value, l1:$('task').value==='phoneme'?($('l1').value || null):null, target:$('task').value==='phoneme'?($('target').value || null):null, vad:$('task').value!=='streaming'&&$('vad').checked};
  ensureWorker().postMessage(payload, [audio.buffer]);
}
async function useFile(file) {
  if (!file || busy || recording) return;
  const id = begin('파일을 읽고 있습니다'); $('fileName').textContent = file.name;
  try {
    if (file.size > MAX_BYTES) throw new Error('파일은 32MB 이하로 선택하세요. 음성 길이는 최대 60초입니다.');
    await recognizeBuffer(await file.arrayBuffer(), id);
  } catch(error) { if (id === activeId) fail(error.message); }
  $('audioFile').value = '';
}
async function runSample(language) {
  if (!['en','fr','ko'].includes(language) || busy || recording) return {status:'busy_or_invalid'};
  $('language').value = language; $('task').value = 'transcribe'; $('task').dispatchEvent(new Event('change'));
  const id = begin('예제 음성을 읽고 있습니다');
  $('fileName').textContent = `${language.toUpperCase()} 공개 예제`;
  const completion = new Promise(resolve => { pendingResolve = resolve; });
  try {
    const response = await fetch(new URL(`./samples/${language}.wav`, import.meta.url));
    if (!response.ok) throw new Error(`예제를 불러오지 못했습니다 (${response.status}).`);
    await recognizeBuffer(await response.arrayBuffer(), id);
  } catch(error) { if (id === activeId) fail(error.message); }
  return completion;
}
async function startRecording() {
  if (busy || recording) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return fail('마이크는 HTTPS 연결에서 사용할 수 있습니다. 최신 브라우저로 HTTPS 주소를 열어주세요.');
  if (!window.MediaRecorder) return fail('이 브라우저는 녹음을 지원하지 않습니다. 음성 파일 선택을 사용하세요.');
  const id = begin('마이크 권한을 확인하고 있습니다');
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({audio:true});
    if (id !== activeId) { acquired.getTracks().forEach(track => track.stop()); return; }
    stream = acquired; chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { cancel(); fail('녹음 장치 오류가 발생했습니다. 마이크 연결을 확인하세요.'); };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, {type:recorder.mimeType}); chunks = []; stopTracks();
      if (id !== activeId) return;
      busy = true; setControls(); $('recordHint').textContent = '준비되면 편하게 말해주세요';
      try { await recognizeBuffer(await blob.arrayBuffer(), id); }
      catch(error) { if (id === activeId) fail(error.message); }
    };
    recorder.start(250); busy = false; recording = true; recordStarted = performance.now();
    $('statusBadge').textContent = '녹음 중'; $('recordHint').textContent = '듣고 있어요. 끝나면 버튼을 눌러주세요';
    $('timer').textContent = '00:00 / 01:00'; setControls();
    recordTimer = setInterval(() => {
      const elapsed = Math.floor((performance.now()-recordStarted)/1000);
      $('timer').textContent = `00:${String(Math.min(elapsed,59)).padStart(2,'0')} / 01:00`;
      // 컨테이너 인코딩 여유를 위해 59초에서 끝내어 60초 상한을 지킵니다.
      if (elapsed >= 59) stopRecording();
    }, 200);
  } catch(error) {
    stopTracks();
    if (id === activeId) fail(error.name === 'NotAllowedError' ? '마이크 권한이 허용되지 않았습니다. 브라우저 설정에서 허용하거나 파일을 선택하세요.' : `마이크를 사용할 수 없습니다: ${error.message}`);
  }
}
function stopRecording() {
  if (recorder?.state !== 'recording') return;
  busy = true; recorder.stop(); stopTracks();
  $('statusBadge').textContent = '처리 중';
  $('progressText').textContent = '녹음한 음성을 준비하고 있습니다';
}
$('record').addEventListener('click', startRecording);
$('stop').addEventListener('click', stopRecording);
$('cancel').addEventListener('click', cancel);
$('audioFile').addEventListener('change', event => useFile(event.target.files[0]));
document.querySelectorAll('[data-sample]').forEach(button => button.addEventListener('click', () => runSample(button.dataset.sample)));
$('task').addEventListener('change', () => {
  $('targetField').hidden = $('task').value !== 'phoneme';
  if($('task').value!=='transcribe')$('language').value='fr';
  if($('task').value==='streaming')$('vad').checked=false;
  setControls();
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(lastResult.transcript); $('copy').textContent = '복사됨'; }
  catch { fail('복사 권한이 없습니다. 결과 텍스트를 길게 눌러 복사하세요.'); }
});
$('download').addEventListener('click', () => {
  if (!lastResult) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(lastResult,null,2)], {type:'application/json;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = `nurivoice-${Date.now()}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
});
$('clear').addEventListener('click', () => {
  if (busy || recording) cancel(); lastResult = null;
  $('resultArea').hidden = true; $('empty').hidden = false; $('error').hidden = true;
  $('copy').disabled = true; $('download').disabled = true; $('copy').textContent = '텍스트 복사';
  $('json').textContent = ''; $('transcript').textContent = ''; $('statusBadge').textContent = '대기 중';
});
window.addEventListener('pagehide', cancel);
window.nurivoiceTest = {runSample, cancel, getResult:() => lastResult, getState:() => ({busy,recording,activeId})};

// 이 앱 경로만 캐시한다. 새 버전은 진행 중 녹음/인식을 방해하지 않고 사용자에게 알린다.
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(registration=>{
    function announce(){
      if(!registration.waiting)return;
      const button=document.createElement('button');button.className='text-button';button.textContent='새 버전 적용';
      button.addEventListener('click',()=>{
        if(busy||recording){$('error').textContent='진행 중인 인식이 끝난 뒤 업데이트하세요.';$('error').hidden=false;return;}
        navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});
        registration.waiting.postMessage('ACTIVATE_UPDATE');
      });document.querySelector('footer').append(button);
    }
    announce();registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',announce));
    registration.update().catch(()=>{});
  }).catch(()=>{});
}
