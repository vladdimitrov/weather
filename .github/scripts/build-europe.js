// Generates the English "weather in Europe" pages:
//   /europe/                       all countries
//   /europe/<country>/             cities of one country
//   /europe/<country>/<city>/      current weather and 7-day forecast of one city
// Cities are listed in europe-data.js. The live forecast comes from /js/city-forecast.js.
// Run from the repository root: node .github/scripts/build-europe.js [--sitemap]
const fs = require('fs');
const path = require('path');
const { page, write, VERSION } = require('./build-pages.js');
const COUNTRIES = require('./europe-data.js');

const ROOT = process.cwd();
const SCRIPTS = `<script src="/js/weather-icons.js?v=4" defer></script>
<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/city-forecast.js?v=${VERSION.cityForecast}" defer></script>\n`;

const esc = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const countryLinks = current => COUNTRIES
  .filter(country => country !== current)
  .map(country => `<a href="/europe/${country.slug}/" class="recent-place">${esc(country.en)}</a>`)
  .join('\n        ');

function breadcrumbsJson(items) {
  return `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${url}` }))
  }, null, 2).replace(/\n/g, '\n  ')}
  </script>
`;
}

function cityPage(country, city) {
  const [slug, en, local, lat, lon] = city;
  const url = `/europe/${country.slug}/${slug}/`;
  const params = new URLSearchParams({ city: en, lat: lat.toFixed(4), lon: lon.toFixed(4), cc: country.code });
  const localSearch = country.word ? `${country.word} ${local}` : '';
  const title = localSearch ? `${localSearch} – Weather in ${en}, 7-day forecast` : `Weather in ${en} today – 7-day forecast`;
  const description = `Weather in ${en}, ${country.en} today: forecast for tomorrow and the next 7 days with temperature, rain and wind.${localSearch ? ` ${localSearch}.` : ''} Updated every hour (data: Open-Meteo).`;
  const others = country.cities.filter(other => other !== city)
    .map(other => `<a href="/europe/${country.slug}/${other[0]}/" class="recent-place">${esc(other[1])}</a>`).join('\n        ');
  return page({
    lang: 'en',
    url,
    title: esc(title),
    description: esc(description),
    jsonLd: breadcrumbsJson([['Weather Pulse', '/'], ['Weather in Europe', '/europe/'], [country.en, `/europe/${country.slug}/`], [`Weather in ${en}`, url]]),
    body: `    <p class="breadcrumbs"><a href="/europe/">Weather in Europe</a> › <a href="/europe/${country.slug}/">${esc(country.en)}</a> › ${esc(en)}</p>
    <h1>Weather in ${esc(en)}</h1>
    <p class="storm-intro">Weather forecast for ${esc(en)}, ${esc(country.en)}, for today, tomorrow and the next 7 days: temperature, rain, wind and chance of precipitation.${localSearch ? ` Local name: ${esc(local)} (${esc(localSearch)}).` : ''} Data from Open-Meteo, updated every hour.</p>

    <div class="city-forecast" id="cityForecast" data-name="${esc(en)}" data-lat="${lat}" data-lon="${lon}" data-query="${params}">
      <div class="kp-forecast city-now" id="cityNow"><p class="storm-loading">Loading…</p></div>
      <div class="kp-forecast" id="cityDays" hidden></div>
    </div>

    <p class="city-actions">
      <a class="btn" href="/weather/?${params}">Hourly forecast →</a>
      <a class="btn" href="/magnitni-buri/">Geomagnetic storms today →</a>
    </p>

    <section class="info-card">
      <h2>More cities in ${esc(country.en)}</h2>
      <div class="city-links">
        ${others || `<a href="/europe/${country.slug}/" class="recent-place">${esc(country.en)}</a>`}
      </div>
    </section>

    <section class="info-card">
      <h2>Weather in other countries</h2>
      <div class="city-links">
        ${countryLinks(country)}
      </div>
    </section>`,
    scripts: SCRIPTS
  });
}

function countryPage(country) {
  const url = `/europe/${country.slug}/`;
  const names = country.cities.map(city => city[1]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return page({
    lang: 'en',
    url,
    title: esc(`Weather in ${country.en} by city – 7-day forecast`),
    description: esc(`Weather forecast for ${list}: current temperature and 7-day forecast for the main cities of ${country.en}.`),
    jsonLd: breadcrumbsJson([['Weather Pulse', '/'], ['Weather in Europe', '/europe/'], [country.en, url]]),
    body: `    <p class="breadcrumbs"><a href="/europe/">Weather in Europe</a> › ${esc(country.en)}</p>
    <h1>Weather in ${esc(country.en)} by city</h1>
    <p class="storm-intro">Choose a city for the 7-day forecast. The temperature is updated every hour. For any other place use the search on the <a href="/weather/">weather forecast</a> page.</p>

    <div class="city-grid" id="cityList">
      ${country.cities.map(([slug, en, , lat, lon]) => `<a href="/europe/${country.slug}/${slug}/" class="city-tile" data-lat="${lat}" data-lon="${lon}"><span class="city-tile-name">${esc(en)}</span><span class="city-tile-temp"></span></a>`).join('\n      ')}
    </div>

    <section class="info-card">
      <h2>Weather in other countries</h2>
      <div class="city-links">
        ${countryLinks(country)}
      </div>
    </section>`,
    scripts: SCRIPTS
  });
}

function europePage() {
  return page({
    lang: 'en',
    url: '/europe/',
    title: 'Weather in Europe by country and city',
    description: `Weather forecast for ${COUNTRIES.length + 1} European countries: current temperature and 7-day forecast for the main cities, from Lisbon to Kyiv and from Reykjavik to Athens.`,
    jsonLd: breadcrumbsJson([['Weather Pulse', '/'], ['Weather in Europe', '/europe/']]),
    body: `    <h1>Weather in Europe</h1>
    <p class="storm-intro">Choose a country, then a city, for the current weather and a 7-day forecast. Data from Open-Meteo, updated every hour. For any other place use the search on the <a href="/weather/">weather forecast</a> page.</p>
    <p class="city-actions"><a class="btn" href="/vremeto/">Времето в България →</a></p>
${COUNTRIES.map(country => `
    <section class="info-card">
      <h2><a href="/europe/${country.slug}/">${esc(country.en)}</a></h2>
      <div class="city-links">
        ${country.cities.map(city => `<a href="/europe/${country.slug}/${city[0]}/" class="recent-place">${esc(city[1])}</a>`).join('\n        ')}
      </div>
    </section>`).join('\n')}`
  });
}

COUNTRIES.forEach(country => {
  write(`europe/${country.slug}`, countryPage(country));
  country.cities.forEach(city => write(`europe/${country.slug}/${city[0]}`, cityPage(country, city)));
});
write('europe', europePage());
const cityCount = COUNTRIES.reduce((sum, country) => sum + country.cities.length, 0);
console.log(`Wrote ${cityCount} city pages, ${COUNTRIES.length} country pages and /europe/.`);

if (process.argv.includes('--sitemap')) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/europe/', ...COUNTRIES.flatMap(country => [`/europe/${country.slug}/`, ...country.cities.map(city => `/europe/${country.slug}/${city[0]}/`)])];
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
  const missing = urls.filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
  const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, `    <priority>${url.split('/').length > 4 ? '0.5' : '0.6'}</priority>`, '  </url>', ''].join(nl)).join(nl);
  sitemap = sitemap.replace('</urlset>', entries + '</urlset>');
  fs.writeFileSync(file, sitemap);
  console.log(`Added ${missing.length} URLs to sitemap.xml.`);
}
