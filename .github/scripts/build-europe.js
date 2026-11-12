// Generates the "weather in Europe" pages in the five languages. Bulgarian is at the root, as on
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
const { page, write, VERSION, placeJson, climateSection, sunSection, bestTimeSection, nearbySection } = require('./build-pages.js');
const PLACES = require('./places.js');
const { TXT } = require('./text-pages.js');
const COUNTRIES = require('./europe-data.js');
const ZONES = require('./europe-zones.js');
// Monthly climate of each city (build-climate.js --europe); optional
const CLIMATE_FILE = path.join(__dirname, 'climate-europe.json');
const CLIMATE = fs.existsSync(CLIMATE_FILE) ? JSON.parse(fs.readFileSync(CLIMATE_FILE, 'utf8')) : null;

const ROOT = process.cwd();
const BASE = 'bg';
// The language spoken in a country, when it is one of the site's: its search term goes first in the title
const SPOKEN = { AT: 'de', DE: 'de', CH: 'de', LU: 'de', IT: 'it', ES: 'es', GB: 'en', IE: 'en', MT: 'en' };
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

function cityPage(lang, country, city) {
  const T = EUROPE[lang];
  const [slug, , local, lat, lon] = city;
  const name = PLACES.europeName(city, lang);
  const url = `/europe/${country.slug}/${slug}/`;
  const k = countryName(lang, country);
  const params = new URLSearchParams({ city: name, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: country.code });
  // "Meteo Napoli" first in the title only on the page in Italian; the other pages mention the local name in the text
  const term = country.word && SPOKEN[country.code] === lang ? `${country.word} ${local}` : '';
  const localTerm = country.word && local !== name ? `${country.word} ${local}` : '';
  const others = country.cities.filter(other => other !== city)
    .map(other => `<a href="${E(lang, `/europe/${country.slug}/${other[0]}/`)}" class="recent-place">${esc(PLACES.europeName(other, lang))}</a>`).join('\n        ');
  const climate = CLIMATE && CLIMATE.cities[`${country.slug}/${slug}`];
  return page({
    lang,
    multi: true,
    base: BASE,
    url,
    indexed: PLACES.europeIndexed(country.code, slug),
    title: esc(T.cityTitle(name, term)),
    description: esc(T.cityDescription(name, k, term)),
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
      <a class="btn" href="/magnitni-buri/">${T.storms}</a>
    </p>
${sunSection({ lat, lon }, lang, { where: TXT[lang].where(name), zone: ZONES[country.code], note: SUN_NOTE[lang] })}
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
    scripts: SCRIPTS
  });
}

function countryPage(lang, country) {
  const T = EUROPE[lang];
  const url = `/europe/${country.slug}/`;
  const k = countryName(lang, country);
  const names = country.cities.map(city => PLACES.europeName(city, lang));
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
    <p class="storm-intro">${T.countryIntro(text => linkTo('/weather/', text))}</p>

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
    <p class="city-actions"><a class="btn" href="${BG(lang, '/vremeto/')}">${T.bulgaria}</a> <a class="btn" href="${BG(lang, '/gradove/')}">${I18N.NAV[lang].cities} →</a></p>
${COUNTRIES.map(country => `
    <section class="info-card">
      <h2><a href="${E(lang, `/europe/${country.slug}/`)}">${esc(countryName(lang, country))}</a></h2>
      <div class="city-links">
        ${country.cities.map(city => `<a href="${E(lang, `/europe/${country.slug}/${city[0]}/`)}" class="recent-place">${esc(PLACES.europeName(city, lang))}</a>`).join('\n        ')}
      </div>
    </section>`).join('\n')}`
  });
}

const dir = (lang, url) => E(lang, url).slice(1);
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
