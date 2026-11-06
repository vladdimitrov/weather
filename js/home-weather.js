// Home page: a card with the current weather and Kp index for the saved
// place (or Sofia), linking to the full forecast. Needs /js/city-search.js
// (CitySearch.startPlace) and /js/language-selector.js.
(function () {
  const card = document.getElementById('nowCard');
  if (!card || !window.CitySearch) return;

  // WMO weather codes, grouped
  const conditions = [
    { codes: [0], key: 'sun', icon: '☀️', text: { en: 'Clear', bg: 'Ясно', de: 'Klar', it: 'Sereno', es: 'Despejado' } },
    { codes: [1, 2], key: 'cloudSun', icon: '⛅', text: { en: 'Partly cloudy', bg: 'Променлива облачност', de: 'Teilweise bewölkt', it: 'Parzialmente nuvoloso', es: 'Parcialmente nublado' } },
    { codes: [3], key: 'cloud', icon: '☁️', text: { en: 'Cloudy', bg: 'Облачно', de: 'Bewölkt', it: 'Nuvoloso', es: 'Nublado' } },
    { codes: [45, 48], key: 'fog', icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла', de: 'Nebel', it: 'Nebbia', es: 'Niebla' } },
    { codes: [51, 53, 55, 56, 57], key: 'drizzle', icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмеж', de: 'Nieselregen', it: 'Pioviggine', es: 'Llovizna' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], key: 'rain', icon: '🌧️', text: { en: 'Rain', bg: 'Дъжд', de: 'Regen', it: 'Pioggia', es: 'Lluvia' } },
    { codes: [71, 73, 75, 77, 85, 86], key: 'snow', icon: '❄️', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve' } },
    { codes: [95, 96, 99], key: 'thunder', icon: '⛈️', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря', de: 'Gewitter', it: 'Temporale', es: 'Tormenta' } }
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
      WeatherIcons.node('now-icon', condition.key, pickText(condition.text)),
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
        if (last) kp = Math.round(parseFloat(last.estimated_kp ?? last.kp_index) * 10) / 10;
      }
      render();
    } catch (err) {
      // The card stays hidden; the rest of the page works without it
      console.error('Error loading current weather:', err);
    }
  }

  // Favorite places (shared with the other pages) as links to their forecast
  const favoritesBox = document.createElement('div');
  favoritesBox.className = 'home-favorites';
  favoritesBox.hidden = true;
  card.insertAdjacentElement('afterend', favoritesBox);

  function renderFavorites() {
    const favorites = CitySearch.favoritePlaces();
    favoritesBox.hidden = favorites.length === 0;
    if (!favorites.length) return;
    const title = document.createElement('div');
    title.className = 'home-favorites-title';
    title.textContent = `★ ${CitySearch.favoriteTitle()}`;
    const links = favorites.map(place => {
      const params = new URLSearchParams({ city: place.name, lat: Number(place.latitude).toFixed(4), lon: Number(place.longitude).toFixed(4) });
      if (place.countryCode) params.set('cc', place.countryCode);
      const link = document.createElement('a');
      link.className = 'recent-place favorite-place';
      link.href = `weather/?${params}`;
      link.textContent = place.name;
      if (place.country) link.title = `${place.name}, ${place.country}`;
      return link;
    });
    const list = document.createElement('div');
    list.className = 'home-favorites-list';
    list.append(...links);
    favoritesBox.replaceChildren(title, list);
  }

  const languageSelect = document.getElementById('language');
  if (languageSelect) {
    languageSelect.addEventListener('change', render);
    languageSelect.addEventListener('change', renderFavorites);
  }
  window.addEventListener('storage', event => {
    if (event.key === 'weatherMapsFavorites') renderFavorites();
  });

  // "Weather in Bulgarian cities": for a place in another country, its main
  // places and holidays instead (the Bulgarian links stay in the HTML for
  // search engines and for Bulgaria)
  const citiesSection = document.querySelector('.home-cities');
  const countryTexts = {
    title: { en: 'Weather in {country}', bg: 'Времето {in} {country}', de: 'Wetter in {country}', it: 'Meteo in {country}', es: 'El tiempo en {country}' },
    holidays: { en: 'Public holidays in {country}', bg: 'Официални празници {in} {country}', de: 'Feiertage in {country}', it: 'Festività in {country}', es: 'Festivos en {country}' }
  };

  function countryText(texts, country) {
    // Bulgarian "във" before В/Ф: "във Франция"
    const preposition = /^[ВФвф]/.test(country) ? 'във' : 'в';
    return pickText(texts).replace('{in}', preposition).replace('{country}', country);
  }

  async function renderCountryCities() {
    if (!citiesSection) return;
    const countryCode = (CitySearch.startPlace().countryCode || 'BG').toUpperCase();
    if (countryCode === 'BG') return;
    const country = CitySearch.countryName(countryCode);
    const places = await CitySearch.popularPlaces(countryCode);

    const title = citiesSection.querySelector('h2');
    title.removeAttribute('data-nav');
    title.textContent = countryText(countryTexts.title, country);

    const list = citiesSection.querySelector('.city-links');
    list.hidden = places.length === 0;
    list.replaceChildren(...places.map(place => {
      const params = new URLSearchParams({ city: place.name, lat: place.latitude.toFixed(4), lon: place.longitude.toFixed(4), cc: countryCode });
      const link = document.createElement('a');
      link.className = 'recent-place';
      link.href = `weather/?${params}`;
      link.textContent = place.name;
      return link;
    }));

    const holidays = citiesSection.querySelector('[data-nav="holidaysBg"], .home-holidays-link');
    if (holidays) {
      holidays.removeAttribute('data-nav');
      holidays.classList.add('home-holidays-link');
      holidays.href = 'holliday_calendar/';
      holidays.textContent = countryText(countryTexts.holidays, country);
    }
  }

  if (languageSelect) languageSelect.addEventListener('change', renderCountryCities);

  load();
  renderFavorites();
  renderCountryCities();
})();
