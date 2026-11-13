// Every city that has a page of its own (Bulgaria: /vremeto/<city>/, Europe: /europe/<country>/<city>/),
// with its name in the five languages and the languages in which its page is indexed.
// Used for the "Nearby cities" links of the city pages and for /gradove/ (all cities).
const I18N = require('./i18n.js');
const CITIES = require('./bg-cities.js');
const COUNTRIES = require('./europe-data.js');
const NAMES = require('./europe-names.js');

// Translations of the city pages that are worth indexing. Bulgarian and English: every city.
// German, Italian and Spanish: the cities of countries that speak the language and the big
// tourist places; nobody searches for "El tiempo en Vratsa" in Spanish.
const SPEAKERS = { DE: ['de'], AT: ['de'], CH: ['de', 'it'], LU: ['de'], IT: ['it'], ES: ['es'] };
const TOURIST_BG = ['sofia', 'plovdiv', 'varna', 'burgas', 'veliko-tarnovo', 'bansko', 'borovets', 'pamporovo', 'nesebar', 'sozopol'];
const TOURIST_EUROPE = [
  'vienna', 'salzburg', 'innsbruck', 'brussels', 'bruges', 'dubrovnik', 'split', 'paphos', 'limassol', 'prague', 'copenhagen',
  'helsinki', 'rovaniemi', 'paris', 'nice', 'marseille', 'berlin', 'munich', 'athens', 'thessaloniki', 'heraklion', 'rhodes',
  'budapest', 'reykjavik', 'dublin', 'rome', 'milan', 'naples', 'florence', 'venice', 'valletta', 'budva', 'kotor', 'amsterdam',
  'ohrid', 'oslo', 'tromso', 'krakow', 'lisbon', 'porto', 'faro', 'funchal', 'bucharest', 'brasov', 'ljubljana', 'bled',
  'madrid', 'barcelona', 'seville', 'malaga', 'valencia', 'palma', 'stockholm', 'zurich', 'geneva', 'lucerne', 'london', 'edinburgh',
  'santorini', 'mykonos', 'istanbul'
];
// Resorts that Bulgarians and Germans look for, Italians and Spaniards hardly: Bulgarian, English, German
const GERMAN_TOURIST = [
  'kavala', 'thassos', 'keramoti', 'alexandroupoli', 'asprovalta', 'stavros', 'olympiada', 'ouranoupoli', 'nikiti', 'neos-marmaras',
  'hanioti', 'kallithea', 'paralia-katerinis', 'kalambaka', 'parga', 'corfu', 'lefkada', 'kefalonia', 'zakynthos', 'nafplio', 'chania', 'kos',
  'edirne', 'canakkale', 'izmir', 'kusadasi', 'didim', 'bodrum', 'marmaris', 'fethiye', 'kemer', 'antalya', 'belek', 'side', 'alanya', 'goreme'
];
const ALL = I18N.LANGS;
const BASIC = ['bg', 'en'];
const bgIndexed = slug => (TOURIST_BG.includes(slug) ? ALL : BASIC);
const europeIndexed = (code, slug) => (TOURIST_EUROPE.includes(slug) ? ALL
  : [...new Set([...BASIC, ...(SPEAKERS[code] || []), ...(GERMAN_TOURIST.includes(slug) ? ['de'] : [])])].sort((a, b) => ALL.indexOf(a) - ALL.indexOf(b)));

const bgName = (city, lang) => (lang === 'bg' ? city.name : I18N.latinName(lang, city.slug));
function europeName(city, lang) {
  const names = NAMES[city[0]];
  if (!names) throw new Error(`europe-names.js: no names for "${city[0]}"`);
  return lang === 'en' ? city[1] : names[['bg', 'de', 'it', 'es'].indexOf(lang)];
}

const PLACES = [
  ...CITIES.map(city => ({
    country: 'BG', url: `/vremeto/${city.slug}/`, lat: city.lat, lon: city.lon,
    name: Object.fromEntries(ALL.map(lang => [lang, bgName(city, lang)])), indexed: bgIndexed(city.slug)
  })),
  ...COUNTRIES.flatMap(country => country.cities.map(city => ({
    country: country.code, countrySlug: country.slug, url: `/europe/${country.slug}/${city[0]}/`, lat: city[3], lon: city[4],
    name: Object.fromEntries(ALL.map(lang => [lang, europeName(city, lang)])), indexed: europeIndexed(country.code, city[0])
  })))
];

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
};

// The closest city pages to a place: the nearest in the same country and the nearest across
// the border, each list nearest first
function nearby(lat, lon, url, country) {
  const sorted = PLACES.filter(place => place.url !== url)
    .map(place => ({ place, km: Math.round(distanceKm(lat, lon, place.lat, place.lon)) }))
    .sort((a, b) => a.km - b.km);
  return {
    home: sorted.filter(item => item.place.country === country).slice(0, 4),
    abroad: sorted.filter(item => item.place.country !== country).slice(0, 4)
  };
}

module.exports = { PLACES, nearby, distanceKm, bgIndexed, europeIndexed, europeName, bgName, TOURIST_BG };
