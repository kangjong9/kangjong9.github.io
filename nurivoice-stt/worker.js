import { pipeline, env } from './vendor/transformers.min.js';

const ROOT = new URL('./', import.meta.url);
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = new URL('models/', ROOT).href;
env.useBrowserCache = false; // 동일 출처 service worker가 버전별 캐시를 관리한다.
env.backends.onnx.wasm.wasmPaths = new URL('vendor/', ROOT).href;
env.backends.onnx.wasm.numThreads = 1; // GitHub Pages에는 COOP/COEP 헤더가 없다.
env.backends.onnx.wasm.proxy = false;

const LANGUAGES = new Set(['auto','en','ja','zh','fr','es','ru','pt','it','de','no','ko']);
let current = null;
let currentName = null;
let busy = false;

async function prepareModel(data,progress){
  if(data.task==='phoneme'){
    if(current){await current.dispose();current=null;currentName=null;}
    const {preparePhones}=await import('./phoneme.js');await preparePhones(progress);return;
  }
  const model=data.model==='base'?'base':'tiny';
  if(currentName===model)return;
  const {disposePhones}=await import('./phoneme.js');await disposePhones();
  if(current)await current.dispose();current=null;currentName=null;
  progress(`${model} 모델 준비 중. 준비되면 음성 입력을 시작합니다.`);
  current=await pipeline('automatic-speech-recognition',`whisper-${model}`,{
    device:'wasm',dtype:'q8',local_files_only:true,
    progress_callback:e=>{if(e.status==='progress')progress(`모델 준비: ${e.file}`,e.progress);}
  });currentName=model;
}

function quality(audio) {
  if (audio.length < 1600) return 'insufficient_audio';
  let energy=0, clipped=0, crossings=0;
  for (let i=0; i<audio.length; i++) {
    const value=audio[i];
    if (!Number.isFinite(value)) return 'invalid_audio';
    energy += value*value;
    if (Math.abs(value)>=.99) clipped++;
    if (i && (value<0)!==(audio[i-1]<0)) crossings++;
  }
  if (Math.sqrt(energy/audio.length)<1e-5) return 'silence';
  if (clipped/audio.length>.02) return 'clipping';
  if (crossings/Math.max(1,audio.length-1)>.35) return 'noise';
  return null;
}

self.onmessage = async ({data}) => {
  const {id,type} = data;
  if(!['recognize','prepare'].includes(type))return;
  if (busy) {self.postMessage({id,type:'error',message:'이미 인식 중입니다.'});return;}
  busy=true;
  const started=performance.now();
  const progress=(message,value)=>self.postMessage({id,type:'progress',
    message:typeof message==='object'?`${message.stage}: ${message.file||''}`:message,
    progress:typeof message==='object'?message.progress:value});
  if(type==='prepare'){
    try{await prepareModel(data,progress);self.postMessage({id,type:'ready'});}
    catch(error){self.postMessage({id,type:'error',message:error.message||String(error)});}
    finally{busy=false;}return;
  }
  const result={status:'error',task:data.task||'transcribe',transcript:null,phone_hypotheses:[],
    target_phone:data.target||null,phone_match:null,reject_reason:null,language:data.language||'auto',
    locale:null,l1:data.l1||null,model_id:null,model_revision:null,runtime_ms:0,
    score_type:'unscored',validated:false,runtime:'browser-wasm',audio_uploaded:false};
  try {
    let audio = data.audio instanceof Float32Array ? data.audio : new Float32Array(data.audio);
    if (audio.length>16000*(data.session_final?120:60)) throw new Error('음성 길이 제한을 초과했습니다.');
    if (!LANGUAGES.has(result.language)) {result.status='unsupported';result.reject_reason='unsupported_language';return;}
    if (!['transcribe','phoneme','assessment'].includes(result.task)) {result.status='unsupported';result.reject_reason='unsupported_task';return;}
    if (result.task==='assessment') {result.status='unsupported';result.reject_reason='assessment_unvalidated';return;}
    const rejection=quality(audio);
    if (rejection) {result.status='rejected';result.reject_reason=rejection;return;}
    if (data.vad) {
      progress('음성 구간을 확인하고 있습니다.');
      const {detectSpeech}=await import('./vad.js');
      const segments=await detectSpeech(audio,progress);
      result.vad={segments,trim:false,validated_for_isolated_phones:false};
      if (!segments.length) {result.status='rejected';result.reject_reason='no_speech_detected';return;}
    }
    if (result.task==='phoneme') {
      if (current) {await current.dispose();current=null;currentName=null;}
      const {recognizePhones}=await import('./phoneme.js');
      Object.assign(result,await recognizePhones(audio,{language:result.language,target:data.target,l1:data.l1,onProgress:progress}));
      return;
    }
    const model=data.model==='base'?'base':'tiny';
    if (!['tiny','base','auto',undefined].includes(data.model)) throw new Error('지원하지 않는 모델입니다.');
    await prepareModel(data,progress);
    progress('휴대폰 안에서 음성을 인식하고 있습니다.');
    const options={task:'transcribe',return_timestamps:true,chunk_length_s:20,stride_length_s:3};
    if (result.language!=='auto') options.language=result.language;
    const answer=await current(audio,options);
    result.transcript=answer.text?.trim()||'';
    result.chunks=answer.chunks||[];
    result.status=result.transcript?'recognized':'unknown';
    result.model_id=`whisper-${model}-q8-browser`;
    result.model_revision='see asset-manifest.json';
    result.language_mode=result.language==='auto'?'model_automatic':'explicit';
    // 파이프라인이 식별한 언어를 반환하지 않으므로 auto를 임의 언어로 바꾸지 않는다.
  } catch(error) {
    result.status='error';result.reject_reason='input_or_runtime_error';
    result.error=error?.message||String(error);
  } finally {
    result.runtime_ms=performance.now()-started;
    self.postMessage({id,type:'result',result});
    busy=false;
  }
};
