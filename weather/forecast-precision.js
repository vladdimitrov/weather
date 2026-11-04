// How certain is the forecast? Added to the daily forecast table after it loads:
//   - temperature range from the ensemble (ICON, 40 runs with slightly
//     different starting conditions): 80% of the runs fall in the range
//   - reliability per day from how much those runs disagree; days after the
//     7th are marked as a rough guide
//   - comparison of three models (ECMWF, ICON, GFS) under the table
// Texts in 5 languages via pickText() (/js/language-selector.js).
window.ForecastPrecision = (function () {
  const ENSEMBLE_URL = 'https://ensemble-api.open-meteo.com/v1/ensemble';
  const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
  const MODELS = [
    { id: 'ecmwf_ifs025', name: 'ECMWF', origin: { en: 'Europe', bg: 'Европа', de: 'Europa', it: 'Europa', es: 'Europa' } },
    { id: 'icon_seamless', name: 'ICON', origin: { en: 'Germany', bg: 'Германия', de: 'Deutschland', it: 'Germania', es: 'Alemania' } },
    { id: 'gfs_seamless', name: 'GFS', origin: { en: 'USA', bg: 'САЩ', de: 'USA', it: 'USA', es: 'EE. UU.' } }
  ];

  const T = {
    high: { en: 'Reliable', bg: 'Надеждна', de: 'Zuverlässig', it: 'Affidabile', es: 'Fiable' },
    medium: { en: 'Fairly reliable', bg: 'Средно надеждна', de: 'Mittel zuverlässig', it: 'Abbastanza affidabile', es: 'Bastante fiable' },
    low: { en: 'Uncertain', bg: 'Несигурна', de: 'Unsicher', it: 'Incerta', es: 'Incierta' },
    rough: { en: 'Rough guide', bg: 'Ориентировъчна', de: 'Grobe Orientierung', it: 'Indicativa', es: 'Orientativa' },
    reliabilityTitle: {
      en: 'Based on how much {n} runs of the forecast model disagree',
      bg: 'Според разликата между {n} изчисления на модела',
      de: 'Nach der Abweichung zwischen {n} Modellläufen',
      it: 'In base alla differenza tra {n} simulazioni del modello',
      es: 'Según la diferencia entre {n} simulaciones del modelo'
    },
    roughTitle: {
      en: 'Forecasts more than a week ahead are only a rough guide',
      bg: 'Прогнозите за повече от седмица напред са само ориентировъчни',
      de: 'Vorhersagen für mehr als eine Woche sind nur eine grobe Orientierung',
      it: 'Le previsioni oltre una settimana sono solo indicative',
      es: 'Los pronósticos a más de una semana son solo orientativos'
    },
    rangeTitle: {
      en: '80% of the forecast runs are in this range',
      bg: '80% от изчисленията на модела са в този диапазон',
      de: '80 % der Modellläufe liegen in diesem Bereich',
      it: "L'80% delle simulazioni è in questo intervallo",
      es: 'El 80% de las simulaciones está en este rango'
    },
    modelsTitle: { en: 'Compare weather models', bg: 'Сравнение на метеорологичните модели', de: 'Wettermodelle vergleichen', it: 'Confronto dei modelli meteo', es: 'Comparar modelos meteorológicos' },
    modelsNote: {
      en: 'Highest temperature / precipitation. When the models agree, the forecast is more certain.',
      bg: 'Най-висока температура / валежи. Когато моделите са съгласни, прогнозата е по-сигурна.',
      de: 'Höchsttemperatur / Niederschlag. Wenn die Modelle übereinstimmen, ist die Vorhersage sicherer.',
      it: 'Temperatura massima / precipitazioni. Quando i modelli concordano, la previsione è più sicura.',
      es: 'Temperatura máxima / precipitación. Cuando los modelos coinciden, el pronóstico es más seguro.'
    },
    day: { en: 'Day', bg: 'Ден', de: 'Tag', it: 'Giorno', es: 'Día' }
  };

  const locales = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  let state = null; // { dates, ensemble: { [date]: info }, models: { [date]: { [model]: { max, rain } } } }
  let requestId = 0;

  function percentile(sorted, p) {
    const index = (sorted.length - 1) * p;
    const low = Math.floor(index), high = Math.ceil(index);
    return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
  }

  // Per day: 10th-90th percentile of the members' min and max temperature
  function summarizeEnsemble(daily) {
    const result = {};
    const memberKeys = prefix => Object.keys(daily).filter(key => key.startsWith(prefix + '_member'));
    const maxKeys = memberKeys('temperature_2m_max');
    const minKeys = memberKeys('temperature_2m_min');
    daily.time.forEach((date, i) => {
      const values = keys => keys.map(key => daily[key][i]).filter(v => typeof v === 'number').sort((a, b) => a - b);
      const max = values(maxKeys);
      const min = values(minKeys);
      if (max.length < 10 || min.length < 10) return;
      result[date] = {
        runs: max.length,
        max: [percentile(max, 0.1), percentile(max, 0.9)],
        min: [percentile(min, 0.1), percentile(min, 0.9)]
      };
    });
    return result;
  }

  function summarizeModels(daily) {
    const result = {};
    daily.time.forEach((date, i) => {
      result[date] = {};
      MODELS.forEach(model => {
        const max = daily[`temperature_2m_max_${model.id}`];
        const rain = daily[`precipitation_sum_${model.id}`];
        result[date][model.id] = { max: max ? max[i] : null, rain: rain ? rain[i] : null };
      });
    });
    return result;
  }

  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Called by weather-fixed.js after the forecast table is drawn
  async function enhance(latitude, longitude, dates) {
    if (!dates || !dates.length) return;
    const id = ++requestId;
    const range = `latitude=${latitude}&longitude=${longitude}&timezone=auto&start_date=${dates[0]}&end_date=${dates[dates.length - 1]}`;
    const [ensemble, models] = await Promise.allSettled([
      getJson(`${ENSEMBLE_URL}?${range}&models=icon_seamless&daily=temperature_2m_max,temperature_2m_min`),
      getJson(`${FORECAST_URL}?${range}&models=${MODELS.map(m => m.id).join(',')}&daily=temperature_2m_max,precipitation_sum`)
    ]);
    if (id !== requestId) return; // a newer forecast was loaded meanwhile
    state = {
      dates,
      ensemble: ensemble.status === 'fulfilled' && ensemble.value.daily ? summarizeEnsemble(ensemble.value.daily) : {},
      models: models.status === 'fulfilled' && models.value.daily ? summarizeModels(models.value.daily) : null
    };
    if (ensemble.status === 'rejected') console.error('Error loading ensemble forecast:', ensemble.reason);
    if (models.status === 'rejected') console.error('Error loading model comparison:', models.reason);
    render();
  }

  function element(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function rangeText([low, high]) {
    return `${Math.round(low)}…${Math.round(high)}°`;
  }

  function render() {
    if (!state) return;
    const rows = document.querySelectorAll('#weatherTable tbody tr');
    document.querySelectorAll('#weatherTable .precision-added').forEach(el => el.remove());

    rows.forEach((row, index) => {
      const date = state.dates[index];
      const cells = row.children;
      if (!date || cells.length < 4) return;
      const info = state.ensemble[date];

      let level = null;
      if (index >= 7) level = 'rough';
      else if (info) {
        const spread = info.max[1] - info.max[0];
        level = spread <= 2 ? 'high' : spread <= 4 ? 'medium' : 'low';
      }
      if (level) {
        const dots = { high: '●●●', medium: '●●○', low: '●○○', rough: '○○○' }[level];
        const badge = element('div', `reliability rel-${level} precision-added`, `${dots} ${pickText(T[level])}`);
        badge.title = level === 'rough' ? pickText(T.roughTitle) : pickText(T.reliabilityTitle).replace('{n}', info.runs);
        cells[0].appendChild(badge);
      }
      if (info) {
        const min = element('div', 'temp-range precision-added', rangeText(info.min));
        const max = element('div', 'temp-range precision-added', rangeText(info.max));
        min.title = max.title = pickText(T.rangeTitle);
        cells[2].appendChild(min);
        cells[3].appendChild(max);
      }
    });

    renderModelComparison();
  }

  function renderModelComparison() {
    document.getElementById('modelCompare')?.remove();
    if (!state.models) return;
    const table = document.getElementById('weatherTable');
    const anchor = table && (table.closest('.table-container') || table);
    if (!anchor) return;

    const details = element('details', 'model-compare');
    details.id = 'modelCompare';
    details.appendChild(element('summary', '', `📊 ${pickText(T.modelsTitle)}`));

    const dayFormat = new Intl.DateTimeFormat(locales[document.documentElement.lang] || 'en-GB', { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'UTC' });
    const compare = document.createElement('table');
    const head = compare.createTHead().insertRow();
    head.appendChild(element('th', '', pickText(T.day)));
    MODELS.forEach(model => {
      const th = element('th', '', model.name);
      th.appendChild(element('small', '', ` (${pickText(model.origin)})`));
      head.appendChild(th);
    });
    const body = compare.createTBody();
    state.dates.forEach(date => {
      const values = state.models[date];
      if (!values) return;
      const row = body.insertRow();
      row.appendChild(element('td', '', dayFormat.format(new Date(date + 'T12:00:00Z'))));
      MODELS.forEach(model => {
        const v = values[model.id];
        const text = v && v.max !== null ? `${Math.round(v.max)}° / ${v.rain === null ? '–' : v.rain} mm` : '–';
        row.appendChild(element('td', '', text));
      });
    });
    details.appendChild(compare);
    details.appendChild(element('p', 'model-note', pickText(T.modelsNote)));
    anchor.insertAdjacentElement('afterend', details);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language');
    if (languageSelect) languageSelect.addEventListener('change', render);
  });

  return { enhance };
})();
