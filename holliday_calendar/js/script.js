// Translation function
function _t(key) {
  const language = document.documentElement.lang || 'en';
  // Add logging to diagnose translation issues
  console.log('DEBUG: Translation requested for key:', key, 'language:', language);
  const translations = {
    en: {
      selectedLocation: "Selected location",
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNames: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      holidayDate: "Date",
      countryCode: "Country Code",
      holidayType: "Type",
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
      selectedLocation: "Избрана локация",
      monthNames: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
      dayNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
      holidayDate: "Дата",
      countryCode: "Код на страната",
      holidayType: "Тип",
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
      selectedLocation: "Ausgewählter Standort",
      monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      dayNames: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
      holidayDate: "Datum",
      countryCode: "Ländercode",
      holidayType: "Typ",
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
    }
  };
  // Add logging to diagnose missing translations
  if (!translations[language]) {
    console.error('DEBUG: Language not supported in holiday calendar:', language, 'Available languages:', Object.keys(translations));
    console.error('DEBUG: Falling back to English for key:', key);
    return translations['en'][key] || key;
  }
  
  if (!translations[language][key]) {
    console.warn('DEBUG: Translation key not found:', key, 'for language:', language);
  }
  
  return translations[language][key] || key;
}

console.log('DEBUG: Holiday calendar script loaded, current language:', document.documentElement.lang);

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

  // Function to save location to localStorage
  function saveLocationToLocalStorage(city, latitude, longitude, country) {
    const locationData = {
      city: city,
      latitude: latitude,
      longitude: longitude,
      country: country
    };
    localStorage.setItem('lastLocation', JSON.stringify(locationData));
  }

  // Function to load location from localStorage
  function loadLocationFromLocalStorage() {
    const locationData = localStorage.getItem('lastLocation');
    if (locationData) {
      try {
        const location = JSON.parse(locationData);
        if (location.city && location.latitude && location.longitude) {
          cityInput.value = location.city;
          latitudeInput.value = location.latitude;
          longitudeInput.value = location.longitude;
          
          const label = location.country ?
            `${location.city}, ${location.country}` :
            `${location.city}`;
          
          console.log('DEBUG: About to call _t for selectedLocation in loadLocationFromLocalStorage');
          document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${label}`;
          return true;
        }
      } catch (e) {
        console.error("Error parsing saved location:", e);
        console.log('DEBUG: Error occurred in loadLocationFromLocalStorage, current language:', document.documentElement.lang);
      }
    }
    return false;
  }

  // Apply modern styling to the suggestions dropdown
  citySuggestions.style.fontFamily = "'Orbitron', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  citySuggestions.style.maxHeight = "250px";
  citySuggestions.style.overflowY = "auto";
  citySuggestions.style.borderRadius = "0 0 8px 8px";
  citySuggestions.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
  citySuggestions.style.border = "1px solid rgba(255, 215, 0, 0.3)";
  citySuggestions.style.backgroundColor = "rgba(28, 46, 74, 0.95)";

  const transliterate = (text) => {
    const transliterationTable = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya'
    };
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      result += transliterationTable[char] || char;
    }
    return result;
  };

  cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();
    if (query.length < 2) {
      citySuggestions.innerHTML = "";
      citySuggestions.style.display = "none";
      return;
    }

    try {
      const transliteratedQuery = transliterate(query);
      const encodedQuery = encodeURIComponent(transliteratedQuery);
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=10&format=json&language=en`;
      const res = await fetch(url);
      const data = await res.json();
      citySuggestions.innerHTML = "";
      citySuggestions.style.display = "none";

      if (data.results) {
        citySuggestions.style.display = "block";

        const userLat = latitudeInput.value;
        const userLon = longitudeInput.value;

        function calculateDistance(lat1, lon1, lat2, lon2) {
          const R = 6371;
          const dLat = deg2rad(lat2 - lat1);
          const dLon = deg2rad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return distance;
        }

        function deg2rad(deg) {
          return deg * (Math.PI / 180);
        }

        const placesWithDistance = data.results.map(place => {
          const distance = (userLat && userLon) ? calculateDistance(userLat, userLon, place.latitude, place.longitude) : null;
          return { ...place, distance };
        });

        placesWithDistance.sort((a, b) => {
          if (a.distance === null) return -1;
          if (b.distance === null) return 1;
          return a.distance - b.distance;
        });

        placesWithDistance
          .filter(place => {
            const nameLower = place.name.toLowerCase();
            const queryLower = transliteratedQuery.toLowerCase();
            return nameLower.includes(queryLower) && (nameLower.startsWith(queryLower) || nameLower.includes(` ${queryLower}`));
          })
          .forEach(place => {
            const native = place.name;
            const distanceText = place.distance ? ` (${place.distance.toFixed(1)} km)` : "";
            let label = `${native}, ${place.country}${distanceText}`;
            
            const suggestion = document.createElement("div");
            suggestion.className = "suggestion";
            suggestion.dataset.latitude = place.latitude;
            suggestion.dataset.longitude = place.longitude;
            suggestion.style.padding = "10px 15px";
            suggestion.style.cursor = "pointer";
            suggestion.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
            suggestion.style.color = "#ffffff";
            suggestion.style.transition = "background 0.3s ease";
            
            if (place.distance) {
              const nameCountry = document.createElement("span");
              nameCountry.textContent = `${native}, ${place.country}`;
              
              const distanceSpan = document.createElement("span");
              distanceSpan.textContent = ` (${place.distance.toFixed(1)} km)`;
              distanceSpan.style.color = "#FFD700";
              distanceSpan.style.fontSize = "0.9em";
              distanceSpan.style.marginLeft = "5px";
              
              suggestion.appendChild(nameCountry);
              suggestion.appendChild(distanceSpan);
            } else {
              suggestion.textContent = label;
            }
            suggestion.addEventListener("click", () => {
              cityInput.value = native;
              citySuggestions.style.display = "none";
              const selectedLanguage = document.documentElement.lang || 'en';
              document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${label}`;
              latitudeInput.value = place.latitude;
              longitudeInput.value = place.longitude;
              saveLocationToLocalStorage(native, place.latitude, place.longitude, place.country);
              loadDataButton.click();
            });
            citySuggestions.appendChild(suggestion);
          });
      }
    } catch (err) {
      const errorMessage = document.documentElement.lang === "bg" ?
        "Грешка при търсене на град:" :
        document.documentElement.lang === "de" ?
        "Fehler bei der Stadtsuche:" :
        "Error searching for city:";
      console.error(errorMessage, err);
    }
  });

  let selectedSuggestionIndex = -1;

  cityInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const suggestions = citySuggestions.querySelectorAll("div");
      if (suggestions.length === 0) return;

      if (event.key === "ArrowUp") {
        selectedSuggestionIndex = Math.max(0, selectedSuggestionIndex - 1);
      } else {
        selectedSuggestionIndex = Math.min(suggestions.length - 1, selectedSuggestionIndex + 1);
      }

      suggestions.forEach((suggestion, index) => {
        if (index === selectedSuggestionIndex) {
          suggestion.style.backgroundColor = "rgba(255, 215, 0, 0.2)";
          suggestion.style.color = "#FFD700";
        } else {
          suggestion.style.backgroundColor = "";
          suggestion.style.color = "#ffffff";
        }
      });
      event.preventDefault(); // Prevent cursor movement in input
    } else if (event.key === "Enter") {
      const suggestions = citySuggestions.querySelectorAll("div");
      if (suggestions.length === 0) return;

      if (selectedSuggestionIndex !== -1) {
        const selectedSuggestion = suggestions[selectedSuggestionIndex];
        const cityName = selectedSuggestion.textContent.split(',')[0];
        cityInput.value = cityName;
        citySuggestions.style.display = "none";
        
        if (selectedSuggestion.dataset.latitude && selectedSuggestion.dataset.longitude) {
          const lat = selectedSuggestion.dataset.latitude;
          const lon = selectedSuggestion.dataset.longitude;
          latitudeInput.value = lat;
          longitudeInput.value = lon;
          
          const country = selectedSuggestion.textContent.split(',')[1]?.trim();
          saveLocationToLocalStorage(cityName, lat, lon, country);
        }
        loadDataButton.click();
        event.preventDefault(); // Prevent form submission
      }
    }
  });

  citySuggestions.addEventListener("mousedown", (event) => {
    const suggestions = citySuggestions.querySelectorAll("div");
    suggestions.forEach((suggestion, index) => {
      if (suggestion === event.target) {
        selectedSuggestionIndex = index;
        const cityName = suggestion.textContent.split(',')[0];
        cityInput.value = cityName;
        citySuggestions.style.display = "none";
        
        if (suggestion.dataset.latitude && suggestion.dataset.longitude) {
          const lat = suggestion.dataset.latitude;
          const lon = suggestion.dataset.longitude;
          latitudeInput.value = lat;
          longitudeInput.value = lon;
          
          const country = suggestion.textContent.split(',')[1]?.trim();
          saveLocationToLocalStorage(cityName, lat, lon, country);
        }
        loadDataButton.click();
      }
    });
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
              saveLocationToLocalStorage(city, latitude, longitude, country);
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

    const API_KEY = 'ktpKNZOXTQaKNDFYceUuKJA13RkiDtWi'; // Calendarific API Key

    for (let year = startYear; year <= endYear; year++) {
      const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode}&year=${year}`;

      let retries = 3;
      while (retries > 0) {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.response && data.response.holidays) {
            allHolidays = allHolidays.concat(data.response.holidays);
          }
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
      const isHoliday = holidayDates.has(currentISODate);

      // Check if the current date is a weekend (Saturday or Sunday)
      const dayOfWeek = currentDate.getUTCDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 for Sunday, 6 for Saturday

      if (isHoliday) {
        calendarCell.classList.add('holiday');
        const holidayInfo = holidays.find(h => h.date.iso.slice(0, 10) === currentISODate);
        if (holidayInfo) {
          calendarCell.title = holidayInfo.name; // Add tooltip for holiday name
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
  }

  function displayHolidayDetails(holiday) {
    holidayDetailsDiv.innerHTML = `
      <h3>${holiday.name} (${holiday.localName || holiday.name})</h3>
      <p>${_t('holidayDate')}: ${holiday.date.iso}</p>
      <p>${_t('countryCode')}: ${holiday.country.id.toUpperCase()}</p>
      <p>${_t('holidayType')}: ${holiday.primary_type}</p>
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

  // Load last location if available
  setTimeout(() => {
    if (typeof _t === 'function') {
      const locationLoaded = loadLocationFromLocalStorage();
      if (locationLoaded) {
        loadDataButton.click();
      }
    } else {
      console.warn("Translation function not available yet, delaying location load");
      setTimeout(() => {
        const locationLoaded = loadLocationFromLocalStorage();
        if (locationLoaded) {
          loadDataButton.click();
        }
      }, 500);
    }
  }, 500);
});