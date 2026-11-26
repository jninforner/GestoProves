// GestoCatalog 1.50.0 — service worker: només mostra els avisos al mòbil (Web Push).
// No guarda res a la memòria cau: l'app es carrega sempre de la xarxa.
self.addEventListener('install',() => self.skipWaiting());
self.addEventListener('activate',event => event.waitUntil(self.clients.claim()));

self.addEventListener('push',event => {
  let message = {};
  try { message = event.data ? event.data.json() : {}; } catch { message = {body:event.data?.text() || ''}; }
  event.waitUntil(self.registration.showNotification(message.title || 'GestoCatalog',{
    body:message.body || '',
    icon:'./icon-192.png',
    badge:'./icon-192.png',
    tag:'gesto-nova-comanda',
    data:{url:new URL(message.url || './',self.registration.scope).href}
  }));
});

// En prémer l'avís: es porta l'app al davant (o s'obre) a «Nova comanda».
self.addEventListener('notificationclick',event => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for (const client of windows) {
      if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
        client.postMessage({type:'open-section',section:'order'});
        return client.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
