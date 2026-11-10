// Maps and Holidays pages: once a map or the holidays are shown, the form folds into one
// line ("Sofia · Rain  ✎ Change") so the result is the first thing on the screen. A click on
// the line opens the form again. On the Holidays page the empty calendar box stays hidden
// until there is something to show.
(function () {
  const form = document.querySelector('.form-container');
  if (!form) return;
  const mapBox = document.getElementById('mapContainer');
  const loadButton = document.getElementById('loadMap') || document.getElementById('loadData');
  const calendar = document.getElementById('calendar');
  const details = document.getElementById('holidayDetails');
  if (!loadButton || (!mapBox && !details)) return;

  const pick = texts => (window.pickText ? window.pickText(texts) : texts[document.documentElement.lang] || texts.en);
  const changeText = { en: 'Change', bg: 'Промени', de: 'Ändern', it: 'Modifica', es: 'Cambiar' };
  const el = id => document.getElementById(id);

  function placeName() {
    const selected = el('selected-city');
    const text = selected ? selected.textContent.trim() : '';
    const fromSelected = text.includes(':') ? text.split(':').slice(1).join(':').trim() : '';
    const city = el('city');
    return fromSelected || (city && city.value.trim()) || '';
  }

  function dateText(value) {
    if (!value) return '';
    const date = new Date(value + 'T12:00:00');
    return isNaN(date) ? value : date.toLocaleDateString(document.documentElement.lang || 'en', { day: 'numeric', month: 'short' });
  }

  function summaryParts() {
    const parts = [placeName()];
    if (mapBox) {
      const layer = el('weatherLayer');
      if (layer && layer.selectedOptions[0]) parts.push(layer.selectedOptions[0].textContent.trim());
    } else {
      const from = dateText((el('fromDate') || {}).value);
      const to = dateText((el('toDate') || {}).value);
      if (from && to) parts.push(`${from} – ${to}`);
    }
    return parts.filter(Boolean);
  }

  function renderSummary() {
    let bar = form.querySelector(':scope > .form-summary');
    if (!bar) {
      bar = document.createElement('button');
      bar.type = 'button';
      bar.className = 'form-summary';
      bar.addEventListener('click', () => {
        form.classList.remove('collapsed');
        const city = el('city');
        if (city) city.focus();
      });
      form.insertBefore(bar, form.firstChild);
    }
    const text = document.createElement('span');
    text.className = 'fs-text';
    text.textContent = summaryParts().join(' · ');
    const change = document.createElement('span');
    change.className = 'fs-change';
    change.textContent = `✎ ${pick(changeText)}`;
    bar.replaceChildren(text, change);
  }

  function shown() {
    if (mapBox) return mapBox.style.display !== 'none';
    return !!(details && details.children.length) || !!(calendar && calendar.children.length);
  }

  function fold() {
    if (!shown()) return;
    renderSummary();
    form.classList.add('collapsed');
  }

  // the Holidays page: no empty calendar box before the first result
  function syncCalendar() {
    if (!calendar || mapBox) return;
    calendar.style.display = calendar.children.length ? '' : 'none';
  }
  syncCalendar();

  let timer = null;
  function later(delay) {
    clearTimeout(timer);
    timer = setTimeout(() => { syncCalendar(); fold(); }, delay);
  }

  if (mapBox) {
    new MutationObserver(() => later(500)).observe(mapBox, { attributes: true, attributeFilter: ['style'] });
  } else {
    [calendar, details].forEach(node => node && new MutationObserver(() => later(400)).observe(node, { childList: true }));
  }
  loadButton.addEventListener('click', () => later(mapBox ? 900 : 1600));
  document.addEventListener('DOMContentLoaded', () => later(1200));

  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'language') {
      setTimeout(() => { if (form.classList.contains('collapsed')) renderSummary(); }, 0);
    }
  });
})();
