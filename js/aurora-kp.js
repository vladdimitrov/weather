// /nebeto/: the planetary Kp index now (NOAA SWPC) and what it means for seeing the northern
// lights from the visitor's place (/js/place-context.js: Sofia, or the place picked on the
// forecast page). At Bulgarian latitudes practically only Kp 7 and above counts.
(function () {
  const target = document.getElementById('auroraKp');
  if (!target) return;
  const URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
  // {place} is the name of the place, {dir} north (south in the southern hemisphere)
  const T = {
    bg: { now: 'Kp сега', low: 'За {place} сиянието е практически невъзможно сега.', mid: 'Сияние е възможно само далеч към {dir}, не над {place}.', high: 'За {place} сияние е възможно: ясно небе, тъмно място, поглед към {dir}.', error: 'Текущият Kp не може да се зареди.', north: 'север', south: 'юг' },
    en: { now: 'Kp now', low: 'For {place} an aurora is practically impossible now.', mid: 'An aurora is possible only far to the {dir}, not over {place}.', high: 'An aurora may be visible from {place}: clear sky, dark place, look {dir}.', error: 'Could not load the current Kp.', north: 'north', south: 'south' },
    de: { now: 'Kp aktuell', low: 'Für {place} sind Polarlichter jetzt praktisch unmöglich.', mid: 'Polarlichter sind nur weit im {dir} möglich, nicht über {place}.', high: 'Polarlichter könnten von {place} aus sichtbar sein: klarer Himmel, dunkler Ort, Blick nach {dir}.', error: 'Der aktuelle Kp konnte nicht geladen werden.', north: 'Norden', south: 'Süden' },
    it: { now: 'Kp ora', low: 'Per {place} l’aurora è ora praticamente impossibile.', mid: 'L’aurora è possibile solo molto a {dir}, non su {place}.', high: 'L’aurora potrebbe essere visibile da {place}: cielo sereno, luogo buio, guardare a {dir}.', error: 'Impossibile caricare il Kp attuale.', north: 'nord', south: 'sud' },
    es: { now: 'Kp ahora', low: 'Para {place} la aurora es ahora prácticamente imposible.', mid: 'La aurora solo es posible muy al {dir}, no sobre {place}.', high: 'La aurora podría verse desde {place}: cielo despejado, lugar oscuro, mirar al {dir}.', error: 'No se pudo cargar el Kp actual.', north: 'norte', south: 'sur' }
  };
  let kp = null;
  let place = null;
  let list = [];

  function render() {
    const lang = PlaceContext.language();
    const text = T[lang];
    if (kp === null) { target.textContent = text.error; return; }
    const band = PlaceContext.auroraBand(place);
    const name = PlaceContext.placeName(place, lang, list[place.countryCode]) || PlaceContext.countryName(place.countryCode, lang);
    const message = kp >= band.kpMin ? text.high : kp >= band.kpMin - 2 ? text.mid : text.low;
    target.textContent = `${text.now}: ${kp.toFixed(1)} – ${message.replace(/\{place\}/g, name).replace(/\{dir\}/g, place.latitude < 0 ? text.south : text.north)}`;
  }

  place = PlaceContext.get();
  PlaceContext.destinations().then(all => { list = all; });
  fetch(URL).then(r => r.json()).then(data => {
    const last = data[data.length - 1];
    kp = parseFloat(last.estimated_kp ?? last.kp_index);
    return PlaceContext.destinations();
  }).then(all => { list = all; render(); }).catch(() => render());
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') render(); });
  // the place changed in /js/sky-local.js
  document.addEventListener('placechange', () => { place = PlaceContext.get(); render(); });
})();
