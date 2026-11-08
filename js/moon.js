// Phases of the Moon, computed locally (no API).
// Algorithm: Jean Meeus, "Astronomical Algorithms", 2nd ed.
//   chapter 49: dates of new moon, first quarter, full moon, last quarter
//   chapter 48: phase angle and illuminated fraction (low-accuracy formula)
// Used by the browser (/luna/, city pages) and by Node (.github/scripts/build-luna.js,
// test-moon.js), so the static pages and the live widgets always agree.
//
//   Moon.phaseEvents(from, to)  → [{ type, time }] between two Dates, type 0 new, 1 first quarter, 2 full, 3 last quarter
//   Moon.nextPhase(date, type)  → Date of the next phase of that type
//   Moon.state(date)            → { fraction (0..1 lit), waxing, angle (elongation °), index (0..7) }
//
// Phase times are accurate to about a minute; the illuminated fraction to about 0.5 %.
(function (root) {
  'use strict';

  const RAD = Math.PI / 180;
  const sin = degrees => Math.sin(degrees * RAD);
  const cos = degrees => Math.cos(degrees * RAD);
  const norm = degrees => ((degrees % 360) + 360) % 360;

  const jdFromDate = date => date.getTime() / 86400000 + 2440587.5;
  const dateFromJd = jd => new Date((jd - 2440587.5) * 86400000);

  // ΔT = TT − UT in seconds, polynomial of Espenak & Meeus for 2005–2050
  function deltaT(year) {
    const t = year - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }

  // Meeus ch. 49: time (JDE, dynamical time) of the phase with number k
  // (k is an integer for a new moon, +0.25 first quarter, +0.5 full moon, +0.75 last quarter)
  function phaseJde(k) {
    const type = Math.round((k - Math.floor(k)) * 4);
    const T = k / 1236.85;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    const M = norm(2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3);
    const Mp = norm(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
    const F = norm(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
    const O = norm(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);

    let c;
    if (type === 0) {
      c = -0.4072 * sin(Mp) + 0.17241 * E * sin(M) + 0.01608 * sin(2 * Mp) + 0.01039 * sin(2 * F)
        + 0.00739 * E * sin(Mp - M) - 0.00514 * E * sin(Mp + M) + 0.00208 * E * E * sin(2 * M)
        - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F) + 0.00056 * E * sin(2 * Mp + M)
        - 0.00042 * sin(3 * Mp) + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F)
        - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(O) - 0.00007 * sin(Mp + 2 * M)
        + 0.00004 * sin(2 * Mp - 2 * F) + 0.00004 * sin(3 * M) + 0.00003 * sin(Mp + M - 2 * F)
        + 0.00003 * sin(2 * Mp + 2 * F) - 0.00003 * sin(Mp + M + 2 * F) + 0.00003 * sin(Mp - M + 2 * F)
        - 0.00002 * sin(Mp - M - 2 * F) - 0.00002 * sin(3 * Mp + M) + 0.00002 * sin(4 * Mp);
    } else if (type === 2) {
      c = -0.40614 * sin(Mp) + 0.17302 * E * sin(M) + 0.01614 * sin(2 * Mp) + 0.01043 * sin(2 * F)
        + 0.00734 * E * sin(Mp - M) - 0.00515 * E * sin(Mp + M) + 0.00209 * E * E * sin(2 * M)
        - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F) + 0.00056 * E * sin(2 * Mp + M)
        - 0.00042 * sin(3 * Mp) + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F)
        - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(O) - 0.00007 * sin(Mp + 2 * M)
        + 0.00004 * sin(2 * Mp - 2 * F) + 0.00004 * sin(3 * M) + 0.00003 * sin(Mp + M - 2 * F)
        + 0.00003 * sin(2 * Mp + 2 * F) - 0.00003 * sin(Mp + M + 2 * F) + 0.00003 * sin(Mp - M + 2 * F)
        - 0.00002 * sin(Mp - M - 2 * F) - 0.00002 * sin(3 * Mp + M) + 0.00002 * sin(4 * Mp);
    } else {
      c = -0.62801 * sin(Mp) + 0.17172 * E * sin(M) - 0.01183 * E * sin(Mp + M) + 0.00862 * sin(2 * Mp)
        + 0.00804 * sin(2 * F) + 0.00454 * E * sin(Mp - M) + 0.00204 * E * E * sin(2 * M)
        - 0.0018 * sin(Mp - 2 * F) - 0.0007 * sin(Mp + 2 * F) - 0.0004 * sin(3 * Mp)
        - 0.00034 * E * sin(2 * Mp - M) + 0.00032 * E * sin(M + 2 * F) + 0.00032 * E * sin(M - 2 * F)
        - 0.00028 * E * E * sin(Mp + 2 * M) + 0.00027 * E * sin(2 * Mp + M) - 0.00017 * sin(O)
        - 0.00005 * sin(Mp - M - 2 * F) + 0.00004 * sin(2 * Mp + 2 * F) - 0.00004 * sin(Mp + M + 2 * F)
        + 0.00004 * sin(Mp - 2 * M) + 0.00003 * sin(Mp + M - 2 * F) + 0.00003 * sin(3 * M)
        + 0.00002 * sin(2 * Mp - 2 * F) + 0.00002 * sin(Mp - M + 2 * F) - 0.00002 * sin(3 * Mp + M);
      const W = 0.00306 - 0.00038 * E * cos(M) + 0.00026 * cos(Mp) - 0.00002 * cos(Mp - M)
        + 0.00002 * cos(Mp + M) + 0.00002 * cos(2 * F);
      c += type === 1 ? W : -W;
    }
    jde += c;

    // Planetary arguments
    const A = [
      [299.77 + 0.107408 * k - 0.009173 * T2, 0.000325],
      [251.88 + 0.016321 * k, 0.000165],
      [251.83 + 26.651886 * k, 0.000164],
      [349.42 + 36.412478 * k, 0.000126],
      [84.66 + 18.206239 * k, 0.00011],
      [141.74 + 53.303771 * k, 0.000062],
      [207.14 + 2.453732 * k, 0.00006],
      [154.84 + 7.30686 * k, 0.000056],
      [34.52 + 27.261239 * k, 0.000047],
      [207.19 + 0.121824 * k, 0.000042],
      [291.34 + 1.844379 * k, 0.00004],
      [161.72 + 24.198154 * k, 0.000037],
      [239.56 + 25.513099 * k, 0.000035],
      [331.55 + 3.592518 * k, 0.000023]
    ];
    A.forEach(([angle, amplitude]) => { jde += amplitude * sin(angle); });
    return { type, jde };
  }

  // Phases between two dates, in time order
  function phaseEvents(from, to) {
    const year = from.getUTCFullYear() + from.getUTCMonth() / 12;
    let k = Math.floor((year - 2000) * 12.3685 * 4) / 4 - 1;
    const events = [];
    for (; ; k += 0.25) {
      const { type, jde } = phaseJde(k);
      const jd = jde - deltaT(2000 + (k / 12.3685)) / 86400;
      const time = dateFromJd(jd);
      if (time > to) break;
      if (time >= from) events.push({ type, time });
    }
    return events;
  }

  function nextPhase(date, type) {
    const events = phaseEvents(date, new Date(date.getTime() + 40 * 86400000));
    return events.find(event => event.type === type && event.time > date).time;
  }

  // Meeus ch. 48 (low accuracy): phase angle i of the Moon, illuminated fraction k = (1 + cos i) / 2
  function state(date) {
    const T = (jdFromDate(date) - 2451545) / 36525;
    const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868);
    const M = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
    const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699);
    const i = 180 - D - 6.289 * sin(Mp) + 2.1 * sin(M) - 1.274 * sin(2 * D - Mp)
      - 0.658 * sin(2 * D) - 0.214 * sin(2 * Mp) - 0.11 * sin(D);
    const angle = norm(180 - i); // elongation of the Moon from the Sun, 0 new … 180 full
    const fraction = (1 + cos(i)) / 2;
    // 8 names: new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent
    const index = Math.floor(((angle + 22.5) % 360) / 45);
    return { fraction, waxing: angle < 180, angle, index };
  }

  const Moon = { phaseEvents, nextPhase, state, phaseJde, jdFromDate, dateFromJd };
  if (typeof module !== 'undefined' && module.exports) module.exports = Moon;
  else root.Moon = Moon;
})(typeof window !== 'undefined' ? window : this);
