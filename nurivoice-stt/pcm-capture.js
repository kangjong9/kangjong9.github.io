import {PCMResampler} from './resample.js';

class PCMCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.resampler = new PCMResampler(sampleRate, 16000, 2560);
    this.closed = false;
    this.port.onmessage = ({data}) => {
      if (data?.type === 'flush') {
        this.send(this.resampler.flush());
        this.closed = true;
        this.port.postMessage({type:'flushed', input_frames:this.resampler.inputCount,
          output_samples:this.resampler.outputCount, sample_rate:16000});
      }
    };
  }
  send(chunks) {
    for (const audio of chunks) this.port.postMessage({type:'audio', audio}, [audio.buffer]);
  }
  process(inputs, outputs) {
    // Explicit silence even if the node is connected to destination to keep
    // the render graph running. Input audio is never played back.
    for (const output of outputs) for (const channel of output) channel.fill(0);
    if (this.closed) return false;
    if (inputs[0]?.length) this.send(this.resampler.push(inputs[0]));
    return true;
  }
}

registerProcessor('pcm-capture', PCMCapture);
