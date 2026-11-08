// Sunrise, sunset and day length for a place and a date, computed locally
// (NOAA solar calculator equations, Meeus "Astronomical Algorithms" ch. 25;
// the Sun's centre 0.833° below the horizon: refraction + the Sun's radius).
// Accurate to about a minute between latitudes ±65°. Used by build-pages.js for the
// monthly sunrise tables on the city pages; test-sun.js checks it against Open-Meteo.
//   sunTimes(year, month0, day, lat, lon) → { sunrise: Date, sunset: Date } (UTC instants)
const RAD = Math.PI / 180;
const sin = d => Math.sin(d * RAD);
const cos = d => Math.cos(d * RAD);

function solar(jc) {
  const L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const C = sin(M) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + sin(2 * M) * (0.019993 - 0.000101 * jc) + sin(3 * M) * 0.000289;
  const lambda = L0 + C - 0.00569 - 0.00478 * sin(125.04 - 1934.136 * jc);
  const epsilon = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60 + 0.00256 * cos(125.04 - 1934.136 * jc);
  const declination = Math.asin(sin(epsilon) * sin(lambda)) / RAD;
  const y = Math.tan(epsilon * RAD / 2) ** 2;
  const equation = 4 * (y * sin(2 * L0) - 2 * e * sin(M) + 4 * e * y * sin(M) * cos(2 * L0) - 0.5 * y * y * sin(4 * L0) - 1.25 * e * e * sin(2 * M)) / RAD;
  return { declination, equation };
}

function sunTimes(year, month, day, lat, lon) {
  const midnight = Date.UTC(year, month, day) / 86400000 + 2440587.5; // JD at 00:00 UT
  let minutes = { sunrise: 360 - 4 * lon, sunset: 1080 - 4 * lon }; // first guess, UT minutes
  const result = {};
  ['sunrise', 'sunset'].forEach(which => {
    let guess = minutes[which];
    for (let i = 0; i < 3; i++) {
      const jc = (midnight + guess / 1440 - 2451545) / 36525;
      const { declination, equation } = solar(jc);
      const cosH = (cos(90.833) / (cos(lat) * cos(declination))) - Math.tan(lat * RAD) * Math.tan(declination * RAD);
      if (cosH > 1 || cosH < -1) return; // polar night or midnight sun
      const hourAngle = Math.acos(cosH) / RAD;
      guess = 720 - 4 * (lon + (which === 'sunrise' ? hourAngle : -hourAngle)) - equation;
    }
    result[which] = new Date(Date.UTC(year, month, day) + guess * 60000);
  });
  return result;
}

module.exports = { sunTimes };
