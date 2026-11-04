# Weather Pulse

Weather forecast, geomagnetic storms, weather maps and a public holiday calendar for any location.
Static site hosted on **GitHub Pages**.

## Live site

👉 [https://weatherpulse.eu/](https://weatherpulse.eu/)

## Pages

| Folder | Page |
|--------|------|
| `/` | Home |
| `weather/` | Daily and hourly forecast with the Kp index |
| `maps/` | Interactive weather maps with favourite locations |
| `holliday_calendar/` | Public holiday calendar by country |
| `contacts/` | Contacts and data sources |

Languages: English, Bulgarian, German, Italian, Spanish (switcher in the header, saved in the browser).

## Data sources

No API keys are needed. All services below are free and called directly from the browser.

- [Open-Meteo](https://open-meteo.com/): weather forecast and geocoding
- [NOAA SWPC](https://www.swpc.noaa.gov/): geomagnetic Kp index
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/): city search and country lookup
- [Windy](https://www.windy.com/): embedded weather maps
- [Nager.Date](https://date.nager.at/): public holidays

## Hosting

GitHub Pages serves the `main` branch from the repository root. The custom domain is set in `CNAME`.

- `404.html` is shown for missing pages.
- `cookie-consent.js` shows the cookie banner and loads Google Analytics only after the visitor accepts.
- `.htaccess` and PHP do not work on GitHub Pages, so redirects and server-side code are not used.

When adding a page, also add it to `sitemap.xml`.
