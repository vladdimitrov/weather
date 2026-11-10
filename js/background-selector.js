// Shared background selector for all pages.
// Builds the #background-color dropdown in the header, applies the saved
// background and saves new choices. Load it after /js/language-selector.js so
// it appears next to the language dropdown and follows its language.
(function () {
  const STORAGE_KEY = 'defaultBackground';
  const DEFAULT_BACKGROUND = 'sunset';

  // Deep, rich tones: three colour stops plus a soft light from the top left corner.
  // The keys are saved in the visitor's browser, so the old ones keep their names.
  const GLOW = 'radial-gradient(ellipse at 15% 0%, rgba(255,255,255,0.14), rgba(255,255,255,0) 55%), ';
  const backgrounds = {
    blue: GLOW + 'linear-gradient(135deg, #06204a 0%, #0d47a1 52%, #2284d6 100%)',
    default: GLOW + 'linear-gradient(135deg, #1d1450 0%, #4a2f9e 50%, #8a6fe0 100%)',
    dark: GLOW + 'linear-gradient(135deg, #0c0c0f 0%, #1c1d22 50%, #34363d 100%)',
    green: GLOW + 'linear-gradient(135deg, #03251d 0%, #0a6650 52%, #14a37c 100%)',
    purple: GLOW + 'linear-gradient(135deg, #1c0937 0%, #5b1f8e 52%, #a63fc4 100%)',
    red: GLOW + 'linear-gradient(135deg, #26050e 0%, #7a1026 52%, #c22b3c 100%)',
    midnight: GLOW + 'linear-gradient(135deg, #01030c 0%, #0a1740 52%, #1a3a7a 100%)',
    gold: GLOW + 'linear-gradient(135deg, #16100a 0%, #4a3414 50%, #a07c2c 100%)',
    teal: GLOW + 'linear-gradient(135deg, #021822 0%, #06506a 52%, #0f8fa3 100%)',
    rose: GLOW + 'linear-gradient(135deg, #240c1a 0%, #7a2a55 52%, #c8648e 100%)',
    sunset: GLOW + 'linear-gradient(135deg, #160d33 0%, #692c6b 50%, #d8664e 100%)'
  };
  // Logo glow colour (r, g, b) on the home page for the newer backgrounds
  const AURA = { midnight: '90, 130, 230', gold: '230, 190, 90', teal: '40, 190, 210', rose: '230, 120, 170', sunset: '240, 130, 90' };

  const texts = {
    en: { label: 'Background:', blue: 'Blue', default: 'Default (Purple)', dark: 'Dark', green: 'Green', purple: 'Purple', red: 'Red', midnight: 'Midnight', gold: 'Gold', teal: 'Teal', rose: 'Rose', sunset: 'Sunset' },
    bg: { label: 'Фон:', blue: 'Син', default: 'Стандартен (лилав)', dark: 'Тъмен', green: 'Зелен', purple: 'Лилав', red: 'Червен', midnight: 'Полунощ', gold: 'Злато', teal: 'Морска вълна', rose: 'Розов', sunset: 'Залез' },
    de: { label: 'Hintergrund:', blue: 'Blau', default: 'Standard (Lila)', dark: 'Dunkel', green: 'Grün', purple: 'Lila', red: 'Rot', midnight: 'Mitternacht', gold: 'Gold', teal: 'Türkis', rose: 'Rosé', sunset: 'Sonnenuntergang' },
    it: { label: 'Sfondo:', blue: 'Blu', default: 'Predefinito (Viola)', dark: 'Scuro', green: 'Verde', purple: 'Viola', red: 'Rosso', midnight: 'Mezzanotte', gold: 'Oro', teal: 'Turchese', rose: 'Rosa', sunset: 'Tramonto' },
    es: { label: 'Fondo:', blue: 'Azul', default: 'Predeterminado (Morado)', dark: 'Oscuro', green: 'Verde', purple: 'Morado', red: 'Rojo', midnight: 'Medianoche', gold: 'Oro', teal: 'Turquesa', rose: 'Rosa', sunset: 'Atardecer' }
  };

  // A background the visitor picked wins; otherwise the default (Sunset)
  function getSavedBackground() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    if (backgrounds[saved]) return saved;
    return DEFAULT_BACKGROUND;
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
    if (AURA[background]) body.style.setProperty('--aura', AURA[background]);
    body.style.backgroundAttachment = 'fixed';

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
