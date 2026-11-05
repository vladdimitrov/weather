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
          firstHeader.textContent = _t("date");
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
    tbody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";
    tbody.innerHTML = `<tr><td colspan='8'>${pickText({ en: "Please enter a city or enable location.", bg: "Моля, въведете град или активирайте местоположението.", de: "Bitte geben Sie eine Stadt ein oder aktivieren Sie den Standort.", it: "Inserisci una città o attiva la posizione.", es: "Introduce una ciudad o activa la ubicación." })}</td></tr>`;
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
          const errorMessage = pickText({ en: "City not found.", bg: "Градът не е намерен.", de: "Stadt nicht gefunden.", it: "Città non trovata.", es: "Ciudad no encontrada." });
          tbody.innerHTML = `<tr><td colspan='8'>${errorMessage}</td></tr>`;
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

      }

      const today = new Date().toISOString().split("T")[0];
      const end = new Date();
      end.setDate(end.getDate() + days - 1);
      const endDate = end.toISOString().split("T")[0];

      await delay(500); // Delay for 500 milliseconds
      const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,cloudcover_mean,precipitation_sum,windspeed_10m_max,temperature_2m_mean,weather_code,sunrise,sunset,precipitation_probability_max&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&start_date=${today}&end_date=${endDate}`;
      const weatherRes = await fetch(weatherURL);
      const weatherData = await weatherRes.json();

      if (!weatherData.daily || !weatherData.daily.time) {
        console.error("Invalid weather data format:", weatherData);
        // Use translations for error messages
        const errorMessage = pickText({ en: "Error processing data.", bg: "Грешка при обработка на данните.", de: "Fehler bei der Datenverarbeitung.", it: "Errore nell'elaborazione dei dati.", es: "Error al procesar los datos." });
        tbody.innerHTML = `<tr><td colspan='8'>${errorMessage}</td></tr>`;
        return;
      }

      // Local time of the place (the forecast comes with its time zone)
      if (window.ForecastExtras && weatherData.timezone) {
        ForecastExtras.startLocalClock(weatherData.timezone);
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
          <td>${getDayName(date)}<br>${date}${dayWarningsHtml(weatherData.daily, i)}</td>
          <td>
             <div>${weatherIcons}</div>
             <div style="margin-top: 10px; font-size: 14px; cursor: pointer; color: #FFD700; padding: 5px; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 4px;" onclick="showHourlyForecast('${date}')">
               ${pickText({ en: "👉 Hourly forecast", bg: "👉 Почасова прогноза", de: "👉 Stündliche Vorhersage", it: "👉 Previsioni orarie", es: "👉 Pronóstico por horas" })}
             </div>
          </td>
          <td>${weatherData.daily.temperature_2m_min[i]}</td>
          <td>${weatherData.daily.temperature_2m_max[i]}</td>
          <td>${weatherData.daily.cloudcover_mean[i]}</td>
          <td>${weatherData.daily.precipitation_sum[i]} ${isThunderstorm(weatherData.daily.weather_code[i]) ? `<span style="font-size: 24px; margin-left: 5px;" title="${_t('iconThunder')}">⚡</span>` : ''}${rainChanceHtml(weatherData.daily, i)}</td>
          <td><span class="wind-value">${weatherData.daily.windspeed_10m_max[i]}</span></td>
          <td>${window.ForecastExtras ? ForecastExtras.sunMoonCell(date, weatherData.daily.sunrise[i], weatherData.daily.sunset[i]) : ""}</td>
         </tr>
       `;
      });

      tbody.innerHTML = rows.join("");
      labelForecastCells();

      // How certain the forecast is: ranges, reliability, model comparison
      if (window.ForecastPrecision) {
        ForecastPrecision.enhance(lat, lon, weatherData.daily.time);
      }

      // Scroll to the weather table after loading data, unless the page
      // loaded it by itself on open (data-autoload on the button)
      const loadButton = document.getElementById("loadData");
      const autoLoaded = loadButton && loadButton.dataset.autoload === "true";
      if (loadButton) delete loadButton.dataset.autoload;
      if (!autoLoaded) {
        setTimeout(() => {
          const weatherTable = document.getElementById("weatherTable");
          if (weatherTable) {
            weatherTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (err) {
      console.error("Error:", err);
      // Use translations for error messages
      const errorMessage = pickText({ en: "Error loading data.", bg: "Грешка при зареждане на данните.", de: "Fehler beim Laden der Daten.", it: "Errore nel caricamento dei dati.", es: "Error al cargar los datos." });
      tbody.innerHTML = `<tr><td colspan='8'>${errorMessage}</td></tr>`;
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
    icons.push(`<span style="font-size: 24px; margin: 0 3px;" title="${_t('iconSnow')}">❄️</span>`);
  }
  // Rain icon if there's precipitation and temperature is above 0°C
  else if (precipitation > 0 && temperature > 0) {
    icons.push(`<span style="font-size: 24px; margin: 0 3px;" title="${_t('iconRain')}">🌧️</span>`);
  }
  
  // Cloud icon if cloudiness is high
  if (cloudcover > 70) {
    icons.push(`<span style="font-size: 24px; margin: 0 3px;" title="${_t('iconCloud')}">☁️</span>`);
  }
  
  // Partly cloudy icon if cloudiness is moderate
  if (cloudcover > 30 && cloudcover <= 70) {
    icons.push(`<span style="font-size: 24px; margin: 0 3px;" title="${_t('iconSunCloud')}">⛅</span>`);
  }
  
  // Sun icon if cloudiness is low and no precipitation
  if (cloudcover <= 30 && precipitation === 0) {
    icons.push(`<span style="font-size: 24px; margin: 0 3px;" title="${_t('iconSun')}">☀️</span>`);
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
        const alertMessage = pickText({ en: "Please enter a city or latitude and longitude.", bg: "Моля, въведете град или географска ширина и дължина.", de: "Bitte geben Sie eine Stadt oder Breiten- und Längengrad ein.", it: "Inserisci una città oppure latitudine e longitudine.", es: "Introduce una ciudad o la latitud y la longitud." });
        alert(alertMessage);
      }
      updateForecast();
    });
  }
});

// Copy the column names onto the forecast cells, so the phone layout (cards,
// see /css/theme.css) can show them. Also called when the language changes.
function labelForecastCells() {
  const headers = [...document.querySelectorAll("#weatherTable thead th")].map(th => th.textContent.trim());
  document.querySelectorAll("#weatherTable tbody tr").forEach(row => {
    [...row.children].forEach((cell, index) => {
      cell.dataset.label = headers[index] || "";
    });
  });
}

// Warning badges for a forecast day (see forecast-extras.js)
function dayWarningsHtml(daily, i) {
  if (!window.ForecastExtras) return "";
  const badges = ForecastExtras.dayWarnings({
    weatherCode: daily.weather_code[i],
    windMax: daily.windspeed_10m_max[i],
    precipitation: daily.precipitation_sum[i],
    tempMin: daily.temperature_2m_min[i],
    tempMax: daily.temperature_2m_max[i]
  });
  return badges ? `<div class="wx-warnings">${badges}</div>` : "";
}

// Chance of rain for a forecast day, under the precipitation amount
function rainChanceHtml(daily, i) {
  const chance = daily.precipitation_probability_max && daily.precipitation_probability_max[i];
  if (typeof chance !== "number") return "";
  const title = pickText({ en: "Chance of rain", bg: "Вероятност за валеж", de: "Regenwahrscheinlichkeit", it: "Probabilità di pioggia", es: "Probabilidad de lluvia" });
  return `<div class="rain-chance" title="${title}">☔ ${chance}%</div>`;
}
