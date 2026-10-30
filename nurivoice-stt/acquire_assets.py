"""Pin and vendor public browser inference assets; no runtime CDN dependency."""
import base64
import hashlib
import io
import json
import tarfile
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROWS = []


def fetch(url):
    with urllib.request.urlopen(url, timeout=180) as response:
        return response.read()


def save(relative, data, source, revision, license_name):
    path = HERE / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    if len(data) >= 100_000_000:
        raise ValueError('GitHub asset exceeds 100 MB: ' + relative)
    path.write_bytes(data)
    ROWS.append(dict(path=relative, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(),
                     source=source, revision=revision, license=license_name))
    (HERE / 'asset-manifest.json').write_text(json.dumps(ROWS, indent=2), encoding='utf-8')
    print(relative, len(data), flush=True)


def npm(name, version, wanted):
    metadata = json.loads(fetch(f'https://registry.npmjs.org/{name}/{version}'))
    url = metadata['dist']['tarball']
    data = fetch(url)
    algorithm, digest = metadata['dist']['integrity'].split('-', 1)
    assert base64.b64encode(hashlib.new(algorithm, data).digest()).decode() == digest
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        for member in archive:
            target = wanted(member.name)
            if target:
                save(target, archive.extractfile(member).read(), url + '#' + member.name,
                     version, metadata.get('license', 'SEE LICENSE'))


def main():
    npm('@huggingface/transformers', '3.8.1', lambda name:
        'vendor/transformers.min.js' if name == 'package/dist/transformers.min.js' else
        'licenses/transformers-LICENSE' if name == 'package/LICENSE' else None)
    npm('onnxruntime-web', '1.22.0-dev.20250409-89f8206ba4', lambda name:
        'vendor/' + name.split('/')[-1] if name.startswith('package/dist/') and
        (name.endswith('.wasm') or name.endswith('.mjs') and 'ort-wasm' in name or name in ('package/dist/ort.min.mjs', 'package/dist/ort.bundle.min.mjs')) else
        'licenses/onnxruntime-LICENSE' if name == 'package/LICENSE' else None)
    revisions = {'tiny': '5332fcc35e32a33b86612b9a57a89be7906102b1',
                 'base': '64da57285918e20ea79ea5c88eed7197933abaa8'}
    for size, revision in revisions.items():
        repo = 'Xenova/whisper-' + size
        info = json.loads(fetch('https://huggingface.co/api/models/' + repo + '/revision/' + revision))
        license_name = info['cardData']['license']
        assert license_name == 'apache-2.0'
        names = [x['rfilename'] for x in info['siblings']]
        selected = [n for n in names if '/' not in n and (n.endswith('.json') or n in ('merges.txt', 'README.md', 'LICENSE'))]
        selected += ['onnx/encoder_model_quantized.onnx', 'onnx/decoder_model_merged_quantized.onnx']
        for name in selected:
            url = f'https://huggingface.co/{repo}/resolve/{revision}/{name}'
            save('models/whisper-' + size + '/' + name, fetch(url), url, revision, license_name)
        tree = json.loads(fetch(f'https://huggingface.co/api/models/{repo}/tree/{revision}/onnx'))
        for row in ROWS:
            if row['path'].startswith('models/whisper-' + size + '/onnx/'):
                remote = next(item for item in tree if item['path'] == row['path'].split('/', 2)[2])
                assert remote['lfs']['oid'] == row['sha256']
                row.update(upstream_sha256=remote['lfs']['oid'], upstream_hash_verified=True)
    for name, url, revision, license_name in [
        ('Apache-2.0.txt', 'https://www.apache.org/licenses/LICENSE-2.0.txt', '2.0', 'Apache-2.0'),
        ('Whisper-MIT.txt', 'https://raw.githubusercontent.com/openai/whisper/v20250625/LICENSE', 'v20250625', 'MIT')]:
        save('licenses/' + name, fetch(url), url, revision, license_name)
    for source, target, license_name in [
        ('models/phoneme.onnx', 'models/phoneme/model_q4.onnx', 'Apache-2.0'),
        ('models/vocab.json', 'models/phoneme/vocab.json', 'Apache-2.0'),
        ('models/silero_vad.onnx', 'models/silero/silero_vad.onnx', 'MIT'),
        ('licenses/PHONEME_LICENSE.txt', 'licenses/PHONEME_LICENSE.txt', 'Apache-2.0'),
        ('licenses/SILERO_VAD_LICENSE.txt', 'licenses/SILERO_VAD_LICENSE.txt', 'MIT'),
        ('licenses/ONNXRUNTIME_LICENSE.txt', 'licenses/ONNXRUNTIME_LICENSE.txt', 'MIT'),
        ('models/upstream_provenance.csv', 'licenses/desktop_upstream_provenance.csv', 'metadata')]:
        save(target, (HERE.parent / source).read_bytes(), 'project:' + source,
             'see desktop_upstream_provenance.csv', license_name)
    npm('sherpa-onnx', '2.0.1', lambda name:
        'vendor/sherpa/' + name.split('/')[-1] if name.split('/')[-1] in
        ('sherpa-onnx-wasm-nodejs.js', 'sherpa-onnx-wasm-nodejs.wasm', 'sherpa-onnx-asr.js', 'package.json') else None)
    wrapper = (HERE / 'vendor/sherpa/sherpa-onnx-wasm-nodejs.js').read_text(encoding='utf-8')
    guard = 'if(!ENVIRONMENT_IS_NODE){throw new Error("NODERAWFS is currently only supported on Node.js environment.")}'
    replace_fs = 'for(var _key in NODERAWFS){FS[_key]=_wrapNodeError(NODERAWFS[_key])}'
    assert wrapper.count(guard) == wrapper.count(replace_fs) == 1
    wrapper = wrapper.replace(guard, '').replace(replace_fs, 'if(ENVIRONMENT_IS_NODE){' + replace_fs + '}')
    wrapper = '/* Browser derivative: retain MEMFS; POSIX path shim provided by stream-worker.js. Original npm sherpa-onnx 2.0.1 Apache-2.0. */\n' + wrapper
    save('vendor/sherpa/sherpa-onnx-wasm-browser.js', wrapper.encode('utf-8'),
         'derived from vendor/sherpa/sherpa-onnx-wasm-nodejs.js', '2.0.1 + MEMFS browser adaptation', 'Apache-2.0')
    save('licenses/SHERPA_LICENSE.txt', (HERE.parent / 'licenses/SHERPA_LICENSE.txt').read_bytes(),
         'project:licenses/SHERPA_LICENSE.txt', 'desktop retained', 'Apache-2.0')
    folder = HERE.parent / 'models/zipformer-fr'
    for kind in ('encoder', 'decoder', 'joiner', 'tokens'):
        source = next(folder.glob(kind + '*'))
        data = source.read_bytes()
        if kind == 'encoder':
            for index, start in enumerate(range(0, len(data), 64_000_000)):
                save(f'models/zipformer-fr/encoder.onnx.part{index}', data[start:start + 64_000_000],
                     'project:models/zipformer-fr/' + source.name, 'see zipformer_fr_model_metadata.json', 'Apache-2.0')
        else:
            save('models/zipformer-fr/' + ('tokens.txt' if kind == 'tokens' else kind + '.onnx'), data,
                 'project:models/zipformer-fr/' + source.name, 'see zipformer_fr_model_metadata.json', 'Apache-2.0')
    save('licenses/zipformer_fr_model_metadata.json', (HERE.parent / 'licenses/zipformer_fr_model_metadata.json').read_bytes(),
         'project:licenses/zipformer_fr_model_metadata.json', 'desktop provenance', 'metadata')


if __name__ == '__main__':
    main()
