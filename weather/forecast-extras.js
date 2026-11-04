// Extra forecast information for the Weather page:
//   - 3-day geomagnetic (Kp) forecast from NOAA
//   - sunrise, sunset and moon phase for each day
//   - warning badges (storm, strong wind, heavy rain, snow, frost, heat)
//   - temperature chart above the hourly table
// Texts in 5 languages via pickText() (/js/language-selector.js).
window.ForecastExtras = (function () {
  const KP_FORECAST_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';

  const T = {
    kpForecastTitle: { en: 'Geomagnetic forecast', bg: 'Магнитни бури — прогноза', de: 'Magnetsturm-Prognose', it: 'Previsione tempeste magnetiche', es: 'Pronóstico de tormentas magnéticas' },
    today: { en: 'Today', bg: 'Днес', de: 'Heute', it: 'Oggi', es: 'Hoy' },
    tomorrow: { en: 'Tomorrow', bg: 'Утре', de: 'Morgen', it: 'Domani', es: 'Mañana' },
    calm: { en: 'calm', bg: 'спокойно', de: 'ruhig', it: 'calmo', es: 'tranquilo' },
    active: { en: 'active', bg: 'активно', de: 'aktiv', it: 'attivo', es: 'activo' },
    storm: { en: 'storm', bg: 'буря', de: 'Sturm', it: 'tempesta', es: 'tormenta' },
    sunrise: { en: 'Sunrise', bg: 'Изгрев', de: 'Sonnenaufgang', it: 'Alba', es: 'Amanecer' },
    sunset: { en: 'Sunset', bg: 'Залез', de: 'Sonnenuntergang', it: 'Tramonto', es: 'Atardecer' },
    chartTemperature: { en: 'Temperature (°C)', bg: 'Температура (°C)', de: 'Temperatur (°C)', it: 'Temperatura (°C)', es: 'Temperatura (°C)' },
    chartRainChance: { en: 'Chance of rain', bg: 'Вероятност за валеж', de: 'Regenwahrscheinlichkeit', it: 'Probabilità di pioggia', es: 'Probabilidad de lluvia' }
  };

  const moonPhases = [
    { icon: '🌑', name: { en: 'New moon', bg: 'Новолуние', de: 'Neumond', it: 'Luna nuova', es: 'Luna nueva' } },
    { icon: '🌒', name: { en: 'Waxing crescent', bg: 'Растящ сърп', de: 'Zunehmende Sichel', it: 'Falce crescente', es: 'Luna creciente' } },
    { icon: '🌓', name: { en: 'First quarter', bg: 'Първа четвърт', de: 'Erstes Viertel', it: 'Primo quarto', es: 'Cuarto creciente' } },
    { icon: '🌔', name: { en: 'Waxing gibbous', bg: 'Растяща луна', de: 'Zunehmender Mond', it: 'Gibbosa crescente', es: 'Gibosa creciente' } },
    { icon: '🌕', name: { en: 'Full moon', bg: 'Пълнолуние', de: 'Vollmond', it: 'Luna piena', es: 'Luna llena' } },
    { icon: '🌖', name: { en: 'Waning gibbous', bg: 'Намаляваща луна', de: 'Abnehmender Mond', it: 'Gibbosa calante', es: 'Gibosa menguante' } },
    { icon: '🌗', name: { en: 'Last quarter', bg: 'Последна четвърт', de: 'Letztes Viertel', it: 'Ultimo quarto', es: 'Cuarto menguante' } },
    { icon: '🌘', name: { en: 'Waning crescent', bg: 'Намаляващ сърп', de: 'Abnehmende Sichel', it: 'Falce calante', es: 'Luna menguante' } }
  ];

  const warningTexts = {
    thunder: { icon: '⛈️', text: { en: 'Thunderstorms', bg: 'Гръмотевици', de: 'Gewitter', it: 'Temporali', es: 'Tormentas' } },
    wind: { icon: '💨', text: { en: 'Strong wind', bg: 'Силен вятър', de: 'Starker Wind', it: 'Vento forte', es: 'Viento fuerte' } },
    rain: { icon: '🌧️', text: { en: 'Heavy rain', bg: 'Обилни валежи', de: 'Starkregen', it: 'Pioggia intensa', es: 'Lluvia intensa' } },
    snow: { icon: '❄️', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve' } },
    frost: { icon: '🧊', text: { en: 'Frost', bg: 'Слана', de: 'Frost', it: 'Gelate', es: 'Heladas' } },
    heat: { icon: '🔥', text: { en: 'Heat', bg: 'Жега', de: 'Hitze', it: 'Caldo intenso', es: 'Calor intenso' } }
  };

  const locales = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES' };

  function locale() {
    return locales[document.documentElement.lang] || 'en-GB';
  }

  function escapeAttribute(text) {
    return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  // ---- Moon phase (from the date, no request needed) ----
  // Days since a known new moon (2000-01-06 18:14 UTC), modulo the synodic month
  function moonPhase(isoDate) {
    const synodicMonth = 29.530588853;
    const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
    const noon = Date.parse(isoDate + 'T12:00:00Z');
    const age = (((noon - knownNewMoon) / 86400000) % synodicMonth + synodicMonth) % synodicMonth;
    return moonPhases[Math.round(age / synodicMonth * 8) % 8];
  }

  // HTML for the "Sun & Moon" cell of a forecast day
  function sunMoonCell(isoDate, sunrise, sunset) {
    const moon = moonPhase(isoDate);
    const time = value => (value || '').substring(11, 16);
    return `<span title="${escapeAttribute(pickText(T.sunrise))}">🌅 ${time(sunrise)}</span>` +
      ` <span title="${escapeAttribute(pickText(T.sunset))}">🌇 ${time(sunset)}</span>` +
      `<br><span class="moon-phase" title="${escapeAttribute(pickText(moon.name))}">${moon.icon} ${pickText(moon.name)}</span>`;
  }

  // ---- Warning badges for a forecast day ----
  function dayWarnings({ weatherCode, windMax, precipitation, tempMin, tempMax }) {
    const found = [];
    if (weatherCode >= 95) found.push('thunder');
    if (windMax >= 50) found.push('wind');
    if (precipitation >= 20) found.push('rain');
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) found.push('snow');
    if (tempMin <= 0) found.push('frost');
    if (tempMax >= 35) found.push('heat');
    return found.map(key => {
      const warning = warningTexts[key];
      return `<span class="wx-warning wx-${key}">${warning.icon} ${pickText(warning.text)}</span>`;
    }).join('');
  }

  // ---- 3-day Kp forecast ----
  let kpDays = null;

  function kpStatus(kp) {
    return kp >= 7 ? T.storm : kp >= 5 ? T.active : T.calm;
  }

  function kpScale(kp) {
    let segments = '';
    for (let i = 0; i < 10; i++) segments += `<span class="${i <= Math.round(kp) ? 'on' : ''}"></span>`;
    return `<span class="kp-scale" role="img" aria-label="Kp ${kp} / 9">${segments}</span>`;
  }

  function renderKpForecast() {
    const container = document.getElementById('kpForecast');
    if (!container || !kpDays) return;
    const dayFormat = new Intl.DateTimeFormat(locale(), { weekday: 'long', timeZone: 'UTC' });
    const days = kpDays.map((day, index) => {
      const label = index === 0 ? pickText(T.today) : index === 1 ? pickText(T.tomorrow) : dayFormat.format(new Date(day.date + 'T12:00:00Z'));
      const scale = day.scale ? ` <span class="kp-g-scale">${day.scale}</span>` : '';
      return `<div class="kp-day"><div class="kp-day-name">${label}</div>` +
        `<div>Kp ${day.kp}${kpScale(day.kp)}</div>` +
        `<div class="kp-day-status">${pickText(kpStatus(day.kp))}${scale}</div></div>`;
    }).join('');
    container.innerHTML = `<h3>${pickText(T.kpForecastTitle)}</h3><div class="kp-days">${days}</div>`;
    container.hidden = false;
  }

  async function loadKpForecast() {
    const anchor = document.querySelector('.info-display');
    if (!anchor || document.getElementById('kpForecast')) return;
    const container = document.createElement('div');
    container.id = 'kpForecast';
    container.className = 'kp-forecast';
    container.hidden = true;
    anchor.insertAdjacentElement('afterend', container);

    try {
      const response = await fetch(KP_FORECAST_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const today = new Date().toISOString().slice(0, 10);
      // Highest Kp per day (3-hour values: observed, estimated and predicted)
      const byDay = new Map();
      data.forEach(entry => {
        const date = String(entry.time_tag).slice(0, 10);
        const kp = parseFloat(entry.kp);
        if (date < today || isNaN(kp)) return;
        const day = byDay.get(date) || { date, kp: 0, scale: null };
        if (kp >= day.kp) {
          day.kp = kp;
          if (entry.noaa_scale) day.scale = entry.noaa_scale;
        }
        byDay.set(date, day);
      });
      kpDays = [...byDay.values()].slice(0, 3).map(day => ({ ...day, kp: Math.round(day.kp * 10) / 10 }));
      renderKpForecast();
    } catch (err) {
      // The block stays hidden; the rest of the page works without it
      console.error('Error loading Kp forecast:', err);
    }
  }

  // ---- Hourly temperature chart ----
  let chartPoints = null;

  function renderHourlyChart(points) {
    if (points) chartPoints = points;
    const block = document.getElementById('hourlyTableBlock');
    if (!block || !chartPoints || chartPoints.length < 2) return;

    let chart = document.getElementById('hourlyChart');
    if (!chart) {
      chart = document.createElement('div');
      chart.id = 'hourlyChart';
      chart.className = 'hourly-chart';
      const heading = block.querySelector('h2');
      (heading || block.firstChild).insertAdjacentElement(heading ? 'afterend' : 'beforebegin', chart);
    }

    const width = 720, height = 220;
    const pad = { left: 36, right: 12, top: 18, bottom: 28 };
    const temps = chartPoints.map(p => p.temperature);
    let min = Math.floor(Math.min(...temps)) - 1;
    let max = Math.ceil(Math.max(...temps)) + 1;
    if (max - min < 4) { min -= 2; max += 2; }
    const x = i => pad.left + i * (width - pad.left - pad.right) / (chartPoints.length - 1);
    const y = t => pad.top + (max - t) * (height - pad.top - pad.bottom) / (max - min);
    const barWidth = Math.max(2, (width - pad.left - pad.right) / chartPoints.length * 0.6);
    const plotHeight = height - pad.top - pad.bottom;

    const bars = chartPoints.map((p, i) => {
      const h = (p.rainChance || 0) / 100 * plotHeight;
      return h > 0 ? `<rect x="${(x(i) - barWidth / 2).toFixed(1)}" y="${(height - pad.bottom - h).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${h.toFixed(1)}" class="chart-rain"><title>${p.time} · ${p.rainChance}%</title></rect>` : '';
    }).join('');
    const line = chartPoints.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.temperature).toFixed(1)}`).join(' ');
    const dots = chartPoints.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.temperature).toFixed(1)}" r="3" class="chart-dot"><title>${p.time} · ${p.temperature}°</title></circle>`).join('');
    const step = Math.max(1, Math.ceil(chartPoints.length / 8));
    const xLabels = chartPoints.map((p, i) => i % step === 0 ? `<text x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle">${p.time}</text>` : '').join('');
    const yTicks = [min, Math.round((min + max) / 2), max].map(t => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="chart-grid"/><text x="${pad.left - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${t}°</text>`).join('');

    chart.innerHTML =
      `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(pickText(T.chartTemperature))}">${yTicks}${bars}<path d="${line}" class="chart-line"/>${dots}${xLabels}</svg>` +
      `<div class="chart-legend"><span class="legend-line"></span>${pickText(T.chartTemperature)}` +
      `<span class="legend-rain"></span>${pickText(T.chartRainChance)}</div>`;
  }

  // Re-render the texts when the language changes
  function onLanguageChange() {
    renderKpForecast();
    renderHourlyChart();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadKpForecast();
    const languageSelect = document.getElementById('language');
    if (languageSelect) languageSelect.addEventListener('change', onLanguageChange);
  });

  return { sunMoonCell, dayWarnings, renderHourlyChart };
})();
