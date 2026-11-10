// Extra forecast information for the Weather page:
//   - sunrise, sunset and moon phase for each day
//   - warning badges (storm, strong wind, heavy rain, snow, frost, heat)
//   - temperature chart above the hourly table
// Texts in 5 languages via pickText() (/js/language-selector.js).
window.ForecastExtras = (function () {
  const T = {
    sunrise: { en: 'Sunrise', bg: 'Изгрев', de: 'Sonnenaufgang', it: 'Alba', es: 'Amanecer' },
    sunset: { en: 'Sunset', bg: 'Залез', de: 'Sonnenuntergang', it: 'Tramonto', es: 'Atardecer' },
    chartTemperature: { en: 'Temperature (°C)', bg: 'Температура (°C)', de: 'Temperatur (°C)', it: 'Temperatura (°C)', es: 'Temperatura (°C)' },
    chartRainChance: { en: 'Chance of rain', bg: 'Вероятност за валеж', de: 'Regenwahrscheinlichkeit', it: 'Probabilità di pioggia', es: 'Probabilidad de lluvia' }
  };

  const moonPhases = [
    { key: 'moonNew', icon: '🌑', name: { en: 'New moon', bg: 'Новолуние', de: 'Neumond', it: 'Luna nuova', es: 'Luna nueva' } },
    { key: 'moonWaxCrescent', icon: '🌒', name: { en: 'Waxing crescent', bg: 'Растящ полумесец', de: 'Zunehmende Sichel', it: 'Falce crescente', es: 'Luna creciente' } },
    { key: 'moonFirstQ', icon: '🌓', name: { en: 'First quarter', bg: 'Първа четвърт', de: 'Erstes Viertel', it: 'Primo quarto', es: 'Cuarto creciente' } },
    { key: 'moonWaxGibbous', icon: '🌔', name: { en: 'Waxing gibbous', bg: 'Растяща луна', de: 'Zunehmender Mond', it: 'Gibbosa crescente', es: 'Gibosa creciente' } },
    { key: 'moonFull', icon: '🌕', name: { en: 'Full moon', bg: 'Пълнолуние', de: 'Vollmond', it: 'Luna piena', es: 'Luna llena' } },
    { key: 'moonWaneGibbous', icon: '🌖', name: { en: 'Waning gibbous', bg: 'Намаляваща луна', de: 'Abnehmender Mond', it: 'Gibbosa calante', es: 'Gibosa menguante' } },
    { key: 'moonLastQ', icon: '🌗', name: { en: 'Last quarter', bg: 'Последна четвърт', de: 'Letztes Viertel', it: 'Ultimo quarto', es: 'Cuarto menguante' } },
    { key: 'moonWaneCrescent', icon: '🌘', name: { en: 'Waning crescent', bg: 'Намаляващ полумесец', de: 'Abnehmende Sichel', it: 'Falce calante', es: 'Luna menguante' } }
  ];

  const warningTexts = {
    thunder: { icon: '⛈️', text: { en: 'Thunderstorms', bg: 'Гръмотевици', de: 'Gewitter', it: 'Temporali', es: 'Tormentas' } },
    wind: { icon: '💨', text: { en: 'Strong wind', bg: 'Силен вятър', de: 'Starker Wind', it: 'Vento forte', es: 'Viento fuerte' } },
    rain: { icon: '🌧️', text: { en: 'Heavy rain', bg: 'Обилни валежи', de: 'Starkregen', it: 'Pioggia intensa', es: 'Lluvia intensa' } },
    snow: { icon: '❄️', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve' } },
    frost: { icon: '🧊', text: { en: 'Frost', bg: 'Слана', de: 'Frost', it: 'Gelate', es: 'Heladas' } },
    heat: { icon: '🔥', text: { en: 'Heat', bg: 'Жега', de: 'Hitze', it: 'Caldo intenso', es: 'Calor intenso' } },
    fog: { icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла', de: 'Nebel', it: 'Nebbia', es: 'Niebla' } },
    drizzle: { icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмене', de: 'Nieselregen', it: 'Pioggerella', es: 'Llovizna' } }
  };

  // Weather codes (WMO, as used by Open-Meteo)
  const FOG_CODES = [45, 48];
  const DRIZZLE_CODES = [51, 53, 55, 56, 57];
  const SNOW_CODES = [71, 73, 75, 77, 85, 86];
  const THUNDER_CODES = [95, 96, 99];

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
    // Medallion icons (weather-icons.js); the emoji is the fallback
    const icon = (key, emoji, title) => window.WeatherIcons ? WeatherIcons.medal(key, escapeAttribute(title), 'md') : emoji;
    return `<span class="sm-time" title="${escapeAttribute(pickText(T.sunrise))}">${icon('sunrise', '🌅', pickText(T.sunrise))} ${time(sunrise)}</span>` +
      ` <span class="sm-time" title="${escapeAttribute(pickText(T.sunset))}">${icon('sunset', '🌇', pickText(T.sunset))} ${time(sunset)}</span>` +
      `<br><span class="moon-phase" title="${escapeAttribute(pickText(moon.name))}">${icon(moon.key, moon.icon, pickText(moon.name))} ${pickText(moon.name)}</span>`;
  }

  // ---- Warning badges for a forecast day ----
  function badgesFor(keys) {
    return keys.map(key => {
      const warning = warningTexts[key];
      const icon = window.WeatherIcons ? WeatherIcons.medal(key, '', 'sm') : warning.icon;
      return `<span class="wx-warning wx-${key}">${icon} ${pickText(warning.text)}</span>`;
    }).join('');
  }

  // Shown in the "Forecast" column of the daily table
  function dayWarnings({ weatherCode, windMax, precipitation, tempMin, tempMax }) {
    const found = [];
    if (THUNDER_CODES.includes(weatherCode)) found.push('thunder');
    if (FOG_CODES.includes(weatherCode)) found.push('fog');
    if (windMax >= 50) found.push('wind');
    if (precipitation >= 20) found.push('rain');
    if (SNOW_CODES.includes(weatherCode)) found.push('snow');
    if (tempMin <= 0) found.push('frost');
    if (tempMax >= 35) found.push('heat');
    return badgesFor(found);
  }

  // Phenomena of one hour, shown in the "Forecast" column of the hourly table.
  // Frost is taken as a temperature at or below 0 °C without precipitation.
  function hourWarnings({ weatherCode, windspeed, precipitation, temperature }) {
    const found = [];
    if (THUNDER_CODES.includes(weatherCode)) found.push('thunder');
    if (FOG_CODES.includes(weatherCode)) found.push('fog');
    if (DRIZZLE_CODES.includes(weatherCode)) found.push('drizzle');
    if (SNOW_CODES.includes(weatherCode)) found.push('snow');
    if (temperature <= 0 && !(precipitation > 0)) found.push('frost');
    if (windspeed >= 50) found.push('wind');
    if (temperature >= 35) found.push('heat');
    const badges = badgesFor(found);
    return badges ? `<div class="wx-warnings">${badges}</div>` : '';
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
    // The temperature at each point, alternately above and below it so neighbouring numbers
    // do not touch. With many points (15-minute steps) only about 24 are written.
    const valueStep = Math.max(1, Math.ceil(chartPoints.length / 24));
    let labelled = 0;
    const values = chartPoints.map((p, i) => {
      if (i % valueStep !== 0) return '';
      const above = labelled++ % 2 === 0;
      const py = y(p.temperature);
      const ty = above ? Math.max(11, py - 8) : Math.min(height - pad.bottom - 3, py + 17);
      return `<text x="${x(i).toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" style="fill:#ffd700;font-size:11px;font-weight:700;paint-order:stroke;stroke:rgba(10,25,60,0.85);stroke-width:3px;stroke-linejoin:round">${Math.round(p.temperature)}°</text>`;
    }).join('');
    const step = Math.max(1, Math.ceil(chartPoints.length / 8));
    const xLabels = chartPoints.map((p, i) => i % step === 0 ? `<text x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle">${p.time}</text>` : '').join('');
    const yTicks = [min, Math.round((min + max) / 2), max].map(t => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="chart-grid"/><text x="${pad.left - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${t}°</text>`).join('');

    chart.innerHTML =
      `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(pickText(T.chartTemperature))}">${yTicks}${bars}<path d="${line}" class="chart-line"/>${dots}${values}${xLabels}</svg>` +
      `<div class="chart-legend"><span class="legend-line"></span>${pickText(T.chartTemperature)}` +
      `<span class="legend-rain"></span>${pickText(T.chartRainChance)}</div>`;
  }

  // ---- Local time of the selected place, kept current ----
  let clockZone = null;
  let clockTimer = null;

  function renderClock() {
    const element = document.getElementById('local-time');
    if (!element || !clockZone) return;
    let text;
    try {
      text = new Date().toLocaleString(locale(), { timeZone: clockZone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return; // unknown time zone
    }
    element.textContent = `${_t('localTime')}: ${text}`;
  }

  function startLocalClock(timeZone) {
    clockZone = timeZone;
    renderClock();
    clearInterval(clockTimer);
    clockTimer = setInterval(renderClock, 30000);
  }

  // Re-render the texts when the language changes
  function onLanguageChange() {
    renderClock();
    renderHourlyChart();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language');
    if (languageSelect) languageSelect.addEventListener('change', onLanguageChange);
  });

  return { sunMoonCell, dayWarnings, hourWarnings, renderHourlyChart, startLocalClock };
})();
