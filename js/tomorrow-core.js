// Tomorrow's weather in the Bulgarian cities: the pure parts shared by the daily build
// (.github/scripts/build-tomorrow.js, which writes the table into /vremeto/utre/) and by the
// browser (/js/tomorrow.js, which refreshes it live). Open-Meteo, one model (best match).
//   Tomorrow.urls(cities)          → request URLs (20 places each)
//   Tomorrow.rows(cities, answers) → [{ slug, name, day, max, min, rain, wind, code }] for tomorrow
//   Tomorrow.describe(code)        → { icon, text, wet }
//   Tomorrow.summary(rows)         → a sentence about the day
//   Tomorrow.body(rows)            → the <tr> rows of the table
(function (root) {
  'use strict';

  const API = 'https://api.open-meteo.com/v1/forecast';
  const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max';
  const CHUNK = 20;

  function urls(cities) {
    const out = [];
    for (let i = 0; i < cities.length; i += CHUNK) {
      const part = cities.slice(i, i + CHUNK);
      out.push(`${API}?latitude=${part.map(c => c.lat).join(',')}&longitude=${part.map(c => c.lon).join(',')}&daily=${DAILY}&timezone=Europe%2FSofia&forecast_days=2&wind_speed_unit=kmh`);
    }
    return out;
  }

  const GROUPS = [
    [[0], '☀️', 'Ясно', false], [[1, 2], '🌤️', 'Предимно слънчево', false], [[3], '☁️', 'Облачно', false], [[45, 48], '🌫️', 'Мъгла', false],
    [[51, 53, 55, 56, 57], '🌦️', 'Ръмеж', true], [[61, 63, 65, 66, 67], '🌧️', 'Дъжд', true], [[71, 73, 75, 77, 85, 86], '❄️', 'Сняг', true],
    [[80, 81, 82], '🌦️', 'Превалявания', true], [[95, 96, 99], '⛈️', 'Гръмотевици', true]
  ];
  function describe(code) {
    const group = GROUPS.find(g => g[0].includes(code)) || GROUPS[2];
    return { icon: group[1], text: group[2], wet: group[3] };
  }

  // The answers of urls(), in the same order, as JSON; the day is the second one (tomorrow in Sofia)
  function rows(cities, answers) {
    const places = answers.flatMap(answer => (Array.isArray(answer) ? answer : [answer]));
    return cities.map((city, i) => {
      const daily = places[i] && places[i].daily;
      if (!daily || !daily.time || daily.time.length < 2) return null;
      return { slug: city.slug, name: city.name, day: daily.time[1], max: Math.round(daily.temperature_2m_max[1]), min: Math.round(daily.temperature_2m_min[1]),
        rain: Math.round(daily.precipitation_sum[1] * 10) / 10, wind: Math.round(daily.wind_speed_10m_max[1]), code: daily.weather_code[1] };
    }).filter(Boolean);
  }

  const deg = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}°`;
  const list = names => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}`);

  function summary(data) {
    if (!data.length) return '';
    const warm = data.reduce((a, b) => (b.max > a.max ? b : a));
    const cold = data.reduce((a, b) => (b.max < a.max ? b : a));
    const night = data.reduce((a, b) => (b.min < a.min ? b : a));
    const wet = data.filter(r => describe(r.code).wet || r.rain >= 1);
    const snow = data.filter(r => describe(r.code).text === 'Сняг');
    let text = `Утре най-топло ще бъде ${warm.name} (до ${deg(warm.max)}), а най-студено през деня – ${cold.name} (${deg(cold.max)}). Най-ниската сутрешна температура се очаква в ${night.name} (${deg(night.min)}).`;
    if (!wet.length) text += ' В нито един от градовете не се очакват значителни валежи.';
    else if (wet.length <= 6) text += ` Валежи се очакват в ${list(wet.map(r => r.name))}.`;
    else text += ` Валежи се очакват в ${wet.length} от ${data.length} града, сред които ${list(wet.slice(0, 4).map(r => r.name))}.`;
    if (snow.length && snow.length <= 6) text += ` Сняг: ${list(snow.map(r => r.name))}.`;
    return text;
  }

  const body = data => data.map(r => {
    const d = describe(r.code);
    return `<tr><td><a href="/vremeto/${r.slug}/">${r.name}</a></td><td>${d.icon} ${d.text}</td><td>${deg(r.max)}</td><td>${deg(r.min)}</td><td>${r.rain ? `${String(r.rain).replace('.', ',')} мм` : '–'}</td><td>${r.wind} км/ч</td></tr>`;
  }).join('\n');

  const Tomorrow = { urls, rows, describe, summary, body };
  if (typeof module !== 'undefined' && module.exports) module.exports = Tomorrow;
  else root.Tomorrow = Tomorrow;
})(typeof window !== 'undefined' ? window : this);
