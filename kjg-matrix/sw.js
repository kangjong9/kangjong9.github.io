// [사령관님 지시 2026-11-02] 휴대폰 아이콘 하나로 사무실·집 중 켜진 PC의 매트릭스를 찾아간다.
// 화면 이동(navigate)만 다룬다. 앱 파일·데이터 요청은 건드리지 않고 캐시도 하지 않는다.
const STORE = 'kjg-matrix-hosts';
const HOSTS = '/_cnv/hosts.json';

async function knownHosts() {
  const saved = await caches.open(STORE).then(cache => cache.match(HOSTS)).then(r => r?.json(), () => null);
  return [...new Set([location.hostname, ...(saved || [])])];
}
// 매트릭스가 열릴 때마다 지금 PC가 아는 매트릭스 주소 목록을 받아 둔다.
async function refreshHosts() {
  try {
    const response = await fetch('/_cnv/matrix-hosts', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const hosts = (await response.json()).filter(host => typeof host === 'string' && /^[a-z0-9.-]+\.ts\.net$/.test(host));
    const merged = [...new Set([...(await knownHosts()), ...hosts])];
    await (await caches.open(STORE)).put(HOSTS, new Response(JSON.stringify(merged), { headers: { 'Content-Type': 'application/json' } }));
  } catch { /* 다음 접속 때 다시 받는다. */ }
}

function finder(hosts) {
  const list = JSON.stringify(hosts);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f4f3e9"><title>KJG 매트릭스 찾는 중</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f3e9;color:#24302a;font:16px/1.6 system-ui,sans-serif}
main{padding:24px;text-align:center;max-width:360px}h1{font-size:20px;margin:0 0 8px}p{margin:0 0 16px;color:#55605a}
button{border:0;border-radius:12px;padding:12px 24px;background:#3d5a45;color:#fff;font-size:16px}</style></head>
<body><main><h1>KJG 매트릭스</h1><p id="msg">켜져 있는 PC를 찾는 중입니다…</p><button id="retry" hidden>다시 찾기</button></main>
<script>
const hosts = ${list}, msg = document.getElementById('msg'), retry = document.getElementById('retry');
// 각 PC에 매트릭스가 켜져 있는지 묻는다. 꺼진 PC는 응답이 없거나 'off'로 답한다.
const alive = host => fetch('https://' + host + '/_cnv/alive?' + Date.now(), { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(6000) }).then(r => { if (!r.ok) throw Error(); return host; });
async function find() {
  retry.hidden = true; msg.textContent = '켜져 있는 PC를 찾는 중입니다…';
  try { const host = await Promise.any(hosts.map(alive)); msg.textContent = host.split('.')[0] + ' 매트릭스로 이동합니다.'; location.replace('https://' + host + '/' + location.search + location.hash); }
  catch { msg.textContent = '켜져 있는 매트릭스 PC가 없습니다. PC에서 매트릭스와 Tailscale을 켠 뒤 다시 찾아 주세요.'; retry.hidden = false; }
}
retry.onclick = find; find();
</script></body></html>`;
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { signal: AbortSignal.timeout(8000) });
      // PC는 켜졌지만 매트릭스 서버가 꺼졌을 때(Tailscale 502·503·504)도 다른 PC를 찾는다.
      if (response.status < 502 || response.status > 504) { event.waitUntil(refreshHosts()); return response; }
      throw Error('matrix off');
    } catch {
      const others = (await knownHosts()).filter(host => host !== location.hostname);
      return new Response(finder([...others, location.hostname]), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
  })());
});
