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
    sky: { en: 'The Sky', bg: 'Небето', de: 'Himmel', it: 'Il cielo', es: 'El cielo' },
    auroraLink: { en: '🌌 Northern lights & the sky →', bg: '🌌 Северно сияние и небето →', de: '🌌 Polarlichter & Himmel →', it: '🌌 Aurora e cielo →', es: '🌌 Auroras y el cielo →' },
    storms: { en: 'Magnetic Storms', bg: 'Магнитни бури', de: 'Magnetstürme', it: 'Tempeste magnetiche', es: 'Tormentas magnéticas' },
    about: { en: 'About', bg: 'За сайта', de: 'Über uns', it: 'Chi siamo', es: 'Acerca de' },
    privacy: { en: 'Privacy', bg: 'Поверителност', de: 'Datenschutz', it: 'Privacy', es: 'Privacidad' },
    cities: { en: 'Weather in Bulgarian cities', bg: 'Времето в градовете на България', de: 'Wetter in bulgarischen Städten', it: 'Meteo nelle città bulgare', es: 'El tiempo en ciudades de Bulgaria' },
    allCities: { en: 'All cities →', bg: 'Всички градове →', de: 'Alle Städte →', it: 'Tutte le città →', es: 'Todas las ciudades →' },
    holidaysBg: { en: 'Public holidays in Bulgaria', bg: 'Официални празници в България', de: 'Feiertage in Bulgarien', it: 'Festività in Bulgaria', es: 'Festivos en Bulgaria' },
    stormsToday: { en: '🧭 Magnetic storms today →', bg: '🧭 Магнитни бури днес →', de: '🧭 Magnetstürme heute →', it: '🧭 Tempeste magnetiche oggi →', es: '🧭 Tormentas magnéticas hoy →' }
  };

  // Pages that exist as a translation in /en/, /de/, /it/, /es/: the link follows the language
  const localPages = { allCities: 'vremeto/', holidaysBg: 'praznici/', sky: 'nebeto/', about: 'za-saita/', privacy: 'poveritelnost/' };

  function translateNav() {
    const lang = document.documentElement.lang;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const texts = navTexts[link.dataset.nav];
      if (texts) link.textContent = texts[lang] || texts.en;
      const page = localPages[link.dataset.nav];
      if (page && (link.dataset.navLocal || !/^\/?(en|de|it|es)\//.test(link.getAttribute('href') || ''))) {
        link.dataset.navLocal = '1';
        link.setAttribute('href', (lang === 'bg' || !navTexts.home[lang] ? '/' : '/' + lang + '/') + page);
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
    // The Orbitron font is wider than the fallback font
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
    es: { install: 'Instalar la aplicación', ios: 'En iPhone: toca Compartir (cuadrado con flecha) y luego “Añadir a pantalla de inicio”.', close: 'Cerrar' }
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
  const skipTexts = { en: 'Skip to content', bg: 'Към съдържанието', de: 'Zum Inhalt springen', it: 'Vai al contenuto', es: 'Saltar al contenido' };
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
    script.src = '/js/units.js?v=2';
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
