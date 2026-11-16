// /vremeto/utre/: refreshes the table of tomorrow's weather with the live forecast
// (/js/tomorrow-core.js). The page already holds the forecast of the morning; if the request fails
// the table stays as it is.
(function () {
  const table = document.getElementById('tomorrowTable');
  if (!table || typeof Tomorrow === 'undefined') return;
  let cities;
  try { cities = JSON.parse(table.dataset.cities); } catch (e) { return; }
  Promise.all(Tomorrow.urls(cities).map(url => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })))
    .then(answers => {
      const data = Tomorrow.rows(cities, answers);
      if (data.length < cities.length / 2) return;
      table.querySelector('tbody').innerHTML = Tomorrow.body(data);
      const summary = document.getElementById('tomorrowSummary');
      if (summary) summary.textContent = Tomorrow.summary(data);
    })
    .catch(() => { /* keep the static table */ });
})();
