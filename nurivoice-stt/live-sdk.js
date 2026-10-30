/** Reusable live PCM SDK. No recording file and no voice network upload. */
export class NuriVoiceLive {
  constructor(options={}){
    this.options={task:'transcribe',language:'auto',model:'base',...options};
    this.counter=0;this.pending=new Map();this.queue=[];this.preroll=[];this.parts=[];
    this.samples=0;this.quiet=0;this.utterance=0;this.total=0;this.lastPartial=0;this.sessionAudio=[];
    this.sent=0;this.ack=0;this.started=false;this.closed=false;this.stopping=false;
  }
  emit(name,value){try{this.options[name]?.(value);}catch(error){console.error(error);}}
  async startPCM(){
    if(this.closed||this.worker)throw Error('새 인식 세션을 생성하세요.');
    const streaming=this.options.task==='streaming';
    if(streaming&&this.options.language!=='fr')throw Error('온라인 스트리밍은 프랑스어를 선택하세요.');
    this.worker=new Worker(new URL(streaming?'./stream-worker.js':'./worker.js',import.meta.url),streaming?{}:{type:'module'});
    this.worker.onmessage=event=>this.message(event.data);
    this.worker.onerror=event=>this.fail(Error(event.message||'음성 엔진 실행 오류'));
    this.id=++this.counter;
    const ready=this.wait(this.id,'ready');
    this.emit('onStatus','모델 준비 중… 준비 후 마이크를 시작합니다.');
    this.worker.postMessage({...this.optionsForWorker(),id:this.id,type:streaming?'start':'prepare'});
    await ready;
    if(this.closed)throw Error('취소되었습니다.');
    this.started=true;
    this.timer=setTimeout(()=>this.stop('limit'),120000);
    this.emit('onStatus','음성 입력 준비 완료');
    return this;
  }
  optionsForWorker(){
    const {task,language,model,target,l1}=this.options;return {task,language,model,target,l1,timestamps:false};
  }
  async start(){
    if(!navigator.mediaDevices?.getUserMedia||!globalThis.AudioWorkletNode)throw Error('HTTPS와 AudioWorklet을 지원하는 브라우저가 필요합니다.');
    const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
    // 사용자 클릭 시점에 AudioContext를 활성화한다. 마이크는 모델 준비 후에만 연다.
    try{this.context=new Context({sampleRate:16000});}catch{this.context=new Context();}
    try{
      await this.context.resume();
      await this.context.audioWorklet.addModule(new URL('./pcm-capture.js',import.meta.url));
      await this.startPCM();
      const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false});
      if(this.closed||this.stopping){stream.getTracks().forEach(t=>t.stop());throw Error('취소되었습니다.');}
      this.media=stream;this.source=this.context.createMediaStreamSource(stream);
      this.node=new AudioWorkletNode(this.context,'pcm-capture');
      this.node.port.onmessage=({data})=>{
        if(data.type==='audio')this.acceptAudio(data.audio);
        if(data.type==='flushed')this.flushDone?.();
      };
      this.source.connect(this.node);this.node.connect(this.context.destination); // processor outputs silence
      // Android의 마이크 권한/오디오 장치 전환 뒤 컨텍스트가 중단될 수 있다.
      await this.context.resume();
      this.node.onprocessorerror=()=>this.fail(Error('마이크 PCM 처리기가 중단되었습니다. 다시 시작하세요.'));
      this.captureWatchdog=setTimeout(()=>{
        if(!this.closed&&!this.stopping&&this.total===0)this.fail(Error('마이크 입력이 전달되지 않습니다. 다른 녹음 앱을 종료한 뒤 다시 시작하세요.'));
      },8000);
      this.emit('onStatus','마이크 연결됨 · 말하면 바로 인식합니다.');
      return this;
    }catch(error){this.fail(error);throw error;}
  }
  wait(id,type,timeout=180000){
    return new Promise((resolve,reject)=>{
      const key=`${id}:${type}`;
      const timer=setTimeout(()=>{this.pending.delete(key);reject(Error('엔진 응답 시간이 초과되었습니다.'));},timeout);
      this.pending.set(key,{resolve,reject,timer});
    });
  }
  message(data){
    if(this.closed)return;
    const key=`${data.id}:${data.type}`;const pending=this.pending.get(key);
    if(pending){clearTimeout(pending.timer);this.pending.delete(key);pending.resolve(data.result||data);}
    if(data.type==='progress')this.emit('onStatus',data.message);
    if(data.type==='error')this.fail(Error(data.message||data.reason||'엔진 오류'));
    if(data.type==='ack')this.ack=data.received_samples;
    if(data.type==='partial')this.emit('onPartial',{status:'partial',transcript:data.transcript,utterance_index:0,task:'streaming'});
    if(data.type==='result'&&this.options.task==='streaming')this.emit('onResult',{...data.result,utterance_index:0,input_source:'live_pcm'});
  }
  acceptAudio(audio){
    if(!this.started||this.closed)return;
    if(!(audio instanceof Float32Array)||!audio.length||!audio.every(Number.isFinite)){this.fail(Error('유효한 16kHz mono PCM이 필요합니다.'));return;}
    this.total+=audio.length;
    if(this.total>16000*120){this.stop('limit');return;}
    this.sessionAudio.push(audio.slice());
    let energy=0;for(const x of audio)energy+=x*x;
    const rms=Math.sqrt(energy/audio.length);this.emit('onLevel',Math.min(1,rms*8));
    if(this.options.task==='streaming'){
      if(this.sent-this.ack>32000){this.fail(Error('기기가 실시간 입력을 따라가지 못합니다. 입력을 중지했습니다.'));return;}
      this.sent+=audio.length;
      const copy=audio.slice();this.worker.postMessage({id:this.id,type:'audio',audio:copy},[copy.buffer]);return;
    }
    const speech=rms>0.004; // uncalibrated endpoint heuristic; not a pronunciation grade
    if(!this.parts.length){
      this.preroll.push(audio.slice());if(this.preroll.length>3)this.preroll.shift();
      if(!speech)return;
      this.parts=this.preroll;this.preroll=[];this.samples=this.parts.reduce((n,p)=>n+p.length,0);this.utterance++;
    }else{this.parts.push(audio.slice());this.samples+=audio.length;}
    this.quiet=speech?0:this.quiet+audio.length;
    const endPause=this.options.task==='phoneme'?6400:10240;
    if(this.quiet>=endPause||this.samples>=320000){this.finalizeUtterance();return;}
    if(this.options.task==='transcribe'&&this.samples-this.lastPartial>=12800&&!this.inflight&&!this.queue.length){
      this.lastPartial=this.samples;this.enqueue(false);
    }
  }
  combine(){const audio=new Float32Array(this.samples);let offset=0;for(const p of this.parts){audio.set(p,offset);offset+=p.length;}return audio;}
  enqueue(final){
    if(this.samples<1600)return;
    if(final&&this.queue.filter(j=>j.final).length>=2){this.fail(Error('발화 처리 대기량이 초과되었습니다. 더 짧게 말하거나 경량 모델을 선택하세요.'));return;}
    this.queue.push({audio:this.combine(),utterance:this.utterance,final});this.pump();
  }
  finalizeUtterance(){
    if(this.parts.length)this.enqueue(true);
    this.parts=[];this.samples=0;this.quiet=0;this.lastPartial=0;
  }
  async pump(){
    if(this.inflight||this.closed||!this.queue.length)return;
    this.inflight=true;const job=this.queue.shift();const id=++this.counter;
    try{
      const waiting=this.wait(id,'result');
      this.worker.postMessage({...this.optionsForWorker(),id,type:'recognize',audio:job.audio,vad:false},[job.audio.buffer]);
      const result=await waiting;
      if(this.closed)return;
      const value={...result,utterance_index:job.utterance,input_source:'live_pcm',
        recognition_mode:'utterance-window',segmentation:'RMS endpoint heuristic; uncalibrated'};
      if(job.final)this.emit('onResult',{...value,is_final:false});
      else if(result.transcript)this.emit('onPartial',{...value,status:'partial'});
    }catch(error){if(!this.closed)this.fail(error);}
    finally{this.inflight=false;if(!this.closed)this.pump();}
  }
  async stop(reason='stopped'){
    if(this.closed||this.stopping)return;
    this.stopping=true;clearTimeout(this.timer);
    if(this.node){await new Promise(resolve=>{this.flushDone=resolve;this.node.port.postMessage({type:'flush'});setTimeout(resolve,1000);});}
    await this.closeCapture();
    try{
      if(this.started&&this.options.task==='streaming'){
        const done=this.wait(this.id,'result');this.worker.postMessage({id:this.id,type:'finish'});await done;
      }else if(this.started){
        this.finalizeUtterance();
        const deadline=performance.now()+180000;
        while(!this.closed&&(this.inflight||this.queue.length)){
          if(performance.now()>deadline)throw Error('마지막 발화 처리 시간이 초과되었습니다.');
          await new Promise(resolve=>setTimeout(resolve,50));
        }
      }
      if(!this.closed&&this.started&&this.options.task!=='phoneme'&&this.sessionAudio.length){
        this.emit('onStatus','입력 종료 · 받은 전체 음성을 다시 분석해 최종 문장을 확정합니다.');
        // 온라인 디코더의 종료 결과와 별개로 원본 PCM 전체를 새 전사 요청으로 재분석한다.
        this.worker?.terminate();
        this.worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
        this.worker.onmessage=event=>this.message(event.data);
        this.worker.onerror=event=>this.fail(Error(event.message||'최종 분석 오류'));
        const audio=new Float32Array(this.sessionAudio.reduce((n,p)=>n+p.length,0));
        let offset=0;for(const part of this.sessionAudio){audio.set(part,offset);offset+=part.length;}
        const id=++this.counter,done=this.wait(id,'result');
        this.worker.postMessage({...this.optionsForWorker(),model:this.options.finalModel||'base',task:'transcribe',id,type:'recognize',audio,session_final:true},[audio.buffer]);
        const result=await done;
        if(!this.closed)this.emit('onResult',{...result,is_final:true,replace_session:true,input_source:'live_pcm',recognition_mode:'full-session-reanalysis',utterance_index:0});
      }
      if(!this.closed)this.end(reason);
    }catch(error){if(!this.closed)this.fail(error);}
  }
  async closeCapture(){
    clearTimeout(this.captureWatchdog);
    this.media?.getTracks().forEach(t=>t.stop());this.media=null;
    try{this.source?.disconnect();this.node?.disconnect();}catch{}
    this.source=null;this.node=null;
    if(this.context&&this.context.state!=='closed')await this.context.close().catch(()=>{});
    this.context=null;
  }
  end(reason){
    if(this.closed)return;
    this.closed=true;this.started=false;clearTimeout(this.timer);
    this.worker?.terminate();this.worker=null;
    for(const entry of this.pending.values()){clearTimeout(entry.timer);entry.reject(Error('세션이 종료되었습니다.'));}
    this.pending.clear();this.queue=[];this.parts=[];this.preroll=[];this.sessionAudio=[];
    this.emit('onLevel',0);this.emit('onEnd',{reason});
  }
  cancel(){this.closeCapture();this.end('cancelled');}
  fail(error){if(this.closed)return;this.emit('onError',error);this.closeCapture();this.end('error');}
}
