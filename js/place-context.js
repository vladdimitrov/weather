// The place the visitor works with, shared by the pages that adapt to a country (home page
// cities, /nebeto/ and its aurora hint). It is the same "lastLocation" the forecast page saves
// when a place is picked there; without it the place is Sofia, Bulgaria.
//   PlaceContext.get()                    → { name, countryCode, latitude, longitude, isDefault }
//   PlaceContext.destinations()           → Promise of js/destinations.json ({ CC: [places] })
//   PlaceContext.countryName(code, lang)  → name of the country in the language
//   PlaceContext.placeName(place, lang)   → name of the place in the language (when the list has it)
//   PlaceContext.setCountry(code)         → picks the first (main) place of that country
//   PlaceContext.timeZone(place)          → Promise of the IANA time zone of the place
//   PlaceContext.auroraBand(place)        → { kpMin, level } rough guide for seeing the northern lights
(function () {
  'use strict';

  const LOCALES = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const language = () => (LOCALES[document.documentElement.lang] ? document.documentElement.lang : 'bg');
  const DEFAULT = { name: 'Sofia', countryCode: 'BG', latitude: 42.6977, longitude: 23.3219, isDefault: true };

  function get() {
    try {
      const saved = JSON.parse(localStorage.getItem('lastLocation'));
      if (saved && saved.latitude && saved.longitude) {
        return {
          name: saved.city || '',
          countryCode: (saved.countryCode || '').toUpperCase(),
          latitude: parseFloat(saved.latitude),
          longitude: parseFloat(saved.longitude),
          isDefault: false
        };
      }
    } catch (e) { /* storage blocked or invalid data */ }
    return Object.assign({}, DEFAULT);
  }

  let destinationsPromise = null;
  function destinations() {
    if (!destinationsPromise) {
      destinationsPromise = fetch('/js/destinations.json').then(response => response.json()).catch(() => ({}));
    }
    return destinationsPromise;
  }

  function countryName(code, lang) {
    try {
      return new Intl.DisplayNames([LOCALES[lang || language()]], { type: 'region' }).of(code) || code;
    } catch (e) {
      return code;
    }
  }

  // The list knows the main places of 46 countries in five languages; other names stay as saved
  function placeName(place, lang, list) {
    const found = (list || []).find(item => Math.abs(item.latitude - place.latitude) < 0.1 && Math.abs(item.longitude - place.longitude) < 0.1);
    return (found && found.name[lang || language()]) || place.name || '';
  }

  function setCountry(code) {
    return destinations().then(all => {
      const main = (all[code] || [])[0];
      if (!main) return false;
      try {
        localStorage.setItem('lastLocation', JSON.stringify({
          city: main.name.en, latitude: main.latitude, longitude: main.longitude, country: countryName(code, 'en'), countryCode: code
        }));
      } catch (e) { /* storage blocked */ }
      return true;
    });
  }

  // Time zone from Open-Meteo (timezone=auto); remembered per place, the browser's zone if it fails
  function timeZone(place) {
    const key = 'tz:' + place.latitude.toFixed(1) + ',' + place.longitude.toFixed(1);
    try {
      const cached = localStorage.getItem(key);
      if (cached) return Promise.resolve(cached);
    } catch (e) { /* storage blocked */ }
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + place.latitude + '&longitude=' + place.longitude + '&current=temperature_2m&timezone=auto';
    return fetch(url).then(response => response.json()).then(data => {
      const zone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      try { localStorage.setItem(key, zone); } catch (e) { /* storage blocked */ }
      return zone;
    }).catch(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  }

  // Northern lights: how strong a storm is usually needed, by latitude (North America sees them
  // about 5° further south). A rough guide, not a forecast.
  function auroraBand(place) {
    const shift = ['US', 'CA'].includes(place.countryCode) ? 5 : 0;
    const latitude = Math.abs(place.latitude) + shift;
    if (latitude >= 60) return { kpMin: 2, level: 5 };
    if (latitude >= 55) return { kpMin: 4, level: 4 };
    if (latitude >= 50) return { kpMin: 5, level: 3 };
    if (latitude >= 45) return { kpMin: 6, level: 2 };
    if (latitude >= 37) return { kpMin: 7, level: 1 };
    return { kpMin: 10, level: 0 };
  }

  window.PlaceContext = { get, destinations, countryName, placeName, setCountry, timeZone, auroraBand, language };
})();
