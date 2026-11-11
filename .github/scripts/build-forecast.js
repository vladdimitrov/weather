// Writes today's 7-day forecast into the HTML of the city pages, so the page has a forecast
// before (and without) JavaScript and search engines see fresh numbers every day. In the
// browser /js/city-forecast.js replaces it with the live forecast as before.
// Run every morning by .github/workflows/forecast-daily.yml.
//
//   node .github/scripts/build-forecast.js               all city pages: /vremeto/<city>/ and /europe/<country>/<city>/, all languages
//   node .github/scripts/build-forecast.js vremeto ...    only the city pages in these folders
//
// The forecast is the same one the site shows: the median of three models (js/forecast-core.js),
// with the texts of js/city-forecast.js. If Open-Meteo does not answer, nothing is written and
// the pages keep the forecast of the day before (its date is on the page).
// build-pages.js and build-europe.js write the pages with a "Loading…" line; run this script
// after them (the workflow also runs when those pages change on main).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const I18N = require('./i18n.js');

const ROOT = process.cwd();
const SITE = 'https://weatherpulse.eu';
const API = 'https://api.open-meteo.com/v1/forecast';
const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max';
const CHUNK = 20; // places in one request

const ISSUED = { bg: 'Прогноза от', en: 'Forecast issued on', de: 'Vorhersage vom', it: 'Previsione del', es: 'Previsión del' };

const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const esc = I18N.esc;

// "const <name> = { ... };" or "[ ... ];" from a browser script
function declaration(source, name, file) {
  const match = source.match(new RegExp(`^([ \\t]*)const ${name} = ([\\[{])[\\s\\S]*?^\\1[\\]}];`, 'm'));
  if (!match) throw new Error(`${file}: "const ${name}" not found`);
  return match[0];
}

// The texts and weather groups of the live forecast, and the median of the models
const cityScript = read(path.join(ROOT, 'js/city-forecast.js'));
const { conditions, T } = vm.runInNewContext(
  `${declaration(cityScript, 'conditions', 'js/city-forecast.js')}\n${declaration(cityScript, 'T', 'js/city-forecast.js')}\n({ conditions, T })`);
const condition = code => conditions.find(c => c.codes.includes(code)) || conditions[2];
const browser = { window: {}, console, document: { documentElement: { lang: 'en' } } };
vm.runInNewContext(read(path.join(ROOT, 'js/forecast-core.js')), browser);
const Core = browser.window.ForecastCore;

function cityPages(folders) {
  const found = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') found.push(full);
    }
  };
  folders.filter(folder => fs.existsSync(path.join(ROOT, folder))).forEach(folder => walk(path.join(ROOT, folder)));
  return found.map(file => {
    const html = read(file);
    const box = html.match(/<div class="city-forecast" id="cityForecast" data-name="([^"]*)" data-lat="([^"]*)" data-lon="([^"]*)" data-query="([^"]*)">/);
    if (!box) return null;
    return { file, html, lang: (html.match(/<html lang="(\w+)"/) || [])[1], name: box[1], lat: box[2], lon: box[3], query: box[4] };
  }).filter(Boolean);
}

async function forecasts(places) {
  const result = new Map();
  for (let i = 0; i < places.length; i += CHUNK) {
    const chunk = places.slice(i, i + CHUNK);
    const url = `${API}?latitude=${chunk.map(p => p.lat).join(',')}&longitude=${chunk.map(p => p.lon).join(',')}` +
      `&daily=${DAILY}&forecast_days=7&timezone=auto&models=${Core.MODELS.join(',')}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo answered ${response.status} ${(await response.text()).slice(0, 200)}`);
    const json = await response.json();
    const answers = Array.isArray(json) ? json : [json];
    if (answers.length !== chunk.length) throw new Error(`Open-Meteo: ${answers.length} answers for ${chunk.length} places`);
    answers.forEach((answer, index) => {
      const data = Core.collapse(answer);
      const daily = data.daily;
      const complete = daily && daily.time && daily.time.length === 7 &&
        ['temperature_2m_max', 'temperature_2m_min', 'weather_code'].every(key => daily[key] && daily[key].every(value => typeof value === 'number'));
      if (!complete) throw new Error(`Open-Meteo: incomplete forecast for ${chunk[index].lat},${chunk[index].lon}`);
      result.set(chunk[index].key, data);
    });
  }
  return result;
}

const whole = value => { const r = Math.round(value); return (r < 0 ? '−' : '') + Math.abs(r) + '°'; };

function snapshot(page, data, today) {
  const lang = T[page.lang] ? page.lang : 'en';
  const text = T[lang];
  const daily = data.daily;
  const date = (iso, options) => new Date(iso + 'T12:00:00Z').toLocaleDateString(text.locale, { timeZone: 'UTC', ...options });
  const describe = i => condition(daily.weather_code[i]).text[lang];
  const chance = i => (daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null);
  const range = i => `${whole(daily.temperature_2m_min[i])} / ${whole(daily.temperature_2m_max[i])}`;

  const days = daily.time.map((iso, i) => {
    const rain = chance(i);
    const amount = daily.precipitation_sum ? daily.precipitation_sum[i] : null;
    const wind = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : null;
    return `          <a class="kp-day city-day" href="/weather/?${page.query}&date=${iso}" title="${esc(text.hourly)}">
            <span class="kp-day-name">${esc(date(iso, { weekday: 'short', day: 'numeric' }))}</span>
            <span class="city-day-icon" aria-hidden="true">${condition(daily.weather_code[i]).icon}</span>
            <span class="city-day-date">${iso.slice(5).split('-').reverse().join('.')}</span>
            <span class="city-day-temp">${range(i)}</span>
            <span class="kp-day-status">${esc(describe(i))}</span>${typeof rain === 'number' ? `
            <span class="city-day-rain" title="${esc(text.rain)}">${Math.round(rain)}%${typeof amount === 'number' && amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ''}</span>` : ''}${typeof wind === 'number' ? `
            <span class="city-day-wind">${esc(text.wind)} ${Math.round(wind)} km/h</span>` : ''}
          </a>`;
  }).join('\n');

  const rainToday = chance(0);
  browser.document.documentElement.lang = lang;
  const note = Core.note({ models: data.models, elevation: data.elevation });
  // Deeper than the closing </div> of #cityForecast (4 spaces), which marks the end of the block
  return `      <div class="kp-forecast city-now" id="cityNow">
        <h3>${esc(page.name)}: ${esc(date(daily.time[0], { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
        <span class="storm-now-value" style="font-size: 1.5rem; white-space: nowrap;">${range(0)}</span>
        <p class="storm-now-status">${esc(describe(0))}${typeof rainToday === 'number' ? ` · ${esc(text.rain)} ${Math.round(rainToday)}%` : ''}</p>
        <p class="storm-updated">${ISSUED[lang]} ${esc(date(today, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
      </div>
      <div class="kp-forecast" id="cityDays">
        <h3>${esc(text.days)}</h3>
        <div class="city-days">
${days}
        </div>${note ? `
        <p class="forecast-note">${esc(note)}</p>` : ''}
      </div>`;
}

(async function main() {
  const folders = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  // Bulgarian at the root for /vremeto/, English at the root for /europe/
  const all = I18N.LANGS.flatMap(lang => [path.join(I18N.prefix(lang).slice(1), 'vremeto'), path.join(I18N.prefix(lang, 'en').slice(1), 'europe')]);
  const pages = cityPages(folders.length ? folders : all);
  if (!pages.length) throw new Error('No city pages found');
  pages.forEach(page => { page.key = `${page.lat},${page.lon}`; });
  const places = [...new Map(pages.map(page => [page.key, page])).values()];
  const data = await forecasts(places);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [];
  pages.forEach(page => {
    let count = 0;
    const html = page.html.replace(/(<div class="city-forecast" id="cityForecast"[^>]*>\n)[\s\S]*?(\n    <\/div>\n)/, (m, open, close) => {
      count++;
      return open + snapshot(page, data.get(page.key), today) + close;
    });
    if (count !== 1) throw new Error(`${path.relative(ROOT, page.file)}: the forecast block was not found`);
    fs.writeFileSync(page.file, html);
    urls.push('/' + path.relative(ROOT, path.dirname(page.file)).split(path.sep).join('/') + '/');
  });

  // The pages changed today: say so in the sitemap
  const sitemapFile = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapFile, 'utf8');
  let dated = 0;
  urls.forEach(url => {
    sitemap = sitemap.replace(new RegExp(`(<loc>${SITE}${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>)[^<]*`), (m, before) => { dated++; return before + today; });
  });
  fs.writeFileSync(sitemapFile, sitemap);
  console.log(`Forecast of ${today} written to ${pages.length} pages (${places.length} places); ${dated} dates in sitemap.xml.`);
})().catch(error => {
  console.error('build-forecast.js: ' + error.message);
  process.exit(1);
});
