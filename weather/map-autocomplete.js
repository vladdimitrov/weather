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
      if (query.length < 2) return;

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

          // Get user's current location
          const userLat = document.getElementById("latitude").value;
          const userLon = document.getElementById("longitude").value;

          // Function to calculate distance using Haversine formula
          function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Radius of the Earth in kilometers
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

          // Add distance to each result
          const placesWithDistance = data.results.map(place => {
            const distance = (userLat && userLon) ? calculateDistance(userLat, userLon, place.latitude, place.longitude) : null;
            return { ...place, distance };
          });

          // Sort by distance
          placesWithDistance.sort((a, b) => {
            if (a.distance === null) return -1; // Put null distances at the beginning
            if (b.distance === null) return 1;
            return a.distance - b.distance;
          });

          const sofiaBulgaria = placesWithDistance.find(place => place.name === "Sofia" && place.country === "Bulgaria");

          const query = cityInput.value.trim();
          const transliteratedQuery = transliterate(query);
          const encodedQuery = encodeURIComponent(transliteratedQuery);
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
              if (place.country === "Bulgaria" && place.name === "Sofia") {
                label = "Sofia, Bulgaria" + distanceText;
              }

            const suggestion = document.createElement("div");
            suggestion.className = "suggestion";
            suggestion.dataset.latitude = place.latitude;
            suggestion.dataset.longitude = place.longitude;
            suggestion.style.padding = "10px 15px";
            suggestion.style.cursor = "pointer";
            suggestion.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
            suggestion.style.color = "#ffffff";
            suggestion.style.transition = "background 0.3s ease";
            
            // Create a more structured display with distance highlighted
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
              document.getElementById("latitude").value = place.latitude;
              document.getElementById("longitude").value = place.longitude;
              // Set the city name in weather-fixed.js
              document.getElementById("city").value = native;
              
              // Save location to localStorage
              saveLocationToLocalStorage(native, place.latitude, place.longitude, place.country);
              
              // Trigger the loadData button click to load the weather data
              document.getElementById("loadData").click();
            });
            citySuggestions.appendChild(suggestion);
          });
        }
      } catch (err) {
        // Use translations for error messages
        const errorMessage = document.getElementById("language").value === "bg" ?
          "Грешка при търсене на град:" :
          document.getElementById("language").value === "de" ?
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
      }
    });

    cityInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const suggestions = citySuggestions.querySelectorAll("div");
        if (suggestions.length === 0) return;

        if (selectedSuggestionIndex !== -1) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          const cityName = selectedSuggestion.textContent.split(',')[0];
          cityInput.value = cityName;
          citySuggestions.style.display = "none";
          
          // Set latitude and longitude from the selected suggestion
          if (selectedSuggestion.dataset.latitude && selectedSuggestion.dataset.longitude) {
            const lat = selectedSuggestion.dataset.latitude;
            const lon = selectedSuggestion.dataset.longitude;
            document.getElementById("latitude").value = lat;
            document.getElementById("longitude").value = lon;
            
            // Save location to localStorage
            const country = selectedSuggestion.textContent.split(',')[1]?.trim();
            saveLocationToLocalStorage(cityName, lat, lon, country);
          }
          
          document.getElementById("loadData").click();
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
          
          // Set latitude and longitude from the selected suggestion
          if (suggestion.dataset.latitude && suggestion.dataset.longitude) {
            const lat = suggestion.dataset.latitude;
            const lon = suggestion.dataset.longitude;
            document.getElementById("latitude").value = lat;
            document.getElementById("longitude").value = lon;
            
            // Save location to localStorage
            const country = suggestion.textContent.split(',')[1]?.trim();
            saveLocationToLocalStorage(cityName, lat, lon, country);
          }
          
          document.getElementById("loadData").click();
        }
      });
    });

    const loadDataBtn = document.getElementById("loadData");
    if (loadDataBtn) {
      loadDataBtn.addEventListener("click", async (event) => {
        const query = cityInput.value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        if ((!query || query.length === 0) && ((!latitude || latitude.length === 0) || (!longitude || longitude.length === 0))) {
          // Use translations for alert messages
          const alertMessage = document.getElementById("language").value === "bg" ?
            "Моля, въведете град или географска ширина и дължина." :
            document.getElementById("language").value === "de" ?
            "Bitte geben Sie eine Stadt oder Breiten- und Längengrad ein." :
            "Please enter a city or latitude and longitude.";
          alert(alertMessage);
          return;
        }

        if (latitude && longitude) {
          try {
            updateMap(latitude, longitude);
            // Fetch the city name from the coordinates
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
              const selectedLanguage = document.documentElement.lang || 'en';
              document.getElementById("selected-city").textContent = `${_t('selectedLocation')}: ${city}, ${data.address.country}`;
            } else {
              // Use translations for coordinates text
              const coordsText = document.getElementById("language").value === "bg" ?
                "Координати" :
                document.getElementById("language").value === "de" ?
                "Koordinaten" :
                "Coordinates";
              document.getElementById("selected-city").textContent = `${coordsText} (${latitude}, ${longitude})`;
            }
            //document.getElementById("loadData").click();
          } catch (err) {
            console.error("Error getting weather data:", err);
            // Use translations for error messages
            const errorMessage = document.getElementById("language").value === "bg" ?
              "Грешка при получаване на данни за времето. Моля, опитайте отново по-късно." :
              document.getElementById("language").value === "de" ?
              "Fehler beim Abrufen von Wetterdaten. Bitte versuchen Sie es später erneut." :
              "Error getting weather data. Please try again later.";
            alert(errorMessage);
          }
          return;
        }

        if (!query) return;

        // Use the transliterate function defined at the top of the file

        try {
          const transliteratedQuery = transliterate(query);
          const encodedQuery = encodeURIComponent(transliteratedQuery);
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=1&format=json&language=en`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const place = data.results[0];
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
          const errorMessage = document.getElementById("language").value === "bg" ?
            "Грешка при избор на град:" :
            document.getElementById("language").value === "de" ?
            "Fehler bei der Stadtauswahl:" :
            "Error selecting city:";
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