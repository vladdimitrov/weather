// City pages (/vremeto/<city>/): current weather and a 7-day forecast for the
// coordinates in #cityForecast. Hub page (/vremeto/): current temperature on
// every .city-tile in #cityList, in one request. Data: Open-Meteo.
(function () {
  const API = 'https://api.open-meteo.com/v1/forecast';

  // WMO weather codes, grouped (as in /js/home-weather.js)
  const conditions = [
    { codes: [0], icon: '☀️', text: { en: 'Clear', bg: 'Ясно' } },
    { codes: [1, 2], icon: '⛅', text: { en: 'Partly cloudy', bg: 'Променлива облачност' } },
    { codes: [3], icon: '☁️', text: { en: 'Cloudy', bg: 'Облачно' } },
    { codes: [45, 48], icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла' } },
    { codes: [51, 53, 55, 56, 57], icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмеж' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], icon: '🌧️', text: { en: 'Rain', bg: 'Дъжд' } },
    { codes: [71, 73, 75, 77, 85, 86], icon: '❄️', text: { en: 'Snow', bg: 'Сняг' } },
    { codes: [95, 96, 99], icon: '⛈️', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря' } }
  ];
  const condition = code => conditions.find(c => c.codes.includes(code)) || conditions[2];

  const T = {
    en: { now: 'Now', feels: 'feels like', wind: 'Wind', humidity: 'Humidity', days: '7-day forecast', today: 'Today', tomorrow: 'Tomorrow', rain: 'chance of rain', error: 'The forecast could not be loaded. Please try again later.', locale: 'en-GB' },
    bg: { now: 'Сега', feels: 'усеща се като', wind: 'Вятър', humidity: 'Влажност', days: 'Прогноза за 7 дни', today: 'Днес', tomorrow: 'Утре', rain: 'вероятност за валеж', error: 'Прогнозата не може да се зареди. Опитайте отново по-късно.', locale: 'bg-BG' }
  };
  const t = () => T[document.documentElement.lang] || T.en;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  // --- One city ---
  const box = document.getElementById('cityForecast');
  let forecast = null;

  function renderCity() {
    const nowBox = document.getElementById('cityNow');
    const daysBox = document.getElementById('cityDays');
    if (!forecast) return;
    const text = t();
    const now = forecast.current;
    const current = condition(now.weather_code);

    nowBox.replaceChildren(
      el('h3', '', `${text.now}: ${box.dataset.name}`),
      el('span', 'now-icon', current.icon),
      el('span', 'storm-now-value', `${Math.round(now.temperature_2m)}°`),
      el('p', 'storm-now-status', `${pickText(current.text)} · ${text.feels} ${Math.round(now.apparent_temperature)}°`),
      el('p', 'storm-updated', `${text.wind}: ${Math.round(now.wind_speed_10m)} km/h · ${text.humidity}: ${now.relative_humidity_2m}%`)
    );

    const days = forecast.daily.time.map((date, i) => {
      const day = el('div', 'kp-day city-day');
      const name = i === 0 ? text.today : i === 1 ? text.tomorrow
        : new Date(date + 'T12:00:00').toLocaleDateString(text.locale, { weekday: 'short', day: 'numeric' });
      const dayCondition = condition(forecast.daily.weather_code[i]);
      const rain = forecast.daily.precipitation_probability_max[i];
      const amount = forecast.daily.precipitation_sum[i];
      day.append(
        el('span', 'kp-day-name', name),
        el('span', 'city-day-icon', dayCondition.icon),
        el('span', 'city-day-temp', `${Math.round(forecast.daily.temperature_2m_max[i])}° / ${Math.round(forecast.daily.temperature_2m_min[i])}°`),
        el('span', 'kp-day-status', pickText(dayCondition.text))
      );
      if (rain !== null && rain !== undefined) {
        const rainText = el('span', 'city-day-rain', `💧 ${rain}%${amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ''}`);
        rainText.title = text.rain;
        day.appendChild(rainText);
      }
      day.appendChild(el('span', 'city-day-wind', `💨 ${Math.round(forecast.daily.wind_speed_10m_max[i])} km/h`));
      return day;
    });
    const grid = el('div', 'city-days');
    grid.append(...days);
    daysBox.replaceChildren(el('h3', '', text.days), grid);
    daysBox.hidden = false;
  }

  async function loadCity() {
    const url = `${API}?latitude=${box.dataset.lat}&longitude=${box.dataset.lon}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
      '&forecast_days=7&timezone=Europe%2FSofia';
    try {
      forecast = await getJson(url);
      renderCity();
    } catch (error) {
      console.error('City forecast:', error);
      document.getElementById('cityNow').replaceChildren(el('p', 'storm-now-status', t().error));
    }
  }

  // --- All cities on the hub page ---
  async function loadTiles(list) {
    const tiles = [...list.querySelectorAll('.city-tile')];
    const url = `${API}?latitude=${tiles.map(tile => tile.dataset.lat).join(',')}` +
      `&longitude=${tiles.map(tile => tile.dataset.lon).join(',')}&current=temperature_2m,weather_code&timezone=Europe%2FSofia`;
    try {
      const data = await getJson(url);
      const results = Array.isArray(data) ? data : [data];
      tiles.forEach((tile, i) => {
        const current = results[i] && results[i].current;
        if (!current) return;
        tile.querySelector('.city-tile-temp').textContent = `${condition(current.weather_code).icon} ${Math.round(current.temperature_2m)}°`;
      });
    } catch (error) {
      console.error('City temperatures:', error);
    }
  }

  if (box) loadCity();
  const list = document.getElementById('cityList');
  if (list) loadTiles(list);

  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'language') renderCity();
  });
})();
