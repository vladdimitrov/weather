// City pages (/vremeto/<city>/): current weather and a 7-day forecast for the
// coordinates in #cityForecast. Hub page (/vremeto/): current temperature on
// every .city-tile in #cityList, in one request. Data: Open-Meteo.
(function () {
  const API = 'https://api.open-meteo.com/v1/forecast';

  // WMO weather codes, grouped (as in /js/home-weather.js)
  const conditions = [
    { codes: [0], key: 'sun', icon: '☀️', text: { en: 'Clear', bg: 'Ясно', de: 'Klar', it: 'Sereno', es: 'Despejado' } },
    { codes: [1, 2], key: 'cloudSun', icon: '⛅', text: { en: 'Partly cloudy', bg: 'Променлива облачност', de: 'Wechselnd bewölkt', it: 'Poco nuvoloso', es: 'Parcialmente nublado' } },
    { codes: [3], key: 'cloud', icon: '☁️', text: { en: 'Cloudy', bg: 'Облачно', de: 'Bewölkt', it: 'Nuvoloso', es: 'Nublado' } },
    { codes: [45, 48], key: 'fog', icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла', de: 'Nebel', it: 'Nebbia', es: 'Niebla' } },
    { codes: [51, 53, 55, 56, 57], key: 'drizzle', icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмеж', de: 'Nieselregen', it: 'Pioviggine', es: 'Llovizna' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], key: 'rain', icon: '🌧️', text: { en: 'Rain', bg: 'Дъжд', de: 'Regen', it: 'Pioggia', es: 'Lluvia' } },
    { codes: [71, 73, 75, 77, 85, 86], key: 'snow', icon: '❄️', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve' } },
    { codes: [95, 96, 99], key: 'thunder', icon: '⛈️', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря', de: 'Gewitter', it: 'Temporale', es: 'Tormenta' } }
  ];
  const condition = code => conditions.find(c => c.codes.includes(code)) || conditions[2];

  const T = {
    en: { now: 'Now', feels: 'feels like', wind: 'Wind', humidity: 'Humidity', days: '7-day forecast', hourly: 'Hourly forecast →', today: 'Today', tomorrow: 'Tomorrow', rain: 'chance of rain', error: 'The forecast could not be loaded. Please try again later.', locale: 'en-GB' },
    bg: { now: 'Сега', feels: 'усеща се като', wind: 'Вятър', humidity: 'Влажност', days: 'Прогноза за 7 дни', hourly: 'По часове →', today: 'Днес', tomorrow: 'Утре', rain: 'вероятност за валеж', error: 'Прогнозата не може да се зареди. Опитайте отново по-късно.', locale: 'bg-BG' },
    de: { now: 'Jetzt', feels: 'gefühlt', wind: 'Wind', humidity: 'Luftfeuchte', days: '7-Tage-Vorhersage', hourly: 'Stündlich →', today: 'Heute', tomorrow: 'Morgen', rain: 'Regenwahrscheinlichkeit', error: 'Die Vorhersage konnte nicht geladen werden. Bitte versuchen Sie es später erneut.', locale: 'de-DE' },
    it: { now: 'Ora', feels: 'percepita', wind: 'Vento', humidity: 'Umidità', days: 'Previsioni a 7 giorni', hourly: 'Ora per ora →', today: 'Oggi', tomorrow: 'Domani', rain: 'probabilità di pioggia', error: 'Non è stato possibile caricare le previsioni. Riprova più tardi.', locale: 'it-IT' },
    es: { now: 'Ahora', feels: 'sensación', wind: 'Viento', humidity: 'Humedad', days: 'Previsión a 7 días', hourly: 'Por horas →', today: 'Hoy', tomorrow: 'Mañana', rain: 'probabilidad de lluvia', error: 'No se pudo cargar la previsión. Inténtalo de nuevo más tarde.', locale: 'es-ES' }
  };
  const t = () => T[document.documentElement.lang] || T.en;
  // Gusts and warnings: our own (gusts of the strongest model) and the official ones of NIMH
  // (/data/warnings-bg.json, written by .github/scripts/build-warnings.js, Bulgarian cities only)
  const STRONG = 60; // km/h: gusts that break branches; 90 and more: very strong
  const WIND = {
    en: { gusts: 'gusts', official: 'Warning of NIMH', levels: { yellow: 'yellow', orange: 'orange', red: 'red' }, code: 'code' },
    bg: { gusts: 'пориви', official: 'Предупреждение на НИМХ', levels: { yellow: 'жълт', orange: 'оранжев', red: 'червен' }, code: 'код' },
    de: { gusts: 'Böen', official: 'Warnung des NIMH', levels: { yellow: 'gelb', orange: 'orange', red: 'rot' }, code: 'Stufe' },
    it: { gusts: 'raffiche', official: 'Allerta del NIMH', levels: { yellow: 'gialla', orange: 'arancione', red: 'rossa' }, code: 'allerta' },
    es: { gusts: 'rachas', official: 'Aviso del NIMH', levels: { yellow: 'amarillo', orange: 'naranja', red: 'rojo' }, code: 'aviso' }
  };
  const wind = () => WIND[document.documentElement.lang] || WIND.en;
  // Our own warnings from the daily forecast of today and tomorrow (gusts: the strongest model,
  // the rest: the median of the models). Each rule is left out when NIMH has an official warning
  // of one of its kinds for the province. The levels are ours, near the yellow and orange codes of
  // NIMH; they are not official. Used above the forecast of the city pages, on
  // /vremeto/preduprezhdeniya/ (window.WeatherHazards) and by .github/scripts/build-forecast.js.
  const HAZARDS = {
    rules: [
      { type: 'wind', key: 'wind_gusts_10m_max', limits: [60, 90], official: ['wind'] },
      { type: 'rain', key: 'precipitation_sum', limits: [25, 50], official: ['rain', 'rain-flood', 'flooding', 'thunderstorm'] },
      { type: 'snow', key: 'snowfall_sum', limits: [10, 25], official: ['snow-ice', 'snow'] },
      { type: 'cold', key: 'temperature_2m_min', limits: [-12, -18], below: true, official: ['low-temperature'] },
      { type: 'heat', key: 'temperature_2m_max', limits: [35, 38], official: ['high-temperature'] }
    ],
    text: {
      en: { when: ['today', 'tomorrow'], wind: (v, w, o) => `${o ? 'Very strong' : 'Strong'} wind gusts ${w}: up to ${v} km/h`, rain: (v, w, o) => `${o ? 'Very heavy' : 'Heavy'} rain ${w}: about ${v} mm`, snow: (v, w, o) => `${o ? 'Very heavy' : 'Heavy'} snowfall ${w}: about ${v} cm of new snow`, cold: (v, w, o) => `${o ? 'Severe' : 'Strong'} frost ${w}: down to ${v}`, heat: (v, w, o) => `${o ? 'Extreme' : 'Strong'} heat ${w}: up to ${v}` },
      bg: { when: ['днес', 'утре'], wind: (v, w, o) => `${o ? 'Много силни' : 'Силни'} пориви на вятъра ${w}: до ${v} км/ч`, rain: (v, w, o) => `${o ? 'Много обилен' : 'Обилен'} валеж ${w}: около ${v} л/м²`, snow: (v, w, o) => `${o ? 'Много обилен' : 'Обилен'} снеговалеж ${w}: около ${v} см нов сняг`, cold: (v, w, o) => `${o ? 'Много силен' : 'Силен'} студ ${w}: до ${v}`, heat: (v, w, o) => `${o ? 'Силна жега' : 'Жега'} ${w}: до ${v}` },
      de: { when: ['heute', 'morgen'], wind: (v, w, o) => `${o ? 'Sehr starke' : 'Starke'} Windböen ${w}: bis ${v} km/h`, rain: (v, w, o) => `${o ? 'Sehr starker' : 'Starker'} Regen ${w}: etwa ${v} mm`, snow: (v, w, o) => `${o ? 'Sehr starker' : 'Starker'} Schneefall ${w}: etwa ${v} cm Neuschnee`, cold: (v, w, o) => `${o ? 'Sehr strenger' : 'Strenger'} Frost ${w}: bis ${v}`, heat: (v, w, o) => `${o ? 'Extreme' : 'Starke'} Hitze ${w}: bis ${v}` },
      it: { when: ['oggi', 'domani'], wind: (v, w, o) => `Raffiche di vento ${o ? 'molto forti' : 'forti'} ${w}: fino a ${v} km/h`, rain: (v, w, o) => `Pioggia ${o ? 'molto intensa' : 'intensa'} ${w}: circa ${v} mm`, snow: (v, w, o) => `Nevicata ${o ? 'molto abbondante' : 'abbondante'} ${w}: circa ${v} cm di neve fresca`, cold: (v, w, o) => `Gelo ${o ? 'molto intenso' : 'intenso'} ${w}: fino a ${v}`, heat: (v, w, o) => `Caldo ${o ? 'estremo' : 'intenso'} ${w}: fino a ${v}` },
      es: { when: ['hoy', 'mañana'], wind: (v, w, o) => `Rachas de viento ${o ? 'muy fuertes' : 'fuertes'} ${w}: hasta ${v} km/h`, rain: (v, w, o) => `Lluvia ${o ? 'muy intensa' : 'intensa'} ${w}: unos ${v} mm`, snow: (v, w, o) => `Nevada ${o ? 'muy abundante' : 'abundante'} ${w}: unos ${v} cm de nieve nueva`, cold: (v, w, o) => `Helada ${o ? 'muy fuerte' : 'fuerte'} ${w}: hasta ${v}`, heat: (v, w, o) => `Calor ${o ? 'extremo' : 'intenso'} ${w}: hasta ${v}` }
    },
    // daily: Open-Meteo "daily"; official: the official warnings of the place ([{ type }]).
    // Gives [{ type, level: 'yellow' | 'orange', day: 0 | 1, text }], the worse day of each rule.
    list(daily, lang, official) {
      const text = this.text[lang] || this.text.en;
      const kinds = new Set((official || []).map(w => w.type));
      const out = [];
      this.rules.forEach(rule => {
        if (rule.official.some(kind => kinds.has(kind))) return;
        const values = (daily && daily[rule.key]) || [];
        const sign = rule.below ? -1 : 1;
        let best = null;
        [0, 1].forEach(day => {
          const value = values[day];
          if (typeof value !== 'number' || sign * value < sign * rule.limits[0]) return;
          if (!best || sign * value > sign * best.value) best = { day, value };
        });
        if (!best) return;
        const orange = sign * best.value >= sign * rule.limits[1];
        const r = Math.round(best.value);
        const shown = rule.type === 'cold' || rule.type === 'heat' ? `${r < 0 ? '−' : ''}${Math.abs(r)}°` : r;
        out.push({ type: rule.type, level: orange ? 'orange' : 'yellow', day: best.day, text: text[rule.type](shown, text.when[best.day], orange) });
      });
      return out;
    }
  };
  window.WeatherHazards = HAZARDS;
  const isBg = () => document.documentElement.lang === 'bg';
  // Pages with more days (data-days="10") or only the coming weekend (data-weekend)
  const PERIOD = {
    en: { days: n => `${n}-day forecast`, weekend: 'The weekend' },
    bg: { days: n => `Прогноза за ${n} дни`, weekend: 'Уикендът' },
    de: { days: n => `${n}-Tage-Vorhersage`, weekend: 'Das Wochenende' },
    it: { days: n => `Previsioni a ${n} giorni`, weekend: 'Il fine settimana' },
    es: { days: n => `Previsión a ${n} días`, weekend: 'El fin de semana' }
  };
  const period = () => PERIOD[document.documentElement.lang] || PERIOD.en;
  // Friday to Sunday of the coming weekend (from today when the weekend has started)
  function weekendDays(dates) {
    const weekday = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
    const start = dates.findIndex(iso => [5, 6, 0].includes(weekday(iso)));
    if (start < 0) return dates.map((d, i) => i);
    const list = [];
    for (let i = start; i < dates.length && [5, 6, 0].includes(weekday(dates[i])); i++) list.push(i);
    return list;
  }

  // Sunrise, sunset, day length and the Moon of today (labels in the 5 site languages)
  const SUN = {
    en: { sunrise: 'Sunrise', sunset: 'Sunset', daylight: 'Day length', moon: 'Moon', h: 'h', m: 'min' },
    bg: { sunrise: 'Изгрев', sunset: 'Залез', daylight: 'Дължина на деня', moon: 'Луна', h: 'ч', m: 'мин' },
    de: { sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang', daylight: 'Tageslänge', moon: 'Mond', h: 'Std', m: 'Min' },
    it: { sunrise: 'Alba', sunset: 'Tramonto', daylight: 'Durata del giorno', moon: 'Luna', h: 'h', m: 'min' },
    es: { sunrise: 'Amanecer', sunset: 'Atardecer', daylight: 'Duración del día', moon: 'Luna', h: 'h', m: 'min' }
  };

  function sunLines() {
    const daily = forecast.daily;
    if (!daily.sunrise || !daily.sunrise[0]) return [];
    const language = SUN[document.documentElement.lang] ? document.documentElement.lang : 'en';
    const s = SUN[language];
    const minutes = Math.round(daily.daylight_duration[0] / 60);
    const lines = [el('p', 'storm-updated city-sun',
      `🌅 ${s.sunrise} ${daily.sunrise[0].slice(11, 16)} · 🌇 ${s.sunset} ${daily.sunset[0].slice(11, 16)} · ${s.daylight}: ${Math.floor(minutes / 60)} ${s.h} ${minutes % 60} ${s.m}`)];
    if (typeof Moon !== 'undefined') {
      const state = Moon.state(new Date(daily.time[0] + 'T12:00:00Z'));
      lines.push(el('p', 'storm-updated city-moon',
        `${Moon.ICONS[state.index]} ${s.moon}: ${Moon.NAMES[language][state.index]}, ${Math.round(state.fraction * 100)}%`));
    }
    return lines;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Forecasts are kept for 10 minutes in this tab, so going back to a page or
  // opening the same city again does not call the API a second time.
  const CACHE_MS = 10 * 60 * 1000;

  // the main forecast of the city is the median of three models (js/forecast-core.js)
  let corePromise = null;
  function loadCore() {
    if (window.ForecastCore) return Promise.resolve();
    if (!corePromise) {
      corePromise = new Promise(resolve => {
        const script = document.createElement('script');
        script.src = '/js/forecast-core.js?v=2';
        script.onload = script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }
    return corePromise;
  }

  async function getJson(url, consensus) {
    const key = 'wp-forecast:' + (consensus ? 'median:' : '') + url;
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved && Date.now() - saved.time < CACHE_MS) return saved.data;
    } catch (error) { /* storage unavailable: fetch as usual */ }
    let data;
    if (consensus) {
      await loadCore();
    }
    if (consensus && window.ForecastCore) {
      data = await ForecastCore.load(url);
      if (!data || data.error || !data.daily) throw new Error('forecast failed');
    } else {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    }
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
      el('h2', '', `${text.now}: ${box.dataset.name}`),
      WeatherIcons.node('now-icon', current.key, pickText(current.text)),
      el('span', 'storm-now-value', `${Math.round(now.temperature_2m)}°`),
      el('p', 'storm-now-status', `${pickText(current.text)} · ${text.feels} ${Math.round(now.apparent_temperature)}°`),
      el('p', 'storm-updated', `${text.wind}: ${Math.round(now.wind_speed_10m)} km/h${typeof now.wind_gusts_10m === 'number' ? `, ${wind().gusts} ${Math.round(now.wind_gusts_10m)} km/h` : ''} · ${text.humidity}: ${now.relative_humidity_2m}%`),
      ...sunLines()
    );
    showAlerts();

    const lows = forecast.daily.temperature_2m_min, highs = forecast.daily.temperature_2m_max;
    const lowest = Math.min(...lows), highest = Math.max(...highs);
    // where the day sits between the coldest and the warmest of the period
    const rangeBar = i => {
      const bar = el('span', 'dc-range');
      bar.setAttribute('aria-hidden', 'true');
      if (highest > lowest) {
        const left = ((lows[i] - lowest) / (highest - lowest)) * 100;
        const width = Math.min(Math.max(((highs[i] - lows[i]) / (highest - lowest)) * 100, 6), 100 - left);
        const fill = document.createElement('i');
        fill.style.left = left.toFixed(1) + '%';
        fill.style.width = width.toFixed(1) + '%';
        bar.appendChild(fill);
      }
      return bar;
    };
    const shown = box.dataset.weekend ? weekendDays(forecast.daily.time) : forecast.daily.time.map((d, i) => i);
    const days = shown.map(i => {
      const date = forecast.daily.time[i];
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
        rangeBar(i),
        el('span', 'kp-day-status', pickText(dayCondition.text))
      );
      if (rain !== null && rain !== undefined) {
        const rainText = el('span', 'city-day-rain', `${rain}%${amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ''}`);
        rainText.prepend(WeatherIcons.node('', 'rain', text.rain, 'sm'));
        rainText.title = text.rain;
        day.appendChild(rainText);
      }
      const gust = forecast.daily.wind_gusts_10m_max ? forecast.daily.wind_gusts_10m_max[i] : null;
      const windText = el('span', 'city-day-wind' + (gust >= STRONG ? ' city-day-gusts' : ''),
        `${Math.round(forecast.daily.wind_speed_10m_max[i])} km/h${typeof gust === 'number' ? ` · ${wind().gusts} ${Math.round(gust)}` : ''}`);
      windText.prepend(WeatherIcons.node('', 'wind', text.wind, 'sm'));
      day.appendChild(windText);
      day.appendChild(el('span', 'city-day-hourly', text.hourly));
      return day;
    });
    const grid = el('div', 'city-days');
    grid.append(...days);
    const note = window.ForecastCore ? ForecastCore.note({ models: forecast.models, elevation: forecast.elevation }) : '';
    const heading = box.dataset.weekend ? period().weekend : box.dataset.days ? period().days(+box.dataset.days) : text.days;
    daysBox.replaceChildren(el('h3', '', heading), grid, ...(note ? [el('p', 'forecast-note', note)] : []));
    daysBox.hidden = false;
  }

  // The warnings above the forecast: the official ones of NIMH for the province of a Bulgarian
  // city (data-warn on #cityForecast), then ours (HAZARDS) for the kinds NIMH has not warned of
  let official = [];
  function showAlerts() {
    const nowBox = document.getElementById('cityNow');
    if (!forecast || !nowBox) return;
    let list = document.getElementById('cityAlerts');
    if (!list) {
      list = el('div', 'city-alerts');
      list.id = 'cityAlerts';
      list.setAttribute('role', 'status');
      box.insertBefore(list, nowBox);
    }
    const W = wind();
    const items = official.map(w => {
      const item = el('p', `city-alert city-alert-${w.level}`);
      const time = iso => new Date(iso).toLocaleString(t().locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      item.textContent = `${W.official} (${W.levels[w.level] || w.level} ${W.code}): ${(isBg() ? w.event.bg : w.event.en) || w.event.bg || w.event.en}, ${time(w.onset)} – ${time(w.expires)}`;
      return item;
    });
    // ours, for the kinds NIMH has not warned of (the official warning says it better)
    HAZARDS.list(forecast.daily, document.documentElement.lang, official)
      .forEach(h => items.push(el('p', `city-alert city-alert-${h.level}`, h.text)));
    // the Bulgarian pages link to the warnings of the whole country
    if (items.length && box.dataset.warn && isBg()) {
      const all = el('a', 'city-alerts-all', 'Всички предупреждения в България →');
      all.href = '/vremeto/preduprezhdeniya/';
      all.style.cssText = 'align-self:flex-end;font-size:0.9rem';
      items.push(all);
    }
    list.replaceChildren(...items);
    list.hidden = !items.length;
  }
  async function loadWarnings() {
    if (!box.dataset.warn) return;
    try {
      const response = await fetch('/data/warnings-bg.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const now = Date.now();
      official = ((data.provinces || {})[box.dataset.warn] || []).filter(w => new Date(w.expires).getTime() > now);
      showAlerts();
    } catch (error) { /* no warnings file: only ours */ }
  }

  async function loadCity() {
    loadWarnings();
    const url = `${API}?latitude=${box.dataset.lat}&longitude=${box.dataset.lon}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset,daylight_duration' +
      `&forecast_days=${Math.min(Math.max(+box.dataset.days || 7, 7), 16)}&timezone=auto`;
    try {
      forecast = await getJson(url, true);
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

  // --- Other cities of the country near this one, with their temperature now ---
  const NEARBY = { en: 'Other cities nearby', bg: 'Други градове наблизо', de: 'Weitere Städte in der Nähe', it: 'Altre città vicine', es: 'Otras ciudades cercanas' };
  let nearby = null; // { section, items: [{ place, current }] }

  function distanceKm(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
  }

  function renderNearby() {
    if (!nearby) return;
    const lang = document.documentElement.lang;
    const links = nearby.items.map(({ place, current }) => {
      const name = place.name[lang] || place.name.en;
      const query = new URLSearchParams({ city: name, lat: place.latitude.toFixed(4), lon: place.longitude.toFixed(4), cc: nearby.cc });
      const link = el('a', 'nearby-card');
      link.href = `/weather/?${query}`;
      link.append(el('span', 'nearby-name', name));
      if (current) {
        const info = condition(current.weather_code);
        const value = el('span', 'nearby-temp');
        value.append(WeatherIcons.node('', info.key, pickText(info.text), 'sm'), document.createTextNode(` ${Math.round(current.temperature_2m)}°`));
        link.append(value);
      }
      return link;
    });
    nearby.section.replaceChildren(el('h2', '', NEARBY[lang] || NEARBY.en), (() => { const grid = el('div', 'nearby-grid'); grid.append(...links); return grid; })());
  }

  async function loadNearby() {
    const cc = new URLSearchParams(box.dataset.query || '').get('cc');
    if (!cc) return;
    try {
      const data = await getJson('/js/destinations.json');
      const here = [+box.dataset.lat, +box.dataset.lon];
      const places = (data[cc] || [])
        .map(place => ({ place, km: distanceKm(here[0], here[1], place.latitude, place.longitude) }))
        .filter(item => item.km > 5)
        .sort((a, b) => a.km - b.km)
        .slice(0, 6)
        .map(item => item.place);
      if (!places.length) return;
      const url = `${API}?latitude=${places.map(p => p.latitude).join(',')}&longitude=${places.map(p => p.longitude).join(',')}&current=temperature_2m,weather_code&timezone=auto`;
      let results = [];
      try { const weather = await getJson(url); results = Array.isArray(weather) ? weather : [weather]; } catch (error) { /* names only */ }
      const section = document.createElement('section');
      section.className = 'info-card city-nearby';
      box.insertAdjacentElement('afterend', section);
      nearby = { cc, section, items: places.map((place, i) => ({ place, current: results[i] && results[i].current })) };
      renderNearby();
    } catch (error) {
      console.error('Nearby cities:', error);
    }
  }

  if (box) { loadCity(); if (!box.dataset.days) loadNearby(); }
  const list = document.getElementById('cityList');
  if (list) loadTiles(list);

  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'language') { renderCity(); renderNearby(); }
  });
})();
