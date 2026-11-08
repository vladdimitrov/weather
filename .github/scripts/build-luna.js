// Generates the Moon calendar pages in the five languages (Bulgarian at /luna/, the others
// at /en/luna/, /de/luna/, /it/luna/, /es/luna/):
//   /luna/                   the Moon today + links to the years and months
//   /luna/<year>/            all phases of the year, month by month
//   /luna/<year>/<month>/    every day of the month with phase and illuminated part
// Phase times come from /js/moon.js (Meeus, no API; checked against the USNO by
// test-moon.js). Times are Sofia time. The dates and phases are written into the
// HTML; only the "today" block is refreshed in the browser (/js/luna-today.js).
// Texts: text-luna.js. Run from the repository root:
//   node .github/scripts/build-luna.js [first year] [--sitemap]
// Builds the first year and the one after it (default: this year and next year).
const fs = require('fs');
const path = require('path');
const Moon = require('../../js/moon.js');
const I18N = require('./i18n.js');
const { LUNA } = require('./text-luna.js');
const { page, write, VERSION } = require('./build-pages.js');

const ROOT = process.cwd();
const ZONE = 'Europe/Sofia';
const SLUGS = ['yanuari', 'fevruari', 'mart', 'april', 'may', 'yuni', 'yuli', 'avgust', 'septemvri', 'oktomvri', 'noemvri', 'dekemvri'];
const ICONS = Moon.ICONS;
const SCRIPTS = `<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/luna-today.js?v=${VERSION.lunaToday}" defer></script>\n`;
const L = (lang, url) => I18N.localUrl(lang, url);

// --- Sofia time -------------------------------------------------------------
const partsOf = (date, options) => Object.fromEntries(
  new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hourCycle: 'h23', ...options }).formatToParts(date).map(p => [p.type, p.value]));
const sofia = date => {
  const p = partsOf(date, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  return { year: +p.year, month: +p.month - 1, day: +p.day, hour: +p.hour, minute: +p.minute };
};
const dayKey = date => { const s = sofia(date); return `${s.year}-${s.month}-${s.day}`; };
const hhmm = date => { const s = sofia(date); return `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`; };
const weekdayIndex = (year, month, day) => new Date(Date.UTC(year, month, day, 12)).getUTCDay();

// Instant of 12:00 Sofia time on a date (the offset is 2 or 3 hours)
function noon(year, month, day) {
  for (const offset of [2, 3]) {
    const date = new Date(Date.UTC(year, month, day, 12 - offset));
    if (sofia(date).hour === 12) return date;
  }
  return new Date(Date.UTC(year, month, day, 10));
}

const daysIn = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

// All phases of a year as Sofia dates
function yearEvents(year) {
  const from = new Date(Date.UTC(year - 1, 11, 25));
  const to = new Date(Date.UTC(year + 1, 0, 5));
  return Moon.phaseEvents(from, to).filter(event => sofia(event.time).year === year);
}

// The icon / name of a day: an exact phase that day wins, otherwise by the Moon at noon
function dayPhase(year, month, day, events) {
  const exact = events.find(event => dayKey(event.time) === `${year}-${month}-${day}`);
  const state = Moon.state(noon(year, month, day));
  if (exact) return { index: exact.type * 2, state, exact };
  let index = state.index;
  if (index % 2 === 0) index = (index + (state.angle > index * 45 ? 1 : 7)) % 8;
  return { index, state, exact: null };
}

// --- Formatting in a language -------------------------------------------------
const dateFormat = (lang, options) => new Intl.DateTimeFormat(I18N.LOCALE[lang], { timeZone: 'UTC', ...options });
const atNoon = (year, month, day) => new Date(Date.UTC(year, month, day, 12));
const dayMonth = (lang, year, month, day) => dateFormat(lang, { day: 'numeric', month: 'long' }).format(atNoon(year, month, day));
const weekdayOf = (lang, year, month, day) => dateFormat(lang, { weekday: 'long' }).format(atNoon(year, month, day));
const fullDate = (lang, date, withYear) => {
  const s = sofia(date);
  return dateFormat(lang, withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }).format(atNoon(s.year, s.month, s.day));
};
const monthShort = (lang, year, month) => dateFormat(lang, { month: 'short' }).format(atNoon(year, month, 15));
const monthName = (lang, month) => I18N.monthName(lang, month);
const esc = I18N.esc;

function breadcrumbsJson(lang, items) {
  return `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${L(lang, url)}` }))
  }, null, 2).replace(/\n/g, '\n  ')}
  </script>
`;
}

const monthUrl = (year, month) => `/luna/${year}/${SLUGS[month]}/`;
const monthLinks = (lang, year, current) => Array.from({ length: 12 }, (_, month) =>
  `<a href="${L(lang, monthUrl(year, month))}" class="recent-place"${month === current ? ' aria-current="page"' : ''}>${monthName(lang, month)}</a>`).join('\n        ');

// Second full moon in a calendar month ("blue moon")
function blueMoons(events) {
  const seen = {};
  const result = [];
  events.filter(event => event.type === 2).forEach(event => {
    const key = sofia(event.time).month;
    if (seen[key]) result.push(event);
    seen[key] = true;
  });
  return result;
}

// --- The block "the Moon today" (same markup as /js/luna-today.js writes) -------
function todayBlock(lang, now) {
  const T = LUNA[lang];
  const state = Moon.state(now);
  const full = Moon.nextPhase(now, 2);
  const fresh = Moon.nextPhase(now, 0);
  const when = date => `<strong>${fullDate(lang, date, true)}</strong>, ${hhmm(date)}`;
  return `<section class="info-card moon-today" id="moonToday" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <div class="moon-today-icon" style="font-size:4rem;line-height:1">${ICONS[state.index]}</div>
      <div>
        <h2 style="margin:0">${Moon.NAMES[lang][state.index]}</h2>
        <p>${Math.round(state.fraction * 100)}% ${T.lit} · ${state.waxing ? T.waxing : T.waning}</p>
        <p>${T.nextFull}: ${when(full)}<br>${T.nextNew}: ${when(fresh)}</p>
      </div>
    </section>`;
}

const moreLinks = (lang, items) => `
    <section class="info-card">
      <h2>${LUNA[lang].more}</h2>
      <div class="city-links">
        ${items.join('\n        ')}
      </div>
    </section>`;

// --- Pages --------------------------------------------------------------------
function monthPage(lang, year, month, years) {
  const T = LUNA[lang];
  const names = Moon.NAMES[lang];
  const events = yearEvents(year).filter(event => sofia(event.time).month === month);
  const allEvents = yearEvents(year);
  const name = monthName(lang, month);
  const byType = type => events.filter(event => event.type === type);
  const phrase = type => T.on(byType(type).map(event => T.when(fullDate(lang, event.time), hhmm(event.time))).join(T.joiner));
  const dates = type => T.on(byType(type).map(event => fullDate(lang, event.time)).join(T.joiner));
  const full = byType(2).length ? phrase(2) : '';
  const fresh = byType(0).length ? phrase(0) : '';
  const url = monthUrl(year, month);
  const prev = month === 0 ? (years.includes(year - 1) ? [year - 1, 11] : null) : [year, month - 1];
  const next = month === 11 ? (years.includes(year + 1) ? [year + 1, 0] : null) : [year, month + 1];
  const blue = blueMoons(allEvents).filter(event => sofia(event.time).month === month);

  const phaseRows = events.map(event => {
    const s = sofia(event.time);
    return `          <tr><td>${ICONS[event.type * 2]} ${names[event.type * 2]}</td><td>${dayMonth(lang, s.year, s.month, s.day)}</td><td>${weekdayOf(lang, s.year, s.month, s.day)}</td><td>${T.clock(hhmm(event.time))}</td></tr>`;
  }).join('\n');

  const dayRows = Array.from({ length: daysIn(year, month) }, (_, i) => {
    const day = i + 1;
    const { index, state, exact } = dayPhase(year, month, day, allEvents);
    const weekday = weekdayIndex(year, month, day);
    const weekend = weekday === 0 || weekday === 6 ? ' class="weekend"' : '';
    const note = exact ? ` <span class="holiday-note">${T.when('', hhmm(exact.time)).trim()}</span>` : '';
    return `          <tr${weekend}><td>${dayMonth(lang, year, month, day)}</td><td>${weekdayOf(lang, year, month, day)}</td><td>${ICONS[index]} ${names[index]}${note}</td><td>${Math.round(state.fraction * 100)}%</td></tr>`;
  }).join('\n');

  const calUrl = L(lang, '/luna/');
  return page({
    url,
    lang,
    multi: true,
    title: esc(T.monthTitle(name, year)),
    description: esc(T.monthDescription({ name, year, full, fresh, fullDates: dates(2), freshDates: dates(0) })),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.cal, '/luna/'], [`${T.cal} ${year}`, `/luna/${year}/`], [`${name} ${year}`, url]]),
    body: `    <p class="breadcrumbs"><a href="${calUrl}">${T.cal}</a> › <a href="${L(lang, `/luna/${year}/`)}">${year}</a> › ${name}</p>
    <h1>${T.monthH1(name, year)}</h1>
    <p class="storm-intro">${T.monthIntro({ name, year, full, fresh, blue: blue.length > 0 })}</p>

    <section class="info-card">
      <h2>${T.phasesH(name, year)}</h2>
      <div class="table-scroll">
      <table class="kp-table holiday-table">
        <thead><tr>${T.phasesHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${phaseRows}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card">
      <h2>${T.daysH(name, year)}</h2>
      <div class="table-scroll">
      <table class="kp-table holiday-table">
        <thead><tr>${T.daysHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${dayRows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${T.daysNote}</p>
    </section>

    <p class="city-actions">
      ${prev ? `<a class="btn" href="${L(lang, monthUrl(...prev))}">← ${monthName(lang, prev[1])} ${prev[0]}</a>` : ''}
      ${next ? `<a class="btn" href="${L(lang, monthUrl(...next))}">${monthName(lang, next[1])} ${next[0]} →</a>` : ''}
      <a class="btn" href="${L(lang, `/luna/${year}/`)}">${T.wholeYear(year)}</a>
    </p>

    <section class="info-card">
      <h2>${T.otherMonths(year)}</h2>
      <div class="city-links">
        ${monthLinks(lang, year, month)}
      </div>
    </section>
${moreLinks(lang, [
    `<a href="${calUrl}" class="recent-place">${T.today}</a>`,
    `<a href="${L(lang, '/vremeto/')}" class="recent-place">${T.weather}</a>`,
    `<a href="/magnitni-buri/" class="recent-place">${T.storms}</a>`,
    `<a href="${L(lang, '/nebeto/')}" class="recent-place">${T.sky}</a>`
  ])}`
  });
}

function yearPage(lang, year, years) {
  const T = LUNA[lang];
  const names = Moon.NAMES[lang];
  const events = yearEvents(year);
  const url = `/luna/${year}/`;
  const fullMoons = events.filter(event => event.type === 2);
  const blue = blueMoons(events);
  const rows = Array.from({ length: 12 }, (_, month) => {
    const cell = type => {
      const list = events.filter(event => event.type === type && sofia(event.time).month === month);
      return list.map(event => `${sofia(event.time).day} ${monthShort(lang, year, month)}, ${hhmm(event.time)}`).join('<br>') || '–';
    };
    return `          <tr><td><a href="${L(lang, monthUrl(year, month))}">${monthName(lang, month)}</a></td><td>${cell(0)}</td><td>${cell(1)}</td><td>${cell(2)}</td><td>${cell(3)}</td></tr>`;
  }).join('\n');
  return page({
    url,
    lang,
    multi: true,
    title: esc(T.yearTitle(year)),
    description: esc(T.yearDescription(year, fullMoons.length)),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.cal, '/luna/'], [`${T.cal} ${year}`, url]]),
    body: `    <p class="breadcrumbs"><a href="${L(lang, '/luna/')}">${T.cal}</a> › ${year}</p>
    <h1>${T.yearH1(year)}</h1>
    <p class="storm-intro">${T.yearIntro({ year, n: fullMoons.length, blue: blue.length ? fullDate(lang, blue[0].time) : '', first: fullDate(lang, fullMoons[0].time), last: fullDate(lang, fullMoons[fullMoons.length - 1].time) })}</p>

    <section class="info-card">
      <h2>${T.yearH2(year)}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>${T.month}</th><th>${names[0]}</th><th>${names[2]}</th><th>${names[4]}</th><th>${names[6]}</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${T.yearNote}</p>
    </section>

    <p class="city-actions">
      ${years.filter(y => y !== year).map(y => `<a class="btn" href="${L(lang, `/luna/${y}/`)}">${T.cal} ${y}</a>`).join('\n      ')}
      <a class="btn" href="${L(lang, '/luna/')}">${T.today} →</a>
    </p>`
  });
}

function hubPage(lang, years, now) {
  const T = LUNA[lang];
  const month = sofia(now).month;
  const thisYear = sofia(now).year;
  const current = years.includes(thisYear) ? monthUrl(thisYear, month) : monthUrl(years[0], 0);
  return page({
    url: '/luna/',
    lang,
    multi: true,
    title: T.hubTitle,
    description: esc(T.hubDescription(years.join(T.joiner))),
    jsonLd: breadcrumbsJson(lang, [['Weather Pulse', '/'], [T.cal, '/luna/']]),
    body: `    <h1>${T.hubH1}</h1>
    <p class="storm-intro">${T.hubIntro}</p>

    ${todayBlock(lang, now)}

    <p class="city-actions"><a class="btn" href="${L(lang, current)}">${T.thisMonth}</a>${years.map(year => ` <a class="btn" href="${L(lang, `/luna/${year}/`)}">${T.cal} ${year}</a>`).join('')}</p>
${years.map(year => `
    <section class="info-card">
      <h2>${T.hubYearH(year)}</h2>
      <div class="city-links">
        ${monthLinks(lang, year, -1)}
      </div>
    </section>`).join('\n')}
${moreLinks(lang, [
    `<a href="${L(lang, '/vremeto/')}" class="recent-place">${T.weather}</a>`,
    `<a href="/magnitni-buri/" class="recent-place">${T.storms}</a>`,
    `<a href="${L(lang, '/nebeto/')}" class="recent-place">${T.sky}</a>`,
    `<a href="${L(lang, '/praznici/')}" class="recent-place">${T.holidays}</a>`
  ])}`,
    scripts: SCRIPTS
  });
}

// --- Run ----------------------------------------------------------------------
const firstYear = Number(process.argv.find(arg => /^\d{4}$/.test(arg))) || sofia(new Date()).year;
const years = [firstYear, firstYear + 1];
const now = new Date();
const dir = (lang, url) => L(lang, url).slice(1);

I18N.LANGS.forEach(lang => {
  write(dir(lang, '/luna/'), hubPage(lang, years, now));
  years.forEach(year => {
    write(dir(lang, `/luna/${year}/`), yearPage(lang, year, years));
    for (let month = 0; month < 12; month++) write(dir(lang, monthUrl(year, month)), monthPage(lang, year, month, years));
  });
});
console.log(`Wrote /luna/, ${years.length} year pages and ${years.length * 12} month pages (${years.join(', ')}) in ${I18N.LANGS.length} languages.`);

if (process.argv.includes('--sitemap')) {
  const today = now.toISOString().slice(0, 10);
  const urls = I18N.LANGS.flatMap(lang => ['/luna/', ...years.flatMap(year => [`/luna/${year}/`, ...Array.from({ length: 12 }, (_, month) => monthUrl(year, month))])].map(url => L(lang, url)));
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
  const missing = urls.filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
  const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, `    <priority>${/^(\/(en|de|it|es))?\/luna\/$/.test(url) ? '0.7' : '0.6'}</priority>`, '  </url>', ''].join(nl)).join(nl);
  sitemap = sitemap.replace('</urlset>', entries + '</urlset>');
  fs.writeFileSync(file, sitemap);
  console.log(`Added ${missing.length} URLs to sitemap.xml.`);
}
