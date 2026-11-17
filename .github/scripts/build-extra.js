// Pages for searches the city pages do not answer:
//   /gradove/ (7 languages)          all cities that have a page: Bulgaria and Europe, for the internal links
//   /vremeto/<city>/10-dni/          "времето в Търново за 10 дни" (Bulgarian only, every Bulgarian city)
//   /vremeto/<city>/uikend/          "времето в Банско през уикенда" (Bulgarian only, the tourist places)
//   /vremeto/chernomorie/, /vremeto/morska-voda/, /vremeto/snyag-kurorti/, /vremeto/zhegi/, /vremeto/preduprezhdeniya/,
//   /vremeto/kachestvo-na-vazduha/,
//   /vremeto/parvi-snyag/            regional and seasonal pages (Bulgarian only); live tables: /js/region-weather.js
//   /europe/greece/belomorie/, /europe/greece/halkidiki/, /europe/greece/more/, /europe/turkey/more/
//                                    resorts abroad: 7 days and sea water (Bulgarian only)
//   /praznici/pochivni-dni-<year>/   long weekends and working days (Bulgarian only), from holidays-BG.json
//   /uidzhet/                        the free "weather in [city]" widget (/widget/weather.html) for other sites
//   /prohodi/, /prohodi/<slug>/      the mountain passes (Bulgarian only, bg-passes.js); live: /js/passes.js
// Texts: text-extra.js. Run from the repository root after build-pages.js (it refreshes
// holidays-BG.json): node .github/scripts/build-extra.js, then build-forecast.js and build-sitemap.js.
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { page, write, VERSION, placeJson, daysOff } = require('./build-pages.js');
const CITIES = require('./bg-cities.js');
const COUNTRIES = require('./europe-data.js');
const PLACES = require('./places.js');
const PASSES = require('./bg-passes.js');
const { provinceOf } = require('./bg-provinces.js');
const { BG, CITIES_PAGE, RESORTS_PAGE, bgIn } = require('./text-extra.js');
const { TXT } = require('./text-pages.js');

const esc = I18N.esc;
const L = (lang, url) => I18N.localUrl(lang, url);
const CLIMATE = JSON.parse(fs.readFileSync(path.join(__dirname, 'climate.json'), 'utf8'));
const HOLIDAYS = JSON.parse(fs.readFileSync(path.join(__dirname, 'holidays-BG.json'), 'utf8'));
const degrees = t => { const r = Math.round(t); return (r < 0 ? '−' : '') + Math.abs(r) + '°'; };
const ONLY_BG = { lang: 'bg', multi: true, langs: ['bg'] };
const CITY_SCRIPTS = `<script src="/js/weather-icons.js?v=5" defer></script>
<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`;
const REGION_SCRIPTS = `<script src="/js/weather-icons.js?v=5" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>
<script src="/js/region-weather.js?v=${VERSION.regionWeather}" defer></script>\n`;
const REGION_STYLE = '<style>.region-table td.region-hot{color:#ff8a65;font-weight:600}.region-table td.region-snow{color:#81d4fa;font-weight:600}.region-table th,.region-table td{white-space:nowrap}.region-table td.region-warn{white-space:normal;min-width:12em}.region-warn span{display:block;margin:2px 0;padding:3px 8px;border-radius:6px;font-weight:600;color:#1a1a2e}.region-warn .warn-yellow{background:#ffd54f}.region-warn .warn-orange{background:#ff9800}.region-warn .warn-red{background:#e53935;color:#fff}</style>';

function breadcrumbs(lang, items) {
  return `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${L(lang, url)}` }))
  })}
  </script>
`;
}

// ---- /kurorti/ ----
const RESORTS = {
  ski: ['bansko', 'borovets', 'pamporovo', 'chepelare', 'dobrinishte'].map(slug => `/vremeto/${slug}/`),
  sea: ['slanchev-bryag', 'zlatni-pyasatsi', 'albena', 'nesebar', 'sozopol', 'primorsko', 'kiten', 'obzor', 'pomorie', 'balchik', 'varna', 'burgas'].map(slug => `/vremeto/${slug}/`),
  greece: ['kavala', 'thassos', 'keramoti', 'asprovalta', 'stavros', 'olympiada', 'ouranoupoli', 'nikiti', 'neos-marmaras', 'hanioti', 'kallithea',
    'paralia-katerinis', 'parga', 'corfu', 'lefkada', 'kefalonia', 'zakynthos', 'santorini', 'mykonos', 'chania', 'heraklion', 'rhodes', 'kos'].map(slug => `/europe/greece/${slug}/`)
};
function resortsPage(lang) {
  const T = RESORTS_PAGE[lang];
  const byUrl = Object.fromEntries(PLACES.PLACES.map(place => [place.url, place]));
  const group = (title, urls, more) => {
    const links = urls.map(url => {
      if (!byUrl[url]) throw new Error(`/kurorti/: no page ${url}`);
      return `<a href="${L(lang, url)}" class="recent-place">${esc(byUrl[url].name[lang])}</a>`;
    });
    // the Bulgarian-only regional pages, on the Bulgarian page
    const extra = lang === 'bg' ? (more || []).map(([url, text]) => `<a href="${url}" class="recent-place">${esc(text)}</a>`) : [];
    return `
    <section class="info-card">
      <h2>${esc(title)}</h2>
      <div class="city-links">
        ${[...links, ...extra].join('\n        ')}
      </div>
    </section>`;
  };
  return page({
    url: '/kurorti/',
    lang,
    multi: true,
    title: T.title,
    description: T.description,
    jsonLd: breadcrumbs(lang, [['Weather Pulse', '/'], [T.h1, '/kurorti/']]),
    body: `    <h1>${esc(T.h1)}</h1>
    <p class="storm-intro">${esc(T.intro)}</p>
${group(T.ski, RESORTS.ski, [['/vremeto/snyag-kurorti/', RESORTS_PAGE.bg.skiMore]])}
${group(T.sea, RESORTS.sea, [['/vremeto/chernomorie/', RESORTS_PAGE.bg.seaMore[0]], ['/vremeto/morska-voda/', RESORTS_PAGE.bg.seaMore[1]]])}
${group(T.greece, RESORTS.greece, [['/europe/greece/belomorie/', RESORTS_PAGE.bg.greeceMore[0]], ['/europe/greece/halkidiki/', RESORTS_PAGE.bg.greeceMore[1]], ['/europe/greece/more/', RESORTS_PAGE.bg.greeceMore[2]]])}`
  });
}

// ---- /gradove/ ----
function citiesPage(lang) {
  const T = CITIES_PAGE[lang];
  const link = place => `<a href="${L(lang, place.url)}" class="recent-place">${esc(place.name[lang])}</a>`;
  const group = (title, url, places) => `
    <section class="info-card">
      <h2><a href="${L(lang, url)}">${esc(title)}</a></h2>
      <div class="city-links">
        ${places.map(link).join('\n        ')}
      </div>
    </section>`;
  const displayNames = new Intl.DisplayNames([I18N.LOCALE[lang]], { type: 'region' });
  const countries = COUNTRIES.map(country => ({ country, name: lang === 'en' ? country.en : displayNames.of(country.code) }))
    .sort((a, b) => a.name.localeCompare(b.name, I18N.LOCALE[lang]));
  const bulgaria = PLACES.PLACES.filter(place => place.country === 'BG').sort((a, b) => a.name[lang].localeCompare(b.name[lang], I18N.LOCALE[lang]));
  const n = PLACES.PLACES.length;
  return page({
    url: '/gradove/',
    lang,
    multi: true,
    title: T.title,
    description: T.description(n),
    jsonLd: breadcrumbs(lang, [['Weather Pulse', '/'], [T.title, '/gradove/']]),
    body: `    <h1>${T.title}</h1>
    <p class="storm-intro">${T.intro(n)}</p>
${group(T.bulgaria, '/vremeto/', bulgaria)}${lang === 'bg' ? `
    <section class="info-card">
      <h2>${T.seasons}</h2>
      <div class="city-links">
        ${Object.entries(BG.regionLinks).map(([slug, text]) => `<a href="/vremeto/${slug}/" class="recent-place">${text}</a>`).join('\n        ')}
        ${Object.entries(BG.abroadLinks).map(([key, text]) => `<a href="/europe/${key}/" class="recent-place">${text}</a>`).join('\n        ')}
      </div>
    </section>` : ''}
${countries.map(({ country, name }) => group(name, `/europe/${country.slug}/`, PLACES.PLACES.filter(place => place.countrySlug === country.slug))).join('\n')}`
  });
}

// ---- /vremeto/<city>/10-dni/, /14-dni/ and /uikend/ ----
const FORECAST_SLUG = { tenDays: '10-dni', fourteenDays: '14-dni', weekend: 'uikend' };
function forecastPage(city, kind) {
  const T = BG[kind];
  const url = `/vremeto/${city.slug}/${FORECAST_SLUG[kind]}/`;
  const params = new URLSearchParams({ city: city.name, lat: city.lat.toFixed(4), lon: city.lon.toFixed(4), cc: 'BG' });
  const extra = kind === 'tenDays' ? ' data-days="10"' : kind === 'fourteenDays' ? ' data-days="14"' : ' data-days="10" data-weekend="1"';
  const tip = kind === 'weekend' && T.tips[city.slug] ? `
    <section class="info-card">
      <p>${T.tips[city.slug]}</p>
    </section>` : '';
  const weekendButton = PLACES.TOURIST_BG.includes(city.slug) ? `<a class="btn" href="/vremeto/${city.slug}/uikend/">${BG.weekendLink}</a>` : '';
  const tenButton = `<a class="btn" href="/vremeto/${city.slug}/10-dni/">${BG.tenDaysLink}</a>`;
  const fourteenButton = `<a class="btn" href="/vremeto/${city.slug}/14-dni/">${BG.fourteenDaysLink}</a>`;
  const other = kind === 'tenDays' ? [fourteenButton, weekendButton].join('\n      ')
    : kind === 'fourteenDays' ? [tenButton, weekendButton].join('\n      ')
    : [tenButton, fourteenButton].join('\n      ');
  const nearby = CITIES.filter(other => other !== city)
    .map(other => ({ other, km: PLACES.distanceKm(city.lat, city.lon, other.lat, other.lon) }))
    .sort((a, b) => a.km - b.km).slice(0, 6)
    .map(({ other }) => `<a href="/vremeto/${other.slug}/${kind !== 'weekend' ? FORECAST_SLUG[kind] : PLACES.TOURIST_BG.includes(other.slug) ? 'uikend' : '10-dni'}/" class="recent-place">${esc(other.name)}</a>`).join('\n        ');
  return page({
    ...ONLY_BG,
    url,
    title: T.title(city.name),
    description: T.description(city.name),
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], [TXT.bg.hubName, '/vremeto/'], [TXT.bg.cityName(TXT.bg.where(city.name)), `/vremeto/${city.slug}/`], [T.h1(city.name), url]]) +
      placeJson({ title: T.h1(city.name), name: city.name, country: 'BG', lat: city.lat, lon: city.lon, url, lang: 'bg' }),
    body: `    <p class="breadcrumbs"><a href="/vremeto/">${TXT.bg.hubName}</a> › <a href="/vremeto/${city.slug}/">${esc(city.name)}</a> › ${T.crumb}</p>
    <h1>${T.h1(city.name)}</h1>
    <p class="storm-intro">${T.intro(city.name)}</p>

    <div class="city-forecast" id="cityForecast" data-name="${esc(city.name)}" data-lat="${city.lat}" data-lon="${city.lon}" data-query="${params}" data-warn="${provinceOf(city.slug)}"${extra}>
      <div class="kp-forecast city-now" id="cityNow"><p class="storm-loading">${TXT.bg.loading}</p></div>
      <div class="kp-forecast" id="cityDays" hidden></div>
    </div>
${tip}
    <p class="city-actions">
      <a class="btn" href="/vremeto/${city.slug}/">${T.back(city.name)}</a>
      ${other}
      <a class="btn" href="/weather/?${params}">${TXT.bg.hourly}</a>
    </p>

    <section class="info-card">
      <h2>${TXT.bg.nearH}</h2>
      <div class="city-links">
        ${nearby}
      </div>
    </section>`,
    scripts: CITY_SCRIPTS
  });
}

// ---- Regional pages ----
// [name, latitude, longitude, page of the city or null]; sea: a point in the sea off the beach (marine model)
const COAST = [
  ['Шабла', 43.5390, 28.5350, null, [43.535, 28.62]], ['Каварна', 43.4130, 28.3450, null, [43.40, 28.38]],
  ['Балчик', 43.4060, 28.1640, 'balchik', [43.39, 28.20]], ['Албена', 43.3680, 28.0790, 'albena', [43.36, 28.12]],
  ['Златни пясъци', 43.2850, 28.0420, 'zlatni-pyasatsi', [43.28, 28.09]], ['Варна', 43.2141, 27.9147, 'varna', [43.19, 27.99]],
  ['Обзор', 42.8170, 27.8800, 'obzor', [42.81, 27.92]], ['Слънчев бряг', 42.6950, 27.7100, 'slanchev-bryag', [42.69, 27.75]],
  ['Несебър', 42.6597, 27.7360, 'nesebar', [42.65, 27.77]], ['Поморие', 42.5550, 27.6400, 'pomorie', [42.55, 27.68]],
  ['Бургас', 42.5048, 27.4626, 'burgas', [42.48, 27.55]], ['Созопол', 42.4180, 27.6950, 'sozopol', [42.43, 27.74]],
  ['Приморско', 42.2670, 27.7560, 'primorsko', [42.27, 27.80]], ['Китен', 42.2340, 27.7750, 'kiten', [42.23, 27.81]],
  ['Царево', 42.1700, 27.8500, null, [42.17, 27.89]], ['Ахтопол', 42.0980, 27.9420, null, [42.10, 27.98]]
];
// [name, latitude, longitude, elevation of the slopes for the model, page of the town or null]
const SKI = [
  ['Банско (Шилигарника)', 41.8050, 23.4330, 1700, 'bansko'], ['Боровец (Ситняково)', 42.2420, 23.5750, 1750, 'borovets'],
  ['Пампорово (Снежанка)', 41.6450, 24.6800, 1800, 'pamporovo'], ['Витоша (Алеко)', 42.5860, 23.2910, 1800, null],
  ['Чепеларе (Мечи чал)', 41.7050, 24.6450, 1700, 'chepelare'], ['Добринище (Безбог)', 41.8120, 23.5050, 1800, 'dobrinishte'],
  ['Мальовица', 42.1960, 23.3800, 1750, null], ['Узана', 42.7560, 25.2330, 1300, null]
];
const placeLink = (name, slug, lat, lon) => (slug
  ? `<a href="/vremeto/${slug}/">${esc(name)}</a>`
  : `<a href="/weather/?${new URLSearchParams({ city: name, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: 'BG' })}">${esc(name)}</a>`);

function liveTable(mode, heads, rows, note) {
  return `      <div class="table-scroll">
      <table class="kp-table region-table" data-mode="${mode}">
        <thead><tr>${[BG.tableHead.place, ...heads].map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${rows.join('\n')}
        </tbody>
      </table>
      <p class="storm-updated region-nojs">${BG.noJs}</p>
      </div>
      <p class="storm-updated">${note}</p>`;
}
const row = (cells, lat, lon, elevation) => `          <tr data-lat="${lat}" data-lon="${lon}"${elevation ? ` data-elevation="${elevation}"` : ''}><td>${cells}</td></tr>`;

// Cities ranked by the average of a month (climate.json): July highs or January lows
function ranking(month, key, order) {
  // cities without climate data yet (just added; build-climate.js fills them) are left out
  const list = CITIES.filter(city => CLIMATE.cities[city.slug]).map(city => ({ city, value: CLIMATE.cities[city.slug].months[month][key] }))
    .sort((a, b) => (order > 0 ? b.value - a.value : a.value - b.value)).slice(0, 15);
  return `      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr>${BG.rankHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${list.map(({ city, value }, i) => `          <tr><td>${i + 1}</td><td><a href="/vremeto/${city.slug}/">${esc(city.name)}</a></td><td>${degrees(value)}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>`;
}

function regionPage(slug) {
  const R = BG.regions[slug];
  const url = `/vremeto/${slug}/`;
  const sections = R.sections.map(([h, p]) => `
    <section class="info-card">
      <h2>${h}</h2>
      <p>${p}</p>
    </section>`).join('');
  let main = '';
  let extra = '';
  if (slug === 'chernomorie') {
    main = `
    <div class="city-grid" id="cityList">
      ${COAST.map(([name, lat, lon, city]) => `<a href="${city ? `/vremeto/${city}/` : `/weather/?${new URLSearchParams({ city: name, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: 'BG' })}`}" class="city-tile" data-lat="${lat}" data-lon="${lon}"><span class="city-tile-name">${esc(name)}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
    </div>

    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('days', [], COAST.map(([name, lat, lon, city]) => row(placeLink(name, city, lat, lon), lat, lon)), R.tableNote)}
    </section>`;
    const varna = CLIMATE.cities.varna.months, burgas = CLIMATE.cities.burgas.months;
    extra = `
    <section class="info-card">
      <h2>${R.climateH}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr>${BG.climateHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${[4, 5, 6, 7, 8].map(m => `          <tr><td>${I18N.monthName('bg', m)}</td><td>${degrees(varna[m].high)}</td><td>${varna[m].rainDays}</td><td>${degrees(burgas[m].high)}</td><td>${burgas[m].rainDays}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${R.climateNote(CLIMATE.years)}</p>
    </section>`;
  } else if (slug === 'morska-voda') {
    main = `
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('sea', BG.tableHead.sea, COAST.map(([name, lat, lon, city, sea]) => row(placeLink(name, city, lat, lon), sea[0], sea[1])), R.tableNote)}
    </section>`;
    extra = `
    <section class="info-card">
      <h2>${R.monthsH}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr>${BG.monthHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${R.months.map((t, m) => `          <tr><td>${I18N.monthName('bg', m)}</td><td>≈ ${t}°C</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${R.monthsNote}</p>
    </section>`;
  } else if (slug === 'snyag-kurorti') {
    main = `
    <p class="storm-intro" id="skiSummary" role="status"></p>
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('ski', BG.tableHead.ski, SKI.map(([name, lat, lon, elevation, city]) => row(`${placeLink(name, city, lat, lon)} <span class="storm-updated">${elevation} ${BG.tableHead.elevation}</span>`, lat, lon, elevation)), R.tableNote)}
    </section>`;
  } else if (slug === 'zhegi') {
    main = `
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('heat', [], CITIES.map(city => row(placeLink(city.name, city.slug), city.lat, city.lon)), R.tableNote)}
    </section>`;
    extra = `
    <section class="info-card">
      <h2>${R.rankH}</h2>
${ranking(6, 'high', 1)}
      <p class="storm-updated">${R.rankNote(CLIMATE.years)}</p>
    </section>`;
  } else if (slug === 'kachestvo-na-vazduha') {
    main = `
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('air', BG.tableHead.air, CITIES.map(city => row(placeLink(city.name, city.slug), city.lat, city.lon)), R.tableNote)}
    </section>`;
  } else if (slug === 'preduprezhdeniya') {
    main = `
    <p class="storm-intro" id="warnSummary" role="status"></p>
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('warnings', BG.tableHead.warnings, CITIES.map(city => row(placeLink(city.name, city.slug), city.lat, city.lon)
    .replace('<tr ', `<tr data-warn="${provinceOf(city.slug)}" `)), R.tableNote)}
    </section>`;
  } else if (slug === 'parvi-snyag') {
    main = `
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('firstsnow', BG.tableHead.firstSnow, CITIES.map(city => row(placeLink(city.name, city.slug), city.lat, city.lon)), R.tableNote)}
    </section>`;
    extra = `
    <section class="info-card">
      <h2>${R.rankH}</h2>
${ranking(0, 'low', -1)}
      <p class="storm-updated">${R.rankNote(CLIMATE.years)}</p>
    </section>`;
  }
  const others = Object.entries(BG.regionLinks).filter(([other]) => other !== slug)
    .map(([other, text]) => `<a href="/vremeto/${other}/" class="recent-place">${text}</a>`).join('\n        ');
  return page({
    ...ONLY_BG,
    url,
    title: R.title,
    description: R.description,
    ...(slug === 'kachestvo-na-vazduha' ? { image: '/images/cards/air.png' } : {}),
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], [TXT.bg.hubName, '/vremeto/'], [R.h1, url]]),
    body: `    ${REGION_STYLE}
    <p class="breadcrumbs"><a href="/vremeto/">${TXT.bg.hubName}</a> › ${R.h1}</p>
    <h1>${R.h1}</h1>
    <p class="storm-intro">${R.intro}</p>
${main}
${sections}
${extra}

    <section class="info-card">
      <h2>${BG.regionLinksH}</h2>
      <div class="city-links">
        ${others}
        ${Object.entries(BG.abroadLinks).map(([key, text]) => `<a href="/europe/${key}/" class="recent-place">${text}</a>`).join('\n        ')}
        <a href="/prohodi/" class="recent-place">${BG.passes.hubCrumb}</a>
        <a href="/gradove/" class="recent-place">${I18N.NAV.bg.cities}</a>
      </div>
    </section>`,
    // the warnings page takes the median of the models, as the city pages
    scripts: (slug === 'preduprezhdeniya' ? '<script src="/js/forecast-core.js?v=3" defer></script>\n' : '') + REGION_SCRIPTS
  });
}

// ---- Regional pages abroad: /europe/greece/belomorie/, /halkidiki/, /more/, /europe/turkey/more/ ----
function abroadPage(key) {
  const R = BG.abroad[key];
  const [countrySlug] = key.split('/');
  const country = COUNTRIES.find(c => c.slug === countrySlug);
  const countryName = new Intl.DisplayNames(['bg-BG'], { type: 'region' }).of(country.code);
  const url = `/europe/${key}/`;
  const link = ([name, lat, lon, city]) => (city
    ? `<a href="/europe/${countrySlug}/${city}/">${esc(name)}</a>`
    : `<a href="/weather/?${new URLSearchParams({ city: name, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: country.code })}">${esc(name)}</a>`);
  const days = R.seaOnly ? '' : `
    <section class="info-card">
      <h2>${BG.abroadTableDays}</h2>
${liveTable('days', [], R.places.map(place => row(link(place), place[1], place[2])), BG.regions.chernomorie.tableNote)}
    </section>`;
  const sea = `
    <section class="info-card">
      <h2>${BG.abroadTableSea}</h2>
${liveTable('sea', BG.tableHead.sea, R.places.map(place => row(link(place), place[4][0], place[4][1])), BG.abroadSeaNote)}
    </section>`;
  const tiles = R.seaOnly ? '' : `
    <div class="city-grid" id="cityList">
      ${R.places.map(([name, lat, lon, city]) => `<a href="${city ? `/europe/${countrySlug}/${city}/` : `/weather/?${new URLSearchParams({ city: name, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: country.code })}`}" class="city-tile" data-lat="${lat}" data-lon="${lon}"><span class="city-tile-name">${esc(name)}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
    </div>`;
  const others = Object.entries(BG.abroadLinks).filter(([other]) => other !== key)
    .map(([other, text]) => `<a href="/europe/${other}/" class="recent-place">${text}</a>`).join('\n        ');
  return page({
    ...ONLY_BG,
    url,
    title: R.title,
    description: R.description,
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], ['Времето в Европа', '/europe/'], [countryName, `/europe/${countrySlug}/`], [R.h1, url]]),
    body: `    ${REGION_STYLE}
    <p class="breadcrumbs"><a href="/europe/">Времето в Европа</a> › <a href="/europe/${countrySlug}/">${esc(countryName)}</a> › ${R.h1}</p>
    <h1>${R.h1}</h1>
    <p class="storm-intro">${R.intro}</p>
${tiles}${days}${sea}
${R.sections.map(([h, p]) => `
    <section class="info-card">
      <h2>${h}</h2>
      <p>${p}</p>
    </section>`).join('')}

    <section class="info-card">
      <h2>${BG.abroadLinksH}</h2>
      <div class="city-links">
        ${others}
        <a href="/vremeto/morska-voda/" class="recent-place">${BG.regionLinks['morska-voda']} в България</a>
        <a href="/europe/${countrySlug}/" class="recent-place">${esc(countryName)}: всички градове</a>
      </div>
    </section>`,
    scripts: REGION_SCRIPTS
  });
}

// ---- /praznici/pochivni-dni-<year>/ ----
function daysOffPage(year, years) {
  const T = BG.daysOff;
  const list = daysOff(HOLIDAYS[year], year);
  const holidayOn = new Map();
  list.forEach(h => holidayOn.set(h.date, holidayOn.has(h.date) ? `${holidayOn.get(h.date)}; ${h.localName}` : h.localName));
  const iso = d => d.toISOString().slice(0, 10);
  const days = [];
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    const weekday = d.getUTCDay();
    days.push({ date: iso(d), month: d.getUTCMonth(), off: weekday === 0 || weekday === 6 || holidayOn.has(iso(d)), holiday: holidayOn.get(iso(d)) });
  }
  // Runs of three or more days off that include a holiday
  const runs = [];
  for (let i = 0; i < days.length;) {
    if (!days[i].off) { i++; continue; }
    let j = i;
    while (j + 1 < days.length && days[j + 1].off) j++;
    const run = days.slice(i, j + 1);
    if (run.length >= 3 && run.some(day => day.holiday)) runs.push(run);
    i = j + 1;
  }
  const date = (isoDate, options) => new Date(isoDate + 'T12:00:00Z').toLocaleDateString('bg-BG', { timeZone: 'UTC', ...options });
  const total = days.filter(day => day.off).length;
  const work = days.length - total;
  const reasons = run => [...new Set(run.filter(day => day.holiday).flatMap(day => day.holiday.split('; ')))].join('; ');
  const months = Array.from({ length: 12 }, (_, m) => {
    const inMonth = days.filter(day => day.month === m);
    return { m, work: inMonth.filter(day => !day.off).length, off: inMonth.filter(day => day.off).length };
  });
  const url = `/praznici/pochivni-dni-${year}/`;
  const other = years.filter(y => y !== year).map(y => `<a class="btn" href="/praznici/pochivni-dni-${y}/">${T.other(y)}</a>`).join(' ');
  return page({
    ...ONLY_BG,
    url,
    title: T.title(year),
    description: T.description(year, new Set(list.map(h => h.name)).size, runs.length),
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], [TXT.bg.holidaysTitle(years[0], years[1]), '/praznici/'], [T.h1(year), url]]),
    body: `    <p class="breadcrumbs"><a href="/praznici/">${TXT.bg.holidaysTitle(years[0], years[1])}</a> › ${T.h1(year)}</p>
    <h1>${T.h1(year)}</h1>
    <p class="storm-intro">${T.intro(year, total, work)}</p>

    <section class="info-card">
      <h2>${T.longH(year)}</h2>
${runs.length ? `      <div class="table-scroll">
      <table class="kp-table holiday-table">
        <thead><tr>${T.longHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${runs.map(run => `          <tr><td>${date(run[0].date, { weekday: 'short', day: 'numeric', month: 'long' })}</td><td>${date(run[run.length - 1].date, { weekday: 'short', day: 'numeric', month: 'long' })}</td><td>${run.length}</td><td>${esc(reasons(run))}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>` : `      <p>${T.noLong}</p>`}
    </section>

    <section class="info-card">
      <h2>${T.monthsH(year)}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr>${T.monthsHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${months.map(({ m, work: w, off }) => `          <tr><td>${I18N.monthName('bg', m)}</td><td>${w}</td><td>${off}</td></tr>`).join('\n')}
          <tr><td><strong>${T.total}</strong></td><td><strong>${work}</strong></td><td><strong>${total}</strong></td></tr>
        </tbody>
      </table>
      </div>
    </section>

    <p class="city-actions"><a class="btn" href="/praznici/#y${year}">${T.holidaysLink(year)}</a> ${other}</p>`
  });
}

// ---- /uidzhet/ ----
function widgetPage() {
  const T = BG.widget;
  const options = PLACES.PLACES.map(place => {
    const key = place.url.split('/').filter(Boolean).pop();
    return `<option value="${place.url}" data-key="${key}" data-lat="${place.lat}" data-lon="${place.lon}" data-name-bg="${esc(place.name.bg)}" data-name-en="${esc(place.name.en)}">${esc(place.name.bg)}${place.country === 'BG' ? '' : ` (${place.country})`}</option>`;
  }).join('\n          ');
  return page({
    ...ONLY_BG,
    url: '/uidzhet/',
    title: T.title,
    description: T.description,
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], [T.h1, '/uidzhet/']]),
    body: `    <h1>${T.h1}</h1>
    <p class="storm-intro">${T.intro}</p>

    <section class="info-card">
      <p><label for="widgetCity">${T.city}</label>
        <select id="widgetCity">
          ${options}
        </select>
        <label for="widgetLang">${T.language}</label>
        <select id="widgetLang"><option value="bg">Български</option><option value="en">English</option></select>
      </p>
      <h2>${T.code}</h2>
      <textarea id="widgetCode" rows="4" style="width:100%;font-family:monospace" readonly></textarea>
      <p><button type="button" class="btn" id="copyWidget">${T.copy}</button></p>
      <h2>${T.preview}</h2>
      <iframe id="widgetPreview" src="/widget/weather.html?lat=42.6977&amp;lon=23.3219&amp;name=%D0%A1%D0%BE%D1%84%D0%B8%D1%8F&amp;page=%2Fvremeto%2Fsofia%2F" width="320" height="230" style="border:0" title="${T.h1}" loading="lazy"></iframe>
      <p class="storm-updated">${T.note}</p>
    </section>`,
    scripts: `<script>
  // The embed code of the chosen city (the widget is /widget/weather.html)
  (function () {
    const city = document.getElementById('widgetCity');
    const lang = document.getElementById('widgetLang');
    const code = document.getElementById('widgetCode');
    const preview = document.getElementById('widgetPreview');
    const wanted = new URLSearchParams(location.search).get('grad');
    if (wanted) { const option = [...city.options].find(o => o.dataset.key === wanted); if (option) city.value = option.value; }
    function update() {
      const option = city.selectedOptions[0];
      const page = (lang.value === 'bg' ? '' : '/' + lang.value) + option.value;
      const query = new URLSearchParams({ lat: option.dataset.lat, lon: option.dataset.lon, name: option.dataset['name' + (lang.value === 'bg' ? 'Bg' : 'En')], page, lang: lang.value });
      const src = '/widget/weather.html?' + query;
      preview.src = src;
      code.value = '<iframe src="https://weatherpulse.eu' + src.replace(/&/g, '&amp;') + '" width="320" height="230" style="border:0" title="Weather Pulse" loading="lazy"></iframe>';
    }
    city.addEventListener('change', update);
    lang.addEventListener('change', update);
    document.getElementById('copyWidget').addEventListener('click', event => {
      code.select();
      (navigator.clipboard ? navigator.clipboard.writeText(code.value) : Promise.reject()).catch(() => document.execCommand('copy'));
      event.target.textContent = ${JSON.stringify(T.copied)};
    });
    update();
  })();
</script>\n`
  });
}

// ---- Mountain passes: /prohodi/ and /prohodi/<slug>/ ----
const SHARE_SCRIPT = `<script src="/js/share.js?v=${VERSION.share}" defer></script>\n`;
const PASS_SCRIPTS = `<script src="/js/passes.js?v=${VERSION.passes}" defer></script>\n${SHARE_SCRIPT}`;
const PASS_STYLE = '<style>.pass-verdict{font-size:1.15rem;font-weight:700;padding:10px 14px;border-radius:10px;margin:0 0 8px;color:#1a1a2e}.pass-ok{background:#a5d6a7}.pass-warn{background:#ffd54f}.pass-bad{background:#ff8a65}.region-warn span.pass-ok,.region-warn span.pass-warn,.region-warn span.pass-bad{color:#1a1a2e}.pass-day td{font-weight:700;background:rgba(255,255,255,0.06)}.pass-hazard td:nth-child(2){color:#ffd54f;font-weight:600}.pass-facts{margin:0;padding-left:1.2em}.pass-hours th,.pass-hours td{white-space:nowrap}.pass-best{margin:8px 0 0;padding:9px 13px;border-radius:10px;border:1px solid var(--panel-border);background:var(--panel);line-height:1.45}.pass-best-ok{border-color:#81c784}.pass-best-bad{border-color:#ff8a65}@media (max-width:640px){.pass-table thead{display:none}.pass-table,.pass-table tbody{display:block}.pass-table tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 8px;padding:12px;margin:0 0 10px;border:1px solid var(--panel-border);border-radius:12px;background:var(--panel)}.pass-table td{display:block;padding:0;border:0;text-align:left}.pass-table td:first-child{grid-column:1/-1;font-weight:700;font-size:1.05rem}.pass-table td.region-warn{grid-column:1/-1;order:2}.pass-table td.pass-stat{order:3;font-size:0.95rem}.pass-table td.pass-stat::before{content:attr(data-label);display:block;font-size:0.75rem;color:var(--ink-soft,#b9c2d9)}.pass-table .region-warn span{display:block;padding:7px 10px;border-radius:8px;white-space:normal}}</style>';
const PASS_ROADS = 'Тази страница е прогноза за времето, а не информация за затворени пътища. Дали пътят е отворен и дали има ограничения за тежкотоварни, вижте в <a href="https://www.api.bg/" rel="noopener">Агенция „Пътна инфраструктура“</a>.';
const passHint = pass => `${pass.title} – ${pass.elevation} м`;

function passPage(pass) {
  const url = `/prohodi/${pass.slug}/`;
  const T = BG.passes;
  const near = CITIES.map(city => ({ city, km: PLACES.distanceKm(pass.lat, pass.lon, city.lat, city.lon) }))
    .sort((a, b) => a.km - b.km).slice(0, 4)
    .map(({ city, km }) => `<a href="/vremeto/${city.slug}/" class="recent-place">${esc(city.name)} (${Math.round(km)} км)</a>`).join('\n        ');
  const others = PASSES.filter(other => other !== pass)
    .map(other => ({ other, km: PLACES.distanceKm(pass.lat, pass.lon, other.lat, other.lon) }))
    .sort((a, b) => a.km - b.km)
    .map(({ other }) => `<a href="/prohodi/${other.slug}/" class="recent-place">${esc(other.name)}</a>`).join('\n        ');
  const params = new URLSearchParams({ city: pass.title, lat: pass.lat.toFixed(4), lon: pass.lon.toFixed(4), cc: 'BG' });
  return page({
    ...ONLY_BG,
    url,
    title: T.title(pass),
    description: T.description(pass),
    image: `/images/cards/pass-${pass.slug}.png`,
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], [T.hubCrumb, '/prohodi/'], [pass.title, url]]) +
      placeJson({ title: T.h1(pass), name: pass.title, country: 'BG', lat: pass.lat, lon: pass.lon, url, lang: 'bg' }),
    body: `    ${PASS_STYLE}
    <p class="breadcrumbs"><a href="/prohodi/">${T.hubCrumb}</a> › ${esc(pass.name)}</p>
    <h1>${T.h1(pass)}</h1>
    <div data-share></div>
    <p class="storm-intro">${esc(pass.text)}</p>

    <div class="city-forecast" id="passForecast" data-lat="${pass.lat}" data-lon="${pass.lon}" data-elevation="${pass.elevation}" data-warn="${pass.warn.join(',')}">
      <div class="city-alerts" id="passOfficial" role="status" hidden></div>
      <div class="kp-forecast" id="passNow" role="status"><p class="storm-loading">${TXT.bg.loading}</p></div>
      <section class="info-card" hidden>
        <h2>${T.hoursH}</h2>
        <div id="passHours"></div>
      </section>
      <section class="info-card" hidden>
        <h2>${T.daysH}</h2>
        <div id="passDays"></div>
      </section>
    </div>
    <p class="storm-updated">${T.modelNote(pass.elevation)} ${PASS_ROADS}</p>

    <section class="info-card">
      <h2>${T.factsH(pass)}</h2>
      <ul class="pass-facts">
        <li>Надморска височина: ${pass.elevation} м</li>
        <li>Планина: ${esc(pass.mountain)}</li>
        <li>Свързва: ${esc(pass.connects)}${pass.road ? ` (${esc(pass.road)})` : ''}</li>
        <li>Координати: ${pass.lat.toFixed(4)}, ${pass.lon.toFixed(4)}</li>
      </ul>
    </section>

    <p class="city-actions">
      <a class="btn" href="/prohodi/">${T.allLink}</a>
      <a class="btn" href="/vremeto/preduprezhdeniya/">${BG.regionLinks.preduprezhdeniya}</a>
      <a class="btn" href="/weather/?${params}">${TXT.bg.hourly}</a>
    </p>

    <section class="info-card">
      <h2>${T.nearH}</h2>
      <div class="city-links">
        ${near}
      </div>
    </section>

    <section class="info-card">
      <h2>${T.othersH}</h2>
      <div class="city-links">
        ${others}
      </div>
    </section>`,
    scripts: PASS_SCRIPTS
  });
}

function passesHub() {
  const url = '/prohodi/';
  const T = BG.passes;
  const rows = PASSES.map(pass => `          <tr data-lat="${pass.lat}" data-lon="${pass.lon}" data-elevation="${pass.elevation}"><td><a href="/prohodi/${pass.slug}/">${esc(pass.name)}</a> <span class="storm-updated">${pass.elevation} м</span></td></tr>`);
  return page({
    ...ONLY_BG,
    url,
    title: T.hubTitle,
    description: T.hubDescription,
    image: '/images/cards/pass-all.png',
    jsonLd: breadcrumbs('bg', [['Weather Pulse', '/'], [T.hubCrumb, url]]),
    body: `    ${REGION_STYLE}${PASS_STYLE}
    <p class="breadcrumbs"><a href="/vremeto/">${TXT.bg.hubName}</a> › ${T.hubCrumb}</p>
    <h1>${T.hubH1}</h1>
    <div data-share></div>
    <p class="storm-intro">${T.hubIntro}</p>

    <section class="info-card">
      <h2>${T.tableH}</h2>
      <div class="table-scroll">
      <table class="kp-table region-table pass-table">
        <thead><tr>${T.tableHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${rows.join('\n')}
        </tbody>
      </table>
      <p class="storm-updated region-nojs">${BG.noJs}</p>
      </div>
      <p class="storm-updated">${T.tableNote} ${PASS_ROADS}</p>
    </section>
${T.sections.map(([h, text]) => `
    <section class="info-card">
      <h2>${h}</h2>
      <p>${text}</p>
    </section>`).join('')}

    <section class="info-card">
      <h2>${BG.regionLinksH}</h2>
      <div class="city-links">
        ${Object.entries(BG.regionLinks).map(([slug, text]) => `<a href="/vremeto/${slug}/" class="recent-place">${text}</a>`).join('\n        ')}
      </div>
    </section>`,
    scripts: PASS_SCRIPTS
  });
}

I18N.LANGS.forEach(lang => write(L(lang, '/gradove/').slice(1), citiesPage(lang)));
I18N.LANGS.forEach(lang => write(L(lang, '/kurorti/').slice(1), resortsPage(lang)));
CITIES.forEach(city => {
  write(`vremeto/${city.slug}/10-dni`, forecastPage(city, 'tenDays'));
  write(`vremeto/${city.slug}/14-dni`, forecastPage(city, 'fourteenDays'));
  if (PLACES.TOURIST_BG.includes(city.slug)) write(`vremeto/${city.slug}/uikend`, forecastPage(city, 'weekend'));
});
Object.keys(BG.regions).forEach(slug => write(`vremeto/${slug}`, regionPage(slug)));
Object.keys(BG.abroad).forEach(key => write(`europe/${key}`, abroadPage(key)));
const years = Object.keys(HOLIDAYS).map(Number).sort().slice(-2);
years.forEach(year => write(`praznici/pochivni-dni-${year}`, daysOffPage(year, years)));
write('uidzhet', widgetPage());
write('prohodi', passesHub());
PASSES.forEach(pass => write(`prohodi/${pass.slug}`, passPage(pass)));
// The passes for the "today in Bulgaria" strip of the home page (js/home-today.js)
fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'data', 'passes.json'),
  JSON.stringify(PASSES.map(pass => ({ slug: pass.slug, name: pass.name, lat: pass.lat, lon: pass.lon, elevation: pass.elevation }))) + '\n');
console.log(`Wrote /gradove/ (${I18N.LANGS.length} languages), ${CITIES.length} 10-day and ${PLACES.TOURIST_BG.length} weekend pages, ${Object.keys(BG.regions).length} regional pages, days off ${years.join(' and ')}, /uidzhet/, /prohodi/ and ${PASSES.length} passes.`);
