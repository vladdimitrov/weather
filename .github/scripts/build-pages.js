// Generates the static SEO pages:
//   /vremeto/            weather by city (hub) and /vremeto/<city>/ for each city below
//   /praznici/           official holidays in Bulgaria for this year and next (from Nager.Date)
// The live forecast on the city pages comes from /js/city-forecast.js.
// Run from the repository root: node .github/scripts/build-pages.js [first year]
// Then add new pages to sitemap.xml (the script prints the entries).
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');

const ROOT = process.cwd();
const VERSION = { theme: 58, mobileNav: 15, cityForecast: 10, moon: 2, lunaToday: 3, lunaLocal: 1, auroraKp: 2, placeContext: 1, skyLocal: 2, homeCities: 1 };

const CITIES = [
  ['sofia', 'София', 42.6977, 23.3219],
  ['plovdiv', 'Пловдив', 42.1354, 24.7453],
  ['varna', 'Варна', 43.2141, 27.9147],
  ['burgas', 'Бургас', 42.5048, 27.4626],
  ['ruse', 'Русе', 43.8356, 25.9657],
  ['stara-zagora', 'Стара Загора', 42.4258, 25.6345],
  ['pleven', 'Плевен', 43.4170, 24.6067],
  ['sliven', 'Сливен', 42.6817, 26.3229],
  ['dobrich', 'Добрич', 43.5726, 27.8273],
  ['shumen', 'Шумен', 43.2706, 26.9229],
  ['pernik', 'Перник', 42.6052, 23.0378],
  ['haskovo', 'Хасково', 41.9344, 25.5554],
  ['yambol', 'Ямбол', 42.4842, 26.5035],
  ['pazardzhik', 'Пазарджик', 42.1928, 24.3336],
  ['blagoevgrad', 'Благоевград', 42.0209, 23.0943],
  ['veliko-tarnovo', 'Велико Търново', 43.0757, 25.6172],
  ['vratsa', 'Враца', 43.2102, 23.5529],
  ['gabrovo', 'Габрово', 42.8742, 25.3187],
  ['asenovgrad', 'Асеновград', 42.0167, 24.8667],
  ['vidin', 'Видин', 43.9962, 22.8679],
  ['kazanlak', 'Казанлък', 42.6194, 25.3930],
  ['kardzhali', 'Кърджали', 41.6338, 25.3777],
  ['kyustendil', 'Кюстендил', 42.2839, 22.6911],
  ['montana', 'Монтана', 43.4085, 23.2257],
  ['dimitrovgrad', 'Димитровград', 42.0500, 25.6000],
  ['lovech', 'Ловеч', 43.1370, 24.7142],
  ['silistra', 'Силистра', 44.1171, 27.2606],
  ['targovishte', 'Търговище', 43.2512, 26.5722],
  ['razgrad', 'Разград', 43.5333, 26.5167],
  ['smolyan', 'Смолян', 41.5774, 24.7011],
  ['bansko', 'Банско', 41.8383, 23.4885],
  ['borovets', 'Боровец', 42.2667, 23.6056],
  ['pamporovo', 'Пампорово', 41.6500, 24.6950],
  ['sozopol', 'Созопол', 42.4180, 27.6950],
  ['nesebar', 'Несебър', 42.6597, 27.7360]
].map(([slug, name, lat, lon]) => ({ slug, name, lat, lon }));

const { TXT, HOLIDAYS } = require('./text-pages.js');
const CITY_TEXT = require('./text-cities.js');
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

function climateSection(city, lang) {
  const climate = CLIMATE && CLIMATE.cities[city.slug];
  if (!climate) return '';
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
    name: cityName(city, lang), elevation, warm: month(warmest), warmHigh: degrees(m[warmest].high), cold: month(coldest), coldLow: degrees(m[coldest].low),
    yearly: Math.round(yearly / 10) * 10, wet: month(wettest), wetMm: m[wettest].precip
  });
  return `
    <section class="info-card city-climate">
      <h2>${T.climateH(cityWhere(city, lang))}</h2>
      <p>${text}</p>${CITY_TEXT[city.slug] ? `
      <p>${CITY_TEXT[city.slug][lang]}</p>` : ''}
      <div class="table-scroll">
      <table class="kp-table climate-table">
        <thead><tr>${T.climateHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${T.climateNote(CLIMATE.years)}</p>
    </section>`;
}

// Sunrise and sunset on the 15th of every month (computed locally, sun.js; Sofia time,
// summer time included) and the longest and shortest day: text for searches like "изгрев София"
const { sunTimes } = require('./sun.js');
const sunClock = lang => new Intl.DateTimeFormat(I18N.LOCALE[lang], { timeZone: 'Europe/Sofia', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayLength = (lang, sunrise, sunset) => {
  const minutes = Math.round((sunset - sunrise) / 60000);
  return TXT[lang].dayLength(Math.floor(minutes / 60), String(minutes % 60).padStart(2, '0'));
};

function sunSection(city, lang) {
  const T = TXT[lang];
  const where = cityWhere(city, lang);
  const clock = sunClock(lang);
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
      <p class="storm-updated">${T.sunNote(year, text => linkTo(L(lang, '/luna/'), text))}</p>
    </section>`;
}

let FOOTER_TEXT = { about: 'За сайта', privacy: 'Поверителност' };
let LOGO = 'Лого';
let FOOTER_URLS = { about: '/za-saita/', privacy: '/poveritelnost/' };
const footer = () => `  <footer style="background: var(--card-bg); border-top: 1px solid var(--card-border); padding: 10px; box-shadow: var(--shadow-glow); position: fixed; bottom: 0; left: 0; width: 100%; margin-top: 0; height: var(--footer-height); z-index: 100; display: flex; align-items: center; justify-content: space-between;">
    <div class="logo" style="flex-shrink: 0;">
        <a href="/"><img src="/images/logo-64.webp" alt="${LOGO}" class="logo-img" width="30" height="30" style="height: 30px; width: auto;"></a>
    </div>
    <p style="font-size: 0.8em; color: #999; margin: 0; text-align: center; flex-grow: 1;">
      © <span class="current-year">${new Date().getFullYear()}</span> VYZYA
      · <a href="${FOOTER_URLS.about}" class="footer-link" data-nav="about">${FOOTER_TEXT.about}</a>
      · <a href="${FOOTER_URLS.privacy}" class="footer-link" data-nav="privacy">${FOOTER_TEXT.privacy}</a>
    </p>
  </footer>`;

const NAV_EN = I18N.NAV.en;

// multi: the page exists in the five languages (/luna/, /en/luna/, /de/luna/ ...); url is the
// Bulgarian path. A page with lang 'en' and no multi is a fixed-English page (/europe/).
function page({ url, title, description, body, scripts = '', jsonLd = '', lang = 'bg', multi = false, base = 'bg' }) {
  const fixed = multi || lang === 'en';
  const NAV = I18N.NAV[lang];
  const nav = key => NAV[key];
  const pageUrl = multi ? I18N.localUrl(lang, url, base) : url;
  const alternates = multi ? I18N.LANGS.map(code => `  <link rel="alternate" hreflang="${code}" href="https://weatherpulse.eu${I18N.localUrl(code, url, base)}" />`).join('\n') + `\n  <link rel="alternate" hreflang="x-default" href="https://weatherpulse.eu${url}" />\n` : '';
  const altPaths = multi ? JSON.stringify(Object.fromEntries(I18N.LANGS.map(code => [code, I18N.localUrl(code, url, base)]))) : '';
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
  return `<!DOCTYPE html>
<html lang="${lang}"${fixed ? ` data-page-lang="${lang}"` : ''}>
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
${alternates}  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Weather Pulse">
  <meta property="og:locale" content="${I18N.OG_LOCALE[lang]}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://weatherpulse.eu${pageUrl}">
  <meta property="og:image" content="https://weatherpulse.eu/images/og-image.png">
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
</head>
<body style="font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <div class="nav-header" tabindex="-1" id="header">
    <div class="nav-links">
      <a href="/" class="nav-link" data-nav="home">${nav('home')}</a>
      <a href="/weather/" class="nav-link" data-nav="weather">${nav('weather')}</a>
      <a href="/maps/" class="nav-link" data-nav="maps">${nav('maps')}</a>
      <a href="/holliday_calendar/" class="nav-link" data-nav="holidays">${nav('holidays')}</a>
      <a href="/magnitni-buri/" class="nav-link" data-nav="storms">${nav('storms')}</a>
      <a href="${multi ? I18N.localUrl(lang, '/nebeto/') : '/nebeto/'}" class="nav-link" data-nav="sky">${nav('sky')}</a>
      <a href="/contacts/" class="nav-link" data-nav="sources">${nav('sources')}</a>
    </div>
    <div class="header-selectors" id="selectors-container">
      <!-- Background and language selectors will be inserted here by JS -->
    </div>
  </div>

  <div id="main-content" role="main" class="container info-page" style="margin-top: calc(var(--header-height) + 20px);">
${body}
  </div>

${(FOOTER_TEXT = { about: NAV.about, privacy: NAV.privacy }, LOGO = I18N.LOGO_ALT[lang], FOOTER_URLS = multi ? { about: I18N.localUrl(lang, '/za-saita/'), privacy: I18N.localUrl(lang, '/poveritelnost/') } : { about: '/za-saita/', privacy: '/poveritelnost/' }, footer())}

<script src="/js/mobile-nav.js?v=${VERSION.mobileNav}" defer></script>
<script src="/js/language-selector.js?v=5" defer></script>
<script src="/js/background-selector.js?v=3" defer></script>
${scripts}</body>
</html>
`;
}

function write(relativeDir, html) {
  const dir = path.join(ROOT, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const cityLinks = (current, lang) => CITIES
  .filter(city => city !== current)
  .map(city => `<a href="${L(lang, `/vremeto/${city.slug}/`)}" class="recent-place">${cityName(city, lang)}</a>`)
  .join('\n        ');

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
    // page() adds " | Weather Pulse"
    title: T.title(where),
    description: T.description(where),
    jsonLd: breadcrumbs,
    body: `    <p class="breadcrumbs"><a href="${L(lang, '/vremeto/')}">${T.hubName}</a> › ${name}</p>
    <h1>${T.cityName(where)}</h1>
    <p class="storm-intro">${T.intro(where)}</p>

    <div class="city-forecast" id="cityForecast" data-name="${name}" data-lat="${city.lat}" data-lon="${city.lon}" data-query="${params}">
      <div class="kp-forecast city-now" id="cityNow"><p class="storm-loading">${T.loading}</p></div>
      <div class="kp-forecast" id="cityDays" hidden></div>
    </div>

    <p class="city-actions">
      <a class="btn" href="/weather/?${params}">${T.hourly}</a>
      <a class="btn" href="/magnitni-buri/">${T.storms}</a>
      <a class="btn" href="${L(lang, '/luna/')}">${T.moon}</a>
    </p>

${sunSection(city, lang)}
${climateSection(city, lang)}

    <section class="info-card">
      <h2>${T.others}</h2>
      <div class="city-links">
        ${cityLinks(city, lang)}
      </div>
    </section>`,
    scripts: `<script src="/js/weather-icons.js?v=4" defer></script>
<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`
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

    <p class="city-actions"><a class="btn" href="${I18N.localUrl(lang, '/europe/', 'en')}">${T.europe}</a></p>

    <div class="city-grid" id="cityList">
      ${CITIES.map(city => `<a href="${L(lang, `/vremeto/${city.slug}/`)}" class="city-tile" data-lat="${city.lat}" data-lon="${city.lon}"><span class="city-tile-name">${cityName(city, lang)}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
    </div>`,
    scripts: `<script src="/js/weather-icons.js?v=4" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`
  });
}


// /contacts/: where every number on the site comes from (sources, models, limits).
// Text in sources-text.js: Bulgarian is the page itself, the other languages are
// embedded as JSON and swapped in by a small script when the visitor's language differs.
const SOURCES_TEXT = require('./sources-text.js');

function sourcesContent(language) {
  const link = (url, text, internal) => `<a href="${url}"${internal ? '' : ' target="_blank" rel="noopener"'}>${text}</a>`;
  const t = SOURCES_TEXT[language](link);
  return `    <h1>${t.title}</h1>
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
    </section>`;
}

function sourcesPage() {
  const others = {};
  const titles = { bg: SOURCES_TEXT.bg(() => '').pageTitle };
  ['en', 'de', 'it', 'es'].forEach(language => {
    others[language] = sourcesContent(language);
    titles[language] = SOURCES_TEXT[language](() => '').pageTitle;
  });
  const data = JSON.stringify({ html: others, titles }).replace(/</g, '\u003c');
  return page({
    url: '/contacts/',
    title: titles.bg,
    description: 'Откъде са данните на Weather Pulse: прогнозата идва от Open-Meteo (модели ECMWF, ICON, GFS и др.), магнитните бури от NOAA, празниците от Nager.Date. Как се смята надеждността и какви са ограниченията.',
    body: `<div id="sourcesContent">
${sourcesContent('bg')}
    </div>`,
    scripts: `<script>
  // Shows the page in the visitor's language (Bulgarian is the page itself)
  (function () {
    const box = document.getElementById('sourcesContent');
    const texts = ${data};
    const original = { html: box.innerHTML, title: document.title };
    function show() {
      const language = document.documentElement.lang;
      const html = texts.html[language];
      box.innerHTML = html || original.html;
      document.title = (html ? texts.titles[language] + ' | Weather Pulse' : original.title);
    }
    show();
    document.addEventListener('change', event => { if (event.target && event.target.id === 'language') show(); });
  })();
</script>\n`
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

async function fetchHolidays(years) {
  return Promise.all(years.map(year =>
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BG`).then(response => {
      if (!response.ok) throw new Error(`Nager.Date ${year}: ${response.status}`);
      return response.json();
    })));
}

function holidaysPage(years, data, lang) {
  const T = TXT[lang];
  const tables = years.map((year, i) => `
    <section class="info-card" id="y${year}">
      <h2>${T.holidaysYear(year)}</h2>
      <table class="kp-table holiday-table">
        <thead><tr>${T.holidaysHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${holidayRows(data[i], year, lang)}
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
module.exports = { CITIES, page, write, VERSION };
if (require.main === module) (async function main() {
  const firstYear = Number(process.argv[2]) || new Date().getFullYear();
  const years = [firstYear, firstYear + 1];
  const data = await fetchHolidays(years);
  I18N.LANGS.forEach(lang => {
    const dir = url => L(lang, url).slice(1);
    CITIES.forEach(city => write(dir(`/vremeto/${city.slug}/`), cityPage(city, lang)));
    write(dir('/vremeto/'), hubPage(lang));
    write(dir('/praznici/'), holidaysPage(years, data, lang));
  });
  write('contacts', sourcesPage());
  console.log(`Wrote ${CITIES.length} city pages, /vremeto/ and /praznici/ (${years.join('–')}) in ${I18N.LANGS.length} languages.`);

  if (process.argv.includes('--sitemap')) {
    const today = new Date().toISOString().slice(0, 10);
    const urls = I18N.LANGS.flatMap(lang => ['/vremeto/', '/praznici/', ...CITIES.map(city => `/vremeto/${city.slug}/`)].map(url => L(lang, url)));
    const file = path.join(ROOT, 'sitemap.xml');
    let sitemap = fs.readFileSync(file, 'utf8');
    const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
    const missing = urls.filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
    const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, `    <priority>${url.replace(/^\/(en|de|it|es)\//, '/').split('/').length > 3 ? '0.6' : '0.7'}</priority>`, '  </url>', ''].join(nl)).join(nl);
    sitemap = sitemap.replace('</urlset>', entries + '</urlset>');
    fs.writeFileSync(file, sitemap);
    console.log(`Added ${missing.length} URLs to sitemap.xml.`);
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
