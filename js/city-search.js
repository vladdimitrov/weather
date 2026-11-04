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

    function pick(place) {
      input.value = place.name;
      hide();
      rememberPlace(place);
      setUrlPlace(place);
      renderRecent();
      if (onSelect) onSelect(place);
    }

    function select(index) {
      if (places[index]) pick(places[index]);
    }

    // Favorite (★) and recently picked places as one-tap buttons under the field
    const recent = document.createElement('div');
    recent.className = 'recent-places';
    input.insertAdjacentElement('afterend', recent);

    function placeButton(place, favorite) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = favorite ? 'recent-place favorite-place' : 'recent-place';
      button.textContent = favorite ? `★ ${place.name}` : place.name;
      button.title = place.country ? `${place.name}, ${place.country}` : place.name;
      button.addEventListener('click', () => pick(place));
      return button;
    }

    function renderRecent() {
      const current = `${input.value}`.trim();
      const favorites = favoritePlaces();
      const others = recentPlaces().filter(place => place.name !== current && !favorites.some(fav => samePlace(fav, place)));
      recent.replaceChildren(...favorites.map(place => placeButton(place, true)), ...others.map(place => placeButton(place, false)));
      recent.hidden = favorites.length + others.length === 0;
    }
    document.addEventListener('favoriteschange', renderRecent);
    window.addEventListener('storage', event => {
      if (event.key === FAVORITES_KEY || event.key === RECENT_KEY) renderRecent();
    });
    // After the page has filled in its start place
    setTimeout(renderRecent, 600);

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

  // ---- Recently picked places (shared by all pages through localStorage) ----
  const RECENT_KEY = 'recentPlaces';
  const RECENT_MAX = 5;

  function recentPlaces() {
    try {
      const list = JSON.parse(localStorage.getItem(RECENT_KEY));
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function rememberPlace(place) {
    const same = other => Math.abs(other.latitude - place.latitude) < 0.01 && Math.abs(other.longitude - place.longitude) < 0.01;
    const entry = {
      name: place.name,
      country: place.country || '',
      countryCode: place.countryCode || '',
      latitude: place.latitude,
      longitude: place.longitude
    };
    const list = [entry, ...recentPlaces().filter(other => !same(other))].slice(0, RECENT_MAX);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
  }

  // ---- Favorite places, shared by all pages ----
  // Same storage as the Maps favorites panel (maps/js/favorites-manager.js),
  // so both show one list. Changes are announced with a "favoriteschange"
  // event on document.
  const FAVORITES_KEY = 'weatherMapsFavorites';
  const FAVORITES_MAX = 10;

  const samePlace = (a, b) => Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01;

  function favoritePlaces() {
    try {
      const list = JSON.parse(localStorage.getItem(FAVORITES_KEY));
      return Array.isArray(list) ? list.filter(place => isFinite(place.latitude) && isFinite(place.longitude)) : [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(list) {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
    document.dispatchEvent(new CustomEvent('favoriteschange'));
  }

  function isFavorite(place) {
    return !!place && favoritePlaces().some(other => samePlace(other, place));
  }

  // Adds the place, or removes it when it is already a favorite.
  // Returns false when the list is full.
  function toggleFavorite(place) {
    const list = favoritePlaces();
    if (list.some(other => samePlace(other, place))) {
      saveFavorites(list.filter(other => !samePlace(other, place)));
      return true;
    }
    if (list.length >= FAVORITES_MAX) return false;
    const now = new Date().toISOString();
    list.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: place.name || `${Number(place.latitude).toFixed(4)}, ${Number(place.longitude).toFixed(4)}`,
      country: place.country || '',
      countryCode: place.countryCode || '',
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      dateAdded: now,
      lastUsed: now
    });
    saveFavorites(list);
    return true;
  }

  // ---- Links to a place: ?city=Пловдив, optionally with &lat=..&lon=.. ----
  // The page address follows the picked place, so it can be shared or bookmarked
  function setUrlPlace(place) {
    if (!place || !place.name) return;
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('city', place.name);
    url.searchParams.set('lat', Number(place.latitude).toFixed(4));
    url.searchParams.set('lon', Number(place.longitude).toFixed(4));
    if (place.countryCode) url.searchParams.set('cc', place.countryCode);
    history.replaceState(history.state, '', url);
  }

  // The place given in the page address, or null
  async function placeFromUrl() {
    const params = new URLSearchParams(location.search);
    const name = (params.get('city') || '').trim();
    const latitude = parseFloat(params.get('lat'));
    const longitude = parseFloat(params.get('lon'));
    if (isFinite(latitude) && isFinite(longitude)) {
      return { name, country: '', countryCode: (params.get('cc') || '').toUpperCase(), latitude, longitude };
    }
    if (!name) return null;
    try {
      const [place] = await search(name, { count: 1 });
      return place || null;
    } catch (e) {
      return null;
    }
  }

  // Where a page opens: a place in the address first, then the last picked
  // place, then Sofia. The address is updated to match.
  async function openingPlace() {
    const place = (await placeFromUrl()) || startPlace();
    setUrlPlace(place);
    return place;
  }

  const defaultNames = {
    en: ['Sofia', 'Bulgaria'],
    bg: ['София', 'България'],
    de: ['Sofia', 'Bulgarien'],
    it: ['Sofia', 'Bulgaria'],
    es: ['Sofía', 'Bulgaria']
  };

  // The place a page opens with: the last one picked (saved in localStorage
  // as "lastLocation"), or Sofia on a first visit
  function startPlace() {
    try {
      const saved = JSON.parse(localStorage.getItem('lastLocation'));
      if (saved && saved.latitude && saved.longitude) {
        return {
          name: saved.city || '',
          country: saved.country || '',
          countryCode: saved.countryCode || '',
          latitude: parseFloat(saved.latitude),
          longitude: parseFloat(saved.longitude)
        };
      }
    } catch (e) { /* storage blocked or invalid data */ }
    const [name, country] = defaultNames[currentLanguage()] || defaultNames.en;
    return { name, country, countryCode: 'BG', latitude: 42.6977, longitude: 23.3219 };
  }

  const favoriteTexts = {
    en: { off: '☆ Add to favorites', on: '★ Favorite', remove: 'Remove from favorites', full: 'You can keep up to 10 favorite places. Remove one first.', title: 'Favorite places' },
    bg: { off: '☆ Добави в любими', on: '★ Любимо', remove: 'Премахни от любими', full: 'Може да имате до 10 любими места. Първо премахнете едно.', title: 'Любими места' },
    de: { off: '☆ Zu Favoriten', on: '★ Favorit', remove: 'Aus Favoriten entfernen', full: 'Sie können bis zu 10 Lieblingsorte speichern. Entfernen Sie zuerst einen.', title: 'Lieblingsorte' },
    it: { off: '☆ Aggiungi ai preferiti', on: '★ Preferito', remove: 'Rimuovi dai preferiti', full: 'Puoi salvare fino a 10 località preferite. Rimuovine prima una.', title: 'Località preferite' },
    es: { off: '☆ Añadir a favoritos', on: '★ Favorito', remove: 'Quitar de favoritos', full: 'Puedes guardar hasta 10 lugares favoritos. Quita uno primero.', title: 'Lugares favoritos' }
  };

  const shareTexts = {
    en: ['🔗 Share', '✓ Link copied'],
    bg: ['🔗 Сподели', '✓ Линкът е копиран'],
    de: ['🔗 Teilen', '✓ Link kopiert'],
    it: ['🔗 Condividi', '✓ Link copiato'],
    es: ['🔗 Compartir', '✓ Enlace copiado']
  };

  const coordinatesToggleText = {
    en: ['📐 Enter coordinates', '📐 Hide coordinates'],
    bg: ['📐 Въведи координати', '📐 Скрий координатите'],
    de: ['📐 Koordinaten eingeben', '📐 Koordinaten ausblenden'],
    it: ['📐 Inserisci coordinate', '📐 Nascondi coordinate'],
    es: ['📐 Introducir coordenadas', '📐 Ocultar coordenadas']
  };

  // Most visitors search by city, so the latitude/longitude fields are hidden
  // behind a small link under the city field. They are still filled in (and
  // used) when a city is picked.
  function addCoordinatesToggle() {
    const latitude = document.getElementById('latitude');
    const cityGroup = document.querySelector('.form-group.city');
    const form = latitude && latitude.closest('.form-container');
    if (!form || !cityGroup || document.getElementById('coordinatesToggle')) return;

    const style = document.createElement('style');
    style.textContent = `
      .form-container.coords-hidden .form-group.latitude,
      .form-container.coords-hidden .form-group.longitude {
        display: none !important;
      }
      .coords-toggle {
        display: inline-block;
        margin-top: 6px;
        padding: 4px 0;
        border: none;
        background: none;
        color: #FFD700;
        font-family: inherit;
        font-size: 0.85em;
        text-decoration: underline dotted;
        cursor: pointer;
        opacity: 0.85;
      }
      .coords-toggle:hover { opacity: 1; }
      .coords-toggle + .coords-toggle { margin-left: 14px; }
      .coords-toggle[hidden] { display: none; }
    `;
    document.head.appendChild(style);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'coordinatesToggle';
    toggle.className = 'coords-toggle';
    cityGroup.appendChild(toggle);
    form.classList.add('coords-hidden');

    function updateText() {
      const [showText, hideText] = coordinatesToggleText[currentLanguage()] || coordinatesToggleText.en;
      const hidden = form.classList.contains('coords-hidden');
      toggle.textContent = hidden ? showText : hideText;
      toggle.setAttribute('aria-expanded', String(!hidden));
    }
    updateText();

    toggle.addEventListener('click', () => {
      form.classList.toggle('coords-hidden');
      updateText();
    });

    // Share the page address (it follows the picked place, see setUrlPlace)
    const share = document.createElement('button');
    share.type = 'button';
    share.className = 'coords-toggle';
    cityGroup.appendChild(share);
    const shareText = () => {
      share.textContent = (shareTexts[currentLanguage()] || shareTexts.en)[0];
    };
    shareText();
    share.addEventListener('click', async () => {
      const url = location.href;
      if (navigator.share) {
        try { await navigator.share({ title: document.title, url }); } catch (e) { /* cancelled */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        share.textContent = (shareTexts[currentLanguage()] || shareTexts.en)[1];
        setTimeout(shareText, 2000);
      } catch (e) {
        window.prompt('', url);
      }
    });

    // Add / remove the current place (city field + coordinates) as a favorite
    const favorite = document.createElement('button');
    favorite.type = 'button';
    favorite.className = 'coords-toggle favorite-toggle';
    cityGroup.appendChild(favorite);

    function currentPlace() {
      const lat = parseFloat(latitude.value);
      const lon = parseFloat(document.getElementById('longitude').value);
      if (!isFinite(lat) || !isFinite(lon)) return null;
      const params = new URLSearchParams(location.search);
      const sameAsUrl = Math.abs(parseFloat(params.get('lat')) - lat) < 0.001 && Math.abs(parseFloat(params.get('lon')) - lon) < 0.001;
      return {
        name: (document.getElementById('city').value || '').trim(),
        countryCode: sameAsUrl ? (params.get('cc') || '') : '',
        latitude: lat,
        longitude: lon
      };
    }

    let shownState = '';
    function favoriteText(force) {
      const place = currentPlace();
      const active = isFavorite(place);
      const state = `${currentLanguage()}|${active}|${place ? place.latitude + ',' + place.longitude : ''}`;
      if (state === shownState && !force) return;
      shownState = state;
      const t = favoriteTexts[currentLanguage()] || favoriteTexts.en;
      favorite.hidden = !place;
      favorite.textContent = active ? t.on : t.off;
      favorite.title = active ? t.remove : t.off.replace('☆ ', '');
      favorite.setAttribute('aria-pressed', String(active));
    }
    favoriteText(true);
    favorite.addEventListener('click', () => {
      const place = currentPlace();
      if (!place) return;
      if (!toggleFavorite(place)) {
        window.alert((favoriteTexts[currentLanguage()] || favoriteTexts.en).full);
      }
      favoriteText(true);
    });
    document.addEventListener('favoriteschange', () => favoriteText(true));
    // The place changes from several page scripts (search, map, buttons):
    // check it once a second instead of hooking each of them
    setInterval(favoriteText, 1000);

    const languageSelect = document.getElementById('language');
    if (languageSelect) {
      languageSelect.addEventListener('change', updateText);
      languageSelect.addEventListener('change', shareText);
      languageSelect.addEventListener('change', () => favoriteText(true));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCoordinatesToggle);
  } else {
    addCoordinatesToggle();
  }

  window.CitySearch = { search, attach, isAt, startPlace, openingPlace, setUrlPlace, favoritePlaces, favoriteTitle: () => (favoriteTexts[currentLanguage()] || favoriteTexts.en).title };
})();
