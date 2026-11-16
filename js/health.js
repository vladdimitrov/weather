// /vremeto/uv-indeks/ and /vremeto/polen/: refresh the table with the live Open-Meteo data
// (/js/health-core.js). The page already holds the values of the morning; on an error it stays as it is.
(function () {
  if (typeof Health === 'undefined') return;
  const table = document.querySelector('[data-health]');
  if (!table) return;
  const kind = table.dataset.health;
  let cities;
  try { cities = JSON.parse(table.dataset.cities); } catch (e) { return; }
  const urls = kind === 'uv' ? Health.uvUrls(cities) : Health.pollenUrls(cities);
  Promise.all(urls.map(url => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })))
    .then(answers => {
      const rows = kind === 'uv' ? Health.uvRows(cities, answers) : Health.pollenRows(cities, answers);
      if (rows.length < cities.length / 2) return;
      table.querySelector('tbody').innerHTML = kind === 'uv' ? Health.uvBody(rows) : Health.pollenBody(rows);
      const summary = document.getElementById('healthSummary');
      if (summary) summary.textContent = kind === 'uv' ? Health.uvSummary(rows) : Health.pollenSummary(rows);
    })
    .catch(() => { /* keep the static table */ });
})();
