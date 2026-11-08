// /luna/: the Moon today (phase, illuminated part, next full and new moon),
// computed in the browser with /js/moon.js. The page already contains the same
// block for the day it was built; this script replaces it with today's values.
(function () {
  const target = document.getElementById('moonToday');
  if (!target || typeof Moon === 'undefined') return;

  const ICONS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const LOCALES = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES' };
  const T = {
    bg: {
      names: ['Новолуние', 'Растящ сърп', 'Първа четвърт', 'Растяща луна', 'Пълнолуние', 'Намаляваща луна', 'Последна четвърт', 'Намаляващ сърп'],
      lit: 'осветена част', nextFull: 'Следващо пълнолуние', nextNew: 'Следващо новолуние', waxing: 'Луната расте', waning: 'Луната намалява'
    },
    en: {
      names: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],
      lit: 'illuminated', nextFull: 'Next full moon', nextNew: 'Next new moon', waxing: 'The Moon is waxing', waning: 'The Moon is waning'
    },
    de: {
      names: ['Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel'],
      lit: 'beleuchtet', nextFull: 'Nächster Vollmond', nextNew: 'Nächster Neumond', waxing: 'Der Mond nimmt zu', waning: 'Der Mond nimmt ab'
    },
    it: {
      names: ['Luna nuova', 'Luna crescente (falce)', 'Primo quarto', 'Gibbosa crescente', 'Luna piena', 'Gibbosa calante', 'Ultimo quarto', 'Luna calante (falce)'],
      lit: 'illuminata', nextFull: 'Prossima luna piena', nextNew: 'Prossima luna nuova', waxing: 'La Luna è crescente', waning: 'La Luna è calante'
    },
    es: {
      names: ['Luna nueva', 'Luna creciente', 'Cuarto creciente', 'Gibosa creciente', 'Luna llena', 'Gibosa menguante', 'Cuarto menguante', 'Luna menguante'],
      lit: 'iluminada', nextFull: 'Próxima luna llena', nextNew: 'Próxima luna nueva', waxing: 'La Luna está creciente', waning: 'La Luna está menguante'
    }
  };

  function render() {
    const language = T[document.documentElement.lang] ? document.documentElement.lang : 'en';
    const text = T[language];
    const now = new Date();
    const state = Moon.state(now);
    const date = value => value.toLocaleDateString(LOCALES[language], { day: 'numeric', month: 'long', year: 'numeric' });
    const time = value => value.toLocaleTimeString(LOCALES[language], { hour: '2-digit', minute: '2-digit' });
    const full = Moon.nextPhase(now, 2);
    const fresh = Moon.nextPhase(now, 0);
    target.innerHTML = `
      <div class="moon-today-icon" style="font-size:4rem;line-height:1">${ICONS[state.index]}</div>
      <div>
        <h2 style="margin:0">${text.names[state.index]}</h2>
        <p>${Math.round(state.fraction * 100)}% ${text.lit} · ${state.waxing ? text.waxing : text.waning}</p>
        <p>${text.nextFull}: <strong>${date(full)}</strong>, ${time(full)}<br>${text.nextNew}: <strong>${date(fresh)}</strong>, ${time(fresh)}</p>
      </div>`;
  }

  render();
  document.addEventListener('change', event => { if (event.target && event.target.id === 'language') render(); });
})();
