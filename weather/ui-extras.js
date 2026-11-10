// Weather page extras: a "now" block with the current weather, the form that folds into
// one line once a forecast is shown, a loading skeleton, the details switch of the day
// cards, the weather condition text under the icons, and a page title in the site language.
// weather-fixed.js calls UiExtras.skeleton() / UiExtras.condition() and fires the
// "forecast:loaded" event ({ lat, lon }) when the daily forecast has been drawn.
(function () {
  const pick = texts => (window.pickText ? window.pickText(texts) : texts[document.documentElement.lang] || texts.en);

  // WMO weather codes, grouped (same groups as the home page card)
  const conditions = [
    { codes: [0], key: 'sun', text: { en: 'Clear', bg: 'Ясно', de: 'Klar', it: 'Sereno', es: 'Despejado' } },
    { codes: [1, 2], key: 'cloudSun', text: { en: 'Partly cloudy', bg: 'Променлива облачност', de: 'Teilweise bewölkt', it: 'Parzialmente nuvoloso', es: 'Parcialmente nublado' } },
    { codes: [3], key: 'cloud', text: { en: 'Cloudy', bg: 'Облачно', de: 'Bewölkt', it: 'Nuvoloso', es: 'Nublado' } },
    { codes: [45, 48], key: 'fog', text: { en: 'Fog', bg: 'Мъгла', de: 'Nebel', it: 'Nebbia', es: 'Niebla' } },
    { codes: [51, 53, 55, 56, 57], key: 'drizzle', text: { en: 'Drizzle', bg: 'Ръмеж', de: 'Nieselregen', it: 'Pioviggine', es: 'Llovizna' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], key: 'rain', text: { en: 'Rain', bg: 'Дъжд', de: 'Regen', it: 'Pioggia', es: 'Lluvia' } },
    { codes: [71, 73, 75, 77, 85, 86], key: 'snow', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve' } },
    { codes: [95, 96, 99], key: 'thunder', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря', de: 'Gewitter', it: 'Temporale', es: 'Tormenta' } }
  ];
  const conditionOf = code => conditions.find(c => c.codes.includes(code)) || null;

  const T = {
    now: { en: 'Now in {place}', bg: 'Сега в {place}', de: 'Jetzt in {place}', it: 'Adesso a {place}', es: 'Ahora en {place}' },
    feels: { en: 'feels like', bg: 'усеща се като', de: 'gefühlt', it: 'percepita', es: 'sensación' },
    wind: { en: 'Wind', bg: 'Вятър', de: 'Wind', it: 'Vento', es: 'Viento' },
    humidity: { en: 'Humidity', bg: 'Влажност', de: 'Luftfeuchte', it: 'Umidità', es: 'Humedad' },
    change: { en: 'Change', bg: 'Промени', de: 'Ändern', it: 'Modifica', es: 'Cambiar' },
    more: { en: 'More details', bg: 'Повече подробности', de: 'Mehr Details', it: 'Più dettagli', es: 'Más detalles' },
    less: { en: 'Fewer details', bg: 'По-малко подробности', de: 'Weniger Details', it: 'Meno dettagli', es: 'Menos detalles' }
  };
  const dayWord = n => (n === 1
    ? { en: 'day', bg: 'ден', de: 'Tag', it: 'giorno', es: 'día' }
    : { en: 'days', bg: 'дни', de: 'Tage', it: 'giorni', es: 'días' });
  const TITLE = {
    en: 'Weather forecast by day and hour', bg: 'Прогноза за времето по дни и часове', de: 'Wettervorhersage nach Tagen und Stunden',
    it: 'Previsioni del tempo per giorno e ora', es: 'Pronóstico del tiempo por días y horas'
  };

  const el = id => document.getElementById(id);
  const span = (className, text) => {
    const node = document.createElement('span');
    node.className = className;
    node.textContent = text;
    return node;
  };

  let current = null; // last current-weather data

  function placeName() {
    const selected = el('selected-city');
    const text = selected ? selected.textContent.trim() : '';
    const fromSelected = text.includes(':') ? text.split(':').slice(1).join(':').trim() : '';
    const city = el('city');
    return fromSelected || (city && city.value.trim()) || '';
  }

  // ---- the "now" block ----
  function nowBlock() {
    let block = el('nowBlock');
    if (!block) {
      block = document.createElement('div');
      block.id = 'nowBlock';
      block.className = 'now-card now-block';
      block.hidden = true;
      const anchor = document.querySelector('.info-display');
      (anchor || el('dayCards')).insertAdjacentElement(anchor ? 'afterend' : 'beforebegin', block);
    }
    return block;
  }

  function renderNow() {
    const block = nowBlock();
    if (!current) { block.hidden = true; return; }
    const condition = conditionOf(current.weather_code) || conditions[2];
    const place = placeName();
    const meta = `💨 ${pick(T.wind)} ${Math.round(current.wind_speed_10m)} km/h · 💧 ${pick(T.humidity)} ${Math.round(current.relative_humidity_2m)}%`;
    const nodes = [];
    if (place) nodes.push(span('now-place', pick(T.now).replace('{place}', place)));
    nodes.push(
      window.WeatherIcons ? WeatherIcons.node('now-icon', condition.key, pick(condition.text)) : span('now-icon', ''),
      span('now-temp', `${Math.round(current.temperature_2m)}°`),
      span('now-desc', `${pick(condition.text)} · ${pick(T.feels)} ${Math.round(current.apparent_temperature)}°`),
      span('now-meta', meta)
    );
    block.replaceChildren(...nodes);
    block.hidden = false;
  }

  async function loadNow(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      current = (await response.json()).current || null;
    } catch (err) {
      // the block stays hidden; the day cards still work
      console.error('Error loading current weather:', err);
      current = null;
    }
    renderNow();
  }

  // ---- the form that folds into one line ----
  function form() { return document.querySelector('.weather-form'); }

  function renderSummary() {
    const f = form();
    if (!f) return;
    let bar = f.querySelector('.form-summary');
    if (!bar) {
      bar = document.createElement('button');
      bar.type = 'button';
      bar.className = 'form-summary';
      bar.addEventListener('click', () => {
        f.classList.remove('collapsed');
        const city = el('city');
        if (city) city.focus();
      });
      f.insertBefore(bar, f.firstChild);
    }
    const days = parseInt((el('days') || {}).value, 10);
    const parts = [placeName()];
    if (days) parts.push(`${days} ${pick(dayWord(days))}`);
    bar.replaceChildren(span('fs-text', parts.filter(Boolean).join(' · ')), span('fs-change', `✎ ${pick(T.change)}`));
  }

  function collapseForm() {
    const f = form();
    if (!f) return;
    renderSummary();
    f.classList.add('collapsed');
  }

  // ---- loading skeleton ----
  function skeleton(count) {
    const box = el('dayCards');
    if (!box) return;
    const n = Math.max(1, Math.min(isNaN(count) ? 3 : count, 6));
    box.innerHTML = Array.from({ length: n }, () => '<div class="day-skel" aria-hidden="true"><i></i><i></i><i class="big"></i><i></i><i></i></div>').join('');
    box.setAttribute('aria-busy', 'true');
    const block = el('nowBlock');
    if (block) block.hidden = true;
  }

  // ---- details switch for the day cards ----
  const DETAILS_KEY = 'dayCardsDetails';
  function detailsOpen() {
    try {
      const saved = localStorage.getItem(DETAILS_KEY);
      if (saved === 'open') return true;
      if (saved === 'closed') return false;
    } catch (e) { /* storage blocked */ }
    return window.innerWidth >= 700;
  }

  function applyDetails() {
    const box = el('dayCards');
    const button = el('dayDetailsToggle');
    if (!box || !button) return;
    const open = detailsOpen();
    box.classList.toggle('compact', !open);
    button.textContent = open ? `▴ ${pick(T.less)}` : `▾ ${pick(T.more)}`;
    button.setAttribute('aria-expanded', String(open));
  }

  function ensureToggle() {
    const box = el('dayCards');
    if (!box || el('dayDetailsToggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'dayDetailsToggle';
    button.className = 'day-details-toggle';
    button.addEventListener('click', () => {
      try { localStorage.setItem(DETAILS_KEY, detailsOpen() ? 'closed' : 'open'); } catch (e) { /* storage blocked */ }
      applyDetails();
    });
    box.insertAdjacentElement('beforebegin', button);
    applyDetails();
  }

  // ---- page title in the site language ----
  function setTitle() {
    const lang = document.documentElement.lang;
    document.title = `${TITLE[lang] || TITLE.bg} | Weather Pulse`;
  }

  document.addEventListener('forecast:loaded', event => {
    const detail = event.detail || {};
    const box = el('dayCards');
    if (box) box.removeAttribute('aria-busy');
    ensureToggle();
    collapseForm();
    loadNow(detail.lat, detail.lon);
  });

  document.addEventListener('change', event => {
    if (!event.target || event.target.id !== 'language') return;
    setTimeout(() => {
      setTitle();
      renderNow();
      if (form() && form().classList.contains('collapsed')) renderSummary();
      applyDetails();
    }, 0);
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTitle();
  });

  window.UiExtras = {
    skeleton,
    // visible condition text for a day card, from the WMO weather code
    condition(code) {
      const condition = conditionOf(code);
      // fog already has its own badge on the card
      return condition && condition.key !== 'fog' ? `<span class="dc-cond">${pick(condition.text)}</span>` : '';
    }
  };
})();
