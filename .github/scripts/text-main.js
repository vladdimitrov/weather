// Titles and descriptions of the translated forecast, maps and holiday calendar pages
// (/en/weather/, /de/maps/ ...), written by build-main.js. The Bulgarian ones are in the pages
// themselves; the rest of each page is translated in the browser by its own scripts.
// The same keys in all four languages: change them together.
module.exports = {
  '/weather/': {
    en: {
      title: 'Weather forecast by day and hour',
      description: 'Weather forecast by day and hour for any city: temperature, precipitation, wind, sunrise and sunset and the phase of the Moon.'
    },
    de: {
      title: 'Wettervorhersage nach Tagen und Stunden',
      description: 'Wettervorhersage nach Tagen und Stunden für jede Stadt: Temperatur, Niederschlag, Wind, Sonnenaufgang und Sonnenuntergang und Mondphase.'
    },
    it: {
      title: 'Previsioni del tempo per giorno e ora',
      description: 'Previsioni del tempo per giorno e ora per qualsiasi città: temperatura, precipitazioni, vento, alba e tramonto e fase della Luna.'
    },
    es: {
      title: 'Pronóstico del tiempo por días y horas',
      description: 'Pronóstico del tiempo por días y horas para cualquier ciudad: temperatura, precipitaciones, viento, amanecer y atardecer y fase de la Luna.'
    }
  },
  '/maps/': {
    en: {
      title: 'Interactive weather maps',
      description: 'Interactive maps of rain, wind, temperature, clouds and thunderstorms for the whole world, with favourite places.'
    },
    de: {
      title: 'Interaktive Wetterkarten',
      description: 'Interaktive Karten für Regen, Wind, Temperatur, Wolken und Gewitter für die ganze Welt, mit Lieblingsorten.'
    },
    it: {
      title: 'Mappe meteorologiche interattive',
      description: 'Mappe interattive di pioggia, vento, temperatura, nuvole e temporali per tutto il mondo, con i luoghi preferiti.'
    },
    es: {
      title: 'Mapas del tiempo interactivos',
      description: 'Mapas interactivos de lluvia, viento, temperatura, nubes y tormentas para todo el mundo, con lugares favoritos.'
    }
  },
  '/holliday_calendar/': {
    en: {
      title: 'Public holiday calendar',
      description: 'Calendar of public holidays for any country and period, with the days off marked. Download to Google, Apple or Outlook calendar.'
    },
    de: {
      title: 'Kalender der gesetzlichen Feiertage',
      description: 'Kalender der gesetzlichen Feiertage für jedes Land und jeden Zeitraum, mit markierten freien Tagen. Download für Google-, Apple- oder Outlook-Kalender.'
    },
    it: {
      title: 'Calendario delle festività ufficiali',
      description: 'Calendario delle festività ufficiali per qualsiasi paese e periodo, con i giorni festivi evidenziati. Scaricabile nei calendari Google, Apple o Outlook.'
    },
    es: {
      title: 'Calendario de festivos oficiales',
      description: 'Calendario de festivos oficiales para cualquier país y periodo, con los días no laborables marcados. Descarga para los calendarios de Google, Apple u Outlook.'
    }
  }
};
