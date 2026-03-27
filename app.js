// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// WMO weather interpretation codes → emoji + description
const WMO_CODES = {
  0:  { icon: '☀️',  desc: 'Clear sky' },
  1:  { icon: '🌤',  desc: 'Mainly clear' },
  2:  { icon: '⛅',  desc: 'Partly cloudy' },
  3:  { icon: '☁️',  desc: 'Overcast' },
  45: { icon: '🌫',  desc: 'Fog' },
  48: { icon: '🌫',  desc: 'Depositing rime fog' },
  51: { icon: '🌦',  desc: 'Light drizzle' },
  53: { icon: '🌦',  desc: 'Moderate drizzle' },
  55: { icon: '🌧',  desc: 'Dense drizzle' },
  61: { icon: '🌧',  desc: 'Slight rain' },
  63: { icon: '🌧',  desc: 'Moderate rain' },
  65: { icon: '🌧',  desc: 'Heavy rain' },
  71: { icon: '🌨',  desc: 'Slight snow fall' },
  73: { icon: '🌨',  desc: 'Moderate snow fall' },
  75: { icon: '❄️',  desc: 'Heavy snow fall' },
  77: { icon: '🌨',  desc: 'Snow grains' },
  80: { icon: '🌦',  desc: 'Slight rain showers' },
  81: { icon: '🌧',  desc: 'Moderate rain showers' },
  82: { icon: '🌧',  desc: 'Violent rain showers' },
  85: { icon: '🌨',  desc: 'Slight snow showers' },
  86: { icon: '❄️',  desc: 'Heavy snow showers' },
  95: { icon: '⛈',  desc: 'Thunderstorm' },
  96: { icon: '⛈',  desc: 'Thunderstorm with slight hail' },
  99: { icon: '⛈',  desc: 'Thunderstorm with heavy hail' },
};

async function geocode(city) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Geocoding service unavailable.');
  const data = await res.json();
  if (!data.length) throw new Error(`City "${city}" not found.`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name.split(',')[0] };
}

async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&wind_speed_unit=ms`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather service unavailable.');
  return res.json();
}

function showError(msg) {
  const card = document.getElementById('weather-card');
  const errCard = document.getElementById('error-card');
  const errMsg = document.getElementById('error-message');
  card.hidden = true;
  errMsg.textContent = msg;
  errCard.hidden = false;
}

function showWeather(name, data) {
  const current = data.current;
  const wmo = WMO_CODES[current.weather_code] || { icon: '🌡', desc: 'Unknown' };

  document.getElementById('city-name').textContent = name;
  document.getElementById('weather-icon').textContent = wmo.icon;
  document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
  document.getElementById('description').textContent = wmo.desc;
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('wind').textContent = `${current.wind_speed_10m} m/s`;
  document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;

  document.getElementById('error-card').hidden = true;
  document.getElementById('weather-card').hidden = false;
}

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('city-input').value.trim();
  if (!city) return;

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '…';

  try {
    const { lat, lon, name } = await geocode(city);
    const weather = await fetchWeather(lat, lon);
    showWeather(name, weather);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Search';
  }
});
