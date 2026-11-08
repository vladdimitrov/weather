// City pages (/vremeto/<city>/): current weather and a 7-day forecast for the
// coordinates in #cityForecast. Hub page (/vremeto/): current temperature on
// every .city-tile in #cityList, in one request. Data: Open-Meteo.
(function () {
  const API = 'https://api.open-meteo.com/v1/forecast';

  // WMO weather codes, grouped (as in /js/home-weather.js)
  const conditions = [
    { codes: [0], key: 'sun', icon: '☀️', text: { en: 'Clear', bg: 'Ясно' } },
    { codes: [1, 2], key: 'cloudSun', icon: '⛅', text: { en: 'Partly cloudy', bg: 'Променлива облачност' } },
    { codes: [3], key: 'cloud', icon: '☁️', text: { en: 'Cloudy', bg: 'Облачно' } },
    { codes: [45, 48], key: 'fog', icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла' } },
    { codes: [51, 53, 55, 56, 57], key: 'drizzle', icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмеж' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], key: 'rain', icon: '🌧️', text: { en: 'Rain', bg: 'Дъжд' } },
    { codes: [71, 73, 75, 77, 85, 86], key: 'snow', icon: '❄️', text: { en: 'Snow', bg: 'Сняг' } },
    { codes: [95, 96, 99], key: 'thunder', icon: '⛈️', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря' } }
  ];
  const condition = code => conditions.find(c => c.codes.includes(code)) || conditions[2];

  const T = {
    en: { now: 'Now', feels: 'feels like', wind: 'Wind', humidity: 'Humidity', days: '7-day forecast', hourly: 'Hourly forecast →', today: 'Today', tomorrow: 'Tomorrow', rain: 'chance of rain', error: 'The forecast could not be loaded. Please try again later.', locale: 'en-GB' },
    bg: { now: 'Сега', feels: 'усеща се като', wind: 'Вятър', humidity: 'Влажност', days: 'Прогноза за 7 дни', hourly: 'По часове →', today: 'Днес', tomorrow: 'Утре', rain: 'вероятност за валеж', error: 'Прогнозата не може да се зареди. Опитайте отново по-късно.', locale: 'bg-BG' }
  };
  const t = () => T[document.documentElement.lang] || T.en;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Forecasts are kept for 10 minutes in this tab, so going back to a page or
  // opening the same city again does not call the API a second time.
  const CACHE_MS = 10 * 60 * 1000;

  async function getJson(url) {
    const key = 'wp-forecast:' + url;
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved && Date.now() - saved.time < CACHE_MS) return saved.data;
    } catch (error) { /* storage unavailable: fetch as usual */ }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    try { sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data })); } catch (error) { /* full or blocked */ }
    return data;
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
      WeatherIcons.node('now-icon', current.key, pickText(current.text)),
      el('span', 'storm-now-value', `${Math.round(now.temperature_2m)}°`),
      el('p', 'storm-now-status', `${pickText(current.text)} · ${text.feels} ${Math.round(now.apparent_temperature)}°`),
      el('p', 'storm-updated', `${text.wind}: ${Math.round(now.wind_speed_10m)} km/h · ${text.humidity}: ${now.relative_humidity_2m}%`)
    );

    const days = forecast.daily.time.map((date, i) => {
      const day = el('a', 'kp-day city-day');
      day.href = `/weather/?${box.dataset.query}&date=${date}`;
      day.title = text.hourly;
      const name = i === 0 ? text.today : i === 1 ? text.tomorrow
        : new Date(date + 'T12:00:00').toLocaleDateString(text.locale, { weekday: 'short', day: 'numeric' });
      const dayCondition = condition(forecast.daily.weather_code[i]);
      const rain = forecast.daily.precipitation_probability_max[i];
      const amount = forecast.daily.precipitation_sum[i];
      day.append(
        el('span', 'kp-day-name', name),
        WeatherIcons.node('city-day-icon', dayCondition.key, pickText(dayCondition.text)),
        el('span', 'city-day-date', date.slice(5).split('-').reverse().join('.')),
        el('span', 'city-day-temp', `${Math.round(forecast.daily.temperature_2m_min[i])}° / ${Math.round(forecast.daily.temperature_2m_max[i])}°`),
        el('span', 'kp-day-status', pickText(dayCondition.text))
      );
      if (rain !== null && rain !== undefined) {
        const rainText = el('span', 'city-day-rain', `${rain}%${amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ''}`);
        rainText.prepend(WeatherIcons.node('', 'rain', text.rain, 'sm'));
        rainText.title = text.rain;
        day.appendChild(rainText);
      }
      const wind = el('span', 'city-day-wind', `${Math.round(forecast.daily.wind_speed_10m_max[i])} km/h`);
      wind.prepend(WeatherIcons.node('', 'wind', text.wind, 'sm'));
      day.appendChild(wind);
      day.appendChild(el('span', 'city-day-hourly', text.hourly));
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
      '&forecast_days=7&timezone=auto';
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
      `&longitude=${tiles.map(tile => tile.dataset.lon).join(',')}&current=temperature_2m,weather_code&timezone=auto`;
    try {
      const data = await getJson(url);
      const results = Array.isArray(data) ? data : [data];
      tiles.forEach((tile, i) => {
        const current = results[i] && results[i].current;
        if (!current) return;
        const tileCondition = condition(current.weather_code);
        tile.querySelector('.city-tile-temp').replaceChildren(
          WeatherIcons.node('', tileCondition.key, pickText(tileCondition.text), 'sm'),
          document.createTextNode(` ${Math.round(current.temperature_2m)}°`)
        );
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
