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
    high: { en: 'Forecast: reliable', bg: 'Прогноза: надеждна', de: 'Vorhersage: zuverlässig', it: 'Previsione: affidabile', es: 'Pronóstico: fiable' },
    medium: { en: 'Forecast: fairly reliable', bg: 'Прогноза: средно надеждна', de: 'Vorhersage: mittel zuverlässig', it: 'Previsione: abbastanza affidabile', es: 'Pronóstico: bastante fiable' },
    low: { en: 'Forecast: uncertain', bg: 'Прогноза: несигурна', de: 'Vorhersage: unsicher', it: 'Previsione: incerta', es: 'Pronóstico: incierto' },
    rough: { en: 'Forecast: rough guide', bg: 'Прогноза: ориентировъчна', de: 'Vorhersage: grobe Orientierung', it: 'Previsione: indicativa', es: 'Pronóstico: orientativo' },
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

  // Legend above the table: what the reliability labels mean
  const LEGEND = {
    title: { en: 'How reliable is the forecast?', bg: 'Колко е надеждна прогнозата', de: 'Wie zuverlässig ist die Vorhersage?', it: 'Quanto è affidabile la previsione?', es: '¿Qué tan fiable es el pronóstico?' },
    high: { en: 'The runs agree: the highest temperature is within 2 °C from run to run', bg: 'Изчисленията съвпадат: максималната температура се различава с до 2 °C между тях', de: 'Die Läufe stimmen überein: die Höchsttemperatur weicht um höchstens 2 °C ab', it: 'Le simulazioni concordano: la temperatura massima differisce al massimo di 2 °C', es: 'Las simulaciones coinciden: la temperatura máxima difiere como mucho 2 °C' },
    medium: { en: 'Some difference: 2 to 4 °C between the runs', bg: 'Има разлика: между 2 и 4 °C между изчисленията', de: 'Etwas Unterschied: 2 bis 4 °C zwischen den Läufen', it: 'Qualche differenza: da 2 a 4 °C tra le simulazioni', es: 'Algo de diferencia: de 2 a 4 °C entre las simulaciones' },
    low: { en: 'The runs disagree: more than 4 °C apart, the weather may turn out differently', bg: 'Изчисленията се различават: над 4 °C, времето може да е различно от прогнозата', de: 'Die Läufe weichen ab: mehr als 4 °C, das Wetter kann anders ausfallen', it: 'Le simulazioni differiscono: oltre 4 °C, il tempo potrebbe essere diverso', es: 'Las simulaciones difieren: más de 4 °C, el tiempo puede ser distinto' },
    rough: { en: 'More than a week ahead: only a rough guide', bg: 'За повече от седмица напред: само ориентировъчно', de: 'Mehr als eine Woche voraus: nur eine grobe Orientierung', it: 'Oltre una settimana: solo indicativa', es: 'Más de una semana: solo orientativo' },
    how: { en: 'How it is worked out: about 40 runs of the ICON model start from slightly different conditions. The range shows where 80% of them fall. The reliability comes from how far apart the runs are. The model comparison under the table (ECMWF, ICON, GFS) is an extra check: when they agree, the forecast is more certain.', bg: 'Как се определя: около 40 изчисления на модела ICON тръгват от леко различни начални условия. Диапазонът показва къде са 80% от тях. Надеждността зависи от това колко са разделени изчисленията. Сравнението на трите модела под таблицата (ECMWF, ICON, GFS) е допълнителна проверка: когато съвпадат, прогнозата е по-сигурна.', de: 'So wird es ermittelt: etwa 40 Läufe des ICON-Modells starten mit leicht unterschiedlichen Bedingungen. Der Bereich zeigt, wo 80 % davon liegen. Die Zuverlässigkeit hängt davon ab, wie weit die Läufe auseinanderliegen. Der Modellvergleich unter der Tabelle (ECMWF, ICON, GFS) ist eine zusätzliche Prüfung: Wenn sie übereinstimmen, ist die Vorhersage sicherer.', it: 'Come si calcola: circa 40 simulazioni del modello ICON partono da condizioni leggermente diverse. L\'intervallo mostra dove cade l\'80% di esse. L\'affidabilità dipende da quanto sono distanti le simulazioni. Il confronto dei modelli sotto la tabella (ECMWF, ICON, GFS) è un controllo in più: quando concordano, la previsione è più sicura.', es: 'Cómo se calcula: unas 40 simulaciones del modelo ICON parten de condiciones ligeramente distintas. El rango muestra dónde cae el 80% de ellas. La fiabilidad depende de lo separadas que estén. La comparación de modelos bajo la tabla (ECMWF, ICON, GFS) es una comprobación extra: cuando coinciden, el pronóstico es más seguro.' }
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
    const [a, b] = [Math.round(low), Math.round(high)];
    return a === b ? `≈${a}°` : `${a}…${b}°`; // all runs agree: one value
  }

  // Puts the legend inside the "Compare weather models" panel (it is rebuilt
  // with every render, so the legend is added after it)
  function renderLegend() {
    const panel = document.getElementById('modelCompare');
    if (!panel) return;
    let box = document.getElementById('reliabilityLegend');
    if (!box) {
      box = document.createElement('div');
      box.id = 'reliabilityLegend';
      box.className = 'reliability-legend';
      panel.appendChild(box);
    }
    const rows = ['high', 'medium', 'low', 'rough'].map(level => {
      const dots = { high: '●●●', medium: '●●○', low: '●○○', rough: '○○○' }[level];
      const row = element('div', 'legend-row');
      row.append(element('span', 'reliability rel-' + level, dots + ' ' + pickText(T[level])), element('span', 'legend-text', pickText(LEGEND[level])));
      return row;
    });
    box.replaceChildren(element('div', 'legend-title', pickText(LEGEND.title)), ...rows, element('p', 'legend-how', pickText(LEGEND.how)));
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
    renderLegend();
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
