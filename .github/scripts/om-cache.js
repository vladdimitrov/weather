// A day's cache of the Open-Meteo answers for the workflow "Daily forecast in the city pages".
//
// The free Open-Meteo API allows fewer than 10 000 calls a day (a call with many places, variables,
// models or days counts as several). The workflow runs every morning and again each time the city
// pages change on main: on busy days 10 or more runs asked for the same forecast. Now only the first
// run of the day (UTC) asks Open-Meteo; the others of the same day take its answers from the cache.
//
// The workflow keeps the folder OM_CACHE_DIR between runs (actions/cache, key with the date).
// OM_CACHE_FRESH=1 (the scheduled morning run) asks Open-Meteo again and refreshes the cache.
// Without OM_CACHE_DIR (a run by hand on a computer) nothing is cached.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = process.env.OM_CACHE_DIR || '';
const FRESH = process.env.OM_CACHE_FRESH === '1';
const today = () => new Date().toISOString().slice(0, 10);
const fileOf = url => path.join(DIR, crypto.createHash('sha1').update(url).digest('hex') + '.json');
let hits = 0;
let misses = 0;

// The answer (parsed JSON) of a URL: from today's cache, else from load() (which asks Open-Meteo)
async function json(url, load) {
  if (DIR && !FRESH) {
    try {
      const saved = JSON.parse(fs.readFileSync(fileOf(url), 'utf8'));
      if (saved.day === today()) { hits++; return saved.json; }
    } catch (e) { /* not cached yet */ }
  }
  const answer = await load();
  misses++;
  if (DIR) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(fileOf(url), JSON.stringify({ day: today(), json: answer }));
  }
  return answer;
}

const report = name => { if (DIR) console.log(`${name}: ${misses} Open-Meteo request(s), ${hits} from today's cache${FRESH ? ' (fresh run)' : ''}.`); };

module.exports = { json, report };
