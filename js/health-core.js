// UV index and pollen in the Bulgarian cities: the pure parts shared by the daily build
// (.github/scripts/build-health.js) and the browser (/js/health.js, live refresh). Open-Meteo.
//   Health.uvUrls(cities)  / Health.uvRows(cities, answers)  / Health.uvBody(rows)  / Health.uvSummary(rows)
//   Health.pollenUrls(cities) / Health.pollenRows(cities, answers) / Health.pollenBody(rows) / Health.pollenSummary(rows)
(function (root) {
  'use strict';

  const CHUNK = 20;
  const chunks = cities => { const out = []; for (let i = 0; i < cities.length; i += CHUNK) out.push(cities.slice(i, i + CHUNK)); return out; };
  const flat = answers => answers.flatMap(answer => (Array.isArray(answer) ? answer : [answer]));
  const coordinates = part => `latitude=${part.map(c => c.lat).join(',')}&longitude=${part.map(c => c.lon).join(',')}`;

  // ---- UV ----
  function uvUrls(cities) {
    return chunks(cities).map(part => `https://api.open-meteo.com/v1/forecast?${coordinates(part)}&daily=uv_index_max&timezone=Europe%2FSofia&forecast_days=2`);
  }
  // WHO scale
  const UV_LEVELS = [[11, 'Екстремален', 'extreme'], [8, 'Много висок', 'very-high'], [6, 'Висок', 'high'], [3, 'Умерен', 'moderate'], [0, 'Нисък', 'low']];
  const uvLevel = value => UV_LEVELS.find(([min]) => Math.round(value) >= min) || UV_LEVELS[UV_LEVELS.length - 1];
  function uvRows(cities, answers) {
    const places = flat(answers);
    return cities.map((city, i) => {
      const daily = places[i] && places[i].daily;
      if (!daily || !daily.uv_index_max || daily.uv_index_max.length < 2 || daily.uv_index_max[0] == null) return null;
      return { slug: city.slug, name: city.name, today: Math.round(daily.uv_index_max[0] * 10) / 10, tomorrow: Math.round(daily.uv_index_max[1] * 10) / 10, day: daily.time[0] };
    }).filter(Boolean);
  }
  const inCity = name => (/^[вВфФ]/.test(name) ? 'във ' : 'в ') + name;
  const num = value => String(value).replace('.', ',');
  const uvBody = rows => rows.map(r => `<tr><td><a href="/vremeto/${r.slug}/">${r.name}</a></td><td>${num(r.today)} – ${uvLevel(r.today)[1].toLowerCase()}</td><td>${num(r.tomorrow)} – ${uvLevel(r.tomorrow)[1].toLowerCase()}</td></tr>`).join('\n');
  function uvSummary(rows) {
    if (!rows.length) return '';
    const high = rows.reduce((a, b) => (b.today > a.today ? b : a));
    const low = rows.reduce((a, b) => (b.today < a.today ? b : a));
    return `Днес най-високият UV индекс е ${inCity(high.name)} – ${num(high.today)} (${uvLevel(high.today)[1].toLowerCase()}), а най-ниският ${inCity(low.name)} – ${num(low.today)} (${uvLevel(low.today)[1].toLowerCase()}). Показана е най-високата стойност за деня, обикновено около обяд, като облачността е взета предвид.`;
  }

  // ---- pollen ----
  const POLLEN = [['alder_pollen', 'Елша'], ['birch_pollen', 'Бреза'], ['grass_pollen', 'Треви'], ['mugwort_pollen', 'Пелин'], ['ragweed_pollen', 'Амброзия'], ['olive_pollen', 'Маслина']];
  function pollenUrls(cities) {
    return chunks(cities).map(part => `https://air-quality-api.open-meteo.com/v1/air-quality?${coordinates(part)}&hourly=${POLLEN.map(p => p[0]).join(',')}&timezone=Europe%2FSofia&forecast_days=2`);
  }
  // grains per cubic metre; rough levels for all types together
  const pollenLevel = value => (value >= 200 ? 'много висок' : value >= 50 ? 'висок' : value >= 10 ? 'умерен' : value > 0 ? 'нисък' : '–');
  function pollenRows(cities, answers) {
    const places = flat(answers);
    return cities.map((city, i) => {
      const hourly = places[i] && places[i].hourly;
      if (!hourly) return null;
      const values = POLLEN.map(([key]) => {
        const list = (hourly[key] || []).slice(0, 24).filter(v => v != null);
        return list.length ? Math.round(Math.max(...list)) : null;
      });
      return { slug: city.slug, name: city.name, values };
    }).filter(Boolean);
  }
  const hasPollen = rows => rows.some(r => r.values.some(v => v));
  const pollenBody = rows => rows.map(r => `<tr><td><a href="/vremeto/${r.slug}/">${r.name}</a></td>${r.values.map(v => `<td>${v == null ? '–' : v ? `${v} (${pollenLevel(v)})` : '0'}</td>`).join('')}</tr>`).join('\n');
  function pollenSummary(rows) {
    if (!rows.length || !hasPollen(rows)) return 'В момента моделът не отчита полени във въздуха – извън сезона е. Данните се показват автоматично, щом започне цъфтежът.';
    const top = POLLEN.map((p, i) => [p[1], Math.max(...rows.map(r => r.values[i] || 0))]).sort((a, b) => b[1] - a[1])[0];
    return `Днес най-много полени има от ${top[0].toLowerCase()} – до ${top[1]} зърна на кубичен метър (ориентировъчно ниво: ${pollenLevel(top[1])}).`;
  }

  const Health = { uvUrls, uvRows, uvBody, uvSummary, uvLevel, pollenUrls, pollenRows, pollenBody, pollenSummary, POLLEN, hasPollen };
  if (typeof module !== 'undefined' && module.exports) module.exports = Health;
  else root.Health = Health;
})(typeof window !== 'undefined' ? window : this);
