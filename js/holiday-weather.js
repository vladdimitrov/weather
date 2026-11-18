// The weather for the days of a holiday, on /praznici/ and /praznici/<year>/ (Bulgarian).
// A long weekend (data-holiday-weather: data-from, data-to) and the nearest holiday (data-holiday-next)
// show a short forecast for the big cities and the places to go to, only when the days are inside the
// forecast (today and the next 15 days). The numbers are the median of ECMWF, ICON and GFS
// (ForecastCore, js/forecast-core.js). For a test on any date: ?today=2027-04-20
(function () {
  const LAST = 15;  // the forecast: today and the 15 days after it
  const query = new URLSearchParams(location.search).get('today');
  const now = /^\d{4}-\d{2}-\d{2}$/.test(query || '') ? new Date(query + 'T12:00:00') : new Date();
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const addDays = (isoDate, n) => { const d = new Date(isoDate + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  const today = iso(now);
  const last = addDays(today, LAST);
  const WEEKDAY = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  const icon = code => (code === 0 ? '☀️' : code <= 2 ? '⛅' : code === 3 ? '☁️' : code <= 48 ? '🌫️' : code <= 57 ? '🌦️' : code <= 67 || (code >= 80 && code <= 82) ? '🌧️' : code <= 77 || code === 85 || code === 86 ? '❄️' : '⛈️');
  const label = code => (code === 0 ? 'ясно' : code <= 2 ? 'променлива облачност' : code === 3 ? 'облачно' : code <= 48 ? 'мъгла' : code <= 57 ? 'ръмеж' : code <= 67 || (code >= 80 && code <= 82) ? 'дъжд' : code <= 77 || code === 85 || code === 86 ? 'сняг' : 'гръмотевична буря');
  const degrees = value => `${value < 0 ? '−' : ''}${Math.abs(Math.round(value))}°`;

  const cache = new Map();
  function forecast(place) {
    const key = `${place.lat},${place.lon}`;
    if (!cache.has(key)) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=16';
      const load = window.ForecastCore ? window.ForecastCore.load(url) : fetch(url).then(response => response.json());
      cache.set(key, load.then(data => data.daily).catch(() => null));
    }
    return cache.get(key);
  }

  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  // dates: the days to show (inside the forecast), places: [{ name, lat, lon, url }]
  async function render(box, dates, places) {
    const results = await Promise.all(places.map(forecast));
    const table = element('table', undefined, 'kp-table');
    const head = element('tr');
    head.append(element('th', 'Град / курорт'));
    dates.forEach(date => head.append(element('th', `${WEEKDAY[new Date(date + 'T12:00:00').getDay()]} ${date.slice(8)}.${date.slice(5, 7)}`)));
    const thead = element('thead');
    thead.append(head);
    table.append(thead);
    const body = element('tbody');
    places.forEach((place, row) => {
      const tr = element('tr');
      const name = element('td');
      const link = element('a', place.name);
      link.href = place.url;
      name.append(link);
      tr.append(name);
      const daily = results[row];
      dates.forEach(date => {
        const td = element('td');
        const i = daily ? daily.time.indexOf(date) : -1;
        if (i < 0 || daily.temperature_2m_max[i] === null) td.textContent = '–';
        else {
          td.title = label(daily.weather_code[i]);
          td.append(`${icon(daily.weather_code[i])} ${degrees(daily.temperature_2m_max[i])}`, element('span', ` / ${degrees(daily.temperature_2m_min[i])}`, 'hf-min'));
          if (daily.precipitation_sum[i] >= 1) td.append(element('span', `${Math.round(daily.precipitation_sum[i])} мм`, 'hf-rain'));
        }
        tr.append(td);
      });
      body.append(tr);
    });
    table.append(body);
    const wrap = element('div', undefined, 'table-scroll');
    wrap.append(table);
    box.replaceChildren(wrap, element('p', 'Прогноза: медиана на моделите ECMWF, ICON и GFS (Open-Meteo). Максимална / минимална температура и валеж от 1 мм.', 'storm-updated'));
    box.hidden = false;
  }

  // the days between from and to that are inside the forecast
  const inside = (from, to) => {
    const out = [];
    for (let date = from > today ? from : today; date <= to && date <= last; date = addDays(date, 1)) out.push(date);
    return out;
  };

  document.querySelectorAll('[data-holiday-weather]').forEach(article => {
    const dates = inside(article.dataset.from, article.dataset.to);
    if (!dates.length) return;
    const box = article.querySelector('.holiday-forecast');
    const title = element('h4', 'Времето за тези дни');
    box.before(title);
    render(box, dates, JSON.parse(article.dataset.places));
  });

  document.querySelectorAll('[data-holiday-next]').forEach(section => {
    const holidays = JSON.parse(section.dataset.holidays).filter(h => h.date >= today && h.date <= last);
    if (!holidays.length) return;
    const dates = holidays.map(h => h.date).slice(0, 4);
    const names = holidays.slice(0, 4).map(h => `${h.name} (${h.date.slice(8)}.${h.date.slice(5, 7)})`).join(', ');
    section.querySelector('h2').after(element('p', `Предстоящ празник: ${names}.`));
    section.hidden = false;
    render(section.querySelector('.holiday-forecast'), dates, JSON.parse(section.dataset.places));
  });
})();
