// Weather page: "Detailed forecast" shows the hourly interval field. Off, the
// hourly tables use 60 minutes (the "Hourly forecast" link under each day).
(function () {
  const KEY = 'detailedForecast';
  const box = document.getElementById('detailedForecast');
  const group = document.getElementById('intervalGroup');
  const interval = document.getElementById('interval');
  if (!box || !group || !interval) return;

  const texts = {
    en: 'Detailed forecast (hourly)',
    bg: 'Детайлна прогноза (по часове)',
    de: 'Detaillierte Vorhersage (stündlich)',
    it: 'Previsione dettagliata (oraria)',
    es: 'Pronóstico detallado (por horas)'
  };
  const label = document.getElementById('detailedLabel');
  const showLabel = () => {
    if (label) label.textContent = texts[document.documentElement.lang] || texts.en;
  };

  function apply(on, save) {
    box.checked = on;
    group.hidden = !on;
    if (!on) interval.value = '60';
    if (save) {
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    }
  }

  let saved = 'off';
  try { saved = localStorage.getItem(KEY) || 'off'; } catch (e) { /* storage blocked */ }
  apply(saved === 'on', false);

  box.addEventListener('change', () => apply(box.checked, true));
  const languageSelect = document.getElementById('language');
  if (languageSelect) languageSelect.addEventListener('change', showLabel);
  showLabel();
})();
