// Home page: a card with the current weather and Kp index for the saved
// place (or Sofia), linking to the full forecast. Needs /js/city-search.js
// (CitySearch.startPlace) and /js/language-selector.js.
(function () {
  const card = document.getElementById('nowCard');
  if (!card || !window.CitySearch) return;

  // WMO weather codes, grouped
  const conditions = [
    { codes: [0], icon: '☀️', text: { en: 'Clear', bg: 'Ясно', de: 'Klar', it: 'Sereno', es: 'Despejado' } },
    { codes: [1, 2], icon: '⛅', text: { en: 'Partly cloudy', bg: 'Променлива облачност', de: 'Teilweise bewölkt', it: 'Parzialmente nuvoloso', es: 'Parcialmente nublado' } },
    { codes: [3], icon: '☁️', text: { en: 'Cloudy', bg: 'Облачно', de: 'Bewölkt', it: 'Nuvoloso', es: 'Nublado' } },
    { codes: [45, 48], icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла', de: 'Nebel', it: 'Nebbia', es: 'Niebla' } },
    { codes: [51, 53, 55, 56, 57], icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмеж', de: 'Nieselregen', it: 'Pioviggine', es: 'Llovizna' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], icon: '🌧️', text: { en: 'Rain', bg: 'Дъжд', de: 'Regen', it: 'Pioggia', es: 'Lluvia' } },
    { codes: [71, 73, 75, 77, 85, 86], icon: '❄️', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve' } },
    { codes: [95, 96, 99], icon: '⛈️', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря', de: 'Gewitter', it: 'Temporale', es: 'Tormenta' } }
  ];

  const kpStatus = {
    calm: { en: 'calm', bg: 'спокойно', de: 'ruhig', it: 'calmo', es: 'tranquilo' },
    active: { en: 'active', bg: 'активно', de: 'aktiv', it: 'attivo', es: 'activo' },
    storm: { en: 'storm', bg: 'буря', de: 'Sturm', it: 'tempesta', es: 'tormenta' }
  };

  const moreText = { en: 'Forecast →', bg: 'Прогноза →', de: 'Vorhersage →', it: 'Previsioni →', es: 'Pronóstico →' };
  const feelsText = { en: 'feels like', bg: 'усеща се като', de: 'gefühlt', it: 'percepita', es: 'sensación' };

  let weather = null;
  let kp = null;

  function element(className, text) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  }

  function render() {
    if (!weather) return;
    // The place name follows the site language when it is the default (Sofia)
    const place = CitySearch.startPlace();
    const condition = conditions.find(c => c.codes.includes(weather.weather_code)) || conditions[2];

    card.replaceChildren(
      element('now-place', place.country ? `${place.name}, ${place.country}` : place.name),
      element('now-icon', condition.icon),
      element('now-temp', `${Math.round(weather.temperature_2m)}°`),
      element('now-desc', `${pickText(condition.text)} · ${pickText(feelsText)} ${Math.round(weather.apparent_temperature)}°`)
    );

    if (kp !== null) {
      const kpElement = element('now-kp', `Kp ${kp}`);
      const scale = document.createElement('span');
      scale.className = 'kp-scale';
      scale.setAttribute('role', 'img');
      scale.setAttribute('aria-label', `Kp ${kp} / 9`);
      for (let i = 0; i < 10; i++) {
        const segment = document.createElement('span');
        if (i <= Math.round(kp)) segment.className = 'on';
        scale.appendChild(segment);
      }
      kpElement.appendChild(scale);
      const status = kp >= 7 ? kpStatus.storm : kp >= 5 ? kpStatus.active : kpStatus.calm;
      kpElement.appendChild(document.createTextNode(pickText(status)));
      card.appendChild(kpElement);
    }

    card.appendChild(element('now-more', pickText(moreText)));
    card.hidden = false;
  }

  async function load() {
    const place = CitySearch.startPlace();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      '&current=temperature_2m,apparent_temperature,weather_code&timezone=auto';
    try {
      const [weatherResponse, kpResponse] = await Promise.all([
        fetch(url),
        fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json').catch(() => null)
      ]);
      if (!weatherResponse.ok) throw new Error(`HTTP error! status: ${weatherResponse.status}`);
      weather = (await weatherResponse.json()).current;
      if (kpResponse && kpResponse.ok) {
        const kpData = await kpResponse.json();
        const last = kpData[kpData.length - 1];
        if (last) kp = Math.round(parseFloat(last.kp_index) * 10) / 10;
      }
      render();
    } catch (err) {
      // The card stays hidden; the rest of the page works without it
      console.error('Error loading current weather:', err);
    }
  }

  const languageSelect = document.getElementById('language');
  if (languageSelect) languageSelect.addEventListener('change', render);

  load();
})();
