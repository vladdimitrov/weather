// Shared by the page generators: the seven languages of the site, their URL
// prefixes (Bulgarian is the default and has none: /luna/, /en/luna/, /de/luna/ ...),
// menu texts and date helpers.
const LANGS = ['bg', 'en', 'de', 'it', 'es', 'fr', 'nl'];
// Romanian is added page by page (the ski resorts first): LANGS stays the seven languages every page has,
// ALL adds Romanian, and RO_URLS are the (Bulgarian) addresses that exist in Romanian (text-ro.js).
// A Romanian page links to the English page where it has no Romanian one.
const RO_URLS = require('./text-ro.js').URLS;
const ALL = [...LANGS, 'ro'];
const langsFor = url => (RO_URLS.includes(url) ? ALL : LANGS);
const LOCALE = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES', fr: 'fr-FR', nl: 'nl-NL', ro: 'ro-RO' };
const OG_LOCALE = { bg: 'bg_BG', en: 'en_GB', de: 'de_DE', it: 'it_IT', es: 'es_ES', fr: 'fr_FR', nl: 'nl_NL', ro: 'ro_RO' };

// base: the language of the root URLs of a page family (Bulgarian everywhere)
const prefix = (lang, base = 'bg') => (lang === base ? '' : `/${lang}`);
// Addresses in the language of the page. The site started with Bulgarian words in every address
// (/de/vremeto/sofia/); French, Dutch and Romanian, added later and not yet indexed, have their
// own words instead (/fr/meteo/sofia/, /nl/maan/2027/januari/, /ro/vremea/bansko/). Names of
// places stay as they are. The old French and Dutch addresses are redirect pages (build-redirects.js).
// The same words are in localPages of /js/mobile-nav.js and in /js/home-cities.js.
const MONTHS = ['yanuari', 'fevruari', 'mart', 'april', 'may', 'yuni', 'yuli', 'avgust', 'septemvri', 'oktomvri', 'noemvri', 'dekemvri'];
const monthWords = list => Object.fromEntries(MONTHS.map((month, i) => [month, list.split(' ')[i]]));
const SLUGS = {
  fr: {
    vremeto: 'meteo', luna: 'lune', pylnolunie: 'pleine-lune', novolunie: 'nouvelle-lune', praznici: 'jours-feries', darzhavi: 'pays',
    gradove: 'villes', kurorti: 'stations', nebeto: 'ciel', 'magnitni-buri': 'tempetes-magnetiques', 'za-saita': 'a-propos',
    poveritelnost: 'confidentialite', iztochnici: 'sources', uidzhet: 'widget-meteo', '10-dni': '10-jours', uikend: 'week-end',
    weather: 'previsions', maps: 'cartes', holliday_calendar: 'calendrier-jours-feries',
    ...monthWords('janvier fevrier mars avril mai juin juillet aout septembre octobre novembre decembre')
  },
  nl: {
    vremeto: 'weer', luna: 'maan', pylnolunie: 'volle-maan', novolunie: 'nieuwe-maan', praznici: 'feestdagen', darzhavi: 'landen',
    gradove: 'steden', kurorti: 'vakantieoorden', nebeto: 'hemel', 'magnitni-buri': 'magnetische-stormen', 'za-saita': 'over-ons',
    poveritelnost: 'privacy', iztochnici: 'bronnen', uidzhet: 'weerwidget', '10-dni': '10-dagen', uikend: 'weekend',
    weather: 'weersverwachting', maps: 'weerkaarten', holliday_calendar: 'feestdagenkalender', europe: 'europa',
    ...monthWords('januari februari maart april mei juni juli augustus september oktober november december')
  },
  ro: {
    vremeto: 'vremea', pylnolunie: 'luna-plina', novolunie: 'luna-noua', praznici: 'sarbatori', darzhavi: 'tari',
    gradove: 'orase', kurorti: 'statiuni', nebeto: 'cerul', 'magnitni-buri': 'furtuni-magnetice', 'za-saita': 'despre',
    poveritelnost: 'confidentialitate', iztochnici: 'surse', uidzhet: 'widget', '10-dni': '10-zile', uikend: 'weekend', dnes: 'azi', utre: 'maine',
    weather: 'prognoza', maps: 'harti', holliday_calendar: 'calendar-sarbatori', europe: 'europa',
    ...monthWords('ianuarie februarie martie aprilie mai iunie iulie august septembrie octombrie noiembrie decembrie')
  }
};
// "/vremeto/sofia/" -> "/meteo/sofia/" (fr); every other language keeps the Bulgarian words
const localPath = (lang, url) => (SLUGS[lang] ? url.replace(/[^/?#]+/g, (segment, at) => (url.slice(0, at).match(/[?#]/) ? segment : SLUGS[lang][segment] || segment)) : url);
// The other way: the Bulgarian address of a path in this language
const REVERSE = Object.fromEntries(Object.entries(SLUGS).map(([lang, words]) => [lang, Object.fromEntries(Object.entries(words).map(([bg, word]) => [word, bg]))]));
const bgPath = (lang, url) => (REVERSE[lang] ? url.replace(/[^/?#]+/g, segment => REVERSE[lang][segment] || segment) : url);
const localUrl = (lang, url, base = 'bg') => (lang === 'ro' && !RO_URLS.includes(url) ? '/en' + url : prefix(lang, base) + localPath(lang, url));

// Plain links to the other language versions of a page, above the footer. The language switcher
// in the header is drawn by JavaScript, so without these a crawler finds the translations only
// through hreflang and the sitemap. paths: { lang: path } of the versions to link (the indexed
// ones); data-set-lang makes /js/language-selector.js remember the choice before the page opens.
const LANG_NAMES = { bg: 'Български', en: 'English', de: 'Deutsch', it: 'Italiano', es: 'Español', fr: 'Français', nl: 'Nederlands', ro: 'Română' };
const LANG_LINKS_START = '<!-- lang-links:start -->';
const LANG_LINKS_END = '<!-- lang-links:end -->';
function langLinks(lang, paths) {
  const others = ALL.filter(code => code !== lang && paths[code]);
  if (!others.length) return '';
  return `  ${LANG_LINKS_START}
  <nav class="lang-links" aria-label="${lang === 'ro' ? 'Limbi' : 'Languages'}" style="text-align: center; font-size: 0.85em; color: #999; margin: 18px 0 6px;">
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
  bg: { home: 'Начало', weather: 'Прогноза за времето', maps: 'Карти за времето', holidays: 'Календар на празниците', storms: 'Магнитни бури', sky: 'Небето', sources: 'Източници на данни', sourcesShort: 'Източници', moon: 'Лунен календар', cities: 'Всички градове', about: 'За сайта', privacy: 'Поверителност', resorts: 'Курорти', dataBy: 'Данни:' },
  en: { home: 'Home', weather: 'Weather Forecast', maps: 'Weather Maps', holidays: 'Holiday Calendar', storms: 'Magnetic Storms', sky: 'The Sky', sources: 'Data Sources', sourcesShort: 'Sources', moon: 'Moon Calendar', cities: 'All cities', about: 'About', privacy: 'Privacy', resorts: 'Resorts', dataBy: 'Data:' },
  de: { home: 'Startseite', weather: 'Wettervorhersage', maps: 'Wetterkarten', holidays: 'Feiertagskalender', storms: 'Magnetstürme', sky: 'Himmel', sources: 'Datenquellen', sourcesShort: 'Quellen', moon: 'Mondkalender', cities: 'Alle Städte', about: 'Über uns', privacy: 'Datenschutz', resorts: 'Urlaubsorte', dataBy: 'Daten:' },
  it: { home: 'Home', weather: 'Previsioni del tempo', maps: 'Mappe meteorologiche', holidays: 'Calendario delle festività', storms: 'Tempeste magnetiche', sky: 'Il cielo', sources: 'Fonti dei dati', sourcesShort: 'Fonti', moon: 'Calendario lunare', cities: 'Tutte le città', about: 'Chi siamo', privacy: 'Privacy', resorts: 'Località', dataBy: 'Dati:' },
  es: { home: 'Inicio', weather: 'Pronóstico del tiempo', maps: 'Mapas del tiempo', holidays: 'Calendario de festivos', storms: 'Tormentas magnéticas', sky: 'El cielo', sources: 'Fuentes de datos', sourcesShort: 'Fuentes', moon: 'Calendario lunar', cities: 'Todas las ciudades', about: 'Acerca de', privacy: 'Privacidad', resorts: 'Destinos', dataBy: 'Datos:' },
  fr: { home: 'Accueil', weather: 'Prévisions météo', maps: 'Cartes météo', holidays: 'Calendrier des jours fériés', storms: 'Tempêtes magnétiques', sky: 'Le ciel', sources: 'Sources des données', sourcesShort: 'Sources', moon: 'Calendrier lunaire', cities: 'Toutes les villes', about: 'À propos', privacy: 'Confidentialité', resorts: 'Stations', dataBy: 'Données :' },
  nl: { home: 'Home', weather: 'Weerbericht', maps: 'Weerkaarten', holidays: 'Feestdagenkalender', storms: 'Magnetische stormen', sky: 'De hemel', sources: 'Gegevensbronnen', sourcesShort: 'Bronnen', moon: 'Maankalender', cities: 'Alle steden', about: 'Over ons', privacy: 'Privacy', resorts: 'Vakantieoorden', dataBy: 'Gegevens:' },
  ro: { home: 'Acasă', weather: 'Prognoza meteo', maps: 'Hărți meteo', holidays: 'Calendarul sărbătorilor', storms: 'Furtuni magnetice', sky: 'Cerul', sources: 'Surse de date', sourcesShort: 'Surse', moon: 'Calendar lunar', cities: 'Toate orașele', about: 'Despre site', privacy: 'Confidențialitate', resorts: 'Stațiuni', dataBy: 'Date:' }
};
const LOGO_ALT = { bg: 'Лого', en: 'Logo', de: 'Logo', it: 'Logo', es: 'Logo', fr: 'Logo', nl: 'Logo', ro: 'Logo' };

const esc = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Month names, lower case in Bulgarian, Italian, Spanish, French and Dutch, as the language writes them
const monthName = (lang, month) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: 'UTC', month: 'long' }).format(new Date(Date.UTC(2026, month, 15)));
const weekdayName = (lang, weekday) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: 'UTC', weekday: 'long' }).format(new Date(Date.UTC(2026, 0, 4 + weekday, 12)));

const FRENCH_NAMES = {
  burgas: 'Bourgas', ruse: 'Roussé', dobrich: 'Dobritch', shumen: 'Choumen', pazardzhik: 'Pazardjik', asenovgrad: 'Assenovgrad',
  kardzhali: 'Kardjali', lovech: 'Lovetch', targovishte: 'Targovichte', balchik: 'Baltchik', chepelare: 'Tchepelaré', dobrinishte: 'Dobrinichté'
};

// Name of a Bulgarian city in the Latin alphabet (from its URL slug)
const latinName = (lang, slug) => {
  if (slug === 'sofia' && lang === 'es') return 'Sofía';
  if (slug === 'nesebar') return 'Nessebar';
  // French spellings of the Bulgarian names (the ones French maps and guides use)
  if (lang === 'fr' && FRENCH_NAMES[slug]) return FRENCH_NAMES[slug];
  // the resorts known abroad by a translated name
  if (slug === 'slanchev-bryag') return { de: 'Sonnenstrand' }[lang] || 'Sunny Beach';
  if (slug === 'zlatni-pyasatsi') return { de: 'Goldstrand', it: 'Sabbie d’Oro', es: 'Arenas Doradas', fr: 'Sables d’Or', nl: 'Gouden Zanden' }[lang] || 'Golden Sands';
  return slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
};

module.exports = { LANGS, ALL, RO_URLS, langsFor, LOCALE, OG_LOCALE, prefix, localUrl, localPath, bgPath, SLUGS, LANG_NAMES, LANG_LINKS_START, LANG_LINKS_END, langLinks, withBrand, NAV, LOGO_ALT, esc, monthName, weekdayName, latinName };
