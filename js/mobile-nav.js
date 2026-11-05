// Site-wide script, loaded on every page:
//  - mobile navigation: adds the site name and a menu button to the header.
//    On narrow screens /css/mobile.css hides the links and selectors until the
//    button opens them; on wide screens both added elements are hidden.
//  - footer year, service worker (installable app, offline data) and an
//    "offline" notice.
(function () {
  const menuLabels = {
    en: { open: 'Open menu', close: 'Close menu' },
    bg: { open: 'Отвори менюто', close: 'Затвори менюто' },
    de: { open: 'Menü öffnen', close: 'Menü schließen' },
    it: { open: 'Apri menu', close: 'Chiudi menu' },
    es: { open: 'Abrir menú', close: 'Cerrar menú' }
  };

  function initMobileNav() {
    const header = document.querySelector('.nav-header');
    if (!header || header.querySelector('.nav-menu-toggle')) return;

    const brand = document.createElement('a');
    brand.className = 'nav-brand';
    brand.href = '/';
    brand.textContent = 'Weather Pulse';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-menu-toggle';
    if (header.id) toggle.setAttribute('aria-controls', header.id);

    header.insertBefore(toggle, header.firstChild);
    header.insertBefore(brand, toggle);

    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      const labels = menuLabels[document.documentElement.lang] || menuLabels.en;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? labels.close : labels.open);
      toggle.textContent = open ? '✕' : '☰';
    }
    setOpen(false);

    toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));

    header.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Close when tapping outside the menu or pressing Escape
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  // Footer copyright year
  function updateYear() {
    document.querySelectorAll('.current-year').forEach(element => {
      element.textContent = new Date().getFullYear();
    });
  }

  // Shown while there is no connection: the service worker then serves the
  // last saved pages and data
  const offlineText = {
    en: 'No internet connection, showing the last saved data.',
    bg: 'Няма връзка с интернет, показват се последните запазени данни.',
    de: 'Keine Internetverbindung, die zuletzt gespeicherten Daten werden angezeigt.',
    it: 'Nessuna connessione, vengono mostrati gli ultimi dati salvati.',
    es: 'Sin conexión, se muestran los últimos datos guardados.'
  };

  function initOfflineNotice() {
    const notice = document.createElement('div');
    notice.className = 'offline-notice';
    notice.setAttribute('role', 'status');
    notice.hidden = true;
    document.body.appendChild(notice);
    const update = () => {
      notice.textContent = offlineText[document.documentElement.lang] || offlineText.en;
      notice.hidden = navigator.onLine;
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error('Service worker registration failed:', err));
    }
  }

  // Menu links marked with data-nav (the newer pages and the "Magnetic
  // storms" link on every page); the older links are translated by each page
  const navTexts = {
    home: { en: 'Home', bg: 'Начало', de: 'Startseite', it: 'Home', es: 'Inicio' },
    weather: { en: 'Weather Forecast', bg: 'Прогноза за времето', de: 'Wettervorhersage', it: 'Previsioni del tempo', es: 'Pronóstico del tiempo' },
    maps: { en: 'Weather Maps', bg: 'Карти за времето', de: 'Wetterkarten', it: 'Mappe meteorologiche', es: 'Mapas del tiempo' },
    holidays: { en: 'Holiday Calendar', bg: 'Календар на празниците', de: 'Feiertagskalender', it: 'Calendario delle festività', es: 'Calendario de festivos' },
    sources: { en: 'Data Sources', bg: 'Източници на данни', de: 'Datenquellen', it: 'Fonti dei dati', es: 'Fuentes de datos' },
    storms: { en: 'Magnetic Storms', bg: 'Магнитни бури', de: 'Magnetstürme', it: 'Tempeste magnetiche', es: 'Tormentas magnéticas' },
    about: { en: 'About', bg: 'За сайта', de: 'Über uns', it: 'Chi siamo', es: 'Acerca de' },
    privacy: { en: 'Privacy', bg: 'Поверителност', de: 'Datenschutz', it: 'Privacy', es: 'Privacidad' },
    cities: { en: 'Weather in Bulgarian cities', bg: 'Времето в градовете на България', de: 'Wetter in bulgarischen Städten', it: 'Meteo nelle città bulgare', es: 'El tiempo en ciudades de Bulgaria' },
    allCities: { en: 'All cities →', bg: 'Всички градове →', de: 'Alle Städte →', it: 'Tutte le città →', es: 'Todas las ciudades →' },
    holidaysBg: { en: 'Public holidays in Bulgaria', bg: 'Официални празници в България', de: 'Feiertage in Bulgarien', it: 'Festività in Bulgaria', es: 'Festivos en Bulgaria' }
  };

  function translateNav() {
    const lang = document.documentElement.lang;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const texts = navTexts[link.dataset.nav];
      if (texts) link.textContent = texts[lang] || texts.en;
    });
  }

  // Storm notifications turned on at /magnitni-buri/: ask the service worker
  // to check the Kp forecast (at most every 3 hours); installed apps on
  // Android also check in the background
  function checkStormAlerts() {
    try {
      if (localStorage.getItem('stormAlerts') !== 'on') return;
      if (!('Notification' in window) || Notification.permission !== 'granted' || !navigator.serviceWorker) return;
      const last = Number(localStorage.getItem('stormAlertsChecked') || 0);
      if (Date.now() - last < 3 * 3600 * 1000) return;
      localStorage.setItem('stormAlertsChecked', String(Date.now()));
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) registration.active.postMessage({ type: 'storm-check' });
      });
    } catch (e) { /* storage blocked */ }
  }

  function initSite() {
    initMobileNav();
    updateYear();
    initOfflineNotice();
    registerServiceWorker();
    translateNav();
    // The language dropdown is created later by /js/language-selector.js; its
    // own listener updates <html lang> before the change bubbles up to here
    document.addEventListener('change', event => {
      if (event.target && event.target.id === 'language') translateNav();
    });
    checkStormAlerts();
  }

  if (document.body) {
    initSite();
  } else {
    document.addEventListener('DOMContentLoaded', initSite);
  }
})();
