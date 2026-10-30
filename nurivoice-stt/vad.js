import {ort, verifiedAsset, validateAudio} from './ort-runtime.js';

let session = null;
let queue = Promise.resolve();
function serial(fn) { const job = queue.then(fn); queue = job.catch(() => {}); return job; }

export function segmentsFromProbabilities(probabilities, length, {threshold=.5, paddingMs=160, minSilenceMs=100}={}) {
  let start = null, silence = null;
  const spans = [];
  for (let frame = 0; frame < probabilities.length; frame++) {
    const p = probabilities[frame], at = frame * 512;
    if (start === null && p >= threshold) start = at;
    if (start !== null) {
      if (p >= threshold - .15) silence = null;
      else if (silence === null) silence = at;
      else if (at - silence >= 16 * minSilenceMs) { spans.push([start, silence]); start = silence = null; }
    }
  }
  if (start !== null) spans.push([start, length]);
  const result = [], pad = Math.trunc(16 * paddingMs);
  for (let [a,b] of spans) {
    a = Math.max(0,a-pad); b = Math.min(length,b+pad);
    if (result.length && a <= result.at(-1).end) result.at(-1).end = Math.max(b,result.at(-1).end);
    else result.push({start:a,end:b});
  }
  return result;
}

export function detectSpeech(audio, onProgress=()=>{}) {
  return serial(async () => {
    validateAudio(audio);
    if (!audio.length) return [];
    if (!session) {
      const model = await verifiedAsset('models/silero/silero_vad.onnx', onProgress);
      session = await ort.InferenceSession.create(model.bytes, {executionProviders:['wasm'], graphOptimizationLevel:'all'});
    }
    let state = new Float32Array(256), context = new Float32Array(64);
    const probabilities = [];
    for (let i=0; i<audio.length; i+=512) {
      const chunk = new Float32Array(512);
      chunk.set(audio.subarray(i, Math.min(i+512,audio.length)));
      const pcm = new Float32Array(576); pcm.set(context); pcm.set(chunk,64);
      const feeds = {input:new ort.Tensor('float32',pcm,[1,576]), state:new ort.Tensor('float32',state,[2,1,128]), sr:new ort.Tensor('int64',BigInt64Array.of(16000n),[])};
      let out;
      try {
        out = await session.run(feeds);
        probabilities.push(Number(out.output.data[0]));
        state = new Float32Array(out.stateN.data);
      } finally {
        for (const t of Object.values(feeds)) t.dispose();
        if (out) for (const t of Object.values(out)) t.dispose();
      }
      context = chunk.slice(448);
    }
    return segmentsFromProbabilities(probabilities,audio.length);
  });
}

export function disposeVAD() {
  return serial(async () => { if (session) { await session.release(); session = null; } });
}
