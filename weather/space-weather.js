// Space weather on the Weather page, next to the Kp forecast:
//   - solar wind now (speed and Bz from the DSCOVR satellite, NOAA summary),
//     with a "storm possible within the hour" signal; refreshed every 5 minutes
//   - NOAA's 27-day outlook of the highest Kp per day
// Texts in 5 languages via pickText() (/js/language-selector.js).
window.SpaceWeather = (function () {
  const SPEED_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json';
  const FIELD_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json';
  const OUTLOOK_URL = 'https://services.swpc.noaa.gov/text/27-day-outlook.txt';
  const REFRESH_MS = 5 * 60 * 1000;

  const T = {
    windTitle: { en: 'Solar wind now', bg: 'Слънчев вятър сега', de: 'Sonnenwind aktuell', it: 'Vento solare ora', es: 'Viento solar ahora' },
    speed: { en: 'Speed', bg: 'Скорост', de: 'Geschwindigkeit', it: 'Velocità', es: 'Velocidad' },
    calm: {
      en: 'Quiet, no storm expected in the next hour',
      bg: 'Спокойно, без буря в следващия час',
      de: 'Ruhig, kein Sturm in der nächsten Stunde erwartet',
      it: 'Calmo, nessuna tempesta prevista nella prossima ora',
      es: 'Tranquilo, sin tormenta en la próxima hora'
    },
    watch: {
      en: 'Increased activity possible within the hour',
      bg: 'Възможна повишена активност до час',
      de: 'Erhöhte Aktivität innerhalb einer Stunde möglich',
      it: "Possibile aumento dell'attività entro un'ora",
      es: 'Posible aumento de actividad en la próxima hora'
    },
    storm: {
      en: '⚠️ Geomagnetic storm possible within the hour',
      bg: '⚠️ Възможна магнитна буря до час',
      de: '⚠️ Magnetsturm innerhalb einer Stunde möglich',
      it: "⚠️ Possibile tempesta magnetica entro un'ora",
      es: '⚠️ Posible tormenta geomagnética en la próxima hora'
    },
    windHelp: {
      en: 'Measured by the DSCOVR satellite 1.5 million km from Earth; it reaches us in 30–60 minutes. Fast wind with a negative (southward) Bz drives storms.',
      bg: 'Измерено от спътника DSCOVR на 1,5 млн. км от Земята; достига до нас за 30–60 минути. Бърз вятър с отрицателно (южно) Bz предизвиква бури.',
      de: 'Gemessen vom Satelliten DSCOVR 1,5 Mio. km von der Erde; erreicht uns in 30–60 Minuten. Schneller Wind mit negativem (südwärts gerichtetem) Bz löst Stürme aus.',
      it: 'Misurato dal satellite DSCOVR a 1,5 milioni di km dalla Terra; ci raggiunge in 30–60 minuti. Vento veloce con Bz negativo (verso sud) provoca tempeste.',
      es: 'Medido por el satélite DSCOVR a 1,5 millones de km de la Tierra; nos alcanza en 30–60 minutos. Viento rápido con Bz negativo (hacia el sur) provoca tormentas.'
    },
    outlookTitle: { en: '27-day outlook (NOAA)', bg: 'Прогноза за 27 дни (NOAA)', de: '27-Tage-Ausblick (NOAA)', it: 'Previsione a 27 giorni (NOAA)', es: 'Pronóstico a 27 días (NOAA)' },
    outlookNote: {
      en: "Expected highest Kp per day, based on the Sun's 27-day rotation. A rough guide.",
      bg: 'Очакван най-висок Kp за деня, по 27-дневното въртене на Слънцето. Ориентировъчно.',
      de: 'Erwarteter höchster Kp-Wert pro Tag, basierend auf der 27-tägigen Sonnenrotation. Grobe Orientierung.',
      it: 'Kp massimo previsto per giorno, in base alla rotazione solare di 27 giorni. Indicativo.',
      es: 'Kp máximo previsto por día, según la rotación solar de 27 días. Orientativo.'
    }
  };

  const locales = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

  let wind = null;     // { speed, bz, bt, time }
  let outlook = null;  // [{ date, kp }]
  let container = null;

  function level(kp) {
    return kp >= 7 ? 'storm' : kp >= 5 ? 'active' : 'calm';
  }

  function windStatus({ speed, bz }) {
    if (bz <= -10 && speed >= 500) return 'storm';
    if ((bz <= -5 && speed >= 400) || speed >= 600) return 'watch';
    return 'calm';
  }

  function ensureContainer() {
    if (container) return container;
    const anchor = document.getElementById('kpForecast') || document.querySelector('.info-display');
    if (!anchor) return null;
    container = document.createElement('div');
    container.id = 'spaceWeather';
    container.className = 'space-weather';
    container.hidden = true;
    anchor.insertAdjacentElement('afterend', container);
    return container;
  }

  function render() {
    const box = ensureContainer();
    if (!box || (!wind && !outlook)) return;
    const parts = [];

    if (wind) {
      const status = windStatus(wind);
      parts.push(
        `<div class="solar-wind" title="${pickText(T.windHelp).replace(/"/g, '&quot;')}">` +
        `<h3>☀️ ${pickText(T.windTitle)}</h3>` +
        `<div class="solar-wind-values"><span>${pickText(T.speed)}: <b>${Math.round(wind.speed)} km/s</b></span>` +
        `<span>Bz: <b>${wind.bz > 0 ? '+' : ''}${wind.bz} nT</b></span></div>` +
        `<div class="solar-wind-status wind-${status}">${pickText(T[status])}</div></div>`
      );
    }

    if (outlook && outlook.length) {
      const dayFormat = new Intl.DateTimeFormat(locales[document.documentElement.lang] || 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
      const days = outlook.map(day => {
        const label = dayFormat.format(day.date);
        return `<span class="outlook-day kp-${level(day.kp)}" title="${label}: Kp ${day.kp}">` +
          `<span class="outlook-kp">${day.kp}</span><span class="outlook-date">${day.date.getUTCDate()}</span></span>`;
      }).join('');
      parts.push(
        `<details class="kp-outlook"><summary>📅 ${pickText(T.outlookTitle)}</summary>` +
        `<div class="outlook-days">${days}</div><p class="outlook-note">${pickText(T.outlookNote)}</p></details>`
      );
    }

    const wasOpen = box.querySelector('details.kp-outlook')?.open;
    box.innerHTML = parts.join('');
    if (wasOpen) box.querySelector('details.kp-outlook').open = true;
    box.hidden = false;
  }

  async function loadWind() {
    try {
      const [speedResponse, fieldResponse] = await Promise.all([fetch(SPEED_URL), fetch(FIELD_URL)]);
      if (!speedResponse.ok || !fieldResponse.ok) throw new Error('HTTP error');
      const [speed] = await speedResponse.json();
      const [field] = await fieldResponse.json();
      if (!speed || !field) throw new Error('No solar wind data');
      wind = { speed: Number(speed.proton_speed), bz: Number(field.bz_gsm), bt: Number(field.bt), time: field.time_tag };
      render();
    } catch (err) {
      console.error('Error loading solar wind:', err);
    }
  }

  // Lines like "2026 Nov 05     150           8          3" (date, flux, Ap, largest Kp)
  async function loadOutlook() {
    try {
      const response = await fetch(OUTLOOK_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      const today = new Date().toISOString().slice(0, 10);
      outlook = text.split('\n')
        .map(line => line.match(/^(\d{4}) (\w{3}) (\d{2})\s+\d+\s+\d+\s+(\d+)/))
        .filter(match => match && match[2] in months)
        .map(match => ({ date: new Date(Date.UTC(+match[1], months[match[2]], +match[3])), kp: Number(match[4]) }))
        .filter(day => day.date.toISOString().slice(0, 10) >= today);
      render();
    } catch (err) {
      console.error('Error loading 27-day outlook:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadWind();
    loadOutlook();
    setInterval(loadWind, REFRESH_MS);
    const languageSelect = document.getElementById('language');
    if (languageSelect) languageSelect.addEventListener('change', render);
  });

  return { render };
})();
