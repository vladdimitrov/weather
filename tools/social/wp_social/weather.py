"""Daily forecast for a list of cities from Open-Meteo (free, no API key)."""
import logging
import time
from dataclasses import dataclass

import requests

log = logging.getLogger(__name__)

OPEN_METEO = "https://api.open-meteo.com/v1/forecast"

# WMO weather code -> (Bulgarian description, icon kind)
WMO = {
    0: ("Ясно", "sun"),
    1: ("Предимно ясно", "sun"),
    2: ("Разкъсана облачност", "partly"),
    3: ("Облачно", "cloud"),
    45: ("Мъгла", "fog"),
    48: ("Мъгла със скреж", "fog"),
    51: ("Слаб ръмеж", "rain"),
    53: ("Ръмеж", "rain"),
    55: ("Силен ръмеж", "rain"),
    56: ("Леден ръмеж", "rain"),
    57: ("Леден ръмеж", "rain"),
    61: ("Слаб дъжд", "rain"),
    63: ("Дъжд", "rain"),
    65: ("Силен дъжд", "rain"),
    66: ("Леден дъжд", "rain"),
    67: ("Леден дъжд", "rain"),
    71: ("Слаб сняг", "snow"),
    73: ("Сняг", "snow"),
    75: ("Силен снеговалеж", "snow"),
    77: ("Снежни зърна", "snow"),
    80: ("Краткотраен дъжд", "rain"),
    81: ("Превалявания", "rain"),
    82: ("Силни превалявания", "rain"),
    85: ("Снежни превалявания", "snow"),
    86: ("Силни снеговалежи", "snow"),
    95: ("Гръмотевици", "storm"),
    96: ("Гръмотевици с град", "storm"),
    99: ("Гръмотевици с град", "storm"),
}


@dataclass
class CityForecast:
    name: str
    tmax: int
    tmin: int
    code: int
    rain_pct: int
    url: str = ""

    @property
    def description(self):
        return WMO.get(self.code, ("", "cloud"))[0]

    @property
    def icon(self):
        return WMO.get(self.code, ("", "cloud"))[1]


def fetch_forecast(cities, timezone="Europe/Sofia", day_offset=0):
    """Return one CityForecast per city for today (+day_offset). One HTTP request for all cities."""
    params = {
        "latitude": ",".join(str(c["lat"]) for c in cities),
        "longitude": ",".join(str(c["lon"]) for c in cities),
        "daily": "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
        "timezone": timezone,
        "forecast_days": day_offset + 1,
    }
    data = None
    for attempt in range(1, 5):  # Open-Meteo is sometimes slow from CI runners: retry with a pause
        try:
            r = requests.get(OPEN_METEO, params=params, timeout=60)
            r.raise_for_status()
            data = r.json()
            break
        except requests.RequestException as e:
            if attempt == 4:
                raise
            log.warning("Open-Meteo attempt %d failed (%s), retrying in %ds", attempt, e, 20 * attempt)
            time.sleep(20 * attempt)
    if isinstance(data, dict):  # a single city returns an object, several return a list
        data = [data]
    out = []
    for city, d in zip(cities, data):
        daily = d["daily"]
        i = day_offset
        out.append(CityForecast(
            name=city["name"],
            tmax=round(daily["temperature_2m_max"][i]),
            tmin=round(daily["temperature_2m_min"][i]),
            code=int(daily["weather_code"][i]),
            rain_pct=int(daily["precipitation_probability_max"][i] or 0),
            url=city.get("url", ""),
        ))
    return out


def sample_forecast(cities):
    """Offline sample data for testing the image without network access."""
    codes = [0, 2, 3, 61, 71, 95, 45, 80]
    out = []
    for i, c in enumerate(cities):
        out.append(CityForecast(c["name"], 14 - i, 3 - i, codes[i % len(codes)], (i * 13) % 100, c.get("url", "")))
    return out
