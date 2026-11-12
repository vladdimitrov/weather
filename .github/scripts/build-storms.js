// Writes NOAA's 3-day forecast of magnetic storms into the HTML of /magnitni-buri/ and its
// translations, so the page says what is expected today, tomorrow and the day after before
// (and without) JavaScript, and search engines see fresh numbers every day. In the browser
// /js/storm-page.js replaces it with the live forecast as before.
// Run every morning by .github/workflows/forecast-daily.yml:
//   node .github/scripts/build-storms.js
//
// The table goes between two comment marks inside #stormForecast. build-main.js keeps it
// when it rewrites the translations. If NOAA does not answer, nothing is written and the
// pages keep the forecast of the day before (its date is in the table).
// The forecast, Kp every 3 hours, the highest Kp of the past days and NOAA's 27-day outlook are
// kept in storms-data.json, from which build-storm-pages.js writes /magnitni-buri/dnes/, /utre/
// and the month pages (/magnitni-buri/noemvri-2026/); this script runs it at the end.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const I18N = require('./i18n.js');

const ROOT = process.cwd();
const URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';
const OUTLOOK = 'https://services.swpc.noaa.gov/text/27-day-outlook.txt';
const DATA_FILE = path.join(__dirname, 'storms-data.json');
const StormPages = require('./build-storm-pages.js');
const START = '<!-- kp-forecast:start -->';
const END = '<!-- kp-forecast:end -->';
const EMPTY = '<div class="kp-forecast" id="stormForecast" hidden></div>';
const ZONE = 'Europe/Sofia';

// Words that are not on the page yet
const TEXT = {
  day: { bg: 'Ден', en: 'Day', de: 'Tag', it: 'Giorno', es: 'Día' },
  highest: { bg: 'Най-висок Kp', en: 'Highest Kp', de: 'Höchster Kp', it: 'Kp massimo', es: 'Kp máximo' },
  issued: {
    bg: 'Прогноза на NOAA от', en: 'NOAA forecast of', de: 'NOAA-Vorhersage vom', it: 'Previsione NOAA del', es: 'Pronóstico de la NOAA del'
  }
};

const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const esc = I18N.esc;

// The texts of the page script: level names, "3-day forecast", "Level"
function declaration(source, name) {
  const match = source.match(new RegExp(`^([ \\t]*)const ${name} = \\{[\\s\\S]*?^\\1\\};`, 'm'));
  if (!match) throw new Error(`js/storm-page.js: "const ${name} = {" not found`);
  return match[0];
}
const script = read(path.join(ROOT, 'js/storm-page.js'));
const { PAGE, T } = vm.runInNewContext(`${declaration(script, 'PAGE')}\n${declaration(script, 'T')}\n({ PAGE, T })`);
const word = (group, key, lang) => {
  const text = group[key] && (group[key][lang] || (lang === 'bg' ? null : group[key].en));
  if (!text) throw new Error(`no "${key}" text in ${lang}`);
  return text;
};
// as statusText() in js/storm-page.js
const levelKey = kp => (kp >= 9 ? 'extreme' : kp >= 8 ? 'severe' : kp >= 7 ? 'strong' : kp >= 6 ? 'moderate' : kp >= 5 ? 'minor' : kp >= 4 ? 'active' : 'calm');

const dayOf = date => new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const hourOf = date => new Intl.DateTimeFormat('bg-BG', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);

async function forecast() {
  const response = await fetch(URL);
  if (!response.ok) throw new Error(`NOAA answered ${response.status}`);
  const list = await response.json();
  const today = dayOf(new Date());
  const days = new Map(); // Sofia calendar day -> highest Kp
  const slots = new Map(); // Sofia calendar day -> [from, to, Kp] every 3 hours
  const past = new Map(); // days before today: highest Kp observed (or estimated) by NOAA
  list.forEach(entry => {
    const kp = parseFloat(entry.kp);
    const time = new Date(String(entry.time_tag) + 'Z');
    if (isNaN(kp) || isNaN(time)) return;
    const day = dayOf(time);
    if (day < today) {
      if (entry.observed !== 'predicted') past.set(day, Math.max(past.get(day) || 0, kp));
      return;
    }
    days.set(day, Math.max(days.get(day) || 0, kp));
    if (!slots.has(day)) slots.set(day, []);
    slots.get(day).push([hourOf(time), hourOf(new Date(time.getTime() + 3 * 3600 * 1000)), Math.round(kp * 100) / 100]);
  });
  const result = [...days.entries()].sort().slice(0, 3).map(([day, kp]) => ({ day, kp, slots: slots.get(day) }));
  if (result.length < 2 || result[0].day !== today) throw new Error('NOAA: the forecast does not start today');
  return { days: result, past };
}

// NOAA's 27-day outlook: one line a day, "2026 Nov 12     145          12          4"
// (10.7 cm radio flux, planetary A index, largest Kp). Optional: the pages do without it.
async function outlook() {
  const response = await fetch(OUTLOOK);
  if (!response.ok) throw new Error(`NOAA 27-day outlook answered ${response.status}`);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = [];
  for (const line of (await response.text()).split('\n')) {
    const match = line.match(/^(\d{4})\s+([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d+)\s+(\d+)\s+(\d+)\s*$/);
    if (!match || !MONTHS.includes(match[2])) continue;
    days.push({ day: `${match[1]}-${String(MONTHS.indexOf(match[2]) + 1).padStart(2, '0')}-${match[3].padStart(2, '0')}`, ap: Number(match[5]), kp: Number(match[6]) });
  }
  if (days.length < 20) throw new Error(`NOAA 27-day outlook: ${days.length} days found`);
  return days;
}

function table(lang, days, today) {
  const locale = I18N.LOCALE[lang];
  const date = (iso, options) => new Date(iso + 'T12:00:00Z').toLocaleDateString(locale, { timeZone: 'UTC', ...options });
  const rows = days.map(({ day, kp }) =>
    `            <tr><td>${esc(date(day, { weekday: 'long', day: 'numeric', month: 'long' }))}</td><td>${(Math.round(kp * 10) / 10).toFixed(1)}</td><td>${esc(word(T, levelKey(kp), lang))}</td></tr>`).join('\n');
  const level = lang === 'bg' ? 'Ниво' : word(PAGE, 'thLevel', lang);
  // Deeper than the page's own lines, between the marks build-main.js looks for
  return `${START}
      <h3>${esc(word(T, 'forecastTitle', lang))}</h3>
      <table class="kp-table">
        <thead><tr><th>${TEXT.day[lang]}</th><th>${TEXT.highest[lang]}</th><th>${esc(level)}</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      <p class="storm-updated">${TEXT.issued[lang]} ${esc(date(today, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>${lang === 'bg' ? `
      <p class="city-actions"><a class="btn" href="/magnitni-buri/dnes/">Днес по часове →</a> <a class="btn" href="/magnitni-buri/utre/">Утре →</a> <a class="btn" href="${StormPages.monthUrl(today)}">През ${StormPages.monthTitle(today)} →</a> <a class="btn" href="/magnitni-buri/kp-indeks/">Какво е Kp индекс →</a></p>` : ''}
    ${END}`;
}

(async function main() {
  const { days, past } = await forecast();
  const today = days[0].day;
  const urls = [];
  I18N.LANGS.forEach(lang => {
    const url = I18N.localUrl(lang, '/magnitni-buri/');
    const file = path.join(ROOT, url, 'index.html');
    let html = read(file);
    const block = `<div class="kp-forecast" id="stormForecast">${table(lang, days, today)}</div>`;
    const marked = new RegExp(`<div class="kp-forecast" id="stormForecast">${START}[\\s\\S]*?${END}</div>`);
    if (marked.test(html)) html = html.replace(marked, () => block);
    else if (html.includes(EMPTY)) html = html.replace(EMPTY, () => block);
    else throw new Error(`${url}index.html: the #stormForecast block was not found`);
    fs.writeFileSync(file, html);
    urls.push(url);
  });

  console.log(`Storm forecast of ${today} (${days.map(d => d.kp).join(', ')}) written to ${urls.length} pages.`);

  // The data of the Bulgarian storm pages: keep the past days (about 13 months)
  const saved = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : {};
  const history = { ...(saved.history || {}), ...Object.fromEntries([...past].map(([day, kp]) => [day, Math.round(kp * 100) / 100])) };
  const oldest = new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10);
  Object.keys(history).forEach(day => { if (day < oldest) delete history[day]; });
  let longRange = saved.outlook || null;
  try { longRange = await outlook(); } catch (error) { console.warn(error.message); }
  const data = { issued: today, days, outlook: longRange && longRange.filter(d => d.day >= today), history };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 1) + '\n');
  const { months } = StormPages.build();
  console.log(`Wrote /magnitni-buri/dnes/, /utre/ and ${months.length} month page(s).`);
  // The sitemap: build-sitemap.js (the workflow runs it next)
})().catch(error => {
  console.error('build-storms.js: ' + error.message);
  process.exit(1);
});
