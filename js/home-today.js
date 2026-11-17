// Home page, "all sections" tiles: a live line under some of them, computed in the browser.
//   [data-today="moon"]     phase and illumination of the Moon (js/moon.js, no network)
//   [data-today="kp"]       the Kp index now (NOAA, 1-minute estimate)
//   [data-today="tomorrow"] tomorrow's high and low in Sofia (Open-Meteo), Bulgarian page only
//   [data-today="uv"]       today's highest UV index in Sofia (Open-Meteo), Bulgarian page only
// A failed request leaves the line empty; the tile is a plain link either way.
(function () {
  const lang = document.documentElement.lang || 'bg';
  const set = (name, text) => { if (text) document.querySelectorAll(`[data-today="${name}"]`).forEach(node => { node.textContent = text; }); };
  const deg = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(Math.round(value))}°`;

  if (typeof Moon !== 'undefined') {
    const state = Moon.state(new Date());
    const names = Moon.NAMES[lang] || Moon.NAMES.en;
    set('moon', `${names[state.index]} · ${Math.round(state.fraction * 100)}%`);
  }

  const KP = { bg: 'Kp сега', en: 'Kp now', de: 'Kp aktuell', it: 'Kp ora', es: 'Kp ahora', fr: 'Kp actuel', nl: 'Kp nu' };
  const level = kp => (kp >= 5 ? { bg: 'буря', en: 'storm', de: 'Sturm', it: 'tempesta', es: 'tormenta', fr: 'tempête', nl: 'storm' }
    : { bg: 'спокойно', en: 'calm', de: 'ruhig', it: 'calmo', es: 'calma', fr: 'calme', nl: 'rustig' })[lang] || '';
  // The same NOAA file as the weather card above and the storm page: the estimated Kp of the last minutes
  // (the forecast file marks hours ahead as "estimated" too, so its last value is not "now")
  fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(list => {
      const last = list[list.length - 1];
      const kp = last ? parseFloat(last.estimated_kp ?? last.kp_index) : NaN;
      if (isNaN(kp)) return;
      set('kp', `${KP[lang] || KP.en} ${kp.toFixed(1).replace('.', lang === 'en' ? '.' : ',')} · ${level(kp)}`);
      document.querySelectorAll('.tc-value[data-today="kp"]').forEach(node => { node.dataset.level = kp >= 5 ? 2 : 0; });
    })
    .catch(() => { /* leave empty */ });

  if (lang === 'bg') {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.6977&longitude=23.3219&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Europe%2FSofia&forecast_days=2')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        const d = data.daily;
        set('tomorrow', `София ${deg(d.temperature_2m_min[1])} / ${deg(d.temperature_2m_max[1])}`);
        set('uv', `София днес: ${String(Math.round(d.uv_index_max[0] * 10) / 10).replace('.', ',')}`);
      })
      .catch(() => { /* leave empty */ });
  }

  // ---- "Today in Bulgaria" strip (Bulgarian home page): the worst pass, the worst air, the official warnings ----
  const strip = document.getElementById('todayStrip');
  if (!strip) return;
  // level 0 calm, 1 attention, 2 bad: the colour of the value
  const chip = (name, text, level) => {
    const node = strip.querySelector(`[data-chip="${name}"]`);
    if (!node || !text) return;
    node.textContent = text;
    node.dataset.level = level;
  };
  // The Moon: phase now and the date of the next full Moon (js/moon.js, no network)
  if (typeof Moon !== 'undefined') {
    const state = Moon.state(new Date());
    const full = Moon.nextPhase(new Date(), 2);
    const date = full instanceof Date && !isNaN(full) ? full.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' }) : '';
    chip('moon', `${Moon.NAMES.bg[state.index]} · ${Math.round(state.fraction * 100)}%${date ? `, пълнолуние на ${date}` : ''}`, 0);
  }
  const json = url => fetch(url).then(r => (r.ok ? r.json() : Promise.reject()));

  // Official warnings of NIMH by province (data/warnings-bg.json, refreshed every 30 minutes)
  json('/data/warnings-bg.json').then(data => {
    const lists = Object.values(data.provinces || {}).filter(list => list.length);
    if (!lists.length) return chip('warn', 'няма код на НИМХ', 0);
    const rank = { yellow: 1, orange: 2, red: 3 };
    const top = Math.max(...lists.flat().map(item => rank[item.level] || 1));
    const name = ['', 'жълт', 'оранжев', 'червен'][top];
    chip('warn', `${name} код в ${lists.length} ${lists.length === 1 ? 'област' : 'области'}`, top > 1 ? 2 : 1);
  }).catch(() => {});

  // The worst pass of the next 24 hours (the same rules as /prohodi/, js/passes.js)
  if (window.Passes) {
    json('/data/passes.json').then(passes => {
      const q = key => passes.map(pass => pass[key]).join(',');
      return json(`${Passes.API}?latitude=${q('lat')}&longitude=${q('lon')}&elevation=${q('elevation')}&hourly=${Passes.HOURLY}&timezone=${encodeURIComponent(Passes.TZ)}&timeformat=unixtime&forecast_days=2`)
        .then(data => {
          const answers = Array.isArray(data) ? data : [data];
          const rated = passes.map((pass, n) => {
            const h = answers[n] && answers[n].hourly;
            if (!h) return null;
            const v = Passes.verdict(Passes.hazards(h, Passes.nowIndex(h), 24));
            return { pass, v, rank: v.level * 1000 + v.snow + v.gust / 100 };
          }).filter(Boolean).sort((a, b) => b.rank - a.rank);
          if (!rated.length) return;
          const worst = rated[0];
          if (!worst.v.level) return chip('pass', 'нормални условия навсякъде', 0);
          const affected = rated.filter(item => item.v.level).length;
          // "Внимание – силен вятър след 17:00" -> "Петрохан: силен вятър след 17:00 (+3 други)"
          const what = worst.v.text.replace(/^[^–]*–\s*/, '');
          chip('pass', `${worst.pass.name.replace(/\s*\(.*\)$/, '')}: ${what}${affected > 1 ? ` (+${affected - 1})` : ''}`, worst.v.level);
        });
    }).catch(() => {});
  }

  // The worst air right now among the largest cities (CAMS model, as on /vremeto/kachestvo-na-vazduha/)
  const CITIES = [['София', 42.6977, 23.3219], ['Пловдив', 42.1354, 24.7453], ['Варна', 43.2141, 27.9147], ['Бургас', 42.5048, 27.4626],
    ['Русе', 43.8356, 25.9657], ['Стара Загора', 42.4258, 25.6345], ['Плевен', 43.417, 24.6067], ['Перник', 42.6052, 23.0378],
    ['Видин', 43.9962, 22.8679], ['Благоевград', 42.0209, 23.0943]];
  const AIR = [[20, 'добро', 0], [40, 'задоволително', 0], [60, 'умерено', 1], [80, 'лошо', 2], [100, 'много лошо', 2], [Infinity, 'изключително лошо', 2]];
  json(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${CITIES.map(c => c[1]).join(',')}&longitude=${CITIES.map(c => c[2]).join(',')}&current=european_aqi`)
    .then(data => {
      const worst = (Array.isArray(data) ? data : [data])
        .map((answer, n) => ({ name: CITIES[n][0], aqi: answer.current && answer.current.european_aqi }))
        .filter(item => typeof item.aqi === 'number').sort((a, b) => b.aqi - a.aqi)[0];
      if (!worst) return;
      const [, text, level] = AIR.find(step => worst.aqi <= step[0]);
      chip('air', `${worst.name}: ${text} (${Math.round(worst.aqi)})`, level);
    }).catch(() => {});
  // The same answer for 30 minutes within a visit, so a reload does not ask Open-Meteo for eight places again
  const cached = (key, url) => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('wp-' + key) || 'null');
      if (saved && Date.now() - saved.time < 30 * 60 * 1000) return Promise.resolve(saved.data);
    } catch (e) { /* no storage: just fetch */ }
    return json(url).then(data => {
      try { sessionStorage.setItem('wp-' + key, JSON.stringify({ time: Date.now(), data })); } catch (e) { /* full or blocked */ }
      return data;
    });
  };
  // Ski resorts: the deepest snow on the slopes now (model, as on /vremeto/snyag-kurorti/) and the new snow of the next 3 days
  const SKI = [['Банско', 41.8050, 23.4330, 1700], ['Боровец', 42.2420, 23.5750, 1750], ['Пампорово', 41.6450, 24.6800, 1800], ['Витоша', 42.5860, 23.2910, 1800],
    ['Чепеларе', 41.7050, 24.6450, 1700], ['Добринище', 41.8120, 23.5050, 1800], ['Мальовица', 42.1960, 23.3800, 1750], ['Узана', 42.7560, 25.2330, 1300]];
  cached('ski', `https://api.open-meteo.com/v1/forecast?latitude=${SKI.map(r => r[1]).join(',')}&longitude=${SKI.map(r => r[2]).join(',')}&elevation=${SKI.map(r => r[3]).join(',')}&hourly=snow_depth,snowfall&forecast_days=3&timeformat=unixtime`)
    .then(data => {
      const rated = (Array.isArray(data) ? data : [data]).map((answer, n) => {
        const h = answer.hourly;
        if (!h) return null;
        const at = h.time.findIndex(time => time * 1000 <= Date.now() && Date.now() < (time + 3600) * 1000);
        if (at < 0) return null;
        const fresh = h.snowfall.slice(at + 1, at + 73).reduce((sum, v) => sum + (v || 0), 0);
        return { name: SKI[n][0], depth: Math.round((h.snow_depth[at] || 0) * 100), fresh };
      }).filter(Boolean);
      if (!rated.length) return;
      const best = rated.reduce((a, b) => (b.depth > a.depth || (b.depth === a.depth && b.fresh > a.fresh) ? b : a));
      if (best.depth < 1) {
        const soon = rated.reduce((a, b) => (b.fresh > a.fresh ? b : a));
        return chip('ski', soon.fresh >= 3 ? `${soon.name}: до ${Math.round(soon.fresh)} см нов сняг до 3 дни` : 'още няма сняг по пистите', soon.fresh >= 3 ? 1 : 0);
      }
      chip('ski', `${best.name}: ${best.depth} см${best.fresh >= 3 ? `, до 3 дни още +${Math.round(best.fresh)} см` : ''}`, 0);
    }).catch(() => {});
})();
