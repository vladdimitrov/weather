// Builds /js/destinations.json: the main cities and resorts of each country,
// shown as one-tap buttons under the place search (js/city-search.js) for the
// country of the selected place. Names in the 5 site languages and the
// coordinates come from the Open-Meteo geocoding API.
// Run from the repository root: node .github/scripts/build-destinations.js [GR,CZ]
// (with country codes: rebuild only those countries in the existing file)
const fs = require('fs');
const path = require('path');

const LANGUAGES = ['en', 'bg', 'de', 'it', 'es'];
const API = 'https://geocoding-api.open-meteo.com/v1/search';

// Country code -> places (English names; "Name|Region" or "Name@lat,lon" when the
// name is ambiguous: the region, or the nearest match to those coordinates)
const DESTINATIONS = {
  BG: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Veliko Tarnovo', 'Bansko', 'Sozopol', 'Nesebar', 'Borovets@42.27,23.61', 'Pamporovo'],
  GR: ['Athens', 'Thessaloniki', 'Heraklion', 'Chania', 'Rhodes', 'Corfu', 'Kavala', 'Patrai', 'Kalamata'],
  TR: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bodrum', 'Alanya', 'Edirne', 'Bursa', 'Fethiye'],
  RO: ['Bucharest', 'Cluj-Napoca', 'Constanta', 'Brasov', 'Timisoara', 'Iasi', 'Sibiu', 'Sinaia'],
  RS: ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Pirot'],
  MK: ['Skopje', 'Ohrid', 'Bitola', 'Struga', 'Strumica', 'Kumanovo'],
  AL: ['Tirana', 'Durres', 'Vlore', 'Sarande', 'Shkoder', 'Berat'],
  ME: ['Podgorica', 'Budva', 'Kotor', 'Herceg Novi', 'Bar', 'Zabljak'],
  HR: ['Zagreb', 'Split', 'Dubrovnik', 'Zadar', 'Pula', 'Rijeka', 'Makarska', 'Rovinj'],
  SI: ['Ljubljana', 'Maribor', 'Bled', 'Piran', 'Koper'],
  BA: ['Sarajevo', 'Mostar', 'Banja Luka', 'Tuzla', 'Neum'],
  HU: ['Budapest', 'Debrecen', 'Szeged', 'Pecs', 'Siofok', 'Eger'],
  AT: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz', 'Hallstatt', 'Kitzbuhel'],
  DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt am Main', 'Cologne', 'Stuttgart', 'Dresden', 'Dusseldorf', 'Nuremberg'],
  IT: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Bologna', 'Palermo', 'Bari', 'Verona'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Malaga', 'Palma', 'Bilbao', 'Granada', 'Alicante'],
  PT: ['Lisbon', 'Porto', 'Faro', 'Funchal', 'Coimbra', 'Albufeira'],
  FR: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Chamonix'],
  GB: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool', 'Glasgow', 'Bristol', 'Oxford'],
  IE: ['Dublin', 'Cork', 'Galway', 'Limerick'],
  NL: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  BE: ['Brussels', 'Antwerp', 'Bruges', 'Ghent', 'Liege'],
  CH: ['Zurich', 'Geneva', 'Bern', 'Basel', 'Lucerne', 'Zermatt', 'Interlaken'],
  CZ: ['Prague', 'Brno', 'Ostrava', 'Karlovy Vary', 'Cesky Krumlov', 'Pilsen'],
  SK: ['Bratislava', 'Kosice', 'Zilina', 'Poprad'],
  PL: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Zakopane'],
  DK: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
  SE: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Kiruna'],
  NO: ['Oslo', 'Bergen', 'Tromso', 'Stavanger', 'Trondheim'],
  FI: ['Helsinki', 'Tampere', 'Turku', 'Rovaniemi'],
  IS: ['Reykjavik', 'Akureyri'],
  EE: ['Tallinn', 'Tartu', 'Parnu'],
  LV: ['Riga', 'Jurmala', 'Liepaja'],
  LT: ['Vilnius', 'Kaunas', 'Klaipeda'],
  CY: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Ayia Napa'],
  MT: ['Valletta', 'Sliema', 'Mellieha'],
  UA: ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'],
  MD: ['Chisinau', 'Balti'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas', 'San Francisco', 'Washington|District of Columbia', 'Orlando'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  EG: ['Cairo', 'Hurghada', 'Sharm el-Sheikh', 'Alexandria', 'Luxor'],
  AE: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  TH: ['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai'],
  JP: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo'],
  TN: ['Tunis', 'Sousse', 'Hammamet', 'Monastir'],
  MA: ['Marrakesh', 'Casablanca', 'Rabat', 'Agadir', 'Fes']
};

// Bulgarian names missing from the geocoding data
const BG_NAMES = {
  'Veliko Tarnovo': 'Велико Търново', Heraklion: 'Ираклион', Chania: 'Ханя', Rhodes: 'Родос', Corfu: 'Корфу',
  Kavala: 'Кавала', Patrai: 'Патра', Kalamata: 'Каламата', Alanya: 'Аланя', Strumica: 'Струмица',
  Kotor: 'Котор', 'Herceg Novi': 'Херцег Нови', Piran: 'Пиран', Koper: 'Копер', Hallstatt: 'Халщат',
  Cologne: 'Кьолн', Verona: 'Верона', Seville: 'Севиля', Palma: 'Палма де Майорка', Faro: 'Фаро',
  Coimbra: 'Коимбра', Albufeira: 'Албуфейра', Chamonix: 'Шамони', Bruges: 'Брюж', Ghent: 'Гент',
  Lucerne: 'Люцерн', Interlaken: 'Интерлакен', Pilsen: 'Пилзен', Poprad: 'Попрад', Akureyri: 'Акюрейри',
  Parnu: 'Пярну', Jurmala: 'Юрмала', Paphos: 'Пафос', Sliema: 'Слима', Mellieha: 'Мелиха',
  Washington: 'Вашингтон', 'Sharm el-Sheikh': 'Шарм ел Шейх', Phuket: 'Пукет', 'Chiang Mai': 'Чианг Май'
};

const plain = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function geocode(name, countryCode, language) {
  const url = `${API}?name=${encodeURIComponent(name)}&count=20&language=${language}&format=json&countryCode=${countryCode}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url);
    if (response.ok) return (await response.json()).results || [];
    await sleep(2000 * (attempt + 1));
  }
  throw new Error(`Geocoding failed: ${name} (${countryCode})`);
}

(async function main() {
  const file = path.join(process.cwd(), 'js', 'destinations.json');
  const only = (process.argv[2] || '').toUpperCase().split(',').filter(Boolean);
  const previous = only.length && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const out = {};
  const missing = [];
  for (const [countryCode, entries] of Object.entries(DESTINATIONS)) {
    if (only.length && !only.includes(countryCode)) {
      if (previous[countryCode]) out[countryCode] = previous[countryCode];
      continue;
    }
    out[countryCode] = [];
    for (const entry of entries) {
      const [entryName, hint] = entry.split('@');
      const [name, region] = entryName.split('|');
      // Towns and cities only (no airports, mountains, ...)
      const candidates = (await geocode(name, countryCode, 'en'))
        .filter(result => result.country_code === countryCode && (!region || result.admin1 === region))
        .filter(result => String(result.feature_code || '').startsWith('PPL'));
      let best;
      if (hint) {
        const [lat, lon] = hint.split(',').map(Number);
        best = candidates.sort((a, b) => Math.hypot(a.latitude - lat, a.longitude - lon) - Math.hypot(b.latitude - lat, b.longitude - lon))[0];
      } else {
        // The exact name with the most people (towns before villages of the same name)
        const byPopulation = list => list.sort((a, b) => (b.population || 0) - (a.population || 0));
        best = byPopulation(candidates.filter(result => plain(result.name) === plain(name)))[0] || byPopulation(candidates)[0];
      }
      if (!best) { missing.push(`${countryCode} ${entry}`); continue; }
      const names = { en: best.name };
      for (const language of LANGUAGES.slice(1)) {
        const local = (await geocode(name, countryCode, language)).find(result => result.id === best.id);
        names[language] = local ? local.name : best.name;
        await sleep(60);
      }
      if (BG_NAMES[name]) names.bg = BG_NAMES[name];
      // Drop stress marks (the geocoder writes Kavala with one)
      names.bg = names.bg.normalize('NFD').replace(/[\u0300\u0301]/g, '').normalize('NFC');
      if (plain(best.name) !== plain(name)) console.log(`\n  ${countryCode} ${name} -> ${best.name}`);
      out[countryCode].push({ name: names, latitude: Number(best.latitude.toFixed(4)), longitude: Number(best.longitude.toFixed(4)) });
      await sleep(60);
    }
    process.stdout.write(`${countryCode} `);
  }
  fs.writeFileSync(file, JSON.stringify(out) + '\n');
  console.log(`\nWrote ${file}: ${Object.keys(out).length} countries, ${Object.values(out).flat().length} places.`);
  if (missing.length) console.log('Not found:', missing.join(', '));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
