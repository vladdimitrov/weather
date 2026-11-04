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
        document.getElementById("city").value = location.city;
        document.getElementById("latitude").value = location.latitude;
        document.getElementById("longitude").value = location.longitude;
        updateMap(location.latitude, location.longitude);
        
        const label = location.country ?
          `${location.city}, ${location.country}` :
          `${location.city}`;
        
        // We'll update the selected-city text after the language is loaded
        // This will be handled when the loadData button is clicked
        return true;
      }
    } catch (e) {
      console.error("Error parsing saved location:", e);
    }
  }
  return false;
}

document.addEventListener('DOMContentLoaded', function() {
  const cityInput = document.getElementById("city");
  const citySuggestions = document.getElementById("citySuggestions");
  
  if (cityInput && citySuggestions) {
    let selectedPlace = null; // last place picked from the suggestions

    CitySearch.attach(cityInput, citySuggestions, {
      getOrigin: () => ({
        latitude: parseFloat(document.getElementById("latitude").value),
        longitude: parseFloat(document.getElementById("longitude").value)
      }),
      onSelect: (place) => {
        selectedPlace = place;
        const label = `${place.name}, ${place.country}`;
        document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${label}`;
        document.getElementById("latitude").value = place.latitude;
        document.getElementById("longitude").value = place.longitude;
        saveLocationToLocalStorage(place.name, place.latitude, place.longitude, place.country);
        document.getElementById("loadData").click();
      }
    });

    const loadDataBtn = document.getElementById("loadData");
    if (loadDataBtn) {
      loadDataBtn.addEventListener("click", async (event) => {
        const query = cityInput.value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        if ((!query || query.length === 0) && ((!latitude || latitude.length === 0) || (!longitude || longitude.length === 0))) {
          // Use translations for alert messages
          const alertMessage = pickText({ en: "Please enter a city or latitude and longitude.", bg: "Моля, въведете град или географска ширина и дължина.", de: "Bitte geben Sie eine Stadt oder Breiten- und Längengrad ein.", it: "Inserisci una città oppure latitudine e longitudine.", es: "Introduce una ciudad o la latitud y la longitud." });
          alert(alertMessage);
          return;
        }

        if (latitude && longitude) {
          try {
            updateMap(latitude, longitude);
            // A place picked from the suggestions already shows its name
            if (CitySearch.isAt(selectedPlace, latitude, longitude)) return;
            // Fetch the city name from the coordinates
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
              const selectedLanguage = document.documentElement.lang || 'en';
              document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${city}, ${data.address.country}`;
            } else {
              // Use translations for coordinates text
              const coordsText = pickText({ en: "Coordinates", bg: "Координати", de: "Koordinaten", it: "Coordinate", es: "Coordenadas" });
              document.getElementById("selected-city").textContent = `${coordsText} (${latitude}, ${longitude})`;
            }
            //document.getElementById("loadData").click();
          } catch (err) {
            console.error("Error getting weather data:", err);
            // Use translations for error messages
            const errorMessage = pickText({ en: "Error getting weather data. Please try again later.", bg: "Грешка при получаване на данни за времето. Моля, опитайте отново по-късно.", de: "Fehler beim Abrufen von Wetterdaten. Bitte versuchen Sie es später erneut.", it: "Errore nel recupero dei dati meteo. Riprova più tardi.", es: "Error al obtener los datos del tiempo. Inténtalo de nuevo más tarde." });
            alert(errorMessage);
          }
          return;
        }

        if (!query) return;

        try {
          const [place] = await CitySearch.search(query, { count: 1 });
          if (place) {
            const lat = place.latitude;
            const lon = place.longitude;
            updateMap(lat, lon);
            const selectedLanguage = document.documentElement.lang || 'en';
            document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${place.name}, ${place.country}`;
            
            // Save location to localStorage
            saveLocationToLocalStorage(place.name, lat, lon, place.country);
            
            //document.getElementById("loadData").click();
          }
        } catch (err) {
          // Use translations for error messages
          const errorMessage = pickText({ en: "Error selecting city:", bg: "Грешка при избор на град:", de: "Fehler bei der Stadtauswahl:", it: "Errore nella selezione della città:", es: "Error al seleccionar la ciudad:" });
          console.error(errorMessage, err);
        }
      });
    }

    // Clear location functionality removed as requested
    
    // Load last location if available - we'll do this after a delay to ensure language is loaded
    setTimeout(() => {
      // Make sure language is loaded first
      if (typeof _t === 'function') {
        const locationLoaded = loadLocationFromLocalStorage();
        if (locationLoaded) {
          // Trigger the loadData button click to load the weather data
          document.getElementById("loadData").click();
        }
      } else {
        console.warn("Translation function not available yet, delaying location load");
        // Try again after another delay
        setTimeout(() => {
          const locationLoaded = loadLocationFromLocalStorage();
          if (locationLoaded) {
            document.getElementById("loadData").click();
          }
        }, 500);
      }
    }, 500); // Small delay to ensure all components are loaded
  }
});