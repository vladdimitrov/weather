// Checks js/moon.js against the U.S. Naval Observatory phase times (moon-reference.json).
// Run from the repository root: node .github/scripts/test-moon.js
// Fails when any phase is more than 3 minutes off, or when a phase is missing or extra. Also checks
// the Earth-Moon distance of js/moon-view.js against known perigees and apogees.
const Moon = require('../../js/moon.js');
const MoonView = require('../../js/moon-view.js');
const reference = require('./moon-reference.json');

const TOLERANCE_MINUTES = 3;
const first = new Date(reference.events[0][0]);
const last = new Date(reference.events[reference.events.length - 1][0]);
const computed = Moon.phaseEvents(new Date(first.getTime() - 3600000), new Date(last.getTime() + 3600000));

const problems = [];
let worst = 0;
if (computed.length !== reference.events.length) problems.push(`${computed.length} phases computed, ${reference.events.length} in the reference`);
reference.events.forEach(([iso, type], i) => {
  const mine = computed[i];
  if (!mine || mine.type !== type) { problems.push(`${iso}: expected type ${type}, got ${mine && mine.type}`); return; }
  const minutes = Math.abs(mine.time - new Date(iso)) / 60000;
  worst = Math.max(worst, minutes);
  if (minutes > TOLERANCE_MINUTES) problems.push(`${iso} type ${type}: off by ${minutes.toFixed(1)} min (${mine.time.toISOString()})`);
});

// Illuminated fraction: ~0 at new moon, ~1 at full moon, ~0.5 at the quarters
const lit = [0, 0.5, 1, 0.5];
computed.slice(0, 40).forEach(({ type, time }) => {
  const fraction = Moon.state(time).fraction;
  if (Math.abs(fraction - lit[type]) > 0.02) problems.push(`${time.toISOString()}: illumination ${fraction.toFixed(3)} at type ${type}`);
});

// Distance to the Moon (km, centre to centre): perigees and apogees from published tables, within 80 km
[['2023-08-30T15:54:00Z', 357181], ['2024-03-10T07:04:00Z', 356895], ['2024-03-23T15:45:00Z', 406294], ['2024-10-17T00:51:00Z', 357172],
  ['2025-04-27T16:15:00Z', 357118], ['2025-11-05T22:16:00Z', 356833], ['2024-06-02T07:16:00Z', 368102]].forEach(([iso, km]) => {
  const mine = MoonView.distance(new Date(iso));
  if (Math.abs(mine - km) > 80) problems.push(`${iso}: distance ${Math.round(mine)} km, expected about ${km} km`);
});

// Position of the Moon: at every phase of the reference the Moon-Sun elongation is 0/90/180/270°
// (within 0.1°); the largest declination of 2025 is the known ~28.7° (lunar standstill)
const sunLongitude = date => {
  const T = (Moon.jdFromDate(date) - 2451545) / 36525;
  const M = (357.52911 + 35999.05029 * T) * Math.PI / 180;
  const L = 280.46646 + 36000.76983 * T + 1.914602 * Math.sin(M) + 0.019993 * Math.sin(2 * M) - 0.00569;
  return ((L % 360) + 360) % 360;
};
reference.events.slice(0, 60).forEach(([iso, type]) => {
  const date = new Date(iso);
  const elongation = (((Moon.position(date).lambda - sunLongitude(date)) % 360) + 360) % 360;
  const error = Math.abs(((elongation - type * 90 + 540) % 360) - 180);
  if (error > 0.1) problems.push(`${iso}: Moon-Sun elongation off by ${error.toFixed(3)}°`);
});
let maxDeclination = 0;
for (let t = Date.UTC(2025, 0, 1); t < Date.UTC(2026, 0, 1); t += 3600000) maxDeclination = Math.max(maxDeclination, Math.abs(Moon.position(new Date(t)).dec));
if (Math.abs(maxDeclination - 28.72) > 0.1) problems.push(`largest declination of 2025 is ${maxDeclination.toFixed(2)}°, expected about 28.7°`);

// Moonrise / moonset (Sofia): a full moon rises around sunset and sets around sunrise, a new moon the other way round
const { sunTimes } = require('./sun.js');
computed.filter(event => event.type === 0 || event.type === 2).slice(0, 24).forEach(({ type, time }) => {
  const day = new Date(Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate()));
  const sun = sunTimes(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 42.6977, 23.3219);
  const moon = Moon.riseSet(new Date(day.getTime() - 3 * 3600000), 42.6977, 23.3219);
  const near = (a, b) => a && Math.abs(a - b) < 100 * 60000;
  if (type === 2 && !(near(moon.rise, sun.sunset) || near(moon.set, sun.sunrise))) problems.push(`${time.toISOString()}: full moon rise/set far from sunset/sunrise`);
  if (type === 0 && !(near(moon.rise, sun.sunrise) || near(moon.set, sun.sunset))) problems.push(`${time.toISOString()}: new moon rise/set far from sunrise/sunset`);
});

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Moon phases: ${reference.events.length} events (${reference.events[0][0].slice(0, 4)}–${reference.events[reference.events.length - 1][0].slice(0, 4)}) match the USNO within ${TOLERANCE_MINUTES} min (worst ${worst.toFixed(1)} min).`);
