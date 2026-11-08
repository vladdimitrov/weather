// /nebeto/: the planetary Kp index now (NOAA SWPC) and what it means for seeing
// the northern lights from Bulgaria (practically only at Kp 7 and above).
(function () {
  const target = document.getElementById('auroraKp');
  if (!target) return;
  const URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
  const T = {
    bg: { now: 'Kp сега', low: 'Сияние от България е практически невъзможно.', mid: 'Сияние е възможно само далеч на север, не над България.', high: 'Сияние от България е възможно: ясно небе, тъмно място, поглед на север.', error: 'Текущият Kp не може да се зареди.' },
    en: { now: 'Kp now', low: 'Aurora is practically impossible from Bulgaria.', mid: 'Aurora is possible only far to the north, not over Bulgaria.', high: 'Aurora may be visible from Bulgaria: clear sky, dark place, look north.', error: 'Could not load the current Kp.' },
    de: { now: 'Kp aktuell', low: 'Polarlichter sind von Bulgarien aus praktisch unmöglich.', mid: 'Polarlichter sind nur weit im Norden möglich, nicht über Bulgarien.', high: 'Polarlichter könnten von Bulgarien aus sichtbar sein: klarer Himmel, dunkler Ort, Blick nach Norden.', error: 'Der aktuelle Kp konnte nicht geladen werden.' },
    it: { now: 'Kp ora', low: 'L’aurora è praticamente impossibile dalla Bulgaria.', mid: 'L’aurora è possibile solo molto a nord, non sulla Bulgaria.', high: 'L’aurora potrebbe essere visibile dalla Bulgaria: cielo sereno, luogo buio, guardare a nord.', error: 'Impossibile caricare il Kp attuale.' },
    es: { now: 'Kp ahora', low: 'La aurora es prácticamente imposible desde Bulgaria.', mid: 'La aurora solo es posible muy al norte, no sobre Bulgaria.', high: 'La aurora podría verse desde Bulgaria: cielo despejado, lugar oscuro, mirar al norte.', error: 'No se pudo cargar el Kp actual.' }
  };
  let kp = null;

  function render() {
    const text = T[document.documentElement.lang] || T.bg;
    if (kp === null) { target.textContent = text.error; return; }
    target.textContent = `${text.now}: ${kp.toFixed(1)} – ${kp >= 7 ? text.high : kp >= 5 ? text.mid : text.low}`;
  }

  fetch(URL).then(r => r.json()).then(data => {
    const last = data[data.length - 1];
    kp = parseFloat(last.estimated_kp ?? last.kp_index);
    render();
  }).catch(() => render());
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') render(); });
})();
