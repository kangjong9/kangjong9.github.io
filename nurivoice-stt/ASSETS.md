# 자체 호스팅 추론 자산

2026-10-30 확보. 다운로드 재현은 `acquire_assets.py`, 개별 파일 pin/출처/용량/SHA-256/라이선스는 `asset-manifest.json`이다. Whisper/음소/VAD 초기 47개 파일 240,097,055 bytes에서 French streaming 자산을 추가했다. 최신 파일별 수량/용량은 manifest가 기준이다. 최대 단일 파일 76,799,940 bytes, 전부 GitHub의 100MB 단일 파일 기준보다 작다. 실제 GitHub 게시·폰 실행은 이 자산 검증과 별개다.

## 런타임

- 공식 npm `@huggingface/transformers@3.8.1`에서 `vendor/transformers.min.js`.
- 해당 패키지의 정확한 ORT 의존 `onnxruntime-web@1.22.0-dev.20250409-89f8206ba4`에서 `vendor/ort.bundle.min.mjs`, `ort.min.mjs`, SIMD threaded 및 JSEP `.mjs/.wasm` 확보.
- npm 배포 archive를 registry의 SHA-512 integrity와 대조했다. 변환 라이브러리는 Apache-2.0, ONNX Runtime은 MIT이며 `licenses/`에 원문 동봉.
- Transformers bundle은 `ort.bundle.min.mjs`를 동적 참조하므로 이 파일도 필수다. source map은 디버깅 전용으로 배포하지 않았다.

연결 예시: `import {pipeline, env} from './vendor/transformers.min.js'`; `env.allowRemoteModels=false`; `env.localModelPath=new URL('./models/', location.href).href`; `env.backends.onnx.wasm.wasmPaths=new URL('./vendor/', location.href).href`; `env.backends.onnx.wasm.numThreads=1`. worker에서는 URL 기준을 해당 worker의 `import.meta.url`로 맞춘다. `pipeline('automatic-speech-recognition','whisper-tiny',{dtype:'q8',device:'wasm'})`, base는 `whisper-base` 사용.

CDN/Hugging Face는 자산 확보 시 출처이며 앱 런타임 다운로드 대상으로 설정하지 않는다. Pages에서 COOP/COEP 교차출처 격리를 가정하지 않고 WASM 단일 스레드를 사용한다. 브라우저 저장 캐시/서비스워커 정책은 앱 구현에서 별도 관리한다.

## Whisper

Xenova/whisper-tiny revision `5332fcc35e32a33b86612b9a57a89be7906102b1`, Xenova/whisper-base revision `64da57285918e20ea79ea5c88eed7197933abaa8`. 각 모델 config/tokenizer/preprocessor/generation 설정과 q8 encoder 및 merged decoder를 동일 revision에서 확보했다.

| 모델 | encoder | merged decoder |
|---|---:|---:|
| tiny q8 | 10,124,910 | 30,727,765 |
| base q8 | 23,200,850 | 53,707,539 |

4개 ONNX SHA-256은 공식 revision API의 LFS oid와 일치했다. desktop sherpa ONNX와는 입출력 구조가 다른 브라우저용 변환본이다. desktop 정확도 결과를 이 변환본의 측정 결과로 간주하지 않는다. 브라우저 추론 검증이 별도로 필요하다.

**권리 표시:** 현재 Xenova 변환본 모델 카드 라이선스는 `apache-2.0`이다. 원 OpenAI Whisper MIT만으로 변환본을 MIT라고 표시하지 않는다. 각 모델 README와 Apache-2.0 원문, 원 Whisper MIT 원문을 동봉했다. 카드 원문을 수정하지 않았다.

## 음소와 VAD

기존 프로젝트에서 pin/권리가 확인된 원본을 변경 없이 복사했다. 원 출처·revision·SHA는 `licenses/desktop_upstream_provenance.csv`, 관련 라이선스는 `PHONEME_LICENSE.txt`, `SILERO_VAD_LICENSE.txt`.

- `models/phoneme/model_q4.onnx`(76,799,940 bytes), vocab.json: air-air/xlsr-53-espeak-student-ONNX revision `5f7232263ceb005be09efaf2ff702d90dbce75c3`, Apache-2.0. 입력 input_values float[batch,samples], attention_mask int64[batch,samples]. 출력 logits float[batch,frames,392]. 정규화 및 CTC 반복/blank 제거 필요. 원시 logits는 보정된 발음 점수가 아니다.
- `models/silero/silero_vad.onnx`(2,327,524 bytes), MIT. input float[?,?], state float[2,?,128], sr int64 scalar → output float[?,1], stateN float[?,?,?]. 모델의 샘플/문맥/상태 프로토콜을 맞춰야 한다.

위 입출력은 로컬 ONNX Runtime으로 실제 세션을 열어 확인했다. ORT Web WASM 지원 여부는 이 문서만으로 보증하지 않으며 브라우저 실제 세션/추론 시험에서 확인한다. 위 Whisper 파일 모드가 true streaming 모델이라는 주장은 하지 않는다.

## French online Zipformer

공식 npm `sherpa-onnx@2.0.1`의 모델 없는 WASM(15,203,446 bytes), ASR wrapper, Emscripten loader를 SHA-512 검증 후 확보했다. 라이선스 Apache-2.0. `vendor/sherpa/`에 원본을 보존한다. 해당 npm은 Node용 NODERAWFS를 기본 활성화하므로 파생 `sherpa-onnx-wasm-browser.js`에서는 비-Node 환경 오류를 제거하고 NODERAWFS 교체를 Node 환경에만 한정했다. `stream-worker.js`의 POSIX 경로 shim과 원래 포함된 MEMFS를 사용한다. WASM binary는 변경하지 않았다. 파생 loader의 수정내역·별도 SHA도 명시했다.

French model은 shaojieli/sherpa-onnx-streaming-zipformer-fr-2023-04-14 revision `3db9565d9633758d6b87b9a7b3dc09ebfb6b2c73`, Apache-2.0이다. 기존 검증 원본을 보존하고 web 복사본 encoder만 `encoder.onnx.part0` 64,000,000 bytes + `part1` 62,655,903 bytes로 분할했다. 연결 원본 SHA-256 `47a94a7fdc8dff63d708be4ea0535747640224467f91e238311f1ddbdd09327e`. decoder/joiner/tokens와 공식 metadata도 동봉했다. 외부 대형 모델 archive를 중복 다운로드하지 않았다.

`stream-worker.js`는 classic worker로 모델을 SHA 검증 후 MEMFS에 넣고 `createOnlineRecognizer(Module)`를 초기화한다. 입력은 완료된 16kHz mono Float32Array이며 160ms씩 state를 유지해 `acceptWaveform/isReady/decode/getResult`, 마지막 300ms tail과 `inputFinished`를 실행한다. partial transcript와 실제 모델 token timestamps를 반환한다. 아직 이 파일 구현 자체가 폰 마이크 실시간 성능 검증을 뜻하지 않는다. 최종 브라우저 결과는 별도 앱 검증 보고를 따른다.
