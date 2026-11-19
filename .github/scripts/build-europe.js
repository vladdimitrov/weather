// Generates the "weather in Europe" pages in the seven languages. Bulgarian is at the root, as on
// the rest of the site (/europe/), the others are /en/europe/, /de/europe/, /it/europe/, /es/europe/:
//   /europe/                       all countries
//   /europe/<country>/             cities of one country
//   /europe/<country>/<city>/      current weather and 7-day forecast of one city
// Cities are listed in europe-data.js, their names in the other languages in europe-names.js,
// country names come from Intl.DisplayNames, texts from text-europe.js. The live forecast comes
// from /js/city-forecast.js. German, Italian and Spanish city pages are indexed only for the
// countries of the language and the big tourist places (places.js); the others are noindex.
// The old addresses (/bg/europe/...) are redirects written by build-redirects.js.
// Run from the repository root: node .github/scripts/build-europe.js, then build-sitemap.js
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { EUROPE, SUN_NOTE } = require('./text-europe.js');
const { page, write, VERSION, placeJson, climateSection, sunSection, bestTimeSection, nearbySection, seaSection } = require('./build-pages.js');
const PLACES = require('./places.js');
const { BG: BG_ONLY } = require('./text-extra.js');
// Bulgarian regional pages abroad (build-extra.js) of a country, and of the cities in them
const abroadOf = (countrySlug, citySlug) => Object.keys(BG_ONLY.abroad).filter(key => key.startsWith(countrySlug + '/') &&
  (!citySlug || BG_ONLY.abroad[key].places.some(place => place[3] === citySlug)));
const abroadButtons = keys => keys.map(key => ` <a class="btn" href="/europe/${key}/">${BG_ONLY.abroadLinks[key]} →</a>`).join('');
const { TXT } = require('./text-pages.js');
const COUNTRIES = require('./europe-data.js');
const ZONES = require('./europe-zones.js');
// Monthly climate of each city (build-climate.js --europe); optional
const CLIMATE_FILE = path.join(__dirname, 'climate-europe.json');
const CLIMATE = fs.existsSync(CLIMATE_FILE) ? JSON.parse(fs.readFileSync(CLIMATE_FILE, 'utf8')) : null;

const ROOT = process.cwd();
const BASE = 'bg';
// The language spoken in a country, when it is one of the site's: its search term goes first in the title
const SPOKEN = { AT: 'de', DE: 'de', CH: 'de', LU: 'de', IT: 'it', ES: 'es', GB: 'en', IE: 'en', MT: 'en', FR: 'fr', BE: 'fr', NL: 'nl' };
// Flemish cities of Belgium: searched in Dutch ("Weer Antwerpen"), not with the French "Météo"
const FLEMISH = ['antwerp', 'ghent', 'bruges'];
const localSearch = (country, slug) => (FLEMISH.includes(slug) ? { lang: 'nl', word: 'Weer' } : { lang: SPOKEN[country.code], word: country.word });
const SCRIPTS = `<script src="/js/weather-icons.js?v=5" defer></script>
<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`;

const esc = I18N.esc;
const E = (lang, url) => I18N.localUrl(lang, url, BASE); // Europe URLs (Bulgarian at the root)
const BG = (lang, url) => I18N.localUrl(lang, url); // the other pages of the site
const linkTo = (url, text) => `<a href="${url}">${text}</a>`;

const displayNames = {};
const countryName = (lang, country) => {
  if (lang === 'en') return country.en;
  displayNames[lang] = displayNames[lang] || new Intl.DisplayNames([I18N.LOCALE[lang]], { type: 'region' });
  return displayNames[lang].of(country.code) || country.en;
};

const countryLinks = (current, lang) => COUNTRIES
  .filter(country => country !== current)
  .map(country => `<a href="${E(lang, `/europe/${country.slug}/`)}" class="recent-place">${esc(countryName(lang, country))}</a>`)
  .join('\n        ');

function breadcrumbsJson(lang, items) {
  return `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${E(lang, url)}` }))
  }, null, 2).replace(/\n/g, '\n  ')}
  </script>
`;
}

// Seaside places: the point in the sea off the beach from the Bulgarian pages of the coasts
// (/europe/greece/more/, /halkidiki/ ..., text-extra.js); these pages get a title about the sea
// and a live sea temperature table
const SEA_POINT = {};
Object.entries(BG_ONLY.abroad).forEach(([key, region]) => (region.places || []).forEach(([, , , slug, sea]) => {
  if (slug && sea) SEA_POINT[`${key.split('/')[0]}/${slug}`] = sea;
}));

// Bulgarians abroad (Bulgarian pages only): the countries where the pages get the "Today here and in Sofia" block.
// The other countries stay as they are, as a control group for the check on 7 December 2026 (CLAUDE.md).
const ABROAD = ['DE', 'NL', 'FR', 'AT', 'BE', 'ES', 'IT', 'GB', 'IE'];
// The cities with the most impressions in Search Console (Nov 2026), in that order
const POPULAR = [['germany', 'munich'], ['austria', 'vienna'], ['germany', 'frankfurt'], ['netherlands', 'the-hague'],
  ['netherlands', 'rotterdam'], ['france', 'bordeaux'], ['france', 'nice']];
const ABROAD_URL = '/europe/balgari-v-chuzhbina/';
const HOME_CITIES = [['sofia', 'София'], ['plovdiv', 'Пловдив'], ['varna', 'Варна'], ['burgas', 'Бургас']];

// The difference to Bulgarian time in whole hours, from the IANA zones (right in summer and in winter: Bulgaria
// and the countries above change the clocks on the same day)
const offsetHours = zone => {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName').value;
  const m = part.match(/GMT([+-])(\d+)(?::(\d+))?/);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) + Number(m[3] || 0) / 60) : 0;
};
const behind = hours => (hours === 1 ? '1 час' : `${hours} часа`);
function timeDifference(zone, name) {
  const diff = offsetHours('Europe/Sofia') - offsetHours(zone);
  const where = /^[ВФвф]/.test(name) ? `във ${name}` : `в ${name}`;
  if (!Number.isInteger(diff) || diff < 0) throw new Error(`time difference of ${zone}: ${diff}`);
  if (diff === 0) return `${where[0].toUpperCase()}${where.slice(1)} часът е същият като в България.`;
  const noon = `Когато в България е 12:00 ч., ${where} е ${String(12 - diff).padStart(2, '0')}:00 ч.`;
  return `${where[0].toUpperCase()}${where.slice(1)} е с ${behind(diff)} по-рано от България. ${noon}`;
}

// "Today here and in Sofia": the time difference (fixed text) and a table of today and tomorrow in the city and in
// Sofia, filled every morning by build-forecast.js between <!-- volatile --> (no new lastmod in the sitemap)
function abroadBlock(country, name) {
  return `
    <section class="info-card" id="abroadCompare">
      <h2>Днес ${/^[ВФвф]/.test(name) ? 'във' : 'в'} ${esc(name)} и в София</h2>
      <p>${esc(timeDifference(ZONES[country.code], name))}</p>
      <table class="kp-table" id="abroadTable">
        <thead><tr><th></th><th>Днес</th><th>Утре</th></tr></thead>
        <tbody><!-- volatile --><tr><td>${esc(name)}</td><td>—</td><td>—</td></tr><tr><td>София</td><td>—</td><td>—</td></tr><!-- /volatile --></tbody>
      </table>
      <p>Времето у дома: ${HOME_CITIES.map(([slug, bg]) => `<a href="/vremeto/${slug}/">${bg}</a>`).join(' · ')} · <a href="/gradove/">всички градове →</a></p>
      <p><a href="${ABROAD_URL}">Времето за българите в чужбина →</a></p>
    </section>
`;
}

function cityPage(lang, country, city) {
  const T = EUROPE[lang];
  const [slug, , local, lat, lon] = city;
  const name = PLACES.europeName(city, lang);
  const url = `/europe/${country.slug}/${slug}/`;
  const k = countryName(lang, country);
  const params = new URLSearchParams({ city: name, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: country.code });
  // "Meteo Napoli" first in the title only on the page in Italian; the other pages mention the local name in the text
  const search = localSearch(country, slug);
  const term = search.word && search.lang === lang ? `${search.word} ${local}` : '';
  const localTerm = search.word && local !== name ? `${search.word} ${local}` : '';
  const others = country.cities.filter(other => other !== city)
    .map(other => `<a href="${E(lang, `/europe/${country.slug}/${other[0]}/`)}" class="recent-place">${esc(PLACES.europeName(other, lang))}</a>`).join('\n        ');
  const climate = CLIMATE && CLIMATE.cities[`${country.slug}/${slug}`];
  const sea = SEA_POINT[`${country.slug}/${slug}`];
  // Spanish speakers in Ireland search "clima" (1,224 of 1,253 impressions, Search Console Nov 2026): only this page
  const dublinEs = lang === 'es' && slug === 'dublin';
  return page({
    lang,
    multi: true,
    base: BASE,
    url,
    indexed: PLACES.europeIndexed(country.code, slug),
    // in Bulgarian the country goes into the title of a seaside place: people search "времето керамоти гърция"
    title: esc(dublinEs ? 'El tiempo en Dublín hoy – clima y previsión a 7 días' : sea && !term ? TXT[lang].seaTitle(TXT[lang].where(name) + (lang === 'bg' ? `, ${k},` : '')) : T.cityTitle(name, term)),
    description: esc(dublinEs ? 'El tiempo y el clima en Dublín, Irlanda hoy: previsión para mañana y los próximos 7 días con temperatura, lluvia y viento. Actualizado cada hora (datos: Open-Meteo).' : sea && !term ? TXT[lang].seaDescription(TXT[lang].where(name) + (lang === 'bg' ? `, ${k},` : '')) : T.cityDescription(name, k, term)),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.europeH1, '/europe/'], [k, `/europe/${country.slug}/`], [T.cityH1(name), url]]) +
      placeJson({ title: T.cityH1(name), name, country: country.code, lat, lon, url: E(lang, url), lang }),
    body: `    <p class="breadcrumbs"><a href="${E(lang, '/europe/')}">${T.europeH1}</a> › <a href="${E(lang, `/europe/${country.slug}/`)}">${esc(k)}</a> › ${esc(name)}</p>
    <h1>${esc(T.cityH1(name))}</h1>
    <p class="storm-intro">${esc(T.cityIntro(name, k, localTerm, local))}</p>

    <div class="city-forecast" id="cityForecast" data-name="${esc(name)}" data-lat="${lat}" data-lon="${lon}" data-query="${params}">
      <div class="kp-forecast city-now" id="cityNow"><p class="storm-loading">${T.loading}</p></div>
      <div class="kp-forecast" id="cityDays" hidden></div>
    </div>

    <p class="city-actions">
      <a class="btn" href="/weather/?${params}">${T.hourly}</a>
      <a class="btn" href="/magnitni-buri/">${T.storms}</a>${lang === 'bg' ? abroadButtons(abroadOf(country.slug, slug)) : ''}
    </p>${lang === 'bg' && ABROAD.includes(country.code) ? abroadBlock(country, name) : ''}
${sea ? seaSection([[esc(name), ...sea]], lang, TXT[lang].where(name)) : ''}${sunSection({ lat, lon }, lang, { where: TXT[lang].where(name), zone: ZONES[country.code], note: SUN_NOTE[lang] })}
${climateSection({ slug: `${country.slug}/${slug}` }, lang, {
      climate, years: CLIMATE && CLIMATE.years, name, where: TXT[lang].where(name)
    })}
${bestTimeSection(climate, lang, TXT[lang].where(name))}
${nearbySection({ lat, lon, url, country: country.code }, lang)}

    <section class="info-card">
      <h2>${esc(T.moreIn(k))}</h2>
      <div class="city-links">
        ${others || `<a href="${E(lang, `/europe/${country.slug}/`)}" class="recent-place">${esc(k)}</a>`}
      </div>
    </section>

    <section class="info-card">
      <h2>${T.otherCountries}</h2>
      <div class="city-links">
        ${countryLinks(country, lang)}
      </div>
    </section>`,
    scripts: SCRIPTS + (sea ? `<script src="/js/region-weather.js?v=${VERSION.regionWeather}" defer></script>\n` : '')
  });
}

function countryPage(lang, country) {
  const T = EUROPE[lang];
  const url = `/europe/${country.slug}/`;
  const k = countryName(lang, country);
  // the description names the first five cities (the largest): a full list of a country with many
  // pages (Greece, Turkey) made it 250–400 characters, and search results show about 160
  const names = country.cities.slice(0, 5).map(city => PLACES.europeName(city, lang));
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')}${T.and}${names[names.length - 1]}` : names[0];
  return page({
    lang,
    multi: true,
    base: BASE,
    url,
    title: esc(T.countryTitle(k)),
    description: esc(T.countryDescription(list, k)),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.europeH1, '/europe/'], [k, url]]),
    body: `    <p class="breadcrumbs"><a href="${E(lang, '/europe/')}">${T.europeH1}</a> › ${esc(k)}</p>
    <h1>${esc(T.countryH1(k))}</h1>
    <p class="storm-intro">${T.countryIntro(text => linkTo('/weather/', text))}</p>${lang === 'bg' && abroadOf(country.slug).length ? `
    <p class="city-actions">${abroadButtons(abroadOf(country.slug)).trim()}</p>` : ''}

    <div class="city-grid" id="cityList">
      ${country.cities.map(city => `<a href="${E(lang, `/europe/${country.slug}/${city[0]}/`)}" class="city-tile" data-lat="${city[3]}" data-lon="${city[4]}"><span class="city-tile-name">${esc(PLACES.europeName(city, lang))}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
    </div>

    <section class="info-card">
      <h2>${T.otherCountries}</h2>
      <div class="city-links">
        ${countryLinks(country, lang)}
      </div>
    </section>`,
    scripts: SCRIPTS
  });
}

function europePage(lang) {
  const T = EUROPE[lang];
  return page({
    lang,
    multi: true,
    base: BASE,
    url: '/europe/',
    title: T.europeTitle,
    description: T.europeDescription(COUNTRIES.length + 1),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.europeH1, '/europe/']]),
    body: `    <h1>${T.europeH1}</h1>
    <p class="storm-intro">${T.europeIntro(text => linkTo('/weather/', text))}</p>
    <p class="city-actions"><a class="btn" href="${BG(lang, '/vremeto/')}">${T.bulgaria}</a> <a class="btn" href="${BG(lang, '/gradove/')}">${I18N.NAV[lang].cities} →</a>${lang === 'bg' ? ` <a class="btn" href="${ABROAD_URL}">Българите в чужбина →</a>` : ''}</p>
${COUNTRIES.map(country => `
    <section class="info-card">
      <h2><a href="${E(lang, `/europe/${country.slug}/`)}">${esc(countryName(lang, country))}</a></h2>
      <div class="city-links">
        ${country.cities.map(city => `<a href="${E(lang, `/europe/${country.slug}/${city[0]}/`)}" class="recent-place">${esc(PLACES.europeName(city, lang))}</a>`).join('\n        ')}
      </div>
    </section>`).join('\n')}`
  });
}

// /europe/balgari-v-chuzhbina/: Bulgarian only. The popular cities first, then the countries of the block above
function abroadPage() {
  const lang = 'bg';
  const T = EUROPE[lang];
  const countryOf = slug => COUNTRIES.find(country => country.slug === slug);
  const cityOf = (countrySlug, slug) => countryOf(countrySlug).cities.find(city => city[0] === slug);
  const link = (country, city) => `<a href="/europe/${country.slug}/${city[0]}/" class="recent-place">${esc(PLACES.europeName(city, lang))}</a>`;
  const popular = POPULAR.map(([c, s]) => {
    const country = countryOf(c);
    return `<a href="/europe/${c}/${s}/" class="recent-place">${esc(PLACES.europeName(cityOf(c, s), lang))}, ${esc(countryName(lang, country))}</a>`;
  }).join('\n        ');
  const sections = ABROAD.map(code => COUNTRIES.find(country => country.code === code)).map(country => `
    <section class="info-card">
      <h2><a href="/europe/${country.slug}/">${esc(countryName(lang, country))}</a></h2>
      <div class="city-links">
        ${country.cities.map(city => link(country, city)).join('\n        ')}
      </div>
    </section>`).join('\n');
  const title = 'Времето за българите в чужбина – градове по държави';
  return page({
    lang,
    multi: true,
    langs: ['bg'],
    base: BASE,
    url: ABROAD_URL,
    indexed: ['bg'],
    title: esc(title),
    description: esc('Времето на български в градовете, където живеят българи: Мюнхен, Виена, Франкфурт, Хага, Ротердам, Бордо, Ница и още. Прогноза за днес, утре и 7 дни.'),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.europeH1, '/europe/'], ['Българите в чужбина', ABROAD_URL]]),
    body: `    <p class="breadcrumbs"><a href="/europe/">${T.europeH1}</a> › Българите в чужбина</p>
    <h1>Времето за българите в чужбина</h1>
    <p class="storm-intro">Прогноза на български за градовете в Германия, Нидерландия, Франция, Австрия, Белгия, Испания, Италия, Великобритания и Ирландия: днес, утре и следващите 7 дни. Страницата на всеки град показва и колко е часът в България и какво е времето в София. Искате друг град? Вижте <a href="/europe/">всички държави в Европа</a> или <a href="/weather/">потърсете град</a>.</p>
    <p class="city-actions"><a class="btn" href="/vremeto/">Времето в България</a> <a class="btn" href="/europe/">${T.europeH1} →</a></p>

    <section class="info-card">
      <h2>Популярни градове</h2>
      <div class="city-links">
        ${popular}
      </div>
    </section>
${sections}`,
    scripts: ''
  });
}

const dir = (lang, url) => E(lang, url).slice(1);
write(dir('bg', ABROAD_URL), abroadPage());
I18N.LANGS.forEach(lang => {
  COUNTRIES.forEach(country => {
    write(dir(lang, `/europe/${country.slug}/`), countryPage(lang, country));
    country.cities.forEach(city => write(dir(lang, `/europe/${country.slug}/${city[0]}/`), cityPage(lang, country, city)));
  });
  write(dir(lang, '/europe/'), europePage(lang));
});
// country code -> slug of its /europe/ page, for the home page cities block (js/home-cities.js)
fs.writeFileSync(path.join(ROOT, 'js', 'europe-countries.json'), JSON.stringify(Object.fromEntries(COUNTRIES.map(country => [country.code, country.slug]))) + '\n');
const cityCount = COUNTRIES.reduce((sum, country) => sum + country.cities.length, 0);
console.log(`Wrote ${cityCount} city pages, ${COUNTRIES.length} country pages and /europe/ in ${I18N.LANGS.length} languages.`);

// The sitemap: node .github/scripts/build-sitemap.js
