// The Moon drawn and described, on top of /js/moon.js (load that first). Used by the Moon
// calendar pages in the browser and by .github/scripts/build-luna.js in Node, so the page
// written into the HTML and the live one are the same.
//
//   MoonView.svg(angle, size)      → SVG of the Moon at that elongation (0 new … 180 full … 360),
//                                    as seen from the northern hemisphere (waxing: lit on the right)
//   MoonView.age(date)             → days since the last new moon
//   MoonView.distance(date)        → distance Earth–Moon in km (centre to centre), within about 50 km
//   MoonView.today(lang, now, zone) → HTML of the "Moon today" block (hero, next phases, 14 days)
(function (root) {
  'use strict';

  const Moon = typeof module !== 'undefined' && module.exports ? require('./moon.js') : root.Moon;
  const RAD = Math.PI / 180;
  const norm = degrees => ((degrees % 360) + 360) % 360;
  const DAY = 86400000;

  // ---- drawing ----
  // Dark seas (maria) of the near side, roughly where they are: [x, y, radius] in units of the disc radius
  const MARIA = [[-0.32, -0.38, 0.26], [0.2, -0.42, 0.2], [0.42, -0.1, 0.17], [-0.5, 0.05, 0.2], [-0.12, 0.02, 0.15], [0.12, 0.3, 0.13], [-0.3, 0.42, 0.1]];

  function svg(angle, size, label) {
    const a = norm(angle);
    const r = 48, c = 50;
    const k = Math.cos(a * RAD); // 1 new, 0 quarter, −1 full
    const waxing = a < 180;
    // lit part: half the limb plus the terminator, an ellipse of half-width r·|k|
    const limb = waxing ? 1 : 0;
    const back = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
    const rx = Math.max(0.01, Math.abs(k) * r).toFixed(2);
    const lit = `M${c} ${c - r}A${r} ${r} 0 0 ${limb} ${c} ${c + r}A${rx} ${r} 0 0 ${back} ${c} ${c - r}Z`;
    const seas = MARIA.map(([x, y, s]) => `<circle cx="${(c + x * r).toFixed(1)}" cy="${(c + y * r).toFixed(1)}" r="${(s * r).toFixed(1)}"/>`).join('');
    const title = label ? `<title>${label}</title>` : '';
    return `<svg class="moon-svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img"${label ? ` aria-label="${label}"` : ' aria-hidden="true"'}>${title}` +
      `<circle cx="${c}" cy="${c}" r="${r}" fill="#1a2036"/>` +
      `<path d="${lit}" fill="#f1ecd9"/>` +
      `<g fill="#3d4663" fill-opacity="0.2">${seas}</g>` +
      `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1"/></svg>`;
  }

  // ---- numbers ----
  function age(date) {
    const news = Moon.phaseEvents(new Date(date.getTime() - 31 * DAY), date).filter(event => event.type === 0);
    return (date - news[news.length - 1].time) / DAY;
  }

  // Meeus ch. 47, the largest periodic terms of the distance (table 47.A, Σr in 0.001 km):
  // [D, M, M', F, coefficient]
  const R = [
    [0, 0, 1, 0, -20905355], [2, 0, -1, 0, -3699111], [2, 0, 0, 0, -2955968], [0, 0, 2, 0, -569925], [0, 1, 0, 0, 48888],
    [0, 0, 0, 2, -3149], [2, 0, -2, 0, 246158], [2, -1, -1, 0, -152138], [2, 0, 1, 0, -170733], [2, -1, 0, 0, -204586],
    [0, 1, -1, 0, -129620], [1, 0, 0, 0, 108743], [0, 1, 1, 0, 104755], [2, 0, 0, -2, 10321], [0, 0, 1, -2, 79661],
    [4, 0, -1, 0, -34782], [0, 0, 3, 0, -23210], [4, 0, -2, 0, -21636], [2, 1, -1, 0, 24208], [2, 1, 0, 0, 30824],
    [1, 0, -1, 0, -8379], [1, 1, 0, 0, -16675], [2, -1, 1, 0, -12831]
  ];
  function distance(date) {
    const T = (Moon.jdFromDate(date) - 2451545) / 36525;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    let sum = 0;
    R.forEach(([d, m, mp, f, coefficient]) => {
      const e = Math.abs(m) === 1 ? E : 1;
      sum += coefficient * e * Math.cos((d * D + m * M + mp * Mp + f * F) * RAD);
    });
    return 385000.56 + sum / 1000;
  }

  // ---- the "Moon today" block ----
  const LOCALES = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const T = {
    bg: {
      lit: 'Осветеност', age: 'Възраст', days: 'дни', distance: 'Разстояние', km: 'км', waxing: 'Луната расте', waning: 'Луната намалява',
      cycle: 'Лунен цикъл', next: 'Следващи фази', today: 'днес', tomorrow: 'утре', inDays: n => `след ${n} дни`, at: 'в', clock: t => `${t} ч.`,
      strip: 'Луната през следващите 14 дни'
    },
    en: {
      lit: 'Illumination', age: 'Age', days: 'days', distance: 'Distance', km: 'km', waxing: 'The Moon is waxing', waning: 'The Moon is waning',
      cycle: 'Lunar cycle', next: 'Next phases', today: 'today', tomorrow: 'tomorrow', inDays: n => `in ${n} days`, at: 'at', clock: t => t,
      strip: 'The Moon in the next 14 days'
    },
    de: {
      lit: 'Beleuchtung', age: 'Alter', days: 'Tage', distance: 'Entfernung', km: 'km', waxing: 'Der Mond nimmt zu', waning: 'Der Mond nimmt ab',
      cycle: 'Mondzyklus', next: 'Nächste Phasen', today: 'heute', tomorrow: 'morgen', inDays: n => `in ${n} Tagen`, at: 'um', clock: t => `${t} Uhr`,
      strip: 'Der Mond in den nächsten 14 Tagen'
    },
    it: {
      lit: 'Illuminazione', age: 'Età', days: 'giorni', distance: 'Distanza', km: 'km', waxing: 'La Luna è crescente', waning: 'La Luna è calante',
      cycle: 'Ciclo lunare', next: 'Prossime fasi', today: 'oggi', tomorrow: 'domani', inDays: n => `tra ${n} giorni`, at: 'alle', clock: t => t,
      strip: 'La Luna nei prossimi 14 giorni'
    },
    es: {
      lit: 'Iluminación', age: 'Edad', days: 'días', distance: 'Distancia', km: 'km', waxing: 'La Luna está creciente', waning: 'La Luna está menguante',
      cycle: 'Ciclo lunar', next: 'Próximas fases', today: 'hoy', tomorrow: 'mañana', inDays: n => `en ${n} días`, at: 'a las', clock: t => t,
      strip: 'La Luna en los próximos 14 días'
    }
  };
  const PHASE_ANGLE = [0, 90, 180, 270];
  const PHASE_NAME = [0, 2, 4, 6]; // index of Moon.NAMES for new, first quarter, full, last quarter

  function today(lang, now, zone) {
    const language = T[lang] ? lang : 'en';
    const text = T[language];
    const names = Moon.NAMES[language];
    const locale = LOCALES[language];
    const state = Moon.state(now);
    const format = (date, options) => date.toLocaleDateString(locale, { timeZone: zone, ...options });
    const clock = date => text.clock(date.toLocaleTimeString(locale, { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }));
    // calendar day number in the zone, to count "in N days" by dates, not by 24 hours
    const dayNumber = date => {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('-');
      return Date.UTC(+parts[0], +parts[1] - 1, +parts[2]) / DAY;
    };
    const number = value => Math.round(value).toLocaleString(locale);
    const moonAge = age(now);
    const percent = Math.round(state.fraction * 100);
    const cycle = Math.min(100, (moonAge / 29.530588) * 100);

    const upcoming = Moon.phaseEvents(now, new Date(now.getTime() + 31 * DAY)).filter(event => event.time > now).slice(0, 4);
    const cards = upcoming.map(event => {
      const ahead = dayNumber(event.time) - dayNumber(now);
      const when = ahead === 0 ? text.today : ahead === 1 ? text.tomorrow : text.inDays(ahead);
      return `<div class="moon-next-card">${svg(PHASE_ANGLE[event.type], 44)}` +
        `<strong>${names[PHASE_NAME[event.type]]}</strong>` +
        `<span>${format(event.time, { weekday: 'short', day: 'numeric', month: 'long' })}</span>` +
        `<span>${clock(event.time)}</span><em>${when}</em></div>`;
    }).join('\n        ');

    const strip = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(now.getTime() + i * DAY);
      const day = Moon.state(date);
      return `<div class="moon-strip-day${i === 0 ? ' is-today' : ''}"><span>${format(date, { weekday: 'short' })}</span>` +
        `${svg(day.angle, 34, names[day.index])}<strong>${format(date, { day: 'numeric' })}</strong><em>${Math.round(day.fraction * 100)}%</em></div>`;
    }).join('\n        ');

    return `<div class="moon-hero">
        <div class="moon-hero-disc">${svg(state.angle, 190, names[state.index])}</div>
        <div class="moon-hero-text">
          <h2>${names[state.index]}</h2>
          <p class="moon-hero-sub">${format(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${state.waxing ? text.waxing : text.waning}</p>
          <dl class="moon-stats">
            <div><dt>${text.lit}</dt><dd>${percent}%</dd></div>
            <div><dt>${text.age}</dt><dd>${moonAge.toFixed(1).replace('.', language === 'en' ? '.' : ',')} <small>${text.days}</small></dd></div>
            <div><dt>${text.distance}</dt><dd>${number(Math.round(distance(now) / 100) * 100)} <small>${text.km}</small></dd></div>
          </dl>
          <div class="moon-cycle" role="img" aria-label="${text.cycle}: ${Math.round(cycle)}%">
            <div class="moon-cycle-bar"><i style="width:${cycle.toFixed(1)}%"></i></div>
            <div class="moon-cycle-ends"><span>${names[0]}</span><span>${names[4]}</span><span>${names[0]}</span></div>
          </div>
        </div>
      </div>
      <h3 class="moon-sub">${text.next}</h3>
      <div class="moon-next">
        ${cards}
      </div>
      <h3 class="moon-sub">${text.strip}</h3>
      <div class="moon-strip">
        ${strip}
      </div>`;
  }

  const MoonView = { svg, age, distance, today };
  if (typeof module !== 'undefined' && module.exports) module.exports = MoonView;
  else root.MoonView = MoonView;
})(typeof window !== 'undefined' ? window : this);
