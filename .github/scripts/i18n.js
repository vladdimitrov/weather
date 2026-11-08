// Shared by the page generators: the five languages of the site, their URL
// prefixes (Bulgarian is the default and has none: /luna/, /en/luna/, /de/luna/ ...),
// menu texts and date helpers.
const LANGS = ['bg', 'en', 'de', 'it', 'es'];
const LOCALE = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
const OG_LOCALE = { bg: 'bg_BG', en: 'en_GB', de: 'de_DE', it: 'it_IT', es: 'es_ES' };

// base: the language of the root URLs of a page family (Bulgarian, but English for /europe/)
const prefix = (lang, base = 'bg') => (lang === base ? '' : `/${lang}`);
const localUrl = (lang, url, base = 'bg') => prefix(lang, base) + url;

// Same texts as navTexts in /js/mobile-nav.js
const NAV = {
  bg: { home: 'Начало', weather: 'Прогноза за времето', maps: 'Карти за времето', holidays: 'Календар на празниците', storms: 'Магнитни бури', sky: 'Небето', sources: 'Източници на данни', about: 'За сайта', privacy: 'Поверителност' },
  en: { home: 'Home', weather: 'Weather Forecast', maps: 'Weather Maps', holidays: 'Holiday Calendar', storms: 'Magnetic Storms', sky: 'The Sky', sources: 'Data Sources', about: 'About', privacy: 'Privacy' },
  de: { home: 'Startseite', weather: 'Wettervorhersage', maps: 'Wetterkarten', holidays: 'Feiertagskalender', storms: 'Magnetstürme', sky: 'Himmel', sources: 'Datenquellen', about: 'Über uns', privacy: 'Datenschutz' },
  it: { home: 'Home', weather: 'Previsioni del tempo', maps: 'Mappe meteorologiche', holidays: 'Calendario delle festività', storms: 'Tempeste magnetiche', sky: 'Il cielo', sources: 'Fonti dei dati', about: 'Chi siamo', privacy: 'Privacy' },
  es: { home: 'Inicio', weather: 'Pronóstico del tiempo', maps: 'Mapas del tiempo', holidays: 'Calendario de festivos', storms: 'Tormentas magnéticas', sky: 'El cielo', sources: 'Fuentes de datos', about: 'Acerca de', privacy: 'Privacidad' }
};
const LOGO_ALT = { bg: 'Лого', en: 'Logo', de: 'Logo', it: 'Logo', es: 'Logo' };

const esc = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Month names, lower case in Bulgarian, Italian and Spanish, as the language writes them
const monthName = (lang, month) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: 'UTC', month: 'long' }).format(new Date(Date.UTC(2026, month, 15)));
const weekdayName = (lang, weekday) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: 'UTC', weekday: 'long' }).format(new Date(Date.UTC(2026, 0, 4 + weekday, 12)));

// Name of a Bulgarian city in the Latin alphabet (from its URL slug)
const latinName = (lang, slug) => {
  if (slug === 'sofia' && lang === 'es') return 'Sofía';
  if (slug === 'nesebar') return 'Nessebar';
  return slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
};

module.exports = { LANGS, LOCALE, OG_LOCALE, prefix, localUrl, NAV, LOGO_ALT, esc, monthName, weekdayName, latinName };
