const VERSION='nurivoice-web-0.3.0-8';
const ROOT=new URL('./',self.location.href);
const SHELL=['./','index.html','style.css','studio.css','app.js','worker.js','live-sdk.js','native-stream.js','pcm-capture.js','resample.js','version.json'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL.map(p=>new URL(p,ROOT).href))));
});
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const name of await caches.keys())if(name.startsWith('nurivoice-web-')&&name!==VERSION)await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  if(url.pathname.endsWith('/version.json'))return;
  event.respondWith((async()=>{
    const cache=await caches.open(VERSION);
    const saved=await cache.match(event.request);
    if(saved)return saved;
    const response=await fetch(event.request);
    if(response.ok)event.waitUntil(cache.put(event.request,response.clone()).catch(()=>{}));
    return response;
  })());
});
