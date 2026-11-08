// Generates the Moon calendar pages (Bulgarian):
//   /luna/                   the Moon today + links to the years and months
//   /luna/<year>/            all phases of the year, month by month
//   /luna/<year>/<month>/    every day of the month with phase and illuminated part
// Phase times come from /js/moon.js (Meeus, no API; checked against the USNO by
// test-moon.js). Times are Sofia time. The dates and phases are written into the
// HTML; only the "today" block is refreshed in the browser (/js/luna-today.js).
// Run from the repository root: node .github/scripts/build-luna.js [first year] [--sitemap]
// Builds the first year and the one after it (default: this year and next year).
const fs = require('fs');
const path = require('path');
const Moon = require('../../js/moon.js');
const { page, write, VERSION } = require('./build-pages.js');

const ROOT = process.cwd();
const ZONE = 'Europe/Sofia';
const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const SLUGS = ['yanuari', 'fevruari', 'mart', 'april', 'may', 'yuni', 'yuli', 'avgust', 'septemvri', 'oktomvri', 'noemvri', 'dekemvri'];
const ICONS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const NAMES = ['Новолуние', 'Растящ сърп', 'Първа четвърт', 'Растяща луна', 'Пълнолуние', 'Намаляваща луна', 'Последна четвърт', 'Намаляващ сърп'];
const EVENT_NAMES = ['Новолуние', 'Първа четвърт', 'Пълнолуние', 'Последна четвърт'];
const SCRIPTS = `<script src="/js/moon.js?v=${VERSION.moon}" defer></script>
<script src="/js/luna-today.js?v=${VERSION.lunaToday}" defer></script>\n`;

// --- Sofia time -------------------------------------------------------------
const partsOf = (date, options) => Object.fromEntries(
  new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hourCycle: 'h23', ...options }).formatToParts(date).map(p => [p.type, p.value]));
const sofia = date => {
  const p = partsOf(date, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  return { year: +p.year, month: +p.month - 1, day: +p.day, hour: +p.hour, minute: +p.minute };
};
const dayKey = date => { const s = sofia(date); return `${s.year}-${s.month}-${s.day}`; };
const hhmm = date => { const s = sofia(date); return `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`; };
const WEEKDAYS = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];
const weekdayOf = (year, month, day) => WEEKDAYS[new Date(Date.UTC(year, month, day, 12)).getUTCDay()];

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

const fullDate = (date, withYear) => {
  const s = sofia(date);
  return `${s.day} ${MONTHS[s.month]}${withYear ? ' ' + s.year : ''}`;
};
const esc = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

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

const monthUrl = (year, month) => `/luna/${year}/${SLUGS[month]}/`;
const monthLinks = (year, current) => MONTHS.map((name, month) =>
  `<a href="${monthUrl(year, month)}" class="recent-place"${month === current ? ' aria-current="page"' : ''}>${name}</a>`).join('\n        ');

// Second full moon in a calendar month ("blue moon")
function blueMoons(events) {
  const seen = {};
  const result = [];
  events.filter(event => event.type === 2).forEach(event => {
    const s = sofia(event.time);
    const key = s.month;
    if (seen[key]) result.push(event);
    seen[key] = true;
  });
  return result;
}

// --- The block "the Moon today" (same markup as /js/luna-today.js writes) -------
function todayBlock(now) {
  const state = Moon.state(now);
  const full = Moon.nextPhase(now, 2);
  const fresh = Moon.nextPhase(now, 0);
  const when = date => `<strong>${fullDate(date, true)}</strong>, ${hhmm(date)}`;
  return `<section class="info-card moon-today" id="moonToday" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <div class="moon-today-icon" style="font-size:4rem;line-height:1">${ICONS[state.index]}</div>
      <div>
        <h2 style="margin:0">${NAMES[state.index]}</h2>
        <p>${Math.round(state.fraction * 100)}% осветена част · ${state.waxing ? 'Луната расте' : 'Луната намалява'}</p>
        <p>Следващо пълнолуние: ${when(full)}<br>Следващо новолуние: ${when(fresh)}</p>
      </div>
    </section>`;
}

// --- Pages --------------------------------------------------------------------
function monthPage(year, month, years) {
  const events = yearEvents(year).filter(event => sofia(event.time).month === month);
  const allEvents = yearEvents(year);
  const name = MONTHS[month];
  const title = `Лунен календар ${name} ${year} – фази на Луната`;
  const byType = type => events.filter(event => event.type === type);
  const phrase = type => byType(type).map(event => `${fullDate(event.time)} в ${hhmm(event.time)} ч.`).join(' и ');
  const full = phrase(2);
  const fresh = phrase(0);
  const url = monthUrl(year, month);
  const prev = month === 0 ? (years.includes(year - 1) ? [year - 1, 11] : null) : [year, month - 1];
  const next = month === 11 ? (years.includes(year + 1) ? [year + 1, 0] : null) : [year, month + 1];
  const blue = blueMoons(allEvents).filter(event => sofia(event.time).month === month);

  const phaseRows = events.map(event => {
    const s = sofia(event.time);
    return `          <tr><td>${ICONS[event.type * 2]} ${EVENT_NAMES[event.type]}</td><td>${s.day} ${name}</td><td>${weekdayOf(s.year, s.month, s.day)}</td><td>${hhmm(event.time)} ч.</td></tr>`;
  }).join('\n');

  const dayRows = Array.from({ length: daysIn(year, month) }, (_, i) => {
    const day = i + 1;
    const { index, state, exact } = dayPhase(year, month, day, allEvents);
    const weekday = weekdayOf(year, month, day);
    const weekend = weekday === 'събота' || weekday === 'неделя' ? ' class="weekend"' : '';
    const note = exact ? ` <span class="holiday-note">в ${hhmm(exact.time)} ч.</span>` : '';
    return `          <tr${weekend}><td>${day} ${name}</td><td>${weekday}</td><td>${ICONS[index]} ${NAMES[index]}${note}</td><td>${Math.round(state.fraction * 100)}%</td></tr>`;
  }).join('\n');

  const dates = type => byType(type).map(event => fullDate(event.time)).join(' и ');
  const description = `Лунен календар за ${name} ${year}: ${full ? `пълнолуние на ${dates(2)}` : 'без пълнолуние'}, ${fresh ? `новолуние на ${dates(0)}` : 'без новолуние'}. Фаза на Луната и осветеност за всеки ден, по българско време.`;
  return page({
    url,
    title: esc(title),
    description: esc(description),
    jsonLd: breadcrumbsJson([['Weather Pulse', '/'], ['Лунен календар', '/luna/'], [`Лунен календар ${year}`, `/luna/${year}/`], [`${name} ${year}`, url]]),
    body: `    <p class="breadcrumbs"><a href="/luna/">Лунен календар</a> › <a href="/luna/${year}/">${year}</a> › ${name}</p>
    <h1>Лунен календар за ${name} ${year}</h1>
    <p class="storm-intro">През ${name} ${year} г. ${full ? `пълнолунието е на ${full}${blue.length ? ' (това е „синя луна“ – второто пълнолуние в месеца)' : ''}` : 'няма пълнолуние'}, а ${fresh ? `новолунието е на ${fresh}` : 'няма новолуние.'} Всички часове са по българско време. Таблицата по-долу показва фазата на Луната и осветената ѝ част за всеки ден.</p>

    <section class="info-card">
      <h2>Фази на Луната през ${name} ${year}</h2>
      <div class="table-scroll">
      <table class="kp-table holiday-table">
        <thead><tr><th>Фаза</th><th>Дата</th><th>Ден</th><th>Час</th></tr></thead>
        <tbody>
${phaseRows}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card">
      <h2>Фаза на Луната по дни – ${name} ${year}</h2>
      <div class="table-scroll">
      <table class="kp-table holiday-table">
        <thead><tr><th>Дата</th><th>Ден</th><th>Фаза</th><th>Осветеност</th></tr></thead>
        <tbody>
${dayRows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Осветеността е в 12:00 ч. българско време. Изчислено по алгоритъма на Жан Меюс („Astronomical Algorithms“); времената на фазите са проверени спрямо данните на Военноморската обсерватория на САЩ (USNO).</p>
    </section>

    <p class="city-actions">
      ${prev ? `<a class="btn" href="${monthUrl(...prev)}">← ${MONTHS[prev[1]]} ${prev[0]}</a>` : ''}
      ${next ? `<a class="btn" href="${monthUrl(...next)}">${MONTHS[next[1]]} ${next[0]} →</a>` : ''}
      <a class="btn" href="/luna/${year}/">Цялата ${year} г.</a>
    </p>

    <section class="info-card">
      <h2>Други месеци през ${year}</h2>
      <div class="city-links">
        ${monthLinks(year, month)}
      </div>
    </section>

    <section class="info-card">
      <h2>Още от Weather Pulse</h2>
      <div class="city-links">
        <a href="/luna/" class="recent-place">Луната днес</a>
        <a href="/vremeto/" class="recent-place">Времето в България</a>
        <a href="/magnitni-buri/" class="recent-place">Магнитни бури днес</a>
        <a href="/nebeto/" class="recent-place">Небето: метеори, затъмнения, суперлуни</a>
      </div>
    </section>`
  });
}

function yearPage(year, years) {
  const events = yearEvents(year);
  const url = `/luna/${year}/`;
  const fullMoons = events.filter(event => event.type === 2);
  const blue = blueMoons(events);
  const rows = MONTHS.map((name, month) => {
    const cell = type => {
      const list = events.filter(event => event.type === type && sofia(event.time).month === month);
      return list.map(event => `${sofia(event.time).day} ${name.slice(0, 3)}., ${hhmm(event.time)}`).join('<br>') || '–';
    };
    return `          <tr><td><a href="${monthUrl(year, month)}">${name}</a></td><td>${cell(0)}</td><td>${cell(1)}</td><td>${cell(2)}</td><td>${cell(3)}</td></tr>`;
  }).join('\n');
  const title = `Лунен календар ${year} – пълнолуния и новолуния`;
  const description = `Лунен календар за ${year}: датите на всички пълнолуния (${fullMoons.length}), новолуния и четвъртини по месеци, по българско време.`;
  return page({
    url,
    title: esc(title),
    description: esc(description),
    jsonLd: breadcrumbsJson([['Weather Pulse', '/'], ['Лунен календар', '/luna/'], [`Лунен календар ${year}`, url]]),
    body: `    <p class="breadcrumbs"><a href="/luna/">Лунен календар</a> › ${year}</p>
    <h1>Лунен календар ${year}: пълнолуния и новолуния</h1>
    <p class="storm-intro">През ${year} г. има ${fullMoons.length} пълнолуния${blue.length ? `, като второто пълнолуние на ${fullDate(blue[0].time)} е „синя луна“` : ''}. Първото пълнолуние е на ${fullDate(fullMoons[0].time)}, а последното – на ${fullDate(fullMoons[fullMoons.length - 1].time)}. Изберете месец за фазите ден по ден. Часовете са по българско време.</p>

    <section class="info-card">
      <h2>Фазите на Луната през ${year} по месеци</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Месец</th><th>Новолуние</th><th>Първа четвърт</th><th>Пълнолуние</th><th>Последна четвърт</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">Изчислено по алгоритъма на Жан Меюс; проверено спрямо данните на USNO.</p>
    </section>

    <p class="city-actions">
      ${years.filter(y => y !== year).map(y => `<a class="btn" href="/luna/${y}/">Лунен календар ${y}</a>`).join('\n      ')}
      <a class="btn" href="/luna/">Луната днес →</a>
    </p>`
  });
}

function hubPage(years, now) {
  const month = sofia(now).month;
  const thisYear = sofia(now).year;
  const current = years.includes(thisYear) ? monthUrl(thisYear, month) : monthUrl(years[0], 0);
  return page({
    url: '/luna/',
    title: 'Лунен календар – фаза на Луната днес',
    description: 'Фаза на Луната днес, осветена част, кога е следващото пълнолуние и новолуние. Лунен календар по месеци за ' + years.join(' и ') + ' г., по българско време.',
    jsonLd: breadcrumbsJson([['Weather Pulse', '/'], ['Лунен календар', '/luna/']]),
    body: `    <h1>Лунен календар: фаза на Луната днес</h1>
    <p class="storm-intro">Каква е фазата на Луната днес, колко от нея е осветена и кога е следващото пълнолуние. Календарите по месеци показват фазата за всеки ден; всички данни се изчисляват, без хороскопи и астрология.</p>

    ${todayBlock(now)}

    <p class="city-actions"><a class="btn" href="${current}">Този месец</a>${years.map(year => ` <a class="btn" href="/luna/${year}/">Лунен календар ${year}</a>`).join('')}</p>
${years.map(year => `
    <section class="info-card">
      <h2>Лунен календар ${year} по месеци</h2>
      <div class="city-links">
        ${monthLinks(year, -1)}
      </div>
    </section>`).join('\n')}

    <section class="info-card">
      <h2>Още от Weather Pulse</h2>
      <div class="city-links">
        <a href="/vremeto/" class="recent-place">Времето в България</a>
        <a href="/magnitni-buri/" class="recent-place">Магнитни бури днес</a>
        <a href="/nebeto/" class="recent-place">Небето: метеори, затъмнения, суперлуни</a>
        <a href="/praznici/" class="recent-place">Официални празници</a>
      </div>
    </section>`,
    scripts: SCRIPTS
  });
}

// --- Run ----------------------------------------------------------------------
const firstYear = Number(process.argv.find(arg => /^\d{4}$/.test(arg))) || sofia(new Date()).year;
const years = [firstYear, firstYear + 1];
const now = new Date();

write('luna', hubPage(years, now));
years.forEach(year => {
  write(`luna/${year}`, yearPage(year, years));
  MONTHS.forEach((_, month) => write(`luna/${year}/${SLUGS[month]}`, monthPage(year, month, years)));
});
console.log(`Wrote /luna/, ${years.length} year pages and ${years.length * 12} month pages (${years.join(', ')}).`);

if (process.argv.includes('--sitemap')) {
  const today = now.toISOString().slice(0, 10);
  const urls = ['/luna/', ...years.flatMap(year => [`/luna/${year}/`, ...MONTHS.map((_, month) => monthUrl(year, month))])];
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
  const missing = urls.filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
  const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, `    <priority>${url === '/luna/' ? '0.7' : '0.6'}</priority>`, '  </url>', ''].join(nl)).join(nl);
  sitemap = sitemap.replace('</urlset>', entries + '</urlset>');
  fs.writeFileSync(file, sitemap);
  console.log(`Added ${missing.length} URLs to sitemap.xml.`);
}
