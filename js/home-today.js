// Home page, "all sections" tiles: a live line under some of them, computed in the browser.
//   [data-today="moon"]     phase and illumination of the Moon (js/moon.js, no network)
//   [data-today="kp"]       the latest Kp index (NOAA)
//   [data-today="tomorrow"] tomorrow's high and low in Sofia (Open-Meteo), Bulgarian page only
//   [data-today="uv"]       today's highest UV index in Sofia (Open-Meteo), Bulgarian page only
// A failed request leaves the line empty; the tile is a plain link either way.
(function () {
  const lang = document.documentElement.lang || 'bg';
  const set = (name, text) => { const node = document.querySelector(`[data-today="${name}"]`); if (node && text) node.textContent = text; };
  const deg = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(Math.round(value))}°`;

  if (typeof Moon !== 'undefined') {
    const state = Moon.state(new Date());
    const names = Moon.NAMES[lang] || Moon.NAMES.en;
    set('moon', `${names[state.index]} · ${Math.round(state.fraction * 100)}%`);
  }

  const KP = { bg: 'Kp сега', en: 'Kp now', de: 'Kp aktuell', it: 'Kp ora', es: 'Kp ahora', fr: 'Kp actuel', nl: 'Kp nu' };
  const level = kp => (kp >= 5 ? { bg: 'буря', en: 'storm', de: 'Sturm', it: 'tempesta', es: 'tormenta', fr: 'tempête', nl: 'storm' }
    : { bg: 'спокойно', en: 'calm', de: 'ruhig', it: 'calmo', es: 'calma', fr: 'calme', nl: 'rustig' })[lang] || '';
  // the same NOAA file the storm page and the widget read: the latest measured (not predicted) 3-hour value
  fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(list => {
      const measured = list.filter(entry => entry.observed !== 'predicted' && !isNaN(parseFloat(entry.kp)));
      const last = measured[measured.length - 1];
      if (last) {
        const kp = parseFloat(last.kp);
        set('kp', `${KP[lang] || KP.en} ${kp.toFixed(1).replace('.', lang === 'en' ? '.' : ',')} · ${level(kp)}`);
      }
    })
    .catch(() => { /* leave empty */ });

  if (lang === 'bg') {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.6977&longitude=23.3219&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Europe%2FSofia&forecast_days=2')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        const d = data.daily;
        set('tomorrow', `София ${deg(d.temperature_2m_min[1])} / ${deg(d.temperature_2m_max[1])}`);
        set('uv', `София днес: ${String(Math.round(d.uv_index_max[0] * 10) / 10).replace('.', ',')}`);
      })
      .catch(() => { /* leave empty */ });
  }
})();
