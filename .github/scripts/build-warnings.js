// The official weather warnings of NIMH for Bulgaria (yellow, orange, red code), from the
// MeteoAlarm feed, written to /data/warnings-bg.json by province (bg-provinces.js):
//   { "provinces": { "sofia-city": [ { "level": "yellow", "type": "wind", "event": { "bg": "...", "en": "..." },
//     "onset": "2026-11-13T06:00:00+02:00", "expires": "..." } ], ... } }
// The city pages read it (js/city-forecast.js, data-warn = the province of the city) and show the
// warnings above the forecast. The file is written only when the warnings change, so the
// workflow (.github/workflows/warnings.yml, every 30 minutes) commits only then.
// If the feed does not answer or has an unknown shape, the file is left as it is.
// Run from the repository root: node .github/scripts/build-warnings.js
const fs = require('fs');
const path = require('path');
const { provinceOfArea } = require('./bg-provinces.js');

const FEED = 'https://feeds.meteoalarm.org/api/v1/warnings/feeds-bulgaria';
const FILE = path.resolve(__dirname, '..', '..', 'data', 'warnings-bg.json');
const LEVELS = { 2: 'yellow', 3: 'orange', 4: 'red' };

// "2; yellow; Moderate" -> "yellow"; "1; Wind" -> "wind"
const param = (info, name) => ((info.parameter || []).find(p => (p.valueName || p.valuename) === name) || {}).value || '';
const level = info => {
  const value = param(info, 'awareness_level');
  return LEVELS[parseInt(value, 10)] || (value.match(/yellow|orange|red/i) || [''])[0].toLowerCase() || null;
};
const type = info => (param(info, 'awareness_type').split(';')[1] || '').trim().toLowerCase().replace(/\s+/g, '-') || 'other';

(async function main() {
  const response = await fetch(FEED, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`MeteoAlarm answered ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.warnings)) throw new Error('MeteoAlarm: no "warnings" list in the answer');
  const now = Date.now();
  const provinces = {};
  const unknown = new Set();
  // what came and what was kept, for the log of the workflow
  const seen = { total: data.warnings.length, cancelled: 0, noInfo: 0, noLevel: 0, expired: 0, kept: 0 };
  const levels = new Set();
  for (const warning of data.warnings) {
    const alert = warning.alert || warning;
    if (!alert || /cancel/i.test(alert.msgType || '')) { seen.cancelled++; continue; }
    const infos = Array.isArray(alert.info) ? alert.info : [alert.info].filter(Boolean);
    const bg = infos.find(i => /^bg/i.test(i.language || '')) || infos[0];
    const en = infos.find(i => /^en/i.test(i.language || '')) || null;
    if (!bg) { seen.noInfo++; continue; }
    levels.add(`${param(bg, 'awareness_level') || '?'} / ${param(bg, 'awareness_type') || '?'}`);
    const color = level(bg);
    const expires = bg.expires || (en && en.expires);
    if (!color) { seen.noLevel++; continue; }
    if (!expires || new Date(expires).getTime() <= now) { seen.expired++; continue; }
    seen.kept++;
    const item = {
      level: color,
      type: type(bg),
      event: { bg: bg.event || '', en: (en && en.event) || '' },
      onset: bg.onset || bg.effective || alert.sent,
      expires
    };
    for (const area of bg.area || []) {
      const id = provinceOfArea(area.areaDesc || '');
      if (!id) { unknown.add(area.areaDesc); continue; }
      const list = provinces[id] || (provinces[id] = []);
      if (!list.some(other => JSON.stringify(other) === JSON.stringify(item))) list.push(item);
    }
  }
  Object.values(provinces).forEach(list => list.sort((a, b) => String(a.onset).localeCompare(String(b.onset))));
  console.log(`Feed: ${seen.total} warnings; cancelled ${seen.cancelled}, without text ${seen.noInfo}, green or unknown level ${seen.noLevel}, expired ${seen.expired}, kept ${seen.kept}.`);
  if (levels.size) console.log(`Levels / types in the feed: ${[...levels].slice(0, 20).join('; ')}`);
  if (!data.warnings.length) console.log(`Keys of the answer: ${Object.keys(data).join(', ')}`);
  else console.log(`Keys of a warning: ${Object.keys(data.warnings[0]).join(', ')}; of its alert: ${Object.keys(data.warnings[0].alert || {}).join(', ')}`);
  if (unknown.size) console.warn(`Areas without a province: ${[...unknown].join(', ')}`);
  const json = JSON.stringify({ provinces: Object.fromEntries(Object.keys(provinces).sort().map(id => [id, provinces[id]])) }, null, 1) + '\n';
  const before = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
  if (json === before) {
    console.log('Warnings unchanged.');
  } else {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, json);
    console.log(`Warnings: ${Object.values(provinces).reduce((n, list) => n + list.length, 0)} in ${Object.keys(provinces).length} provinces.`);
  }
})().catch(error => {
  console.error(error.message);
  process.exit(1);
});
