// Moon calendar month page: a month grid (Monday first) with the phase icon and the lit part
// for every day, built from the day table (#dayBody) and rebuilt when /js/luna-local.js
// rewrites that table for another country. Days with a new, first quarter, full or last
// quarter moon are marked.
(function () {
  const dayBody = document.getElementById('dayBody');
  const phaseBody = document.getElementById('phaseBody');
  if (!dayBody || !phaseBody) return;
  const year = +phaseBody.dataset.year;
  const month = +phaseBody.dataset.month;
  const card = dayBody.closest('.info-card');
  if (!card) return;

  const grid = document.createElement('div');
  grid.className = 'moon-grid';
  grid.setAttribute('role', 'list');
  const heading = card.querySelector('h2');
  (heading || card.firstChild).insertAdjacentElement(heading ? 'afterend' : 'beforebegin', grid);

  const LOCALES = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const locale = () => LOCALES[document.documentElement.lang] || 'en-GB';

  function build() {
    const rows = [...dayBody.querySelectorAll('tr')];
    if (!rows.length) { grid.hidden = true; return; }
    grid.hidden = false;
    const cells = [];
    // weekday names, Monday first (2024-01-01 was a Monday)
    for (let i = 0; i < 7; i++) {
      const name = new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(locale(), { weekday: 'short', timeZone: 'UTC' });
      const head = document.createElement('div');
      head.className = 'mg-head';
      head.setAttribute('aria-hidden', 'true'); // the day cells say their weekday in the title
      head.textContent = name;
      cells.push(head);
    }
    const first = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    for (let i = 0; i < first; i++) {
      const blank = document.createElement('div');
      blank.className = 'mg-blank';
      cells.push(blank);
    }
    const today = new Date();
    rows.forEach((row, i) => {
      const tds = row.children;
      const phase = (tds[2] && tds[2].textContent.trim()) || '';
      const icon = phase.split(' ')[0];
      const phaseName = phase.slice(icon.length).trim();
      const lit = (tds[3] && tds[3].textContent.trim()) || '';
      const exact = tds[2] && tds[2].querySelector('.holiday-note');
      const cell = document.createElement('div');
      cell.className = 'mg-day' + (exact ? ' mg-key' : '');
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === i + 1) cell.classList.add('mg-today');
      cell.setAttribute('role', 'listitem');
      cell.title = `${i + 1} · ${phaseName} · ${lit}`;
      const num = document.createElement('span');
      num.className = 'mg-num';
      num.textContent = String(i + 1);
      const moon = document.createElement('span');
      moon.className = 'mg-icon';
      // drawn from the phase of the row: an exact phase that day, otherwise from the lit part
      const index = typeof Moon !== 'undefined' ? Moon.ICONS.indexOf(icon) : -1;
      if (typeof MoonView !== 'undefined' && index >= 0) {
        const fraction = Math.min(1, Math.max(0, parseFloat(lit) / 100 || 0));
        const elongation = Math.acos(1 - 2 * fraction) * 180 / Math.PI;
        const angle = exact && index % 2 === 0 ? index * 45 : (index >= 1 && index <= 4 ? elongation : 360 - elongation);
        moon.innerHTML = MoonView.svg(angle, 30);
      } else {
        moon.textContent = icon;
      }
      const pct = document.createElement('span');
      pct.className = 'mg-pct';
      pct.textContent = lit;
      cell.append(num, moon, pct);
      cells.push(cell);
    });
    grid.replaceChildren(...cells);
  }

  build();
  new MutationObserver(build).observe(dayBody, { childList: true });
  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'language') setTimeout(build, 50);
  });
})();
