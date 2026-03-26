# Weather Pulse

A lightweight weather web app hosted on **GitHub Pages**.

## Live site

👉 [https://vladdimitrov.github.io/weather/](https://vladdimitrov.github.io/weather/)

## Features

- Search any city in the world
- Displays current temperature, "feels like", humidity, wind speed and weather condition
- Powered by the free [Open-Meteo](https://open-meteo.com/) weather API and [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) geocoding — no API key required

## Hosting on GitHub Pages

This repository is configured to serve the static site directly from the root of the `main` branch via **GitHub Pages**.

To enable it in your own fork:
1. Go to **Settings → Pages**
2. Under *Source*, select **Deploy from a branch**
3. Choose the `main` branch and `/ (root)` folder
4. Click **Save** — the site will be live at `https://<your-username>.github.io/weather/`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main page markup |
| `style.css` | Styling |
| `app.js` | Weather API integration and UI logic |
