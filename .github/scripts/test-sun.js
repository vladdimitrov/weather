// Checks sun.js against Open-Meteo sunrise/sunset times (sun-reference.json):
// 4 Bulgarian places, the 15th of every month plus the solstices (all in UTC).
// Run from the repository root: node .github/scripts/test-sun.js
const { sunTimes } = require('./sun.js');
const reference = require('./sun-reference.json');

const TOLERANCE_MINUTES = 2;
const local = date => date.toISOString().slice(11, 16); // UTC
const minutesOf = text => Number(text.slice(0, 2)) * 60 + Number(text.slice(3, 5));

const problems = [];
let worst = 0, count = 0;
Object.entries(reference.cities).forEach(([name, city]) => {
  Object.entries(city.days).forEach(([date, [sunrise, sunset]]) => {
    const [y, m, d] = date.split('-').map(Number);
    const mine = sunTimes(y, m - 1, d, city.lat, city.lon);
    [['sunrise', sunrise], ['sunset', sunset]].forEach(([key, expected]) => {
      const diff = Math.abs(minutesOf(local(mine[key])) - minutesOf(expected));
      worst = Math.max(worst, diff); count++;
      if (diff > TOLERANCE_MINUTES) problems.push(`${name} ${date} ${key}: ${local(mine[key])}, Open-Meteo ${expected}`);
    });
  });
});
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`Sunrise/sunset: ${count} times match Open-Meteo within ${TOLERANCE_MINUTES} min (worst ${worst} min).`);
