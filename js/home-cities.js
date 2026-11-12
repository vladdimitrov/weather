// Home page: the "weather in cities" block shows the main cities of the country of the
// visitor's place (/js/place-context.js) instead of always the Bulgarian ones. For Bulgaria
// (or a first visit) the static block of the page stays. City links open the forecast page;
// "all cities" opens the /europe/ page of the country when there is one.
(function () {
  const section = document.querySelector('.home-cities');
  if (!section || typeof PlaceContext === 'undefined') return;
  const place = PlaceContext.get();

  // Bulgaria (or a first visit): the static block of the page has Cyrillic names, and links to the
  // Bulgarian pages. In the other languages the names are written in Latin and the links open
  // the translated city pages.
  if (place.isDefault || !place.countryCode || place.countryCode === 'BG') {
    const LATIN = { sofia: 'Sofia', plovdiv: 'Plovdiv', varna: 'Varna', burgas: 'Burgas', ruse: 'Ruse', 'stara-zagora': 'Stara Zagora', pleven: 'Pleven', 'veliko-tarnovo': 'Veliko Tarnovo', blagoevgrad: 'Blagoevgrad', bansko: 'Bansko' };
    const LATIN_ES = { sofia: 'Sofía' };
    const cityLinks = [...section.querySelectorAll('.city-links a[href^="vremeto/"]')].filter(a => /^vremeto\/[^/]+\/$/.test(a.getAttribute('href')));
    const original = cityLinks.map(a => ({ text: a.textContent, href: a.getAttribute('href') }));
    const translate = () => {
      const lang = PlaceContext.language();
      cityLinks.forEach((a, i) => {
        const slug = original[i].href.split('/')[1];
        if (lang === 'bg') {
          a.textContent = original[i].text;
          a.setAttribute('href', original[i].href);
        } else {
          a.textContent = (lang === 'es' && LATIN_ES[slug]) || LATIN[slug] || original[i].text;
          a.setAttribute('href', `/${lang}/${original[i].href}`);
        }
      });
    };
    translate();
    document.addEventListener('change', event => { if (event.target && event.target.id === 'language') setTimeout(translate, 0); });
    return;
  }

  const T = {
    bg: { cities: 'Времето в градовете', all: 'Всички градове →', holidays: 'Календар на празниците' },
    en: { cities: 'Weather in cities', all: 'All cities →', holidays: 'Holiday calendar' },
    de: { cities: 'Wetter in Städten', all: 'Alle Städte →', holidays: 'Feiertagskalender' },
    it: { cities: 'Meteo nelle città', all: 'Tutte le città →', holidays: 'Calendario delle festività' },
    es: { cities: 'El tiempo en ciudades', all: 'Todas las ciudades →', holidays: 'Calendario de festivos' }
  };
  const title = section.querySelector('h2');
  const links = section.querySelector('.city-links');
  const holidays = section.querySelector('a[data-nav="holidaysBg"]');
  let data = null;

  function render() {
    if (!data) return;
    const lang = PlaceContext.language();
    const t = T[lang];
    const list = data.destinations[place.countryCode] || [];
    if (!list.length) return;
    title.removeAttribute('data-nav');
    title.textContent = `${t.cities}: ${PlaceContext.countryName(place.countryCode, lang)}`;
    const items = list.slice(0, 10).map(item => {
      const name = item.name[lang] || item.name.en;
      const query = new URLSearchParams({ city: name, lat: item.latitude.toFixed(4), lon: item.longitude.toFixed(4), cc: place.countryCode });
      return `<a href="/weather/?${query}" class="recent-place">${name}</a>`;
    });
    const slug = data.slugs[place.countryCode];
    if (slug) items.push(`<a href="${lang === 'bg' ? '' : '/' + lang}/europe/${slug}/" class="recent-place">${t.all}</a>`);
    links.innerHTML = items.join('\n        ');
    if (holidays) {
      holidays.removeAttribute('data-nav');
      holidays.textContent = t.holidays;
      holidays.setAttribute('href', '/holliday_calendar/');
    }
  }

  Promise.all([PlaceContext.destinations(), fetch('/js/europe-countries.json').then(r => r.json()).catch(() => ({}))]).then(([destinations, slugs]) => {
    data = { destinations, slugs };
    render();
  });
  // the page translates its own texts first, then this block
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') setTimeout(render, 0); });
})();
