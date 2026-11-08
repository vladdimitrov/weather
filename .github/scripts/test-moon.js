// Checks js/moon.js against the U.S. Naval Observatory phase times (moon-reference.json).
// Run from the repository root: node .github/scripts/test-moon.js
// Fails when any phase is more than 3 minutes off, or when a phase is missing or extra.
const Moon = require('../../js/moon.js');
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

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Moon phases: ${reference.events.length} events (${reference.events[0][0].slice(0, 4)}–${reference.events[reference.events.length - 1][0].slice(0, 4)}) match the USNO within ${TOLERANCE_MINUTES} min (worst ${worst.toFixed(1)} min).`);
