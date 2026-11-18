// The Bulgarian holiday pages (Bulgarian only; the translations of /praznici/ are written by build-pages.js):
//   /praznici/            the holidays and days off of this year, long weekends, working days by month,
//                         a link to next year (featured from December: a small script on the page)
//   /praznici/2027/       the same for 2027 (every year of holidays-BG.json except the current one: /praznici/<year>/)
//   /praznici/prazdnici-<year>.ics   the days off of the year for Google, Apple and Outlook calendars
// and the pages of addresses that have moved (GitHub Pages cannot answer 301: a page with the canonical
// address of the new one, a meta refresh and noindex):
//   /holliday_calendar/           -> /praznici/   (the calendar of other countries is /praznici/darzhavi/)
//   /praznici/pochivni-dni-<year>/ -> /praznici/<year>/ (the current year: /praznici/)
// The dates are the ones of the Labour Code (art. 154), from Nager.Date (holidays-BG.json, refreshed by
// build-pages.js). Days off that the Council of Ministers adds (bridge days worked off on a Saturday) are NOT
// invented: COUNCIL below says, per year, whether the decision is known.
// Run after build-pages.js: node .github/scripts/build-praznici.js, then build-forecast.js and build-sitemap.js.
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { page, write, VERSION, daysOff, FIXED } = require('./build-pages.js');
const PLACES = require('./places.js');
const { TXT } = require('./text-pages.js');

const ROOT = process.cwd();
const HOLIDAYS = JSON.parse(fs.readFileSync(path.join(__dirname, 'holidays-BG.json'), 'utf8'));
const esc = I18N.esc;
const YEARS = Object.keys(HOLIDAYS).map(Number).sort();
const NOW = new Date();
const CURRENT = Math.max(YEARS[0], Math.min(NOW.getFullYear(), YEARS[YEARS.length - 1] - 1));

// Days off added by decisions of the Council of Ministers (bridge days, worked off on a Saturday):
//   undefined: not mentioned; null: the decision is still awaited; { off: [...], work: [...] }: published (not supported yet)
const COUNCIL = { 2027: null };
const PENDING = 'Очаква се решение на Министерския съвет';

const WEEKDAY = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];
const WEEKDAY_SHORT = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const parse = iso => new Date(iso + 'T12:00:00Z');
const dm = iso => `${parse(iso).getUTCDate()} ${I18N.monthName('bg', parse(iso).getUTCMonth())}`;
const dmShort = iso => `${WEEKDAY_SHORT[parse(iso).getUTCDay()]}, ${dm(iso)}`;
const wd = iso => WEEKDAY[parse(iso).getUTCDay()];
const days = n => `${n} ${n === 1 ? 'ден' : 'дни'}`;
const cleanName = name => name.replace(/oсвобождението/g, 'освобождението').replace(/Oсманско/g, 'Османско');

// Orthodox Easter (Meeus, Julian calendar + 13 days for 1900-2099): checked against Nager.Date
function easter(year) {
  const a = year % 4, b = year % 7, c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31), day = ((d + e + 114) % 31) + 1;
  const date = new Date(Date.UTC(year, month - 1, day + 13, 12));
  return date.toISOString().slice(0, 10);
}

function yearData(year) {
  const list = daysOff(HOLIDAYS[year], year).map(h => ({ ...h, localName: cleanName(h.localName) }));
  const byDate = new Map();
  list.forEach(h => byDate.set(h.date, byDate.has(h.date) ? `${byDate.get(h.date)}; ${h.localName}` : h.localName));
  const iso = d => d.toISOString().slice(0, 10);
  const all = [];
  for (let d = new Date(Date.UTC(year, 0, 1, 12)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    const w = d.getUTCDay();
    all.push({ date: iso(d), month: d.getUTCMonth(), off: w === 0 || w === 6 || byDate.has(iso(d)), holiday: byDate.get(iso(d)) });
  }
  // runs of days off (weekends included); the long weekends are the runs of 3+ days that contain a holiday
  const runs = [];
  for (let i = 0; i < all.length;) {
    if (!all[i].off) { i++; continue; }
    let j = i;
    while (j + 1 < all.length && all[j + 1].off) j++;
    runs.push(all.slice(i, j + 1));
    i = j + 1;
  }
  const runLength = new Map();
  runs.forEach(run => run.forEach(day => runLength.set(day.date, run.length)));
  const long = runs.filter(run => run.length >= 3 && run.some(day => day.holiday));
  const total = all.filter(day => day.off).length;
  const months = Array.from({ length: 12 }, (_, m) => {
    const inMonth = all.filter(day => day.month === m);
    return { m, work: inMonth.filter(day => !day.off).length, off: inMonth.filter(day => day.off).length };
  });
  const easterSunday = list.find(h => h.name === 'Easter Sunday');
  if (!easterSunday || easterSunday.date !== easter(year)) throw new Error(`Easter ${year}: Nager.Date says ${easterSunday && easterSunday.date}, computed ${easter(year)}`);
  return { year, list, all, runs, runLength, long, total, work: all.length - total, months, easter: easterSunday.date };
}

// Where to go on a long weekend, by season: [[label, url], ...] of pages that exist
const SEASON = month => (month >= 5 && month <= 8 ? 'summer' : month === 3 || month === 4 || month === 9 ? 'spring' : 'winter');  // 0-based
const GO = {
  winter: {
    text: 'Със сняг по пистите:',
    links: [['Банско', '/vremeto/bansko/'], ['Боровец', '/vremeto/borovets/'], ['Пампорово', '/vremeto/pamporovo/'], ['Чепеларе', '/vremeto/chepelare/'], ['Сняг по всички курорти →', '/vremeto/snyag-kurorti/']],
    weather: ['/vremeto/bansko/', '/vremeto/borovets/', '/vremeto/pamporovo/']
  },
  spring: {
    text: 'На море и в Гърция:',
    links: [['Созопол', '/vremeto/sozopol/'], ['Несебър', '/vremeto/nesebar/'], ['Тасос', '/europe/greece/thassos/'], ['Кавала', '/europe/greece/kavala/'], ['Халкидики', '/europe/greece/halkidiki/'], ['Времето по Черноморието →', '/vremeto/chernomorie/']],
    weather: ['/vremeto/sozopol/', '/europe/greece/thassos/', '/europe/greece/kavala/']
  },
  summer: {
    text: 'На море и в Гърция:',
    links: [['Слънчев бряг', '/vremeto/slanchev-bryag/'], ['Златни пясъци', '/vremeto/zlatni-pyasatsi/'], ['Созопол', '/vremeto/sozopol/'], ['Тасос', '/europe/greece/thassos/'], ['Халкидики', '/europe/greece/halkidiki/'], ['Температура на морската вода →', '/vremeto/morska-voda/']],
    weather: ['/vremeto/slanchev-bryag/', '/vremeto/sozopol/', '/europe/greece/thassos/']
  }
};
const BIG = ['/vremeto/sofia/', '/vremeto/plovdiv/', '/vremeto/varna/', '/vremeto/burgas/'];
const byUrl = Object.fromEntries(PLACES.PLACES.map(place => [place.url, place]));
const place = url => {
  if (!byUrl[url]) throw new Error(`build-praznici.js: no page ${url}`);
  if (!fs.existsSync(path.join(ROOT, url, 'index.html'))) throw new Error(`build-praznici.js: ${url} does not exist`);
  return byUrl[url];
};
// every link and every place of the lists must be a page that exists
Object.values(GO).forEach(g => {
  g.links.forEach(([, url]) => { if (!fs.existsSync(path.join(ROOT, url, 'index.html'))) throw new Error(`build-praznici.js: no page ${url}`); });
  g.weather.forEach(place);
});
BIG.forEach(place);
const placeJson = urls => JSON.stringify(urls.map(url => ({ name: byUrl[url].name.bg, lat: byUrl[url].lat, lon: byUrl[url].lon, url })));

function breadcrumbs(items) {
  return `  <script type="application/ld+json">
  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${url}` })) })}
  </script>
`;
}

// Questions and answers (the same text is in the page and in the FAQPage data)
function faq(data) {
  const { year, list, long, total, work } = data;
  const dates = [...new Set(list.map(h => h.date))];
  // the dates of the holidays, shortened: "30 април – 3 май"
  const spans = [];
  dates.forEach(date => {
    const last = spans[spans.length - 1];
    if (last && parse(date) - parse(last.to) === 86400000) last.to = date; else spans.push({ from: date, to: date });
  });
  const span = s => (s.from === s.to ? dm(s.from) : `${dm(s.from)} – ${dm(s.to)}`);
  const q = [];
  q.push([`Кои са почивните дни през ${year} г.?`,
    `По Кодекса на труда през ${year} г. официалните почивни дни са: ${spans.map(span).join('; ')}. С всички съботи и недели неработните дни са ${total}, а работните ${work}.`
    + (COUNCIL[year] === null ? ` Допълнителни почивни дни (мостове) ще има само ако ги обяви Министерският съвет: ${PENDING.toLowerCase()}.` : '')]);
  const e = list.find(h => h.name === 'Easter Sunday');
  const good = list.find(h => h.name === 'Good Friday');
  const monday = list.find(h => h.name === 'Easter Monday');
  q.push([`Кога е Великден ${year}?`,
    `Православният Великден през ${year} г. е на ${dm(e.date)} (${wd(e.date)}). Почивните дни са от Разпети петък (${dm(good.date)}) до Велики понеделник (${dm(monday.date)}), а Разпети петък, Велика събота, Великден и Велики понеделник са официални празници по Кодекса на труда.`]);
  q.push([`Колко дълги уикенда има през ${year} г.?`,
    long.length
      ? `През ${year} г. има ${long.length} ${long.length === 1 ? 'дълъг уикенд' : 'дълги уикенда'} (3 или повече почивни дни подред): ${long.map(run => `${span({ from: run[0].date, to: run[run.length - 1].date })} (${days(run.length)})`).join('; ')}.`
      : `През ${year} г. няма периоди от 3 или повече почивни дни подред.`]);
  q.push([`Има ли мостове и отработване през ${year} г.?`,
    COUNCIL[year] === null
      ? `${PENDING}. Мостовете и отработването на почивните дни се определят с негово решение. Датите на тази страница са само по Кодекса на труда и ще бъдат допълнени, когато решението бъде публикувано.`
      : 'Допълнителни почивни дни, които се отработват в събота, се определят с решение на Министерския съвет. Датите на тази страница са по Кодекса на труда, без такива мостове.']);
  return q;
}

function dataFor(year) { return yearData(year); }

const STYLE = `  <style>
    .long-weekend h3 { margin: 0 0 6px; }
    .long-weekend .city-links { margin: 6px 0 10px; }
    .holiday-forecast { margin-top: 10px; }
    .holiday-forecast table { font-size: 0.9em; }
    .holiday-forecast td, .holiday-forecast th { text-align: center; white-space: nowrap; }
    .holiday-forecast td:first-child, .holiday-forecast th:first-child { text-align: left; }
    .holiday-forecast .hf-min { opacity: 0.7; }
    .holiday-forecast .hf-rain { display: block; font-size: 0.8em; opacity: 0.7; }
    .holiday-pending { border-left: 4px solid var(--gold, #ffd700); }
    .next-year-featured { border: 1px solid var(--gold, #ffd700); }
    .holiday-faq h3 { margin: 14px 0 4px; }
  </style>
`;

function yearBody(data, years, main) {
  const { year, list, long, total, work, months, runLength } = data;
  const other = years.filter(y => y !== year);
  const T = TXT.bg;
  const rows = list.map(h => {
    const nominal = FIXED[h.name] && `${year}-${FIXED[h.name]}`;
    const moved = nominal && nominal !== h.date
      ? ` <span class="holiday-note">${T.holidaysMoved(dm(nominal), wd(nominal))}</span>` : '';
    const weekday = parse(h.date).getUTCDay();
    return `          <tr${weekday === 0 || weekday === 6 ? ' class="weekend"' : ''}><td>${dm(h.date)}</td><td>${wd(h.date)}</td><td>${esc(h.localName)}${h.name === 'Second day of Christmas' ? ' (втори ден)' : ''}${moved}</td><td>${days(runLength.get(h.date))}</td></tr>`;
  }).join('\n');

  const longBlocks = long.map(run => {
    const from = run[0].date, to = run[run.length - 1].date;
    const season = SEASON(parse(from).getUTCMonth());
    const go = GO[season];
    const reasons = [...new Set(run.filter(day => day.holiday).flatMap(day => day.holiday.split('; ')))].join('; ');
    const weather = [...BIG, ...go.weather];
    return `
    <article class="info-card long-weekend" id="uikend-${from}" data-holiday-weather data-from="${from}" data-to="${to}" data-places="${esc(placeJson(weather))}">
      <h3>${dm(from)} – ${dm(to)} <span class="storm-updated">· ${days(run.length)} почивка</span></h3>
      <p>${dmShort(from)} – ${dmShort(to)}. Повод: ${esc(reasons)}.</p>
      <p><strong>Къде да отидете.</strong> ${go.text}</p>
      <div class="city-links">
        ${go.links.map(([name, url]) => `<a href="${url}" class="recent-place">${esc(name)}</a>`).join('\n        ')}
      </div>
      <div class="holiday-forecast" hidden></div>
    </article>`;
  }).join('\n');

  const holidayDates = [...new Set(list.map(h => h.date))].map(date => ({ date, name: list.filter(h => h.date === date).map(h => h.localName)[0] }));
  const questions = faq(data);
  return {
    html: `
${COUNCIL[year] === null ? `    <section class="info-card holiday-pending">
      <p><strong>${PENDING}.</strong> Министерският съвет определя с решение допълнителните почивни дни (мостове), които се отработват в събота. За ${year} г. такова решение още не е публикувано, затова по-долу са само дните по Кодекса на труда (чл. 154), без мостове и без отработване. Страницата ще бъде допълнена след решението.</p>
    </section>
` : ''}
    <section class="info-card holiday-upcoming" id="upcoming" data-holiday-next data-holidays="${esc(JSON.stringify(holidayDates))}" data-places="${esc(placeJson(BIG))}" hidden>
      <h2>Времето за най-близкия празник</h2>
      <div class="holiday-forecast"></div>
    </section>

    <section class="info-card" id="y${year}">
      <h2>Официални празници и почивни дни през ${year} г.</h2>
      <div class="table-scroll">
      <table class="kp-table holiday-table">
        <thead><tr><th>Дата</th><th>Ден</th><th>Празник</th><th>Почивни дни подред</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">„Почивни дни подред“ са последователните почивни дни, в които влиза празникът, със съботите и неделите около него. Когато официален празник (освен Великден) е в събота или неделя, почивният ден е първият следващ работен ден (чл. 154 от Кодекса на труда).</p>
    </section>

    <section class="info-card" id="dalgi-uikendi">
      <h2>Дълги уикенди ${year}</h2>
${long.length ? `      <p>${long.length === 1 ? 'Един период' : `${long.length} периода`} от 3 или повече почивни дни подред. При всеки – къде да отидете${year === NOW.getFullYear() || year === NOW.getFullYear() + 1 ? ' и прогноза за времето, когато уикендът е в рамките на прогнозата за следващите дни' : ''}.</p>` : `      <p>През ${year} г. няма периоди от 3 или повече почивни дни подред.</p>`}
    </section>
${longBlocks}

    <section class="info-card" id="rabotni-dni">
      <h2>Колко работни дни има всеки месец през ${year} г.</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Месец</th><th>Работни дни</th><th>Почивни дни</th></tr></thead>
        <tbody>
${months.map(({ m, work: w, off }) => `          <tr><td>${I18N.monthName('bg', m)}</td><td>${w}</td><td>${off}</td></tr>`).join('\n')}
          <tr><td><strong>Общо</strong></td><td><strong>${work}</strong></td><td><strong>${total}</strong></td></tr>
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Почивни дни са съботите, неделите и официалните празници${COUNCIL[year] === null ? ' (без мостове – ' + PENDING.toLowerCase() + ')' : ''}.</p>
    </section>

    <section class="info-card holiday-faq" id="vaprosi">
      <h2>Често задавани въпроси</h2>
${questions.map(([qq, a]) => `      <h3>${esc(qq)}</h3>\n      <p>${esc(a)}</p>`).join('\n')}
    </section>

    <p class="storm-updated">Източник на празниците: <a href="https://date.nager.at/" target="_blank" rel="noopener">Nager.Date</a>, проверено на ${NOW.getDate()}.${String(NOW.getMonth() + 1).padStart(2, '0')}.${NOW.getFullYear()}.</p>`,
    questions,
    other
  };
}

function yearPage(data, years) {
  const { year, long } = data;
  const main = year === CURRENT;
  const url = main ? '/praznici/' : `/praznici/${year}/`;
  const body = yearBody(data, years, main);
  const nextYear = years.find(y => y > year);
  const next = nextYear && yearData(nextYear);
  const title = `Официални празници и почивни дни ${year} в България | WeatherPulse`;
  const description = main
    ? `Официални празници и почивни дни ${year} в България: дата и ден от седмицата, дълги уикенди, работни дни по месеци и къде да отидете.`
    : `Почивни дни ${year} в България: официални празници, дълги уикенди (${long.length} периода), работни дни по месеци и къде да отидете с прогнозата за времето.`;
  if (description.length > 155) throw new Error(`description of ${url} has ${description.length} characters`);
  const links = `    <p class="city-actions">${years.map(y => `<a class="btn" href="${y === CURRENT ? '/praznici/' : `/praznici/${y}/`}"${y === year ? ' aria-current="page"' : ''}>Почивни дни ${y}</a>`).join(' ')} <a class="btn" href="/praznici/prazdnici-${year}.ics" download>Добави в календара (.ics)</a> <a class="btn" href="/praznici/darzhavi/">Празници в други държави →</a></p>`;
  const teaser = next ? `
    <section class="info-card" id="nextYear">
      <h2><a href="/praznici/${nextYear}/">Почивни дни ${nextYear} →</a></h2>
      <p>Великден ${nextYear}: ${dm(next.easter)}. ${next.long.length} ${next.long.length === 1 ? 'дълъг уикенд' : 'дълги уикенда'}: ${next.long.map(run => `${dm(run[0].date)} – ${dm(run[run.length - 1].date)} (${days(run.length)})`).join('; ')}. ${next.total} почивни и ${next.work} работни дни.${COUNCIL[nextYear] === null ? ` ${PENDING}.` : ''}</p>
    </section>` : '';
  const featured = next ? `
    <script>
      // From December the next year comes first: its card moves up under the introduction
      (function () {
        var now = new Date();
        if (now.getFullYear() > ${year} || now.getMonth() === 11) {
          var card = document.getElementById('nextYear'), intro = document.querySelector('.storm-intro');
          if (card && intro) { card.classList.add('next-year-featured'); intro.parentNode.insertBefore(card, intro.nextSibling); }
        }
      })();
    </script>` : '';
  const intro = `През ${year} г. в България има ${data.total} неработни дни (съботи, недели и официални празници) и ${data.work} работни дни. Списъкът е по Кодекса на труда${next ? `. Вижте и <a href="/praznici/${nextYear}/">почивните дни ${nextYear}</a>` : ''}.`;
  return page({
    ...(main ? { lang: 'bg', multi: true } : { lang: 'bg', multi: true, langs: ['bg'] }),
    url,
    title,
    description,
    head: STYLE,
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ...(main ? [[`Официални празници ${year}`, '/praznici/']] : [['Официални празници', '/praznici/'], [`Почивни дни ${year}`, url]])])
      + `  <script type="application/ld+json">
  ${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'bg', mainEntity: body.questions.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}
  </script>
`,
    body: `${main ? '' : `    <p class="breadcrumbs"><a href="/praznici/">Официални празници</a> › Почивни дни ${year}</p>\n`}    <h1>Официални празници и почивни дни в България през ${year} г.</h1>
    <p class="storm-intro">${intro}</p>
${links}
${body.html}
${teaser}
${featured}`,
    scripts: `<script src="/js/forecast-core.js?v=6" defer></script>
<script src="/js/holiday-weather.js?v=1" defer></script>\n`
  });
}

// the days off of a year as an iCalendar file (all-day events)
function ics(data) {
  const ymd = iso => iso.replace(/-/g, '');
  const next = iso => { const d = parse(iso); d.setUTCDate(d.getUTCDate() + 1); return ymd(d.toISOString().slice(0, 10)); };
  const stamp = `${data.year - 1}1201T000000Z`;  // fixed: the file changes only when the days off change
  const events = data.list.map((h, i) => `BEGIN:VEVENT
UID:${data.year}-${i + 1}-${h.date}@weatherpulse.eu
DTSTAMP:${stamp}
DTSTART;VALUE=DATE:${ymd(h.date)}
DTEND;VALUE=DATE:${next(h.date)}
SUMMARY:${h.localName.replace(/[,;]/g, ' ·')}
TRANSP:TRANSPARENT
END:VEVENT`);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//Weather Pulse//Official holidays ${data.year}//BG`, 'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:Официални празници ${data.year} (България)`, 'X-WR-TIMEZONE:Europe/Sofia', ...events.flatMap(e => e.split('\n')), 'END:VCALENDAR'];
  return lines.join('\r\n') + '\r\n';
}

// A moved address: canonical to the new one, a meta refresh, noindex and a visible link
function moved(dir, to, extra = '') {
  const target = `https://weatherpulse.eu${to}`;
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
  fs.writeFileSync(path.join(ROOT, dir, 'index.html'), `<!DOCTYPE html>
<html lang="bg">
<head>
  <!-- Generated by .github/scripts/build-praznici.js: this address has moved -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Страницата е преместена | Weather Pulse</title>
  <link rel="canonical" href="${target}">
  <meta http-equiv="refresh" content="0; url=${target}">
  <meta name="robots" content="noindex">
${extra}  <script>location.replace(${JSON.stringify(to)} + location.search + location.hash);</script>
</head>
<body>
  <p><a href="${target}">Страницата е преместена</a></p>
</body>
</html>
`);
}

const years = YEARS.slice(YEARS.indexOf(CURRENT));
const datas = Object.fromEntries(years.map(y => [y, dataFor(y)]));
years.forEach(year => {
  write(year === CURRENT ? 'praznici' : `praznici/${year}`, yearPage(datas[year], years));
  fs.writeFileSync(path.join(ROOT, 'praznici', `prazdnici-${year}.ics`), ics(datas[year]));
});
// the old addresses
YEARS.forEach(year => moved(`praznici/pochivni-dni-${year}`, year === CURRENT ? '/praznici/' : `/praznici/${year}/`));
// /holliday_calendar/: a visitor who chose another language goes to the translation of the tool, as before
moved('holliday_calendar', '/praznici/', `  <script>
    try {
      var wanted = localStorage.getItem('selectedLanguage');
      if (['en', 'de', 'it', 'es', 'fr', 'nl'].indexOf(wanted) >= 0) location.replace(({ fr: '/fr/calendrier-jours-feries/', nl: '/nl/feestdagenkalender/' }[wanted] || '/' + wanted + '/holliday_calendar/') + location.search + location.hash);
    } catch (e) { /* storage blocked */ }
  </script>
`);
console.log(`Wrote /praznici/ (${CURRENT}), ${years.slice(1).map(y => `/praznici/${y}/`).join(', ')}, the calendar files and the pages of the old addresses.`);
