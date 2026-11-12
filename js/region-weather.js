// Regional pages (/vremeto/chernomorie/, /vremeto/morska-voda/, /vremeto/snyag-kurorti/,
// /vremeto/zhegi/, /vremeto/parvi-snyag/, written by build-extra.js): fills every
// table.region-table with live data from Open-Meteo, one request per table.
// The rows are in the HTML (name, link, data-lat, data-lon, data-elevation); data-mode says what to show:
//   days       max / min temperature and chance of rain for 7 days
//   heat       max temperature for 7 days, days of 33°C and more marked
//   sea        sea surface temperature now and the highest waves today (marine API)
//   snow       snow depth now, new snow in 7 days, lowest / highest temperature (at data-elevation)
//   firstsnow  the first day with 1 cm of new snow or more in 16 days, and the total
(function () {
  const FORECAST = 'https://api.open-meteo.com/v1/forecast';
  const MARINE = 'https://marine-api.open-meteo.com/v1/marine';
  const T = {
    bg: { today: 'Днес', none: 'не се очаква', error: 'Данните не могат да се заредят. Опитайте отново по-късно.', cm: 'см', m: 'м', locale: 'bg-BG' },
    en: { today: 'Today', none: 'not expected', error: 'The data could not be loaded. Please try again later.', cm: 'cm', m: 'm', locale: 'en-GB' }
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
    if (mode === 'firstsnow') return `${FORECAST}?${where}&daily=snowfall_sum&forecast_days=16`;
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
      } else if (mode === 'firstsnow') {
        const snow = daily.snowfall_sum || [];
        const first = snow.findIndex(v => v >= 1);
        const total = snow.reduce((sum, v) => sum + (v || 0), 0);
        cell(row, first >= 0 ? new Date(daily.time[first] + 'T12:00:00Z').toLocaleDateString(text.locale, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'long' }) : text.none, first >= 0 ? 'region-snow' : '');
        cell(row, `${Math.round(total)} ${text.cm}`);
      }
    });
    const note = table.parentElement.querySelector('.region-nojs');
    if (note) note.remove();
  }

  async function fill(table) {
    const rows = [...table.tBodies[0].rows];
    if (!rows.length) return;
    try {
      const response = await fetch(request(table, rows));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      render(table, rows, Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Regional table:', error);
      const note = table.parentElement.querySelector('.region-nojs');
      if (note) note.textContent = t().error;
    }
  }

  document.querySelectorAll('table.region-table').forEach(fill);
})();
