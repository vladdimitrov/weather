// Shared language selector for all pages.
// Builds the #language dropdown in the header, restores the saved language and
// keeps localStorage and <html lang> in sync. Page scripts translate their own
// content by listening to the dropdown's "change" event.
// Load it before the page scripts so #language exists when they run.
(function () {
  const STORAGE_KEY = 'selectedLanguage';

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'bg', label: 'Български' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'es', label: 'Español' }
  ];

  const labelTranslations = {
    en: 'Language:',
    bg: 'Език:',
    de: 'Sprache:',
    it: 'Lingua:',
    es: 'Idioma:'
  };

  function getSavedLanguage() {
    // Pages written in one language (the English /europe/ pages) keep it
    const fixed = document.documentElement.dataset.pageLang;
    if (fixed) return fixed;
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    // Bulgarian unless the visitor picked another language
    return languages.some(lang => lang.value === saved) ? saved : 'bg';
  }

  // First visit (nothing chosen yet): the language of the browser, English when the site does not
  // have it. Search engines and other robots keep the Bulgarian original.
  function browserLanguage() {
    if (/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent || '')) return null;
    const wanted = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map(code => String(code).slice(0, 2).toLowerCase());
    const match = wanted.find(code => languages.some(lang => lang.value === code));
    return match || (wanted[0] ? 'en' : null);
  }

  function nothingChosen() {
    if (document.documentElement.dataset.pageLang) return false;
    try { return localStorage.getItem(STORAGE_KEY) === null; } catch (e) { return false; }
  }

  function saveLanguage(language) {
    try { localStorage.setItem(STORAGE_KEY, language); } catch (e) { /* storage blocked */ }
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

  function createLanguageSelector() {
    if (document.getElementById('language')) return;

    const savedLanguage = getSavedLanguage();

    const languageGroup = document.createElement('div');
    languageGroup.className = 'form-group language';

    const languageLabel = document.createElement('label');
    languageLabel.setAttribute('for', 'language');
    languageLabel.id = 'languageLabel';
    languageLabel.textContent = labelTranslations[savedLanguage];

    const languageSelect = document.createElement('select');
    languageSelect.id = 'language';
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.value;
      option.textContent = lang.label;
      languageSelect.appendChild(option);
    });
    languageSelect.value = savedLanguage;

    languageGroup.appendChild(languageLabel);
    languageGroup.appendChild(languageSelect);
    getSelectorsContainer().appendChild(languageGroup);

    document.documentElement.lang = savedLanguage;

    if (nothingChosen()) {
      const detected = browserLanguage();
      if (detected && detected !== savedLanguage) {
        // after the page scripts have attached their listeners
        window.addEventListener('load', () => setTimeout(() => {
          languageSelect.value = detected;
          languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }, 0));
      }
    }

    // Registered first, so page listeners already see the new language
    languageSelect.addEventListener('change', event => {
      const selectedLanguage = event.target.value;
      saveLanguage(selectedLanguage);
      // A page that exists in this language as its own URL (<link rel="alternate" hreflang>):
      // open the translation instead of translating in place
      const alternate = document.querySelector('link[rel="alternate"][hreflang="' + selectedLanguage + '"]');
      if (alternate && selectedLanguage !== document.documentElement.dataset.pageLang) {
        location.href = new URL(alternate.href).pathname + location.search + location.hash;
        return;
      }
      document.documentElement.lang = selectedLanguage;
      languageLabel.textContent = labelTranslations[selectedLanguage] || labelTranslations.en;
    });
  }

  // Pick the text for the current language from { en, bg, de, it, es },
  // falling back to English. Used by page scripts for short messages.
  window.pickText = function (texts) {
    return texts[document.documentElement.lang] || texts.en;
  };

  if (document.body) {
    createLanguageSelector();
  } else {
    document.addEventListener('DOMContentLoaded', createLanguageSelector);
  }
})();
