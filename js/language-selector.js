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
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    return languages.some(lang => lang.value === saved) ? saved : 'en';
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
