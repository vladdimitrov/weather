// Generates the "weather in Europe" pages in the five languages. English is the default
// (/europe/), the others are /bg/europe/, /de/europe/, /it/europe/, /es/europe/:
//   /europe/                       all countries
//   /europe/<country>/             cities of one country
//   /europe/<country>/<city>/      current weather and 7-day forecast of one city
// Cities are listed in europe-data.js (city names stay as they are there), country names come
// from Intl.DisplayNames, texts from text-europe.js. The live forecast comes from /js/city-forecast.js.
// Run from the repository root: node .github/scripts/build-europe.js [--sitemap]
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { EUROPE } = require('./text-europe.js');
const { page, write, VERSION } = require('./build-pages.js');
const COUNTRIES = require('./europe-data.js');

const ROOT = process.cwd();
const BASE = 'en';
const SCRIPTS = `<script src="/js/weather-icons.js?v=4" defer></script>
<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`;

const esc = I18N.esc;
const E = (lang, url) => I18N.localUrl(lang, url, BASE); // Europe URLs (English at the root)
const BG = (lang, url) => I18N.localUrl(lang, url); // Bulgarian pages (Bulgarian at the root)
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
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${url === '/' ? BG(lang, '/') : E(lang, url)}` }))
  }, null, 2).replace(/\n/g, '\n  ')}
  </script>
`;
}

function cityPage(lang, country, city) {
  const T = EUROPE[lang];
  const [slug, en, local, lat, lon] = city;
  const url = `/europe/${country.slug}/${slug}/`;
  const k = countryName(lang, country);
  const params = new URLSearchParams({ city: en, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: country.code });
  const term = country.word ? `${country.word} ${local}` : '';
  const others = country.cities.filter(other => other !== city)
    .map(other => `<a href="${E(lang, `/europe/${country.slug}/${other[0]}/`)}" class="recent-place">${esc(other[1])}</a>`).join('\n        ');
  return page({
    lang,
    multi: true,
    base: BASE,
    url,
    title: esc(T.cityTitle(en, term)),
    description: esc(T.cityDescription(en, k, term)),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.europeH1, '/europe/'], [k, `/europe/${country.slug}/`], [T.cityH1(en), url]]),
    body: `    <p class="breadcrumbs"><a href="${E(lang, '/europe/')}">${T.europeH1}</a> › <a href="${E(lang, `/europe/${country.slug}/`)}">${esc(k)}</a> › ${esc(en)}</p>
    <h1>${esc(T.cityH1(en))}</h1>
    <p class="storm-intro">${esc(T.cityIntro(en, k, term, local))}</p>

    <div class="city-forecast" id="cityForecast" data-name="${esc(en)}" data-lat="${lat}" data-lon="${lon}" data-query="${params}">
      <div class="kp-forecast city-now" id="cityNow"><p class="storm-loading">${T.loading}</p></div>
      <div class="kp-forecast" id="cityDays" hidden></div>
    </div>

    <p class="city-actions">
      <a class="btn" href="/weather/?${params}">${T.hourly}</a>
      <a class="btn" href="/magnitni-buri/">${T.storms}</a>
    </p>

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
  const names = country.cities.map(city => city[1]);
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
      ${country.cities.map(([slug, en, , lat, lon]) => `<a href="${E(lang, `/europe/${country.slug}/${slug}/`)}" class="city-tile" data-lat="${lat}" data-lon="${lon}"><span class="city-tile-name">${esc(en)}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
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
    <p class="city-actions"><a class="btn" href="${BG(lang, '/vremeto/')}">${T.bulgaria}</a></p>
${COUNTRIES.map(country => `
    <section class="info-card">
      <h2><a href="${E(lang, `/europe/${country.slug}/`)}">${esc(countryName(lang, country))}</a></h2>
      <div class="city-links">
        ${country.cities.map(city => `<a href="${E(lang, `/europe/${country.slug}/${city[0]}/`)}" class="recent-place">${esc(city[1])}</a>`).join('\n        ')}
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

if (process.argv.includes('--sitemap')) {
  const today = new Date().toISOString().slice(0, 10);
  const base = ['/europe/', ...COUNTRIES.flatMap(country => [`/europe/${country.slug}/`, ...country.cities.map(city => `/europe/${country.slug}/${city[0]}/`)])];
  const urls = I18N.LANGS.flatMap(lang => base.map(url => E(lang, url)));
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
  const missing = urls.filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
  const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, `    <priority>${url.replace(/^\/(bg|de|it|es)\//, '/').split('/').length > 4 ? '0.5' : '0.6'}</priority>`, '  </url>', ''].join(nl)).join(nl);
  sitemap = sitemap.replace('</urlset>', entries + '</urlset>');
  fs.writeFileSync(file, sitemap);
  console.log(`Added ${missing.length} URLs to sitemap.xml.`);
}
