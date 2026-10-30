/** Worker-compatible PCM transport to the installed Android streaming engine. */
export class NativeStreamWorker {
  constructor(){
    this.session=crypto.randomUUID();this.closed=false;
    this.listener=({detail:d})=>{
      if(this.closed||d.session!==this.session)return;
      const data={...d,id:this.id};
      if(d.type==='error')data.message=d.transcript;
      if(d.type==='result')data.result={status:d.transcript?'recognized':'unknown',
        transcript:d.transcript,task:'transcribe',language:'ko',model_id:'zipformer-ko-int8-native',
        model_revision:'ba6078bca4daf3f0dd37f79d0ab505af71df14a6',
        is_final:false,recognition_mode:'stateful-online',audio_uploaded:false};
      this.onmessage?.({data});
    };
    window.addEventListener('nurivoice-native',this.listener);
  }
  postMessage(data){
    if(this.closed)return;
    if(data.type==='start'){this.id=data.id;window.NuriNative.start(this.session);}
    else if(data.type==='audio'){
      let binary='';
      for(const sample of data.audio){const n=Math.max(-32768,Math.min(32767,Math.round(sample*32768)));binary+=String.fromCharCode(n&255,(n>>8)&255);}
      window.NuriNative.audio(this.session,btoa(binary));
    }else if(data.type==='finish')window.NuriNative.finish(this.session);
  }
  terminate(){if(this.closed)return;this.closed=true;window.NuriNative.cancel(this.session);window.removeEventListener('nurivoice-native',this.listener);}
}
