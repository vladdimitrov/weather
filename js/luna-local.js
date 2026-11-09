// Moon calendar pages (/luna/...): dates and times in the time zone of the visitor's place
// (/js/place-context.js). The HTML is written in Sofia time. For another country this script
// rebuilds the tables from /js/moon.js in that time zone and puts a country picker on the page:
//   month page: #phaseBody (phases), #dayBody (every day), #dayNoteTz, intro #lunaIntro / #lunaIntroGeneric
//   year page:  #yearBody (a row per month, cells 1-4)
//   all pages:  #lunaPlace (the picker)
// Bulgaria (or a first visit) keeps the static HTML.
(function () {
  const bar = document.getElementById('lunaPlace');
  if (!bar || typeof PlaceContext === 'undefined' || typeof Moon === 'undefined') return;

  const LOCALES = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const SUFFIX = { bg: ' ч.', de: ' Uhr' };
  const AT = { bg: t => `в ${t} ч.`, en: t => `at ${t}`, de: t => `um ${t} Uhr`, it: t => `alle ${t}`, es: t => `a las ${t}` };
  const D = {
    bg: { label: 'Показано за:', hint: 'Датите и часовете следват избраната държава.', tz: z => `Часовете са по местно време (${z}).`, note: z => `Осветеността е в 12:00 ч. местно време (${z}).` },
    en: { label: 'Showing for:', hint: 'Dates and times follow the chosen country.', tz: z => `Times are local time (${z}).`, note: z => `Illumination is at 12:00 local time (${z}).` },
    de: { label: 'Angezeigt für:', hint: 'Daten und Zeiten folgen dem gewählten Land.', tz: z => `Die Zeiten gelten in Ortszeit (${z}).`, note: z => `Die Beleuchtung gilt für 12:00 Uhr Ortszeit (${z}).` },
    it: { label: 'Mostrato per:', hint: 'Date e orari seguono il paese scelto.', tz: z => `Gli orari sono in ora locale (${z}).`, note: z => `L'illuminazione è alle 12:00 ora locale (${z}).` },
    es: { label: 'Mostrado para:', hint: 'Las fechas y horas siguen al país elegido.', tz: z => `Las horas están en hora local (${z}).`, note: z => `La iluminación corresponde a las 12:00, hora local (${z}).` }
  };

  // --- time zone helpers ------------------------------------------------------
  const partsCache = {};
  function parts(date, zone) {
    partsCache[zone] = partsCache[zone] || new Intl.DateTimeFormat('en-GB', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    const p = Object.fromEntries(partsCache[zone].formatToParts(date).map(x => [x.type, x.value]));
    return { year: +p.year, month: +p.month - 1, day: +p.day, hour: +p.hour, minute: +p.minute };
  }
  // 12:00 on a calendar date in the zone, as an instant
  function noon(zone, year, month, day) {
    const guess = Date.UTC(year, month, day, 12);
    const local = parts(new Date(guess), zone);
    const offset = Date.UTC(local.year, local.month, local.day, local.hour, local.minute) - guess;
    return new Date(guess - offset);
  }
  const hhmm = (lang, date, zone) => { const p = parts(date, zone); return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}${SUFFIX[lang] || ''}`; };
  const utcDay = (y, m, d) => new Date(Date.UTC(y, m, d, 12));
  const fmt = (lang, options) => new Intl.DateTimeFormat(LOCALES[lang], Object.assign({ timeZone: 'UTC' }, options));
  const dayMonth = (lang, y, m, d) => fmt(lang, { day: 'numeric', month: 'long' }).format(utcDay(y, m, d));
  const weekday = (lang, y, m, d) => fmt(lang, { weekday: 'long' }).format(utcDay(y, m, d));
  const keyOf = p => `${p.year}-${p.month}-${p.day}`;

  // exact phases of a year in the zone
  function yearEvents(year, zone) {
    return Moon.phaseEvents(new Date(Date.UTC(year - 1, 11, 25)), new Date(Date.UTC(year + 1, 0, 5)))
      .map(e => ({ type: e.type, time: e.time, local: parts(e.time, zone) })).filter(e => e.local.year === year);
  }
  function dayPhase(zone, year, month, day, events) {
    const exact = events.find(e => keyOf(e.local) === `${year}-${month}-${day}`);
    const state = Moon.state(noon(zone, year, month, day));
    if (exact) return { index: exact.type * 2, state, exact };
    let index = state.index;
    if (index % 2 === 0) index = (index + (state.angle > index * 45 ? 1 : 7)) % 8;
    return { index, state, exact: null };
  }

  // --- the tables -------------------------------------------------------------
  const saved = new Map();
  const keep = (node, html) => { if (!saved.has(node)) saved.set(node, html); return saved.get(node); };

  function monthPage(lang, zone, bulgaria) {
    const phaseBody = document.getElementById('phaseBody');
    const dayBody = document.getElementById('dayBody');
    if (!phaseBody || !dayBody) return;
    const year = +phaseBody.dataset.year;
    const month = +phaseBody.dataset.month;
    const names = Moon.NAMES[lang];
    const t = D[lang];
    const original = [keep(phaseBody, phaseBody.innerHTML), keep(dayBody, dayBody.innerHTML)];
    const noteTz = document.getElementById('dayNoteTz');
    if (noteTz) keep(noteTz, noteTz.textContent);
    const generic = document.getElementById('lunaIntroGeneric');
    const intro = document.getElementById('lunaIntro');
    if (intro) intro.hidden = !bulgaria;
    if (generic) generic.hidden = bulgaria;
    if (bulgaria) {
      phaseBody.innerHTML = original[0];
      dayBody.innerHTML = original[1];
      if (noteTz) noteTz.textContent = saved.get(noteTz);
      return;
    }
    const all = yearEvents(year, zone);
    const events = all.filter(e => e.local.month === month);
    phaseBody.innerHTML = events.map(e => `          <tr><td>${Moon.ICONS[e.type * 2]} ${names[e.type * 2]}</td><td>${dayMonth(lang, year, month, e.local.day)}</td><td>${weekday(lang, year, month, e.local.day)}</td><td>${hhmm(lang, e.time, zone)}</td></tr>`).join('\n');
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    let rows = '';
    for (let day = 1; day <= days; day++) {
      const { index, state, exact } = dayPhase(zone, year, month, day, all);
      const wd = utcDay(year, month, day).getUTCDay();
      const note = exact ? ` <span class="holiday-note">${AT[lang](hhmm(lang, exact.time, zone).replace(SUFFIX[lang] || '@@', ''))}</span>` : '';
      rows += `          <tr${wd === 0 || wd === 6 ? ' class="weekend"' : ''}><td>${dayMonth(lang, year, month, day)}</td><td>${weekday(lang, year, month, day)}</td><td>${Moon.ICONS[index]} ${names[index]}${note}</td><td>${Math.round(state.fraction * 100)}%</td></tr>\n`;
    }
    dayBody.innerHTML = rows;
    if (noteTz) noteTz.textContent = t.note(zone);
    if (generic) {
      const list = type => events.filter(e => e.type === type).map(e => `${dayMonth(lang, year, month, e.local.day)} ${AT[lang](hhmm(lang, e.time, zone).replace(SUFFIX[lang] || '@@', ''))}`).join(' · ') || '–';
      generic.textContent = `${t.tz(zone)} ${names[4]}: ${list(2)}. ${names[0]}: ${list(0)}.`;
    }
  }

  function yearPage(lang, zone, bulgaria) {
    const body = document.getElementById('yearBody');
    if (!body) return;
    const year = +body.dataset.year;
    const rows = [...body.querySelectorAll('tr')];
    rows.forEach(row => [1, 2, 3, 4].forEach(i => keep(row.cells[i], row.cells[i].innerHTML)));
    const generic = document.getElementById('lunaIntroGeneric');
    const intro = document.getElementById('lunaIntro');
    if (intro) intro.hidden = !bulgaria;
    if (generic) generic.hidden = bulgaria;
    if (bulgaria) { rows.forEach(row => [1, 2, 3, 4].forEach(i => { row.cells[i].innerHTML = saved.get(row.cells[i]); })); return; }
    const names = Moon.NAMES[lang];
    const events = yearEvents(year, zone);
    rows.forEach((row, month) => {
      for (let type = 0; type < 4; type++) {
        const list = events.filter(e => e.type === type && e.local.month === month);
        row.cells[type + 1].innerHTML = list.map(e => `${e.local.day} ${fmt(lang, { month: 'short' }).format(utcDay(year, month, 15))}, ${hhmm(lang, e.time, zone)}`).join('<br>') || '–';
      }
    });
    if (generic) generic.textContent = `${D[lang].tz(zone)} ${names[4]}: ${events.filter(e => e.type === 2).length}.`;
  }

  // --- picker ---------------------------------------------------------------
  let places = {};
  function buildBar(lang, place, zone) {
    const t = D[lang];
    const code = place.isDefault ? 'BG' : place.countryCode;
    const codes = Object.keys(places);
    if (code && !codes.includes(code)) codes.push(code);
    const options = codes.map(c => ({ code: c, name: PlaceContext.countryName(c, lang) })).sort((a, b) => a.name.localeCompare(b.name, LOCALES[lang]));
    bar.innerHTML = `<label>${t.label} <select id="lunaCountry" style="padding:6px 10px;border-radius:8px;border:1px solid var(--card-border,#555);background:var(--card-bg,#16213e);color:inherit;font:inherit">${options.map(o => `<option value="${o.code}"${o.code === code ? ' selected' : ''}>${o.name}</option>`).join('')}</select></label> <span class="holiday-note">${t.hint} (${zone})</span>`;
    bar.querySelector('select').addEventListener('change', async event => {
      if (await PlaceContext.setCountry(event.target.value)) {
        document.dispatchEvent(new Event('placechange'));
        apply();
      }
    });
  }

  async function apply() {
    const lang = PlaceContext.language();
    const place = PlaceContext.get();
    const bulgaria = place.isDefault || place.countryCode === 'BG';
    const zone = bulgaria ? 'Europe/Sofia' : await PlaceContext.timeZone(place);
    monthPage(lang, zone, bulgaria);
    yearPage(lang, zone, bulgaria);
    buildBar(lang, place, zone);
  }

  PlaceContext.destinations().then(all => { places = all; apply(); });
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') apply(); });
})();
