console.log('DEBUG: Language switcher script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DEBUG: DOMContentLoaded fired in language switcher script');
  // Define translations for all UI elements
  const translations = {
    en: {
      title: "Weather forecast and magnetic storms",
      cityLabel: "City / Resort:",
      useLocation: "📍 Use the current location",
      holidayCalendarTitle: "Holiday Calendar",
      cityLabel: "City / Resort:",
      cityPlaceholder: "e.g. Sofia",
      latitudeLabel: "Latitude:",
      latitudePlaceholder: "e.g. 42.6977",
      longitudeLabel: "Longitude:",
      longitudePlaceholder: "e.g. 23.3219",
      fromDateLabel: "From Date:",
      toDateLabel: "To Date:",
      useLocationButton: "📍 Use the current location",
      loadHolidaysButton: "Load Holidays",
      printButton: "🖨️ Print",
      companyName: "JAMAZON",
      home: "Home",
      weatherForecast: "Weather Forecast",
      weatherMaps: "Weather Maps",
      dataSources: "Data Sources",
      daysLabel: "Number of days:",
      clearLocation: "Clear Location",
      loadData: "Load Forecast",
      date: "Date (Day)",
      minTemp: "Min Temp (°C)",
      maxTemp: "Max Temp (°C)",
      cloudiness: "Cloudiness (%)",
      rainfall: "Rainfall (mm)",
      wind: "Wind (km/h)",
      showHourly: "Show Hourly Forecast",
      print: "🖨️ Print",
      selectedLocation: "Selected location",
      localTime: "Local Time",
      kpIndex: "Kp index",
   holidayCalendarLinkNav: "Holiday Calendar",
      lunarCalendarTitle: "🌙 Lunar Calendar",
      loadLunarDataButton: "Load Lunar Data",
      period7Days: "7 Days",
      period30Days: "30 Days",
      currentMoonPhase: "Current Moon Phase",
      sunInformation: "☀️ Sun Information",
      sunrise: "Sunrise",
      sunset: "Sunset",
      zenith: "Zenith",
      dayLength: "Day Length",
      newMoon: "New Moon",
      waxingCrescent: "Waxing Crescent",
      firstQuarter: "First Quarter",
      waxingGibbous: "Waxing Gibbous",
      fullMoon: "Full Moon",
      waningGibbous: "Waning Gibbous",
      lastQuarter: "Last Quarter",
      waningCrescent: "Waning Crescent",
      illuminated: "illuminated",
      distance: "Distance",
      selectedDateDetails: "Selected Date Details",
      moonPhaseFor: "Moon Phase for",
      sunTimesFor: "Sun Times for",
      eclipsePredictions: "🌒 Eclipse Predictions",
      eclipseDetails: "Eclipse Details",
      lunarEclipse: "Lunar Eclipse",
      solarEclipse: "Solar Eclipse",
      eclipseStart: "Eclipse Start",
      eclipseMaximum: "Maximum Eclipse",
      eclipseEnd: "Eclipse End",
      eclipseMagnitude: "Magnitude",
      eclipseVisible: "Visible from location",
      eclipseNotVisible: "Not visible from location",
      // Calendar translations
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNames: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      // Holiday details translations
      holidayDate: "Date",
      countryCode: "Country Code",
      holidayType: "Type",
      // Error messages
      fillAllDates: "Please fill in all date fields.",
      couldNotDetermineCountry: "Could not determine country code for the selected city. Please try another city.",
      errorFetchingCountry: "Error fetching country code for the selected city. Please try again.",
      couldNotDetermineCountryCoords: "Could not determine country code from coordinates. Please try another location.",
      errorFetchingCountryCoords: "Error fetching country code from coordinates. Please try again.",
      enterCityOrLocation: "Please enter a city or use your current location.",
      errorFetchingHolidays: "Error fetching holidays. Please check the console for details.",
      locating: "Locating...",
      errorDeterminingCity: "Error determining city from your location. Please try again or enter manually.",
      couldNotGetLocation: "Could not get your location. Please ensure location services are enabled and try again.",
      geolocationNotSupported: "Geolocation is not supported by your browser."
    },
    bg: {
      title: "Прогноза за времето и магнитни бури",
      cityLabel: "Град / Курорт:",
      useLocation: "📍 Използвай текущото местоположение",
      holidayCalendarTitle: "Календар на празниците",
      cityLabel: "Град / Курорт:",
      cityPlaceholder: "напр. София",
      latitudeLabel: "Географска ширина:",
      latitudePlaceholder: "напр. 42.6977",
      longitudeLabel: "Географска дължина:",
      longitudePlaceholder: "напр. 23.3219",
      fromDateLabel: "От дата:",
      toDateLabel: "До дата:",
      useLocationButton: "📍 Използвай текущото местоположение",
      loadHolidaysButton: "Зареди празниците",
      printButton: "🖨️ Печат",
      companyName: "JAMAZON",
      home: "Начало",
      weatherForecast: "Прогноза за времето",
      weatherMaps: "Карти за времето",
      dataSources: "Източници на данни",
      daysLabel: "Брой дни:",
      clearLocation: "Изчисти местоположението",
      loadData: "Зареди прогнозата",
      date: "Дата (Ден)",
	  Weather:"Прогноза",
      minTemp: "Мин. темп. (°C)",
      maxTemp: "Макс. темп. (°C)",
      cloudiness: "Облачност (%)",
      rainfall: "Валежи (мм)",
      wind: "Вятър (км/ч)",
      showHourly: "Покажи почасова прогноза",
      print: "🖨️ Печат",
      selectedLocation: "Избрана локация",
      localTime: "Местно време",
      kpIndex: "Kp индекс",
   holidayCalendarLinkNav: "Календар на празниците",
      lunarCalendarTitle: "🌙 Лунен календар",
      loadLunarDataButton: "Зареди лунни данни",
      period7Days: "7 дни",
      period30Days: "30 дни",
      currentMoonPhase: "Текуща фаза на Луната",
      sunInformation: "☀️ Информация за Слънцето",
      sunrise: "Изгрев",
      sunset: "Залез",
      zenith: "Зенит",
      dayLength: "Продължителност на деня",
      newMoon: "Новолуние",
      waxingCrescent: "Растящ полумесец",
      firstQuarter: "Първа четвърт",
      waxingGibbous: "Растяща луна",
      fullMoon: "Пълнолуние",
      waningGibbous: "Намаляваща луна",
      lastQuarter: "Последна четвърт",
      waningCrescent: "Намаляващ полумесец",
      illuminated: "осветена",
      distance: "Разстояние",
      selectedDateDetails: "Детайли за избраната дата",
      moonPhaseFor: "Фаза на Луната за",
      sunTimesFor: "Слънчеви времена за",
      eclipsePredictions: "🌒 Предсказания за затъмнения",
      eclipseDetails: "Детайли за затъмнението",
      lunarEclipse: "Лунно затъмнение",
      solarEclipse: "Слънчево затъмнение",
      eclipseStart: "Начало на затъмнението",
      eclipseMaximum: "Максимално затъмнение",
      eclipseEnd: "Край на затъмнението",
      eclipseMagnitude: "Величина",
      eclipseVisible: "Видимо от местоположението",
      eclipseNotVisible: "Не е видимо от местоположението",
      // Calendar translations
      monthNames: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
      dayNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
      // Holiday details translations
      holidayDate: "Дата",
      countryCode: "Код на страната",
      holidayType: "Тип",
      // Error messages
      fillAllDates: "Моля, попълнете всички полета за дати.",
      couldNotDetermineCountry: "Не можа да се определи кодът на страната за избрания град. Моля, опитайте с друг град.",
      errorFetchingCountry: "Грешка при извличане на кода на страната за избрания град. Моля, опитайте отново.",
      couldNotDetermineCountryCoords: "Не можа да се определи кодът на страната от координатите. Моля, опитайте с друго местоположение.",
      errorFetchingCountryCoords: "Грешка при извличане на кода на страната от координатите. Моля, опитайте отново.",
      enterCityOrLocation: "Моля, въведете град или използвайте текущото си местоположение.",
      errorFetchingHolidays: "Грешка при извличане на празниците. Моля, проверете конзолата за подробности.",
      locating: "Локализиране...",
      errorDeterminingCity: "Грешка при определяне на града от вашето местоположение. Моля, опитайте отново или въведете ръчно.",
      couldNotGetLocation: "Не можа да се получи вашето местоположение. Моля, уверете се, че услугите за местоположение са включени и опитайте отново.",
      geolocationNotSupported: "Геолокацията не се поддържа от вашия браузър."
    },
    de: {
      title: "Wettervorhersage und Magnetstürme",
      cityLabel: "Stadt / Urlaubsort:",
      useLocation: "📍 Aktuellen Standort verwenden",
      holidayCalendarTitle: "Feiertagskalender",
      cityLabel: "Stadt / Urlaubsort:",
      cityPlaceholder: "z.B. Berlin",
      latitudeLabel: "Breitengrad:",
      latitudePlaceholder: "z.B. 42.6977",
      longitudeLabel: "Längengrad:",
      longitudePlaceholder: "z.B. 23.3219",
      fromDateLabel: "Von Datum:",
      toDateLabel: "Bis Datum:",
      useLocationButton: "📍 Aktuellen Standort verwenden",
      loadHolidaysButton: "Feiertage laden",
      printButton: "🖨️ Drucken",
      companyName: "JAMAZON",
      home: "Startseite",
      weatherForecast: "Wettervorhersage",
      weatherMaps: "Wetterkarten",
      dataSources: "Datenquellen",
      daysLabel: "Anzahl der Tage:",
      clearLocation: "Standort löschen",
      loadData: "Vorhersage laden",
      date: "Datum (Tag)",
      minTemp: "Min. Temp. (°C)",
      maxTemp: "Max. Temp. (°C)",
      cloudiness: "Bewölkung (%)",
      rainfall: "Niederschlag (mm)",
      wind: "Wind (km/h)",
      showHourly: "Stündliche Vorhersage anzeigen",
      print: "🖨️ Drucken",
      selectedLocation: "Ausgewählter Standort",
      localTime: "Ortszeit",
      kpIndex: "Kp-Index",
   holidayCalendarLinkNav: "Feiertagskalender",
      lunarCalendarTitle: "🌙 Mondkalender",
      loadLunarDataButton: "Monddaten laden",
      period7Days: "7 Tage",
      period30Days: "30 Tage",
      currentMoonPhase: "Aktuelle Mondphase",
      sunInformation: "☀️ Sonneninformationen",
      sunrise: "Sonnenaufgang",
      sunset: "Sonnenuntergang",
      zenith: "Zenit",
      dayLength: "Tageslänge",
      newMoon: "Neumond",
      waxingCrescent: "Zunehmender Sichelmond",
      firstQuarter: "Erstes Viertel",
      waxingGibbous: "Zunehmender Mond",
      fullMoon: "Vollmond",
      waningGibbous: "Abnehmender Mond",
      lastQuarter: "Letztes Viertel",
      waningCrescent: "Abnehmender Sichelmond",
      illuminated: "beleuchtet",
      distance: "Entfernung",
      selectedDateDetails: "Details zum ausgewählten Datum",
      moonPhaseFor: "Mondphase für",
      sunTimesFor: "Sonnenzeiten für",
      eclipsePredictions: "🌒 Finsternis-Vorhersagen",
      eclipseDetails: "Finsternis-Details",
      lunarEclipse: "Mondfinsternis",
      solarEclipse: "Sonnenfinsternis",
      eclipseStart: "Finsternis-Beginn",
      eclipseMaximum: "Maximale Finsternis",
      eclipseEnd: "Finsternis-Ende",
      eclipseMagnitude: "Magnitude",
      eclipseVisible: "Von Ihrem Standort aus sichtbar",
      eclipseNotVisible: "Von Ihrem Standort aus nicht sichtbar",
      // Calendar translations
      monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      dayNames: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
      // Holiday details translations
      holidayDate: "Datum",
      countryCode: "Ländercode",
      holidayType: "Typ",
      // Error messages
      fillAllDates: "Bitte füllen Sie alle Datumsfelder aus.",
      couldNotDetermineCountry: "Ländercode für die ausgewählte Stadt konnte nicht bestimmt werden. Bitte versuchen Sie eine andere Stadt.",
      errorFetchingCountry: "Fehler beim Abrufen des Ländercodes für die ausgewählte Stadt. Bitte versuchen Sie es erneut.",
      couldNotDetermineCountryCoords: "Ländercode aus Koordinaten konnte nicht bestimmt werden. Bitte versuchen Sie einen anderen Standort.",
      errorFetchingCountryCoords: "Fehler beim Abrufen des Ländercodes aus Koordinaten. Bitte versuchen Sie es erneut.",
      enterCityOrLocation: "Bitte geben Sie eine Stadt ein oder verwenden Sie Ihren aktuellen Standort.",
      errorFetchingHolidays: "Fehler beim Abrufen der Feiertage. Bitte überprüfen Sie die Konsole für Details.",
      locating: "Lokalisierung...",
      errorDeterminingCity: "Fehler beim Bestimmen der Stadt aus Ihrem Standort. Bitte versuchen Sie es erneut oder geben Sie manuell ein.",
      couldNotGetLocation: "Ihr Standort konnte nicht abgerufen werden. Bitte stellen Sie sicher, dass Standortdienste aktiviert sind und versuchen Sie es erneut.",
      geolocationNotSupported: "Geolokalisierung wird von Ihrem Browser nicht unterstützt."
    },
    it: {
      title: "Previsioni del tempo e tempeste magnetiche",
      cityLabel: "Città / Resort:",
      useLocation: "📍 Usa la posizione attuale",
      holidayCalendarTitle: "Calendario delle Festività",
      cityLabel: "Città / Resort:",
      cityPlaceholder: "es. Roma",
      latitudeLabel: "Latitudine:",
      latitudePlaceholder: "es. 41.9028",
      longitudeLabel: "Longitudine:",
      longitudePlaceholder: "es. 12.4964",
      fromDateLabel: "Data di inizio:",
      toDateLabel: "Data di fine:",
      useLocationButton: "📍 Usa la posizione attuale",
      loadHolidaysButton: "Carica Festività",
      printButton: "🖨️ Stampa",
      companyName: "JAMAZON",
      home: "Home",
      weatherForecast: "Previsioni del Tempo",
      weatherMaps: "Mappe Meteorologiche",
      dataSources: "Fonti di Dati",
      lunarCalendarTitle: "🌙 Calendario Lunare",
      loadLunarDataButton: "Carica dati lunari",
      period7Days: "7 giorni",
      period30Days: "30 giorni",
      currentMoonPhase: "Fase lunare attuale",
      sunInformation: "☀️ Informazioni sul sole",
      sunrise: "Alba",
      sunset: "Tramonto",
      zenith: "Zenit",
      dayLength: "Durata del giorno",
      newMoon: "Luna nuova",
      waxingCrescent: "Luna crescente",
      firstQuarter: "Primo quarto",
      waxingGibbous: "Gibbosa crescente",
      fullMoon: "Luna piena",
      waningGibbous: "Gibbosa calante",
      lastQuarter: "Ultimo quarto",
      waningCrescent: "Luna calante",
      illuminated: "illuminata",
      distance: "Distanza",
      selectedDateDetails: "Dettagli data selezionata",
      moonPhaseFor: "Fase lunare per",
      sunTimesFor: "Orari del sole per",
      eclipsePredictions: "🌒 Previsioni eclissi",
      eclipseDetails: "Dettagli eclissi",
      lunarEclipse: "Eclissi lunare",
      solarEclipse: "Eclissi solare",
      eclipseStart: "Inizio eclissi",
      eclipseMaximum: "Eclissi massima",
      eclipseEnd: "Fine eclissi",
      eclipseMagnitude: "Magnitudine",
      eclipseVisible: "Visibile dalla tua posizione",
      eclipseNotVisible: "Non visibile dalla tua posizione",
      daysLabel: "Numero di giorni:",
      clearLocation: "Cancella Posizione",
      loadData: "Carica Previsioni",
      date: "Data (Giorno)",
      minTemp: "Temp. Min (°C)",
      maxTemp: "Temp. Max (°C)",
      cloudiness: "Nuvolosità (%)",
      rainfall: "Precipitazioni (mm)",
      wind: "Vento (km/h)",
      showHourly: "Mostra Previsioni Orarie",
      print: "🖨️ Stampa",
      selectedLocation: "Posizione selezionata",
      localTime: "Ora Locale",
      kpIndex: "Indice Kp",
      holidayCalendarLinkNav: "Calendario delle Festività",
      // Calendar translations
      monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
      dayNames: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
      // Holiday details translations
      holidayDate: "Data",
      countryCode: "Codice Paese",
      holidayType: "Tipo",
      // Error messages
      fillAllDates: "Si prega di compilare tutti i campi data.",
      couldNotDetermineCountry: "Impossibile determinare il codice paese per la città selezionata. Prova con un'altra città.",
      errorFetchingCountry: "Errore nel recupero del codice paese per la città selezionata. Riprova.",
      couldNotDetermineCountryCoords: "Impossibile determinare il codice paese dalle coordinate. Prova con un'altra posizione.",
      errorFetchingCountryCoords: "Errore nel recupero del codice paese dalle coordinate. Riprova.",
      enterCityOrLocation: "Inserisci una città o usa la tua posizione attuale.",
      errorFetchingHolidays: "Errore nel recupero delle festività. Controlla la console per i dettagli.",
      locating: "Localizzazione...",
      errorDeterminingCity: "Errore nel determinare la città dalla tua posizione. Riprova o inserisci manualmente.",
      couldNotGetLocation: "Impossibile ottenere la tua posizione. Assicurati che i servizi di localizzazione siano abilitati e riprova.",
      geolocationNotSupported: "La geolocalizzazione non è supportata dal tuo browser."
    },
    es: {
      title: "Pronóstico del tiempo y tormentas magnéticas",
      cityLabel: "Ciudad / Resort:",
      useLocation: "📍 Usar ubicación actual",
      holidayCalendarTitle: "Calendario de Días Festivos",
      cityLabel: "Ciudad / Resort:",
      cityPlaceholder: "ej. Madrid",
      latitudeLabel: "Latitud:",
      latitudePlaceholder: "ej. 40.4168",
      longitudeLabel: "Longitud:",
      longitudePlaceholder: "ej. -3.7038",
      fromDateLabel: "Desde fecha:",
      toDateLabel: "Hasta fecha:",
      useLocationButton: "📍 Usar ubicación actual",
      loadHolidaysButton: "Cargar Días Festivos",
      printButton: "🖨️ Imprimir",
      companyName: "JAMAZON",
      home: "Inicio",
      weatherForecast: "Pronóstico del Tiempo",
      weatherMaps: "Mapas del Tiempo",
      dataSources: "Fuentes de Datos",
      lunarCalendarTitle: "🌙 Calendario Lunar",
      loadLunarDataButton: "Cargar datos lunares",
      period7Days: "7 días",
      period30Days: "30 días",
      currentMoonPhase: "Fase lunar actual",
      sunInformation: "☀️ Información del sol",
      sunrise: "Amanecer",
      sunset: "Atardecer",
      zenith: "Cenit",
      dayLength: "Duración del día",
      newMoon: "Luna nueva",
      waxingCrescent: "Luna creciente",
      firstQuarter: "Cuarto creciente",
      waxingGibbous: "Gibosa creciente",
      fullMoon: "Luna llena",
      waningGibbous: "Gibosa menguante",
      lastQuarter: "Cuarto menguante",
      waningCrescent: "Luna menguante",
      illuminated: "iluminada",
      distance: "Distancia",
      selectedDateDetails: "Detalles de fecha seleccionada",
      moonPhaseFor: "Fase lunar para",
      sunTimesFor: "Horarios del sol para",
      eclipsePredictions: "🌒 Predicciones de eclipses",
      eclipseDetails: "Detalles del eclipse",
      lunarEclipse: "Eclipse lunar",
      solarEclipse: "Eclipse solar",
      eclipseStart: "Inicio del eclipse",
      eclipseMaximum: "Eclipse máximo",
      eclipseEnd: "Fin del eclipse",
      eclipseMagnitude: "Magnitud",
      eclipseVisible: "Visible desde tu ubicación",
      eclipseNotVisible: "No visible desde tu ubicación",
      daysLabel: "Número de días:",
      clearLocation: "Limpiar Ubicación",
      loadData: "Cargar Pronóstico",
      date: "Fecha (Día)",
      minTemp: "Temp. Mín (°C)",
      maxTemp: "Temp. Máx (°C)",
      cloudiness: "Nubosidad (%)",
      rainfall: "Precipitación (mm)",
      wind: "Viento (km/h)",
      showHourly: "Mostrar Pronóstico por Horas",
      print: "🖨️ Imprimir",
      selectedLocation: "Ubicación seleccionada",
      localTime: "Hora Local",
      kpIndex: "Índice Kp",
      holidayCalendarLinkNav: "Calendario de Días Festivos",
      // Calendar translations
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      dayNames: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
      // Holiday details translations
      holidayDate: "Fecha",
      countryCode: "Código de País",
      holidayType: "Tipo",
      // Error messages
      fillAllDates: "Por favor, complete todos los campos de fecha.",
      couldNotDetermineCountry: "No se pudo determinar el código de país para la ciudad seleccionada. Pruebe con otra ciudad.",
      errorFetchingCountry: "Error al obtener el código de país para la ciudad seleccionada. Inténtelo de nuevo.",
      couldNotDetermineCountryCoords: "No se pudo determinar el código de país desde las coordenadas. Pruebe con otra ubicación.",
      errorFetchingCountryCoords: "Error al obtener el código de país desde las coordenadas. Inténtelo de nuevo.",
      enterCityOrLocation: "Por favor, ingrese una ciudad o use su ubicación actual.",
      errorFetchingHolidays: "Error al obtener los días festivos. Revise la consola para más detalles.",
      locating: "Localizando...",
      errorDeterminingCity: "Error al determinar la ciudad desde su ubicación. Inténtelo de nuevo o ingrese manualmente.",
      couldNotGetLocation: "No se pudo obtener su ubicación. Asegúrese de que los servicios de ubicación estén habilitados e inténtelo de nuevo.",
      geolocationNotSupported: "La geolocalización no es compatible con su navegador."
    }
  };

  function _t(key) {
    const language = document.documentElement.lang || 'en';
    return translations[language][key] || key;
  }

  function updateContent(language) {
    document.querySelectorAll('[data-translation-key]').forEach(element => {
      const key = element.dataset.translationKey;
      element.textContent = translations[language][key] || key;
    });
  }

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

    // Add event listener for language change
    languageSelect.addEventListener('change', (event) => {
      const selectedLanguage = event.target.value;
      localStorage.setItem('selectedLanguage', selectedLanguage);
      document.documentElement.lang = selectedLanguage;
      updateContent(selectedLanguage);
      // Update background label if background-selector.js is present
      const backgroundLabel = document.getElementById('backgroundLabel');
      if (backgroundLabel) {
        const bgLabelTranslations = {
          en: "Background:",
          bg: "Фон:",
          de: "Hintergrund:",
          it: "Sfondo:",
          es: "Fondo:"
        };
        backgroundLabel.textContent = bgLabelTranslations[selectedLanguage] || "Background:";
      }
    });

    // Set initial language based on saved preference or default to English
    // This is now handled by an inline script in the HTML to prevent flicker
    // const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    // languageSelect.value = savedLanguage;
    // document.documentElement.lang = savedLanguage;
    // updateContent(savedLanguage);
  }

  // Call the function to create the language selector when the DOM is loaded
  createLanguageSelector();
});
