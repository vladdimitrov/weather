// Writes /vremeto/utre/ ("Времето утре в България", Bulgarian only: the niche of the site): tomorrow's
// weather in the Bulgarian cities, as a sentence and a table, from Open-Meteo (the shared part is
// /js/tomorrow-core.js, which the browser also uses to refresh the table live).
//   node .github/scripts/build-tomorrow.js            writes the page (run every morning by forecast-daily.yml)
//   node .github/scripts/build-tomorrow.js --sample   fake data, written to the folder given after it (a check of the layout only)
// If Open-Meteo does not answer, a page that already has a forecast is left as it is; a page without
// one is written with an empty table that the browser fills.
const fs = require('fs');
const OmCache = require('./om-cache.js');
const path = require('path');
const CITIES = require('./bg-cities.js');
const Tomorrow = require('../../js/tomorrow-core.js');
const { page } = require('./build-pages.js');

const ROOT = process.cwd();
const URL_PATH = '/vremeto/utre/';
const FILE = path.join(ROOT, 'vremeto/utre/index.html');
const MARK = 'data-built="1"';

// the answers are kept for the day (om-cache.js): only the first run of the day asks Open-Meteo
const fetchJson = url => OmCache.json(url, () => fetchOpenMeteo(url));
async function fetchOpenMeteo(url) {
  const WAITS = [20000, 65000, 65000];
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url); // a network error stops the run at once
    if (response.ok) return response.json();
    if (response.status !== 429 || attempt >= WAITS.length) throw new Error(`HTTP ${response.status}`);
    await new Promise(resolve => setTimeout(resolve, WAITS[attempt]));
  }
}

const sampleAnswers = () => Tomorrow.urls(CITIES).map((url, chunk) => {
  const count = Math.min(20, CITIES.length - chunk * 20);
  return Array.from({ length: count }, (_, i) => ({ daily: {
    time: ['2026-11-16', '2026-11-17'], weather_code: [0, [0, 3, 61, 71, 45][(i + chunk) % 5]],
    temperature_2m_max: [10, 4 + ((i * 3) % 9)], temperature_2m_min: [2, -2 + ((i * 2) % 5)], precipitation_sum: [0, (i % 4) * 0.8], wind_speed_10m_max: [10, 8 + (i % 6) * 4] } }));
});

function render(data, issued) {
  const day = data.length ? new Date(data[0].day + 'T12:00:00Z').toLocaleDateString('bg-BG', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const summary = data.length ? Tomorrow.summary(data) : 'Прогнозата за утре се зарежда. Показани са градовете, за които има страница на сайта.';
  const faq = [
    ['Какво ще бъде времето утре в България?', data.length ? Tomorrow.summary(data) : 'Прогнозата за утре е в таблицата на тази страница.'],
    ['Откъде е прогнозата за утре?', 'От Open-Meteo, по данни на националните метеорологични служби; страницата се обновява всяка сутрин, а таблицата – и при отваряне.']
  ];
  return page({
    url: URL_PATH,
    lang: 'bg',
    multi: true,
    langs: ['bg'],
    title: 'Времето утре в България – градове, температури и валежи',
    description: data.length
      ? `Времето утре, ${day}: температури, валежи и вятър в ${data.length} града на България. ${Tomorrow.summary(data).split('. ')[0]}.`
      : 'Времето утре в България: температури, валежи и вятър в най-големите градове и курорти, обновявано всяка сутрин.',
    jsonLd: `  <script type="application/ld+json">\n  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Weather Pulse', '/'], ['Времето', '/vremeto/'], ['Времето утре', URL_PATH]].map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${url}` })) })}\n  </script>\n` +
      `  <script type="application/ld+json">\n  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'bg', mainEntity: faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) }).replace(/<\//g, '<\\/')}\n  </script>\n`,
    scripts: '<script src="/js/tomorrow-core.js?v=1" defer></script>\n<script src="/js/tomorrow.js?v=1" defer></script>\n',
    body: `    <p class="breadcrumbs"><a href="/vremeto/">Времето</a> › утре</p>
    <h1>Времето утре в България</h1>
    <section class="info-card">
      <p class="storm-intro">${day ? `<strong>${day.charAt(0).toUpperCase() + day.slice(1)}</strong> ` : ''}<span id="tomorrowSummary">${summary}</span></p>
    </section>
    <section class="info-card">
      <h2>Градове: температури, валежи и вятър</h2>
      <div class="table-scroll">
      <table class="kp-table" id="tomorrowTable" ${data.length ? MARK + ' ' : ''}data-cities='${JSON.stringify(CITIES.map(({ slug, name, lat, lon }) => ({ slug, name, lat, lon })))}'>
        <thead><tr><th>Град</th><th>Времето</th><th>Най-високо</th><th>Най-ниско</th><th>Валеж</th><th>Вятър</th></tr></thead>
        <tbody>
${Tomorrow.body(data)}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Температурите са най-високата и най-ниската за деня, вятърът – най-силният за деня. Данни: Open-Meteo${issued ? `, прогноза от ${issued}` : ''}. Подробна прогноза за 16 дни и по часове – на страницата на всеки град.</p>
    </section>
    <section class="info-card moon-faq">
      <h2>Често задавани въпроси</h2>
${faq.map(([q, a]) => `      <details class="moon-q"><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </section>
    <section class="info-card">
      <h2>Още прогнози</h2>
      <div class="city-links">
        <a href="/vremeto/" class="recent-place">Времето в градовете</a>
        <a href="/magnitni-buri/utre/" class="recent-place">Магнитни бури утре</a>
        <a href="/luna/" class="recent-place">Луната днес</a>
        <a href="/kurorti/" class="recent-place">Курорти</a>
      </div>
    </section>`
  });
}

async function main() {
  const sample = process.argv.includes('--sample');
  let data = [];
  let issued = '';
  try {
    const answers = sample ? sampleAnswers() : await Promise.all(Tomorrow.urls(CITIES).map(fetchJson));
    data = Tomorrow.rows(CITIES, answers);
    issued = new Date().toLocaleDateString('bg-BG', { timeZone: 'Europe/Sofia', day: 'numeric', month: 'long', year: 'numeric' });
    if (data.length < CITIES.length / 2) throw new Error(`only ${data.length} of ${CITIES.length} places answered`);
  } catch (error) {
    console.warn(`No forecast for tomorrow: ${error.message}`);
    if (fs.existsSync(FILE) && fs.readFileSync(FILE, 'utf8').includes(MARK)) { console.warn('The page keeps yesterday\'s forecast.'); return; }
    data = [];
  }
  const html = render(data, issued);
  const out = sample ? path.join(process.argv[process.argv.indexOf('--sample') + 1] || '/tmp/tomorrow-sample', 'index.html') : FILE;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`Wrote ${path.relative(ROOT, out)} (${data.length} places).`);
  OmCache.report('build-tomorrow.js');
}
main();
