// Builds .github/scripts/climate.json: monthly climate of every city page
// (average daily high and low, precipitation, days with precipitation) from
// the Open-Meteo historical archive (ERA5 reanalysis), for the years below.
// build-pages.js reads the file; run this only to refresh the data.
// Run from the repository root: node .github/scripts/build-climate.js
//   --europe   the cities of the /europe/ pages instead (europe-data.js), into climate-europe.json,
//              keyed "<country>/<city>"; build-europe.js reads it. About 25 minutes for 168 cities:
//              the free API allows a few of these requests a minute. An interrupted run continues.
const fs = require('fs');
const path = require('path');
const EUROPE = process.argv.includes('--europe');
const CITIES = EUROPE
  ? require('./europe-data.js').flatMap(country => country.cities.map(([slug, , , lat, lon]) => ({ slug: `${country.slug}/${slug}`, lat, lon })))
  : require('./build-pages.js').CITIES;

const FIRST_YEAR = 2015;
const LAST_YEAR = 2024;
const API = 'https://archive-api.open-meteo.com/v1/archive';
const OUT = path.join(__dirname, EUROPE ? 'climate-europe.json' : 'climate.json');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const round1 = n => Math.round(n * 10) / 10;

async function getDaily(city) {
  const url = `${API}?latitude=${city.lat}&longitude=${city.lon}` +
    `&start_date=${FIRST_YEAR}-01-01&end_date=${LAST_YEAR}-12-31` +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=' + (EUROPE ? 'auto' : 'Europe%2FSofia');
  for (let attempt = 0; attempt < 6; attempt++) {
    let response;
    try {
      response = await fetch(url);
    } catch (e) {
      // dropped connection: wait and try again
      await sleep(10000);
      continue;
    }
    if (response.ok) return response.json();
    // 429: the free API allows only a few of these 10-year requests a minute
    await sleep(response.status === 429 ? 65000 : 3000 * (attempt + 1));
  }
  throw new Error(`Archive request failed for ${city.slug}`);
}

function summarize(data) {
  const years = LAST_YEAR - FIRST_YEAR + 1;
  const months = Array.from({ length: 12 }, () => ({ highs: [], lows: [], precip: 0, rainDays: 0 }));
  data.daily.time.forEach((date, i) => {
    const month = months[Number(date.slice(5, 7)) - 1];
    const high = data.daily.temperature_2m_max[i];
    const low = data.daily.temperature_2m_min[i];
    const precip = data.daily.precipitation_sum[i];
    if (high !== null) month.highs.push(high);
    if (low !== null) month.lows.push(low);
    if (precip !== null) {
      month.precip += precip;
      if (precip >= 1) month.rainDays++;
    }
  });
  const mean = list => list.reduce((sum, n) => sum + n, 0) / list.length;
  return {
    elevation: Math.round(data.elevation),
    months: months.map(m => ({
      high: round1(mean(m.highs)),
      low: round1(mean(m.lows)),
      precip: Math.round(m.precip / years),
      rainDays: Math.round(m.rainDays / years)
    }))
  };
}

(async function main() {
  // Keeps the cities already in the file (pass --refresh to fetch all again)
  const previous = !process.argv.includes('--refresh') && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).cities : {};
  const out = { source: 'Open-Meteo historical archive (ERA5)', years: `${FIRST_YEAR}–${LAST_YEAR}`, cities: {} };
  for (const city of CITIES) {
    if (previous[city.slug]) {
      out.cities[city.slug] = previous[city.slug];
      continue;
    }
    out.cities[city.slug] = summarize(await getDaily(city));
    process.stdout.write(`${city.slug} `);
    // save as we go, so an interrupted run can continue
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
    await sleep(8000);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`\nWrote ${OUT}: ${Object.keys(out.cities).length} cities`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
