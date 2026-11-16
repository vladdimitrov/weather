// The mountain passes (Bulgarian only, pages written by .github/scripts/build-extra.js from
// bg-passes.js). Forecast of Open-Meteo for the height of the road (elevation=), in hours.
//   /prohodi/<slug>/  #passForecast (data-lat, data-lon, data-elevation, data-warn): the verdict for
//                     the next 48 hours, every 3 hours for 48 hours, 7 days, official warnings of NIMH
//   /prohodi/         table.pass-table, one row per pass: now, new snow and gusts in 24 hours, verdict;
//                     the passes with the worst conditions first
// What counts as a hazard on the road, per hour:
//   snow   snowfall of 0.2 cm or more
//   ice    0 to -4° (and up to +1°) with rain or snow in the last 6 hours, or freezing rain or drizzle
//   wind   gusts of 60 km/h or more (90 and more: severe)
//   fog    visibility under 300 m
// The verdict: "Трудни условия" with 10 cm of new snow, gusts of 90 km/h or freezing rain within the
// 48 hours, "Внимание" with any hazard, else "Нормални условия".
(function () {
  const API = 'https://api.open-meteo.com/v1/forecast';
  const TZ = 'Europe/Sofia';
  const HOURLY = 'temperature_2m,precipitation,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,visibility';
  const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_gusts_10m_max';
  const FREEZING = [56, 57, 66, 67];
  const LEVEL = [
    { text: 'Нормални условия', cls: 'pass-ok' },
    { text: 'Внимание', cls: 'pass-warn' },
    { text: 'Трудни условия', cls: 'pass-bad' }
  ];
  const NAMES = { snow: 'сняг', ice: 'поледица', wind: 'силен вятър', fog: 'мъгла' };

  const deg = v => `${Math.round(v) < 0 ? '−' : ''}${Math.abs(Math.round(v))}°`;
  const hour = unix => new Date(unix * 1000).toLocaleTimeString('bg-BG', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
  const dayKey = unix => new Date(unix * 1000).toLocaleDateString('en-CA', { timeZone: TZ });
  const dayName = unix => new Date(unix * 1000).toLocaleDateString('bg-BG', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'numeric' });
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // Hazards of each hour from index `from` on: [{ time, kinds: Set, gust, snow }]
  function hazards(h, from, count) {
    const out = [];
    for (let i = from; i < Math.min(from + count, h.time.length); i++) {
      const kinds = new Set();
      const temp = h.temperature_2m[i];
      let wet = 0;
      for (let j = Math.max(0, i - 6); j <= i; j++) wet += h.precipitation[j] || 0;
      if ((h.snowfall[i] || 0) >= 0.2) kinds.add('snow');
      if (FREEZING.includes(h.weather_code[i]) || (temp <= 1 && temp >= -4 && wet >= 0.2)) kinds.add('ice');
      if ((h.wind_gusts_10m[i] || 0) >= 60) kinds.add('wind');
      if (typeof h.visibility[i] === 'number' && h.visibility[i] < 300) kinds.add('fog');
      out.push({ time: h.time[i], kinds, gust: h.wind_gusts_10m[i] || 0, snow: h.snowfall[i] || 0, freezing: FREEZING.includes(h.weather_code[i]) });
    }
    return out;
  }

  // { level, text } for the hours: "Внимание – сняг и поледица след 18:00"
  function verdict(hours) {
    const snow = hours.reduce((sum, x) => sum + x.snow, 0);
    const gust = Math.max(0, ...hours.map(x => x.gust));
    const bad = hours.filter(x => x.kinds.size);
    if (!bad.length) return { level: 0, text: LEVEL[0].text, snow, gust };
    const level = snow >= 10 || gust >= 90 || hours.some(x => x.freezing) ? 2 : 1;
    const kinds = ['snow', 'ice', 'wind', 'fog'].filter(kind => bad.some(x => x.kinds.has(kind))).map(kind => NAMES[kind]);
    const list = kinds.length > 1 ? `${kinds.slice(0, -1).join(', ')} и ${kinds[kinds.length - 1]}` : kinds[0];
    const first = bad[0].time;
    const now = hours[0].time;
    const when = first === now ? 'още сега' : dayKey(first) === dayKey(now) ? `след ${hour(first)}` : `от ${dayName(first)} ${hour(first)}`;
    return { level, text: `${LEVEL[level].text} – ${list} ${when}`, snow, gust };
  }

  const nowIndex = h => {
    const now = Date.now() / 1000;
    const i = h.time.findIndex(t => t + 3600 > now);
    return i < 0 ? 0 : i;
  };

  // ---- One pass ----
  async function passPage(box) {
    const { lat, lon, elevation } = box.dataset;
    const url = `${API}?latitude=${lat}&longitude=${lon}&elevation=${elevation}&hourly=${HOURLY}&daily=${DAILY}&timezone=${encodeURIComponent(TZ)}&timeformat=unixtime&forecast_days=7`;
    let data;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.status);
      data = await response.json();
    } catch (e) {
      box.querySelector('.storm-loading').textContent = 'Прогнозата не може да се зареди в момента. Опитайте отново по-късно.';
      return;
    }
    const h = data.hourly;
    const start = nowIndex(h);
    const hours = hazards(h, start, 48);
    const v = verdict(hours);

    const head = el('p', `pass-verdict ${LEVEL[v.level].cls}`, v.text);
    const facts = el('p', 'storm-updated', `Следващите 48 часа: ${Math.round(v.snow) >= 1 ? `до ${Math.round(v.snow)} см нов сняг` : 'без нов сняг'}, пориви до ${Math.round(v.gust)} км/ч.`);

    // every 3 hours, 48 hours
    const table = el('table', 'kp-table region-table pass-hours');
    table.innerHTML = '<thead><tr><th>Час</th><th>Темп.</th><th>Валеж</th><th>Нов сняг</th><th>Вятър / пориви</th><th>Видимост</th><th>На пътя</th></tr></thead>';
    const body = el('tbody');
    let lastDay = null;
    hours.forEach((x, k) => {
      if (k % 3) return;
      const i = start + k;
      if (dayKey(x.time) !== lastDay) {
        lastDay = dayKey(x.time);
        const tr = el('tr', 'pass-day');
        const td = el('td', '', dayName(x.time));
        td.colSpan = 7;
        tr.appendChild(td);
        body.appendChild(tr);
      }
      const rain = h.precipitation[i] || 0;
      const vis = h.visibility[i];
      const cells = [
        hour(x.time), deg(h.temperature_2m[i]), rain >= 0.1 ? `${rain.toFixed(1)} мм` : '–',
        x.snow >= 0.1 ? `${x.snow.toFixed(1)} см` : '–',
        `${Math.round(h.wind_speed_10m[i])} / ${Math.round(x.gust)} км/ч`,
        typeof vis === 'number' ? (vis >= 10000 ? 'над 10 км' : vis >= 1000 ? `${(vis / 1000).toFixed(1)} км` : `${Math.round(vis / 10) * 10} м`) : '–',
        x.kinds.size ? ['snow', 'ice', 'wind', 'fog'].filter(kind => x.kinds.has(kind)).map(kind => NAMES[kind]).join(', ') : 'нормално'
      ];
      const tr = el('tr', x.kinds.size ? 'pass-hazard' : '');
      cells.forEach(text => tr.appendChild(el('td', '', text)));
      body.appendChild(tr);
    });
    table.appendChild(body);
    const hoursWrap = el('div', 'table-scroll');
    hoursWrap.appendChild(table);

    // 7 days
    const d = data.daily;
    const days = el('table', 'kp-table region-table');
    days.innerHTML = '<thead><tr><th>Ден</th><th>Макс. / мин.</th><th>Валеж</th><th>Нов сняг</th><th>Пориви до</th></tr></thead>';
    const daysBody = el('tbody');
    d.time.forEach((t, i) => {
      const tr = el('tr');
      [dayName(t), `${deg(d.temperature_2m_max[i])} / ${deg(d.temperature_2m_min[i])}`,
        d.precipitation_sum[i] >= 0.1 ? `${d.precipitation_sum[i].toFixed(1)} мм` : '–',
        d.snowfall_sum[i] >= 0.1 ? `${d.snowfall_sum[i].toFixed(1)} см` : '–',
        `${Math.round(d.wind_gusts_10m_max[i])} км/ч`].forEach(text => tr.appendChild(el('td', '', text)));
      daysBody.appendChild(tr);
    });
    days.appendChild(daysBody);
    const daysWrap = el('div', 'table-scroll');
    daysWrap.appendChild(days);

    const now = box.querySelector('#passNow');
    now.replaceChildren(head, facts);
    box.querySelector('#passHours').replaceChildren(hoursWrap);
    box.querySelector('#passDays').replaceChildren(daysWrap);
    box.querySelectorAll('[hidden]').forEach(node => { node.hidden = false; });
    officialWarnings(box);
  }

  // Official warnings of NIMH for the provinces of the pass (data-warn="montana,sofia-province")
  async function officialWarnings(box) {
    const target = box.querySelector('#passOfficial');
    if (!target || !box.dataset.warn) return;
    try {
      const response = await fetch('/data/warnings-bg.json', { cache: 'no-store' });
      const data = response.ok ? await response.json() : {};
      const now = Date.now();
      const levels = { yellow: 'Жълт', orange: 'Оранжев', red: 'Червен' };
      const seen = new Set();
      const items = box.dataset.warn.split(',').flatMap(p => (data.provinces || {})[p] || [])
        .filter(w => new Date(w.expires).getTime() > now)
        .filter(w => { const key = `${w.level}${w.type}${w.onset}`; if (seen.has(key)) return false; seen.add(key); return true; })
        .map(w => el('p', `city-alert city-alert-${w.level}`, `${levels[w.level] || w.level} код на НИМХ: ${w.event.bg || w.event.en}, ${new Date(w.onset).toLocaleString('bg-BG', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit' })} – ${new Date(w.expires).toLocaleString('bg-BG', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit' })}`));
      target.replaceChildren(...items);
      target.hidden = !items.length;
    } catch (e) { /* the forecast is still shown */ }
  }

  // ---- All passes ----
  async function passTable(table) {
    const rows = [...table.tBodies[0].rows];
    const q = key => rows.map(row => row.dataset[key]).join(',');
    const url = `${API}?latitude=${q('lat')}&longitude=${q('lon')}&elevation=${q('elevation')}&hourly=${HOURLY}&timezone=${encodeURIComponent(TZ)}&timeformat=unixtime&forecast_days=3`;
    let data;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.status);
      data = await response.json();
    } catch (e) {
      const note = table.parentElement.querySelector('.region-nojs');
      if (note) note.textContent = 'Прогнозата не може да се зареди в момента. Опитайте отново по-късно.';
      return;
    }
    const answers = Array.isArray(data) ? data : [data];
    rows.forEach((row, n) => {
      const h = answers[n] && answers[n].hourly;
      if (!h) return;
      const start = nowIndex(h);
      const v = verdict(hazards(h, start, 48));
      const day = verdict(hazards(h, start, 24));
      const cells = [deg(h.temperature_2m[start]), day.snow >= 0.1 ? `${day.snow.toFixed(1)} см` : '–', `${Math.round(day.gust)} км/ч`];
      cells.forEach(text => row.appendChild(el('td', '', text)));
      const td = el('td', 'region-warn');
      td.appendChild(el('span', LEVEL[v.level].cls, v.text));
      row.appendChild(td);
      row.dataset.rank = v.level * 1000 + v.snow + v.gust / 100;
    });
    const body = table.tBodies[0];
    rows.map((row, i) => ({ row, i, rank: +row.dataset.rank || 0 }))
      .sort((a, b) => b.rank - a.rank || a.i - b.i)
      .forEach(item => body.appendChild(item.row));
    const note = table.parentElement.querySelector('.region-nojs');
    if (note) note.remove();
  }

  // For the home page (js/home-today.js)
  window.Passes = { API, TZ, HOURLY, hazards, verdict, nowIndex };

  const box = document.getElementById('passForecast');
  if (box) passPage(box);
  document.querySelectorAll('table.pass-table').forEach(passTable);
})();
