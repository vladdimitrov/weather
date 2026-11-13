// Service worker: makes the site installable and keeps the last data for
// offline use.
//  - Pages and data: network first, so a new deploy shows up right away; the cache is only
//    the fallback when there is no connection.
//  - Scripts and styles with a version in the address (theme.css?v=58): cache first. A new
//    version is a new address, so nothing stale is ever served; repeat visits do not wait for
//    the network for them. Change such a file => raise its ?v= (see README).
const CACHE = 'weatherpulse-v17';
// Visited pages kept for offline use (the pages in PAGES are always kept)
const MAX_PAGES = 60;

const PAGES = ['/', '/weather/', '/maps/', '/holliday_calendar/', '/iztochnici/', '/magnitni-buri/', '/za-saita/', '/poveritelnost/', '/luna/', '/nebeto/', '/gradove/'];

// Data sources whose last answer is kept for offline use
const DATA_HOSTS = ['api.open-meteo.com', 'geocoding-api.open-meteo.com', 'services.swpc.noaa.gov', 'date.nager.at'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PAGES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE && key !== ALERTS_CACHE).map(key => caches.delete(key))))
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

// A script or stylesheet of the site with ?v=<number> in its address
const isVersioned = url => url.origin === self.location.origin && /^\d+$/.test(url.searchParams.get('v') || '') && /\.(js|css)$/.test(url.pathname);

// Of the same file only the newest version is kept
async function dropOldVersions(cache, url) {
  const keys = await cache.keys();
  await Promise.all(keys.filter(key => {
    const other = new URL(key.url);
    return other.pathname === url.pathname && other.search !== url.search;
  }).map(key => cache.delete(key)));
}

// Visited pages: the oldest go first, the pages of PAGES never
async function trimPages(cache) {
  const keys = await cache.keys();
  const pages = keys.filter(key => {
    const url = new URL(key.url);
    return url.origin === self.location.origin && url.pathname.endsWith('/') && !PAGES.includes(url.pathname);
  });
  await Promise.all(pages.slice(0, Math.max(0, pages.length - MAX_PAGES)).map(key => cache.delete(key)));
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !DATA_HOSTS.includes(url.hostname)) return;

  if (isVersioned(url)) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(cache.put(request, copy).then(() => dropOldVersions(cache, url)));
      }
      return response;
    }));
    return;
  }

  const key = sameOrigin ? request : offlineKey(url);
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(key, copy).then(() => (request.mode === 'navigate' ? trimPages(cache) : null))));
        }
        return response;
      })
      .catch(() => caches.match(key, { ignoreSearch: sameOrigin && request.mode === 'navigate' })
        .then(cached => cached || Response.error()))
  );
});

// ---- Magnetic storm notifications (turned on at /magnitni-buri/) ----
// Runs periodically for installed apps (Periodic Background Sync, Chrome on
// Android), and when a page asks for it ({ type: 'storm-check' }).
const KP_FORECAST_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';
const ALERTS_CACHE = 'weatherpulse-alerts';

// The notification follows the site language. The worker cannot read
// localStorage, so the pages send the language ({ type: 'language' }, from
// /js/mobile-nav.js) and it is kept in the alerts cache.
const LANGUAGE_KEY = '/storm-alert/language';
const ALERT_TEXTS = {
  bg: { title: 'Магнитна буря', body: 'Очаква се Kp {kp} ({when}).', locale: 'bg-BG' },
  en: { title: 'Magnetic storm', body: 'Kp {kp} expected ({when}).', locale: 'en-GB' },
  de: { title: 'Magnetsturm', body: 'Kp {kp} erwartet ({when}).', locale: 'de-DE' },
  it: { title: 'Tempesta magnetica', body: 'Previsto Kp {kp} ({when}).', locale: 'it-IT' },
  es: { title: 'Tormenta magnética', body: 'Se espera Kp {kp} ({when}).', locale: 'es-ES' }
};

async function alertLanguage() {
  const cache = await caches.open(ALERTS_CACHE);
  const saved = await cache.match(LANGUAGE_KEY);
  const language = saved ? await saved.text() : 'bg';
  return ALERT_TEXTS[language] ? language : 'bg';
}

async function saveAlertLanguage(language) {
  if (!ALERT_TEXTS[language]) return;
  const cache = await caches.open(ALERTS_CACHE);
  await cache.put(LANGUAGE_KEY, new Response(language));
}

async function checkStorm() {
  const response = await fetch(KP_FORECAST_URL, { cache: 'no-store' });
  if (!response.ok) return;
  const data = await response.json();
  const now = Date.now();
  // Highest Kp from 3 hours ago to 24 hours ahead
  const coming = data
    .map(entry => ({ time: new Date(String(entry.time_tag) + 'Z').getTime(), kp: parseFloat(entry.kp), scale: entry.noaa_scale }))
    .filter(entry => !isNaN(entry.kp) && entry.time >= now - 3 * 3600 * 1000 && entry.time <= now + 24 * 3600 * 1000);
  if (!coming.length) return;
  const peak = coming.reduce((max, entry) => entry.kp > max.kp ? entry : max);
  if (peak.kp < 5) return;

  // One notification per storm (per day of its peak)
  const key = `/storm-alert/${new Date(peak.time).toISOString().slice(0, 10)}`;
  const cache = await caches.open(ALERTS_CACHE);
  if (await cache.match(key)) return;

  const g = 'G' + Math.min(5, Math.floor(peak.kp) - 4);
  const text = ALERT_TEXTS[await alertLanguage()];
  // In the visitor's own time zone (the worker runs on their device)
  const when = new Date(peak.time).toLocaleString(text.locale, { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  await self.registration.showNotification(`⚠️ ${text.title} ${g}`, {
    body: text.body.replace('{kp}', Math.round(peak.kp * 10) / 10).replace('{when}', when),
    icon: '/images/icons/icon-192.png',
    tag: 'storm-alert',
    data: { url: '/magnitni-buri/' }
  });
  await cache.put(key, new Response('1'));
}

self.addEventListener('periodicsync', event => {
  if (event.tag === 'storm-check') event.waitUntil(checkStorm().catch(() => {}));
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'language') event.waitUntil(saveAlertLanguage(event.data.language).catch(() => {}));
  if (event.data.type === 'storm-check') {
    // the language first, so the check uses it
    event.waitUntil(saveAlertLanguage(event.data.language).catch(() => {}).then(checkStorm).catch(() => {}));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
      const open = windows.find(w => new URL(w.url).pathname === url);
      return open ? open.focus() : self.clients.openWindow(url);
    })
  );
});
