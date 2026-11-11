// Define translations for all UI elements
const translations = {
  en: {
    latitudeLabel: "Latitude:",
    longitudeLabel: "Longitude:",
    cityPlaceholder: "e.g. Sofia",
    latitudePlaceholder: "e.g. 42.6977",
    longitudePlaceholder: "e.g. 23.3219",
    currentLayer: "Layer",
    loadingMap: "Loading weather map...",
    poweredBy: "Weather data visualization powered by",
    clearAll: "🗑️ Clear All",
    noFavoritesYet: "No favorite locations saved yet",
    errorSavingFavorites: "Error saving favorites",
    confirmDeleteFavorite: "Are you sure you want to delete this favorite location?",
    confirmDeleteAll: "Are you sure you want to delete ALL favorite locations? This cannot be undone.",
    allFavoritesCleared: "All favorites cleared",
    noValidFavorites: "No valid favorites found in file",
    loadLocationTitle: "Load location",
    deleteFavoriteTitle: "Delete favorite",
    title: "Weather forecast and magnetic storms",
    cityLabel: "City / Resort:",
    useLocation: "📍 Use the current location",
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
    hourlyDateTime: "Date and time",
    hourlyTemperature: "Temp. (°C)",
    hourlyCloudiness: "Cloudiness (%)",
    hourlyRainfall: "Rainfall (mm)",
    hourlyPrecipProb: "Precip. Prob. (%)",
    hourlyWind: "Wind (km/h)",
    numberOfHours: "Number of hours:",
    forecastInterval: "Hourly Interval(min.):",
    hourlyForecast: "Hourly forecast",
    solarCalendar: "☀️ Solar Calendar",
    lunarCalendar: "🌙 Lunar Calendar",
    sources: "📚 Sources",
    home: "Home",
    holidayCalendar: "Holiday Calendar",
    dataSources: "Data Sources",
    language: "Language",
    weather: "Weather",
    // Maps-specific translations
    mapsTitle: "Weather Maps - Interactive Weather Visualization",
    layerLabel: "Weather Layer:",
    loadMap: "Load Map",
    favoriteLocations: "Favorite Locations",
    exportFavorites: "📤 Export",
    importFavorites: "📥 Import",
    locationLoaded: "Favorite location loaded",
    locationDeleted: "Favorite location deleted",
    noFavoritesToExport: "No favorites to export",
    favoritesExported: "Favorites exported successfully",
    errorImporting: "Error importing favorites: Invalid file format",
    favoritesImported: "favorite(s) imported successfully",
    noNewFavorites: "No new favorites were imported (duplicates or limit reached)",
    // Weather layer names
    rainLayer: "🌧️ Rain",
    windLayer: "💨 Wind",
    tempLayer: "🌡️ Temperature",
    pressureLayer: "📊 Pressure",
    cloudsLayer: "☁️ Clouds",
    wavesLayer: "🌊 Waves",
    lightningLayer: "⚡ Lightning",
    airQualityLayer: "🏭 Air Quality"
  },
  bg: {
    latitudeLabel: "Географска ширина:",
    longitudeLabel: "Географска дължина:",
    cityPlaceholder: "напр. София",
    latitudePlaceholder: "напр. 42.6977",
    longitudePlaceholder: "напр. 23.3219",
    currentLayer: "Слой",
    loadingMap: "Зареждане на картата...",
    poweredBy: "Визуализацията на данните за времето е от",
    clearAll: "🗑️ Изтрий всички",
    noFavoritesYet: "Все още няма запазени любими места",
    errorSavingFavorites: "Грешка при запазване на любимите",
    confirmDeleteFavorite: "Сигурни ли сте, че искате да изтриете това любимо място?",
    confirmDeleteAll: "Сигурни ли сте, че искате да изтриете ВСИЧКИ любими места? Това не може да бъде отменено.",
    allFavoritesCleared: "Всички любими места са изтрити",
    noValidFavorites: "Във файла няма валидни любими места",
    loadLocationTitle: "Зареди мястото",
    deleteFavoriteTitle: "Изтрий от любими",
    title: "Прогноза за времето и магнитни бури",
    cityLabel: "Град / Курорт:",
    useLocation: "📍 Използвай текущото местоположение",
    daysLabel: "Брой дни:",
    clearLocation: "Изчисти местоположението",
    loadData: "Зареди прогнозата",
    date: "Дата (Ден)",
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
    forecastInterval: "Почасова прогноза(мин.):",
    hourlyForecast: "Почасова прогноза",
    solarCalendar: "☀️ Слънчев календар",
    lunarCalendar: "🌙 Лунен календар",
    sources: "📚 Източници",
    home: "Начало",
    holidayCalendar: "Календар на празниците",
    dataSources: "Източници на данни",
    language: "Език",
    weather: "Прогноза",
    // Maps-specific translations
    mapsTitle: "Карти за времето - Интерактивна визуализация на времето",
    layerLabel: "Слой за времето:",
    loadMap: "Зареди карта",
    favoriteLocations: "Любими места",
    exportFavorites: "📤 Експорт",
    importFavorites: "📥 Импорт",
    locationLoaded: "Любимото местоположение е заредено",
    locationDeleted: "Любимото местоположение е изтрито",
    noFavoritesToExport: "Няма любими за експорт",
    favoritesExported: "Любимите са експортирани успешно",
    errorImporting: "Грешка при импорт на любими: Невалиден формат на файла",
    favoritesImported: "любими са импортирани успешно",
    noNewFavorites: "Не са импортирани нови любими (дублирани или достигнат лимит)",
    // Weather layer names
    rainLayer: "🌧️ Дъжд",
    windLayer: "💨 Вятър",
    tempLayer: "🌡️ Температура",
    pressureLayer: "📊 Налягане",
    cloudsLayer: "☁️ Облаци",
    wavesLayer: "🌊 Вълни",
    lightningLayer: "⚡ Мълнии",
    airQualityLayer: "🏭 Качество на въздуха"
  },
  de: {
    latitudeLabel: "Breitengrad:",
    longitudeLabel: "Längengrad:",
    cityPlaceholder: "z. B. Sofia",
    latitudePlaceholder: "z. B. 42.6977",
    longitudePlaceholder: "z. B. 23.3219",
    currentLayer: "Ebene",
    loadingMap: "Wetterkarte wird geladen...",
    poweredBy: "Wetterdaten-Visualisierung bereitgestellt von",
    clearAll: "🗑️ Alle löschen",
    noFavoritesYet: "Noch keine Lieblingsorte gespeichert",
    errorSavingFavorites: "Fehler beim Speichern der Favoriten",
    confirmDeleteFavorite: "Möchten Sie diesen Lieblingsort wirklich löschen?",
    confirmDeleteAll: "Möchten Sie wirklich ALLE Lieblingsorte löschen? Dies kann nicht rückgängig gemacht werden.",
    allFavoritesCleared: "Alle Favoriten gelöscht",
    noValidFavorites: "Keine gültigen Favoriten in der Datei gefunden",
    loadLocationTitle: "Ort laden",
    deleteFavoriteTitle: "Favorit löschen",
    title: "Wettervorhersage und Magnetstürme",
    cityLabel: "Stadt / Urlaubsort:",
    useLocation: "📍 Aktuellen Standort verwenden",
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
    hourlyDateTime: "Datum und Uhrzeit",
    hourlyTemperature: "Temp. (°C)",
    hourlyCloudiness: "Bewölkung (%)",
    hourlyRainfall: "Niederschlag (mm)",
    hourlyPrecipProb: "Niederschlagswahrscheinlichkeit (%)",
    hourlyWind: "Wind (km/h)",
    numberOfHours: "Anzahl der Stunden:",
    forecastInterval: "Detailliertes intervallMin.):",
    hourlyForecast: "Stündliche Vorhersage",
    solarCalendar: "☀️ Sonnenkalender",
    lunarCalendar: "🌙 Mondkalender",
    sources: "📚 Quellen",
    home: "Startseite",
    holidayCalendar: "Feiertagskalender",
    dataSources: "Datenquellen",
    language: "Sprache",
    weather: "Wetter",
    // Maps-specific translations
    mapsTitle: "Wetterkarten - Interaktive Wettervisualisierung",
    layerLabel: "Wetterschicht:",
    loadMap: "Karte laden",
    favoriteLocations: "Lieblingsorte",
    exportFavorites: "📤 Export",
    importFavorites: "📥 Import",
    locationLoaded: "Lieblingsstandort geladen",
    locationDeleted: "Lieblingsstandort gelöscht",
    noFavoritesToExport: "Keine Favoriten zum Exportieren",
    favoritesExported: "Favoriten erfolgreich exportiert",
    errorImporting: "Fehler beim Importieren von Favoriten: Ungültiges Dateiformat",
    favoritesImported: "Favorit(en) erfolgreich importiert",
    noNewFavorites: "Keine neuen Favoriten wurden importiert (Duplikate oder Limit erreicht)",
    // Weather layer names
    rainLayer: "🌧️ Regen",
    windLayer: "💨 Wind",
    tempLayer: "🌡️ Temperatur",
    pressureLayer: "📊 Luftdruck",
    cloudsLayer: "☁️ Wolken",
    wavesLayer: "🌊 Wellen",
    lightningLayer: "⚡ Blitze",
    airQualityLayer: "🏭 Luftqualität"
  },
  es: {
    latitudeLabel: "Latitud:",
    longitudeLabel: "Longitud:",
    cityPlaceholder: "p. ej. Sofía",
    latitudePlaceholder: "p. ej. 42.6977",
    longitudePlaceholder: "p. ej. 23.3219",
    currentLayer: "Capa",
    loadingMap: "Cargando el mapa del tiempo...",
    poweredBy: "Visualización de datos meteorológicos proporcionada por",
    clearAll: "🗑️ Borrar todos",
    noFavoritesYet: "Aún no hay ubicaciones favoritas guardadas",
    errorSavingFavorites: "Error al guardar los favoritos",
    confirmDeleteFavorite: "¿Seguro que quieres eliminar esta ubicación favorita?",
    confirmDeleteAll: "¿Seguro que quieres eliminar TODAS las ubicaciones favoritas? No se puede deshacer.",
    allFavoritesCleared: "Todos los favoritos eliminados",
    noValidFavorites: "No se encontraron favoritos válidos en el archivo",
    loadLocationTitle: "Cargar ubicación",
    deleteFavoriteTitle: "Eliminar favorito",
    title: "Pronóstico del tiempo y tormentas magnéticas",
    cityLabel: "Ciudad / Resort:",
    useLocation: "📍 Usar la ubicación actual",
    daysLabel: "Número de días:",
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
    forecastInterval: "Intervalo por horas (min.):",
    hourlyForecast: "Pronóstico por horas",
    solarCalendar: "☀️ Calendario solar",
    lunarCalendar: "🌙 Calendario lunar",
    sources: "📚 Fuentes",
    home: "Inicio",
    holidayCalendar: "Calendario de fiestas",
    dataSources: "Fuentes de datos",
    language: "Idioma",
    weather: "Tiempo",
    // Maps-specific translations
    mapsTitle: "Mapas del Tiempo - Visualización Interactiva del Tiempo",
    layerLabel: "Capa del Tiempo:",
    loadMap: "Cargar Mapa",
    favoriteLocations: "Ubicaciones Favoritas",
    exportFavorites: "📤 Exportar",
    importFavorites: "📥 Importar",
    locationLoaded: "Ubicación favorita cargada",
    locationDeleted: "Ubicación favorita eliminada",
    noFavoritesToExport: "No hay favoritos para exportar",
    favoritesExported: "Favoritos exportados exitosamente",
    errorImporting: "Error al importar favoritos: Formato de archivo inválido",
    favoritesImported: "favorito(s) importado(s) exitosamente",
    noNewFavorites: "No se importaron nuevos favoritos (duplicados o límite alcanzado)",
    // Weather layer names
    rainLayer: "🌧️ Lluvia",
    windLayer: "💨 Viento",
    tempLayer: "🌡️ Temperatura",
    pressureLayer: "📊 Presión",
    cloudsLayer: "☁️ Nubes",
    wavesLayer: "🌊 Olas",
    lightningLayer: "⚡ Rayos",
    airQualityLayer: "🏭 Calidad del Aire"
  },
  it: {
    latitudeLabel: "Latitudine:",
    longitudeLabel: "Longitudine:",
    cityPlaceholder: "es. Sofia",
    latitudePlaceholder: "es. 42.6977",
    longitudePlaceholder: "es. 23.3219",
    currentLayer: "Livello",
    loadingMap: "Caricamento della mappa meteo...",
    poweredBy: "Visualizzazione dei dati meteo fornita da",
    clearAll: "🗑️ Elimina tutti",
    noFavoritesYet: "Nessuna località preferita salvata",
    errorSavingFavorites: "Errore nel salvataggio dei preferiti",
    confirmDeleteFavorite: "Vuoi davvero eliminare questa località preferita?",
    confirmDeleteAll: "Vuoi davvero eliminare TUTTE le località preferite? L'operazione non può essere annullata.",
    allFavoritesCleared: "Tutti i preferiti eliminati",
    noValidFavorites: "Nessun preferito valido trovato nel file",
    loadLocationTitle: "Carica località",
    deleteFavoriteTitle: "Elimina preferito",
    title: "Previsioni del tempo e tempeste magnetiche",
    cityLabel: "Città / Resort:",
    useLocation: "📍 Usa la posizione attuale",
    daysLabel: "Numero di giorni:",
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
    forecastInterval: "Intervallo orario (min.):",
    hourlyForecast: "Previsioni orarie",
    solarCalendar: "☀️ Calendario solare",
    lunarCalendar: "🌙 Calendario lunare",
    sources: "📚 Fonti",
    home: "Home",
    holidayCalendar: "Calendario delle festività",
    dataSources: "Fonti di dati",
    language: "Lingua",
    weather: "Tempo",
    // Maps-specific translations
    mapsTitle: "Mappe Meteorologiche - Visualizzazione Interattiva del Tempo",
    layerLabel: "Livello Meteorologico:",
    loadMap: "Carica Mappa",
    favoriteLocations: "Posizioni Preferite",
    exportFavorites: "📤 Esporta",
    importFavorites: "📥 Importa",
    locationLoaded: "Posizione preferita caricata",
    locationDeleted: "Posizione preferita eliminata",
    noFavoritesToExport: "Nessun preferito da esportare",
    favoritesExported: "Preferiti esportati con successo",
    errorImporting: "Errore nell'importazione dei preferiti: Formato file non valido",
    favoritesImported: "preferito/i importato/i con successo",
    noNewFavorites: "Nessun nuovo preferito è stato importato (duplicati o limite raggiunto)",
    // Weather layer names
    rainLayer: "🌧️ Pioggia",
    windLayer: "💨 Vento",
    tempLayer: "🌡️ Temperatura",
    pressureLayer: "📊 Pressione",
    cloudsLayer: "☁️ Nuvole",
    wavesLayer: "🌊 Onde",
    lightningLayer: "⚡ Fulmini",
    airQualityLayer: "🏭 Qualità dell'Aria"
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

  // Update all UI elements with translations
  const pageTitle = document.querySelector("h1");
  if (pageTitle) {
    // Check if this is the maps page
    if (pageTitle.id === 'page-title' || pageTitle.textContent.includes('Maps')) {
      pageTitle.textContent = translations[language].mapsTitle;
    } else {
      pageTitle.textContent = translations[language].title;
    }
  }
  
  const cityLabel = document.querySelector("label[for='city']");
  if (cityLabel) {
    cityLabel.textContent = translations[language].cityLabel;
  }

  // Labels, examples in the fields and other fixed texts
  const textById = {
    latitudeLabel: 'latitudeLabel',
    longitudeLabel: 'longitudeLabel',
    loadingText: 'loadingMap',
    poweredByText: 'poweredBy',
    clearAllFavorites: 'clearAll'
  };
  Object.entries(textById).forEach(([id, key]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = translations[language][key];
  });
  const placeholderById = { city: 'cityPlaceholder', latitude: 'latitudePlaceholder', longitude: 'longitudePlaceholder' };
  Object.entries(placeholderById).forEach(([id, key]) => {
    const input = document.getElementById(id);
    if (input) input.placeholder = translations[language][key];
  });
  const currentLayer = document.getElementById("current-layer");
  const layerSelect = document.getElementById("weatherLayer");
  if (currentLayer && currentLayer.textContent && layerSelect) {
    // Runs before the layer options are re-translated below, so read the key, not the text
    const layerKeys = { rain: 'rainLayer', wind: 'windLayer', temp: 'tempLayer', pressure: 'pressureLayer', clouds: 'cloudsLayer', waves: 'wavesLayer', thunder: 'lightningLayer', pm2p5: 'airQualityLayer' };
    const layerName = translations[language][layerKeys[layerSelect.value]] || layerSelect.options[layerSelect.selectedIndex].text;
    currentLayer.textContent = `${translations[language].currentLayer}: ${layerName}`;
  }
  if (window.favoritesManager && typeof window.favoritesManager.renderFavorites === 'function') {
    window.favoritesManager.renderFavorites();
  }

  const useLocationBtn = document.getElementById("useLocation");
  if (useLocationBtn) {
    useLocationBtn.textContent = translations[language].useLocation;
  }
  
  const daysLabel = document.getElementById("daysLabel");
  if (daysLabel) {
    daysLabel.textContent = translations[language].daysLabel;
  }
  
  // Maps-specific elements
  const layerLabel = document.getElementById("layerLabel");
  if (layerLabel) {
    layerLabel.textContent = translations[language].layerLabel;
  }
  
  const loadMapBtn = document.getElementById("loadMap");
  if (loadMapBtn) {
    loadMapBtn.textContent = translations[language].loadMap;
  }
  
  const favoritesTitle = document.getElementById("favoritesTitle");
  if (favoritesTitle) {
    favoritesTitle.textContent = translations[language].favoriteLocations;
  }
  
  const exportFavoritesBtn = document.getElementById("exportFavorites");
  if (exportFavoritesBtn) {
    exportFavoritesBtn.textContent = translations[language].exportFavorites;
  }
  
  const importFavoritesBtn = document.getElementById("importFavorites");
  if (importFavoritesBtn) {
    importFavoritesBtn.textContent = translations[language].importFavorites;
  }
  
  // Update weather layer options
  const weatherLayerSelect = document.getElementById("weatherLayer");
  if (weatherLayerSelect) {
    const options = weatherLayerSelect.options;
    if (options[0]) options[0].textContent = translations[language].rainLayer;
    if (options[1]) options[1].textContent = translations[language].windLayer;
    if (options[2]) options[2].textContent = translations[language].tempLayer;
    if (options[3]) options[3].textContent = translations[language].pressureLayer;
    if (options[4]) options[4].textContent = translations[language].cloudsLayer;
    if (options[5]) options[5].textContent = translations[language].wavesLayer;
    if (options[6]) options[6].textContent = translations[language].lightningLayer;
    if (options[7]) options[7].textContent = translations[language].airQualityLayer;
  }
  
  // Check if clearLocation element exists before updating
  const clearLocationElement = document.getElementById("clearLocation");
  if (clearLocationElement) {
    clearLocationElement.textContent = translations[language].clearLocation;
  }
  
  const loadDataBtn = document.getElementById("loadData");
  if (loadDataBtn) {
    loadDataBtn.textContent = translations[language].loadData;
  }
  
  // Update table headers
  const weatherTable = document.getElementById("weatherTable");
  if (weatherTable) {
    weatherTable.querySelector("thead tr th:nth-child(1)").textContent = translations[language].date;
    
    // Add Weather column translation (2nd column)
    const weatherHeader = weatherTable.querySelector("thead tr th:nth-child(2)");
    if (weatherHeader) {
      weatherHeader.textContent = translations[language].weather;
    }
    
    weatherTable.querySelector("thead tr th:nth-child(3)").textContent = translations[language].minTemp;
    weatherTable.querySelector("thead tr th:nth-child(4)").textContent = translations[language].maxTemp;
    weatherTable.querySelector("thead tr th:nth-child(5)").textContent = translations[language].cloudiness;
    weatherTable.querySelector("thead tr th:nth-child(6)").textContent = translations[language].rainfall;
    weatherTable.querySelector("thead tr th:nth-child(7)").textContent = translations[language].wind;
  }
  
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
  
  // Update KP index text
  const kpSummaryElement = document.querySelector("#kp-summary");
  if (kpSummaryElement) {
    // Keep the HTML structure but update the text
    const kpHtml = kpSummaryElement.innerHTML;
    const kpIndexText = translations[language].kpIndex;
    kpSummaryElement.innerHTML = kpHtml.replace(/Kp индекс|Kp index|Kp-Index/, kpIndexText);
  }
  
  // Update KP index label if it exists
  const kpIndexLabelElement = document.getElementById("kp-index-label");
  if (kpIndexLabelElement) {
    kpIndexLabelElement.textContent = translations[language].kpIndex;
  }
  
  // Update hourly table headers if they exist
  const hourlyTable = document.getElementById("hourlyTable");
  if (hourlyTable) {
    const hourlyTableHeaders = hourlyTable.querySelectorAll("thead tr th");
    if (hourlyTableHeaders.length > 0) {
      hourlyTableHeaders[0].textContent = translations[language].hourlyDateTime;
      
      // Add Weather column translation for hourly table (2nd column)
      if (hourlyTableHeaders[1]) {
        hourlyTableHeaders[1].textContent = translations[language].weather;
      }
      
      hourlyTableHeaders[2].textContent = translations[language].hourlyTemperature;
      hourlyTableHeaders[3].textContent = translations[language].hourlyCloudiness;
      hourlyTableHeaders[4].textContent = translations[language].hourlyRainfall;
      hourlyTableHeaders[5].textContent = translations[language].hourlyPrecipProb;
      hourlyTableHeaders[6].textContent = translations[language].hourlyWind;
    }
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
  
  // Update navigation links in header
  const homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.textContent = translations[language].home;
  }
  
  const weatherLink = document.getElementById('weather-link');
  if (weatherLink) {
    weatherLink.textContent = translations[language].weather;
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
  

  document.documentElement.lang = language;
}

// Load saved language or default to English
document.addEventListener('DOMContentLoaded', function() {
  // Get saved language from localStorage or default to English
  const savedLanguage = document.documentElement.dataset.pageLang || localStorage.getItem('selectedLanguage') || 'bg';
  
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
