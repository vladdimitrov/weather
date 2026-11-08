// Generates /nebeto/: meteor showers, eclipses visible from Bulgaria, supermoons and
// when the northern lights can be seen from Bulgaria. Events are in sky-events.json
// (kept by hand, every event with its source). The Moon at each meteor peak is computed
// by js/moon.js. A small script greys out events that have already happened.
// Run from the repository root: node .github/scripts/build-nebeto.js [--sitemap]
const fs = require('fs');
const path = require('path');
const Moon = require('../../js/moon.js');
const { page, write, VERSION } = require('./build-pages.js');
const EVENTS = require('./sky-events.json');

const ROOT = process.cwd();
const ZONE = 'Europe/Sofia';
const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const esc = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const parts = date => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
}).formatToParts(new Date(date)).map(p => [p.type, p.value]));
const dateText = date => { const p = parts(date); return `${+p.day} ${MONTHS[p.month - 1]} ${p.year}`; };
const timeText = date => { const p = parts(date); return `${p.hour}:${p.minute} ч.`; };
const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${esc(text)}</a>`;

function moonCondition(date) {
  const lit = Math.round(Moon.state(new Date(date)).fraction * 100);
  const verdict = lit < 25 ? 'почти без лунна светлина' : lit < 60 ? 'Луната пречи частично' : 'силна лунна светлина';
  return `${lit}% (${verdict})`;
}

const meteorRows = EVENTS.meteors.map(m => `          <tr data-end="${m.max}"><td><strong>${esc(m.name)}</strong><br><span class="holiday-note">активен ${esc(m.active)}</span></td><td>${dateText(m.max)}${m.dateOnly ? '' : `<br>${timeText(m.max)}`}</td><td>${esc(m.zhr)}</td><td>${moonCondition(m.max)}</td><td>${esc(m.note)} ${link(m.url, m.source)}</td></tr>`).join('\n');

const eclipseBlocks = EVENTS.eclipses.map(e => `
      <h3 data-end="${e.max}">${esc(e.name)} – ${dateText(e.max)}</h3>
      <p>Видимо ${esc(e.visible)}. ${esc(e.text)} Източник: ${link(e.url, e.source)}.</p>`).join('\n');

const supermoonRows = EVENTS.supermoons.map(s => `          <tr data-end="${s.full}"><td>${dateText(s.full)}</td><td>${timeText(s.full)}</td><td>${esc(s.distance) || '–'}</td><td>${link(s.url, s.source)}</td></tr>`).join('\n');

const jsonLd = [
  ...EVENTS.meteors.map(m => ({ name: `${m.name} – максимум на метеорния поток`, date: m.max, description: `${m.name}: максимум на ${dateText(m.max)}, ZHR ${m.zhr}. Източник: ${m.source}.`, url: m.url })),
  ...EVENTS.eclipses.map(e => ({ name: e.name, date: e.max, description: `${e.name} на ${dateText(e.max)}, видимо ${e.visible}.`, url: e.url }))
].map(e => ({
  '@type': 'Event',
  name: e.name,
  startDate: e.date.replace('Z', '+00:00'),
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: { '@type': 'Place', name: 'Небето над България', address: { '@type': 'PostalAddress', addressCountry: 'BG' } },
  description: e.description,
  isAccessibleForFree: true,
  url: e.url
}));

const structured = `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [['Weather Pulse', '/'], ['Небето', '/nebeto/']].map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://weatherpulse.eu${url}` })) },
      ...jsonLd
    ]
  }, null, 2).replace(/\n/g, '\n  ')}
  </script>
`;

const html = page({
  url: '/nebeto/',
  title: 'Небето: метеорни потоци, затъмнения, суперлуни и северно сияние',
  description: 'Астрономически събития, видими от България през 2026 и 2027 г.: метеорни потоци (Геминиди, Персеиди), затъмнения, суперлуни и кога може да се види северно сияние.',
  jsonLd: structured,
  body: `    <h1>Небето: астрономически събития за България</h1>
    <p class="storm-intro">Метеорни потоци, затъмнения, суперлуни и северно сияние – само изчислими данни, без хороскопи и астрология. Всяко събитие има посочен източник. Часовете са по българско време.</p>
    <p class="city-actions"><a class="btn" href="/luna/">Лунен календар →</a> <a class="btn" href="/magnitni-buri/">Магнитни бури днес →</a></p>

    <section class="info-card" id="meteorni-potoci">
      <h2>Метеорни потоци 2026–2027</h2>
      <p>ZHR е броят метеори на час, който би видял наблюдател под идеално тъмно небе с радианта високо над хоризонта; в градовете и при Луна се виждат много по-малко. Осветеността на Луната е в момента на максимума.</p>
      <div class="table-scroll">
      <table class="kp-table sky-table">
        <thead><tr><th>Поток</th><th>Максимум</th><th>ZHR</th><th>Луната</th><th>Бележка и източник</th></tr></thead>
        <tbody>
${meteorRows}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card" id="zatmeniya">
      <h2>Затъмнения, видими от България</h2>${eclipseBlocks}
      <p class="storm-updated">Затъмненията от 12 и 28 август 2026 г. вече минаха (слънчевото беше видимо само в най-северозападните части на България, а лунното – само в началото, ниско на запад).</p>
    </section>

    <section class="info-card" id="superluni">
      <h2>Суперлуни 2026–2027</h2>
      <p>Суперлуна е пълнолуние, когато Луната е близо до перигея си. Точно определение няма: според NASA, цитирана от Space.com, това е пълнолуние на разстояние под около 362 000 км. Датите и часовете на пълнолуниета са изчислени от нашия лунен календар, а етикетът „суперлуна“ е по посочения източник. Разликата в видимия размер е малка.</p>
      <div class="table-scroll">
      <table class="kp-table sky-table">
        <thead><tr><th>Пълнолуние</th><th>Час</th><th>Разстояние</th><th>Източник</th></tr></thead>
        <tbody>
${supermoonRows}
        </tbody>
      </table>
      </div>
    </section>

    <section class="info-card" id="severno-siyanie">
      <h2>Северно сияние в България</h2>
      <p id="auroraKp" class="storm-now-status">Зареждане на Kp…</p>
      <p>Северното сияние от България се вижда <strong>много рядко</strong>. Kp е мярка за геомагнитната активност от 0 до 9. Обичайните „магнитни бури“ (Kp 5–6) осветяват небето само на север от Европа. За да се види сияние от нашите ширини, обикновено трябва Kp да е около 7 или повече (степени G3 и над по скалата на NOAA), при ясно небе, далеч от градските светлини и с поглед към север.</p>
      <p>Случва се само при най-силните бури. Например в ранните часове на 11 октомври 2024 г. сиянието беше видимо и от България (${link('https://www.bta.bg/en/news/bulgaria/759233-strong-solar-flare-makes-northern-lights-visible-from-bulgaria', 'БТА')}). Така че голяма част от „бурите“ в новините не значат сияние над нас.</p>
      <p>Прогноза и текущ Kp: <a href="/magnitni-buri/">Магнитни бури днес</a>. Данните са от ${link('https://www.swpc.noaa.gov/', 'NOAA SWPC')}.</p>
    </section>

    <section class="info-card">
      <h2>Още от Weather Pulse</h2>
      <div class="city-links">
        <a href="/luna/" class="recent-place">Лунен календар</a>
        <a href="/magnitni-buri/" class="recent-place">Магнитни бури</a>
        <a href="/vremeto/" class="recent-place">Времето в България</a>
        <a href="/vremeto/sofia/" class="recent-place">Изгрев и залез в София</a>
      </div>
    </section>`,
  scripts: `<script src="/js/aurora-kp.js?v=${VERSION.auroraKp}" defer></script>
<script>
  // Events that already happened are shown faded
  document.querySelectorAll('[data-end]').forEach(function (node) {
    if (new Date(node.dataset.end).getTime() + 86400000 < Date.now()) node.style.opacity = '0.5';
  });
</script>\n`
});

write('nebeto', html);
console.log(`Wrote /nebeto/ (${EVENTS.meteors.length} meteor showers, ${EVENTS.eclipses.length} eclipse, ${EVENTS.supermoons.length} supermoons).`);

if (process.argv.includes('--sitemap')) {
  const today = new Date().toISOString().slice(0, 10);
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  if (!sitemap.includes('https://weatherpulse.eu/nebeto/<')) {
    const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
    const entry = ['  <url>', '    <loc>https://weatherpulse.eu/nebeto/</loc>', `    <lastmod>${today}</lastmod>`, '    <priority>0.7</priority>', '  </url>', ''].join(nl);
    fs.writeFileSync(file, sitemap.replace('</urlset>', entry + '</urlset>'));
    console.log('Added /nebeto/ to sitemap.xml.');
  }
}
