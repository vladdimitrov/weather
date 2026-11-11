function getDayName(dateString) {
  const language = document.getElementById("language").value;
  const date = new Date(dateString.substring(0, 10));
  const options = { weekday: 'long' };
  return date.toLocaleDateString(language, options);
}

function showHourlyForecast(date) {
  const hourlyTableBlock = document.getElementById("hourlyTableBlock");
  if (hourlyTableBlock) {
    hourlyTableBlock.style.display = "block";
    // Add smooth scrolling to the hourly table
    setTimeout(() => {
      hourlyTableBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
  
  // Update table title immediately if date is provided
  if (date) {
    const dayName = getDayName(date);
    const tableTitle = document.querySelector("#hourlyTableBlock h2");
    if (tableTitle) {
      console.log("DEBUG: weather-hourly.js updating table title");
      tableTitle.textContent = `${_t("hourlyForecastFor")} ${dayName} ${date}`;
    }
  }
  
  // Check if hourly table headers are being affected
  const hourlyHeaders = document.querySelectorAll("#hourlyTable thead tr th");
  if (hourlyHeaders.length > 1) {
    console.log("DEBUG: weather-hourly.js - Current hourly Weather header text:", hourlyHeaders[1].textContent);
  }
  
  updateHourlyForecast(date);
}

function updateHourlyForecast(selectedDate) {
  // Ensure selectedDate is in the correct format (YYYY-MM-DD)
  if (selectedDate) {
    console.log("Original selectedDate:", selectedDate);
    // If the date is not in YYYY-MM-DD format, try to convert it
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      try {
        const dateObj = new Date(selectedDate);
        selectedDate = dateObj.toISOString().substring(0, 10);
        console.log("Converted selectedDate:", selectedDate);
      } catch (e) {
        console.error("Error converting date:", e);
      }
    }
  }

  const city = document.getElementById("city").value.trim();
  let days, hours;

  // If a specific date is selected, we only need data for one day (24 hours)
  if (selectedDate) {
    days = 1;
    hours = 24;
  } else {
    days = 1;
    hours = 24;
  }
  
  console.log("City:", city, "Days:", days, "Hours:", hours);
  const tbody = document.querySelector("#hourlyTable tbody");
  // Use translations for loading message
  const loadingMessage = pickText({ en: "Loading...", bg: "Зареждане...", de: "Wird geladen...", it: "Caricamento...", es: "Cargando..." });
  tbody.innerHTML = `<tr><td colspan='6'>${loadingMessage}</td></tr>`;

  if ((!city && (!currentCoords.latitude || !currentCoords.longitude))) {
    // Use translations for error message
    const errorMessage = pickText({ en: "Please enter a city or enable location.", bg: "Моля, въведете град или активирайте местоположението.", de: "Bitte geben Sie eine Stadt ein oder aktivieren Sie den Standort.", it: "Inserisci una città o attiva la posizione.", es: "Introduce una ciudad o activa la ubicación." });
    tbody.innerHTML = `<tr><td colspan='6'>${errorMessage}</td></tr>`;
    return;
  }

  (async () => {
    try {
      let lat, lon;
      let geoData;
      let timezone;
      if (currentCoords.latitude && currentCoords.longitude) {
        lat = currentCoords.latitude;
        lon = currentCoords.longitude;
      } else {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`);
        geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          // Use translations for error message
          const errorMessage = pickText({ en: "City not found.", bg: "Градът не е намерен.", de: "Stadt nicht gefunden.", it: "Città non trovata.", es: "Ciudad no encontrada." });
          tbody.innerHTML = `<tr><td colspan='6'>${errorMessage}</td></tr>`;
          return;
        }
        lat = geoData.results[0].latitude;
        lon = geoData.results[0].longitude;
        updateMap(lat, lon);
        const city = geoData.results[0].name;
      }
      let country = "";
       if (geoData && geoData.results && geoData.results[0] && geoData.results[0].country) {
         country = geoData.results[0].country;
       }
      let region = "";
      if (geoData && geoData.results && geoData.results[0] && geoData.results[0].admin1) {
        region = geoData.results[0].admin1;
      }

      let now = new Date();
      const today = now.toISOString().slice(0, 10);
      const numDays = Math.ceil(hours / 24);
      console.log("numDays:", numDays, "hours:", hours);
      let allTimes = [];
      let allTemperatures = [];
      let allCloudcovers = [];
      let allPrecipitations = [];
      let allPrecipitationProbabilities = [];
      let allWindspeeds = [];

      let currentHour = now.getHours();
      let totalHours = 0;

      let i = 0;
      let allWeatherCodes = []; // Declare weatherCodes here
      while (allTimes.length < hours) {
        let currentDate;
        
        // If a specific date is selected, use that date instead of the current date
        if (selectedDate) {
          currentDate = new Date(selectedDate);
        } else {
          currentDate = new Date(now);
          currentDate.setDate(now.getDate() + i);
        }
        const startDate = currentDate.toISOString().slice(0, 10);
        let endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 1);
        const endDateString = endDate.toISOString().slice(0, 10);

        const interval = document.getElementById("interval").value;
        let parsedInterval;
        parsedInterval = parseInt(document.getElementById("interval").value);
        let hourlyURL;
        if (parsedInterval <= 30) {
          hourlyURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&minutely_15=temperature_2m,cloudcover,precipitation,precipitation_probability,windspeed_10m,weather_code&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&start_date=${startDate}&end_date=${endDateString}&interval=${parsedInterval}`;
        } else {
          hourlyURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,cloudcover,precipitation,precipitation_probability,windspeed_10m,weather_code&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&start_date=${startDate}&end_date=${endDateString}&interval=${parsedInterval}`;
        }
        console.log("Hourly URL:", hourlyURL);
        
// console.log("startIndex:", startIndex, "hours:", hours, "totalHours:", totalHours, "hourlyData.hourly.time.length:", hourlyData.hourly.time.length);
        const hourlyRes = null;
// console.log("startIndex:", startIndex, "hours:", hours, "totalHours:", totalHours, "times.length:", times.length);
        const hourlyData = window.ForecastCore ? await ForecastCore.load(hourlyURL) : await (await fetch(hourlyURL)).json();
        console.log("Hourly Data:", hourlyData);
        const timezone = hourlyData.timezone;
        parsedInterval = parseInt(document.getElementById("interval").value);
        // The 30- and 15-minute tables come from the 15-minute data (4 points an hour)
        const dataPointsPerDay = 24 * (parsedInterval <= 30 ? 4 : 1);
        console.log("dataPointsPerDay:", dataPointsPerDay, "parsedInterval:", parsedInterval);
        const totalDataPoints = days * dataPointsPerDay;
        console.log("totalDataPoints:", totalDataPoints, "days:", days);
        let times, temperatures, cloudcovers, precipitations, precipitationProbabilities, windspeeds;
        let weatherCodes; // Declare weatherCodes here
        if (parsedInterval <= 30) {
          times = hourlyData.minutely_15.time.slice(0, Math.min(totalDataPoints, hourlyData.minutely_15.time.length));
          temperatures = hourlyData.minutely_15.temperature_2m.slice(0, Math.min(totalDataPoints, hourlyData.minutely_15.temperature_2m.length));
          cloudcovers = hourlyData.minutely_15.cloudcover.slice(0,  Math.min(totalDataPoints, hourlyData.minutely_15.cloudcover.length));
          precipitations = hourlyData.minutely_15.precipitation.slice(0, Math.min(totalDataPoints, hourlyData.minutely_15.precipitation.length));
          precipitationProbabilities = hourlyData.minutely_15.precipitation_probability ? hourlyData.minutely_15.precipitation_probability.slice(0, Math.min(totalDataPoints, hourlyData.minutely_15.precipitation_probability.length)) : Array(times.length).fill(0);
          windspeeds = hourlyData.minutely_15.windspeed_10m.slice(0, Math.min(totalDataPoints, hourlyData.minutely_15.windspeed_10m.length));
          weatherCodes = hourlyData.minutely_15.weather_code ? hourlyData.minutely_15.weather_code.slice(0, Math.min(totalDataPoints, hourlyData.minutely_15.weather_code.length)) : Array(times.length).fill(0);
        } else {
          times = hourlyData.hourly.time.slice(0, Math.min(totalDataPoints, hourlyData.hourly.time.length));
          temperatures = hourlyData.hourly.temperature_2m.slice(0, Math.min(totalDataPoints, hourlyData.hourly.temperature_2m.length));
          cloudcovers = hourlyData.hourly.cloudcover.slice(0,  Math.min(totalDataPoints, hourlyData.hourly.cloudcover.length));
          precipitations = hourlyData.hourly.precipitation.slice(0, Math.min(totalDataPoints, hourlyData.hourly.precipitation.length));
          precipitationProbabilities = hourlyData.hourly.precipitation_probability ? hourlyData.hourly.precipitation_probability.slice(0, Math.min(totalDataPoints, hourlyData.hourly.precipitation_probability.length)) : Array(times.length).fill(0);
          windspeeds = hourlyData.hourly.windspeed_10m.slice(0, Math.min(totalDataPoints, hourlyData.hourly.windspeed_10m.length));
          weatherCodes = hourlyData.hourly.weather_code ? hourlyData.hourly.weather_code.slice(0, Math.min(totalDataPoints, hourlyData.hourly.weather_code.length)) : Array(times.length).fill(0);
        }
        console.log("times.length:", times.length);
        
        for (let j = 0; j < times.length; j++) {
          if (parsedInterval === 30 && j % 2 !== 0) {
            continue; // Skip every other data point for 30-minute interval
          }
          // a whole day of rows: 24 at 60 min, 48 at 30 min, 96 at 15 min
          if (allTimes.length < hours * (60 / parsedInterval)) {
            allTimes.push(times[j]);
            allTemperatures.push(temperatures[j]);
            allCloudcovers.push(cloudcovers[j]);
            allPrecipitations.push(precipitations[j]);
            allPrecipitationProbabilities.push(precipitationProbabilities[j]);
            allWindspeeds.push(windspeeds[j]);
            allWeatherCodes.push(weatherCodes[j]); // Corrected: push to allWeatherCodes
            totalHours++;
          }
        }
        if (!(times && times.length > 0)) {
          break; // No more data available
        }
        i++;
      }

      const rows = allTimes.map((date, i) => {
        const datePart = date.substring(0, 10);
        
        // Debug the date comparison
        if (selectedDate) {
          console.log("Comparing dates - Selected:", selectedDate, "Current:", datePart);
        }
        
        if (selectedDate && datePart !== selectedDate) {
          return null;
        }
        const timePart = date.substring(11, 16);
        const cloudcover = allCloudcovers[i];
        const precipitation = allPrecipitations[i];
        // Set precipitation probability to 0 if cloudcover is 0
        const precipitationProbability = cloudcover === 0 ? 0 : allPrecipitationProbabilities[i] || 0;
        const windspeed = allWindspeeds[i];
        const temperature = allTemperatures[i]; // Get temperature for hourly forecast
        const weatherCode = allWeatherCodes[i]; // Use allWeatherCodes here
        const weatherIcon = getWeatherIcon(cloudcover, precipitation, temperature);
        // Create precipitation probability bar for print view
        const precipProbBar = createPrecipProbabilityBar(precipitationProbability);
        
        return `
          <tr>
            <td>${timePart}</td>
            <td>${weatherIcon}${window.ForecastExtras ? ForecastExtras.hourWarnings({ weatherCode, windspeed, precipitation, temperature }) : ''}</td>
            <td>${temperature}</td>
            <td>${cloudcover}</td>
            <td>${precipitation}</td>
            <td>${precipitationProbability}%${precipProbBar}</td>
            <td><span class="wind-value">${windspeed}</span></td>
          </tr>
        `;
      });
     const filteredRows = rows.filter(row => row !== null);
     tbody.innerHTML = filteredRows.join("");

     // Temperature chart for the same hours (see forecast-extras.js)
     if (window.ForecastExtras) {
       const chartPoints = allTimes
         .map((time, i) => ({ date: time.substring(0, 10), time: time.substring(11, 16), temperature: allTemperatures[i], rainChance: allCloudcovers[i] === 0 ? 0 : (allPrecipitationProbabilities[i] || 0) }))
         .filter(point => !selectedDate || point.date === selectedDate);
       ForecastExtras.renderHourlyChart(chartPoints);
     }
     
     // Update table title with day name and date
     if (allTimes.length > 0) {
       const firstDate = allTimes[0].substring(0, 10);
       const dayName = getDayName(firstDate);
       const tableTitle = document.querySelector("#hourlyTableBlock h2");
       if (tableTitle) {
         console.log("DEBUG: weather-hourly.js updating table title after data load");
         tableTitle.textContent = `${_t("hourlyForecastFor")} ${dayName} ${firstDate}`;
       }
       
       // Check if headers are still translated after data load
       const hourlyHeaders = document.querySelectorAll("#hourlyTable thead tr th");
       if (hourlyHeaders.length > 1) {
         console.log("DEBUG: weather-hourly.js - After data load, hourly Weather header text:", hourlyHeaders[1].textContent);
       }
     }
     document.getElementById("location").textContent = `${city}, ${region}, ${country}`;
     // Get the current time in the specified timezone
      const locales = { en: "en-GB", bg: "bg-BG", de: "de-DE", it: "it-IT", es: "es-ES" };
      const currentTime = new Date().toLocaleString(locales[document.documentElement.lang] || "en-GB", {
        timeZone: timezone, dateStyle: "short", timeStyle: "short"
      });
      document.getElementById("local-time").textContent = `${_t("localTime")}: ${currentTime}`;
    } catch (err) {
      console.error("Error:", err);
      // Use translations for error message
      const errorMessage = pickText({ en: "Error loading data.", bg: "Грешка при зареждане на данните.", de: "Fehler beim Laden der Daten.", it: "Errore nel caricamento dei dati.", es: "Error al cargar los datos." });
      tbody.innerHTML = `<tr><td colspan='6'>${errorMessage}</td></tr>`;
    }
  })();
}

function isThunderstorm(weatherCode) {
  return weatherCode === 95 || weatherCode === 96 || weatherCode === 99;
}

function getWeatherIcon(cloudcover, precipitation, temperature) {
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

// Function to create a visual representation of precipitation probability
function createPrecipProbabilityBar(probability) {
  // Scale probability from 0-100 to 0-10 for the graph
  const scaledValue = Math.round(probability / 10);
  
  // Create a visual bar representation for print view
  let barHtml = '<div class="precip-prob-bar-container">';
  
  // Add filled and empty blocks to represent the probability
  for (let i = 1; i <= 10; i++) {
    if (i <= scaledValue) {
      barHtml += '<div class="precip-prob-bar filled"></div>';
    } else {
      barHtml += '<div class="precip-prob-bar empty"></div>';
    }
  }
  
  barHtml += '</div>';
  return barHtml;
}

document.addEventListener('DOMContentLoaded', function() {
  const showHourlyBtn = document.getElementById("showHourly");
  const hourlyTableBlock = document.getElementById("hourlyTableBlock");
  if (showHourlyBtn) {
    // Remove existing event listener to prevent duplicates
    showHourlyBtn.removeEventListener("click", updateHourlyForecastOnClick);

    // Add the event listener
    showHourlyBtn.addEventListener("click", updateHourlyForecastOnClick);
  }

  function updateHourlyForecastOnClick() {
    const hourlyTableBlock = document.getElementById("hourlyTableBlock");
    console.log("updateHourlyForecastOnClick called");
    if (hourlyTableBlock) {
      const wasHidden = hourlyTableBlock.style.display === "none";
      hourlyTableBlock.style.display = wasHidden ? "block" : "none";
      
      // If the table is being displayed, scroll to it
      if (wasHidden) {
        setTimeout(() => {
          hourlyTableBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      
      updateHourlyForecast();
    }
  }
  if (hourlyTableBlock) {
    hourlyTableBlock.style.display = "none";
  }
});