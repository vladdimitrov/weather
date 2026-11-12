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

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Moon phases: ${reference.events.length} events (${reference.events[0][0].slice(0, 4)}–${reference.events[reference.events.length - 1][0].slice(0, 4)}) match the USNO within ${TOLERANCE_MINUTES} min (worst ${worst.toFixed(1)} min).`);
