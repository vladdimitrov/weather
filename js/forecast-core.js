// One forecast from three weather models instead of one blended guess.
// ForecastCore.load(url) asks Open-Meteo for the same data from ECMWF (IFS, 9 km), ICON
// (DWD: 2 km over Central Europe, 6.5 km over Europe) and GFS (NOAA), and gives back the
// usual Open-Meteo answer where every number is the MEDIAN of the models (gusts: the MAXIMUM). The median is
// not pulled by one model that is off, and the day's weather symbol is the one most models
// agree on. The height correction of the temperature (about 0.65 degrees per 100 m) is made
// by Open-Meteo for the height of the place, which comes back as "elevation".
// Also in the answer:
//   data.models    the models that had data
//   data.spread    per number of daily/hourly: { min: [...], max: [...] } over the models
// 15 minute data and anything the models cannot answer is loaded as before.
(function () {
  const MODELS = ['ecmwf_ifs', 'icon_seamless', 'gfs_seamless'];
  // when the models are split on the weather symbol, the one with the finer grid wins
  const PRIORITY = ['icon_seamless', 'ecmwf_ifs', 'gfs_seamless'];

  const group = code => {
    if (code === null || code === undefined) return null;
    if (code <= 0) return 0;
    if (code <= 2) return 1;
    if (code === 3) return 3;
    if (code === 45 || code === 48) return 45;
    if (code >= 51 && code <= 57) return 51;
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 61;
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 71;
    if (code >= 95) return 95;
    return code;
  };

  function median(values) {
    const sorted = values.filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = sorted.length >> 1;
    const value = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    return Math.round(value * 100) / 100;
  }

  // values: one entry per model, in MODELS order (null when the model has nothing)
  function consensusCode(values) {
    const votes = new Map();
    values.forEach((code, index) => {
      const g = group(code);
      if (g === null) return;
      const entry = votes.get(g) || { count: 0, best: 99 };
      entry.count++;
      entry.best = Math.min(entry.best, PRIORITY.indexOf(MODELS[index]));
      votes.set(g, entry);
    });
    if (!votes.size) return null;
    const winner = [...votes.entries()].sort((a, b) => b[1].count - a[1].count || a[1].best - b[1].best)[0][0];
    // the code itself: from the highest-priority model inside the winning group
    const order = PRIORITY.map(name => MODELS.indexOf(name));
    for (const index of order) if (group(values[index]) === winner) return values[index];
    return null;
  }

  function pick(base, values) {
    if (/^(weather_?code)/.test(base)) return consensusCode(values);
    if (/^(sunrise|sunset)/.test(base)) return values.find(v => v) || null;
    // gusts: the strongest model. A median hides the one model that sees a local storm
    // (downslope wind under Vitosha, a front): for a warning, missing it is worse than a false alarm
    if (/^wind_gusts/.test(base)) {
      const list = values.filter(v => typeof v === 'number' && !isNaN(v));
      return list.length ? Math.max(...list) : null;
    }
    return median(values);
  }

  // { temperature_2m_ecmwf_ifs: [...], ... } -> { temperature_2m: [...], ... }
  function collapseSeries(source, spread, spreadKey) {
    const bases = new Set();
    Object.keys(source).forEach(key => MODELS.forEach(model => {
      if (key.endsWith('_' + model)) bases.add(key.slice(0, -(model.length + 1)));
    }));
    const out = {};
    if (source.time) out.time = source.time;
    bases.forEach(base => {
      const series = MODELS.map(model => source[base + '_' + model] || null);
      const length = (source.time || series.find(Boolean) || []).length;
      out[base] = Array.from({ length }, (_, i) => pick(base, series.map(s => (s ? s[i] : null))));
      if (spread && /^(temperature|precipitation_sum|wind)/.test(base)) {
        spread[base] = { min: [], max: [] };
        for (let i = 0; i < length; i++) {
          const values = series.map(s => (s ? s[i] : null)).filter(v => typeof v === 'number');
          spread[base].min.push(values.length ? Math.min(...values) : null);
          spread[base].max.push(values.length ? Math.max(...values) : null);
        }
      }
    });
    return out;
  }

  function collapseCurrent(source) {
    const bases = new Set();
    Object.keys(source).forEach(key => MODELS.forEach(model => {
      if (key.endsWith('_' + model)) bases.add(key.slice(0, -(model.length + 1)));
    }));
    const out = {};
    if (source.time) out.time = source.time;
    if (source.interval) out.interval = source.interval;
    bases.forEach(base => {
      out[base] = pick(base, MODELS.map(model => (source[base + '_' + model] !== undefined ? source[base + '_' + model] : null)));
    });
    return out;
  }

  function collapseUnits(units) {
    const out = {};
    Object.keys(units).forEach(key => {
      const model = MODELS.find(name => key.endsWith('_' + name));
      const base = model ? key.slice(0, -(model.length + 1)) : key;
      if (!(base in out)) out[base] = units[key];
    });
    return out;
  }

  function collapse(json) {
    const data = Object.assign({}, json);
    const spread = {};
    ['daily', 'hourly'].forEach(section => {
      if (json[section]) {
        spread[section] = {};
        data[section] = collapseSeries(json[section], spread[section]);
        if (json[section + '_units']) data[section + '_units'] = collapseUnits(json[section + '_units']);
      }
    });
    // "current" is answered once by Open-Meteo (it is not split by model): kept as it is
    if (json.current && Object.keys(json.current).some(key => MODELS.some(model => key.endsWith('_' + model)))) {
      data.current = collapseCurrent(json.current);
      if (json.current_units) data.current_units = collapseUnits(json.current_units);
    }
    data.spread = spread;
    data.models = MODELS.filter(model => ['daily', 'hourly'].some(section => json[section] &&
      Object.keys(json[section]).some(key => key.endsWith('_' + model) && json[section][key].some(v => v !== null))));
    return data;
  }

  async function plain(url) {
    const response = await fetch(url);
    return response.json();
  }

  async function load(url) {
    if (/minutely_15|[?&]models=/.test(url)) return plain(url);
    try {
      const response = await fetch(url + '&models=' + MODELS.join(','));
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const json = await response.json();
      if (json.error) throw new Error(json.reason || 'API error');
      const data = collapse(json);
      if (data.models.length < 1) throw new Error('no model had data');
      window.ForecastCore.last = { models: data.models, elevation: data.elevation };
      return data;
    } catch (error) {
      console.warn('ForecastCore: using the default forecast instead:', error.message);
      return plain(url);
    }
  }

  const noteTexts = {
    en: 'Median of ECMWF, ICON and GFS models · elevation {m} m',
    bg: 'Медиана на моделите ECMWF, ICON и GFS · надм. височина {m} м',
    de: 'Median der Modelle ECMWF, ICON und GFS · Höhe {m} m',
    it: 'Mediana dei modelli ECMWF, ICON e GFS · altitudine {m} m',
    es: 'Mediana de los modelos ECMWF, ICON y GFS · altitud {m} m'
  };

  // the line under the forecast: how it is made and for what height
  function note(given) {
    const info = given || window.ForecastCore.last;
    if (!info || !info.models || !info.models.length) return '';
    const text = (window.pickText ? window.pickText(noteTexts) : noteTexts[document.documentElement.lang] || noteTexts.en);
    const full = info.models.length >= 3;
    const line = text.replace('{m}', Math.round(info.elevation || 0));
    return full ? line : line.replace(/^[^·]*·\s*/, '');
  }

  window.ForecastCore = { MODELS, load, note, median, consensusCode, collapse, last: null };
})();
