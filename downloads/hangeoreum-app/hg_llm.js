/* 학습 AI 선택(HGLLM) · Claude 연결(HGCLAUDE) · 대본 직접 가져오기 — 2026-10-28 옵빠야 지시
   - 사용자가 고른 구독 AI(ChatGPT 또는 Claude)만 쓴다. 고른 AI가 한도·연결 실패면 알림 후 무료 Gemini → 내장 학습.
     다른 구독 AI나 유료 API로 몰래 넘어가지 않는다.
   - Claude: 앱에 인증정보가 없다. PC의 'Claude 대본 도우미'(tools/claude_bridge, 공식 claude -p · 구독 로그인)를
     USB(adb reverse 127.0.0.1:8791)로 호출한다. 공식 문서상 제3자 앱의 claude.ai 로그인 제공은 사전 승인 필요 → 개인 사용 전용.
   - 직접 가져오기: 공식 앱(Gemini 등)에서 만든 대본을 붙여 넣으면 규칙 검사 후 저장. '직접 가져옴'으로 표시한다. */
(function () {
  'use strict';
  const PREF = 'hg_llm_provider', MODEL_KEY = 'hg_claude_model';
  const LABEL = { chatgpt: 'Chat-Gpt', claude: 'Claude', gemini: 'Gemini' };
  const load = (k, d) => { try { return localStorage.getItem(k) || d; } catch (_) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const native = () => !!(window.Native && typeof Native.call === 'function');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const cancelErr = () => Object.assign(new Error('요청을 취소했어요.'), { code: 'CANCELLED' });
  const toast = (m, ms) => { if (window.hgToast) hgToast(m, ms || 4500); };

  /* ---------- Claude (PC 대본 도우미) ---------- */
  const LIMIT_KEY = 'hg_claude_limited_until', LIMIT_MS = 30 * 60 * 1000;
  let st = { ok: false, message: '확인 전' }, lastModel = '';
  const model = () => load(MODEL_KEY, 'sonnet');
  const limited = () => (+load(LIMIT_KEY, 0) || 0) > Date.now();
  function raw(name, args) { return JSON.parse(Native.call(name, JSON.stringify(args || {}))); }
  function checkStatus() {
    if (!native()) { st = { ok: false, message: 'Claude 연결은 Android 앱에서 사용할 수 있어요.' }; return st; }
    try { st = raw('claudeStatus'); } catch (_) { st = { ok: false, message: 'Claude 상태를 확인하지 못했어요.' }; }
    return st;
  }
  const claudeReady = () => !!(st.ok && st.loggedIn && st.subscription) && !limited();
  function noteFail(e) {
    if (e.code === 'rate_limit') { store(LIMIT_KEY, String(Date.now() + LIMIT_MS)); toast('Claude 구독 사용 한도에 도달했어요.<br>무료 Gemini(키가 없으면 내장 학습)로 이어갑니다.', 5000); }
    else if (/NO_BRIDGE|NETWORK|NOT_SUBSCRIPTION/.test(e.code || '')) { st = { ok: false, message: e.message }; toast(e.message + '<br>무료 Gemini(키가 없으면 내장 학습)로 이어갑니다.', 5000); }
  }
  let chain = Promise.resolve();
  function claudeGenerate(prompt, options = {}) {
    const run = async () => {
      if (options.signal?.aborted) throw cancelErr();
      const start = raw('claudeGenerate', { prompt, model: model() });
      if (!start.ok) throw Object.assign(new Error(start.message), { code: start.code });
      let aborted = false;
      const onAbort = () => { aborted = true; try { raw('claudeCancel'); } catch (_) {} };
      options.signal?.addEventListener('abort', onAbort, { once: true });
      try {
        const deadline = Date.now() + 170000;
        while (Date.now() < deadline) {
          await sleep(400);
          if (aborted) throw cancelErr();
          const r = raw('claudePoll', { job: start.job });
          if (r.pending) continue;
          if (!r.ok) throw Object.assign(new Error(r.message || 'Claude 요청이 실패했어요.'), { code: r.code || '' });
          lastModel = r.model || model();
          return r.text;
        }
        raw('claudeCancel');
        throw new Error('Claude 응답 시간이 초과됐어요.');
      } finally { options.signal?.removeEventListener('abort', onAbort); }
    };
    const p = chain.then(run, run);
    chain = p.catch(() => {});
    return p.catch(e => { if (e.code !== 'CANCELLED') noteFail(e); throw e; });
  }
  // Gemini 형식 요청 본문 → 텍스트 프롬프트 (HGCHATGPT.request와 같은 변환)
  function toPrompt(body) {
    const instructions = (body.systemInstruction?.parts || []).map(p => p.text || '').join('\n');
    const turns = (body.contents || []).map(c => `${c.role || 'user'}: ${(c.parts || []).map(p => p.text || '').join('\n')}`).join('\n');
    const format = body.generationConfig?.responseMimeType === 'application/json' ? '\n요청한 스키마의 JSON만 출력하세요.' : '';
    return instructions + '\n' + turns + format;
  }
  window.HGCLAUDE = {
    ready: claudeReady, generate: claudeGenerate, status: checkStatus, model: () => lastModel || model(),
    request: (body, options = {}) => body.tools?.length ? Promise.reject(new Error('현재 학습 연결은 텍스트 전용입니다.')) : claudeGenerate(toPrompt(body), options)
  };

  /* ---------- 학습 AI 선택 라우터 ---------- */
  const pref = () => load(PREF, 'chatgpt');
  const api = id => id === 'claude' ? window.HGCLAUDE : window.HGCHATGPT;
  function active() {
    const id = pref(), p = api(id);
    return p && p.ready() ? { id, api: p, label: LABEL[id] } : null;
  }
  const isCancel = e => !!e && (e.code === 'CANCELLED' || e.name === 'AbortError');
  window.HGLLM = {
    LABEL, active, isCancel, pref,
    ready: () => !!active(), name: () => active()?.label || '',
    setPref: id => { store(PREF, id === 'claude' ? 'claude' : 'chatgpt'); render(); }
  };

  /* ---------- 설정 화면: 학습 AI 한 줄 선택 + ChatGPT·Claude·Gemini 접이식 칸(닫으면 한 줄) ---------- */
  const geminiKey = () => (typeof getActiveApiKey === 'function' ? getActiveApiKey() : '') || '';
  function render() {
    const root = document.getElementById('hgLlmSettings'); if (!root) return;
    root.querySelector('[data-llm-pick]').value = pref();
    const gptOn = window.HGCHATGPT && HGCHATGPT.ready();
    const cl = claudeReady();
    const gptLine = root.querySelector('[data-gpt-line]');
    if (gptLine) gptLine.textContent = gptOn ? '연결됨' : (window.HGCHATGPT ? '연결 안 됨 · 열어서 로그인' : 'Android 앱에서 사용');
    root.querySelector('[data-claude-line]').textContent = limited() ? '한도 도달 · 잠시 무료/내장 사용' : cl ? `연결됨 · ${st.plan || '구독'}` : 'PC 도우미 연결 안 됨';
    root.querySelector('[data-claude]').textContent = cl ? `PC Claude Code · claude.ai ${st.plan || '구독'} 로그인 · 모델 ${model()}` : (st.message || 'PC 도우미 연결 안 됨');
    root.querySelector('[data-gemini-line]').textContent = geminiKey() ? '무료 키 저장됨' : '키 없음';
    root.querySelector('[data-model]').value = model();
    const a = active();
    root.querySelector('[data-now]').textContent = a ? `지금 학습 AI: ${a.label}` : '고른 AI가 준비되지 않아 무료 Gemini(키가 있을 때) 또는 내장 학습을 써요.';
    const short = root.querySelector('[data-now-short]'); if (short) short.textContent = a ? a.label : '무료·내장';
  }
  const BTN = 'min-height:44px;border:1px solid #94a3b8;border-radius:10px;padding:8px 12px;background:#fff;color:#1e1b4b;font-weight:800';
  const ROW = 'border:1.5px solid #c7d2fe;border-radius:14px;background:#fff;margin:8px 0;padding:0 12px';
  const SUM = 'display:flex;justify-content:space-between;gap:8px;align-items:center;min-height:48px;font-weight:900;cursor:pointer';
  function mount() {
    const sheet = document.querySelector('#settingsModal .modal-sheet');
    if (!sheet || document.getElementById('hgLlmSettings')) return;
    const root = document.createElement('section'); root.id = 'hgLlmSettings';
    root.style.cssText = 'margin:0 0 18px;padding:14px;border:1.5px solid #c7d2fe;border-radius:18px;background:#eef2ff;color:#1e1b4b';
    // 2026-10-28 옵빠야 지시: 학습 AI 묶음은 평소 접어 두고(한 줄: 학습 AI · 지금 쓰는 AI ▾) 누르면 펼침
    root.style.padding = '0 14px';
    root.innerHTML = `<details data-llm-fold><summary style="${SUM};font-size:16px;list-style:none"><span>🤖 학습 AI</span><span style="display:flex;align-items:center;gap:6px"><span data-now-short style="font-size:13px;color:#4338ca"></span><span aria-hidden="true">▾</span></span></summary>
      <div style="padding-bottom:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800">사용할 AI
        <select data-llm-pick style="flex:1;min-height:44px;font-weight:800"><option value="chatgpt">ChatGPT</option><option value="claude">Claude</option></select></label>
      <p data-now style="font-size:13px;font-weight:700;margin:6px 0 4px"></p>
      <details data-row="chatgpt" style="${ROW}"><summary style="${SUM}"><span>ChatGPT</span><span data-gpt-line style="font-size:13px;color:#475569"></span></summary><div data-gpt-body></div></details>
      <details data-row="claude" style="${ROW}"><summary style="${SUM}"><span>Claude</span><span data-claude-line style="font-size:13px;color:#475569"></span></summary>
        <p data-claude style="font-weight:800;font-size:14px"></p>
        <p style="font-size:13px;line-height:1.5;margin:4px 0 8px">PC에서 <b>tools/claude_bridge/Claude대본도우미.bat</b>을 켜고 휴대폰을 USB로 연결하세요. PC의 Claude 구독 사용량을 쓰며 본인 PC·본인 계정 개인 사용 전용입니다.</p>
        <label style="font-size:14px">모델 <select data-model style="min-height:44px;margin:4px 0;width:100%"><option value="sonnet">Sonnet (기본)</option><option value="haiku">Haiku (빠름)</option><option value="opus">Opus (고급)</option></select></label>
        <p><button type="button" data-check style="${BTN}">연결 확인</button></p></details>
      <details data-row="gemini" style="${ROW}"><summary style="${SUM}"><span>Gemini</span><span data-gemini-line style="font-size:13px;color:#475569"></span></summary>
        <p style="font-size:13px;line-height:1.5">Gemini는 구독 계정을 앱에 연결하는 공식 방법이 없어요. Google AI Studio 무료 API 키(무료 등급)로 쓰거나, Gemini 앱에서 만든 대본을 아래에서 직접 가져올 수 있어요. 고른 AI가 한도에 걸리면 이 무료 키로 이어 갑니다.</p>
        <input type="password" id="apiKeyInput" autocomplete="off" placeholder="AIzaSy... (본인 Google AI Studio 무료 키)" style="width:100%;box-sizing:border-box;min-height:44px;border:1px solid #94a3b8;border-radius:10px;padding:8px 10px">
        <p style="display:flex;flex-wrap:wrap;gap:8px"><button type="button" data-gsave style="${BTN}">💾 저장</button><button type="button" data-gtest style="${BTN}">🧪 연결 테스트</button><button type="button" data-gclear style="${BTN};color:#b91c1c">🗑️ 키 삭제</button></p>
        <div id="apiTestStatus" style="font-size:13px;font-weight:800;min-height:18px"></div>
        <details style="margin:10px 0"><summary style="font-weight:800;cursor:pointer;min-height:40px">대본 직접 가져오기 (Gemini 앱 등)</summary>
          <p style="font-size:13px;line-height:1.5">1) 요청문을 복사해 Gemini·Claude·ChatGPT 공식 앱에 붙여 넣고 2) 받은 JSON 대본을 아래에 붙여 넣으세요. 지금 세트의 학습 문장 4개가 모두 들어 있어야 저장돼요. 자동 연결이 아니라 직접 가져온 자료로 표시됩니다.</p>
          <button type="button" data-copy style="${BTN}">지금 세트 요청문 복사</button>
          <select data-src style="min-height:44px;margin:8px 0;width:100%"><option value="Gemini">Gemini 앱에서 만듦</option><option value="Claude">Claude 앱에서 만듦</option><option value="Chat-Gpt">ChatGPT 앱에서 만듦</option></select>
          <textarea data-json rows="5" style="width:100%;box-sizing:border-box;font-size:13px" placeholder='{"speakers":[...],"lines":[...]}'></textarea>
          <button type="button" data-import style="${BTN};background:#4338ca;color:#fff;border:0">검사 후 저장</button>
          <p data-import-msg role="status" style="font-size:13px"></p>
        </details></details></div></details>`;
    // ChatGPT 칸: 기존 로그인 패널을 그대로 옮겨 담는다 (기능·id 유지). 패널 자리에 학습 AI 묶음을 둔다
    // 위치: 강사 목소리 칸 바로 위 (설정의 첫 묶음)
    const anchor = document.getElementById('btnTutorFemale')?.closest('div[style*="border-radius:18px"]');
    if (anchor) anchor.before(root); else sheet.prepend(root);
    const gptPanel = document.getElementById('hgChatGptSettings');
    if (gptPanel) {
      gptPanel.style.cssText = 'margin:0 0 10px;padding:0;border:0;background:none;color:#134e4a';
      gptPanel.querySelector('h3')?.remove();
      root.querySelector('[data-gpt-body]').appendChild(gptPanel);
    } else {
      root.querySelector('[data-gpt-body]').innerHTML = '<p style="font-size:13px">ChatGPT 로그인은 Android 앱에서 사용할 수 있어요.</p>';
    }
    root.querySelector('[data-llm-pick]').onchange = e => { if (e.target.value === 'claude') checkStatus(); HGLLM.setPref(e.target.value); };
    root.querySelector('[data-gsave]').onclick = () => { if (typeof saveApiSettings === 'function') saveApiSettings(); render(); };
    root.querySelector('[data-gtest]').onclick = () => { if (typeof testApiConnection === 'function') testApiConnection(); };
    root.querySelector('[data-gclear]').onclick = () => { if (typeof clearApiSettings === 'function') clearApiSettings(); render(); };
    root.querySelector('[data-model]').onchange = e => { store(MODEL_KEY, e.target.value); render(); };
    root.querySelector('[data-check]').onclick = () => { checkStatus(); render(); };
    root.querySelector('[data-copy]').onclick = async () => {
      const msg = root.querySelector('[data-import-msg]');
      const c = typeof activeSessionCase !== 'undefined' ? activeSessionCase : null;
      if (!c || !window.HGDIALOG) { msg.textContent = '수업 세트를 먼저 열어 주세요.'; return; }
      const text = HGDIALOG._buildPrompt(c);
      try { await navigator.clipboard.writeText(text); msg.textContent = '요청문을 복사했어요.'; }
      catch (_) { root.querySelector('[data-json]').value = text; msg.textContent = '복사가 막혀 아래 칸에 요청문을 넣었어요. 직접 복사해 주세요.'; }
    };
    root.querySelector('[data-import]').onclick = () => {
      const r = window.HGDIALOG ? HGDIALOG.importDialog(root.querySelector('[data-json]').value, root.querySelector('[data-src]').value) : { ok: false, message: '대본 기능을 찾지 못했어요.' };
      root.querySelector('[data-import-msg]').textContent = r.message;
      if (r.ok) root.querySelector('[data-json]').value = '';
    };
    new MutationObserver(() => { if (!sheet.parentElement.classList.contains('hidden')) render(); }).observe(sheet.parentElement, { attributes: true, attributeFilter: ['class'] });
    render();
  }
  // 시작 직후 한 번 PC 도우미 상태를 확인한다 (Claude를 고른 경우만)
  setTimeout(() => { if (pref() === 'claude') { checkStatus(); render(); } }, 1500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
