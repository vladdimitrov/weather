// Writes today's forecast (7 days; data-days="10" or data-weekend on #cityForecast for the 10-day
// and weekend pages) and a sentence about it into the HTML of the city pages, so the page has a forecast
// before (and without) JavaScript and search engines see fresh numbers every day. In the
// browser /js/city-forecast.js replaces it with the live forecast as before.
// Run every morning by .github/workflows/forecast-daily.yml.
//
//   node .github/scripts/build-forecast.js               all city pages: /vremeto/<city>/ (and /10-dni/, /uikend/) and /europe/<country>/<city>/, all languages
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
const API = 'https://api.open-meteo.com/v1/forecast';
const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max';
const CHUNK = 20; // places in one request

const ISSUED = { bg: 'Прогноза от', en: 'Forecast issued on', de: 'Vorhersage vom', it: 'Previsione del', es: 'Previsión del' };

// One sentence about the days of the page: the warmest and the coldest, the days with
// precipitation and how the highs compare with the climate of the month (climate.json)
const SUMMARY = {
  bg: {
    span: n => (n ? `През следващите ${n} дни` : 'През уикенда'),
    text: s => `${s.span} най-топло ще е ${/^в/.test(s.warmDay) ? 'във' : 'в'} ${s.warmDay} (до ${s.warmT}), а най-студено – ${/^в/.test(s.coldDay) ? 'във' : 'в'} ${s.coldDay} (до ${s.coldT}). ${s.wet ? `Валежи се очакват в ${s.wet} от дните.` : 'Не се очакват значителни валежи.'}`,
    normal: (cmp, month, normal) => ` Дневните температури са ${['по-ниски от обичайните', 'близо до обичайните', 'по-високи от обичайните'][cmp]} за ${month} (средно ${normal}).`
  },
  en: {
    span: n => (n ? `Over the next ${n} days` : 'Over the weekend'),
    text: s => `${s.span} the warmest day is ${s.warmDay} (up to ${s.warmT}) and the coldest ${s.coldDay} (down to ${s.coldT}). ${s.wet ? `Rain or snow is expected on ${s.wet} of the days.` : 'No significant precipitation is expected.'}`,
    normal: (cmp, month, normal) => ` Daytime temperatures are ${['below', 'close to', 'above'][cmp]} normal for ${month} (average high ${normal}).`
  },
  de: {
    span: n => (n ? `In den nächsten ${n} Tagen` : 'Am Wochenende'),
    text: s => `${s.span} ist ${s.warmDay} am wärmsten (bis ${s.warmT}) und ${s.coldDay} am kältesten (bis ${s.coldT}). ${s.wet ? `An ${s.wet} der Tage wird Niederschlag erwartet.` : 'Nennenswerter Niederschlag ist nicht zu erwarten.'}`,
    normal: (cmp, month, normal) => ` Tagsüber ist es ${['kälter als', 'etwa so warm wie', 'wärmer als'][cmp]} üblich im ${month} (im Mittel ${normal}).`
  },
  it: {
    span: n => (n ? `Nei prossimi ${n} giorni` : 'Nel fine settimana'),
    text: s => `${s.span} il giorno più caldo sarà ${s.warmDay} (fino a ${s.warmT}) e il più freddo ${s.coldDay} (fino a ${s.coldT}). ${s.wet ? `Sono previste precipitazioni in ${s.wet} dei giorni.` : 'Non sono previste precipitazioni significative.'}`,
    normal: (cmp, month, normal) => ` Le massime sono ${['sotto la media', 'nella media', 'sopra la media'][cmp]} di ${month} (in media ${normal}).`
  },
  es: {
    span: n => (n ? `En los próximos ${n} días` : 'Durante el fin de semana'),
    text: s => `${s.span} el día más cálido será el ${s.warmDay} (hasta ${s.warmT}) y el más frío el ${s.coldDay} (hasta ${s.coldT}). ${s.wet ? `Se esperan precipitaciones en ${s.wet} de los días.` : 'No se esperan precipitaciones importantes.'}`,
    normal: (cmp, month, normal) => ` Las máximas están ${['por debajo de', 'cerca de', 'por encima de'][cmp]} lo normal para ${month} (media de ${normal}).`
  }
};
const CLIMATE = {};
for (const name of ['climate.json', 'climate-europe.json']) {
  const file = path.join(__dirname, name);
  if (fs.existsSync(file)) Object.assign(CLIMATE, JSON.parse(fs.readFileSync(file, 'utf8')).cities);
}
// "/de/europe/italy/naples/" -> "italy/naples", "/vremeto/sofia/10-dni/" -> "sofia"
const climateOf = url => {
  const bare = url.replace(/^\/(en|de|it|es)(?=\/)/, '');
  const bg = bare.match(/^\/vremeto\/([a-z-]+)\//);
  const europe = bare.match(/^\/europe\/([a-z-]+)\/([a-z-]+)\//);
  return CLIMATE[europe ? `${europe[1]}/${europe[2]}` : bg ? bg[1] : ''] || null;
};
// Friday to Sunday of the coming weekend (as weekendDays() in js/city-forecast.js)
function weekendDays(dates) {
  const weekday = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
  const start = dates.findIndex(iso => [5, 6, 0].includes(weekday(iso)));
  if (start < 0) return dates.map((d, i) => i);
  const list = [];
  for (let i = start; i < dates.length && [5, 6, 0].includes(weekday(dates[i])); i++) list.push(i);
  return list;
}

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
const { conditions, T, PERIOD, WIND } = vm.runInNewContext(
  `${['conditions', 'T', 'PERIOD', 'WIND'].map(name => declaration(cityScript, name, 'js/city-forecast.js')).join('\n')}\n({ conditions, T, PERIOD, WIND })`);
const STRONG = Number((cityScript.match(/const STRONG = (\d+);/) || [])[1]);
if (!STRONG) throw new Error('js/city-forecast.js: "const STRONG" not found');
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
    const box = html.match(/<div class="city-forecast" id="cityForecast" data-name="([^"]*)" data-lat="([^"]*)" data-lon="([^"]*)" data-query="([^"]*)"((?: data-[a-z]+="[^"]*")*)>/);
    if (!box) return null;
    const days = Number((box[5].match(/data-days="(\d+)"/) || [])[1]) || 7;
    return {
      file, html, lang: (html.match(/<html lang="(\w+)"/) || [])[1], name: box[1], lat: box[2], lon: box[3], query: box[4],
      days: Math.min(Math.max(days, 7), 16), weekend: box[5].includes('data-weekend')
    };
  }).filter(Boolean);
}

async function forecasts(places) {
  const result = new Map();
  const chunks = [];
  [...new Set(places.map(p => p.days))].forEach(days => {
    const group = places.filter(p => p.days === days);
    for (let i = 0; i < group.length; i += CHUNK) chunks.push(group.slice(i, i + CHUNK));
  });
  for (const chunk of chunks) {
    const url = `${API}?latitude=${chunk.map(p => p.lat).join(',')}&longitude=${chunk.map(p => p.lon).join(',')}` +
      `&daily=${DAILY}&forecast_days=${chunk[0].days}&timezone=auto&models=${Core.MODELS.join(',')}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo answered ${response.status} ${(await response.text()).slice(0, 200)}`);
    const json = await response.json();
    const answers = Array.isArray(json) ? json : [json];
    if (answers.length !== chunk.length) throw new Error(`Open-Meteo: ${answers.length} answers for ${chunk.length} places`);
    answers.forEach((answer, index) => {
      const data = Core.collapse(answer);
      const daily = data.daily;
      const complete = daily && daily.time && daily.time.length === chunk[index].days &&
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

  const shown = page.weekend ? weekendDays(daily.time) : daily.time.map((d, i) => i);
  const days = shown.map(i => {
    const iso = daily.time[i];
    const rain = chance(i);
    const amount = daily.precipitation_sum ? daily.precipitation_sum[i] : null;
    const wind = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : null;
    const gust = daily.wind_gusts_10m_max ? daily.wind_gusts_10m_max[i] : null;
    return `          <a class="kp-day city-day" href="/weather/?${page.query}&date=${iso}" title="${esc(text.hourly)}">
            <span class="kp-day-name">${esc(date(iso, { weekday: 'short', day: 'numeric' }))}</span>
            <span class="city-day-icon" aria-hidden="true">${condition(daily.weather_code[i]).icon}</span>
            <span class="city-day-date">${iso.slice(5).split('-').reverse().join('.')}</span>
            <span class="city-day-temp">${range(i)}</span>
            <span class="kp-day-status">${esc(describe(i))}</span>${typeof rain === 'number' ? `
            <span class="city-day-rain" title="${esc(text.rain)}">${Math.round(rain)}%${typeof amount === 'number' && amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ''}</span>` : ''}${typeof wind === 'number' ? `
            <span class="city-day-wind${gust >= STRONG ? ' city-day-gusts' : ''}">${esc(text.wind)} ${Math.round(wind)} km/h${typeof gust === 'number' ? ` · ${esc(WIND[lang].gusts)} ${Math.round(gust)}` : ''}</span>` : ''}
          </a>`;
  }).join('\n');

  const rainToday = chance(0);
  const heading = page.weekend ? PERIOD[lang].weekend : page.days !== 7 ? PERIOD[lang].days(page.days) : text.days;
  // The warmest and the coldest of the days shown, the days with precipitation, the climate of the month
  const S = SUMMARY[lang];
  const warm = shown.reduce((a, b) => (daily.temperature_2m_max[b] > daily.temperature_2m_max[a] ? b : a));
  const cold = shown.reduce((a, b) => (daily.temperature_2m_min[b] < daily.temperature_2m_min[a] ? b : a));
  const wet = shown.filter(i => (chance(i) || 0) >= 50 || (daily.precipitation_sum && daily.precipitation_sum[i] >= 1)).length;
  const longDay = iso => date(iso, { weekday: 'long', day: 'numeric', month: 'long' });
  let summary = S.text({
    span: S.span(page.weekend ? 0 : shown.length), warmDay: longDay(daily.time[warm]), warmT: whole(daily.temperature_2m_max[warm]),
    coldDay: longDay(daily.time[cold]), coldT: whole(daily.temperature_2m_min[cold]), wet
  });
  const climate = climateOf(page.url);
  if (climate) {
    const month = Number(daily.time[shown[0]].slice(5, 7)) - 1;
    const normal = climate.months[month].high;
    const mean = shown.reduce((sum, i) => sum + daily.temperature_2m_max[i], 0) / shown.length;
    summary += S.normal(mean - normal >= 2 ? 2 : normal - mean >= 2 ? 0 : 1, I18N.monthName(lang, month), whole(normal));
  }
  browser.document.documentElement.lang = lang;
  const note = Core.note({ models: data.models, elevation: data.elevation });
  // Strong gusts today or tomorrow (the page adds the official warnings of NIMH when it opens)
  const W = WIND[lang];
  const alerts = [0, 1].map(i => (daily.wind_gusts_10m_max || [])[i]).map((g, i) => (typeof g === 'number' && g >= STRONG
    ? `        <p class="city-alert city-alert-${g >= 90 ? 'orange' : 'yellow'}">${esc((g >= 90 ? W.very : W.strong)(Math.round(g), i === 0 ? W.today : W.tomorrow))}</p>\n` : '')).join('');
  // Deeper than the closing </div> of #cityForecast (4 spaces), which marks the end of the block
  return `${alerts ? `      <div class="city-alerts" id="cityAlerts" role="status">\n${alerts}      </div>\n` : ''}      <div class="kp-forecast city-now" id="cityNow">
        <h2>${esc(page.name)}: ${esc(date(daily.time[0], { weekday: 'long', day: 'numeric', month: 'long' }))}</h2>
        <span class="storm-now-value" style="font-size: 1.5rem; white-space: nowrap;">${range(0)}</span>
        <p class="storm-now-status">${esc(describe(0))}${typeof rainToday === 'number' ? ` · ${esc(text.rain)} ${Math.round(rainToday)}%` : ''}</p>
        <p class="storm-updated">${ISSUED[lang]} ${esc(date(today, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
      </div>
      <div class="kp-forecast" id="cityDays">
        <h3>${esc(heading)}</h3>
        <p class="city-summary">${esc(summary)}</p>
        <div class="city-days">
${days}
        </div>${note ? `
        <p class="forecast-note">${esc(note)}</p>` : ''}
      </div>`;
}

(async function main() {
  const folders = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  // Bulgarian at the root, the other languages under /en/, /de/ ...
  const all = I18N.LANGS.flatMap(lang => ['vremeto', 'europe'].map(folder => path.join(I18N.prefix(lang).slice(1), folder)));
  const pages = cityPages(folders.length ? folders : all);
  if (!pages.length) throw new Error('No city pages found');
  pages.forEach(page => {
    page.key = `${page.lat},${page.lon},${page.days}`;
    page.url = '/' + path.relative(ROOT, path.dirname(page.file)).split(path.sep).join('/') + '/';
  });
  // one request per chunk of places with the same number of days
  const places = [...new Map(pages.map(page => [page.key, page])).values()].sort((a, b) => a.days - b.days);
  const data = await forecasts(places);
  const today = new Date().toISOString().slice(0, 10);

  pages.forEach(page => {
    let count = 0;
    const html = page.html.replace(/(<div class="city-forecast" id="cityForecast"[^>]*>\n)[\s\S]*?(\n    <\/div>\n)/, (m, open, close) => {
      count++;
      return open + snapshot(page, data.get(page.key), today) + close;
    });
    if (count !== 1) throw new Error(`${path.relative(ROOT, page.file)}: the forecast block was not found`);
    fs.writeFileSync(page.file, html);
  });
  // The sitemap is not touched: a new forecast is not new content (build-sitemap.js leaves it out)
  console.log(`Forecast of ${today} written to ${pages.length} pages (${places.length} places).`);
})().catch(error => {
  console.error('build-forecast.js: ' + error.message);
  process.exit(1);
});
