// /luna/: the Moon today (the drawn Moon, illumination, age, distance, the next phases and
// the next 14 days), computed in the browser with /js/moon.js and drawn by /js/moon-view.js.
// The page already contains the same block for the day it was built; this script replaces
// it with the values of now, in the time zone of the visitor or of the picked place.
(function () {
  const target = document.getElementById('moonToday');
  if (!target || typeof Moon === 'undefined' || typeof MoonView === 'undefined') return;

  // Time zone: the browser's, or that of the place picked on the forecast page (/js/place-context.js)
  let zone;

  function render() {
    target.innerHTML = MoonView.today(document.documentElement.lang, new Date(), zone);
  }

  function useZone() {
    if (typeof PlaceContext === 'undefined') return;
    const place = PlaceContext.get();
    if (place.isDefault) { zone = undefined; render(); return; }
    PlaceContext.timeZone(place).then(value => { zone = value; render(); });
  }

  render();
  useZone();
  document.addEventListener('placechange', useZone);
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') render(); });
})();
