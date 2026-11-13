let headerSet = false;
// Day asked for in the address (?date=...); read now, the address is rewritten later
const dayFromUrl = new URLSearchParams(location.search).get("date");

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
          firstHeader.textContent = _t("date");
          headerSet = true;
        }
      }
    }
  }
  const city = document.getElementById("city").value.trim();
  let days = parseInt(document.getElementById("days").value);
  if (dayFromUrl && !window.dayFromUrlShown) {
    // Make sure the requested day is inside the loaded range
    const needed = Math.round((new Date(dayFromUrl) - new Date(new Date().toISOString().split("T")[0])) / 86400000) + 1;
    if (needed > 0 && needed <= 16 && (isNaN(days) || days < needed)) {
      days = needed;
      document.getElementById("days").value = needed;
    }
  }
  const dayCards = document.getElementById("dayCards");
  
  if ((!city && (!currentCoords.latitude || !currentCoords.longitude)) || isNaN(days)) {
        showDayMessage(`${pickText({ en: "Please enter a city or enable location.", bg: "Моля, въведете град или активирайте местоположението.", de: "Bitte geben Sie eine Stadt ein oder aktivieren Sie den Standort.", it: "Inserisci una città o attiva la posizione.", es: "Introduce una ciudad o activa la ubicación." })}`);
    return;
  }

  (async () => {
    try {
      let lat = currentCoords.latitude;
      dayCards.replaceChildren();
      if (window.UiExtras) UiExtras.skeleton(days);
      let lon = currentCoords.longitude;
      
      if (!lat || !lon) {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          // Use translations for error messages
          const errorMessage = pickText({ en: "City not found.", bg: "Градът не е намерен.", de: "Stadt nicht gefunden.", it: "Città non trovata.", es: "Ciudad no encontrada." });
          showDayMessage(`${errorMessage}`);
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
          saveLocationToLocalStorage(geoData.results[0].name, lat, lon, geoData.results[0].country, geoData.results[0].country_code);
        }

      }

      const today = new Date().toISOString().split("T")[0];
      const end = new Date();
      end.setDate(end.getDate() + days - 1);
      const endDate = end.toISOString().split("T")[0];

      await delay(500); // Delay for 500 milliseconds
      const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,cloudcover_mean,precipitation_sum,windspeed_10m_max,wind_gusts_10m_max,temperature_2m_mean,weather_code,sunrise,sunset,precipitation_probability_max&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&start_date=${today}&end_date=${endDate}`;
      // the median of three models (js/forecast-core.js), the default forecast if that fails
      const weatherData = window.ForecastCore ? await ForecastCore.load(weatherURL) : await (await fetch(weatherURL)).json();

      if (!weatherData.daily || !weatherData.daily.time) {
        console.error("Invalid weather data format:", weatherData);
        // Use translations for error messages
        const errorMessage = pickText({ en: "Error processing data.", bg: "Грешка при обработка на данните.", de: "Fehler bei der Datenverarbeitung.", it: "Errore nell'elaborazione dei dati.", es: "Error al procesar los datos." });
        showDayMessage(`${errorMessage}`, true);
        return;
      }

      // Local time of the place (the forecast comes with its time zone)
      if (window.ForecastExtras && weatherData.timezone) {
        ForecastExtras.startLocalClock(weatherData.timezone);
      }

      lastDaily = weatherData.daily;
      renderDayCards();
      document.dispatchEvent(new CustomEvent("forecast:loaded", { detail: { lat, lon } }));

      // Opened from a city page's day card (?date=...): show that day's hours
      if (dayFromUrl && !window.dayFromUrlShown && weatherData.daily.time.includes(dayFromUrl)) {
        window.dayFromUrlShown = true;
        selectDay(dayFromUrl);
      }

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
      showDayMessage(`${errorMessage}`, true);
    }
  })();
}

// Forecast days as buttons: a click opens that day's hourly forecast
let lastDaily = null;

function showDayMessage(html, retry) {
  const box = document.getElementById("dayCards");
  if (!box) return;
  box.removeAttribute("aria-busy");
  const again = retry
    ? `<br><button type="button" class="btn day-retry" onclick="document.getElementById('loadData').click()">↻ ${pickText({ en: "Try again", bg: "Опитай пак", de: "Erneut versuchen", it: "Riprova", es: "Reintentar" })}</button>`
    : "";
  box.innerHTML = `<p class="day-msg">${html}${again}</p>`;
}

function renderDayCards() {
  const box = document.getElementById("dayCards");
  if (!box || !lastDaily) return;
  const daily = lastDaily;
  const language = document.getElementById("language").value;
  const selected = box.querySelector(".day-card.selected");
  const selectedDate = selected && selected.dataset.date;
  const hint = pickText({ en: "Hourly forecast →", bg: "По часове →", de: "Stündlich →", it: "Ora per ora →", es: "Por horas →" });
  box.innerHTML = daily.time.map((date, i) => {
    const day = new Date(date + "T12:00:00");
    const name = day.toLocaleDateString(language, { weekday: "short" });
    const shortDate = date.slice(5).split("-").reverse().join(".");
    const icons = getDailyWeatherIcons(daily.cloudcover_mean[i], daily.precipitation_sum[i], daily.temperature_2m_mean[i], daily.weather_code[i]);
    const chance = daily.precipitation_probability_max && daily.precipitation_probability_max[i];
    const amount = daily.precipitation_sum[i];
    const rain = typeof chance === "number"
      ? `<span class="dc-line" title="${pickText({ en: "Chance of rain", bg: "Вероятност за валеж", de: "Regenwahrscheinlichkeit", it: "Probabilità di pioggia", es: "Probabilidad de lluvia" })}">${window.WeatherIcons ? WeatherIcons.medal("rain", "", "sm") : "☔"} ${chance}%${amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ""}</span>` : "";
    const gust = daily.wind_gusts_10m_max ? daily.wind_gusts_10m_max[i] : null;
    const wind = `<span class="dc-line${gust >= 60 ? " city-day-gusts" : ""}">${window.WeatherIcons ? WeatherIcons.medal("wind", "", "sm") : "💨"} ${Math.round(daily.windspeed_10m_max[i])} km/h${typeof gust === "number" ? ` · ${window.ForecastExtras ? ForecastExtras.gustLabel() : "gusts"} ${Math.round(gust)}` : ""}</span>`;
    const sunMoon = window.ForecastExtras ? ForecastExtras.sunMoonCell(date, daily.sunrise[i], daily.sunset[i]) : "";
    return `<button type="button" class="kp-day city-day day-card${date === selectedDate ? " selected" : ""}" data-date="${date}" onclick="selectDay('${date}')">
      <span class="kp-day-name">${name}</span>
      <span class="city-day-date">${shortDate}</span>
      <span class="dc-icons">${icons}</span>
      <span class="city-day-temp dc-temp">${Math.round(daily.temperature_2m_min[i])}° / ${Math.round(daily.temperature_2m_max[i])}°</span>
      ${window.UiExtras ? UiExtras.rangeBar(daily, i) + UiExtras.condition(daily.weather_code[i]) : ""}
      ${rain}${wind}
      <span class="dc-sun">${sunMoon}</span>
      ${dayWarningsHtml(daily, i)}
      <span class="city-day-hourly">${hint}</span>
    </button>`;
  }).join("");
}

function selectDay(date) {
  document.querySelectorAll("#dayCards .day-card").forEach(card => card.classList.toggle("selected", card.dataset.date === date));
  showHourlyForecast(date);
}

document.addEventListener("change", event => {
  if (event.target && event.target.id === "language") renderDayCards();
});

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
    icons.push(WeatherIcons.medal('snow', _t('iconSnow')));
  }
  // Rain icon if there's precipitation and temperature is above 0°C
  else if (precipitation > 0 && temperature > 0) {
    icons.push(WeatherIcons.medal('rain', _t('iconRain')));
  }

  // Cloud icon if cloudiness is high
  if (cloudcover > 70) {
    icons.push(WeatherIcons.medal('cloud', _t('iconCloud')));
  }

  // Partly cloudy icon if cloudiness is moderate
  if (cloudcover > 30 && cloudcover <= 70) {
    icons.push(WeatherIcons.medal('cloudSun', _t('iconSunCloud')));
  }

  // Sun icon if cloudiness is low and no precipitation
  if (cloudcover <= 30 && precipitation === 0) {
    icons.push(WeatherIcons.medal('sun', _t('iconSun')));
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
    gustMax: daily.wind_gusts_10m_max ? daily.wind_gusts_10m_max[i] : null,
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
