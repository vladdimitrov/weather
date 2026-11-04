// Service worker: makes the site installable and keeps the last data for
// offline use. Network first everywhere, so a new deploy shows up right away;
// the cache is only the fallback when there is no connection.
const CACHE = 'weatherpulse-v1';

const PAGES = ['/', '/weather/', '/maps/', '/holliday_calendar/', '/contacts/'];

// Data sources whose last answer is kept for offline use
const DATA_HOSTS = ['api.open-meteo.com', 'geocoding-api.open-meteo.com', 'services.swpc.noaa.gov', 'date.nager.at'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PAGES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Forecast URLs contain today's date, so offline the exact URL is never in the
// cache. Keep the last answer per kind of request instead.
function offlineKey(url) {
  if (url.hostname === 'api.open-meteo.com') {
    const kind = url.searchParams.has('daily') ? 'daily' : url.searchParams.has('current') ? 'current' : 'hourly';
    return `${url.origin}${url.pathname}?last=${kind}`;
  }
  // City searches and holidays: the exact request (query, or country and year)
  if (url.hostname === 'geocoding-api.open-meteo.com' || url.hostname === 'date.nager.at') return url.href;
  return `${url.origin}${url.pathname}`;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !DATA_HOSTS.includes(url.hostname)) return;

  const key = sameOrigin ? request : offlineKey(url);
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(key, copy));
        }
        return response;
      })
      .catch(() => caches.match(key, { ignoreSearch: sameOrigin && request.mode === 'navigate' })
        .then(cached => cached || Response.error()))
  );
});
