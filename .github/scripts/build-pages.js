// Generates the static SEO pages:
//   /vremeto/            weather by city (hub) and /vremeto/<city>/ for each city below
//   /praznici/           official holidays in Bulgaria for this year and next (from Nager.Date)
// The live forecast on the city pages comes from /js/city-forecast.js.
// Run from the repository root: node .github/scripts/build-pages.js [first year], then build-sitemap.js
//   /iztochnici/         data sources
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');

const ROOT = process.cwd();
const VERSION = { theme: 62, mobileNav: 19, languageSelector: 7, cityForecast: 13, moon: 2, lunaToday: 5, lunaLocal: 1, auroraKp: 2, placeContext: 1, skyLocal: 2, homeCities: 1, regionWeather: 2 };

const CITIES = require('./bg-cities.js');

const { TXT, HOLIDAYS } = require('./text-pages.js');
const CITY_TEXT = require('./text-cities.js');
const BG_ONLY = require('./text-extra.js').BG;
const { provinceOf } = require('./bg-provinces.js');
// What the forecast of a city cannot show: a local wind the models with a 7–25 km grid miss
const LOCAL_WIND = {
  sofia: {
    bg: 'Южняк под Витоша: при силен южен вятър въздухът се спуска по склоновете на планината и се ускорява. В кварталите под Витоша – Симеоново, Драгалевци, Бояна, Княжево, Дървеница – поривите често са много по-силни, отколкото в центъра и в прогнозата за София. Затова показваме поривите по модела, който дава най-силните, а при пориви над 60 км/ч и при предупреждение на НИМХ – съобщение над прогнозата.',
    en: 'The south wind under Vitosha: in a strong southerly wind the air comes down the slopes of the mountain and speeds up. In the districts at its foot – Simeonovo, Dragalevtsi, Boyana, Knyazhevo, Darvenitsa – the gusts are often much stronger than in the centre and in the forecast for Sofia. That is why we show the gusts of the model that gives the strongest, and a notice above the forecast for gusts over 60 km/h and for warnings of NIMH.',
    de: 'Südwind am Witoscha: Bei starkem Südwind strömt die Luft die Hänge des Gebirges hinab und wird schneller. In den Vierteln am Fuß des Witoscha – Simeonowo, Dragalewzi, Bojana, Knjaschewo, Darweniza – sind die Böen oft viel stärker als im Zentrum und in der Vorhersage für Sofia. Deshalb zeigen wir die Böen des Modells mit den stärksten Werten und ab 60 km/h sowie bei Warnungen des NIMH einen Hinweis über der Vorhersage.',
    it: 'Il vento da sud sotto il Vitosha: con un forte vento da sud l’aria scende lungo i pendii della montagna e accelera. Nei quartieri ai suoi piedi – Simeonovo, Dragalevtsi, Boyana, Knyazhevo, Darvenitsa – le raffiche sono spesso molto più forti che in centro e nelle previsioni per Sofia. Per questo mostriamo le raffiche del modello che dà le più forti e, oltre i 60 km/h o con un’allerta del NIMH, un avviso sopra le previsioni.',
    es: 'El viento del sur bajo el Vitosha: con viento fuerte del sur, el aire baja por las laderas de la montaña y se acelera. En los barrios a sus pies – Simeonovo, Dragalevtsi, Boyana, Knyazhevo, Darvenitsa – las rachas suelen ser mucho más fuertes que en el centro y que en la previsión para Sofía. Por eso mostramos las rachas del modelo que da las más fuertes y, por encima de 60 km/h o con un aviso del NIMH, un mensaje sobre la previsión.'
  }
};
// Bulgarian cities that link to the regional pages (build-extra.js)
// Ski resorts: their pages get a ski title and description and a live snow table (/js/region-weather.js,
// data-mode="snow"): the resort and points up on the slopes, [Bulgarian name, Latin name, latitude, longitude, elevation]
const SKI_POINTS = {
  bansko: [['Банско', 'Bansko', 41.8383, 23.4885, 930], ['Шилигарника', 'Shiligarnika', 41.8050, 23.4330, 1700], ['Тодорка', 'Todorka', 41.7835, 23.4200, 2500]],
  borovets: [['Боровец', 'Borovets', 42.2667, 23.6056, 1350], ['Ситняково', 'Sitnyakovo', 42.2420, 23.5750, 1750], ['Ястребец', 'Yastrebets', 42.2300, 23.5600, 2300]],
  pamporovo: [['Пампорово', 'Pamporovo', 41.6500, 24.6950, 1650], ['Снежанка', 'Snezhanka', 41.6450, 24.6800, 1900]]
};
function snowSection(city, lang) {
  const points = SKI_POINTS[city.slug];
  if (!points) return '';
  const T = TXT[lang];
  return `
    <section class="info-card">
      <h2>${T.snowH(cityWhere(city, lang))}</h2>
      <p>${T.snowIntro}</p>
      <div class="table-scroll">
      <table class="kp-table region-table" data-mode="snow">
        <thead><tr>${T.snowHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${points.map(([bg, latin, lat, lon, elevation]) => `          <tr data-lat="${lat}" data-lon="${lon}" data-elevation="${elevation}"><td>${lang === 'bg' ? bg : latin} <span class="storm-updated">${elevation} ${T.m}</span></td></tr>`).join('\n')}
        </tbody>
      </table>
      <p class="storm-updated region-nojs">${T.snowNoJs}</p>
      </div>
      <p class="storm-updated">${T.snowNote}</p>
    </section>
`;
}
const REGION_OF = { varna: ['chernomorie', 'morska-voda'], burgas: ['chernomorie', 'morska-voda'], sozopol: ['chernomorie', 'morska-voda'], nesebar: ['chernomorie', 'morska-voda'], bansko: ['snyag-kurorti'], borovets: ['snyag-kurorti'], pamporovo: ['snyag-kurorti'] };
const L = (lang, url) => I18N.localUrl(lang, url);
const linkTo = (url, text) => `<a href="${url}">${text}</a>`;

// Name of the city in the language of the page (Latin spelling outside Bulgarian)
const cityName = (city, lang) => (lang === 'bg' ? city.name : I18N.latinName(lang, city.slug));
const cityWhere = (city, lang) => TXT[lang].where(cityName(city, lang));

// Monthly climate of each city (built by build-climate.js); optional
const CLIMATE_FILE = path.join(__dirname, 'climate.json');
const CLIMATE = fs.existsSync(CLIMATE_FILE) ? JSON.parse(fs.readFileSync(CLIMATE_FILE, 'utf8')) : null;
// Whole degrees with a real minus sign ("−3°"), never "−0°"
const degrees = t => { const r = Math.round(t); return (r < 0 ? '−' : '') + Math.abs(r) + '°'; };
const dayMonth = (lang, month, day) => new Intl.DateTimeFormat(I18N.LOCALE[lang], { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(Date.UTC(2026, month, day, 12)));

// site: for pages other than the Bulgarian city pages (build-europe.js):
//   { climate, years, name, where }   climate of the place, its years, its name and "in <name>"
function climateSection(city, lang, site = {}) {
  const climate = site.climate || (CLIMATE && CLIMATE.cities[city.slug]);
  if (!climate) return '';
  const name = site.name || cityName(city, lang);
  const where = site.where || cityWhere(city, lang);
  const years = site.years || CLIMATE.years;
  const T = TXT[lang];
  const month = i => I18N.monthName(lang, i);
  const m = climate.months;
  const warmest = m.reduce((best, x, i) => (x.high > m[best].high ? i : best), 0);
  const coldest = m.reduce((best, x, i) => (x.low < m[best].low ? i : best), 0);
  const wettest = m.reduce((best, x, i) => (x.precip > m[best].precip ? i : best), 0);
  const yearly = m.reduce((sum, x) => sum + x.precip, 0);
  const elevation = climate.elevation >= 100 ? Math.round(climate.elevation / 10) * 10 : climate.elevation;
  const rows = m.map((x, i) =>
    `          <tr><td>${month(i)}</td><td>${degrees(x.high)}</td><td>${degrees(x.low)}</td><td>${x.precip} ${T.mm}</td><td>${x.rainDays}</td></tr>`).join('\n');
  const text = T.climateText({
    name, elevation, warm: month(warmest), warmHigh: degrees(m[warmest].high), cold: month(coldest), coldLow: degrees(m[coldest].low),
    yearly: Math.round(yearly / 10) * 10, wet: month(wettest), wetMm: m[wettest].precip
  });
  const recordDate = date => new Date(date + 'T12:00:00Z').toLocaleDateString(I18N.LOCALE[lang], { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
  const records = climate.records ? ` ${T.recordText({
    where, years, max: degrees(climate.records.high.t), maxDate: recordDate(climate.records.high.date),
    min: degrees(climate.records.low.t), minDate: recordDate(climate.records.low.date)
  })}` : '';
  return `
    <section class="info-card city-climate">
      <h2>${T.climateH(where)}</h2>
      <p>${text}${records}</p>${!site.name && CITY_TEXT[city.slug] ? `
      <p>${CITY_TEXT[city.slug][lang]}</p>` : ''}
      <div class="table-scroll">
      <table class="kp-table climate-table">
        <thead><tr>${T.climateHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${T.climateNote(years)}</p>
    </section>`;
}

const joinList = (lang, items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')}${TXT[lang].and}${items[items.length - 1]}` : items[0] || '');

// When the weather is most pleasant, from the monthly climate: of the months with average highs
// of 18–28°C (the three warmest months where fewer get there), the ones closest to 24°C with the
// fewest days of rain; and the hot and the frosty months
function bestTimeSection(climate, lang, where) {
  if (!climate) return '';
  const T = TXT[lang];
  const m = climate.months.map((x, i) => ({ ...x, i }));
  // closest to a 24°C afternoon with few days of rain; at least two months
  const score = x => Math.abs(x.high - 24) + x.rainDays / 2;
  let pool = m.filter(x => x.high >= 18 && x.high <= 28);
  if (pool.length < 2) pool = [...m].sort((a, b) => b.high - a.high).slice(0, 3);
  pool.sort((a, b) => score(a) - score(b));
  const best = pool.filter((x, n) => n < 2 || score(x) <= score(pool[0]) + 3).sort((a, b) => a.i - b.i);
  const names = list => joinList(lang, list.map(x => I18N.monthName(lang, x.i)));
  const highs = best.map(x => x.high);
  const text = T.bestText({
    where,
    months: names(best),
    from: degrees(Math.min(...highs)),
    to: degrees(Math.max(...highs)),
    rain: Math.max(...best.map(x => x.rainDays)),
    hot: names(m.filter(x => x.high >= 30)),
    cold: names(m.filter(x => x.low <= -3))
  });
  return `
    <section class="info-card city-best">
      <h2>${T.bestH(where)}</h2>
      <p>${text}</p>
    </section>`;
}

// Links to the closest city pages: in the same country and across the border, with the distance
const PLACES = require('./places.js');
function nearbySection({ lat, lon, url, country }, lang) {
  const T = TXT[lang];
  const { home, abroad } = PLACES.nearby(lat, lon, url, country);
  const links = list => list.map(({ place, km }) =>
    `<a href="${I18N.localUrl(lang, place.url)}" class="recent-place">${I18N.esc(place.name[lang])} · ${km} ${T.km}</a>`).join('\n        ');
  return `
    <section class="info-card city-near">
      <h2>${T.nearH}</h2>
      <div class="city-links">
        ${links(home)}
      </div>
      <p class="storm-updated">${T.abroad}</p>
      <div class="city-links">
        ${links(abroad)}
      </div>
    </section>`;
}

// Sunrise and sunset on the 15th of every month (computed locally, sun.js; Sofia time,
// summer time included) and the longest and shortest day: text for searches like "изгрев София"
const { sunTimes } = require('./sun.js');
const sunClock = (lang, zone = 'Europe/Sofia') => new Intl.DateTimeFormat(I18N.LOCALE[lang], { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayLength = (lang, sunrise, sunset) => {
  const minutes = Math.round((sunset - sunrise) / 60000);
  return TXT[lang].dayLength(Math.floor(minutes / 60), String(minutes % 60).padStart(2, '0'));
};

// site: for pages other than the Bulgarian city pages (build-europe.js):
//   { zone, where, note }   time zone of the place, "in <name>" and the note under the table
//                           (a function (year, link) -> text; the default says Bulgarian time)
// Returns '' where the Sun does not rise or set on some of the days (the formulas are good to
// about a minute up to latitude 65° only)
function sunSection(city, lang, site = {}) {
  const T = TXT[lang];
  const where = site.where || cityWhere(city, lang);
  if (Math.abs(city.lat) > 65) return '';
  const clock = sunClock(lang, site.zone);
  const year = new Date().getFullYear();
  const at = (month, day) => sunTimes(year, month, day, city.lat, city.lon);
  const rows = Array.from({ length: 12 }, (_, month) => {
    const sun = at(month, 15);
    return `          <tr><td>${dayMonth(lang, month, 15)}</td><td>${clock.format(sun.sunrise)}</td><td>${clock.format(sun.sunset)}</td><td>${dayLength(lang, sun.sunrise, sun.sunset)}</td></tr>`;
  }).join('\n');
  const longest = at(5, 21);
  const shortest = at(11, 21);
  const text = T.sunText({
    where, a: clock.format(longest.sunrise), b: clock.format(longest.sunset), len: dayLength(lang, longest.sunrise, longest.sunset),
    c: clock.format(shortest.sunrise), d: clock.format(shortest.sunset), len2: dayLength(lang, shortest.sunrise, shortest.sunset)
  });
  return `
    <section class="info-card city-sun-table">
      <h2>${T.sunH(where)}</h2>
      <p>${text}</p>
      <div class="table-scroll">
      <table class="kp-table climate-table">
        <thead><tr>${T.sunHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${(site.note || T.sunNote)(year, text => linkTo(L(lang, '/luna/'), text))}</p>
    </section>`;
}

let FOOTER_TEXT = { about: 'За сайта', privacy: 'Поверителност', cities: 'Всички градове', sources: 'Източници' };
let LOGO = 'Лого';
let FOOTER_URLS = { about: '/za-saita/', privacy: '/poveritelnost/', cities: '/gradove/', sources: '/iztochnici/' };
const footer = () => `  <footer style="background: var(--card-bg); border-top: 1px solid var(--card-border); padding: 10px; box-shadow: var(--shadow-glow); position: fixed; bottom: 0; left: 0; width: 100%; margin-top: 0; height: var(--footer-height); z-index: 100; display: flex; align-items: center; justify-content: space-between;">
    <div class="logo" style="flex-shrink: 0;">
        <a href="/"><img src="/images/logo-64.webp" alt="${LOGO}" class="logo-img" width="30" height="30" style="height: 30px; width: auto;"></a>
    </div>
    <p style="font-size: 0.8em; color: #999; margin: 0; text-align: center; flex-grow: 1;">
      © <span class="current-year">${new Date().getFullYear()}</span> VYZYA
      · <a href="${FOOTER_URLS.cities}" class="footer-link" data-nav="cityIndex">${FOOTER_TEXT.cities}</a>
      · <a href="${FOOTER_URLS.sources}" class="footer-link" data-nav="sourcesShort">${FOOTER_TEXT.sources}</a>
      · <a href="${FOOTER_URLS.about}" class="footer-link" data-nav="about">${FOOTER_TEXT.about}</a>
      · <a href="${FOOTER_URLS.privacy}" class="footer-link" data-nav="privacy">${FOOTER_TEXT.privacy}</a>
    </p>
  </footer>`;

const NAV_EN = I18N.NAV.en;

// multi: the page exists in the five languages (/luna/, /en/luna/, /de/luna/ ...); url is the
// Bulgarian path.
// indexed: the languages in which search engines should index the page (default: all). In the
// other languages the page is "noindex, follow" and not in the sitemap, and hreflang lists only
// the indexed ones; the language switcher still finds every translation in data-alt.
// head: extra lines for the <head>, after the site stylesheets (a stylesheet of one page family)
// image: the share image of the page (1200x630), default /images/og-image.png
// langs: the languages in which the page exists (default: all five; ['bg'] for Bulgarian-only pages)
function page({ url, title, description, body, scripts = '', jsonLd = '', head = '', image = '/images/og-image.png', lang = 'bg', multi = false, base = 'bg', langs = I18N.LANGS, indexed = langs }) {
  const fixed = multi || lang === 'en';
  const NAV = I18N.NAV[lang];
  const nav = key => NAV[key];
  const pageUrl = multi ? I18N.localUrl(lang, url, base) : url;
  const noindex = multi && !indexed.includes(lang);
  const listed = I18N.LANGS.filter(code => indexed.includes(code));
  const alternates = multi && !noindex && listed.length > 1
    ? listed.map(code => `  <link rel="alternate" hreflang="${code}" href="https://weatherpulse.eu${I18N.localUrl(code, url, base)}" />`).join('\n') +
      (listed.includes(base) ? `\n  <link rel="alternate" hreflang="x-default" href="https://weatherpulse.eu${url}" />` : '') + '\n'
    : '';
  const altPaths = multi ? JSON.stringify(Object.fromEntries(I18N.LANGS.filter(code => langs.includes(code)).map(code => [code, I18N.localUrl(code, url, base)]))) : '';
  let languageScript;
  if (multi) {
    languageScript = `      // The page has its own language. Bulgarian (default) pages send a visitor who chose
      // another language to the translation; a translated page remembers its language.
      try {
        const saved = localStorage.getItem('selectedLanguage');
        const alt = ${altPaths};
        if ('${lang}' === '${base}') { if (saved && saved !== '${base}' && alt[saved]) location.replace(alt[saved] + location.search + location.hash); }
        else localStorage.setItem('selectedLanguage', '${lang}');
      } catch (e) { /* storage blocked */ }`;
  } else if (lang === 'en') {
    languageScript = '      // English page: the language stays English (see language-selector.js)';
  } else {
    languageScript = `      const savedLanguage = localStorage.getItem('selectedLanguage') || 'bg';
      document.documentElement.lang = savedLanguage;
      // Hidden until translated from the Bulgarian HTML (no flash of Bulgarian text)
      if (savedLanguage !== 'bg') document.documentElement.classList.add('i18n-pending');`;
  }
  const html = `<!DOCTYPE html>
<html lang="${lang}"${fixed ? ` data-page-lang="${lang}"` : ''}${multi ? ` data-alt='${altPaths}'` : ''}>
<head>
  <!-- Generated by .github/scripts/build-pages.js; edit the script, not this file -->
  <script src="/cookie-consent.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'"><noscript><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"></noscript>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Weather Pulse</title>
  <link rel="canonical" href="https://weatherpulse.eu${pageUrl}" />
${alternates}${noindex ? '  <meta name="robots" content="noindex, follow">\n' : ''}  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Weather Pulse">
  <meta property="og:locale" content="${I18N.OG_LOCALE[lang]}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://weatherpulse.eu${pageUrl}">
  <meta property="og:image" content="https://weatherpulse.eu${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
${jsonLd}  <script>
    (function() {
${languageScript}
    })();
  </script>
  <link rel="icon" href="/images/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="/css/weather.css">
  <link rel="stylesheet" href="/css/modern-form.css">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#162447">
  <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png">
  <link rel="stylesheet" href="/css/theme.css?v=${VERSION.theme}">
  <link rel="stylesheet" href="/css/mobile.css?v=5">
${head}</head>
<body style="font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <div class="nav-header" tabindex="-1" id="header">
    <div class="nav-links">
      <a href="/" class="nav-link" data-nav="home">${nav('home')}</a>
      <a href="/weather/" class="nav-link" data-nav="weather">${nav('weather')}</a>
      <a href="/maps/" class="nav-link" data-nav="maps">${nav('maps')}</a>
      <a href="/holliday_calendar/" class="nav-link" data-nav="holidays">${nav('holidays')}</a>
      <a href="/magnitni-buri/" class="nav-link" data-nav="storms">${nav('storms')}</a>
      <a href="${multi ? I18N.localUrl(lang, '/luna/') : '/luna/'}" class="nav-link" data-nav="moon">${nav('moon')}</a>
    </div>
    <div class="header-selectors" id="selectors-container">
      <!-- Background and language selectors will be inserted here by JS -->
    </div>
  </div>

  <div id="main-content" role="main" class="container info-page" style="margin-top: calc(var(--header-height) + 20px);">
${body}
  </div>

${(FOOTER_TEXT = { about: NAV.about, privacy: NAV.privacy, cities: NAV.cities, sources: NAV.sourcesShort }, LOGO = I18N.LOGO_ALT[lang], FOOTER_URLS = Object.fromEntries(Object.entries({ about: '/za-saita/', privacy: '/poveritelnost/', cities: '/gradove/', sources: '/iztochnici/' }).map(([key, to]) => [key, multi ? I18N.localUrl(lang, to) : to])), footer())}

<script src="/js/mobile-nav.js?v=${VERSION.mobileNav}" defer></script>
<script src="/js/language-selector.js?v=${VERSION.languageSelector}" defer></script>
<script src="/js/background-selector.js?v=3" defer></script>
${scripts}</body>
</html>
`;
  // The home, forecast, maps, holiday calendar and storms pages exist in every language
  // (build-main.js): a page in another language links to its own (/en/, /en/weather/?city=...)
  return lang === 'bg' ? html : html.replace(/href="\/(weather\/|maps\/|holliday_calendar\/|magnitni-buri\/)?(["#?])/g, (m, page = '', end) => `href="/${lang}/${page}${end}`);
}

// The forecast build-forecast.js wrote into a city page stays when the page is written again
// (the generators write a "Loading…" line), as long as the place is the same
const FORECAST_BLOCK = /(<div class="city-forecast" id="cityForecast"[^>]*>\n)([\s\S]*?)(\n    <\/div>\n)/;
function keepForecast(file, html) {
  if (!fs.existsSync(file)) return html;
  const old = fs.readFileSync(file, 'utf8');
  const before = old.match(FORECAST_BLOCK);
  const after = html.match(FORECAST_BLOCK);
  const language = text => (text.match(/<html lang="(\w+)"/) || [])[1];
  if (!before || !after || before[1] !== after[1] || language(old) !== language(html) || before[2].includes('storm-loading')) return html;
  return html.replace(FORECAST_BLOCK, (m, open, inner, close) => open + before[2] + close);
}

function write(relativeDir, html) {
  const dir = path.join(ROOT, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, keepForecast(file, html));
}

// A page that has moved: GitHub Pages cannot answer 301, so the old address gets a page with
// the canonical address of the new one and an immediate meta refresh, which search engines treat
// as a permanent redirect (no noindex: it would contradict the canonical)
function redirect(relativeDir, to, lang = 'bg') {
  const target = `https://weatherpulse.eu${to}`;
  const dir = path.join(ROOT, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <!-- Generated by .github/scripts/build-redirects.js: this address has moved -->
  <meta charset="UTF-8">
  <title>Weather Pulse</title>
  <link rel="canonical" href="${target}" />
  <meta http-equiv="refresh" content="0; url=${to}">
  <script>location.replace(${JSON.stringify(to)} + location.search + location.hash);</script>
</head>
<body>
  <p><a href="${to}">${target}</a></p>
</body>
</html>
`);
}

const cityLinks = (current, lang) => CITIES
  .filter(city => city !== current)
  .map(city => `<a href="${L(lang, `/vremeto/${city.slug}/`)}" class="recent-place">${cityName(city, lang)}</a>`)
  .join('\n        ');

// The place a city page is about (name, country, coordinates), as schema.org data
function placeJson({ title, name, country, lat, lon, url, lang }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: `https://weatherpulse.eu${url}`,
    inLanguage: lang,
    about: {
      '@type': 'City',
      name,
      address: { '@type': 'PostalAddress', addressCountry: country },
      geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon }
    }
  };
  return `  <script type="application/ld+json">\n${JSON.stringify(data, null, 2).replace(/^/gm, '  ').replace(/<\//g, '<\\/')}\n  </script>\n`;
}

function cityPage(city, lang) {
  const T = TXT[lang];
  const name = cityName(city, lang);
  const where = cityWhere(city, lang);
  const params = new URLSearchParams({ city: name, lat: city.lat.toFixed(4), lon: city.lon.toFixed(4), cc: 'BG' });
  const breadcrumbs = `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Weather Pulse", "item": "https://weatherpulse.eu${L(lang, '/')}" },
      { "@type": "ListItem", "position": 2, "name": "${T.hubName}", "item": "https://weatherpulse.eu${L(lang, '/vremeto/')}" },
      { "@type": "ListItem", "position": 3, "name": "${T.cityName(where)}", "item": "https://weatherpulse.eu${L(lang, `/vremeto/${city.slug}/`)}" }
    ]
  }
  </script>
`;
  return page({
    url: `/vremeto/${city.slug}/`,
    lang,
    multi: true,
    indexed: PLACES.bgIndexed(city.slug),
    // page() adds " | Weather Pulse"
    title: SKI_POINTS[city.slug] ? T.skiTitle(where) : T.title(where),
    description: SKI_POINTS[city.slug] ? T.skiDescription(where) : T.description(where),
    jsonLd: breadcrumbs + placeJson({ title: T.cityName(where), name, country: 'BG', lat: city.lat, lon: city.lon, url: L(lang, `/vremeto/${city.slug}/`), lang }),
    body: `    <p class="breadcrumbs"><a href="${L(lang, '/vremeto/')}">${T.hubName}</a> › ${name}</p>
    <h1>${T.cityName(where)}</h1>
    <p class="storm-intro">${T.intro(where)}</p>

    <div class="city-forecast" id="cityForecast" data-name="${name}" data-lat="${city.lat}" data-lon="${city.lon}" data-query="${params}" data-warn="${provinceOf(city.slug)}">
      <div class="kp-forecast city-now" id="cityNow"><p class="storm-loading">${T.loading}</p></div>
      <div class="kp-forecast" id="cityDays" hidden></div>
    </div>
${snowSection(city, lang)}${LOCAL_WIND[city.slug] ? `
    <section class="info-card city-local-wind">
      <p>${LOCAL_WIND[city.slug][lang]}</p>
    </section>
` : ''}
    <p class="city-actions">
      <a class="btn" href="/weather/?${params}">${T.hourly}</a>${lang === 'bg' ? `
      <a class="btn" href="/vremeto/${city.slug}/10-dni/">${BG_ONLY.tenDaysLink}</a>
      <a class="btn" href="/vremeto/${city.slug}/14-dni/">${BG_ONLY.fourteenDaysLink}</a>${PLACES.TOURIST_BG.includes(city.slug) ? `
      <a class="btn" href="/vremeto/${city.slug}/uikend/">${BG_ONLY.weekendLink}</a>` : ''}${(REGION_OF[city.slug] || []).map(region => `
      <a class="btn" href="/vremeto/${region}/">${BG_ONLY.regionLinks[region]} →</a>`).join('')}` : ''}
      <a class="btn" href="/magnitni-buri/">${T.storms}</a>
      <a class="btn" href="${L(lang, '/luna/')}">${T.moon}</a>
    </p>

${sunSection(city, lang)}
${climateSection(city, lang)}
${bestTimeSection(CLIMATE && CLIMATE.cities[city.slug], lang, where)}
${nearbySection({ lat: city.lat, lon: city.lon, url: `/vremeto/${city.slug}/`, country: 'BG' }, lang)}${lang === 'bg' ? `
    <p class="city-actions"><a href="/uidzhet/?grad=${city.slug}">${BG_ONLY.widgetLink(city.name)}</a></p>` : ''}

    <section class="info-card">
      <h2>${T.others}</h2>
      <div class="city-links">
        ${cityLinks(city, lang)}
      </div>
    </section>`,
    scripts: `<script src="/js/weather-icons.js?v=5" defer></script>
<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n${SKI_POINTS[city.slug] ? `<script src="/js/region-weather.js?v=${VERSION.regionWeather}" defer></script>\n` : ''}`
  });
}

function hubPage(lang) {
  const T = TXT[lang];
  return page({
    url: '/vremeto/',
    lang,
    multi: true,
    title: T.hubTitle,
    description: T.hubDescription,
    body: `    <h1>${T.hubTitle}</h1>
    <p class="storm-intro">${T.hubIntro(text => linkTo('/weather/', text))}</p>

    <p class="city-actions"><a class="btn" href="${L(lang, '/europe/')}">${T.europe}</a> <a class="btn" href="${L(lang, '/gradove/')}">${I18N.NAV[lang].cities} →</a></p>

    <div class="city-grid" id="cityList">
      ${CITIES.map(city => `<a href="${L(lang, `/vremeto/${city.slug}/`)}" class="city-tile" data-lat="${city.lat}" data-lon="${city.lon}"><span class="city-tile-name">${cityName(city, lang)}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
    </div>${lang === 'bg' ? `

    <section class="info-card">
      <h2>${BG_ONLY.regionLinksH}</h2>
      <div class="city-links">
        ${Object.entries(BG_ONLY.regionLinks).map(([slug, text]) => `<a href="/vremeto/${slug}/" class="recent-place">${text}</a>`).join('\n        ')}
      </div>
    </section>` : ''}`,
    scripts: `<script src="/js/weather-icons.js?v=5" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`
  });
}


// /iztochnici/: where every number on the site comes from (sources, models, limits), in the five
// languages (/iztochnici/, /en/iztochnici/ ...). Text in sources-text.js. The old address /contacts/
// is a redirect (build-redirects.js).
const SOURCES_TEXT = require('./sources-text.js');

function sourcesPage(lang) {
  const link = (url, text, internal) => `<a href="${internal ? L(lang, url) : url}"${internal ? '' : ' target="_blank" rel="noopener"'}>${text}</a>`;
  const t = SOURCES_TEXT[lang](link);
  return page({
    url: '/iztochnici/',
    lang,
    multi: true,
    title: t.pageTitle,
    description: t.description,
    jsonLd: `  <script type="application/ld+json">
  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: t.pageTitle, url: `https://weatherpulse.eu${L(lang, '/iztochnici/')}`, inLanguage: lang, publisher: { '@type': 'Organization', name: 'Weather Pulse', url: 'https://weatherpulse.eu/' } })}
  </script>
`,
    body: `    <h1>${t.title}</h1>
    <p class="storm-intro">${t.intro}</p>

    <section class="info-card">
      <h2>${t.hForecast}</h2>
      <p>${t.forecast1}</p>
      <p>${t.forecast2}</p>
    </section>

    <section class="info-card">
      <h2>${t.hCertainty}</h2>
      <p>${t.certaintyIntro}</p>
      <ul>
        <li>${t.liRange}</li>
        <li>${t.liModels}</li>
      </ul>
    </section>

    <section class="info-card">
      <h2>${t.hAll}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>${t.thData}</th><th>${t.thSource}</th></tr></thead>
        <tbody>
${t.rows.map(([data, source]) => `          <tr><td>${data}</td><td>${source}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card">
      <h2>${t.hLimits}</h2>
      <ul>
${t.limits.map(item => `        <li>${item}</li>`).join('\n')}
      </ul>
    </section>

    <section class="info-card">
      <h2>${t.hContact}</h2>
      <p>${t.contact}</p>
    </section>`
  });
}

// Official holidays (Nager.Date). A fixed-date holiday that falls on a
// weekend is moved to the next working day; those rows get a note.
const FIXED = {
  "New Year's Day": '01-01',
  'Liberation Day': '03-03',
  "International Workers' Day": '05-01',
  "Saint George's Day": '05-06',
  'Saints Cyril and Methodius Day': '05-24',
  'Unification Day': '09-06',
  'Independence Day': '09-22',
  'Christmas Eve': '12-24',
  'Christmas Day': '12-25',
  'Second day of Christmas': '12-26'
};

// The days off as the Labour Code has them (art. 154): a fixed-date holiday that falls on a
// Saturday or Sunday gives the first working day after it (Easter days are not moved). Nager.Date
// moves only some of them (in 2027 it keeps 1 May on a Saturday), so the dates are worked out
// here from the nominal ones.
function daysOff(holidays, year) {
  const iso = d => d.toISOString().slice(0, 10);
  const weekend = date => [0, 6].includes(new Date(date + 'T12:00:00Z').getUTCDay());
  const list = holidays.map(h => ({ ...h, date: FIXED[h.name] ? `${year}-${FIXED[h.name]}` : h.date }));
  const taken = new Set(list.filter(h => !weekend(h.date)).map(h => h.date));
  return list.sort((a, b) => a.date.localeCompare(b.date)).map(h => {
    if (!FIXED[h.name] || !weekend(h.date)) return h;
    const d = new Date(h.date + 'T12:00:00Z');
    do d.setUTCDate(d.getUTCDate() + 1); while (weekend(iso(d)) || taken.has(iso(d)));
    taken.add(iso(d));
    return { ...h, date: iso(d) };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

const localDate = (lang, date, options) => new Date(date + 'T12:00:00Z').toLocaleDateString(I18N.LOCALE[lang], { timeZone: 'UTC', ...options });

function holidayRows(holidays, year, lang) {
  const T = TXT[lang];
  return holidays.map(holiday => {
    let name;
    if (lang === 'bg') {
      // Nager.Date writes some Cyrillic words with Latin "o"
      name = holiday.localName.replace(/oсвобождението/g, 'Освобождението').replace(/Oсманско/g, 'Османско')
        + (holiday.name === 'Second day of Christmas' ? T.secondDay : '');
    } else {
      const known = HOLIDAYS[holiday.name];
      if (!known) console.warn(`No translation for the holiday "${holiday.name}"`);
      name = known ? known[lang] : holiday.name;
    }
    const nominal = FIXED[holiday.name] && `${year}-${FIXED[holiday.name]}`;
    const moved = nominal && nominal !== holiday.date
      ? ` <span class="holiday-note">${T.holidaysMoved(localDate(lang, nominal, { day: 'numeric', month: 'long' }), localDate(lang, nominal, { weekday: 'long' }))}</span>`
      : '';
    const weekday = new Date(holiday.date + 'T12:00:00Z').getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? ' class="weekend"' : '';
    return `          <tr${weekend}><td>${localDate(lang, holiday.date, { day: 'numeric', month: 'long' })}</td><td>${localDate(lang, holiday.date, { weekday: 'long' })}</td><td>${name}${moved}</td></tr>`;
  }).join('\n');
}

// The answers of Nager.Date are kept in holidays-BG.json, so the pages can be built without it
const HOLIDAY_FILE = path.join(__dirname, 'holidays-BG.json');
async function fetchHolidays(years) {
  const saved = fs.existsSync(HOLIDAY_FILE) ? JSON.parse(fs.readFileSync(HOLIDAY_FILE, 'utf8')) : {};
  const result = await Promise.all(years.map(year =>
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BG`).then(response => {
      if (!response.ok) throw new Error(`Nager.Date ${year}: ${response.status}`);
      return response.json();
    }).then(list => list.map(({ date, localName, name }) => ({ date, localName, name }))).catch(error => {
      if (!saved[year]) throw error;
      console.warn(`${error.message}; using holidays-BG.json for ${year}`);
      return saved[year];
    })));
  years.forEach((year, i) => { saved[year] = result[i]; });
  fs.writeFileSync(HOLIDAY_FILE, JSON.stringify(saved, null, 1) + '\n');
  return result;
}

function holidaysPage(years, data, lang) {
  const T = TXT[lang];
  const tables = years.map((year, i) => `
    <section class="info-card" id="y${year}">
      <h2>${T.holidaysYear(year)}</h2>
      <table class="kp-table holiday-table">
        <thead><tr>${T.holidaysHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${holidayRows(daysOff(data[i], year), year, lang)}
        </tbody>
      </table>
    </section>`).join('\n');
  const checked = localDate(lang, new Date().toISOString().slice(0, 10), { day: 'numeric', month: 'long', year: 'numeric' });
  return page({
    url: '/praznici/',
    lang,
    multi: true,
    title: T.holidaysTitle(years[0], years[1]),
    description: T.holidaysDescription(years[0], years[1]),
    body: `    <h1>${T.holidaysH1(years[0], years[1])}</h1>
    <p class="storm-intro">${T.holidaysIntro}</p>
    <p class="city-actions">${years.map(year => `<a class="btn" href="#y${year}">${year}</a>`).join(' ')} <a class="btn" href="/holliday_calendar/">${T.holidaysOther}</a></p>
${tables}
    <p class="storm-updated">${T.holidaysSource(text => `<a href="https://date.nager.at/" target="_blank" rel="noopener">${text}</a>`, checked)}</p>`
  });
}

// Used by build-climate.js (the city list); the pages are built only when run directly
module.exports = { CITIES, daysOff, page, write, redirect, VERSION, placeJson, climateSection, sunSection, bestTimeSection, nearbySection, joinList };
if (require.main === module) (async function main() {
  const firstYear = Number(process.argv[2]) || new Date().getFullYear();
  const years = [firstYear, firstYear + 1];
  const data = await fetchHolidays(years);
  I18N.LANGS.forEach(lang => {
    const dir = url => L(lang, url).slice(1);
    CITIES.forEach(city => write(dir(`/vremeto/${city.slug}/`), cityPage(city, lang)));
    write(dir('/vremeto/'), hubPage(lang));
    write(dir('/praznici/'), holidaysPage(years, data, lang));
    write(dir('/iztochnici/'), sourcesPage(lang));
  });
  console.log(`Wrote ${CITIES.length} city pages, /vremeto/ and /praznici/ (${years.join('–')}) in ${I18N.LANGS.length} languages.`);

  // The sitemap: node .github/scripts/build-sitemap.js
})().catch(error => {
  console.error(error);
  process.exit(1);
});
