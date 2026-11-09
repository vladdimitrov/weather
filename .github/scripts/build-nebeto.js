// Generates /nebeto/ in the five languages (/nebeto/, /en/nebeto/, /de/nebeto/ ...): meteor
// showers, eclipses visible from Bulgaria, supermoons and when the northern lights can be seen
// from Bulgaria. Events are in sky-events.json (kept by hand, every event with its source, texts
// in the five languages); page texts are in text-nebeto.js. The Moon at each meteor peak is
// computed by js/moon.js. A small script greys out events that have already happened.
// Run from the repository root: node .github/scripts/build-nebeto.js [--sitemap]
const fs = require('fs');
const path = require('path');
const Moon = require('../../js/moon.js');
const I18N = require('./i18n.js');
const { NEBETO } = require('./text-nebeto.js');
const { page, write, VERSION } = require('./build-pages.js');
// Medallion icons from the forecast (js/weather-icons.js), drawn into the static HTML
global.window = global.window || {};
require('../../js/weather-icons.js');
const Icons = global.window.WeatherIcons;
const EVENTS = require('./sky-events.json');

const ROOT = process.cwd();
const ZONE = 'Europe/Sofia';
const esc = I18N.esc;
const L = (lang, url) => I18N.localUrl(lang, url);
const head = (key, title) => `<div class="sky-head">${Icons.medal(key, '', 'xl')}<h2>${title}</h2></div>`;

const parts = date => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
}).formatToParts(new Date(date)).map(p => [p.type, p.value]));
// Date (Sofia) written in the language, e.g. "17 November 2026"
const dateText = (lang, date) => {
  const p = parts(date);
  return new Intl.DateTimeFormat(I18N.LOCALE[lang], { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(p.year, p.month - 1, p.day, 12)));
};
const clock = date => { const p = parts(date); return `${p.hour}:${p.minute}`; };
const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${esc(text)}</a>`;

// "6–30 November": the period when a shower is active (MM-DD to MM-DD, may cross the new year)
const activeText = (lang, [from, to]) => {
  const at = (text, year) => { const [m, d] = text.split('-').map(Number); return new Date(Date.UTC(year, m - 1, d, 12)); };
  const start = at(from, 2026);
  let end = at(to, 2026);
  if (end < start) end = at(to, 2027);
  return new Intl.DateTimeFormat(I18N.LOCALE[lang], { timeZone: 'UTC', day: 'numeric', month: 'long' }).formatRange(start, end);
};

const zhrText = (T, zhr) => [T[zhr.prefix], zhr.value].filter(Boolean).join(' ') + (zhr.range ? ` (${zhr.range})` : '');

function moonCondition(T, date) {
  const lit = Math.round(Moon.state(new Date(date)).fraction * 100);
  const verdict = T.moonVerdicts[lit < 25 ? 0 : lit < 60 ? 1 : 2];
  return `${lit}% (${verdict})`;
}

function nebetoPage(lang) {
  const T = NEBETO[lang];
  const url = '/nebeto/';
  const kmFormat = new Intl.NumberFormat(I18N.LOCALE[lang]);

  const meteorRows = EVENTS.meteors.map(m => `          <tr data-end="${m.max}"><td><div class="sky-name">${Icons.medal('meteor', '', 'md')}<div><strong>${esc(m.name[lang])}</strong><br><span class="holiday-note">${T.active} ${activeText(lang, m.active)}</span></div></div></td><td data-utc="${m.max}" data-fmt="${m.dateOnly ? 'date' : 'datetime'}">${dateText(lang, m.max)}${m.dateOnly ? '' : `<br>${T.time(clock(m.max))}`}</td><td>${esc(zhrText(T, m.zhr))}</td><td>${moonCondition(T, m.max)}</td><td>${esc(m.note[lang])} ${link(m.url, m.source)}</td></tr>`).join('\n');

  const eclipseBlocks = EVENTS.eclipses.map(e => `
      <div class="sky-eclipse" data-end="${e.max}">${Icons.medal('eclipse', '', 'md')}<h3>${esc(e.name[lang])} – ${dateText(lang, e.max)}</h3></div>
      <p data-bg-only>${T.visible} ${esc(e.visible[lang])}. ${esc(e.text[lang])} ${T.sourceWord}: ${link(e.url, e.source[lang])}.</p>
      <p id="skyEclipseGeneric" data-other-only hidden></p>`).join('\n');

  const supermoonRows = EVENTS.supermoons.map(s => `          <tr data-end="${s.full}"><td><div class="sky-name">${Icons.medal('moonSuper', '', 'md')}<strong data-utc="${s.full}" data-fmt="date">${dateText(lang, s.full)}</strong></div></td><td data-utc="${s.full}" data-fmt="time">${T.time(clock(s.full))}</td><td>${s.distanceKm ? T.distance(kmFormat.format(s.distanceKm)) : '–'}</td><td>${link(s.url, s.source)}</td></tr>`).join('\n');

  const events = [
    ...EVENTS.meteors.map(m => ({ name: T.ldMeteor(m.name[lang]), date: m.max, description: T.ldMeteorText(m.name[lang], dateText(lang, m.max), zhrText(T, m.zhr), m.source), url: m.url })),
    ...EVENTS.eclipses.map(e => ({ name: e.name[lang], date: e.max, description: T.ldEclipseText(e.name[lang], dateText(lang, e.max), e.visible[lang]), url: e.url }))
  ].map(e => ({
    '@type': 'Event',
    name: e.name,
    startDate: e.date.replace('Z', '+00:00'),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: T.place, address: { '@type': 'PostalAddress', addressCountry: 'BG' } },
    description: e.description,
    isAccessibleForFree: true,
    url: e.url
  }));

  const structured = `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [['Weather Pulse', '/'], [T.sky, url]].map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${L(lang, u)}` })) },
      ...events
    ]
  }, null, 2).replace(/\n/g, '\n  ')}
  </script>
`;

  return page({
    url,
    lang,
    multi: true,
    title: T.title,
    description: T.description,
    jsonLd: structured,
    body: `    <h1>${T.h1}<span id="skyH1Place"> – ${new Intl.DisplayNames([I18N.LOCALE[lang]], { type: 'region' }).of('BG')}</span></h1>
    <p class="storm-intro">${T.intro}</p>
    <p id="skyPlace" class="storm-updated" style="margin:6px auto 14px;max-width:900px;padding:0 16px;text-align:center"></p>
    <p class="city-actions"><a class="btn" href="${L(lang, '/luna/')}">${T.calBtn}</a> <a class="btn" href="/magnitni-buri/">${T.stormsBtn}</a></p>

    <section class="info-card" id="meteorni-potoci">
      ${head('meteor', T.meteorH)}
      <p>${T.meteorText}</p>
      <div class="table-scroll">
      <table class="kp-table sky-table">
        <thead><tr>${T.meteorHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${meteorRows}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card" id="zatmeniya">
      ${head('eclipse', T.eclipseH)}${eclipseBlocks}
      <p class="storm-updated" data-bg-only>${T.eclipsePast}</p>
    </section>

    <section class="info-card" id="superluni">
      ${head('moonSuper', T.superH)}
      <p>${T.superText}</p>
      <div class="table-scroll">
      <table class="kp-table sky-table">
        <thead><tr>${T.superHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
${supermoonRows}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card" id="severno-siyanie">
      ${head('aurora', T.auroraH)}
      <p id="auroraKp" class="storm-now-status">${T.loadingKp}</p>
      <p data-bg-only>${T.aurora1}</p>
      <p id="skyAuroraGeneric" data-other-only hidden></p>
      <p data-bg-only>${T.aurora2(link('https://www.bta.bg/en/news/bulgaria/759233-strong-solar-flare-makes-northern-lights-visible-from-bulgaria', T.btaText))}</p>
      <p>${T.aurora3(`<a href="/magnitni-buri/">${T.stormsLink}</a>`, link('https://www.swpc.noaa.gov/', 'NOAA SWPC'))}</p>
    </section>

    <section class="info-card">
      <h2>${T.more}</h2>
      <div class="city-links">
        <a href="${L(lang, '/luna/')}" class="recent-place">${T.cal}</a>
        <a href="/magnitni-buri/" class="recent-place">${T.storms}</a>
        <a href="${L(lang, '/vremeto/')}" class="recent-place">${T.weather}</a>
        <a href="${L(lang, '/vremeto/sofia/')}" class="recent-place" id="skySunLink">${T.sunSofia}</a>
      </div>
    </section>`,
    scripts: `<script src="/js/place-context.js?v=${VERSION.placeContext}" defer></script>
<script src="/js/aurora-kp.js?v=${VERSION.auroraKp}" defer></script>
<script src="/js/sky-local.js?v=${VERSION.skyLocal}" defer></script>
<script>
  // Events that already happened are shown faded
  document.querySelectorAll('[data-end]').forEach(function (node) {
    if (new Date(node.dataset.end).getTime() + 86400000 < Date.now()) node.style.opacity = '0.5';
  });
</script>\n`
  });
}

I18N.LANGS.forEach(lang => write(L(lang, '/nebeto/').slice(1), nebetoPage(lang)));
console.log(`Wrote /nebeto/ in ${I18N.LANGS.length} languages (${EVENTS.meteors.length} meteor showers, ${EVENTS.eclipses.length} eclipse, ${EVENTS.supermoons.length} supermoons).`);

if (process.argv.includes('--sitemap')) {
  const today = new Date().toISOString().slice(0, 10);
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
  const missing = I18N.LANGS.map(lang => L(lang, '/nebeto/')).filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
  const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, '    <priority>0.7</priority>', '  </url>', ''].join(nl)).join(nl);
  fs.writeFileSync(file, sitemap.replace('</urlset>', entries + '</urlset>'));
  console.log(`Added ${missing.length} URLs to sitemap.xml.`);
}
