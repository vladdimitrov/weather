// Translations for the holiday calendar (alerts, calendar and holiday details)
const holidayTranslations = {
  en: {
    holidaysInPeriod: "Holidays in this period",
    noHolidaysInPeriod: "No public holidays in this period.",
    today: "Today",
    selectedLocation: "Selected location",
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    dayNames: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    holidayDate: "Date",
    countryCode: "Country Code",
    holidayType: "Type",
    holidayTypes: { Public: "Public holiday", Bank: "Bank holiday", School: "School holiday", Authorities: "Public offices closed", Optional: "Optional holiday", Observance: "Observance" },
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
    holidaysInPeriod: "Празници в периода",
    noHolidaysInPeriod: "Няма официални празници в периода.",
    today: "Днес",
    selectedLocation: "Избрана локация",
    monthNames: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
    dayNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    holidayDate: "Дата",
    countryCode: "Код на страната",
    holidayType: "Тип",
    holidayTypes: { Public: "Официален празник", Bank: "Банков празник", School: "Училищна ваканция", Authorities: "Неработен ден за администрацията", Optional: "Незадължителен празник", Observance: "Отбелязван ден" },
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
    holidaysInPeriod: "Feiertage in diesem Zeitraum",
    noHolidaysInPeriod: "Keine Feiertage in diesem Zeitraum.",
    today: "Heute",
    selectedLocation: "Ausgewählter Standort",
    monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    dayNames: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    holidayDate: "Datum",
    countryCode: "Ländercode",
    holidayType: "Typ",
    holidayTypes: { Public: "Gesetzlicher Feiertag", Bank: "Bankfeiertag", School: "Schulferien", Authorities: "Behörden geschlossen", Optional: "Optionaler Feiertag", Observance: "Gedenktag" },
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
    holidaysInPeriod: "Festività nel periodo",
    noHolidaysInPeriod: "Nessuna festività nel periodo.",
    today: "Oggi",
    selectedLocation: "Posizione selezionata",
    monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
    dayNames: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
    holidayDate: "Data",
    countryCode: "Codice paese",
    holidayType: "Tipo",
    holidayTypes: { Public: "Festività nazionale", Bank: "Festività bancaria", School: "Vacanza scolastica", Authorities: "Uffici pubblici chiusi", Optional: "Festività facoltativa", Observance: "Ricorrenza" },
    fillAllDates: "Compila tutti i campi delle date.",
    couldNotDetermineCountry: "Impossibile determinare il codice del paese per la città selezionata. Prova con un'altra città.",
    errorFetchingCountry: "Errore nel recupero del codice del paese per la città selezionata. Riprova.",
    couldNotDetermineCountryCoords: "Impossibile determinare il codice del paese dalle coordinate. Prova con un'altra posizione.",
    errorFetchingCountryCoords: "Errore nel recupero del codice del paese dalle coordinate. Riprova.",
    enterCityOrLocation: "Inserisci una città o usa la tua posizione attuale.",
    errorFetchingHolidays: "Errore nel recupero delle festività. Controlla la console per i dettagli.",
    locating: "Localizzazione...",
    errorDeterminingCity: "Errore nel determinare la città dalla tua posizione. Riprova o inseriscila manualmente.",
    couldNotGetLocation: "Impossibile ottenere la tua posizione. Assicurati che i servizi di localizzazione siano attivi e riprova.",
    geolocationNotSupported: "La geolocalizzazione non è supportata dal tuo browser."
  },
  es: {
    holidaysInPeriod: "Festivos en este período",
    noHolidaysInPeriod: "No hay festivos en este período.",
    today: "Hoy",
    selectedLocation: "Ubicación seleccionada",
    monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    dayNames: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
    holidayDate: "Fecha",
    countryCode: "Código de país",
    holidayType: "Tipo",
    holidayTypes: { Public: "Festivo oficial", Bank: "Festivo bancario", School: "Vacaciones escolares", Authorities: "Oficinas públicas cerradas", Optional: "Festivo opcional", Observance: "Conmemoración" },
    fillAllDates: "Rellena todos los campos de fecha.",
    couldNotDetermineCountry: "No se pudo determinar el código de país de la ciudad seleccionada. Prueba con otra ciudad.",
    errorFetchingCountry: "Error al obtener el código de país de la ciudad seleccionada. Inténtalo de nuevo.",
    couldNotDetermineCountryCoords: "No se pudo determinar el código de país a partir de las coordenadas. Prueba con otra ubicación.",
    errorFetchingCountryCoords: "Error al obtener el código de país a partir de las coordenadas. Inténtalo de nuevo.",
    enterCityOrLocation: "Introduce una ciudad o usa tu ubicación actual.",
    errorFetchingHolidays: "Error al obtener los días festivos. Consulta la consola para más detalles.",
    locating: "Localizando...",
    errorDeterminingCity: "Error al determinar la ciudad a partir de tu ubicación. Inténtalo de nuevo o introdúcela manualmente.",
    couldNotGetLocation: "No se pudo obtener tu ubicación. Asegúrate de que los servicios de ubicación estén activados e inténtalo de nuevo.",
    geolocationNotSupported: "Tu navegador no admite la geolocalización."
  }
};

function _t(key) {
  const language = document.documentElement.lang || 'en';
  const texts = holidayTranslations[language] || holidayTranslations.en;
  return texts[key] !== undefined ? texts[key] : (holidayTranslations.en[key] || key);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DEBUG: DOMContentLoaded fired in holiday calendar script');
  const cityInput = document.getElementById('city');
  const latitudeInput = document.getElementById('latitude');
  const longitudeInput = document.getElementById('longitude');
  const citySuggestions = document.getElementById('citySuggestions');
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');
  const loadDataButton = document.getElementById('loadData');
  const useLocationButton = document.getElementById('useLocation');
  const calendarDiv = document.getElementById('calendar');
  const holidayDetailsDiv = document.getElementById('holidayDetails');

  // Function to save location to localStorage (read back by CitySearch.startPlace)
  function saveLocationToLocalStorage(city, latitude, longitude, country, countryCode) {
    const locationData = {
      city: city,
      latitude: latitude,
      longitude: longitude,
      country: country,
      countryCode: countryCode || ''
    };
    localStorage.setItem('lastLocation', JSON.stringify(locationData));
  }

  let selectedPlace = null; // last place picked from the suggestions

  CitySearch.attach(cityInput, citySuggestions, {
    getOrigin: () => ({
      latitude: parseFloat(latitudeInput.value),
      longitude: parseFloat(longitudeInput.value)
    }),
    onSelect: (place) => {
      selectedPlace = place;
      const label = `${place.name}, ${place.country}`;
      document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${label}`;
      latitudeInput.value = place.latitude;
      longitudeInput.value = place.longitude;
      saveLocationToLocalStorage(place.name, place.latitude, place.longitude, place.country, place.countryCode);
      loadDataButton.click();
    }
  });

  useLocationButton.addEventListener('click', function() {
    if (navigator.geolocation) {
      useLocationButton.disabled = true;
      const originalButtonText = useLocationButton.textContent;
      useLocationButton.textContent = _t('locating');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          latitudeInput.value = latitude;
          longitudeInput.value = longitude;

          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.hamlet;
            const country = data?.address?.country;
            const countryCode = data?.address?.country_code?.toUpperCase();

            if (city) {
              cityInput.value = city;
              document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${city}, ${country}`;
              saveLocationToLocalStorage(city, latitude, longitude, country, countryCode);
            } else {
              document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: Coordinates (${latitude}, ${longitude})`;
              saveLocationToLocalStorage("", latitude, longitude, "");
            }
            loadDataButton.click();
          } catch (error) {
            console.error('Error getting city from location:', error);
            alert(_t('errorDeterminingCity'));
          } finally {
            useLocationButton.disabled = false;
            useLocationButton.textContent = originalButtonText;
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(_t('couldNotGetLocation'));
          useLocationButton.disabled = false;
          useLocationButton.textContent = originalButtonText;
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      alert(_t('geolocationNotSupported'));
    }
  });

  loadDataButton.addEventListener('click', async function() {
    const city = cityInput.value.trim();
    const latitude = latitudeInput.value;
    const longitude = longitudeInput.value;
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    if (!fromDate || !toDate) {
      alert(_t('fillAllDates'));
      return;
    }

    // A place picked from the suggestions already has its country code
    if (selectedPlace && selectedPlace.countryCode && CitySearch.isAt(selectedPlace, latitude, longitude)) {
      fetchHolidays(selectedPlace.countryCode, selectedPlace.country, fromDate, toDate);
      return;
    }

    let countryCode = '';
    let countryName = '';

    if (city && latitude && longitude) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        countryCode = data?.address?.country_code?.toUpperCase();
        countryName = data?.address?.country;
        if (!countryCode) {
          alert(_t('couldNotDetermineCountry'));
          return;
        }
      } catch (error) {
        console.error('Error fetching country code:', error);
        alert(_t('errorFetchingCountry'));
        return;
      }
    } else if (latitude && longitude) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        countryCode = data?.address?.country_code?.toUpperCase();
        countryName = data?.address?.country;
        if (!countryCode) {
          alert(_t('couldNotDetermineCountryCoords'));
          return;
        }
      } catch (error) {
        console.error('Error fetching country code from coordinates:', error);
        alert(_t('errorFetchingCountryCoords'));
        return;
      }
    } else {
      alert(_t('enterCityOrLocation'));
      return;
    }

    fetchHolidays(countryCode, countryName, fromDate, toDate);
  });

  async function fetchHolidays(countryCode, countryName, fromDate, toDate) {
    const fromDateParts = fromDate.split('-');
    const toDateParts = toDate.split('-');

    // Create dates in UTC to avoid timezone issues
    const startDate = new Date(Date.UTC(parseInt(fromDateParts[0]), parseInt(fromDateParts[1]) - 1, parseInt(fromDateParts[2])));
    const endDate = new Date(Date.UTC(parseInt(toDateParts[0]), parseInt(toDateParts[1]) - 1, parseInt(toDateParts[2]), 23, 59, 59)); // Set time to end of day

    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();

    let allHolidays = [];

    for (let year = startYear; year <= endYear; year++) {
      // Nager.Date - free public holidays API, no key required
      const apiUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

      let retries = 3;
      while (retries > 0) {
        try {
          const response = await fetch(apiUrl);
          // 204/404 = country not supported -> show the calendar without holidays
          if (response.status === 204 || response.status === 404) {
            console.warn(`No holiday data for country ${countryCode}`);
            break;
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Convert to the format used by the calendar below
          allHolidays = allHolidays.concat(data.map(h => ({
            name: h.name,
            localName: h.localName,
            date: { iso: h.date },
            country: { id: h.countryCode },
            types: h.types,
            primary_type: h.types.includes('Public') ? 'National holiday' : h.types.join(', ')
          })));
          break; // If the request is successful, break out of the retry loop
        } catch (error) {
          console.error(`Error fetching holidays (retry ${4 - retries}):`, error);
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }

      if (retries === 0) {
        console.error('Failed to fetch holidays after multiple retries.');
        alert(_t('errorFetchingHolidays'));
        return;
      }
    }

    // Filter holidays to be within the selected date range
    const filteredHolidays = allHolidays.filter(h => {
      const holidayDate = new Date(h.date.iso);
      return holidayDate >= startDate && holidayDate <= endDate;
    });

    displayCalendar(filteredHolidays, startDate, endDate, countryName);
  }

  function displayCalendar(holidays, startDate, endDate, countryName) {
    calendarDiv.innerHTML = '';
    holidayDetailsDiv.innerHTML = '';

    if (countryName) {
      const countryHeader = document.createElement('h2');
      countryHeader.textContent = countryName;
      countryHeader.style.textAlign = 'center';
      countryHeader.style.color = '#FFD700';
      countryHeader.style.marginBottom = '15px';
      calendarDiv.appendChild(countryHeader);
    }


    // Create a Set of holiday dates for efficient lookup
    const holidayDates = new Set(holidays.map(h => new Date(h.date.iso).toISOString().slice(0, 10)));

    let currentDate = new Date(startDate);
    const now = new Date();
    const todayISO = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
    const calendarTable = document.createElement('table');
    calendarTable.classList.add('calendar-table');

    const monthNames = _t('monthNames');
    const dayNamesOrder = _t('dayNames');

    let currentMonth = -1;
    let calendarRow = null;

    while (currentDate <= endDate) {
      const month = currentDate.getUTCMonth();
      const year = currentDate.getUTCFullYear();

      if (month !== currentMonth) {
        // If there's an existing row, complete it and append to table
        if (calendarRow && calendarRow.children.length > 0) {
          while (calendarRow.children.length < 7) {
            const emptyCell = document.createElement('td');
            emptyCell.classList.add('calendar-cell', 'empty');
            calendarRow.appendChild(emptyCell);
          }
          calendarTable.appendChild(calendarRow);
        }

        // Add month header row
        const monthHeaderRow = document.createElement('tr');
        const monthHeaderCell = document.createElement('th');
        monthHeaderCell.colSpan = 7;
        monthHeaderCell.classList.add('month-header');
        monthHeaderCell.textContent = `${monthNames[month]} ${year}`;
        monthHeaderRow.appendChild(monthHeaderCell);
        calendarTable.appendChild(monthHeaderRow);

        // Add day names header row for the new month
        const dayNamesRow = document.createElement('tr');
        dayNamesOrder.forEach(dayName => {
          const dayNameHeader = document.createElement('th');
          dayNameHeader.textContent = dayName;
          dayNamesRow.appendChild(dayNameHeader);
        });
        calendarTable.appendChild(dayNamesRow);

        // Start a new row for days
        calendarRow = document.createElement('tr');

        // Calculate the day of the week for the first day of the current month (0 = Monday, 6 = Sunday)
        const firstDayOfCurrentMonth = new Date(Date.UTC(year, month, 1));
        let startDayOfWeek = (firstDayOfCurrentMonth.getUTCDay() + 6) % 7; // 0 for Monday, 6 for Sunday

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDayOfWeek; i++) {
          const emptyCell = document.createElement('td');
          emptyCell.classList.add('calendar-cell', 'empty');
          calendarRow.appendChild(emptyCell);
        }

        currentMonth = month;
      }

      const calendarCell = document.createElement('td');
      calendarCell.classList.add('calendar-cell');
      calendarCell.textContent = currentDate.getUTCDate();

      const currentISODate = currentDate.toISOString().slice(0, 10);
      if (currentISODate === todayISO) {
        calendarCell.classList.add('today');
        calendarCell.setAttribute('aria-label', `${_t('today')}, ${currentISODate}`);
      }
      const isHoliday = holidayDates.has(currentISODate);

      // Check if the current date is a weekend (Saturday or Sunday)
      const dayOfWeek = currentDate.getUTCDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 for Sunday, 6 for Saturday

      if (isHoliday) {
        calendarCell.classList.add('holiday');
        const holidayInfo = holidays.find(h => h.date.iso.slice(0, 10) === currentISODate);
        if (holidayInfo) {
          calendarCell.title = holidayTitle(holidayInfo); // Add tooltip for holiday name
          calendarCell.addEventListener('click', () => displayHolidayDetails(holidayInfo));
          if (holidayInfo.primary_type === 'National holiday') {
            calendarCell.classList.add('official-holiday-red');
          }
        }
      } else if (!isWeekend) {
        // If it's not a holiday and not a weekend, mark it with yellow grid
        calendarCell.classList.add('working-day-grid');
      } else if (isWeekend) {
        calendarCell.classList.add('weekend-aura');
      }

      calendarRow.appendChild(calendarCell);

      // Check if the current row is full (7 days)
      if (calendarRow.children.length % 7 === 0) {
        calendarTable.appendChild(calendarRow);
        calendarRow = document.createElement('tr');
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // After the loop, if there's a partial row, complete it and append
    if (calendarRow && calendarRow.children.length > 0) {
      while (calendarRow.children.length < 7) {
        const emptyCell = document.createElement('td');
        emptyCell.classList.add('calendar-cell', 'empty');
        calendarRow.appendChild(emptyCell);
      }
      calendarTable.appendChild(calendarRow);
    }

    calendarDiv.appendChild(calendarTable);
    calendarDiv.appendChild(createHolidayList(holidays));
  }

  // All holidays of the period at a glance (the calendar shows details on tap)
  function createHolidayList(holidays) {
    const section = document.createElement('div');
    section.className = 'holiday-list';
    const title = document.createElement('h3');
    title.textContent = _t('holidaysInPeriod');
    section.appendChild(title);

    if (holidays.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = _t('noHolidaysInPeriod');
      section.appendChild(empty);
      return section;
    }

    const locales = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
    const dateFormat = new Intl.DateTimeFormat(locales[document.documentElement.lang] || 'en-GB', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' });
    const list = document.createElement('ul');
    [...holidays].sort((a, b) => a.date.iso.localeCompare(b.date.iso)).forEach(holiday => {
      const item = document.createElement('li');
      if (holiday.primary_type === 'National holiday') item.classList.add('official');
      const date = document.createElement('span');
      date.className = 'holiday-date';
      date.textContent = dateFormat.format(new Date(holiday.date.iso + 'T00:00:00Z'));
      const name = document.createElement('span');
      name.className = 'holiday-name';
      name.textContent = holidayTitle(holiday);
      item.append(date, name);
      item.addEventListener('click', () => displayHolidayDetails(holiday));
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  // Nager.Date has only English and local-language names: show the local
  // name first unless the site is in English, and the other one in brackets
  function holidayTitle(holiday) {
    const local = holiday.localName || holiday.name;
    const [first, second] = document.documentElement.lang === 'en' ? [holiday.name, local] : [local, holiday.name];
    return first === second ? first : `${first} (${second})`;
  }

  function holidayTypeNames(holiday) {
    const typeNames = _t('holidayTypes');
    return (holiday.types || []).map(type => typeNames[type] || type).join(', ');
  }

  function displayHolidayDetails(holiday) {
    holidayDetailsDiv.innerHTML = `
      <h3>${holidayTitle(holiday)}</h3>
      <p>${_t('holidayDate')}: ${holiday.date.iso}</p>
      <p>${_t('countryCode')}: ${holiday.country.id.toUpperCase()}</p>
      <p>${_t('holidayType')}: ${holidayTypeNames(holiday)}</p>
    `;
  }

  // Set default values
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  fromDateInput.value = new Date(Date.UTC(currentYear, currentMonth, 1)).toISOString().slice(0, 10);
  toDateInput.value = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).toISOString().slice(0, 10);

  // Open with the holidays of the last location, or Sofia on a first visit.
  // A known country code skips the reverse lookup when loading.
  setTimeout(() => {
    const place = CitySearch.startPlace();
    selectedPlace = place.name ? place : null;
    cityInput.value = place.name;
    latitudeInput.value = place.latitude;
    longitudeInput.value = place.longitude;
    if (place.name) {
      document.getElementById("selected-city").textContent =
        `${_t('selectedLocation')}: ${place.country ? `${place.name}, ${place.country}` : place.name}`;
    }
    loadDataButton.click();
  }, 300);
});