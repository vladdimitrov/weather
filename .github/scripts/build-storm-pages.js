// The Bulgarian pages about magnetic storms next to /magnitni-buri/ (Bulgarian only: the niche of
// the site with little competition in Bulgarian, see places.js for why not in every language):
//   /magnitni-buri/dnes/            magnetic storms today: highest Kp, Kp every 3 hours (NOAA)
//   /magnitni-buri/utre/            the same for tomorrow
//   /magnitni-buri/<month>-<year>/  the days of a month: Kp observed so far and NOAA's 27-day outlook
//   /magnitni-buri/kp-indeks/       what the Kp index means (no data)
//   /magnitni-buri/zdrave/          magnetic storms and health: what is known (no data)
// The data come from storms-data.json, which build-storms.js refreshes every morning and then runs
// this script; it also works on its own: node .github/scripts/build-storm-pages.js
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { page, write } = require('./build-pages.js');

const DATA_FILE = path.join(__dirname, 'storms-data.json');
const ONLY_BG = { lang: 'bg', multi: true, langs: ['bg'] };
const esc = I18N.esc;
// Same folder names as the Moon calendar (/luna/2026/noemvri/)
const MONTH_SLUG = ['yanuari', 'fevruari', 'mart', 'april', 'may', 'yuni', 'yuli', 'avgust', 'septemvri', 'oktomvri', 'noemvri', 'dekemvri'];
const LEVELS = [
  [9, 'Изключителна магнитна буря', 'G5'], [8, 'Много силна магнитна буря', 'G4'], [7, 'Силна магнитна буря', 'G3'],
  [6, 'Умерена магнитна буря', 'G2'], [5, 'Слаба магнитна буря', 'G1'], [4, 'Повишена активност', ''], [0, 'Спокойно', '']
];
// Kp is given in thirds (4.67 = 5−): a storm starts at 5− as NOAA rounds it
const level = kp => LEVELS.find(([min]) => Math.round(kp) >= min) || LEVELS[LEVELS.length - 1];
const kpText = kp => (Math.round(kp * 10) / 10).toFixed(1);
const date = (iso, options) => new Date(iso + 'T12:00:00Z').toLocaleDateString('bg-BG', { timeZone: 'UTC', ...options });
const longDate = iso => date(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthUrl = iso => `/magnitni-buri/${MONTH_SLUG[Number(iso.slice(5, 7)) - 1]}-${iso.slice(0, 4)}/`;
const monthTitle = iso => `${I18N.monthName('bg', Number(iso.slice(5, 7)) - 1)} ${iso.slice(0, 4)}`;

const KP_WIDGET = `
    <section class="info-card">
      <h2>Kp индекс сега</h2>
      <iframe src="/widget/kp.html?lang=bg" width="320" height="190" style="border:0;max-width:100%" title="Kp индекс сега" loading="lazy"></iframe>
      <p class="storm-updated">Стойността се обновява на всеки няколко минути по данни на NOAA. Подробна графика, слънчев вятър и известия при буря: <a href="/magnitni-buri/">Магнитни бури</a>.</p>
    </section>`;

function breadcrumbs(items) {
  return `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${url}` }))
  })}
  </script>
`;
}
const faqJson = items => `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'bg',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } }))
  }).replace(/<\//g, '<\\/')}
  </script>
`;

function links(current, data) {
  const list = [
    ['/magnitni-buri/', 'Kp индекс сега'], ['/magnitni-buri/dnes/', 'Магнитни бури днес'], ['/magnitni-buri/utre/', 'Магнитни бури утре'],
    [monthUrl(data.issued), `Магнитни бури през ${monthTitle(data.issued)}`],
    ['/magnitni-buri/kp-indeks/', 'Kp индекс – какво означава'], ['/magnitni-buri/zdrave/', 'Магнитни бури и здраве'], ['/nebeto/', 'Северно сияние и небето']
  ].filter(([url]) => url !== current);
  return `
    <section class="info-card">
      <h2>Още за магнитните бури</h2>
      <div class="city-links">
        ${list.map(([url, text]) => `<a href="${url}" class="recent-place">${text}</a>`).join('\n        ')}
      </div>
    </section>`;
}

// ---- Today and tomorrow ----
function dayPage(data, index) {
  const which = index === 0 ? 'днес' : 'утре';
  const url = index === 0 ? '/magnitni-buri/dnes/' : '/magnitni-buri/utre/';
  const day = data.days[index];
  const [, name, g] = day ? level(day.kp) : [];
  const summary = day
    ? `${index === 0 ? 'Днес' : 'Утре'}, ${longDate(day.day)}, NOAA очаква ${day.kp >= 4.67 ? `<strong>магнитна буря</strong> – ${name.toLowerCase()}${g ? ` (${g})` : ''}` : name === 'Спокойно' ? 'спокойно магнитно поле, без магнитна буря' : 'повишена геомагнитна активност, но без магнитна буря'}. Най-високият Kp индекс ${index === 0 ? 'за деня' : 'утре'} е ${kpText(day.kp)}.`
    : `Прогнозата на NOAA за ${which} още не е публикувана.`;
  const slots = day && day.slots && day.slots.length ? `
    <section class="info-card">
      <h2>Kp индекс по часове ${which}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Часове (българско време)</th><th>Kp</th><th>Ниво</th></tr></thead>
        <tbody>
${day.slots.map(([from, to, kp]) => `          <tr><td>${from}–${to}</td><td>${kpText(kp)}</td><td>${level(kp)[1]}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Kp е за 3-часови интервали. Прогноза на NOAA SWPC от ${date(data.issued, { day: 'numeric', month: 'long', year: 'numeric' })} г.</p>
    </section>` : '';
  const next = data.days.slice(index + 1, index + 3);
  const ahead = next.length ? `
    <section class="info-card">
      <h2>${index === 0 ? 'Следващите дни' : 'След това'}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Ден</th><th>Най-висок Kp</th><th>Ниво</th></tr></thead>
        <tbody>
${next.map(d => `          <tr><td>${date(d.day, { weekday: 'long', day: 'numeric', month: 'long' })}</td><td>${kpText(d.kp)}</td><td>${level(d.kp)[1]}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
    </section>` : '';
  const title = `Магнитни бури ${which} – Kp индекс и прогноза по часове`;
  return page({
    ...ONLY_BG,
    url,
    title,
    description: `Има ли магнитна буря ${which}: най-високият Kp индекс, прогноза по 3-часови интервали по българско време и нивото на бурята по скалата на NOAA. Обновява се всяка сутрин.`,
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ['Магнитни бури', '/magnitni-buri/'], [`Магнитни бури ${which}`, url]]),
    body: `    <p class="breadcrumbs"><a href="/magnitni-buri/">Магнитни бури</a> › ${which}</p>
    <h1>Магнитни бури ${which}</h1>
    <section class="info-card">
      <p class="storm-intro">${summary}</p>
      <p>Магнитна буря има при Kp индекс 5 и повече (G1 по скалата на NOAA). При Kp 4 полето е неспокойно, но това още не е буря. Прогнозата идва от Центъра за космическо време на NOAA и се обновява тук всяка сутрин; моментната стойност е в полето по-долу.</p>
    </section>
${slots}${ahead}
${KP_WIDGET}
${links(url, data)}`
  });
}

// ---- A month ----
function monthPage(data, month) {
  const url = monthUrl(month + '-01');
  const name = monthTitle(month + '-01');
  const days = Object.entries(data.history).filter(([d]) => d.startsWith(month)).map(([day, kp]) => ({ day, kp, observed: true }));
  const known = new Set(days.map(d => d.day));
  // the 3-day forecast (every 3 hours) is better than the 27-day outlook for the days it covers
  data.days.filter(d => d.day.startsWith(month) && !known.has(d.day)).forEach(d => { days.push({ day: d.day, kp: d.kp }); known.add(d.day); });
  (data.outlook || []).filter(d => d.day.startsWith(month) && !known.has(d.day)).forEach(d => days.push({ day: d.day, kp: d.kp, ap: d.ap }));
  days.sort((a, b) => a.day.localeCompare(b.day));
  const storms = days.filter(d => Math.round(d.kp) >= 5);
  const past = days.filter(d => d.observed);
  const future = days.filter(d => !d.observed);
  const parts = [past.length && 'за изминалите дни – измереният най-висок Kp индекс по данни на NOAA', future.length && 'за предстоящите – прогнозата на NOAA'].filter(Boolean);
  const intro = `Магнитните бури през ${name} по дни: ${parts.join('; ')}. ${storms.length ? `Дните с магнитна буря (Kp 5 и повече) са ${storms.length}: ${storms.map(d => date(d.day, { day: 'numeric', month: 'long' })).join(', ')}.` : 'Засега няма дни с магнитна буря (Kp 5 и повече).'}`;
  return page({
    ...ONLY_BG,
    url,
    title: `Магнитни бури ${name} – прогноза по дни`,
    description: `Магнитни бури през ${name}: кои дни се очаква магнитна буря, Kp индекс по дни по данни и прогноза на NOAA. ${storms.length ? `Дни с буря: ${storms.length}.` : ''}`.trim(),
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ['Магнитни бури', '/magnitni-buri/'], [`Магнитни бури ${name}`, url]]),
    body: `    <p class="breadcrumbs"><a href="/magnitni-buri/">Магнитни бури</a> › ${name}</p>
    <h1>Магнитни бури през ${name}</h1>
    <p class="storm-intro">${intro}</p>

    <section class="info-card">
      <h2>Kp индекс по дни – ${name}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Дата</th><th>Ден</th><th>Kp</th><th>Ниво</th><th></th></tr></thead>
        <tbody>
${days.map(d => `          <tr${Math.round(d.kp) >= 5 ? ' class="weekend"' : ''}><td>${date(d.day, { day: 'numeric', month: 'long' })}</td><td>${date(d.day, { weekday: 'long' })}</td><td>${kpText(d.kp)}</td><td>${level(d.kp)[1]}</td><td>${d.observed ? 'измерено' : 'прогноза'}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Измерено: най-високият 3-часов Kp за деня (оценка на NOAA). Прогноза: 3-дневната и 27-дневната прогноза на NOAA SWPC от ${date(data.issued, { day: 'numeric', month: 'long', year: 'numeric' })} г. Прогнозата за повече от 3 дни напред се основава на въртенето на Слънцето (27 дни) и е ориентировъчна.</p>
    </section>
${KP_WIDGET}
${links(url, data)}`
  });
}

// ---- What the Kp index means ----
const KP_FAQ = [
  ['Какво е Kp индекс?', 'Kp индексът показва колко е смутено магнитното поле на Земята за 3-часов интервал, по скала от 0 до 9. Изчислява се от измервания на магнитометрични обсерватории по цялото земно кълбо; официалният индекс се публикува от изследователския център GFZ в Потсдам, а NOAA дава оценка в реално време и прогноза.'],
  ['При какъв Kp има магнитна буря?', 'Магнитна буря има при Kp 5 и повече. По скалата на NOAA Kp 5 е слаба буря (G1), Kp 6 – умерена (G2), Kp 7 – силна (G3), Kp 8 – много силна (G4), а Kp 9 – изключителна (G5).'],
  ['Колко често има магнитни бури?', 'По данни на NOAA за един 11-годишен слънчев цикъл има около 900 дни със слаба буря (G1), около 360 дни с умерена (G2), около 130 със силна (G3), около 60 с много силна (G4) и само около 4 дни с изключителна буря (G5). Най-много са близо до максимума на цикъла и в годините след него.'],
  ['При какъв Kp се вижда северно сияние в България?', 'България е на около 42–44° северна ширина и сиянието се вижда тук рядко – обикновено при Kp 8–9, ниско над северния хоризонт, далеч от светлините на градовете. Така беше например при изключителната буря на 10–11 май 2024 г.'],
  ['Каква е разликата между Kp и Ap?', 'Kp е логаритмичен индекс от 0 до 9 за всеки 3 часа. Ap е средното за денонощието в линейни единици (нанотесла): Ap под 8 е спокойно, около 30 е слаба буря, над 100 – силна. 27-дневната прогноза на NOAA дава и двата.']
];
function kpPage(data) {
  const url = '/magnitni-buri/kp-indeks/';
  const rows = [
    ['0–2', 'Спокойно', '–', 'Няма смущения.'],
    ['3', 'Слабо неспокойно', '–', 'Малки колебания, без последици.'],
    ['4', 'Повишена активност', '–', 'Сияние в Северна Скандинавия и Исландия.'],
    ['5', 'Слаба буря', 'G1', 'Слаби колебания в енергийните мрежи; сияние над Северна Европа.'],
    ['6', 'Умерена буря', 'G2', 'Възможни смущения в радиовръзките на големи ширини; сияние до Шотландия и Южна Скандинавия.'],
    ['7', 'Силна буря', 'G3', 'Неточности в GPS и прекъсвания на късовълновите радиовръзки; сияние до Германия и Полша.'],
    ['8', 'Много силна буря', 'G4', 'Проблеми в енергийните мрежи и спътниците; сияние понякога и в Южна Европа.'],
    ['9', 'Изключителна буря', 'G5', 'Възможни аварии в енергийни мрежи, прекъсване на GPS и радиовръзки; сияние може да се види и в България.']
  ];
  return page({
    ...ONLY_BG,
    url,
    title: 'Kp индекс – какво означава и при какъв Kp има магнитна буря',
    description: 'Какво е Kp индексът, скалата от 0 до 9 и нивата G1–G5 на NOAA, колко често има магнитни бури, разликата между Kp и Ap и при какъв Kp се вижда северно сияние в България.',
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ['Магнитни бури', '/magnitni-buri/'], ['Kp индекс', url]]) + faqJson(KP_FAQ),
    body: `    <p class="breadcrumbs"><a href="/magnitni-buri/">Магнитни бури</a> › Kp индекс</p>
    <h1>Kp индекс – какво означава</h1>
    <p class="storm-intro">Kp индексът е мярката, по която се съди дали има магнитна буря. Тук е обяснено какво показва, как се чете скалата от 0 до 9 и какво се случва при всяко ниво. Текущата стойност и прогнозата за 3 дни са на страница <a href="/magnitni-buri/">Магнитни бури</a>.</p>

    <section class="info-card">
      <h2>Скалата на Kp индекса</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Kp</th><th>Ниво</th><th>NOAA</th><th>Какво означава</th></tr></thead>
        <tbody>
${rows.map(r => `          <tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Нивата G1–G5 и последиците са по скалата за геомагнитни бури на NOAA SWPC. Kp се дава и в трети: 5− (4,67), 5 и 5+ (5,33).</p>
    </section>
${KP_FAQ.map(([q, a]) => `
    <section class="info-card">
      <h2>${q}</h2>
      <p>${a}</p>
    </section>`).join('')}
${links(url, data)}`
  });
}

// ---- Health ----
const HEALTH_FAQ = [
  ['Влияят ли магнитните бури на здравето?', 'Много хора казват, че по време на магнитни бури имат главоболие, по-лош сън, умора или промени в кръвното налягане. Някои изследвания намират слаба връзка между геомагнитната активност и например сърдечния ритъм, кръвното налягане или броя на сърдечните инциденти, но резултатите са противоречиви и механизмът не е доказан. За здрави хора не е установено, че магнитните бури вредят.'],
  ['Кои хора са по-чувствителни?', 'В изследванията, които намират връзка, тя е по-ясна при хора със сърдечносъдови заболявания, високо кръвно налягане или мигрена. Това не означава, че бурята е причината: по същото време често се сменя и времето – атмосферното налягане и температурата, а тяхното влияние върху главоболието и ставите е по-добре известно.'],
  ['Какво да правя при магнитна буря?', 'Не са нужни специални мерки. Спете достатъчно, пийте вода, избягвайте прекомерно натоварване и алкохол, ако се чувствате зле. Ако имате хронично заболяване, следвайте лечението, което ви е назначил лекарят – не променяйте лекарствата заради прогноза за буря. При болка в гърдите, задух, силно главоболие или внезапна слабост търсете спешна помощ, независимо дали има буря.'],
  ['Магнитната буря опасна ли е по друг начин?', 'Силните бури (G3 и повече) могат да предизвикат смущения в GPS, радиовръзките и енергийните мрежи и да увеличат радиацията на голяма надморска височина – това засяга най-вече спътниците, авиацията на полярни маршрути и астронавтите. На земната повърхност атмосферата и магнитното поле ни пазят.']
];
function healthPage(data) {
  const url = '/magnitni-buri/zdrave/';
  return page({
    ...ONLY_BG,
    url,
    title: 'Магнитни бури и здраве – какво е известно и какво да правим',
    description: 'Влияят ли магнитните бури на здравето: главоболие, сън, кръвно налягане. Какво казват изследванията, кои хора са по-чувствителни и какво да правим, без митове.',
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ['Магнитни бури', '/magnitni-buri/'], ['Магнитни бури и здраве', url]]) + faqJson(HEALTH_FAQ),
    body: `    <p class="breadcrumbs"><a href="/magnitni-buri/">Магнитни бури</a> › Здраве</p>
    <h1>Магнитни бури и здраве</h1>
    <p class="storm-intro">Какво се знае за влиянието на магнитните бури върху хората, без да го преувеличаваме. Тази страница не е медицински съвет: ако нещо ви притеснява, говорете с лекар.</p>
${HEALTH_FAQ.map(([q, a]) => `
    <section class="info-card">
      <h2>${q}</h2>
      <p>${a}</p>
    </section>`).join('')}
    <p class="city-actions"><a class="btn" href="/magnitni-buri/dnes/">Има ли магнитна буря днес →</a> <a class="btn" href="/magnitni-buri/kp-indeks/">Какво означава Kp индексът →</a></p>
${links(url, data)}`
  });
}

function build() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  data.history = data.history || {};
  write('magnitni-buri/dnes', dayPage(data, 0));
  write('magnitni-buri/utre', dayPage(data, 1));
  // the month of today, and the next one when the forecast reaches it
  const months = [...new Set([data.issued, ...(data.outlook || []).map(d => d.day), ...data.days.map(d => d.day)].map(d => d.slice(0, 7)))].sort();
  months.forEach(month => write(monthUrl(month + '-01').slice(1, -1), monthPage(data, month)));
  write('magnitni-buri/kp-indeks', kpPage(data));
  write('magnitni-buri/zdrave', healthPage(data));
  return { months, data };
}

module.exports = { build, monthUrl, monthTitle };
if (require.main === module) {
  const { months } = build();
  console.log(`Wrote /magnitni-buri/dnes/, /utre/, /kp-indeks/, /zdrave/ and ${months.length} month page(s).`);
}
