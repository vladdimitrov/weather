// "Magnetic storms" page (/magnitni-buri/): live Kp, 3-day forecast in 3-hour
// steps, solar wind and NOAA's 27-day outlook, plus storm notifications (the
// check itself runs in /sw.js). The page is in Bulgarian.
(function () {
  const KP_NOW_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
  const KP_FORECAST_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';
  const SPEED_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json';
  const FIELD_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json';
  const OUTLOOK_URL = 'https://services.swpc.noaa.gov/text/27-day-outlook.txt';
  const ALERTS_KEY = 'stormAlerts';

  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const $ = id => document.getElementById(id);

  function level(kp) {
    return kp >= 7 ? 'storm' : kp >= 5 ? 'active' : 'calm';
  }

  function gScale(kp) {
    return kp >= 5 ? 'G' + Math.min(5, Math.floor(kp) - 4) : '';
  }

  function statusText(kp) {
    if (kp >= 9) return 'Изключителна магнитна буря';
    if (kp >= 8) return 'Много силна магнитна буря';
    if (kp >= 7) return 'Силна магнитна буря';
    if (kp >= 6) return 'Умерена магнитна буря';
    if (kp >= 5) return 'Слаба магнитна буря';
    if (kp >= 4) return 'Повишена активност';
    return 'Спокойно';
  }

  function kpScale(kp) {
    let segments = '';
    for (let i = 0; i < 10; i++) segments += `<span class="${i <= Math.round(kp) ? 'on' : ''}"></span>`;
    return `<span class="kp-scale" role="img" aria-label="Kp ${kp} от 9">${segments}</span>`;
  }

  function gBadge(kp) {
    const g = gScale(kp);
    return g ? ` <span class="kp-g-scale">${g}</span>` : '';
  }

  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // ---- Kp now ----
  async function loadNow() {
    const box = $('stormNow');
    try {
      const data = await getJson(KP_NOW_URL);
      const last = data[data.length - 1];
      const kp = Math.round(parseFloat(last.estimated_kp ?? last.kp_index) * 10) / 10;
      const time = new Date(last.time_tag + (last.time_tag.endsWith('Z') ? '' : 'Z'));
      box.innerHTML =
        '<h3>Kp индекс сега</h3>' +
        `<div class="storm-now-value kp-${level(kp)}">${kp}</div>` +
        `<div>${kpScale(kp)}${gBadge(kp)}</div>` +
        `<div class="storm-now-status">${statusText(kp)}</div>` +
        `<div class="storm-updated">Обновено: ${time.toLocaleString('bg-BG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>`;
    } catch (err) {
      console.error('Error loading Kp:', err);
      box.innerHTML = '<h3>Kp индекс сега</h3><p>Данните не могат да се заредят в момента.</p>';
    }
  }

  // ---- 3-day forecast, per day and in 3-hour steps ----
  async function loadForecast() {
    const box = $('stormForecast');
    try {
      const data = await getJson(KP_FORECAST_URL);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const points = data
        .map(entry => ({ time: new Date(String(entry.time_tag) + 'Z'), kp: parseFloat(entry.kp), kind: entry.observed, scale: entry.noaa_scale }))
        .filter(point => !isNaN(point.kp) && point.time >= startOfToday);

      // Highest Kp per local day, for the next 3 days
      const days = [];
      points.forEach(point => {
        const key = point.time.toLocaleDateString('bg-BG');
        let day = days.find(d => d.key === key);
        if (!day) {
          if (days.length === 3) return;
          day = { key, date: point.time, kp: 0 };
          days.push(day);
        }
        day.kp = Math.max(day.kp, point.kp);
      });
      const dayName = (day, index) => index === 0 ? 'Днес' : index === 1 ? 'Утре' : day.date.toLocaleDateString('bg-BG', { weekday: 'long' });
      const dayCards = days.map((day, index) => {
        const kp = Math.round(day.kp * 10) / 10;
        return `<div class="kp-day"><div class="kp-day-name">${dayName(day, index)}</div>` +
          `<div>Kp ${kp}${kpScale(kp)}</div><div class="kp-day-status">${statusText(kp)}${gBadge(kp)}</div></div>`;
      }).join('');

      // Bars for every 3 hours
      const shown = points.filter(point => days.some(day => day.key === point.time.toLocaleDateString('bg-BG')));
      const width = 720, height = 170, pad = { left: 24, right: 6, top: 10, bottom: 34 };
      const barWidth = (width - pad.left - pad.right) / Math.max(1, shown.length);
      const y = kp => pad.top + (9 - kp) * (height - pad.top - pad.bottom) / 9;
      const colors = { calm: '#2ecc71', active: '#f1c40f', storm: '#e74c3c' };
      const bars = shown.map((point, i) => {
        const x = pad.left + i * barWidth;
        const label = point.time.toLocaleString('bg-BG', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        return `<rect x="${(x + 1).toFixed(1)}" y="${y(point.kp).toFixed(1)}" width="${(barWidth - 2).toFixed(1)}" height="${(height - pad.bottom - y(point.kp)).toFixed(1)}" fill="${colors[level(point.kp)]}" opacity="${point.kind === 'predicted' ? 0.75 : 1}"><title>${label}: Kp ${point.kp}</title></rect>`;
      }).join('');
      const separators = shown.map((point, i) => {
        if (i === 0 || point.time.getHours() >= 3) return '';
        const x = pad.left + i * barWidth;
        return `<line x1="${x}" x2="${x}" y1="${pad.top}" y2="${height - pad.bottom + 18}" class="chart-grid"/>`;
      }).join('');
      const dayLabels = days.map((day, index) => {
        const first = shown.findIndex(point => point.time.toLocaleDateString('bg-BG') === day.key);
        const count = shown.filter(point => point.time.toLocaleDateString('bg-BG') === day.key).length;
        const x = pad.left + (first + count / 2) * barWidth;
        return `<text x="${x.toFixed(1)}" y="${height - 8}" text-anchor="middle">${dayName(day, index)}</text>`;
      }).join('');
      const grid = [0, 5, 9].map(kp => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${y(kp)}" y2="${y(kp)}" class="chart-grid"/><text x="${pad.left - 6}" y="${y(kp) + 4}" text-anchor="end">${kp}</text>`).join('');

      box.innerHTML =
        '<h3>Прогноза за 3 дни</h3>' +
        `<div class="kp-days">${dayCards}</div>` +
        `<div class="hourly-chart storm-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Kp индекс на всеки 3 часа">${grid}${separators}${bars}${dayLabels}</svg>` +
        '<div class="chart-legend">Kp на всеки 3 часа · зелено — спокойно, жълто — буря G1–G2, червено — силна буря</div></div>';
      box.hidden = false;
    } catch (err) {
      console.error('Error loading Kp forecast:', err);
    }
  }

  // ---- Solar wind now ----
  async function loadWind() {
    const box = $('stormWind');
    try {
      const [[speed], [field]] = await Promise.all([getJson(SPEED_URL), getJson(FIELD_URL)]);
      const v = Number(speed.proton_speed), bz = Number(field.bz_gsm);
      const status = (bz <= -10 && v >= 500) ? 'storm' : ((bz <= -5 && v >= 400) || v >= 600) ? 'watch' : 'calm';
      const statusTexts = {
        calm: 'Спокойно, без буря в следващия час',
        watch: 'Възможна повишена активност до час',
        storm: '⚠️ Възможна магнитна буря до час'
      };
      box.innerHTML =
        '<div class="solar-wind"><h3>☀️ Слънчев вятър сега</h3>' +
        `<div class="solar-wind-values"><span>Скорост: <b>${Math.round(v)} km/s</b></span><span>Bz: <b>${bz > 0 ? '+' : ''}${bz} nT</b></span></div>` +
        `<div class="solar-wind-status wind-${status}">${statusTexts[status]}</div>` +
        '<p class="outlook-note">Измерено от спътника DSCOVR на 1,5 млн. км от Земята; достига до нас за 30–60 минути. Бърз вятър с отрицателно (южно) Bz предизвиква бури. Обновява се на всеки 5 минути.</p></div>';
      box.hidden = false;
    } catch (err) {
      console.error('Error loading solar wind:', err);
    }
  }

  // ---- 27-day outlook ----
  async function loadOutlook() {
    const box = $('stormOutlook');
    try {
      const response = await fetch(OUTLOOK_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const today = new Date().toISOString().slice(0, 10);
      const days = (await response.text()).split('\n')
        .map(line => line.match(/^(\d{4}) (\w{3}) (\d{2})\s+\d+\s+\d+\s+(\d+)/))
        .filter(match => match && match[2] in months)
        .map(match => ({ date: new Date(Date.UTC(+match[1], months[match[2]], +match[3])), kp: Number(match[4]) }))
        .filter(day => day.date.toISOString().slice(0, 10) >= today);
      const strip = days.map(day => {
        const label = day.date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', timeZone: 'UTC' });
        return `<span class="outlook-day kp-${level(day.kp)}" title="${label}: Kp ${day.kp}"><span class="outlook-kp">${day.kp}</span><span class="outlook-date">${day.date.getUTCDate()}</span></span>`;
      }).join('');
      box.innerHTML = '<div class="kp-outlook"><h3>📅 Прогноза за 27 дни (NOAA)</h3>' +
        `<div class="outlook-days">${strip}</div>` +
        '<p class="outlook-note">Очакван най-висок Kp за всеки ден, по 27-дневното въртене на Слънцето. Ориентировъчно.</p></div>';
      box.hidden = false;
    } catch (err) {
      console.error('Error loading 27-day outlook:', err);
    }
  }

  // ---- Storm notifications ----
  function alertsOn() {
    try { return localStorage.getItem(ALERTS_KEY) === 'on'; } catch (e) { return false; }
  }

  function setAlerts(on) {
    try { localStorage.setItem(ALERTS_KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
  }

  function renderAlerts(message) {
    const button = $('stormAlertsButton');
    button.textContent = alertsOn() ? 'Изключи известията' : 'Включи известията';
    if (message !== undefined) $('stormAlertsStatus').textContent = message;
  }

  async function toggleAlerts() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      renderAlerts('Вашият браузър не поддържа известия.');
      return;
    }
    const registration = await navigator.serviceWorker.ready;

    if (alertsOn()) {
      setAlerts(false);
      if ('periodicSync' in registration) {
        try { await registration.periodicSync.unregister('storm-check'); } catch (e) { /* not registered */ }
      }
      renderAlerts('Известията са изключени.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      renderAlerts('Известията не са разрешени. Можете да ги разрешите от настройките на браузъра за weatherpulse.eu.');
      return;
    }
    setAlerts(true);

    let inBackground = false;
    if ('periodicSync' in registration) {
      try {
        await registration.periodicSync.register('storm-check', { minInterval: 6 * 60 * 60 * 1000 });
        inBackground = true;
      } catch (e) { /* only for installed apps, browser decides */ }
    }
    registration.showNotification('Weather Pulse', {
      body: 'Известията за магнитни бури са включени.',
      icon: '/images/icons/icon-192.png',
      tag: 'storm-alerts-on'
    });
    renderAlerts(inBackground
      ? 'Включени. Ще получите известие и когато сайтът е затворен.'
      : 'Включени. Ще получите известие, когато отворите сайта и се очаква буря. За известия и при затворен сайт инсталирайте сайта като приложение (Chrome на Android).');
  }

  function initAlerts() {
    const button = $('stormAlertsButton');
    if (!button) return;
    button.addEventListener('click', () => toggleAlerts().catch(err => {
      console.error('Storm alerts:', err);
      renderAlerts('Възникна грешка при включването на известията.');
    }));
    renderAlerts(alertsOn() ? 'Известията са включени на това устройство.' : '');
  }

  // ---- Widget code ----
  function initWidgetCopy() {
    const button = $('copyWidgetCode');
    const code = $('widgetCode');
    if (!button || !code) return;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.value);
        button.textContent = '✓ Копирано';
      } catch (e) {
        code.select();
        button.textContent = 'Копирайте с Ctrl+C';
      }
      setTimeout(() => { button.textContent = 'Копирай кода'; }, 2000);
    });
  }

  loadNow();
  loadForecast();
  loadWind();
  loadOutlook();
  setInterval(loadNow, 5 * 60 * 1000);
  setInterval(loadWind, 5 * 60 * 1000);
  initAlerts();
  initWidgetCopy();
})();
