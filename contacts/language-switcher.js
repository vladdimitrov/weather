document.addEventListener('DOMContentLoaded', function() {
  // Function to create and append the language selector
  function createLanguageSelector() {
    const selectorsContainer = document.getElementById('selectors-container');
    if (!selectorsContainer) {
      console.error('Selectors container not found!');
      return;
    }

    const languageGroup = document.createElement('div');
    languageGroup.className = 'form-group language';

    const languageLabel = document.createElement('label');
    languageLabel.setAttribute('for', 'language');
    languageLabel.id = 'languageLabel';
    languageLabel.textContent = 'Language:'; // Default text, will be updated by translation

    const languageSelect = document.createElement('select');
    languageSelect.id = 'language';

    const languages = [
      { value: 'en', label: 'English' },
      { value: 'bg', label: 'Български' },
      { value: 'de', label: 'Deutsch' },
      { value: 'it', label: 'Italiano' },
      { value: 'es', label: 'Español' }
    ];

    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.value;
      option.textContent = lang.label;
      languageSelect.appendChild(option);
    });

    languageGroup.appendChild(languageLabel);
    languageGroup.appendChild(languageSelect);
    selectorsContainer.appendChild(languageGroup);

    // Set initial language based on saved preference or default to English
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    languageSelect.value = savedLanguage;
    document.documentElement.lang = savedLanguage;
  }

  // Call the function to create the language selector when the DOM is loaded
  createLanguageSelector();
});