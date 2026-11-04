// Mobile navigation for all pages: adds the site name and a menu button to the
// header. On narrow screens /css/mobile-nav.css hides the links and selectors
// until the button opens them; on wide screens both added elements are hidden.
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

  if (document.body) {
    initMobileNav();
  } else {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  }
})();
