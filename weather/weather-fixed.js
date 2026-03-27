let headerSet = false;

function updateForecast() {
  // Hide hourly forecast table when a destination is reloaded
  const hourlyTableBlock = document.getElementById("hourlyTableBlock");
  if (hourlyTableBlock) {
    hourlyTableBlock.style.display = "none";
  }
  
  if (!headerSet) {
    const weatherTable = document.getElementById("weatherTable");
    if (weatherTable) {
      const headerRow = weatherTable.querySelector("thead tr");
      if (headerRow) {
        const firstHeader = headerRow.querySelector("th:first-child");
        const weatherHeader = headerRow.querySelector("th:nth-child(2)");
        if (firstHeader) {
          console.log("DEBUG: weather-fixed.js is setting Date header");
          firstHeader.textContent = "Date";
          headerSet = true;
        }
        if (weatherHeader) {
          console.log("DEBUG: weather-fixed.js found Weather header, current text:", weatherHeader.textContent);
          console.log("DEBUG: weather-fixed.js is NOT changing Weather header - this should preserve translation");
        }
      }
    }
  }
  const city = document.getElementById("city").value.trim();
  const days = parseInt(document.getElementById("days").value);
  const tbody = document.querySelector("#weatherTable tbody");
  
  if ((!city && (!currentCoords.latitude || !currentCoords.longitude)) || isNaN(days)) {
    tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
    tbody.innerHTML = "<tr><td colspan='7'>Please enter a city or enable location.</td></tr>";
    return;
  }

  (async () => {
    try {
      let lat = currentCoords.latitude;
      tbody.innerHTML = "";
      let lon = currentCoords.longitude;
      console.log("Latitude:", lat, "Longitude:", lon);
      
      if (!lat || !lon) {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          // Use translations for error messages
          const errorMessage = document.getElementById("language").value === "bg" ?
            "Градът не е намерен." :
            document.getElementById("language").value === "de" ?
            "Stadt nicht gefunden." :
            "City not found.";
          tbody.innerHTML = `<tr><td colspan='7'>${errorMessage}</td></tr>`;
          return;
        }
        if (geoData.results.length > 1) {
          // Display suggestions
          let suggestionsHTML = "";
          geoData.results.forEach(result => {
            suggestionsHTML += `<div class='suggestion' data-latitude='${result.latitude}' data-longitude='${result.longitude}'>${result.name}, ${result.admin1 ? result.admin1 + ', ' : ''}${result.country}</div>`;
          });
          document.getElementById("citySuggestions").innerHTML = suggestionsHTML;
          document.getElementById("citySuggestions").style.display = "block";
          return;
        }
        lat = geoData.results[0].latitude;
        lon = geoData.results[0].longitude;
        updateMap(lat, lon);
        
        // Save location to localStorage if the function exists
        if (typeof saveLocationToLocalStorage === 'function') {
          saveLocationToLocalStorage(geoData.results[0].name, lat, lon, geoData.results[0].country);
        }
        
        window.updateLocalTime(lat, lon);
      }

      const today = new Date().toISOString().split("T")[0];
      const end = new Date();
      end.setDate(end.getDate() + days - 1);
      const endDate = end.toISOString().split("T")[0];

      await delay(500); // Delay for 500 milliseconds
      const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,cloudcover_mean,precipitation_sum,windspeed_10m_max,temperature_2m_mean,weather_code&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&start_date=${today}&end_date=${endDate}`;
      const weatherRes = await fetch(weatherURL);
      const weatherData = await weatherRes.json();

      if (!weatherData.daily || !weatherData.daily.time) {
        console.error("Invalid weather data format:", weatherData);
        // Use translations for error messages
        const errorMessage = document.getElementById("language").value === "bg" ?
          "Грешка при обработка на данните." :
          document.getElementById("language").value === "de" ?
          "Fehler bei der Datenverarbeitung." :
          "Error processing data.";
        tbody.innerHTML = `<tr><td colspan='7'>${errorMessage}</td></tr>`;
        return;
      }

      const rows = weatherData.daily.time.map((date, i) => {
        const localDate = new Date(date);
        const formattedDate = localDate.toLocaleDateString();
        const weatherIcons = getDailyWeatherIcons(
          weatherData.daily.cloudcover_mean[i],
          weatherData.daily.precipitation_sum[i],
          weatherData.daily.temperature_2m_mean[i],
          weatherData.daily.weather_code[i]
        );
        return `
        <tr>
          <td>${getDayName(date)}<br>${date}</td>
          <td>
             <div>${weatherIcons}</div>
             <div style="margin-top: 10px; font-size: 14px; cursor: pointer; color: #FFD700; padding: 5px; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 4px;" onclick="showHourlyForecast('${date}')">
               ${document.getElementById("language").value === "bg" ?
                 "👉 Почасова прогноза" :
                 document.getElementById("language").value === "de" ?
                 "👉 Stündliche Vorhersage" :
                 "👉 Hourly forecast"}
             </div>
          </td>
          <td>${weatherData.daily.temperature_2m_min[i]}</td>
          <td>${weatherData.daily.temperature_2m_max[i]}</td>
          <td>${weatherData.daily.cloudcover_mean[i]}</td>
          <td>${weatherData.daily.precipitation_sum[i]} ${isThunderstorm(weatherData.daily.weather_code[i]) ? '<span style="font-size: 24px; margin-left: 5px;" title="Thunderstorm">⚡</span>' : ''}</td>
          <td><span class="wind-value">${weatherData.daily.windspeed_10m_max[i]}</span></td>
         </tr>
       `;
      });

      tbody.innerHTML = rows.join("");
      
      // Scroll to the weather table after loading data
      setTimeout(() => {
        const weatherTable = document.getElementById("weatherTable");
        if (weatherTable) {
          weatherTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error("Error:", err);
      // Use translations for error messages
      const errorMessage = document.getElementById("language").value === "bg" ?
        "Грешка при зареждане на данните." :
        document.getElementById("language").value === "de" ?
        "Fehler beim Laden der Daten." :
        "Error loading data.";
      tbody.innerHTML = `<tr><td colspan='7'>${errorMessage}</td></tr>`;
    }
  })();
}

function getDayName(dateString) {
  const language = document.getElementById("language").value;
  const date = new Date(dateString);
  const options = { weekday: 'long' };
  return date.toLocaleDateString(language, options);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isThunderstorm(weatherCode) {
  return weatherCode === 95 || weatherCode === 96 || weatherCode === 99;
}

function getDailyWeatherIcons(cloudcover, precipitation, temperature, weatherCode) {
  let icons = [];
  
  // Snow icon if there's precipitation and temperature is at or below 0°C
  if (precipitation > 0 && temperature <= 0) {
    icons.push('<span style="font-size: 24px; margin: 0 3px;" title="Snow">❄️</span>');
  }
  // Rain icon if there's precipitation and temperature is above 0°C
  else if (precipitation > 0 && temperature > 0) {
    icons.push('<span style="font-size: 24px; margin: 0 3px;" title="Cloud with Rain">🌧️</span>');
  }
  
  // Cloud icon if cloudiness is high
  if (cloudcover > 70) {
    icons.push('<span style="font-size: 24px; margin: 0 3px;" title="Cloud">☁️</span>');
  }
  
  // Partly cloudy icon if cloudiness is moderate
  if (cloudcover > 30 && cloudcover <= 70) {
    icons.push('<span style="font-size: 24px; margin: 0 3px;" title="Sun with Cloud">⛅</span>');
  }
  
  // Sun icon if cloudiness is low and no precipitation
  if (cloudcover <= 30 && precipitation === 0) {
    icons.push('<span style="font-size: 24px; margin: 0 3px;" title="Sun">☀️</span>');
  }
  
  return icons.join(' ');
}

document.addEventListener('DOMContentLoaded', function() {
  const loadDataBtn = document.getElementById("loadData");
  if (loadDataBtn) {
    loadDataBtn.addEventListener("click", () => {
      const city = document.getElementById("city").value.trim();
      const latitude = document.getElementById("latitude").value;
      const longitude = document.getElementById("longitude").value;

      if ((!city || city.length === 0) && (!currentCoords.latitude || !currentCoords.longitude)) {
        // Use translations for alert messages
        const alertMessage = document.getElementById("language").value === "bg" ?
          "Моля, въведете град или географска ширина и дължина." :
          document.getElementById("language").value === "de" ?
          "Bitte geben Sie eine Stadt oder Breiten- und Längengrad ein." :
          "Please enter a city or latitude and longitude.";
        alert(alertMessage);
      }
      updateForecast();
    });
  }
});