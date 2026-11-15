// Shared by the page generators: the five languages of the site, their URL
// prefixes (Bulgarian is the default and has none: /luna/, /en/luna/, /de/luna/ ...),
// menu texts and date helpers.
const LANGS = ['bg', 'en', 'de', 'it', 'es'];
const LOCALE = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
const OG_LOCALE = { bg: 'bg_BG', en: 'en_GB', de: 'de_DE', it: 'it_IT', es: 'es_ES' };

// base: the language of the root URLs of a page family (Bulgarian everywhere)
const prefix = (lang, base = 'bg') => (lang === base ? '' : `/${lang}`);
const localUrl = (lang, url, base = 'bg') => prefix(lang, base) + url;

// Plain links to the other language versions of a page, above the footer. The language switcher
// in the header is drawn by JavaScript, so without these a crawler finds the translations only
// through hreflang and the sitemap. paths: { lang: path } of the versions to link (the indexed
// ones); data-set-lang makes /js/language-selector.js remember the choice before the page opens.
const LANG_NAMES = { bg: 'Български', en: 'English', de: 'Deutsch', it: 'Italiano', es: 'Español' };
const LANG_LINKS_START = '<!-- lang-links:start -->';
const LANG_LINKS_END = '<!-- lang-links:end -->';
function langLinks(lang, paths) {
  const others = LANGS.filter(code => code !== lang && paths[code]);
  if (!others.length) return '';
  return `  ${LANG_LINKS_START}
  <nav class="lang-links" aria-label="Languages" style="text-align: center; font-size: 0.85em; color: #999; margin: 18px 0 6px;">
    ${others.map(code => `<a href="${paths[code]}" hreflang="${code}" lang="${code}" data-set-lang="${code}" class="footer-link">${LANG_NAMES[code]}</a>`).join(' · ')}
  </nav>
  ${LANG_LINKS_END}
`;
}

// <title>: the name of the site is added only when the whole title stays short enough to be shown
// in the search results (about 65 characters); a longer one keeps its own words instead
const BRAND = ' | Weather Pulse';
const withBrand = title => (title.length + BRAND.length > 65 ? title : title + BRAND);

// Same texts as navTexts in /js/mobile-nav.js
const NAV = {
  bg: { home: 'Начало', weather: 'Прогноза за времето', maps: 'Карти за времето', holidays: 'Календар на празниците', storms: 'Магнитни бури', sky: 'Небето', sources: 'Източници на данни', sourcesShort: 'Източници', moon: 'Лунен календар', cities: 'Всички градове', about: 'За сайта', privacy: 'Поверителност', resorts: 'Курорти' },
  en: { home: 'Home', weather: 'Weather Forecast', maps: 'Weather Maps', holidays: 'Holiday Calendar', storms: 'Magnetic Storms', sky: 'The Sky', sources: 'Data Sources', sourcesShort: 'Sources', moon: 'Moon Calendar', cities: 'All cities', about: 'About', privacy: 'Privacy', resorts: 'Resorts' },
  de: { home: 'Startseite', weather: 'Wettervorhersage', maps: 'Wetterkarten', holidays: 'Feiertagskalender', storms: 'Magnetstürme', sky: 'Himmel', sources: 'Datenquellen', sourcesShort: 'Quellen', moon: 'Mondkalender', cities: 'Alle Städte', about: 'Über uns', privacy: 'Datenschutz', resorts: 'Urlaubsorte' },
  it: { home: 'Home', weather: 'Previsioni del tempo', maps: 'Mappe meteorologiche', holidays: 'Calendario delle festività', storms: 'Tempeste magnetiche', sky: 'Il cielo', sources: 'Fonti dei dati', sourcesShort: 'Fonti', moon: 'Calendario lunare', cities: 'Tutte le città', about: 'Chi siamo', privacy: 'Privacy', resorts: 'Località' },
  es: { home: 'Inicio', weather: 'Pronóstico del tiempo', maps: 'Mapas del tiempo', holidays: 'Calendario de festivos', storms: 'Tormentas magnéticas', sky: 'El cielo', sources: 'Fuentes de datos', sourcesShort: 'Fuentes', moon: 'Calendario lunar', cities: 'Todas las ciudades', about: 'Acerca de', privacy: 'Privacidad', resorts: 'Destinos' }
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
  // the resorts known abroad by a translated name
  if (slug === 'slanchev-bryag') return { de: 'Sonnenstrand' }[lang] || 'Sunny Beach';
  if (slug === 'zlatni-pyasatsi') return { de: 'Goldstrand', it: 'Sabbie d’Oro', es: 'Arenas Doradas' }[lang] || 'Golden Sands';
  return slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
};

module.exports = { LANGS, LOCALE, OG_LOCALE, prefix, localUrl, LANG_NAMES, LANG_LINKS_START, LANG_LINKS_END, langLinks, withBrand, NAV, LOGO_ALT, esc, monthName, weekdayName, latinName };
