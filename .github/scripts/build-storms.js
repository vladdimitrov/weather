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
  day: { bg: 'Ден', en: 'Day', de: 'Tag', it: 'Giorno', es: 'Día', fr: 'Jour', nl: 'Dag', ro: 'Ziua' },
  highest: { bg: 'Най-висок Kp', en: 'Highest Kp', de: 'Höchster Kp', it: 'Kp massimo', es: 'Kp máximo', fr: 'Kp maximal', nl: 'Hoogste Kp', ro: 'Kp maxim' },
  peak: { bg: 'Пик (българско време)', en: 'Peak (Sofia time)', de: 'Spitze (Sofia-Zeit)', it: 'Picco (ora di Sofia)', es: 'Pico (hora de Sofía)', fr: 'Pic (heure de Sofia)', nl: 'Piek (tijd Sofia)', ro: 'Vârf (ora Sofiei, ca în România)' },
  issued: {
    bg: 'Прогноза на NOAA от', en: 'NOAA forecast of', de: 'NOAA-Vorhersage vom', it: 'Previsione NOAA del', es: 'Pronóstico de la NOAA del',
    fr: 'Prévision de la NOAA du', nl: 'NOAA-verwachting van', ro: 'Prognoza NOAA din'
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
const hourOf = date => new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);

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
  // the 3-hour interval of the highest Kp of the day (Sofia time), the first one when several are equal
  const peakOf = slots => (slots && slots.length ? slots.reduce((best, slot) => (slot[2] > best[2] ? slot : best), slots[0]) : null);
  const color = kp => (Math.round(kp) >= 5 ? '#e74c3c' : Math.round(kp) >= 4 ? '#f1c40f' : '#2ecc71');
  const rows = days.map(({ day, kp, slots }) => {
    const top = peakOf(slots);
    return `            <tr><td>${esc(date(day, { weekday: 'long', day: 'numeric', month: 'long' }))}</td><td>${(Math.round(kp * 10) / 10).toFixed(1)}</td><td><span style="color:${color(kp)}">●</span> ${esc(word(T, levelKey(kp), lang))}</td><td>${top ? `${top[0]}–${top[1]}` : '–'}</td></tr>`;
  }).join('\n');
  const level = lang === 'bg' ? 'Ниво' : word(PAGE, 'thLevel', lang);
  // Deeper than the page's own lines, between the marks build-main.js looks for
  return `${START}
      <h3>${esc(word(T, 'forecastTitle', lang))}</h3>
      <div style="overflow-x:auto"><table class="kp-table">
        <thead><tr><th>${TEXT.day[lang]}</th><th>${TEXT.highest[lang]}</th><th>${esc(level)}</th><th>${esc(TEXT.peak[lang])}</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table></div>
      <p class="storm-updated">${TEXT.issued[lang]} ${esc(date(today, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>${lang === 'bg' ? `
      <p class="city-actions"><a class="btn" href="/magnitni-buri/dnes/">Днес по часове →</a> <a class="btn" href="/magnitni-buri/utre/">Утре →</a> <a class="btn" href="${StormPages.monthUrl(today)}">През ${StormPages.monthTitle(today)} →</a> <a class="btn" href="/magnitni-buri/kp-indeks/">Какво е Kp индекс →</a></p>
      <p class="storm-updated">${days.some(d => Math.round(d.kp) >= 5) ? 'Буря и възможни сияния: ' : ''}Облачно ли ще е тази нощ? <a href="/weather/">Почасова прогноза за вашия град →</a></p>` : lang === 'en' ? `
      <p class="city-actions"><a class="btn" href="/en/magnitni-buri/dnes/">Today by the hour →</a> <a class="btn" href="/en/magnitni-buri/utre/">Tomorrow →</a></p>` : lang === 'ro' ? `
      <p class="city-actions"><a class="btn" href="/ro/furtuni-magnetice/azi/">Azi pe ore →</a> <a class="btn" href="/ro/furtuni-magnetice/maine/">Mâine →</a></p>` : ''}
    ${END}`;
}

// The title and description of the Bulgarian /magnitni-buri/ carry the Kp of today (Nov 2026: 1 278 impressions
// a week at position 9, the queries "магнитни бури сега" and "... в реално време"), like /dnes/ and /utre/.
// Between <!-- volatile --> marks (the lastmod does not move every day); build-main.js takes the marks
// out when it makes the translations from this page.
const STATIC_DESCRIPTION = 'Магнитни бури в реално време: Kp индекс сега, слънчев вятър и прогноза на NOAA за 3 дни. Обновява се автоматично. Известие при буря.';
function hubHead(html, days) {
  const kp = kp => (Math.round(kp * 10) / 10).toFixed(1);
  const lower = text => text.charAt(0).toLocaleLowerCase('bg-BG') + text.slice(1);
  const date = new Date(days[0].day + 'T12:00:00Z').toLocaleDateString('bg-BG', { timeZone: 'UTC', day: 'numeric', month: 'long' });
  const title = `Магнитни бури сега и в реално време – днес Kp до ${kp(days[0].kp)}`;
  const description = `Днес (${date}): Kp до ${kp(days[0].kp)}, ${lower(word(T, levelKey(days[0].kp), 'bg'))}. ` +
    (days[1] ? `Утре: Kp до ${kp(days[1].kp)}, ${lower(word(T, levelKey(days[1].kp), 'bg'))}. ` : '') + STATIC_DESCRIPTION;
  const set = (pattern, tag, what) => {
    const marked = new RegExp(`(?:<!-- volatile -->)?${pattern.source}(?:<!-- /volatile -->)?`);
    if (!marked.test(html)) throw new Error(`magnitni-buri/index.html: ${what} not found`);
    html = html.replace(marked, () => `<!-- volatile -->${tag}<!-- /volatile -->`);
  };
  set(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, 'title');
  set(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`, 'description');
  set(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`, 'og:title');
  set(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`, 'og:description');
  return html;
}

(async function main() {
  const { days, past } = await forecast();
  const today = days[0].day;
  const urls = [];
  I18N.langsFor('/magnitni-buri/').forEach(lang => {
    const url = I18N.localUrl(lang, '/magnitni-buri/');
    const file = path.join(ROOT, url, 'index.html');
    let html = read(file);
    const block = `<div class="kp-forecast" id="stormForecast">${table(lang, days, today)}</div>`;
    const marked = new RegExp(`<div class="kp-forecast" id="stormForecast">${START}[\\s\\S]*?${END}</div>`);
    if (marked.test(html)) html = html.replace(marked, () => block);
    else if (html.includes(EMPTY)) html = html.replace(EMPTY, () => block);
    else throw new Error(`${url}index.html: the #stormForecast block was not found`);
    if (lang === 'bg') html = hubHead(html, days);
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
