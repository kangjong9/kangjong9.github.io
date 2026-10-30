/* Classic worker: completed 16 kHz audio -> stateful French online chunks. */
const rootURL = new URL('./', self.location.href);
let initialization;
let active = false;
let manifest;
function progress(id, message, value) { postMessage({id, type:'progress', message, progress:value}); }
async function verified(path) {
  manifest ||= await fetch(new URL('asset-manifest.json', rootURL)).then(r => {if(!r.ok)throw Error('manifest');return r.json();});
  const entry=manifest.find(r=>r.path===path);
  if(!entry)throw Error('자산 명세 없음: '+path);
  const response=await fetch(new URL(path,rootURL));
  if(!response.ok)throw Error('자산 다운로드 실패: '+path);
  const bytes=new Uint8Array(await response.arrayBuffer());
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(bytes.length!==entry.bytes||hash!==entry.sha256)throw Error('자산 해시 불일치: '+path);
  return bytes;
}
// Emscripten npm build uses Node's POSIX path API even though MEMFS is present.
// These filesystem-only operations keep all model paths inside the worker MEMFS.
const posix={
  normalize(path) {const absolute=path.startsWith('/');const parts=[];for(const p of path.split('/')){if(!p||p==='.')continue;if(p==='..'){if(parts.length&&parts.at(-1)!=='..')parts.pop();else if(!absolute)parts.push(p);}else parts.push(p);}return(absolute?'/':'')+parts.join('/')||(absolute?'/':'.');},
  isAbsolute:p=>p.startsWith('/'),
  join(...p){return this.normalize(p.filter(Boolean).join('/'));},
  dirname(p){p=this.normalize(p);const i=p.lastIndexOf('/');return i<0?'.':i===0?'/':p.slice(0,i);},
  basename(p){return p.replace(/\/+$/,'').split('/').at(-1)||'';},
  resolve(...p){let combined='';for(const v of p){if(v.startsWith('/'))combined=v;else combined+='/'+v;}return this.normalize(combined||'/');},
  relative(from,to){const a=this.resolve(from).split('/').filter(Boolean),b=this.resolve(to).split('/').filter(Boolean);while(a.length&&b.length&&a[0]===b[0]){a.shift();b.shift();}return [...a.map(()=> '..'),...b].join('/');}
};
const nodePath=Object.fromEntries(Object.entries(posix).map(([k,v])=>[k,v.bind(posix)]));nodePath.posix=nodePath;
self.require=name=>{if(name==='path')return nodePath;throw Error('Node dependency blocked: '+name);};

async function initialize(id) {
  progress(id,'프랑스어 스트리밍 엔진 확인',0);
  importScripts('./vendor/sherpa/sherpa-onnx-wasm-browser.js','./vendor/sherpa/sherpa-onnx-asr.js');
  const runtime=await Module({wasmBinary:await verified('vendor/sherpa/sherpa-onnx-wasm-nodejs.wasm')});
  const first=await verified('models/zipformer-fr/encoder.onnx.part0');progress(id,'프랑스어 모델 1/2',25);
  const second=await verified('models/zipformer-fr/encoder.onnx.part1');
  const encoder=new Uint8Array(first.length+second.length);encoder.set(first);encoder.set(second,first.length);
  runtime.FS.writeFile('/encoder.onnx',encoder);progress(id,'프랑스어 모델 구성',60);
  for(const name of ['decoder.onnx','joiner.onnx','tokens.txt']) runtime.FS.writeFile('/'+name,await verified('models/zipformer-fr/'+name));
  const recognizer=createOnlineRecognizer(runtime);
  if(!recognizer.handle)throw Error('프랑스어 recognizer 생성 실패');
  for(const name of ['encoder.onnx','decoder.onnx','joiner.onnx','tokens.txt'])runtime.FS.unlink('/'+name);
  progress(id,'프랑스어 스트리밍 준비 완료',100);
  return recognizer;
}
function quality(audio){
  if(audio.length<1600)return'insufficient_audio';let sum=0,clipped=0,changes=0;
  for(let i=0;i<audio.length;i++){const x=audio[i];if(!Number.isFinite(x))return'invalid_audio';sum+=x*x;if(Math.abs(x)>=.99)clipped++;if(i&&(x<0)!==(audio[i-1]<0))changes++;}
  if(Math.sqrt(sum/audio.length)<1e-5)return'silence';if(clipped/audio.length>.02)return'clipping';if(changes/(audio.length-1)>.35)return'noise';return null;
}
self.onmessage=async({data})=>{
  const {id}=data;const start=performance.now();let stream;let ownsActive=false;
  const result={status:'error',task:'streaming',language:data.language,locale:data.locale??null,l1:data.l1??null,transcript:null,phone_hypotheses:[],target_phone:null,phone_match:null,reject_reason:null,model_id:'zipformer-fr-int8',model_revision:'3db9565d9633758d6b87b9a7b3dc09ebfb6b2c73',runtime_ms:0,score_type:'unscored',validated:false,tokens:[],timestamps:[],timestamp_type:'model token start seconds',feed_mode:'completed audio; 160ms fast-feed chunks'};
  try{
    if(active)throw Error('이미 처리 중입니다.');
    if(data.type!=='recognize'||data.task!=='streaming'||data.language!=='fr'){result.status='unsupported';result.reject_reason='streaming_language_unsupported';return;}
    const audio=data.audio;if(!(audio instanceof Float32Array))throw Error('Float32Array 16kHz mono 입력 필요');
    if(audio.length>16000*120)throw Error('최대 120초 입력');
    const reason=quality(audio);if(reason){result.status='rejected';result.reject_reason=reason;return;}
    active=true;ownsActive=true;initialization ||= initialize(id).catch(e=>{initialization=null;throw e;});
    const recognizer=await initialization;result.model_load_ms=performance.now()-start;
    stream=recognizer.createStream();let previous='';const inference=performance.now();result.first_partial_ms=null;
    for(let offset=0;offset<audio.length;offset+=2560){
      stream.acceptWaveform(16000,audio.subarray(offset,offset+2560));
      while(recognizer.isReady(stream))recognizer.decode(stream);
      const partial=recognizer.getResult(stream);if(partial.text&&partial.text!==previous){previous=partial.text;if(result.first_partial_ms===null)result.first_partial_ms=performance.now()-inference;postMessage({id,type:'partial',transcript:partial.text});}
    }
    stream.acceptWaveform(16000,new Float32Array(4800));stream.inputFinished();while(recognizer.isReady(stream))recognizer.decode(stream);
    const final=recognizer.getResult(stream);result.transcript=(final.text||'').trim();result.status=result.transcript?'recognized':'unknown';result.tokens=final.tokens||[];result.timestamps=final.timestamps||[];result.audio_received_seconds=audio.length/16000;result.inference_ms=performance.now()-inference;
  }catch(error){result.status='error';result.reject_reason='input_or_runtime_error';result.error=String(error.message||error);}
  finally{if(stream)stream.free();if(ownsActive)active=false;result.runtime_ms=performance.now()-start;postMessage({id,type:'result',result});}
};
