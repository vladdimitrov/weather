// Writes /vremeto/uv-indeks/ (UV index today and tomorrow in the Bulgarian cities) and /vremeto/polen/
// (pollen: alder, birch, grass, mugwort, ragweed, olive), Bulgarian only. The shared part
// is /js/health-core.js (also used by the browser to refresh the tables). Data: Open-Meteo.
//   node .github/scripts/build-health.js            (run every morning by forecast-daily.yml)
// If Open-Meteo does not answer, a page that already has data is left as it is; otherwise the table is
// written empty and the browser fills it.
const fs = require('fs');
const path = require('path');
const CITIES_ALL = require('./bg-cities.js');
const Health = require('../../js/health-core.js');
const { page } = require('./build-pages.js');

const ROOT = process.cwd();
const MARK = 'data-built="1"';
const UV_CITIES = CITIES_ALL;                 // sea, mountain and big cities
const POLLEN_CITIES = CITIES_ALL.slice(0, 20); // the big cities
const slim = list => JSON.stringify(list.map(({ slug, name, lat, lon }) => ({ slug, name, lat, lon })));

async function fetchJson(url) {
  const WAITS = [20000, 65000, 65000];
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url); // a network error stops the run at once
    if (response.ok) return response.json();
    if (response.status !== 429 || attempt >= WAITS.length) throw new Error(`HTTP ${response.status}`);
    await new Promise(resolve => setTimeout(resolve, WAITS[attempt]));
  }
}

const crumbs = (name, url) => `  <script type="application/ld+json">\n  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Weather Pulse', '/'], ['Времето', '/vremeto/'], [name, url]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: `https://weatherpulse.eu${u}` })) })}\n  </script>\n`;
const faqJson = faq => `  <script type="application/ld+json">\n  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'bg', mainEntity: faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) }).replace(/<\//g, '<\\/')}\n  </script>\n`;
const faqHtml = faq => `    <section class="info-card moon-faq">
      <h2>Често задавани въпроси</h2>
${faq.map(([q, a]) => `      <details class="moon-q"><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </section>`;
const links = items => `    <section class="info-card">
      <h2>Още прогнози</h2>
      <div class="city-links">
        ${items.map(([url, text]) => `<a href="${url}" class="recent-place">${text}</a>`).join('\n        ')}
      </div>
    </section>`;
const SCRIPTS = '<script src="/js/health-core.js?v=1" defer></script>\n<script src="/js/health.js?v=1" defer></script>\n';
const issuedText = () => new Date().toLocaleDateString('bg-BG', { timeZone: 'Europe/Sofia', day: 'numeric', month: 'long', year: 'numeric' });

function uvPage(rows) {
  const url = '/vremeto/uv-indeks/';
  const faq = [
    ['Какъв е UV индексът днес?', rows.length ? Health.uvSummary(rows) : 'Стойностите по градове са в таблицата на тази страница.'],
    ['При какъв UV индекс трябва да се пазим от слънцето?', 'От 3 нагоре Световната здравна организация препоръчва защита: сянка около обяд, дрехи, шапка, очила и слънцезащитен крем. От 8 нагоре защитата е особено важна, а най-добре е да избягвате слънцето в средата на деня.'],
    ['Кога UV индексът е най-висок?', 'Около слънчевото пладне – в България обикновено между 12 и 15 часа лятно часово време – и най-много през юни и юли. Облаците го намаляват, но част от лъчите минават и през тях.']
  ];
  return page({
    url, lang: 'bg', multi: true, langs: ['bg'],
    title: 'UV индекс днес в България – по градове и курорти',
    description: rows.length ? `UV индекс днес и утре в ${rows.length} града и курорта на България. ${Health.uvSummary(rows).split('. ')[0]}. Скала на СЗО и съвети за защита от слънцето.` : 'UV индекс днес и утре в градовете и курортите на България: стойности, скала на СЗО и съвети за защита от слънцето.',
    jsonLd: crumbs('UV индекс', url) + faqJson(faq),
    scripts: SCRIPTS,
    body: `    <p class="breadcrumbs"><a href="/vremeto/">Времето</a> › UV индекс</p>
    <h1>UV индекс днес в България</h1>
    <section class="info-card">
      <p class="storm-intro" id="healthSummary">${rows.length ? Health.uvSummary(rows) : 'Стойностите се зареждат.'}</p>
    </section>
    <section class="info-card">
      <h2>UV индекс по градове</h2>
      <div class="table-scroll">
      <table class="kp-table" data-health="uv" ${rows.length ? MARK + ' ' : ''}data-cities='${slim(UV_CITIES)}'>
        <thead><tr><th>Град</th><th>Днес</th><th>Утре</th></tr></thead>
        <tbody>
${Health.uvBody(rows)}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Най-висока стойност за деня по данни на Open-Meteo${rows.length ? `, прогноза от ${issuedText()}` : ''}. Таблицата се обновява при отваряне.</p>
    </section>
    <section class="info-card">
      <h2>Скала на UV индекса (СЗО)</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Индекс</th><th>Ниво</th><th>Защита</th></tr></thead>
        <tbody>
          <tr><td>0–2</td><td>Нисък</td><td>Не е нужна специална защита.</td></tr>
          <tr><td>3–5</td><td>Умерен</td><td>Сянка около обяд, дрехи, шапка, очила, слънцезащитен крем.</td></tr>
          <tr><td>6–7</td><td>Висок</td><td>Същото, като кремът е задължителен; избягвайте слънцето между 11 и 15 ч.</td></tr>
          <tr><td>8–10</td><td>Много висок</td><td>Допълнителна защита; кожата може да изгори за минути.</td></tr>
          <tr><td>11+</td><td>Екстремален</td><td>Избягвайте слънцето в средата на деня; търсете сянка.</td></tr>
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Скалата е на Световната здравна организация. Това не са медицински съвети; при кожни проблеми се обърнете към лекар.</p>
    </section>
${faqHtml(faq)}
${links([['/vremeto/utre/', 'Времето утре'], ['/vremeto/polen/', 'Полени'], ['/vremeto/', 'Времето в градовете'], ['/kurorti/', 'Курорти']])}`
  });
}

function pollenPage(rows) {
  const url = '/vremeto/polen/';
  const faq = [
    ['Има ли полени днес?', rows.length ? Health.pollenSummary(rows) : 'Нивата по градове са в таблицата на тази страница.'],
    ['Кога е сезонът на полените в България?', 'Ориентировъчно: дървета като елша и бреза – от края на зимата до пролетта, треви – от пролетта до началото на лятото, а пелин и амброзия – в края на лятото и началото на есента. Точните дати зависят от годината и времето.'],
    ['Какво да правя при алергия към полени?', 'Следете нивата, проветрявайте при ниска концентрация (след дъжд), измивайте косата и дрехите след излизане и се посъветвайте с лекар или фармацевт за лечение.']
  ];
  return page({
    url, lang: 'bg', multi: true, langs: ['bg'],
    title: 'Полени днес в България – прогноза за алергици',
    description: 'Полени във въздуха днес в България: елша, бреза, треви, пелин, амброзия и маслина по градове. Ориентировъчни нива и календар на цъфтежа за хора с алергии.',
    jsonLd: crumbs('Полени', url) + faqJson(faq),
    scripts: SCRIPTS,
    body: `    <p class="breadcrumbs"><a href="/vremeto/">Времето</a> › полени</p>
    <h1>Полени днес в България</h1>
    <section class="info-card">
      <p class="storm-intro" id="healthSummary">${rows.length ? Health.pollenSummary(rows) : 'Данните се зареждат.'}</p>
    </section>
    <section class="info-card">
      <h2>Полени по градове (зърна на кубичен метър)</h2>
      <div class="table-scroll">
      <table class="kp-table" data-health="pollen" ${rows.length ? MARK + ' ' : ''}data-cities='${slim(POLLEN_CITIES)}'>
        <thead><tr><th>Град</th>${Health.POLLEN.map(p => `<th>${p[1]}</th>`).join('')}</tr></thead>
        <tbody>
${Health.pollenBody(rows)}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Най-високата стойност за следващите 24 часа по модел на Open-Meteo (CAMS Европа)${rows.length ? `, от ${issuedText()}` : ''}. „–“ означава, че няма данни за вида. Нивата в скоби са ориентировъчни и важат за всички видове едно и също; реалната чувствителност зависи от човека и от вида. Извън сезона стойностите са нули или липсват.</p>
    </section>
${faqHtml(faq)}
${links([['/vremeto/utre/', 'Времето утре'], ['/vremeto/uv-indeks/', 'UV индекс'], ['/vremeto/kachestvo-na-vazduha/', 'Качество на въздуха'], ['/vremeto/', 'Времето в градовете']])}`
  });
}

async function build(file, urls, rowsOf, render) {
  let rows = [];
  try {
    const answers = await Promise.all(urls.map(fetchJson));
    rows = rowsOf(answers);
    if (!rows.length) throw new Error('no data');
  } catch (error) {
    console.warn(`${path.basename(path.dirname(file))}: no data (${error.message})`);
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(MARK)) { console.warn('  the page keeps the earlier values.'); return; }
    rows = [];
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(rows));
  console.log(`Wrote ${path.relative(ROOT, file)} (${rows.length} places).`);
}

(async () => {
  await build(path.join(ROOT, 'vremeto/uv-indeks/index.html'), Health.uvUrls(UV_CITIES), a => Health.uvRows(UV_CITIES, a), uvPage);
  await build(path.join(ROOT, 'vremeto/polen/index.html'), Health.pollenUrls(POLLEN_CITIES), a => Health.pollenRows(POLLEN_CITIES, a), pollenPage);
})();
