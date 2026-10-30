import {ort, verifiedAsset, validateAudio} from './ort-runtime.js';

const INVENTORY = new Set(['a','i','u','ɛ','e','o','ɔ','y','ø','œ','ɑ','ə','ɛ̃','ɑ̃','ɔ̃','œ̃']);
let loaded = null;
let queue = Promise.resolve();
function serial(fn) { const job = queue.then(fn); queue = job.catch(() => {}); return job; }

export function decidePhones(phones, language, target, l1 = null) {
  if (language !== 'fr' || !INVENTORY.has(target)) return {status:'unsupported', reject_reason:'unsupported_target', competitors:[]};
  const candidates = new Set([...INVENTORY].filter(p => p !== target));
  if (l1 === 'ko' && ['u','y'].includes(target)) { candidates.add('ɯ'); candidates.add('ɨ'); }
  const competitors = [...candidates].sort();
  if (!phones.length) return {status:'unknown', reject_reason:'uncertain', competitors};
  if (phones.length !== 1) return {status:'rejected', reject_reason:'other_phone', competitors};
  if (phones[0] !== target) return {status:'rejected', reject_reason:INVENTORY.has(phones[0]) || candidates.has(phones[0]) ? 'other_phone' : 'unknown_phone', competitors};
  return {status:'recognized', reject_reason:null, competitors};
}

export function collapseCTC(data, frames, classes, vocab) {
  const phones = [], means = new Float64Array(classes);
  let previous = -1;
  for (let frame = 0; frame < frames; frame++) {
    let best = 0, maximum = -Infinity;
    for (let c = 0; c < classes; c++) {
      const value = data[frame * classes + c];
      means[c] += value;
      if (value > maximum) { maximum = value; best = c; }
    }
    if (best !== 0 && best !== previous && vocab[best] !== undefined) phones.push(vocab[best]);
    previous = best;
  }
  const scores = {};
  for (let c = 0; c < classes; c++) if (vocab[c] !== undefined) scores[vocab[c]] = means[c] / frames;
  return {phones, scores};
}

async function load(onProgress) {
  if (loaded) return {...loaded, cacheHit:true, loadMs:0};
  const started = performance.now();
  const vocabAsset = await verifiedAsset('models/phoneme/vocab.json', onProgress);
  const mapping = JSON.parse(new TextDecoder().decode(vocabAsset.bytes));
  const vocab = Object.fromEntries(Object.entries(mapping).map(([phone, id]) => [id, phone]));
  const model = await verifiedAsset('models/phoneme/model_q4.onnx', onProgress);
  const session = await ort.InferenceSession.create(model.bytes, {executionProviders:['wasm'], graphOptimizationLevel:'all'});
  loaded = {session, vocab, revision:`sha256:${model.entry.sha256}`};
  return {...loaded, cacheHit:false, loadMs:performance.now() - started};
}

export function recognizePhones(audio, {language='fr', target=null, l1=null, onProgress=()=>{}} = {}) {
  return serial(async () => {
    const started = performance.now();
    const result = {task:'phoneme', transcript:null, phone_hypotheses:[], target_phone:target,
      phone_match:null, language, locale:null, l1, model_id:'phoneme-student-q4-wasm',
      model_revision:null, score_type:'unscored', validated:false, status:'unknown', reject_reason:null};
    try {
      validateAudio(audio);
      const capability = decidePhones([], language, target, l1);
      if (capability.status === 'unsupported') return Object.assign(result, capability);
      if (!audio.length) return Object.assign(result, capability);
      const {session, vocab, revision, cacheHit, loadMs} = await load(onProgress);
      result.model_revision = revision;
      // Population variance normalization matches the Python model adapter.
      let mean = 0;
      for (const v of audio) mean += v;
      mean /= audio.length;
      let variance = 0;
      for (const v of audio) variance += (v - mean) ** 2;
      const scale = Math.sqrt(variance / audio.length + 1e-7);
      const input = Float32Array.from(audio, v => (v - mean) / scale);
      const mask = new BigInt64Array(audio.length).fill(1n);
      const feeds = {input_values:new ort.Tensor('float32', input, [1, input.length]),
        attention_mask:new ort.Tensor('int64', mask, [1, input.length])};
      const inferenceStart = performance.now();
      let outputs;
      try {
        outputs = await session.run(feeds);
        const tensor = outputs.logits;
        if (tensor.dims.length !== 3 || tensor.dims[0] !== 1) throw new Error('Unexpected phoneme logits dimensions');
        const {phones, scores} = collapseCTC(tensor.data, tensor.dims[1], tensor.dims[2], vocab);
        const decision = decidePhones(phones, language, target, l1);
        Object.assign(result, decision, {phone_hypotheses:phones,
          candidate_evidence:{score_type:'mean_frame_logits_unscaled', target:scores[target] ?? null,
            competitors:Object.fromEntries(decision.competitors.filter(p => scores[p] !== undefined).map(p => [p, scores[p]])), calibrated:false},
          timing:{cache_hit:cacheHit, model_load_ms:loadMs, inference_ms:performance.now()-inferenceStart}});
      } finally {
        for (const t of Object.values(feeds)) t.dispose();
        if (outputs) for (const t of Object.values(outputs)) t.dispose();
      }
    } catch (error) {
      Object.assign(result, {status:'error', reject_reason:'input_or_runtime_error', error:String(error.message || error)});
    } finally { result.runtime_ms = performance.now() - started; }
    return result;
  });
}

export function disposePhones() {
  return serial(async () => { if (loaded) { await loaded.session.release(); loaded = null; } });
}
