// Shared background selector for all pages.
// Builds the #background-color dropdown in the header, applies the saved
// background and saves new choices. Load it after /js/language-selector.js so
// it appears next to the language dropdown and follows its language.
(function () {
  const STORAGE_KEY = 'defaultBackground';
  const DEFAULT_BACKGROUND = 'blue';

  const backgrounds = {
    blue: 'linear-gradient(135deg, #00c6ff, #0072ff)',
    default: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
    dark: 'linear-gradient(135deg, #232526, #414345)',
    green: 'linear-gradient(135deg, #11998e, #38ef7d)',
    purple: 'linear-gradient(135deg, #834d9b, #d04ed6)',
    red: 'linear-gradient(135deg, #cb2d3e, #ef473a)'
  };

  const texts = {
    en: { label: 'Background:', blue: 'Blue', default: 'Default (Purple)', dark: 'Dark', green: 'Green', purple: 'Purple', red: 'Red' },
    bg: { label: 'Фон:', blue: 'Син', default: 'Стандартен (лилав)', dark: 'Тъмен', green: 'Зелен', purple: 'Лилав', red: 'Червен' },
    de: { label: 'Hintergrund:', blue: 'Blau', default: 'Standard (Lila)', dark: 'Dunkel', green: 'Grün', purple: 'Lila', red: 'Rot' },
    it: { label: 'Sfondo:', blue: 'Blu', default: 'Predefinito (Viola)', dark: 'Scuro', green: 'Verde', purple: 'Viola', red: 'Rosso' },
    es: { label: 'Fondo:', blue: 'Azul', default: 'Predeterminado (Morado)', dark: 'Oscuro', green: 'Verde', purple: 'Morado', red: 'Rojo' }
  };

  function getSavedBackground() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    return backgrounds[saved] ? saved : DEFAULT_BACKGROUND;
  }

  function saveBackground(background) {
    try { localStorage.setItem(STORAGE_KEY, background); } catch (e) { /* storage blocked */ }
  }

  // The bg-* class drives the logo aura on the home page
  function applyBackground(background, animate) {
    const body = document.body;
    Object.keys(backgrounds).forEach(name => body.classList.remove('bg-' + name));
    if (animate) body.style.transition = 'background 0.5s ease';
    body.style.background = backgrounds[background];
    body.classList.add('bg-' + background);

    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      if (animate) formContainer.style.transition = 'background 0.5s ease, box-shadow 0.5s ease';
      formContainer.style.background = background === 'dark' ? 'rgba(20, 20, 20, 0.8)' : 'rgba(28, 46, 74, 0.8)';
    }
  }

  function getSelectorsContainer() {
    let container = document.getElementById('selectors-container');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'selectors-container';
    container.className = 'header-selectors';
    const navHeader = document.querySelector('.nav-header');
    if (navHeader) {
      navHeader.appendChild(container);
    } else {
      document.body.insertBefore(container, document.body.firstChild);
    }
    return container;
  }

  function createBackgroundSelector() {
    const savedBackground = getSavedBackground();
    applyBackground(savedBackground, false);

    if (document.getElementById('background-color')) return;

    const backgroundGroup = document.createElement('div');
    backgroundGroup.className = 'form-group background';

    const backgroundLabel = document.createElement('label');
    backgroundLabel.setAttribute('for', 'background-color');
    backgroundLabel.id = 'backgroundLabel';

    const backgroundSelect = document.createElement('select');
    backgroundSelect.id = 'background-color';
    Object.keys(backgrounds).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      backgroundSelect.appendChild(option);
    });
    backgroundSelect.value = savedBackground;

    backgroundGroup.appendChild(backgroundLabel);
    backgroundGroup.appendChild(backgroundSelect);
    getSelectorsContainer().appendChild(backgroundGroup);

    function translate() {
      const t = texts[document.documentElement.lang] || texts.en;
      backgroundLabel.textContent = t.label;
      [...backgroundSelect.options].forEach(option => {
        option.textContent = t[option.value];
      });
    }
    translate();

    backgroundSelect.addEventListener('change', event => {
      saveBackground(event.target.value);
      applyBackground(event.target.value, true);
    });

    const languageSelect = document.getElementById('language');
    if (languageSelect) {
      languageSelect.addEventListener('change', translate);
    }
  }

  if (document.body) {
    createBackgroundSelector();
  } else {
    document.addEventListener('DOMContentLoaded', createBackgroundSelector);
  }
})();
