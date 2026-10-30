import * as ort from './vendor/ort.min.mjs';

ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
ort.env.wasm.wasmPaths = new URL('./vendor/', import.meta.url).href;
export { ort };

let manifestPromise;
export async function verifiedAsset(path, onProgress = () => {}) {
  const base = new URL('./', import.meta.url);
  const url = new URL(path, base);
  if (url.origin !== base.origin || !url.href.startsWith(base.href)) throw new Error('same-origin project asset required');
  manifestPromise ||= fetch(new URL('asset-manifest.json', base), {credentials: 'same-origin'})
    .then(r => { if (!r.ok) throw new Error('asset manifest unavailable'); return r.json(); })
    .catch(e => { manifestPromise = null; throw e; });
  const entry = (await manifestPromise).find(e => e.path === path);
  if (!entry) throw new Error(`Unregistered asset: ${path}`);
  onProgress({status: 'progress', stage: 'download', file: path, progress: 0});
  const response = await fetch(url, {credentials: 'same-origin', cache: 'force-cache'});
  if (!response.ok) throw new Error(`Asset HTTP ${response.status}: ${path}`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== entry.bytes) throw new Error(`Asset size mismatch: ${path}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
  if (sha !== entry.sha256) throw new Error(`Asset SHA mismatch: ${path}`);
  onProgress({status: 'progress', stage: 'verified', file: path, progress: 100});
  return {bytes, entry};
}

export function validateAudio(audio) {
  if (!(audio instanceof Float32Array) || audio.length > 16000 * 120 || !audio.every(Number.isFinite)) {
    throw new Error('Expected finite 16kHz mono Float32Array, at most 120 seconds');
  }
}
