// Pages for searches the city pages do not answer:
//   /gradove/ (5 languages)          all cities that have a page: Bulgaria and Europe, for the internal links
//   /vremeto/<city>/10-dni/          "времето в Търново за 10 дни" (Bulgarian only, every Bulgarian city)
//   /vremeto/<city>/uikend/          "времето в Банско през уикенда" (Bulgarian only, the tourist places)
//   /vremeto/chernomorie/, /vremeto/morska-voda/, /vremeto/snyag-kurorti/, /vremeto/zhegi/,
//   /vremeto/parvi-snyag/            regional and seasonal pages (Bulgarian only); live tables: /js/region-weather.js
//   /praznici/pochivni-dni-<year>/   long weekends and working days (Bulgarian only), from holidays-BG.json
//   /uidzhet/                        the free "weather in [city]" widget (/widget/weather.html) for other sites
// Texts: text-extra.js. Run from the repository root after build-pages.js (it refreshes
// holidays-BG.json): node .github/scripts/build-extra.js, then build-forecast.js and build-sitemap.js.
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { page, write, VERSION, placeJson, daysOff } = require('./build-pages.js');
const CITIES = require('./bg-cities.js');
const COUNTRIES = require('./europe-data.js');
const PLACES = require('./places.js');
const { BG, CITIES_PAGE, bgIn } = require('./text-extra.js');
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
<script src="/js/region-weather.js?v=1" defer></script>\n`;
const REGION_STYLE = '<style>.region-table td.region-hot{color:#ff8a65;font-weight:600}.region-table td.region-snow{color:#81d4fa;font-weight:600}.region-table th,.region-table td{white-space:nowrap}</style>';

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
      </div>
    </section>` : ''}
${countries.map(({ country, name }) => group(name, `/europe/${country.slug}/`, PLACES.PLACES.filter(place => place.countrySlug === country.slug))).join('\n')}`
  });
}

// ---- /vremeto/<city>/10-dni/ and /uikend/ ----
function forecastPage(city, kind) {
  const T = BG[kind];
  const url = `/vremeto/${city.slug}/${kind === 'tenDays' ? '10-dni' : 'uikend'}/`;
  const params = new URLSearchParams({ city: city.name, lat: city.lat.toFixed(4), lon: city.lon.toFixed(4), cc: 'BG' });
  const extra = kind === 'tenDays' ? ' data-days="10"' : ' data-days="10" data-weekend="1"';
  const tip = kind === 'weekend' && T.tips[city.slug] ? `
    <section class="info-card">
      <p>${T.tips[city.slug]}</p>
    </section>` : '';
  const other = kind === 'tenDays'
    ? (PLACES.TOURIST_BG.includes(city.slug) ? `<a class="btn" href="/vremeto/${city.slug}/uikend/">${BG.weekendLink}</a>` : '')
    : `<a class="btn" href="/vremeto/${city.slug}/10-dni/">${BG.tenDaysLink}</a>`;
  const nearby = CITIES.filter(other => other !== city)
    .map(other => ({ other, km: PLACES.distanceKm(city.lat, city.lon, other.lat, other.lon) }))
    .sort((a, b) => a.km - b.km).slice(0, 6)
    .map(({ other }) => `<a href="/vremeto/${other.slug}/${kind === 'tenDays' ? '10-dni' : PLACES.TOURIST_BG.includes(other.slug) ? 'uikend' : '10-dni'}/" class="recent-place">${esc(other.name)}</a>`).join('\n        ');
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

    <div class="city-forecast" id="cityForecast" data-name="${esc(city.name)}" data-lat="${city.lat}" data-lon="${city.lon}" data-query="${params}"${extra}>
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
  ['Балчик', 43.4060, 28.1640, null, [43.39, 28.20]], ['Албена', 43.3680, 28.0790, null, [43.36, 28.12]],
  ['Златни пясъци', 43.2850, 28.0420, null, [43.28, 28.09]], ['Варна', 43.2141, 27.9147, 'varna', [43.19, 27.99]],
  ['Обзор', 42.8170, 27.8800, null, [42.81, 27.92]], ['Слънчев бряг', 42.6950, 27.7100, null, [42.69, 27.75]],
  ['Несебър', 42.6597, 27.7360, 'nesebar', [42.65, 27.77]], ['Поморие', 42.5550, 27.6400, null, [42.55, 27.68]],
  ['Бургас', 42.5048, 27.4626, 'burgas', [42.48, 27.55]], ['Созопол', 42.4180, 27.6950, 'sozopol', [42.43, 27.74]],
  ['Приморско', 42.2670, 27.7560, null, [42.27, 27.80]], ['Китен', 42.2340, 27.7750, null, [42.23, 27.81]],
  ['Царево', 42.1700, 27.8500, null, [42.17, 27.89]], ['Ахтопол', 42.0980, 27.9420, null, [42.10, 27.98]]
];
// [name, latitude, longitude, elevation of the slopes for the model, page of the town or null]
const SKI = [
  ['Банско (Шилигарника)', 41.8050, 23.4330, 1700, 'bansko'], ['Боровец (Ситняково)', 42.2420, 23.5750, 1750, 'borovets'],
  ['Пампорово (Снежанка)', 41.6450, 24.6800, 1800, 'pamporovo'], ['Витоша (Алеко)', 42.5860, 23.2910, 1800, null],
  ['Чепеларе (Мечи чал)', 41.7050, 24.6450, 1700, null], ['Добринище (Безбог)', 41.8120, 23.5050, 1800, null],
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
  const list = CITIES.map(city => ({ city, value: CLIMATE.cities[city.slug].months[month][key] }))
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
    <section class="info-card">
      <h2>${R.tableH}</h2>
${liveTable('snow', BG.tableHead.snow, SKI.map(([name, lat, lon, elevation, city]) => row(`${placeLink(name, city, lat, lon)} <span class="storm-updated">${elevation} ${BG.tableHead.elevation}</span>`, lat, lon, elevation)), R.tableNote)}
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
        <a href="/gradove/" class="recent-place">${I18N.NAV.bg.cities}</a>
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

I18N.LANGS.forEach(lang => write(L(lang, '/gradove/').slice(1), citiesPage(lang)));
CITIES.forEach(city => {
  write(`vremeto/${city.slug}/10-dni`, forecastPage(city, 'tenDays'));
  if (PLACES.TOURIST_BG.includes(city.slug)) write(`vremeto/${city.slug}/uikend`, forecastPage(city, 'weekend'));
});
Object.keys(BG.regions).forEach(slug => write(`vremeto/${slug}`, regionPage(slug)));
const years = Object.keys(HOLIDAYS).map(Number).sort().slice(-2);
years.forEach(year => write(`praznici/pochivni-dni-${year}`, daysOffPage(year, years)));
write('uidzhet', widgetPage());
console.log(`Wrote /gradove/ (${I18N.LANGS.length} languages), ${CITIES.length} 10-day and ${PLACES.TOURIST_BG.length} weekend pages, ${Object.keys(BG.regions).length} regional pages, days off ${years.join(' and ')}, /uidzhet/.`);
