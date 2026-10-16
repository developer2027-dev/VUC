// Expedição VUC — funciona offline depois da primeira abertura.
const CACHE='expedicao-vuc-v3';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png',
 './ocr/tesseract.min.js','./ocr/worker.min.js','./ocr/core/tesseract-core-lstm.wasm.js','./ocr/core/tesseract-core-simd-lstm.wasm.js','./ocr/lang/eng.traineddata.gz'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.origin!==location.origin)return;
 // Página: tenta a versão nova na internet; sem internet usa a salva.
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));
  return;
 }
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(e.request,c))}return res})));
});
