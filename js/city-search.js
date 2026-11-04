// City search with suggestions, shared by the Weather, Maps and Holidays pages.
// CitySearch.search() looks places up with the Open-Meteo geocoding API;
// CitySearch.attach() adds the suggestion list to a text field and calls
// onSelect(place) when the visitor picks a place.
(function () {
  const API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const DEBOUNCE_MS = 250;
  const MIN_LENGTH = 2;
  const cache = new Map();

  const noResultsText = {
    en: 'No places found',
    bg: 'Няма намерени места',
    de: 'Keine Orte gefunden',
    it: 'Nessuna località trovata',
    es: 'No se encontraron lugares'
  };

  const transliterationTable = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya'
  };

  function transliterate(text) {
    return [...text.toLowerCase()].map(char => transliterationTable[char] || char).join('');
  }

  function currentLanguage() {
    return document.documentElement.lang || 'en';
  }

  async function fetchPlaces(name, language, count, signal) {
    const url = `${API_URL}?name=${encodeURIComponent(name)}&count=${count}&language=${language}&format=json`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.results || [];
  }

  // Names come back in the site language where available. The API only
  // matches names in the requested language plus some common ones: Cyrillic
  // works only with "bg", and a Latin query on a non-English page can miss
  // places ("Veliko Tarnovo" in bg finds only the old town). So such queries
  // also ask in that other language, in parallel, and the results are merged.
  async function search(query, { count = 10, signal } = {}) {
    const name = query.trim();
    const language = currentLanguage();
    const key = `${language}|${count}|${name.toLowerCase()}`;
    if (cache.has(key)) return cache.get(key);

    const cyrillic = /[Ѐ-ӿ]/.test(name);
    const extraLanguage = cyrillic ? (language !== 'bg' ? 'bg' : null) : (language !== 'en' ? 'en' : null);
    const [primary, extra] = await Promise.all([
      fetchPlaces(name, language, count, signal),
      extraLanguage ? fetchPlaces(name, extraLanguage, count, signal) : []
    ]);
    // Site-language names win for places found in both; biggest places first
    const byId = new Map();
    [...primary, ...extra].forEach(place => { if (!byId.has(place.id)) byId.set(place.id, place); });
    let results = [...byId.values()]
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, count);

    if (results.length === 0 && cyrillic) {
      results = await fetchPlaces(transliterate(name), language, count, signal);
    }

    const places = results.map(place => ({
      name: place.name,
      country: place.country || '',
      countryCode: (place.country_code || '').toUpperCase(),
      region: place.admin1 && place.admin1 !== place.name ? place.admin1 : '',
      latitude: place.latitude,
      longitude: place.longitude
    }));
    cache.set(key, places);
    return places;
  }

  function distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function addStyles() {
    if (document.getElementById('city-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'city-search-styles';
    style.textContent = `
      #citySuggestions {
        font-family: 'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-height: 250px;
        overflow-y: auto;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 215, 0, 0.3);
        background-color: rgba(28, 46, 74, 0.97);
        z-index: 1100;
      }
      .city-suggestion {
        padding: 12px 15px;
        cursor: pointer;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        transition: background 0.2s ease;
      }
      .city-suggestion:hover,
      .city-suggestion.active {
        background-color: rgba(255, 215, 0, 0.2);
        color: #FFD700;
      }
      .city-suggestion .place-region {
        font-size: 0.85em;
        opacity: 0.75;
      }
      .city-suggestion .place-distance {
        color: #FFD700;
        font-size: 0.9em;
        margin-left: 5px;
      }
      .city-suggestion-empty {
        padding: 12px 15px;
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
      }
      @media (max-width: 768px) {
        #citySuggestions { max-height: 200px; }
        .city-suggestion { padding: 14px 15px; font-size: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // Options:
  //   onSelect(place)  called with { name, country, region, latitude, longitude }
  //   getOrigin()      optional, returns { latitude, longitude } to show and sort by distance
  function attach(input, list, { onSelect, getOrigin } = {}) {
    if (!input || !list) return;
    addStyles();
    input.setAttribute('autocomplete', 'off');
    list.setAttribute('role', 'listbox');

    let places = [];
    let activeIndex = -1;
    let debounceTimer = null;
    let controller = null;

    function hide() {
      list.style.display = 'none';
      list.innerHTML = '';
      places = [];
      activeIndex = -1;
    }

    function setActive(index) {
      const items = list.querySelectorAll('.city-suggestion');
      activeIndex = index;
      items.forEach((item, i) => item.classList.toggle('active', i === index));
      if (items[index]) items[index].scrollIntoView({ block: 'nearest' });
    }

    function select(index) {
      const place = places[index];
      if (!place) return;
      input.value = place.name;
      hide();
      if (onSelect) onSelect(place);
    }

    function render(found) {
      const origin = getOrigin ? getOrigin() : null;
      const hasOrigin = origin && isFinite(origin.latitude) && isFinite(origin.longitude);
      // Keep the API order (best match and biggest places first); sorting by
      // distance put neighbourhoods ahead of the city itself
      places = found.map(place => ({
        ...place,
        distance: hasOrigin ? distanceKm(origin.latitude, origin.longitude, place.latitude, place.longitude) : null
      }));

      list.innerHTML = '';
      activeIndex = -1;
      if (places.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'city-suggestion-empty';
        empty.textContent = noResultsText[currentLanguage()] || noResultsText.en;
        list.appendChild(empty);
      }
      places.forEach((place, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion city-suggestion';
        item.setAttribute('role', 'option');
        item.dataset.index = index;

        const name = document.createElement('span');
        name.textContent = place.country ? `${place.name}, ${place.country}` : place.name;
        item.appendChild(name);

        if (place.region) {
          const region = document.createElement('span');
          region.className = 'place-region';
          region.textContent = ` (${place.region})`;
          item.appendChild(region);
        }
        if (place.distance !== null) {
          const distance = document.createElement('span');
          distance.className = 'place-distance';
          distance.textContent = `${place.distance.toFixed(1)} km`;
          item.appendChild(distance);
        }
        list.appendChild(item);
      });
      list.style.display = 'block';
    }

    async function runSearch(query) {
      if (controller) controller.abort();
      controller = new AbortController();
      const ownController = controller;
      try {
        const found = await search(query, { signal: ownController.signal });
        // Ignore answers to older queries
        if (ownController !== controller || input.value.trim() !== query) return;
        render(found);
      } catch (err) {
        if (err.name === 'AbortError') return;
        const errorMessage = pickText({ en: "Error searching for city:", bg: "Грешка при търсене на град:", de: "Fehler bei der Stadtsuche:", it: "Errore nella ricerca della città:", es: "Error al buscar la ciudad:" });
        console.error(errorMessage, err);
      }
    }

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = input.value.trim();
      if (query.length < MIN_LENGTH) {
        if (controller) controller.abort();
        hide();
        return;
      }
      debounceTimer = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    });

    input.addEventListener('keydown', event => {
      if (list.style.display !== 'block' || places.length === 0) {
        if (event.key === 'Escape') hide();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(Math.min(places.length - 1, activeIndex + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(Math.max(0, activeIndex - 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        select(activeIndex >= 0 ? activeIndex : 0);
      } else if (event.key === 'Escape') {
        hide();
      }
    });

    // mousedown instead of click, so the field doesn't lose focus first
    list.addEventListener('mousedown', event => {
      const item = event.target.closest('.city-suggestion');
      if (!item) return;
      event.preventDefault();
      select(Number(item.dataset.index));
    });

    input.addEventListener('blur', () => setTimeout(hide, 150));
  }

  // True when the latitude/longitude fields still hold this place's
  // coordinates, so pages can reuse its name and country instead of asking
  // a reverse-geocoding service again
  function isAt(place, latitude, longitude) {
    return !!place &&
      Math.abs(place.latitude - parseFloat(latitude)) < 1e-6 &&
      Math.abs(place.longitude - parseFloat(longitude)) < 1e-6;
  }

  window.CitySearch = { search, attach, isAt };
})();
