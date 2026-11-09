// /nebeto/: adapts the page to the country of the visitor's place (/js/place-context.js).
// The HTML is written for Bulgaria (Sofia time, the eclipse figures for Sofia, the aurora
// text for Bulgarian latitudes). For another country this script
//   - shows a country picker (it picks the main place of the country, the same place the
//     forecast page uses),
//   - writes the dates and times in the time zone of the place,
//   - replaces the eclipse and northern lights texts that are about Bulgaria with texts for the place.
// Marks in the HTML: [data-utc] (+ data-fmt date | time | datetime), [data-tzlabel], [data-bg-only],
// [data-other-only], #skyH1Place, #skyPlace, #skyEclipseGeneric, #skyAuroraGeneric, #skySunLink.
(function () {
  const bar = document.getElementById('skyPlace');
  if (!bar || typeof PlaceContext === 'undefined') return;

  const LOCALES = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const SUFFIX = { bg: ' ч.', de: ' Uhr' };
  const D = {
    bg: {
      label: 'Показано за:', hint: 'Часовете, затъмнението и сиянието следват избраната държава.', tz: zone => `местно време (${zone})`,
      eclipse: place => `Частичното слънчево затъмнение на 2 август 2027 г. се вижда като частично от по-голямата част от Европа, Северна Африка и Близкия изток; пълно е в тясна ивица през Гибралтар и Северна Африка. Извън тези райони (например Америка и Източна Азия) не се вижда. Часът и степента за ${place} зависят от мястото – точни данни сме изчислили само за София. Никога не гледайте Слънцето без специални очила за затъмнение.`,
      aurora: (place, lat, level, dir) => `${place} (${lat}): ${['При тази ширина сиянието практически не се вижда.', 'Сиянието се вижда рядко и само при най-силните бури – Kp около 7 или повече (степени G3 и над).', 'Обикновено е нужен Kp около 6–8 (степени G2–G4).', 'Обикновено е нужен Kp около 5–7 (степени G1–G3).', 'Често е достатъчен Kp 4–5 (степени G0–G1).', 'Сиянието се вижда често и при умерена активност (Kp 2–4).'][level]} Нужни са ясно небе, далеч от градските светлини и поглед към ${dir}. Това е груба оценка по географска ширина, не прогноза.`,
      north: 'север', south: 'юг', n: 'с.ш.', s: 'ю.ш.', sun: place => `Изгрев и залез – ${place}`
    },
    en: {
      label: 'Showing for:', hint: 'Times, the eclipse and the northern lights follow the chosen country.', tz: zone => `local time (${zone})`,
      eclipse: place => `The partial solar eclipse of 2 August 2027 is seen as a partial eclipse from most of Europe, North Africa and the Middle East; it is total in a narrow band over Gibraltar and North Africa. Outside these regions (for example the Americas and East Asia) it is not visible. The time and the magnitude for ${place} depend on the location – we have calculated exact figures only for Sofia. Never look at the Sun without special eclipse glasses.`,
      aurora: (place, lat, level, dir) => `${place} (${lat}): ${['At this latitude the northern lights are practically never seen.', 'The northern lights are rare and seen only during the strongest storms – Kp about 7 or more (levels G3 and above).', 'Usually Kp about 6–8 is needed (levels G2–G4).', 'Usually Kp about 5–7 is needed (levels G1–G3).', 'Kp 4–5 (levels G0–G1) is often enough.', 'The northern lights are often seen even at moderate activity (Kp 2–4).'][level]} You need a clear sky, a place far from city lights and a view to the ${dir}. This is a rough guide by latitude, not a forecast.`,
      north: 'north', south: 'south', n: 'N', s: 'S', sun: place => `Sunrise and sunset – ${place}`
    },
    de: {
      label: 'Angezeigt für:', hint: 'Zeiten, Finsternis und Polarlichter folgen dem gewählten Land.', tz: zone => `Ortszeit (${zone})`,
      eclipse: place => `Die partielle Sonnenfinsternis vom 2. August 2027 ist von großen Teilen Europas, Nordafrikas und des Nahen Ostens als partielle Finsternis zu sehen; total ist sie in einem schmalen Streifen über Gibraltar und Nordafrika. Außerhalb dieser Regionen (zum Beispiel in Amerika und Ostasien) ist sie nicht sichtbar. Zeit und Größe für ${place} hängen vom Standort ab – genaue Werte haben wir nur für Sofia berechnet. Schauen Sie niemals ohne spezielle Finsternisbrille in die Sonne.`,
      aurora: (place, lat, level, dir) => `${place} (${lat}): ${['Auf dieser Breite sind Polarlichter praktisch nie zu sehen.', 'Polarlichter sind selten und nur bei den stärksten Stürmen zu sehen – Kp etwa 7 oder mehr (Stufen G3 und höher).', 'Meist ist Kp etwa 6–8 nötig (Stufen G2–G4).', 'Meist ist Kp etwa 5–7 nötig (Stufen G1–G3).', 'Oft genügt Kp 4–5 (Stufen G0–G1).', 'Polarlichter sind oft schon bei mäßiger Aktivität zu sehen (Kp 2–4).'][level]} Nötig sind klarer Himmel, ein Ort weit weg von Stadtlicht und Blick nach ${dir}. Das ist eine grobe Einschätzung nach Breitengrad, keine Vorhersage.`,
      north: 'Norden', south: 'Süden', n: 'N', s: 'S', sun: place => `Sonnenaufgang und Sonnenuntergang – ${place}`
    },
    it: {
      label: 'Mostrato per:', hint: 'Orari, eclissi e aurora seguono il paese scelto.', tz: zone => `ora locale (${zone})`,
      eclipse: place => `L'eclissi solare parziale del 2 agosto 2027 si vede come parziale da gran parte dell'Europa, del Nord Africa e del Medio Oriente; è totale in una stretta fascia sopra Gibilterra e il Nord Africa. Fuori da queste regioni (per esempio nelle Americhe e in Asia orientale) non è visibile. L'orario e la magnitudine per ${place} dipendono dal luogo: abbiamo calcolato i valori esatti solo per Sofia. Non guardare mai il Sole senza occhiali speciali per eclissi.`,
      aurora: (place, lat, level, dir) => `${place} (${lat}): ${["A questa latitudine l'aurora non si vede praticamente mai.", "L'aurora è rara e si vede solo con le tempeste più forti – Kp circa 7 o più (livelli G3 e superiori).", 'Di solito serve un Kp di circa 6–8 (livelli G2–G4).', 'Di solito serve un Kp di circa 5–7 (livelli G1–G3).', 'Spesso basta un Kp 4–5 (livelli G0–G1).', "L'aurora si vede spesso anche con attività moderata (Kp 2–4)."][level]} Servono cielo sereno, un luogo lontano dalle luci della città e lo sguardo a ${dir}. È una stima approssimativa in base alla latitudine, non una previsione.`,
      north: 'nord', south: 'sud', n: 'N', s: 'S', sun: place => `Alba e tramonto – ${place}`
    },
    es: {
      label: 'Mostrado para:', hint: 'Las horas, el eclipse y las auroras siguen al país elegido.', tz: zone => `hora local (${zone})`,
      eclipse: place => `El eclipse solar parcial del 2 de agosto de 2027 se ve como parcial desde gran parte de Europa, el norte de África y Oriente Medio; es total en una franja estrecha sobre Gibraltar y el norte de África. Fuera de estas regiones (por ejemplo, América y Asia oriental) no es visible. La hora y la magnitud para ${place} dependen del lugar: solo hemos calculado cifras exactas para Sofía. No mires nunca al Sol sin gafas especiales para eclipses.`,
      aurora: (place, lat, level, dir) => `${place} (${lat}): ${['A esta latitud la aurora prácticamente no se ve nunca.', 'La aurora es rara y solo se ve con las tormentas más fuertes: Kp de 7 o más (niveles G3 y superiores).', 'Normalmente hace falta un Kp de 6–8 (niveles G2–G4).', 'Normalmente hace falta un Kp de 5–7 (niveles G1–G3).', 'A menudo basta un Kp de 4–5 (niveles G0–G1).', 'La aurora se ve a menudo incluso con actividad moderada (Kp 2–4).'][level]} Hacen falta cielo despejado, un lugar lejos de las luces de la ciudad y mirar al ${dir}. Es una estimación aproximada por latitud, no una previsión.`,
      north: 'norte', south: 'sur', n: 'N', s: 'S', sun: place => `Salida y puesta del sol – ${place}`
    }
  };

  // Headings and the weather link that name Bulgaria in the HTML
  const H = {
    bg: { aurora: c => `Северно сияние – ${c}`, eclipse: c => `Затъмнения – ${c}`, weather: p => `Времето – ${p}` },
    en: { aurora: c => `Northern lights – ${c}`, eclipse: c => `Eclipses – ${c}`, weather: p => `Weather – ${p}` },
    de: { aurora: c => `Polarlichter – ${c}`, eclipse: c => `Finsternisse – ${c}`, weather: p => `Wetter – ${p}` },
    it: { aurora: c => `Aurora boreale – ${c}`, eclipse: c => `Eclissi – ${c}`, weather: p => `Meteo – ${p}` },
    es: { aurora: c => `Auroras boreales – ${c}`, eclipse: c => `Eclipses – ${c}`, weather: p => `El tiempo – ${p}` }
  };

  const originals = new Map();
  const remember = (node, key, value) => { if (!originals.has(node)) originals.set(node, {}); const saved = originals.get(node); if (!(key in saved)) saved[key] = value; return saved[key]; };

  function format(lang, zone, node) {
    const date = new Date(node.dataset.utc);
    const locale = LOCALES[lang];
    const day = new Intl.DateTimeFormat(locale, { timeZone: zone, day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    const time = new Intl.DateTimeFormat(locale, { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date) + (SUFFIX[lang] || '');
    return node.dataset.fmt === 'time' ? time : node.dataset.fmt === 'date' ? day : `${day}<br>${time}`;
  }

  let places = {};
  async function apply() {
    const lang = PlaceContext.language();
    const t = D[lang];
    const place = PlaceContext.get();
    const bulgaria = place.countryCode === 'BG' || (place.isDefault);
    const zone = bulgaria ? 'Europe/Sofia' : await PlaceContext.timeZone(place);
    const name = PlaceContext.placeName(place, lang, places[place.countryCode]) || PlaceContext.countryName(place.countryCode, lang);
    const country = PlaceContext.countryName(bulgaria ? 'BG' : place.countryCode, lang);

    // title and time zone label
    const h1 = document.getElementById('skyH1Place');
    if (h1) h1.textContent = ` – ${country}`;
    document.querySelectorAll('[data-tzlabel]').forEach(node => {
      const original = remember(node, 'html', node.innerHTML);
      node.innerHTML = bulgaria ? original : t.tz(zone);
    });
    document.querySelectorAll('[data-utc]').forEach(node => {
      const original = remember(node, 'html', node.innerHTML);
      node.innerHTML = bulgaria ? original : format(lang, zone, node);
    });

    // Bulgaria-only texts and the texts for the place
    document.querySelectorAll('[data-bg-only]').forEach(node => { node.hidden = !bulgaria; });
    document.querySelectorAll('[data-other-only]').forEach(node => { node.hidden = bulgaria; });
    if (!bulgaria) {
      const eclipse = document.getElementById('skyEclipseGeneric');
      if (eclipse) eclipse.textContent = t.eclipse(name);
      const aurora = document.getElementById('skyAuroraGeneric');
      if (aurora) {
        const latitude = `${Math.abs(place.latitude).toFixed(0)}°${place.latitude < 0 ? t.s : t.n}`;
        aurora.textContent = t.aurora(name, latitude, PlaceContext.auroraBand(place).level, place.latitude < 0 ? t.south : t.north);
      }
    }
    const forecast = `/weather/?city=${encodeURIComponent(name)}&lat=${place.latitude.toFixed(4)}&lon=${place.longitude.toFixed(4)}${place.countryCode ? '&cc=' + place.countryCode : ''}`;
    [['skyAuroraH', 'aurora', country], ['skyEclipseH', 'eclipse', country]].forEach(([id, key, value]) => {
      const node = document.getElementById(id);
      if (!node) return;
      const original = remember(node, 'text', node.textContent);
      node.textContent = bulgaria ? original : H[lang][key](value);
    });
    const weatherLink = document.getElementById('skyWeatherLink');
    if (weatherLink) {
      const original = { text: remember(weatherLink, 'text', weatherLink.textContent), href: remember(weatherLink, 'href', weatherLink.getAttribute('href')) };
      weatherLink.textContent = bulgaria ? original.text : H[lang].weather(name);
      weatherLink.setAttribute('href', bulgaria ? original.href : forecast);
    }
    const sun = document.getElementById('skySunLink');
    if (sun) {
      const original = { text: remember(sun, 'text', sun.textContent), href: remember(sun, 'href', sun.getAttribute('href')) };
      if (bulgaria) { sun.textContent = original.text; sun.setAttribute('href', original.href); }
      else {
        sun.textContent = t.sun(name);
        sun.setAttribute('href', forecast);
      }
    }
    buildBar(lang, place, bulgaria ? 'Europe/Sofia' : zone);
  }

  function buildBar(lang, place, zone) {
    const t = D[lang];
    const code = place.isDefault ? 'BG' : place.countryCode;
    const codes = Object.keys(places);
    if (code && !codes.includes(code)) codes.push(code);
    const options = codes.map(c => ({ code: c, name: PlaceContext.countryName(c, lang) })).sort((a, b) => a.name.localeCompare(b.name, LOCALES[lang]));
    bar.innerHTML = `<label>${t.label} <select id="skyCountry" style="padding:6px 10px;border-radius:8px;border:1px solid var(--card-border,#555);background:var(--card-bg,#16213e);color:inherit;font:inherit">${options.map(o => `<option value="${o.code}"${o.code === code ? ' selected' : ''}>${o.name}</option>`).join('')}</select></label> <span class="holiday-note">${t.hint} (${zone})</span>`;
    bar.querySelector('select').addEventListener('change', async event => {
      if (await PlaceContext.setCountry(event.target.value)) {
        document.dispatchEvent(new Event('placechange'));
        apply();
      }
    });
  }

  PlaceContext.destinations().then(all => { places = all; apply(); });
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') apply(); });
})();
