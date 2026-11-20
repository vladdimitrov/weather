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
    es: { open: 'Abrir menú', close: 'Cerrar menú' },
    fr: { open: 'Ouvrir le menu', close: 'Fermer le menu' },
    ro: { open: 'Deschide meniul', close: 'Închide meniul' },
    nl: { open: 'Menu openen', close: 'Menu sluiten' }
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
    // Bars drawn with CSS (/css/mobile.css), they turn into a cross when open
    const icon = document.createElement('span');
    icon.className = 'nav-menu-icon';
    icon.setAttribute('aria-hidden', 'true');
    toggle.appendChild(icon);

    header.insertBefore(toggle, header.firstChild);
    header.insertBefore(brand, toggle);

    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      const labels = menuLabels[document.documentElement.lang] || menuLabels.en;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? labels.close : labels.open);
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
    es: 'Sin conexión, se muestran los últimos datos guardados.',
    fr: 'Pas de connexion internet : affichage des dernières données enregistrées.',
    ro: 'Fără conexiune la internet, se afișează ultimele date salvate.',
    nl: 'Geen internetverbinding, de laatst opgeslagen gegevens worden getoond.'
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
    home: { en: 'Home', bg: 'Начало', de: 'Startseite', it: 'Home', es: 'Inicio', fr: 'Accueil', ro: 'Acasă', nl: 'Home' },
    weather: { en: 'Weather Forecast', bg: 'Прогноза за времето', de: 'Wettervorhersage', it: 'Previsioni del tempo', es: 'Pronóstico del tiempo', fr: 'Prévisions météo', ro: 'Prognoza meteo', nl: 'Weerbericht' },
    maps: { en: 'Weather Maps', bg: 'Карти за времето', de: 'Wetterkarten', it: 'Mappe meteorologiche', es: 'Mapas del tiempo', fr: 'Cartes météo', ro: 'Hărți meteo', nl: 'Weerkaarten' },
    holidays: { en: 'Holiday Calendar', bg: 'Календар на празниците', de: 'Feiertagskalender', it: 'Calendario delle festività', es: 'Calendario de festivos', fr: 'Calendrier des jours fériés', ro: 'Calendarul sărbătorilor', nl: 'Feestdagenkalender' },
    sources: { en: 'Data Sources', bg: 'Източници на данни', de: 'Datenquellen', it: 'Fonti dei dati', es: 'Fuentes de datos', fr: 'Sources des données', ro: 'Surse de date', nl: 'Gegevensbronnen' },
    sourcesShort: { en: 'Sources', bg: 'Източници', de: 'Quellen', it: 'Fonti', es: 'Fuentes', fr: 'Sources', ro: 'Surse', nl: 'Bronnen' },
    dataBy: { en: 'Data:', bg: 'Данни:', de: 'Daten:', it: 'Dati:', es: 'Datos:', fr: 'Données :', ro: 'Date:', nl: 'Gegevens:' },
    moon: { en: 'Moon Calendar', bg: 'Лунен календар', de: 'Mondkalender', it: 'Calendario lunare', es: 'Calendario lunar', fr: 'Calendrier lunaire', ro: 'Calendar lunar', nl: 'Maankalender' },
    allSections: { en: 'All sections', bg: 'Всички раздели', de: 'Alle Bereiche', it: 'Tutte le sezioni', es: 'Todas las secciones', fr: 'Toutes les rubriques', ro: 'Toate secțiunile', nl: 'Alle onderdelen' },
    sky: { en: 'The Sky', bg: 'Небето', de: 'Himmel', it: 'Il cielo', es: 'El cielo', fr: 'Le ciel', ro: 'Cerul', nl: 'De hemel' },
    auroraLink: { en: '🌌 Northern lights & the sky →', bg: '🌌 Северно сияние и небето →', de: '🌌 Polarlichter & Himmel →', it: '🌌 Aurora e cielo →', es: '🌌 Auroras y el cielo →', fr: '🌌 Aurores boréales et ciel →', ro: '🌌 Aurora boreală și cerul →', nl: '🌌 Noorderlicht en de hemel →' },
    resorts: { en: 'Resorts', bg: 'Курорти', de: 'Urlaubsorte', it: 'Località', es: 'Destinos', fr: 'Stations', ro: 'Stațiuni', nl: 'Vakantieoorden' },
    storms: { en: 'Magnetic Storms', bg: 'Магнитни бури', de: 'Magnetstürme', it: 'Tempeste magnetiche', es: 'Tormentas magnéticas', fr: 'Tempêtes magnétiques', ro: 'Furtuni magnetice', nl: 'Magnetische stormen' },
    about: { en: 'About', bg: 'За сайта', de: 'Über uns', it: 'Chi siamo', es: 'Acerca de', fr: 'À propos', ro: 'Despre site', nl: 'Over ons' },
    privacy: { en: 'Privacy', bg: 'Поверителност', de: 'Datenschutz', it: 'Privacy', es: 'Privacidad', fr: 'Confidentialité', ro: 'Confidențialitate', nl: 'Privacy' },
    cities: { en: 'Weather in Bulgarian cities', bg: 'Времето в градовете на България', de: 'Wetter in bulgarischen Städten', it: 'Meteo nelle città bulgare', es: 'El tiempo en ciudades de Bulgaria', fr: 'Météo dans les villes bulgares', ro: 'Vremea în orașele din Bulgaria', nl: 'Weer in Bulgaarse steden' },
    europe: { en: 'Weather in Europe →', bg: 'Времето в Европа →', de: 'Wetter in Europa →', it: 'Meteo in Europa →', es: 'El tiempo en Europa →', fr: 'Météo en Europe →', ro: 'Vremea în Europa →', nl: 'Weer in Europa →' },
    cityIndex: { en: 'All cities', bg: 'Всички градове', de: 'Alle Städte', it: 'Tutte le città', es: 'Todas las ciudades', fr: 'Toutes les villes', ro: 'Toate orașele', nl: 'Alle steden' },
    allCities: { en: 'All cities →', bg: 'Всички градове →', de: 'Alle Städte →', it: 'Tutte le città →', es: 'Todas las ciudades →', fr: 'Toutes les villes →', ro: 'Toate orașele →', nl: 'Alle steden →' },
    holidaysBg: { en: 'Public holidays in Bulgaria', bg: 'Официални празници в България', de: 'Feiertage in Bulgarien', it: 'Festività in Bulgaria', es: 'Festivos en Bulgaria', fr: 'Jours fériés en Bulgarie', ro: 'Sărbători legale în Bulgaria', nl: 'Feestdagen in Bulgarije' },
    stormsToday: { en: '🧭 Magnetic storms today →', bg: '🧭 Магнитни бури днес →', de: '🧭 Magnetstürme heute →', it: '🧭 Tempeste magnetiche oggi →', es: '🧭 Tormentas magnéticas hoy →', fr: '🧭 Tempêtes magnétiques aujourd’hui →', ro: '🧭 Furtuni magnetice azi →', nl: '🧭 Magnetische stormen vandaag →' }
  };

  // Pages that exist as a translation in /en/, /de/, /it/, /es/: the link follows the language
  // French, Dutch and Romanian addresses have their own words (/fr/meteo/, /nl/maan/; localPath in
  // .github/scripts/i18n.js, which build-main.js checks against this list)
  const localWords = {
    fr: { weather: 'previsions', maps: 'cartes', holliday_calendar: 'calendrier-jours-feries', 'magnitni-buri': 'tempetes-magnetiques', luna: 'lune', kurorti: 'stations', vremeto: 'meteo', praznici: 'jours-feries', nebeto: 'ciel', 'za-saita': 'a-propos', poveritelnost: 'confidentialite', iztochnici: 'sources', gradove: 'villes' },
    nl: { weather: 'weersverwachting', maps: 'weerkaarten', holliday_calendar: 'feestdagenkalender', 'magnitni-buri': 'magnetische-stormen', luna: 'maan', kurorti: 'vakantieoorden', vremeto: 'weer', praznici: 'feestdagen', nebeto: 'hemel', 'za-saita': 'over-ons', poveritelnost: 'privacy', iztochnici: 'bronnen', gradove: 'steden', europe: 'europa' },
    ro: { weather: 'prognoza', maps: 'harti', holliday_calendar: 'calendar-sarbatori', 'magnitni-buri': 'furtuni-magnetice', kurorti: 'statiuni', vremeto: 'vremea', praznici: 'sarbatori', nebeto: 'cerul', 'za-saita': 'despre', poveritelnost: 'confidentialitate', iztochnici: 'surse', gradove: 'orase', europe: 'europa' }
  };
  const localPage = (lang, page) => page.replace(/^[^/]+/, word => (localWords[lang] || {})[word] || word);
  const localPages = { home: '', weather: 'weather/', maps: 'maps/', holidays: 'holliday_calendar/', storms: 'magnitni-buri/', moon: 'luna/', resorts: 'kurorti/', stormsToday: 'magnitni-buri/', allCities: 'vremeto/', holidaysBg: 'praznici/', sky: 'nebeto/', about: 'za-saita/', privacy: 'poveritelnost/', sources: 'iztochnici/', sourcesShort: 'iztochnici/', cityIndex: 'gradove/', europe: 'europe/' };

  function translateNav() {
    const lang = document.documentElement.lang;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const texts = navTexts[link.dataset.nav];
      if (texts) link.textContent = texts[lang] || texts.en;
      // the Bulgarian holiday page is /praznici/ (the calendar of other countries moved to /praznici/darzhavi/)
      const page = lang === 'bg' && link.dataset.nav === 'holidays' ? 'praznici/' : localPages[link.dataset.nav];
      if (page !== undefined && (link.dataset.navLocal || !/^\/?(en|de|it|es|fr|nl|ro)\//.test(link.getAttribute('href') || ''))) {
        link.dataset.navLocal = '1';
        // Romanian exists for the home page and the resorts only: the other links lead to the English page
        const own = lang === 'ro' && !['', 'kurorti/'].includes(page) ? 'en' : lang;
        link.setAttribute('href', (own === 'bg' || !navTexts.home[own] ? '/' : '/' + own + '/') + localPage(own, page));
      }
    });
  }

  // Storm notifications turned on at /magnitni-buri/: ask the service worker
  // to check the Kp forecast (at most every 3 hours); installed apps on
  // Android also check in the background
  function checkStormAlerts() {
    try {
      if (localStorage.getItem('stormAlerts') !== 'on') return;
      if (!('Notification' in window) || Notification.permission !== 'granted' || !navigator.serviceWorker) return;
      // The notification is written in the site language
      const language = document.documentElement.lang;
      const sendLanguage = () => navigator.serviceWorker.ready.then(registration => {
        if (registration.active) registration.active.postMessage({ type: 'language', language: document.documentElement.lang });
      });
      document.addEventListener('change', event => {
        if (event.target && event.target.id === 'language') sendLanguage();
      });
      const last = Number(localStorage.getItem('stormAlertsChecked') || 0);
      if (Date.now() - last < 3 * 3600 * 1000) {
        sendLanguage();
        return;
      }
      localStorage.setItem('stormAlertsChecked', String(Date.now()));
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) registration.active.postMessage({ type: 'storm-check', language });
      });
    } catch (e) { /* storage blocked */ }
  }

  // On wide screens the links sit in one row next to the language and
  // background selectors. When they don't fit (long labels in some languages,
  // smaller laptops), use the compact header with the menu button instead
  // (html.nav-compact in /css/mobile.css); narrow screens get it from CSS.
  const narrowScreen = window.matchMedia('(max-width: 768px)');

  function fitNav() {
    const header = document.querySelector('.nav-header');
    const root = document.documentElement;
    root.classList.remove('nav-compact');
    // very wide windows always have room for the row (a false alarm here hid the menu in Firefox at 80% zoom)
    if (!header || narrowScreen.matches || window.innerWidth >= 1600) return;
    const links = [...header.querySelectorAll('.nav-links .nav-link')];
    if (!links.length) return;
    const firstRow = links[0].getBoundingClientRect();
    const selectors = header.querySelector('.header-selectors');
    const wrapped = links.some(link => Math.abs(link.getBoundingClientRect().top - firstRow.top) > 4) ||
      (selectors && selectors.getBoundingClientRect().top >= firstRow.bottom) ||
      header.scrollHeight > header.clientHeight + 2;
    root.classList.toggle('nav-compact', wrapped);
  }

  function initNavFit() {
    const header = document.querySelector('.nav-header');
    if (!header) return;
    fitNav();
    let pending = false;
    const scheduleFit = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; fitNav(); });
    };
    window.addEventListener('resize', scheduleFit);
    // Labels change with the language: each page translates its own links,
    // some of them later, so watch the menu itself
    if (window.MutationObserver) {
      new MutationObserver(scheduleFit).observe(header.querySelector('.nav-links') || header, { childList: true, characterData: true, subtree: true });
    }
    // The display font is wider than the fallback font
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
    window.addEventListener('load', fitNav);
  }


  // ---- Install as an app ----
  // Chrome (Android, desktop): a button for the browser's install prompt, shown
  // only when the browser allows it. iPhone Safari has no prompt: the button
  // shows the steps. Hidden once installed, and for 30 days after "close".
  const installTexts = {
    en: { install: 'Install the app', ios: 'On iPhone: tap Share (square with arrow), then “Add to Home Screen”.', close: 'Close' },
    bg: { install: 'Инсталирай приложението', ios: 'На iPhone: натисни „Сподели“ (квадрат със стрелка), после „Добави към началния екран“.', close: 'Затвори' },
    de: { install: 'App installieren', ios: 'Auf dem iPhone: „Teilen“ (Quadrat mit Pfeil) antippen, dann „Zum Home-Bildschirm“.', close: 'Schließen' },
    it: { install: "Installa l'app", ios: 'Su iPhone: tocca Condividi (quadrato con freccia), poi “Aggiungi alla schermata Home”.', close: 'Chiudi' },
    es: { install: 'Instalar la aplicación', ios: 'En iPhone: toca Compartir (cuadrado con flecha) y luego “Añadir a pantalla de inicio”.', close: 'Cerrar' },
    fr: { install: 'Installer l’application', ios: 'Sur iPhone : touchez Partager (carré avec une flèche), puis « Sur l’écran d’accueil ».', close: 'Fermer' },
    ro: { install: 'Instalează aplicația', ios: 'Pe iPhone: atingeți Distribuie (pătrat cu săgeată), apoi „Adaugă pe ecranul principal”.', close: 'Închide' },
    nl: { install: 'App installeren', ios: 'Op de iPhone: tik op Deel (vierkant met pijl) en daarna op ‘Zet op beginscherm’.', close: 'Sluiten' }
  };

  function initInstall() {
    const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if (standalone) return;
    try {
      const dismissed = Number(localStorage.getItem('installDismissedAt') || 0);
      if (Date.now() - dismissed < 30 * 24 * 3600 * 1000) return;
    } catch (e) { /* storage blocked */ }

    const iosSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    let deferred = null;

    const box = document.createElement('div');
    box.className = 'install-app';
    box.hidden = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'install-app-button';
    const info = document.createElement('p');
    info.className = 'install-app-info';
    info.hidden = true;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'install-app-close';
    close.textContent = '✕';
    box.append(button, close, info);
    document.body.appendChild(box);

    function render() {
      const t = installTexts[document.documentElement.lang] || installTexts.en;
      button.textContent = '📲 ' + t.install;
      info.textContent = t.ios;
      close.setAttribute('aria-label', t.close);
      close.title = t.close;
    }

    function hide() {
      box.hidden = true;
    }

    button.addEventListener('click', async () => {
      if (iosSafari) {
        info.hidden = !info.hidden;
        return;
      }
      if (!deferred) return;
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) { /* ignore */ }
      deferred = null;
      hide();
    });

    close.addEventListener('click', () => {
      info.hidden = true;
      hide();
      try { localStorage.setItem('installDismissedAt', String(Date.now())); } catch (e) { /* storage blocked */ }
    });

    if (iosSafari) {
      // No install event on iPhone: show the steps on the first visit
      render();
      box.hidden = false;
    } else {
      window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferred = event;
        render();
        box.hidden = false;
      });
    }
    window.addEventListener('appinstalled', () => {
      deferred = null;
      hide();
    });
    const languageSelect = document.getElementById('language');
    if (languageSelect) languageSelect.addEventListener('change', render);
    render();
  }

  // a link at the very top for keyboard users: straight to the content, past the menu
  const skipTexts = { en: 'Skip to content', bg: 'Към съдържанието', de: 'Zum Inhalt springen', it: 'Vai al contenuto', es: 'Saltar al contenido', fr: 'Aller au contenu', ro: 'La conținut', nl: 'Naar de inhoud' };
  function initSkipLink() {
    if (document.querySelector('.skip-link')) return;
    const target = document.querySelector('[role="main"]') || document.querySelector('main') || document.querySelector('.container');
    if (!target) return;
    if (!target.id) target.id = 'main-content';
    target.setAttribute('tabindex', '-1');
    const link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#' + target.id;
    link.textContent = skipTexts[document.documentElement.lang] || skipTexts.en;
    document.body.insertBefore(link, document.body.firstChild);
    document.addEventListener('change', event => {
      if (event.target && event.target.id === 'language') setTimeout(() => { link.textContent = skipTexts[document.documentElement.lang] || skipTexts.en; }, 0);
    });
  }

  function initUnits() {
    if (document.querySelector('script[src*="/js/units.js"]')) return;
    const script = document.createElement('script');
    script.src = '/js/units.js?v=5';
    document.head.appendChild(script);
  }

  function initSite() {
    initUnits();
    initSkipLink();
    initMobileNav();
    updateYear();
    initOfflineNotice();
    registerServiceWorker();
    initInstall();
    translateNav();
    // The language dropdown is created later by /js/language-selector.js; its
    // own listener updates <html lang> before the change bubbles up to here
    document.addEventListener('change', event => {
      if (event.target && event.target.id === 'language') translateNav();
    });
    checkStormAlerts();
    // after the selectors are added by the scripts loaded after this one
    setTimeout(initNavFit, 0);
  }

  if (document.body) {
    initSite();
  } else {
    document.addEventListener('DOMContentLoaded', initSite);
  }

  // A page in another language than Bulgarian is hidden (html.i18n-pending,
  // set in the page head) until the page scripts have translated it: they do
  // it on DOMContentLoaded, so show it right after their handlers have run
  function revealPage() {
    document.documentElement.classList.remove('i18n-pending');
  }
  if (document.documentElement.classList.contains('i18n-pending')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(revealPage, 0));
    } else {
      setTimeout(revealPage, 0);
    }
  }
})();

// Every page gets the "Share" button: the pages that carry a [data-share] box load /js/share.js themselves, all the
// others (10-day pages, Europe, Greece, hubs, home ...) get it from here, placed after the main heading
(function () {
  if (document.querySelector('script[src*="/js/share.js"]')) return;
  if (/^\/(widget|poveritelnost|contacts|za-saita)\//.test(location.pathname) || /\/(poveritelnost|contacts|za-saita)\//.test(location.pathname)) return;
  const script = document.createElement('script');
  script.src = '/js/share.js?v=4';
  script.defer = true;
  document.head.appendChild(script);
})();
