// Cookie consent banner. Google Analytics is loaded only after the visitor accepts.
// The choice is stored in localStorage; the 🍪 button lets the visitor change it later.
(function () {
  const GA_ID = 'G-YT10DVQBCC';
  const STORAGE_KEY = 'cookieConsent'; // 'accepted' | 'rejected'

  const texts = {
    en: {
      more: 'Privacy policy',
      message: 'We use analytics cookies (Google Analytics) to understand how the site is used. They are only set if you accept.',
      accept: 'Accept',
      reject: 'Reject',
      settings: 'Cookie settings'
    },
    bg: {
      more: 'Политика за поверителност',
      message: 'Използваме бисквитки за анализ (Google Analytics), за да разберем как се използва сайтът. Те се записват само ако ги приемете.',
      accept: 'Приемам',
      reject: 'Отказвам',
      settings: 'Настройки за бисквитки'
    },
    de: {
      more: 'Datenschutzerklärung',
      message: 'Wir verwenden Analyse-Cookies (Google Analytics), um zu verstehen, wie die Website genutzt wird. Sie werden nur gesetzt, wenn Sie zustimmen.',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
      settings: 'Cookie-Einstellungen'
    },
    it: {
      more: 'Informativa sulla privacy',
      message: 'Utilizziamo cookie analitici (Google Analytics) per capire come viene utilizzato il sito. Vengono impostati solo se accetti.',
      accept: 'Accetta',
      reject: 'Rifiuta',
      settings: 'Impostazioni cookie'
    },
    es: {
      more: 'Política de privacidad',
      message: 'Usamos cookies analíticas (Google Analytics) para entender cómo se usa el sitio. Solo se instalan si las aceptas.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      settings: 'Configuración de cookies'
    }
  };

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  // The language of the page wins (the page is already in the visitor's language);
  // the saved choice is only a fallback, and English the last one
  function pageLanguage() {
    const fromPage = (document.documentElement.lang || '').slice(0, 2);
    if (texts[fromPage]) return fromPage;
    try {
      const saved = localStorage.getItem('selectedLanguage');
      if (texts[saved]) return saved;
    } catch (e) { /* ignore */ }
    return 'en';
  }

  function t() {
    return texts[pageLanguage()];
  }

  function privacyUrl() {
    const lang = pageLanguage();
    return lang === 'bg' ? '/poveritelnost/' : '/' + lang + '/poveritelnost/';
  }

  let gaLoaded = false;
  function loadAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
  }

  // Remove GA cookies (_ga, _ga_XXXX) for this domain and its parent domain
  function deleteAnalyticsCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      const name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name === '_gat') {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cc-banner {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: calc(var(--footer-height, 50px) + 12px);
        width: calc(100% - 32px);
        max-width: 640px;
        box-sizing: border-box;
        padding: 16px 20px;
        background: rgba(10, 25, 60, 0.95);
        border: 1px solid #FFD700;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.35);
        color: #fff;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        line-height: 1.5;
        z-index: 10000;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .cc-banner p {
        margin: 0;
        flex: 1 1 260px;
      }
      .cc-buttons {
        display: flex;
        gap: 8px;
        flex: 0 0 auto;
      }
      .cc-btn {
        font-family: inherit;
        font-size: 13px;
        padding: 8px 16px;
        border-radius: 20px;
        border: 2px solid #FFD700;
        cursor: pointer;
      }
      .cc-accept {
        background: #FFD700;
        color: #0a193c;
      }
      .cc-reject {
        background: transparent;
        color: #FFD700;
      }
      .cc-btn:hover {
        filter: brightness(1.15);
      }
      .cc-settings {
        position: fixed;
        right: 12px;
        bottom: calc(var(--footer-height, 50px) + 12px);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid rgba(255, 215, 0, 0.6);
        background: rgba(10, 25, 60, 0.7);
        font-size: 15px;
        line-height: 1;
        cursor: pointer;
        opacity: 0.6;
        z-index: 10000;
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .cc-settings.cc-away { opacity: 0; transform: translateY(12px); pointer-events: none; }
      .cc-settings:hover {
        opacity: 1;
      }
      @media print {
        .cc-banner, .cc-settings { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  let settingsButton = null;
  function showSettingsButton() {
    if (settingsButton) {
      settingsButton.style.display = '';
      return;
    }
    settingsButton = document.createElement('button');
    settingsButton.className = 'cc-settings';
    settingsButton.type = 'button';
    settingsButton.textContent = '🍪';
    settingsButton.title = t().settings;
    settingsButton.setAttribute('aria-label', t().settings);
    settingsButton.addEventListener('click', function () {
      settingsButton.style.display = 'none';
      showBanner();
    });
    document.body.appendChild(settingsButton);
    // out of the way while the page scrolls down, back when it scrolls up or stops
    let lastY = window.scrollY, idle = null;
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      if (y > lastY + 4 && y > 200) settingsButton.classList.add('cc-away');
      else if (y < lastY - 4) settingsButton.classList.remove('cc-away');
      lastY = y;
      clearTimeout(idle);
      idle = setTimeout(function () { settingsButton.classList.remove('cc-away'); }, 1200);
    }, { passive: true });
  }

  function showBanner() {
    const text = t();
    const banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', text.settings);

    const message = document.createElement('p');
    message.textContent = text.message + ' ';
    const more = document.createElement('a');
    more.href = privacyUrl();
    more.textContent = text.more;
    more.style.color = 'inherit';
    message.appendChild(more);

    const buttons = document.createElement('div');
    buttons.className = 'cc-buttons';

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'cc-btn cc-reject';
    reject.textContent = text.reject;
    reject.addEventListener('click', function () {
      const wasAccepted = getConsent() === 'accepted';
      setConsent('rejected');
      deleteAnalyticsCookies();
      banner.remove();
      showSettingsButton();
      // GA is already running on this page - reload so it stops
      if (wasAccepted && gaLoaded) location.reload();
    });

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'cc-btn cc-accept';
    accept.textContent = text.accept;
    accept.addEventListener('click', function () {
      setConsent('accepted');
      loadAnalytics();
      banner.remove();
      showSettingsButton();
    });

    buttons.appendChild(reject);
    buttons.appendChild(accept);
    banner.appendChild(message);
    banner.appendChild(buttons);
    document.body.appendChild(banner);
    // the language can change after the banner is shown (first visit: the browser's language)
    document.addEventListener('change', function (event) {
      if (event.target && event.target.id === 'language' && banner.isConnected) {
        setTimeout(function () { if (banner.isConnected) { banner.remove(); showBanner(); } }, 0);
      }
    }, { once: true });
  }

  function init() {
    addStyles();
    const consent = getConsent();
    if (consent === 'accepted') {
      loadAnalytics();
      showSettingsButton();
    } else if (consent === 'rejected') {
      showSettingsButton();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
