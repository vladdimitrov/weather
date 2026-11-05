// Define translations for all UI elements
const translations = {
  en: {
    sunMoon: "Sun & Moon",
    latitudeLabel: "Latitude:",
    longitudeLabel: "Longitude:",
    cityPlaceholder: "e.g. Sofia",
    latitudePlaceholder: "e.g. 42.6977",
    longitudePlaceholder: "e.g. 23.3219",
    daysPlaceholder: "e.g. 7",
    lastUpdated: "Last updated",
    hourlyForecastFor: "Hourly forecast for",
    noaaSource: "Data source: NOAA Space Weather Prediction Center (SWPC)",
    noaaView: "View on NOAA Space Weather Prediction Center",
    iconSnow: "Snow",
    iconRain: "Cloud with rain",
    iconCloud: "Cloudy",
    iconSunCloud: "Sun with clouds",
    iconSun: "Sunny",
    iconThunder: "Thunderstorm",
    title: "Weather forecast",
    cityLabel: "City / Resort:",
    useLocation: "📍 Use the current location",
    daysLabel: "Days:",
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
    hourlyDateTime: "Date and time",
    hourlyTemperature: "Temp. (°C)",
    hourlyCloudiness: "Cloudiness (%)",
    hourlyRainfall: "Rainfall (mm)",
    hourlyPrecipProb: "Precip. Prob. (%)",
    hourlyWind: "Wind (km/h)",
    numberOfHours: "Number of hours:",
    forecastInterval: "Interval (min.):",
    hourlyForecast: "Hourly forecast",
    solarCalendar: "☀️ Solar Calendar",
    lunarCalendar: "🌙 Lunar Calendar",
    sources: "📚 Sources",
    home: "Home",
    holidayCalendar: "Holiday Calendar",
    dataSources: "Data Sources",
    language: "Language",
    weather: "Weather",
	weatherMaps: "Weather maps"
  },
  bg: {
    sunMoon: "Слънце и Луна",
    latitudeLabel: "Географска ширина:",
    longitudeLabel: "Географска дължина:",
    cityPlaceholder: "напр. София",
    latitudePlaceholder: "напр. 42.6977",
    longitudePlaceholder: "напр. 23.3219",
    daysPlaceholder: "напр. 7",
    lastUpdated: "Последно обновяване",
    hourlyForecastFor: "Почасова прогноза за",
    noaaSource: "Източник на данните: NOAA Space Weather Prediction Center (SWPC)",
    noaaView: "Виж в NOAA Space Weather Prediction Center",
    iconSnow: "Сняг",
    iconRain: "Облак с дъжд",
    iconCloud: "Облачно",
    iconSunCloud: "Слънце и облаци",
    iconSun: "Слънчево",
    iconThunder: "Гръмотевична буря",
    title: "Прогноза за времето",
    cityLabel: "Град / Курорт:",
    useLocation: "📍 Използвай текущото местоположение",
    daysLabel: "Дни:",
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
    hourlyDateTime: "Дата и час",
    hourlyTemperature: "Темп. (°C)",
    hourlyCloudiness: "Облачност (%)",
    hourlyRainfall: "Валежи (мм)",
    hourlyPrecipProb: "Вероятност за валежи (%)",
    hourlyWind: "Вятър (км/ч)",
    numberOfHours: "Брой часове:",
    forecastInterval: "Интервал (мин.):",
    hourlyForecast: "Почасова прогноза",
    solarCalendar: "☀️ Слънчев календар",
    lunarCalendar: "🌙 Лунен календар",
    sources: "📚 Източници",
    home: "Начало",
    holidayCalendar: "Календар на празниците",
    dataSources: "Източници на данни",
    language: "Език",
    weather: "Прогноза",
	weatherMaps: "Карти за времето"
  },
  de: {
    sunMoon: "Sonne & Mond",
    latitudeLabel: "Breitengrad:",
    longitudeLabel: "Längengrad:",
    cityPlaceholder: "z. B. Sofia",
    latitudePlaceholder: "z. B. 42.6977",
    longitudePlaceholder: "z. B. 23.3219",
    daysPlaceholder: "z. B. 7",
    lastUpdated: "Zuletzt aktualisiert",
    hourlyForecastFor: "Stündliche Vorhersage für",
    noaaSource: "Datenquelle: NOAA Space Weather Prediction Center (SWPC)",
    noaaView: "Bei NOAA Space Weather Prediction Center ansehen",
    iconSnow: "Schnee",
    iconRain: "Wolke mit Regen",
    iconCloud: "Bewölkt",
    iconSunCloud: "Sonne mit Wolken",
    iconSun: "Sonnig",
    iconThunder: "Gewitter",
    title: "Wettervorhersage",
    cityLabel: "Stadt / Urlaubsort:",
    useLocation: "📍 Aktuellen Standort verwenden",
    daysLabel: "Tage:",
    clearLocation: "Standort löschen",
    loadData: "Vorhersage laden",
    date: "Datum (Tag)",
	Weather:"Прогноза",
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
    hourlyDateTime: "Datum und Uhrzeit",
    hourlyTemperature: "Temp. (°C)",
    hourlyCloudiness: "Bewölkung (%)",
    hourlyRainfall: "Niederschlag (mm)",
    hourlyPrecipProb: "Niederschlagswahrscheinlichkeit (%)",
    hourlyWind: "Wind (km/h)",
    numberOfHours: "Anzahl der Stunden:",
    forecastInterval: "Intervall (Min.):",
    hourlyForecast: "Stündliche Vorhersage",
    solarCalendar: "☀️ Sonnenkalender",
    lunarCalendar: "🌙 Mondkalender",
    sources: "📚 Quellen",
    home: "Startseite",
    holidayCalendar: "Feiertagskalender",
    dataSources: "Datenquellen",
    language: "Sprache",
    weather: "Wetter",
	weatherMaps: "Wetterkarten"
  },
  es: {
    sunMoon: "Sol y Luna",
    latitudeLabel: "Latitud:",
    longitudeLabel: "Longitud:",
    cityPlaceholder: "p. ej. Sofía",
    latitudePlaceholder: "p. ej. 42.6977",
    longitudePlaceholder: "p. ej. 23.3219",
    daysPlaceholder: "p. ej. 7",
    lastUpdated: "Última actualización",
    hourlyForecastFor: "Pronóstico por horas para",
    noaaSource: "Fuente de datos: NOAA Space Weather Prediction Center (SWPC)",
    noaaView: "Ver en NOAA Space Weather Prediction Center",
    iconSnow: "Nieve",
    iconRain: "Nube con lluvia",
    iconCloud: "Nublado",
    iconSunCloud: "Sol con nubes",
    iconSun: "Soleado",
    iconThunder: "Tormenta",
    title: "Pronóstico del tiempo",
    cityLabel: "Ciudad / Resort:",
    useLocation: "📍 Usar la ubicación actual",
    daysLabel: "Días:",
    clearLocation: "Limpiar ubicación",
    loadData: "Cargar pronóstico",
    date: "Fecha (Día)",
    weather: "Tiempo",
    minTemp: "Temp. mín. (°C)",
    maxTemp: "Temp. máx. (°C)",
    cloudiness: "Nubosidad (%)",
    rainfall: "Precipitación (mm)",
    wind: "Viento (km/h)",
    showHourly: "Mostrar pronóstico por horas",
    print: "🖨️ Imprimir",
    selectedLocation: "Ubicación seleccionada",
    localTime: "Hora local",
    kpIndex: "Índice Kp",
    hourlyDateTime: "Fecha y hora",
    hourlyTemperature: "Temp. (°C)",
    hourlyCloudiness: "Nubosidad (%)",
    hourlyRainfall: "Precipitación (mm)",
    hourlyPrecipProb: "Prob. de precip. (%)",
    hourlyWind: "Viento (km/h)",
    numberOfHours: "Número de horas:",
    forecastInterval: "Intervalo (min.):",
    hourlyForecast: "Pronóstico por horas",
    solarCalendar: "☀️ Calendario solar",
    lunarCalendar: "🌙 Calendario lunar",
    sources: "📚 Fuentes",
    home: "Inicio",
    holidayCalendar: "Calendario de fiestas",
    dataSources: "Fuentes de datos",
    language: "Idioma",
	weatherMaps: "Mapas del Tiempo"
  },
  it: {
    sunMoon: "Sole e Luna",
    latitudeLabel: "Latitudine:",
    longitudeLabel: "Longitudine:",
    cityPlaceholder: "es. Sofia",
    latitudePlaceholder: "es. 42.6977",
    longitudePlaceholder: "es. 23.3219",
    daysPlaceholder: "es. 7",
    lastUpdated: "Ultimo aggiornamento",
    hourlyForecastFor: "Previsioni orarie per",
    noaaSource: "Fonte dei dati: NOAA Space Weather Prediction Center (SWPC)",
    noaaView: "Vedi su NOAA Space Weather Prediction Center",
    iconSnow: "Neve",
    iconRain: "Nuvola con pioggia",
    iconCloud: "Nuvoloso",
    iconSunCloud: "Sole con nuvole",
    iconSun: "Soleggiato",
    iconThunder: "Temporale",
    title: "Previsioni del tempo",
    cityLabel: "Città / Resort:",
    useLocation: "📍 Usa la posizione attuale",
    daysLabel: "Giorni:",
    clearLocation: "Cancella posizione",
    loadData: "Carica previsioni",
    date: "Data (Giorno)",
    weather: "Tempo",
    minTemp: "Temp. min. (°C)",
    maxTemp: "Temp. max. (°C)",
    cloudiness: "Nuvolosità (%)",
    rainfall: "Precipitazioni (mm)",
    wind: "Vento (km/h)",
    showHourly: "Mostra previsioni orarie",
    print: "🖨️ Stampa",
    selectedLocation: "Posizione selezionata",
    localTime: "Ora locale",
    kpIndex: "Indice Kp",
    hourlyDateTime: "Data e ora",
    hourlyTemperature: "Temp. (°C)",
    hourlyCloudiness: "Nuvolosità (%)",
    hourlyRainfall: "Precipitazioni (mm)",
    hourlyPrecipProb: "Prob. di precip. (%)",
    hourlyWind: "Vento (km/h)",
    numberOfHours: "Numero di ore:",
    forecastInterval: "Intervallo (min.):",
    hourlyForecast: "Previsioni orarie",
    solarCalendar: "☀️ Calendario solare",
    lunarCalendar: "🌙 Calendario lunare",
    sources: "📚 Fonti",
    home: "Home",
    holidayCalendar: "Calendario delle festività",
    dataSources: "Fonti di dati",
    language: "Lingua",
	weatherMaps: "Mappe Meteorologiche"
  }
};

function _t(key) {
  const language = document.getElementById("language").value;
  return translations[language][key] || key;
}

// The dropdown comes from /js/language-selector.js, which also saves the choice
const languageSelect = document.getElementById("language");

languageSelect.addEventListener("change", (event) => {
  updateContent(event.target.value);
});

function updateContent(language) {
  // Set the locale for the Date object
  Date.prototype.toLocaleDateString = function(locale, options) {
    return new Intl.DateTimeFormat(locale, options).format(this);
  };

  // Add date with day format for each language
  translations.en.dateWithDay = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  translations.bg.dateWithDay = new Date().toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  translations.de.dateWithDay = new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  translations.es.dateWithDay = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  translations.it.dateWithDay = new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Background class code removed
  console.log("Language changed to:", language);
  console.log("Body classes:", document.body.classList);

  // Update all UI elements with translations
  document.querySelector("h1").textContent = translations[language].title;
  document.querySelector("label[for='city']").textContent = translations[language].cityLabel;
  document.querySelector("label[for='latitude']").textContent = translations[language].latitudeLabel;
  document.querySelector("label[for='longitude']").textContent = translations[language].longitudeLabel;
  document.getElementById("city").placeholder = translations[language].cityPlaceholder;
  document.getElementById("latitude").placeholder = translations[language].latitudePlaceholder;
  document.getElementById("longitude").placeholder = translations[language].longitudePlaceholder;
  document.getElementById("days").placeholder = translations[language].daysPlaceholder;
  document.getElementById("useLocation").textContent = translations[language].useLocation;
  document.getElementById("daysLabel").textContent = translations[language].daysLabel;
  
  // Check if clearLocation element exists before updating
  const clearLocationElement = document.getElementById("clearLocation");
  if (clearLocationElement) {
    clearLocationElement.textContent = translations[language].clearLocation;
  }
  
  document.getElementById("loadData").textContent = translations[language].loadData;
  
  // Update table headers
  console.log("DEBUG: Updating table headers for language:", language);
  document.querySelector("#weatherTable thead tr th:nth-child(1)").textContent = translations[language].date;
  
  // Add Weather column translation (2nd column)
  const weatherHeader = document.querySelector("#weatherTable thead tr th:nth-child(2)");
  if (weatherHeader) {
    console.log("DEBUG: Found weather header, updating to:", translations[language].weather);
    weatherHeader.textContent = translations[language].weather;
  } else {
    console.log("DEBUG: Weather header not found!");
  }
  
  document.querySelector("#weatherTable thead tr th:nth-child(3)").textContent = translations[language].minTemp;
  document.querySelector("#weatherTable thead tr th:nth-child(4)").textContent = translations[language].maxTemp;
  document.querySelector("#weatherTable thead tr th:nth-child(5)").textContent = translations[language].cloudiness;
  document.querySelector("#weatherTable thead tr th:nth-child(6)").textContent = translations[language].rainfall;
  document.querySelector("#weatherTable thead tr th:nth-child(7)").textContent = translations[language].wind;
  document.querySelector("#weatherTable thead tr th:nth-child(8)").textContent = translations[language].sunMoon;
  
  // Update hourly forecast elements if they exist
  const showHourlyElement = document.getElementById("showHourly");
  if (showHourlyElement) {
    showHourlyElement.textContent = translations[language].showHourly;
  }
  
  document.querySelector("button[onclick='window.print()']").textContent = translations[language].print;
  document.getElementById("selected-city").textContent = translations[language].selectedLocation;
  
  const localTimeElement = document.getElementById("local-time");
  if (localTimeElement) {
    // Keep the actual time but translate the label
    const timeText = localTimeElement.textContent.split(": ")[1] || "";
    localTimeElement.textContent = `${translations[language].localTime}: ${timeText}`;
  }
  
  
  // Update hourly table headers if they exist
  const hourlyTableHeaders = document.querySelectorAll("#hourlyTable thead tr th");
  if (hourlyTableHeaders.length > 0) {
    console.log("DEBUG: Updating hourly table headers for language:", language);
    hourlyTableHeaders[0].textContent = translations[language].hourlyDateTime;
    
    // Add Weather column translation for hourly table (2nd column)
    if (hourlyTableHeaders[1]) {
      console.log("DEBUG: Found hourly weather header, updating to:", translations[language].weather);
      hourlyTableHeaders[1].textContent = translations[language].weather;
    } else {
      console.log("DEBUG: Hourly weather header not found!");
    }
    
    hourlyTableHeaders[2].textContent = translations[language].hourlyTemperature;
    hourlyTableHeaders[3].textContent = translations[language].hourlyCloudiness;
    hourlyTableHeaders[4].textContent = translations[language].hourlyRainfall;
    hourlyTableHeaders[5].textContent = translations[language].hourlyPrecipProb;
    hourlyTableHeaders[6].textContent = translations[language].hourlyWind;
  }
  
  // Update interval label
  const intervalLabelElement = document.getElementById("intervalLabel");
  if (intervalLabelElement) {
    intervalLabelElement.textContent = translations[language].forecastInterval;
  }
  
  // Update hourly forecast heading
  const hourlyForecastHeading = document.querySelector("#hourlyTableBlock h2");
  if (hourlyForecastHeading) {
    hourlyForecastHeading.textContent = translations[language].hourlyForecast;
  }

  // Column names shown on the phone forecast cards
  if (typeof labelForecastCells === "function") {
    labelForecastCells();
  }
  
  // Update navigation links in header
  const homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.textContent = translations[language].home;
  }
  
  const holidayCalendarLink = document.getElementById('holiday-calendar-link');
  if (holidayCalendarLink) {
    holidayCalendarLink.textContent = translations[language].holidayCalendar;
  }
  
  const dataSourcesLink = document.getElementById('data-sources-link');
  if (dataSourcesLink) {
    dataSourcesLink.textContent = translations[language].dataSources;
  }
  
  // Update navigation links in footer
  const footerHomeLink = document.getElementById('footer-home-link');
  if (footerHomeLink) {
    footerHomeLink.textContent = translations[language].home;
  }
  
  const footerHolidayCalendarLink = document.getElementById('footer-holiday-calendar-link');
  if (footerHolidayCalendarLink) {
    footerHolidayCalendarLink.textContent = translations[language].holidayCalendar;
  }
  
  const footerDataSourcesLink = document.getElementById('footer-data-sources-link');
  if (footerDataSourcesLink) {
    footerDataSourcesLink.textContent = translations[language].dataSources;
  }
  
  const footerLanguageLabel = document.getElementById('footer-language-label');
  if (footerLanguageLabel) {
    footerLanguageLabel.textContent = translations[language].language;
  }
  
  // Update other navigation links (if they exist)
  const solarCalendarLink = document.getElementById('solar-calendar-link');
  if (solarCalendarLink) {
    solarCalendarLink.textContent = translations[language].solarCalendar;
  }
  
  const lunarCalendarLink = document.getElementById('lunar-calendar-link');
  if (lunarCalendarLink) {
    lunarCalendarLink.textContent = translations[language].lunarCalendar;
  }
  
  const sourcesLink = document.getElementById('sources-link');
  if (sourcesLink) {
    sourcesLink.textContent = translations[language].sources;
  }
    const weatherMapsLink = document.getElementById('weather-maps-link');
  if (weatherMapsLink) {
    weatherMapsLink.textContent = translations[language].weatherMaps;
  }

  document.documentElement.lang = language;
}

// Load saved language or default to English
document.addEventListener('DOMContentLoaded', function() {
  // Get saved language from localStorage or default to English
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'bg';
  
  // Set the language selector to the saved language
  const languageSelect = document.getElementById('language');
  if (languageSelect) {
    languageSelect.value = savedLanguage;
  }
  
  // Update content with the saved language
  updateContent(savedLanguage);
  
  // Initialize navigation links in header
  const homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.textContent = translations[savedLanguage].home;
  }
  
  const holidayCalendarLink = document.getElementById('holiday-calendar-link');
  if (holidayCalendarLink) {
    holidayCalendarLink.textContent = translations[savedLanguage].holidayCalendar;
  }
  
  const dataSourcesLink = document.getElementById('data-sources-link');
  if (dataSourcesLink) {
    dataSourcesLink.textContent = translations[savedLanguage].dataSources;
  }
  
  // Initialize navigation links in footer
  const footerHomeLink = document.getElementById('footer-home-link');
  if (footerHomeLink) {
    footerHomeLink.textContent = translations[savedLanguage].home;
  }
  
  const footerHolidayCalendarLink = document.getElementById('footer-holiday-calendar-link');
  if (footerHolidayCalendarLink) {
    footerHolidayCalendarLink.textContent = translations[savedLanguage].holidayCalendar;
  }
  
  const footerDataSourcesLink = document.getElementById('footer-data-sources-link');
  if (footerDataSourcesLink) {
    footerDataSourcesLink.textContent = translations[savedLanguage].dataSources;
  }
  
  const footerLanguageLabel = document.getElementById('footer-language-label');
  if (footerLanguageLabel) {
    footerLanguageLabel.textContent = translations[savedLanguage].language;
  }
  
  // Initialize other navigation links (if they exist)
  const solarCalendarLink = document.getElementById('solar-calendar-link');
  const lunarCalendarLink = document.getElementById('lunar-calendar-link');
  const sourcesLink = document.getElementById('sources-link');
  
  if (solarCalendarLink) {
    solarCalendarLink.textContent = translations[savedLanguage].solarCalendar;
  }
  
  if (lunarCalendarLink) {
    lunarCalendarLink.textContent = translations[savedLanguage].lunarCalendar;
  }
  
  if (sourcesLink) {
    sourcesLink.textContent = translations[savedLanguage].sources;
  }
});


// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
    });
  }
  
});
