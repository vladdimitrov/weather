// Regional pages (/vremeto/chernomorie/, /vremeto/morska-voda/, /vremeto/snyag-kurorti/,
// /vremeto/zhegi/, /vremeto/parvi-snyag/, written by build-extra.js; the snow table of the ski resort
// city pages /vremeto/bansko/ ..., written by build-pages.js): fills every
// table.region-table with live data from Open-Meteo, one request per table.
// The rows are in the HTML (name, link, data-lat, data-lon, data-elevation); data-mode says what to show:
//   days       max / min temperature and chance of rain for 7 days
//   heat       max temperature for 7 days, days of 33°C and more marked
//   sea        sea surface temperature now and the highest waves today (marine API)
//   snow       snow depth now, new snow in 7 days, lowest / highest temperature (at data-elevation)
//   ski        the ski resorts hub (Bulgarian only): snow depth now, new snow in the last 24 h / next 3 and 7 days,
//              freezing level, gusts in 24 h and a one-word verdict; the resorts with the most new snow first
//   firstsnow  the first day with 1 cm of new snow or more in 16 days, and the total
//   air        the European Air Quality Index now (window.WeatherAir of js/city-forecast.js: levels,
//              colours, words), PM2.5, PM10 and the worst index of the next 48 hours; the places
//              with the worst air now first
//   warnings   the official warnings of NIMH for the province of the row (data-warn, from
//              /data/warnings-bg.json) and ours for today and tomorrow (window.WeatherHazards
//              of js/city-forecast.js, on the median of the models of js/forecast-core.js);
//              the rows with warnings are moved to the top and #warnSummary says how many
(function () {
  const FORECAST = 'https://api.open-meteo.com/v1/forecast';
  const MARINE = 'https://marine-api.open-meteo.com/v1/marine';
  const AIR_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const T = {
    bg: { today: 'Днес', none: 'не се очаква', error: 'Данните не могат да се заредят. Опитайте отново по-късно.', cm: 'см', m: 'м', locale: 'bg-BG' },
    en: { today: 'Today', none: 'not expected', error: 'The data could not be loaded. Please try again later.', cm: 'cm', m: 'm', locale: 'en-GB' },
    // the ski resort city pages (snow table) exist in every language
    de: { today: 'Heute', none: 'nicht erwartet', error: 'Die Daten konnten nicht geladen werden. Bitte später erneut versuchen.', cm: 'cm', m: 'm', locale: 'de-DE' },
    it: { today: 'Oggi', none: 'non previsto', error: 'Impossibile caricare i dati. Riprova più tardi.', cm: 'cm', m: 'm', locale: 'it-IT' },
    es: { today: 'Hoy', none: 'no se espera', error: 'No se pudieron cargar los datos. Inténtalo de nuevo más tarde.', cm: 'cm', m: 'm', locale: 'es-ES' },
    fr: { today: 'Aujourd’hui', none: 'non attendue', error: 'Impossible de charger les données. Réessayez plus tard.', cm: 'cm', m: 'm', locale: 'fr-FR' },
    ro: { today: 'Azi', none: 'nu se așteaptă', error: 'Datele nu au putut fi încărcate. Încercați din nou mai târziu.', cm: 'cm', m: 'm', locale: 'ro-RO' },
    nl: { today: 'Vandaag', none: 'niet verwacht', error: 'De gegevens konden niet worden geladen. Probeer het later opnieuw.', cm: 'cm', m: 'm', locale: 'nl-NL' }
  };
  const t = () => T[document.documentElement.lang] || T.en;
  const deg = v => (typeof v === 'number' ? `${Math.round(v) < 0 ? '−' : ''}${Math.abs(Math.round(v))}°` : '—');
  const cell = (row, text, className) => {
    const td = document.createElement('td');
    td.textContent = text;
    if (className) td.className = className;
    row.appendChild(td);
    return td;
  };
  const dayName = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString(t().locale, { timeZone: 'UTC', weekday: 'short', day: 'numeric' });

  // The value of an hourly series for the current hour of the place
  function now(data, key) {
    if (!data.hourly || !data.hourly[key]) return null;
    const local = new Date(Date.now() + (data.utc_offset_seconds || 0) * 1000).toISOString().slice(0, 13);
    const index = data.hourly.time.findIndex(time => time.slice(0, 13) === local);
    return index >= 0 ? data.hourly[key][index] : null;
  }

  function request(table, rows) {
    const mode = table.dataset.mode;
    const lat = rows.map(row => row.dataset.lat).join(',');
    const lon = rows.map(row => row.dataset.lon).join(',');
    const where = `latitude=${lat}&longitude=${lon}&timezone=auto`;
    if (mode === 'sea') return `${MARINE}?${where}&hourly=sea_surface_temperature&daily=wave_height_max&forecast_days=2`;
    if (mode === 'snow') {
      const elevation = rows.map(row => row.dataset.elevation || 'nan').join(',');
      return `${FORECAST}?${where}&elevation=${elevation}&hourly=snow_depth&daily=snowfall_sum,temperature_2m_max,temperature_2m_min&forecast_days=7`;
    }
    if (mode === 'ski') {
      const elevation = rows.map(row => row.dataset.elevation || 'nan').join(',');
      return `${FORECAST}?${where}&elevation=${elevation}&hourly=snow_depth,snowfall,freezing_level_height,wind_gusts_10m&past_days=1&forecast_days=7&timeformat=unixtime`;
    }
    if (mode === 'firstsnow') return `${FORECAST}?${where}&daily=snowfall_sum&forecast_days=16`;
    if (mode === 'air') return `${AIR_API}?${where}&current=european_aqi,pm2_5,pm10&hourly=european_aqi&forecast_days=3`;
    if (mode === 'warnings') {
      const models = window.ForecastCore ? `&models=${window.ForecastCore.MODELS.join(',')}` : '';
      return `${FORECAST}?${where}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_gusts_10m_max&forecast_days=2${models}`;
    }
    return `${FORECAST}?${where}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7`;
  }

  function render(table, rows, results) {
    const mode = table.dataset.mode;
    const text = t();
    const head = table.tHead.rows[0];
    if (mode === 'days' || mode === 'heat') {
      const dates = results[0].daily.time;
      dates.forEach((iso, i) => {
        const th = document.createElement('th');
        th.textContent = i === 0 ? text.today : dayName(iso);
        head.appendChild(th);
      });
    }
    rows.forEach((row, n) => {
      const data = results[n] || {};
      const daily = data.daily || {};
      [...row.cells].slice(1).forEach(td => td.remove());
      if (mode === 'days') {
        daily.time.forEach((iso, i) => {
          const rain = daily.precipitation_probability_max && daily.precipitation_probability_max[i];
          cell(row, `${deg(daily.temperature_2m_max[i])} / ${deg(daily.temperature_2m_min[i])}${typeof rain === 'number' ? ` · ${rain}%` : ''}`);
        });
      } else if (mode === 'heat') {
        daily.time.forEach((iso, i) => {
          const high = daily.temperature_2m_max[i];
          cell(row, deg(high), typeof high === 'number' && high >= 33 ? 'region-hot' : '');
        });
      } else if (mode === 'sea') {
        const sea = now(data, 'sea_surface_temperature');
        const wave = daily.wave_height_max && daily.wave_height_max[0];
        cell(row, typeof sea === 'number' ? `${sea.toFixed(1)}°C` : '—');
        cell(row, typeof wave === 'number' ? `${wave.toFixed(1)} ${text.m}` : '—');
      } else if (mode === 'snow') {
        const depth = now(data, 'snow_depth');
        const fresh = (daily.snowfall_sum || []).reduce((sum, v) => sum + (v || 0), 0);
        cell(row, typeof depth === 'number' ? `${Math.round(depth * 100)} ${text.cm}` : '—');
        cell(row, `${Math.round(fresh)} ${text.cm}`);
        cell(row, `${deg(Math.min(...(daily.temperature_2m_min || [NaN])))} / ${deg(Math.max(...(daily.temperature_2m_max || [NaN])))}`);
      } else if (mode === 'ski') {
        skiCells(row, data);
      } else if (mode === 'air') {
        airCells(row, data);
      } else if (mode === 'warnings') {
        warningCells(row, data, n);
      } else if (mode === 'firstsnow') {
        const snow = daily.snowfall_sum || [];
        const first = snow.findIndex(v => v >= 1);
        const total = snow.reduce((sum, v) => sum + (v || 0), 0);
        cell(row, first >= 0 ? new Date(daily.time[first] + 'T12:00:00Z').toLocaleDateString(text.locale, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'long' }) : text.none, first >= 0 ? 'region-snow' : '');
        cell(row, `${Math.round(total)} ${text.cm}`);
      }
    });
    if (mode === 'warnings') sortWarnings(table, rows);
    if (mode === 'air') sortAir(table, rows);
    if (mode === 'ski') sortSki(table, rows);
    const note = table.parentElement.querySelector('.region-nojs');
    if (note) note.remove();
  }


  // --- The ski resorts page (data-mode="ski", Bulgarian only) ---
  // Hourly series, unix times; "now" is the hour that contains the present moment
  function skiCells(row, data) {
    const h = data.hourly || {};
    const times = h.time || [];
    const at = times.findIndex(time => time * 1000 <= Date.now() && Date.now() < (time + 3600) * 1000);
    const sum = (from, to) => (h.snowfall || []).slice(Math.max(0, from), Math.max(0, to)).reduce((total, v) => total + (v || 0), 0);
    const depthNow = at >= 0 && typeof h.snow_depth[at] === 'number' ? Math.round(h.snow_depth[at] * 100) : null;
    const last24 = at >= 0 ? sum(at - 23, at + 1) : null;
    const next72 = at >= 0 ? sum(at + 1, at + 73) : null;
    const next7 = at >= 0 ? sum(at + 1, at + 169) : null;
    const level = at >= 0 ? h.freezing_level_height[at] : null;
    const gusts = at >= 0 ? (h.wind_gusts_10m || []).slice(at, at + 24).filter(v => typeof v === 'number') : [];
    const gust = gusts.length ? Math.round(Math.max(...gusts)) : null;
    const cm = v => (typeof v === 'number' ? `${Math.round(v)} см` : '—');
    cell(row, cm(depthNow), depthNow >= 30 ? 'region-snow' : '');
    cell(row, cm(last24));
    cell(row, cm(next72), next72 >= 10 ? 'region-snow' : '');
    cell(row, cm(next7), next7 >= 10 ? 'region-snow' : '');
    cell(row, typeof level === 'number' ? `${Math.round(level / 10) * 10} м` : '—');
    cell(row, gust === null ? '—' : `${gust} км/ч`, gust >= 70 ? 'region-hot' : '');
    let verdict = '—';
    if (depthNow !== null) {
      const base = depthNow >= 30 ? 'добра покривка' : depthNow >= 10 ? 'тънка покривка' : next72 >= 5 ? 'започва да натрупва' : 'още няма сняг';
      verdict = (gust >= 70 ? `${base}, силен вятър` : next72 >= 10 ? `${base}, идва нов сняг` : base);
    }
    cell(row, verdict);
    row.dataset.depth = depthNow === null ? -1 : depthNow;
    row.dataset.fresh = next7 === null ? -1 : next7;
    row.dataset.name = row.cells[0].textContent.replace(/\s*\d+\s*м\s*$/, '').replace(/\s*\(.*\)\s*/, ' ').trim();
  }

  function sortSki(table, rows) {
    const body = table.tBodies[0];
    rows.map((row, i) => ({ row, i }))
      .sort((a, b) => b.row.dataset.fresh - a.row.dataset.fresh || b.row.dataset.depth - a.row.dataset.depth || a.i - b.i)
      .forEach(item => body.appendChild(item.row));
    const summary = document.getElementById('skiSummary');
    if (!summary) return;
    const known = rows.filter(row => +row.dataset.depth >= 0);
    if (!known.length) return;
    const deepest = known.reduce((best, row) => (+row.dataset.depth > +best.dataset.depth ? row : best));
    const freshest = known.reduce((best, row) => (+row.dataset.fresh > +best.dataset.fresh ? row : best));
    if (+deepest.dataset.depth < 1 && +freshest.dataset.fresh < 1) {
      summary.textContent = 'По модела сега няма сняг по пистите и през следващите 7 дни не се очаква значителен.';
      return;
    }
    const first = +deepest.dataset.depth >= 1 ? `Най-дебела покривка по модела: ${deepest.dataset.name} (${deepest.dataset.depth} см). ` : '';
    const second = +freshest.dataset.fresh >= 1 ? `Най-много нов сняг до 7 дни: ${freshest.dataset.name} (${Math.round(freshest.dataset.fresh)} см).` : 'През следващите 7 дни не се очаква значителен нов сняг.';
    summary.textContent = first + second;
  }

  // --- The air quality page (data-mode="air") ---
  function airCells(row, data) {
    const AIR = window.WeatherAir;
    const now = data.current || {};
    const level = AIR ? AIR.level(now.european_aqi) : null;
    const A = AIR ? AIR.text[document.documentElement.lang] || AIR.text.bg : null;
    const badge = (value, lvl) => {
      const td = cell(row, '', 'region-warn');
      if (lvl === null) { td.textContent = '—'; return; }
      const span = document.createElement('span');
      span.textContent = `${A.levels[lvl]} (${Math.round(value)})`;
      span.style.background = AIR.colors[lvl];
      span.style.color = lvl >= 4 ? '#fff' : '#1a1a2e';
      td.appendChild(span);
    };
    badge(now.european_aqi, level);
    cell(row, typeof now.pm2_5 === 'number' ? `${Math.round(now.pm2_5)} µg/m³` : '—');
    cell(row, typeof now.pm10 === 'number' ? `${Math.round(now.pm10)} µg/m³` : '—');
    const hourly = data.hourly || {};
    const start = Math.max(0, (hourly.time || []).indexOf(now.time ? now.time.slice(0, 13) + ':00' : ''));
    const ahead = (hourly.european_aqi || []).slice(start, start + 48).filter(v => typeof v === 'number');
    const worst = ahead.length ? Math.max(...ahead) : null;
    badge(worst, AIR && worst !== null ? AIR.level(worst) : null);
    row.dataset.rank = typeof now.european_aqi === 'number' ? now.european_aqi : -1;
  }

  function sortAir(table, rows) {
    const body = table.tBodies[0];
    rows.map((row, i) => ({ row, i, rank: +row.dataset.rank }))
      .sort((a, b) => b.rank - a.rank || a.i - b.i)
      .forEach(item => body.appendChild(item.row));
  }

  // --- The warnings page (data-mode="warnings") ---
  const WARN = {
    bg: { none: 'няма', official: (level, event, from, to) => `${level} код: ${event}, ${from} – ${to}`, levels: { yellow: 'Жълт', orange: 'Оранжев', red: 'Червен' },
      summaryNone: 'В момента няма предупреждения за опасно време за днес и утре в тези места.',
      summary: (places, official) => `Предупреждения има за ${places} ${places === 1 ? 'място' : 'места'}${official ? `, от тях ${official} с официално предупреждение на НИМХ` : ''}. Те са най-отгоре в таблицата.` }
  };
  const warnText = () => WARN[document.documentElement.lang] || WARN.bg;
  const RANK = { red: 3, orange: 2, yellow: 1 };
  let officialWarnings = null; // { province: [warnings] }
  const officialReady = fetch('/data/warnings-bg.json', { cache: 'no-store' })
    .then(response => (response.ok ? response.json() : {}))
    .then(data => { officialWarnings = data.provinces || {}; })
    .catch(() => { officialWarnings = {}; });

  function warningCells(row, data) {
    const text = warnText();
    const now = Date.now();
    const official = ((officialWarnings || {})[row.dataset.warn] || []).filter(w => new Date(w.expires).getTime() > now);
    const time = iso => new Date(iso).toLocaleString(t().locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    // one series per model (temperature_2m_max_ecmwf_ifs ...) -> the median, as on the city pages
    const daily = data.daily && !data.daily.temperature_2m_max && window.ForecastCore ? window.ForecastCore.collapse(data).daily : data.daily;
    const ours = daily && window.WeatherHazards ? window.WeatherHazards.list(daily, document.documentElement.lang, official) : [];
    const fill = items => {
      const td = cell(row, '', 'region-warn');
      if (!items.length) { td.textContent = text.none; return; }
      items.forEach(item => {
        const span = document.createElement('span');
        span.className = `warn-${item.level}`;
        span.textContent = item.text;
        td.appendChild(span);
      });
    };
    fill(official.map(w => ({ level: w.level, text: text.official(text.levels[w.level] || w.level, w.event.bg || w.event.en, time(w.onset), time(w.expires)) })));
    fill(ours);
    row.dataset.rank = Math.max(0, ...official.map(w => (RANK[w.level] || 0) + 10), ...ours.map(h => RANK[h.level] || 0));
    row.dataset.official = official.length ? '1' : '';
  }

  function sortWarnings(table, rows) {
    const body = table.tBodies[0];
    rows.map((row, i) => ({ row, i, rank: +row.dataset.rank || 0 }))
      .sort((a, b) => b.rank - a.rank || a.i - b.i)
      .forEach(item => body.appendChild(item.row));
    const summary = document.getElementById('warnSummary');
    if (!summary) return;
    const places = rows.filter(row => +row.dataset.rank > 0).length;
    const official = rows.filter(row => row.dataset.official).length;
    summary.textContent = places ? warnText().summary(places, official) : warnText().summaryNone;
  }

  async function fill(table) {
    const rows = [...table.tBodies[0].rows];
    if (!rows.length) return;
    try {
      const response = await fetch(request(table, rows));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (table.dataset.mode === 'warnings') await officialReady;
      render(table, rows, Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Regional table:', error);
      const note = table.parentElement.querySelector('.region-nojs');
      if (note) note.textContent = t().error;
    }
  }

  document.querySelectorAll('table.region-table').forEach(fill);
})();
