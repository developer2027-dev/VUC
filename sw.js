// Report VUC — service worker simples (v2026-10-21b)
// Com internet: sempre busca a versão mais nova do GitHub.
// Sem internet: usa a última cópia salva no celular.
const CACHE = 'report-vuc-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // apaga os caches antigos (inclusive o "precache" que travava a versão velha)
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const cdn = url.hostname === 'cdn.jsdelivr.net';
  if (!sameOrigin && !cdn) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await fetch(req, sameOrigin ? { cache: 'no-cache' } : undefined);
      if (fresh && (fresh.ok || fresh.type === 'opaque')) cache.put(req, fresh.clone()).catch(() => {});
      return fresh;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const home = await cache.match('./') || await cache.match('./index.html');
        if (home) return home;
      }
      throw err;
    }
  })());
});
