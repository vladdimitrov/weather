// /luna/: the Moon today (the drawn Moon, illumination, age, distance, the next phases and
// the next 14 days), computed in the browser with /js/moon.js and drawn by /js/moon-view.js.
// The page already contains the same block for the day it was built; this script replaces
// it with the values of now, in the time zone of the visitor or of the picked place.
(function () {
  const target = document.getElementById('moonToday');
  if (!target || typeof Moon === 'undefined' || typeof MoonView === 'undefined') return;

  // Time zone: the browser's, or that of the place picked on the forecast page (/js/place-context.js)
  let zone;

  // Moonrise and moonset are for the picked place (Sofia by default), in that place's time zone
  let skyPlace = null;
  function render() {
    target.innerHTML = MoonView.today(document.documentElement.lang, new Date(), zone, skyPlace);
  }

  function useZone() {
    if (typeof PlaceContext === 'undefined') return;
    const place = PlaceContext.get();
    if (place.isDefault) { zone = undefined; skyPlace = null; render(); return; }
    PlaceContext.timeZone(place).then(value => {
      zone = value;
      skyPlace = { latitude: place.latitude, longitude: place.longitude, name: place.name, zone: value };
      render();
    });
  }

  // Share: the system share sheet where there is one, else the link is copied
  const share = document.getElementById('moonShare');
  if (share) {
    const label = share.textContent;
    share.addEventListener('click', async () => {
      const url = location.origin + location.pathname;
      if (navigator.share) {
        try { await navigator.share({ title: document.title, url }); } catch (e) { /* cancelled */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        share.textContent = share.dataset.copied || '✓';
        setTimeout(() => { share.textContent = label; }, 2000);
      } catch (e) {
        window.prompt('', url);
      }
    });
  }

  render();
  useZone();
  document.addEventListener('placechange', useZone);
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') render(); });
})();
