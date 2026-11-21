// The Bulgarian pages about magnetic storms next to /magnitni-buri/ (Bulgarian only: the niche of
// the site with little competition in Bulgarian, see places.js for why not in every language):
//   /magnitni-buri/dnes/            magnetic storms today: highest Kp, Kp every 3 hours (NOAA)
//   /magnitni-buri/utre/            the same for tomorrow
// Today and tomorrow also in English (/en/magnitni-buri/dnes/, /utre/; Nov 2026: the English storm page
// had a 26 % CTR, and the storms are the same over all of Europe); the other pages are Bulgarian only.
//   /magnitni-buri/<month>-<year>/  the days of a month: Kp observed so far and NOAA's 27-day outlook
//   /magnitni-buri/kp-indeks/       what the Kp index means (no data)
//   /magnitni-buri/zdrave/          magnetic storms and health: what is known (no data)
// The data come from storms-data.json, which build-storms.js refreshes every morning and then runs
// this script; it also works on its own: node .github/scripts/build-storm-pages.js
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { page, write, VERSION } = require('./build-pages.js');

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
// The languages of the pages of today and tomorrow (both indexed, with hreflang)
const DAY_LANGS = ['bg', 'en'];
const LEVEL_EN = { 9: 'Extreme geomagnetic storm', 8: 'Severe geomagnetic storm', 7: 'Strong geomagnetic storm', 6: 'Moderate geomagnetic storm', 5: 'Minor geomagnetic storm', 4: 'Active', 0: 'Quiet' };
// the name of the level in a language (the Bulgarian one is the second item of LEVELS)
const levelName = (kp, lang) => (lang === 'en' ? LEVEL_EN[level(kp)[0]] : level(kp)[1]);
const kpText = kp => (Math.round(kp * 10) / 10).toFixed(1);
const date = (iso, options) => new Date(iso + 'T12:00:00Z').toLocaleDateString('bg-BG', { timeZone: 'UTC', ...options });
const longDate = iso => date(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthUrl = iso => `/magnitni-buri/${MONTH_SLUG[Number(iso.slice(5, 7)) - 1]}-${iso.slice(0, 4)}/`;
const monthTitle = iso => `${I18N.monthName('bg', Number(iso.slice(5, 7)) - 1)} ${iso.slice(0, 4)}`;

const KP_WIDGET_EN = `
    <section class="info-card">
      <h2>Kp index now</h2>
      <iframe src="/widget/kp.html?lang=en" width="320" height="190" style="border:0;max-width:100%" title="Kp index now" loading="lazy"></iframe>
      <p class="storm-updated">The value is updated every few minutes from NOAA data. Detailed chart, solar wind and storm alerts: <a href="/en/magnitni-buri/">Magnetic storms</a>.</p>
    </section>`;
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

const monthsOf = data => [...new Set([data.issued, ...(data.outlook || []).map(d => d.day), ...data.days.map(d => d.day)].map(d => d.slice(0, 7)))].sort();

function links(current, data, lang = 'bg') {
  if (lang === 'en') {
    const list = [['/magnitni-buri/', 'Kp index now'], ['/magnitni-buri/dnes/', 'Magnetic storms today'], ['/magnitni-buri/utre/', 'Magnetic storms tomorrow'], ['/nebeto/', 'Northern lights and the sky']]
      .filter(([url]) => L('en', url) !== current);
    return `
    <section class="info-card">
      <h2>More about magnetic storms</h2>
      <div class="city-links">
        ${list.map(([url, text]) => `<a href="${L('en', url)}" class="recent-place">${text}</a>`).join('\n        ')}
      </div>
    </section>`;
  }
  const list = [
    ['/magnitni-buri/', 'Kp индекс сега'], ['/magnitni-buri/dnes/', 'Магнитни бури днес'], ['/magnitni-buri/utre/', 'Магнитни бури утре'],
    ['/magnitni-buri/vchera/', 'Магнитни бури вчера'], ['/magnitni-buri/tazi-sedmitsa/', 'Магнитни бури тази седмица'],
    // every month that has a page (this one and the next, when the 27-day outlook reaches it)
    ...monthsOf(data).map(month => [monthUrl(month + '-01'), `Магнитни бури през ${monthTitle(month + '-01')}`]),
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
// Colour of a level (as the Kp bars of /js/storm-page.js): calm, active (Kp 4), storm (Kp 5 and more)
const levelColor = kp => (Math.round(kp) >= 5 ? '#e74c3c' : Math.round(kp) >= 4 ? '#f1c40f' : '#2ecc71');
// What a level means, in one sentence (the table of /magnitni-buri/kp-indeks/)
const MEANING = [
  [9, 'Изключителна буря: възможни са аварии в енергийните мрежи, прекъсване на GPS и радиовръзките и северно сияние, което може да се види и в България.'],
  [8, 'Много силна буря: възможни са проблеми в енергийните мрежи и спътниците, а северното сияние понякога се вижда и в Южна Европа.'],
  [7, 'Силна буря: възможни са неточности в GPS и прекъсвания на късовълновите радиовръзки, а сиянието стига до Германия и Полша.'],
  [6, 'Умерена буря: възможни са смущения в радиовръзките на големи ширини, а сиянието стига до Шотландия и Южна Скандинавия.'],
  [5, 'Слаба буря: възможни са слаби колебания в енергийните мрежи и сияние над Северна Европа, а в България обикновено няма видими последици.'],
  [4, 'Повишена активност: полето е неспокойно, но това още не е буря и няма последици за хората.'],
  [0, 'Спокойно: няма смущения в геомагнитното поле, не се очакват проблеми с радиовръзките и навигацията.']
];
const MEANING_EN = {
  9: 'Extreme storm: power grid failures, GPS and radio blackouts are possible, and the aurora may be seen even in Bulgaria.',
  8: 'Severe storm: problems with power grids and satellites are possible, and the aurora is sometimes seen in Southern Europe.',
  7: 'Strong storm: GPS errors and short-wave radio blackouts are possible, and the aurora reaches Germany and Poland.',
  6: 'Moderate storm: radio disturbances at high latitudes are possible, and the aurora reaches Scotland and southern Scandinavia.',
  5: 'Minor storm: weak power grid fluctuations and aurora over Northern Europe are possible; in Bulgaria there are usually no visible effects.',
  4: 'Active: the field is unsettled, but this is not a storm yet and it has no effect on people.',
  0: 'Quiet: no disturbance of the geomagnetic field, no problems with radio or navigation are expected.'
};
const meaning = (kp, lang = 'bg') => { const found = MEANING.find(([min]) => Math.round(kp) >= min) || MEANING[MEANING.length - 1]; return lang === 'en' ? MEANING_EN[found[0]] : found[1]; };
// The words of the pages of today and tomorrow
const DAY = {
  bg: {
    locale: 'bg-BG', which: ['днес', 'утре'], label: ['Днес', 'Утре'], ahead: ['Следващите дни', 'След това'],
    noForecast: which => `Прогнозата на NOAA за ${which} още не е публикувана.`,
    noForecastCard: 'Прогнозата на NOAA още не е публикувана.',
    peak: (from, to) => `Пикът е между <strong>${from}</strong> и <strong>${to} ч.</strong> (българско време).`,
    byHours: label => `${label} по часове →`,
    hoursH: which => `Kp индекс по часове ${which}`,
    thHours: 'Часове (българско време)', thLevel: 'Ниво', thDay: 'Ден', thHighest: 'Най-висок Kp',
    slotsNote: issued => `Kp е за 3-часови интервали. Прогноза на NOAA SWPC от ${issued} г.`,
    stormsTitle: 'Магнитни бури', h1: which => `Магнитни бури ${which}`,
    genericTitle: which => `Магнитни бури ${which} – Kp индекс и прогноза по часове`,
    genericDescription: which => `Има ли магнитна буря ${which}: най-високият Kp индекс, прогноза по 3-часови интервали по българско време и нивото на бурята по скалата на NOAA. Обновява се всяка сутрин.`,
    title: (which, when, kp, short) => `Магнитни бури ${which} (${when}) – Kp ${kp}, ${short}`,
    shortLevel: name => name.toLowerCase().replace(' магнитна буря', ' буря'),
    yes: (name, g) => `Да – ${name.toLowerCase()}${g ? ` (${g})` : ''}`, no: 'Не',
    question: (which, when, answer, kp) => `Има ли магнитна буря ${which} (${when})? ${answer}: най-висок Kp ${kp}`,
    peakShort: (from, to) => `, пик ${from}–${to} ч.`,
    otherShort: (other, kp, short) => ` ${other}: Kp ${kp}, ${short}.`,
    tail: ' Kp по часове по данни на NOAA, обновява се всяка сутрин.',
    summary: ({ label, longDate, storm, name, g, quiet, kp, top }) => `${label}, ${longDate}, NOAA очаква ${storm ? `<strong>магнитна буря</strong> – ${name.toLowerCase()}${g ? ` (${g})` : ''}` : quiet ? '<strong>спокойно</strong> геомагнитно поле' : `<strong>${name.toLowerCase()}</strong>, но не магнитна буря`}. Най-високият Kp индекс за деня е ${kp}${top ? `, а пикът е между ${top[0]} и ${top[1]} ч. българско време` : ''}.`,
    health: ' Повечето хора не усещат нищо; какво е известно за здравето е в <a href="/magnitni-buri/zdrave/">магнитни бури и здраве</a>.',
    about: 'Магнитна буря има при Kp индекс 5 и повече (G1 по скалата на NOAA). При Kp 4 полето е неспокойно, но това още не е буря. Прогнозата идва от Центъра за космическо време на NOAA и се обновява тук всяка сутрин; моментната стойност е в полето по-долу.'
  },
  en: {
    locale: 'en-GB', which: ['today', 'tomorrow'], label: ['Today', 'Tomorrow'], ahead: ['The next days', 'After that'],
    noForecast: which => `NOAA has not published the forecast for ${which} yet.`,
    noForecastCard: 'NOAA has not published the forecast yet.',
    peak: (from, to) => `The peak is between <strong>${from}</strong> and <strong>${to}</strong> (Bulgarian time, EET).`,
    byHours: label => `${label} by the hour →`,
    hoursH: which => `Kp index by the hour ${which}`,
    thHours: 'Hours (Bulgarian time)', thLevel: 'Level', thDay: 'Day', thHighest: 'Highest Kp',
    slotsNote: issued => `Kp is given for 3-hour intervals. NOAA SWPC forecast of ${issued}.`,
    stormsTitle: 'Magnetic storms', h1: which => `Magnetic storms ${which}`,
    genericTitle: which => `Magnetic storms ${which} – Kp index and hourly forecast`,
    genericDescription: which => `Is there a magnetic storm ${which}? The highest Kp index, the forecast in 3-hour intervals and the storm level on the NOAA scale. Updated every morning.`,
    title: (which, when, kp, short) => `Magnetic storms ${which} (${when}) – Kp ${kp}, ${short}`,
    shortLevel: name => name.toLowerCase().replace(' geomagnetic storm', ' storm'),
    yes: (name, g) => `Yes – ${name.toLowerCase()}${g ? ` (${g})` : ''}`, no: 'No',
    question: (which, when, answer, kp) => `Is there a magnetic storm ${which} (${when})? ${answer}: highest Kp ${kp}`,
    peakShort: (from, to) => `, peak ${from}–${to}.`,
    otherShort: (other, kp, short) => ` ${other}: Kp ${kp}, ${short}.`,
    tail: ' Hourly Kp from NOAA, updated every morning.',
    summary: ({ label, longDate, storm, name, g, quiet, kp, top }) => `${label}, ${longDate}, NOAA expects ${storm ? `<strong>a magnetic storm</strong> – ${name.toLowerCase()}${g ? ` (${g})` : ''}` : quiet ? 'a <strong>quiet</strong> geomagnetic field' : `<strong>${name.toLowerCase()}</strong> conditions, but not a magnetic storm`}. The highest Kp index of the day is ${kp}${top ? `, with the peak between ${top[0]} and ${top[1]} Bulgarian time (EET)` : ''}.`,
    health: ' Most people feel nothing.',
    about: 'A magnetic storm means a Kp index of 5 or more (G1 on the NOAA scale). At Kp 4 the field is unsettled, but this is not a storm yet. The forecast comes from the NOAA Space Weather Prediction Center and is updated here every morning; the current value is in the box below. Magnetic storms are global: the Kp index is the same for all of Europe.'
  }
};
const L = (lang, url) => I18N.localUrl(lang, url);
// The 3-hour interval of the highest Kp of a day (the first one when several are equal), Sofia time
function peak(day) {
  const slots = (day && day.slots) || [];
  if (!slots.length) return null;
  return slots.reduce((best, slot) => (slot[2] > best[2] ? slot : best), slots[0]);
}
const shortLevel = name => name.toLowerCase().replace(' магнитна буря', ' буря');
const STORM_STYLE = `  <style>
    .storm-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin: 14px 0; }
    .storm-card { display: block; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--card-border, rgba(255, 255, 255, 0.15)); background: var(--card-bg, rgba(255, 255, 255, 0.06)); color: inherit; text-decoration: none; }
    a.storm-card:hover { border-color: var(--gold, #ffd700); }
    .storm-card.is-current { border-color: var(--gold, #ffd700); }
    .storm-card h2 { margin: 0 0 6px; font-size: 1.05em; }
    .storm-card .storm-kp { font-size: 2.2em; font-weight: 700; line-height: 1.1; }
    .storm-card .storm-badge { display: inline-block; margin-left: 8px; padding: 2px 10px; border-radius: 999px; font-size: 0.9em; font-weight: 600; color: #162447; vertical-align: middle; }
    .storm-card p { margin: 6px 0 0; font-size: 0.95em; }
  </style>
`;

const dateIn = (lang, iso, options) => new Date(iso + 'T12:00:00Z').toLocaleDateString(DAY[lang].locale, { timeZone: 'UTC', ...options });
const dayUrl = (lang, index) => L(lang, index === 0 ? '/magnitni-buri/dnes/' : '/magnitni-buri/utre/');

function dayCard(data, index, current, lang = 'bg') {
  const W = DAY[lang];
  const day = data.days[index];
  const label = W.label[index];
  const url = dayUrl(lang, index);
  if (!day) return `      <div class="storm-card"><h2>${label}</h2><p>${W.noForecastCard}</p></div>`;
  const [, , g] = level(day.kp);
  const name = levelName(day.kp, lang);
  const top = peak(day);
  const color = levelColor(day.kp);
  const inner = `<h2>${label}, ${dateIn(lang, day.day, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
        <span class="storm-kp" style="color:${color}">Kp ${kpText(day.kp)}</span><span class="storm-badge" style="background:${color}">${name}${g ? ` (${g})` : ''}</span>
        ${top ? `<p>${W.peak(top[0], top[1])}</p>` : ''}${current ? '' : `<p>${W.byHours(label)}</p>`}`;
  return current
    ? `      <div class="storm-card is-current" aria-current="page">${inner}</div>`
    : `      <a class="storm-card" href="${url}">${inner}</a>`;
}

// Title and description with the numbers of the day: the places that change every morning sit between
// <!-- volatile --> marks, which build-sitemap.js leaves out of the hash (the lastmod does not move every day)
const volatile = (html, pattern) => html.replace(pattern, m => `<!-- volatile -->${m}<!-- /volatile -->`);

function dayPage(data, index, lang = 'bg') {
  const W = DAY[lang];
  const which = W.which[index];
  const other = W.label[1 - index];
  const url = index === 0 ? '/magnitni-buri/dnes/' : '/magnitni-buri/utre/';
  const here = L(lang, url);
  const day = data.days[index];
  const otherDay = data.days[1 - index];
  const [, , g] = day ? level(day.kp) : [];
  const name = day ? levelName(day.kp, lang) : '';
  const top = peak(day);
  const when = day ? dateIn(lang, day.day, { day: 'numeric', month: 'long' }) : '';
  const storm = day && Math.round(day.kp) >= 5;
  const summary = day
    ? W.summary({ label: W.label[index], longDate: dateIn(lang, day.day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), storm, name, g, quiet: level(day.kp)[0] === 0, kp: kpText(day.kp), top })
    : W.noForecast(which);
  const issued = dateIn(lang, data.issued, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/\s*г\.$/, '');
  const slots = day && day.slots && day.slots.length ? `
    <section class="info-card">
      <h2>${W.hoursH(which)}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>${W.thHours}</th><th>Kp</th><th>${W.thLevel}</th></tr></thead>
        <tbody>
${day.slots.map(([from, to, kp]) => `          <tr><td>${from}–${to}</td><td>${kpText(kp)}</td><td><span style="color:${levelColor(kp)}">●</span> ${levelName(kp, lang)}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
      <p class="storm-updated">${W.slotsNote(issued)}</p>
    </section>` : '';
  const next = data.days.slice(index + 1, index + 3);
  const ahead = next.length ? `
    <section class="info-card">
      <h2>${W.ahead[index]}</h2>
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>${W.thDay}</th><th>${W.thHighest}</th><th>${W.thLevel}</th></tr></thead>
        <tbody>
${next.map(d => `          <tr><td>${dateIn(lang, d.day, { weekday: 'long', day: 'numeric', month: 'long' })}</td><td>${kpText(d.kp)}</td><td><span style="color:${levelColor(d.kp)}">●</span> ${levelName(d.kp, lang)}</td></tr>`).join('\n')}
        </tbody>
      </table>
      </div>
    </section>` : '';

  // Title and description of the day (the generic ones when NOAA has no forecast)
  let title = W.genericTitle(which);
  let description = W.genericDescription(which);
  if (day) {
    title = W.title(which, when, kpText(day.kp), W.shortLevel(name));
    const answer = storm ? W.yes(name, g) : W.no;
    const parts = [
      W.question(which, when, answer, kpText(day.kp)),
      top ? W.peakShort(top[0], top[1]) : '.',
      otherDay ? W.otherShort(other, kpText(otherDay.kp), W.shortLevel(levelName(otherDay.kp, lang))) : '',
      W.tail
    ];
    // as much as fits in 155 characters, from the end
    description = parts.join('');
    for (let i = parts.length - 1; description.length > 155 && i >= 2; i--) description = parts.slice(0, i).join('');
    if (description.length > 155) description = parts.slice(0, 2).join('');
  }

  const cards = day ? `
    <!-- volatile -->
    <div class="storm-cards">
${dayCard(data, index, true, lang)}
${dayCard(data, 1 - index, false, lang)}
    </div>
    <!-- /volatile -->` : '';
  const hub = L(lang, '/magnitni-buri/');
  let html = page({
    lang,
    multi: true,
    langs: DAY_LANGS,
    url,
    title,
    image: '/images/cards/storm.png',
    description,
    head: STORM_STYLE,
    jsonLd: breadcrumbs([['Weather Pulse', L(lang, '/')], [W.stormsTitle, hub], [W.h1(which), here]]),
    body: `    <p class="breadcrumbs"><a href="${hub}">${W.stormsTitle}</a> › ${which}</p>
    <h1>${W.h1(which)}</h1>
    <div data-share></div>${cards}
    <section class="info-card">
      <!-- volatile -->
      <p class="storm-intro">${summary}</p>${day ? `
      <p>${meaning(day.kp, lang)}${storm ? W.health : ''}</p>` : ''}
      <!-- /volatile -->
      <p>${W.about}</p>
    </section>
<!-- volatile -->${slots}${ahead}
<!-- /volatile -->
${lang === 'en' ? KP_WIDGET_EN : KP_WIDGET}
${links(here, data, lang)}`,
    scripts: `<script src="/js/share.js?v=${VERSION.share}" defer></script>\n`
  });
  // the numbers in the head change every morning too
  html = volatile(html, /<title>[^<]*<\/title>/);
  html = volatile(html, /<meta name="description" content="[^"]*">/);
  html = volatile(html, /<meta property="og:title" content="[^"]*">/);
  html = volatile(html, /<meta property="og:description" content="[^"]*">/);
  return html;
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

// ---- Yesterday and this week ----
const addDays = (iso, n) => new Date(new Date(iso + 'T12:00:00Z').getTime() + n * 86400000).toISOString().slice(0, 10);

// Every day we know about, observed or forecast, by date (an observed value wins over a forecast)
function dayMap(data) {
  const map = {};
  (data.outlook || []).forEach(d => { map[d.day] = { day: d.day, kp: d.kp, observed: false }; });
  data.days.forEach(d => { map[d.day] = { day: d.day, kp: d.kp, observed: false }; });
  Object.entries(data.history).forEach(([day, kp]) => { map[day] = { day, kp, observed: true }; });
  return map;
}

const dayRows = list => list.map(d => `          <tr${Math.round(d.kp) >= 5 ? ' class="weekend"' : ''}><td>${date(d.day, { weekday: 'long', day: 'numeric', month: 'long' })}</td><td>${kpText(d.kp)}</td><td>${level(d.kp)[1]}</td><td>${d.observed ? 'измерено' : 'прогноза'}</td></tr>`).join('\n');
const dayTable = list => `
      <div class="table-scroll">
      <table class="kp-table">
        <thead><tr><th>Ден</th><th>Най-висок Kp</th><th>Ниво</th><th></th></tr></thead>
        <tbody>
${dayRows(list)}
        </tbody>
      </table>
      </div>`;

function yesterdayPage(data) {
  const url = '/magnitni-buri/vchera/';
  const map = dayMap(data);
  const today = data.days[0] ? data.days[0].day : data.issued;
  const yesterday = map[addDays(today, -1)];
  const week = Array.from({ length: 7 }, (_, i) => map[addDays(today, -7 + i)]).filter(Boolean);
  const [, name, g] = yesterday ? level(yesterday.kp) : [];
  const summary = yesterday
    ? `Вчера, ${longDate(yesterday.day)}, най-високият измерен Kp индекс беше ${kpText(yesterday.kp)}: ${yesterday.kp >= 4.67 ? `<strong>имаше магнитна буря</strong> – ${name.toLowerCase()}${g ? ` (${g})` : ''}` : name === 'Спокойно' ? 'спокойно магнитно поле, без магнитна буря' : 'повишена геомагнитна активност, но без магнитна буря'}.`
    : 'Данните за вчера още не са публикувани.';
  const storms = week.filter(d => Math.round(d.kp) >= 5);
  return page({
    ...ONLY_BG,
    url,
    title: 'Магнитни бури вчера – какъв беше Kp индексът',
    description: 'Имаше ли магнитна буря вчера: измереният най-висок Kp индекс, нивото по скалата на NOAA и дните на последната седмица. Обновява се всяка сутрин.',
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ['Магнитни бури', '/magnitni-buri/'], ['Магнитни бури вчера', url]]),
    body: `    <p class="breadcrumbs"><a href="/magnitni-buri/">Магнитни бури</a> › вчера</p>
    <h1>Магнитни бури вчера</h1>
    <section class="info-card">
      <p class="storm-intro">${summary}</p>
      <p>Магнитна буря има при Kp индекс 5 и повече (G1 по скалата на NOAA). Показаната стойност е най-високият 3-часов Kp за деня по оценка на NOAA и може да се уточни по-късно. ${storms.length ? `През последните 7 дни дните с буря са ${storms.length}: ${storms.map(d => date(d.day, { day: 'numeric', month: 'long' })).join(', ')}.` : 'През последните 7 дни не е имало ден с магнитна буря.'}</p>
    </section>
    <section class="info-card">
      <h2>Последните 7 дни</h2>${dayTable(week)}
      <p class="storm-updated">Данни на NOAA SWPC. Какво ще бъде днес: <a href="/magnitni-buri/dnes/">магнитни бури днес</a>.</p>
    </section>
${KP_WIDGET}
${links(url, data)}`
  });
}

function weekPage(data) {
  const url = '/magnitni-buri/tazi-sedmitsa/';
  const map = dayMap(data);
  const today = data.days[0] ? data.days[0].day : data.issued;
  // Monday to Sunday of the week of today
  const weekday = (new Date(today + 'T12:00:00Z').getUTCDay() + 6) % 7;
  const start = addDays(today, -weekday);
  const week = Array.from({ length: 7 }, (_, i) => map[addDays(start, i)]).filter(Boolean);
  const storms = week.filter(d => Math.round(d.kp) >= 5);
  const peak = week.reduce((best, d) => (!best || d.kp > best.kp ? d : best), null);
  const intro = week.length
    ? `Тази седмица (${date(week[0].day, { day: 'numeric', month: 'long' })} – ${date(week[week.length - 1].day, { day: 'numeric', month: 'long' })}) ${storms.length ? `има ${storms.length} ${storms.length === 1 ? 'ден' : 'дни'} с магнитна буря (Kp 5 и повече): ${storms.map(d => date(d.day, { weekday: 'long', day: 'numeric', month: 'long' })).join(', ')}.` : 'няма дни с магнитна буря (Kp 5 и повече) по измерванията и прогнозата на NOAA.'} Най-високият Kp е ${kpText(peak.kp)} (${date(peak.day, { weekday: 'long' })}).`
    : 'Данните за седмицата още не са публикувани.';
  return page({
    ...ONLY_BG,
    url,
    title: 'Магнитни бури тази седмица – Kp индекс по дни',
    description: 'Магнитни бури тази седмица: измерен и прогнозен Kp индекс за всеки ден от понеделник до неделя по данни на NOAA и кои дни се очаква буря.',
    jsonLd: breadcrumbs([['Weather Pulse', '/'], ['Магнитни бури', '/magnitni-buri/'], ['Магнитни бури тази седмица', url]]),
    body: `    <p class="breadcrumbs"><a href="/magnitni-buri/">Магнитни бури</a> › тази седмица</p>
    <h1>Магнитни бури тази седмица</h1>
    <section class="info-card">
      <p class="storm-intro">${intro}</p>
      <p>Измерено е най-високото 3-часово Kp за вече минали дни, а за предстоящите – прогнозата на NOAA (3 дни по часове, по-нататък по 27-дневната прогноза, която е ориентировъчна).</p>
    </section>
    <section class="info-card">
      <h2>Kp индекс по дни</h2>${dayTable(week)}
      <p class="storm-updated">Прогноза на NOAA SWPC от ${date(data.issued, { day: 'numeric', month: 'long', year: 'numeric' })} г. Подробности по часове: <a href="/magnitni-buri/dnes/">днес</a> и <a href="/magnitni-buri/utre/">утре</a>.</p>
    </section>
${KP_WIDGET}
${links(url, data)}`
  });
}

function build() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  data.history = data.history || {};
  DAY_LANGS.forEach(lang => [0, 1].forEach(index => write(dayUrl(lang, index).slice(1, -1), dayPage(data, index, lang))));
  write('magnitni-buri/vchera', yesterdayPage(data));
  write('magnitni-buri/tazi-sedmitsa', weekPage(data));
  // the month of today, and the next one when the forecast reaches it
  const months = monthsOf(data);
  months.forEach(month => write(monthUrl(month + '-01').slice(1, -1), monthPage(data, month)));
  write('magnitni-buri/kp-indeks', kpPage(data));
  write('magnitni-buri/zdrave', healthPage(data));
  return { months, data };
}

module.exports = { build, monthUrl, monthTitle };
if (require.main === module) {
  const { months } = build();
  console.log(`Wrote /magnitni-buri/dnes/, /utre/, /vchera/, /tazi-sedmitsa/, /kp-indeks/, /zdrave/ and ${months.length} month page(s).`);
}
