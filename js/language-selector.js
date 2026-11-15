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
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'nl', label: 'Nederlands' }
  ];

  const labelTranslations = {
    en: 'Language:',
    bg: 'Език:',
    de: 'Sprache:',
    it: 'Lingua:',
    es: 'Idioma:',
    fr: 'Langue :',
    nl: 'Taal:'
  };

  function getSavedLanguage() {
    // Pages written in one language (every generated page: /en/luna/ ...) keep it
    const fixed = document.documentElement.dataset.pageLang;
    if (fixed) return fixed;
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    // Bulgarian unless the visitor picked another language
    return languages.some(lang => lang.value === saved) ? saved : 'bg';
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

    // Registered first, so page listeners already see the new language
    languageSelect.addEventListener('change', event => {
      const selectedLanguage = event.target.value;
      saveLanguage(selectedLanguage);
      // A page that exists in this language as its own URL (<link rel="alternate" hreflang>):
      // open the translation instead of translating in place
      // or in data-alt on <html>, which lists the translations that are not indexed too
      let target = null;
      try { target = (JSON.parse(document.documentElement.dataset.alt || 'null') || {})[selectedLanguage] || null; } catch (e) { /* no list */ }
      const alternate = document.querySelector('link[rel="alternate"][hreflang="' + selectedLanguage + '"]');
      if (!target && alternate) target = new URL(alternate.href).pathname;
      if (target && selectedLanguage !== document.documentElement.dataset.pageLang) {
        location.href = target + location.search + location.hash;
        return;
      }
      document.documentElement.lang = selectedLanguage;
      languageLabel.textContent = labelTranslations[selectedLanguage] || labelTranslations.en;
    });
  }

  // Plain links to the other language versions (above the footer, data-set-lang): remember the
  // language before the page opens, or the Bulgarian page would send the visitor back
  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[data-set-lang]');
    if (link) saveLanguage(link.dataset.setLang);
  });

  // Pick the text for the current language from { en, bg, de, it, es, fr, nl },
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
