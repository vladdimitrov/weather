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

  function initSite() {
    initMobileNav();
    updateYear();
    initOfflineNotice();
    registerServiceWorker();
  }

  if (document.body) {
    initSite();
  } else {
    document.addEventListener('DOMContentLoaded', initSite);
  }
})();
