// Texts of the single full-moon pages (/luna/pylnolunie/<date>/), in the seven languages
// (bg, en, de, it, es, fr, nl). Used by build-luna.js. Change the seven languages together.
// c = { date, weekday, time, utc, km, rise, set, sunset, super, blue, prev, next }
// All times in the sentences are Sofia time, as on the rest of the Moon calendar.
module.exports = {
  FULLMOON: {
    bg: {
      title: c => `Пълнолуние на ${c.date}${c.super ? ' – суперлуна' : ''}: час, изгрев и къде да гледаме`,
      h1: c => `Пълнолуние на ${c.date}`,
      description: c => `Пълнолунието е на ${c.date} в ${c.time} ч. българско време (${c.utc} UTC). Изгрев на Луната в ${c.rise} ч., разстояние ${c.km} км${c.super ? ', суперлуна' : ''}.`,
      intro: c => `Пълнолунието е на ${c.weekday}, ${c.date}, в ${c.time} ч. българско време (${c.utc} UTC). В този момент Луната е точно срещу Слънцето и осветеността ѝ е близо 100%. Тя е на ${c.km} км от Земята.`,
      superText: 'Това е суперлуна: пълнолуние, при което Луната е сред най-близките си до Земята. Дискът изглежда малко по-голям и по-ярък, но разликата е трудно забележима с просто око.',
      blueText: 'Това е синя луна: второто пълнолуние в един и същи календарен месец. Луната не е синя на цвят.',
      timesH: 'Часове за София',
      labels: { time: 'Точен час', distance: 'Разстояние до Луната', lit: 'Осветеност', rise: 'Изгрев на Луната', sunset: 'Залез на Слънцето', set: 'Залез на Луната (на следващата сутрин)' },
      km: 'км',
      watchH: 'Кога и къде да гледаме',
      watch: c => `Пълнолунието изгрява около залеза на Слънцето: тази вечер в ${c.rise} ч. над източния хоризонт, докато Слънцето залязва в ${c.sunset} ч. Най-красива е Луната, когато е ниско над хоризонта, затова гледайте от открито място с чист изглед на изток. Луната залязва на другата сутрин в ${c.set} ч. Часовете са за София; в други градове се различават с минути.`,
      faqH: 'Често задавани въпроси',
      faq: c => [
        [`Кога е пълнолунието на ${c.date}?`, `Точно в ${c.time} ч. българско време, ${c.weekday}, ${c.date} (${c.utc} UTC).`],
        [`Суперлуна ли е пълнолунието на ${c.date}?`, c.super ? 'Да, Луната е сред най-близките си до Земята.' : 'Не, това е обикновено пълнолуние.'],
        ['Кога е следващото пълнолуние?', c.next ? `Следващото пълнолуние е на ${c.next}.` : 'Вижте списъка с пълнолуниета.']
      ],
      prev: 'Предишно пълнолуние', next: 'Следващо пълнолуние', all: y => `Всички пълнолуния през ${y} г.`
    },
    en: {
      title: c => `Full moon on ${c.date}${c.super ? ' (supermoon)' : ''}: time, moonrise and where to watch`,
      h1: c => `Full moon on ${c.date}`,
      description: c => `The full moon is on ${c.date} at ${c.time} Sofia time (${c.utc} UTC). Moonrise ${c.rise}, distance ${c.km} km${c.super ? ', a supermoon' : ''}.`,
      intro: c => `The full moon falls on ${c.weekday}, ${c.date}, at ${c.time} Sofia time (${c.utc} UTC). At that moment the Moon is exactly opposite the Sun and almost 100% lit. It is ${c.km} km from Earth.`,
      superText: 'This is a supermoon: a full moon when the Moon is among its closest to Earth. The disc looks slightly bigger and brighter, though the difference is hard to notice by eye.',
      blueText: 'This is a blue moon: the second full moon in one calendar month. The Moon does not turn blue.',
      timesH: 'Times for Sofia',
      labels: { time: 'Exact time', distance: 'Distance to the Moon', lit: 'Illumination', rise: 'Moonrise', sunset: 'Sunset', set: 'Moonset (next morning)' },
      km: 'km',
      watchH: 'When and where to watch',
      watch: c => `The full moon rises around sunset: this evening at ${c.rise} over the eastern horizon, while the Sun sets at ${c.sunset}. The Moon looks best low over the horizon, so watch from an open place with a clear view east. It sets the next morning at ${c.set}. Times are for Sofia; other cities differ by a few minutes.`,
      faqH: 'Frequently asked questions',
      faq: c => [
        [`When is the full moon on ${c.date}?`, `Exactly at ${c.time} Sofia time on ${c.weekday}, ${c.date} (${c.utc} UTC).`],
        [`Is the full moon on ${c.date} a supermoon?`, c.super ? 'Yes, the Moon is among its closest to Earth.' : 'No, it is an ordinary full moon.'],
        ['When is the next full moon?', c.next ? `The next full moon is on ${c.next}.` : 'See the list of full moons.']
      ],
      prev: 'Previous full moon', next: 'Next full moon', all: y => `All full moons in ${y}`
    },
    de: {
      title: c => `Vollmond am ${c.date}${c.super ? ' (Supermond)' : ''}: Uhrzeit, Mondaufgang und Beobachtung`,
      h1: c => `Vollmond am ${c.date}`,
      description: c => `Der Vollmond ist am ${c.date} um ${c.time} Uhr Sofioter Zeit (${c.utc} UTC). Mondaufgang ${c.rise} Uhr, Entfernung ${c.km} km${c.super ? ', ein Supermond' : ''}.`,
      intro: c => `Der Vollmond fällt auf ${c.weekday}, den ${c.date}, um ${c.time} Uhr Sofioter Zeit (${c.utc} UTC). In diesem Moment steht der Mond genau gegenüber der Sonne und ist fast zu 100 % beleuchtet. Er ist ${c.km} km von der Erde entfernt.`,
      superText: 'Das ist ein Supermond: ein Vollmond, bei dem der Mond der Erde besonders nah ist. Die Scheibe wirkt etwas größer und heller, der Unterschied ist mit bloßem Auge aber schwer zu sehen.',
      blueText: 'Das ist ein Blauer Mond: der zweite Vollmond in einem Kalendermonat. Der Mond wird dabei nicht blau.',
      timesH: 'Zeiten für Sofia',
      labels: { time: 'Genaue Zeit', distance: 'Entfernung zum Mond', lit: 'Beleuchtung', rise: 'Mondaufgang', sunset: 'Sonnenuntergang', set: 'Monduntergang (am nächsten Morgen)' },
      km: 'km',
      watchH: 'Wann und wo beobachten',
      watch: c => `Der Vollmond geht etwa bei Sonnenuntergang auf: heute Abend um ${c.rise} Uhr über dem östlichen Horizont, während die Sonne um ${c.sunset} Uhr untergeht. Tief am Horizont wirkt der Mond am schönsten, am besten also von einem offenen Ort mit freier Sicht nach Osten. Er geht am nächsten Morgen um ${c.set} Uhr unter. Die Zeiten gelten für Sofia, andere Städte weichen um wenige Minuten ab.`,
      faqH: 'Häufige Fragen',
      faq: c => [
        [`Wann ist der Vollmond am ${c.date}?`, `Genau um ${c.time} Uhr Sofioter Zeit, ${c.weekday}, ${c.date} (${c.utc} UTC).`],
        [`Ist der Vollmond am ${c.date} ein Supermond?`, c.super ? 'Ja, der Mond ist der Erde besonders nah.' : 'Nein, es ist ein gewöhnlicher Vollmond.'],
        ['Wann ist der nächste Vollmond?', c.next ? `Der nächste Vollmond ist am ${c.next}.` : 'Siehe die Liste der Vollmonde.']
      ],
      prev: 'Voriger Vollmond', next: 'Nächster Vollmond', all: y => `Alle Vollmonde ${y}`
    },
    it: {
      title: c => `Luna piena del ${c.date}${c.super ? ' (superluna)' : ''}: orario, sorgere e dove guardarla`,
      h1: c => `Luna piena del ${c.date}`,
      description: c => `La luna piena è il ${c.date} alle ${c.time}, ora di Sofia (${c.utc} UTC). Sorgere alle ${c.rise}, distanza ${c.km} km${c.super ? ', una superluna' : ''}.`,
      intro: c => `La luna piena cade ${c.weekday} ${c.date} alle ${c.time}, ora di Sofia (${c.utc} UTC). In quel momento la Luna è esattamente opposta al Sole e illuminata quasi al 100%. Dista ${c.km} km dalla Terra.`,
      superText: 'È una superluna: una luna piena in cui la Luna è tra le più vicine alla Terra. Il disco appare un po’ più grande e luminoso, ma la differenza si nota poco a occhio nudo.',
      blueText: 'È una luna blu: la seconda luna piena nello stesso mese. La Luna non diventa blu.',
      timesH: 'Orari per Sofia',
      labels: { time: 'Orario esatto', distance: 'Distanza dalla Luna', lit: 'Illuminazione', rise: 'Sorgere della Luna', sunset: 'Tramonto del Sole', set: 'Tramonto della Luna (mattina dopo)' },
      km: 'km',
      watchH: 'Quando e dove guardarla',
      watch: c => `La luna piena sorge intorno al tramonto: stasera alle ${c.rise} sull’orizzonte orientale, mentre il Sole tramonta alle ${c.sunset}. Dà il meglio vicino all’orizzonte: guardatela da un luogo aperto con vista libera a est. Tramonta la mattina dopo alle ${c.set}. Gli orari valgono per Sofia; altre città differiscono di qualche minuto.`,
      faqH: 'Domande frequenti',
      faq: c => [
        [`Quando è la luna piena del ${c.date}?`, `Esattamente alle ${c.time}, ora di Sofia, ${c.weekday} ${c.date} (${c.utc} UTC).`],
        [`La luna piena del ${c.date} è una superluna?`, c.super ? 'Sì, la Luna è tra le più vicine alla Terra.' : 'No, è una luna piena ordinaria.'],
        ['Quando è la prossima luna piena?', c.next ? `La prossima luna piena è il ${c.next}.` : 'Vedi l’elenco delle lune piene.']
      ],
      prev: 'Luna piena precedente', next: 'Luna piena successiva', all: y => `Tutte le lune piene del ${y}`
    },
    es: {
      title: c => `Luna llena el ${c.date}${c.super ? ' (superluna)' : ''}: hora, salida de la Luna y dónde verla`,
      h1: c => `Luna llena el ${c.date}`,
      description: c => `La luna llena es el ${c.date} a las ${c.time}, hora de Sofía (${c.utc} UTC). Salida a las ${c.rise}, distancia ${c.km} km${c.super ? ', una superluna' : ''}.`,
      intro: c => `La luna llena cae el ${c.weekday} ${c.date} a las ${c.time}, hora de Sofía (${c.utc} UTC). En ese momento la Luna está justo frente al Sol e iluminada casi al 100 %. Está a ${c.km} km de la Tierra.`,
      superText: 'Es una superluna: una luna llena en la que la Luna está entre las más cercanas a la Tierra. El disco parece algo mayor y más brillante, aunque a simple vista apenas se nota.',
      blueText: 'Es una luna azul: la segunda luna llena del mismo mes. La Luna no se ve azul.',
      timesH: 'Horas para Sofía',
      labels: { time: 'Hora exacta', distance: 'Distancia a la Luna', lit: 'Iluminación', rise: 'Salida de la Luna', sunset: 'Puesta del Sol', set: 'Puesta de la Luna (a la mañana siguiente)' },
      km: 'km',
      watchH: 'Cuándo y dónde verla',
      watch: c => `La luna llena sale hacia la puesta del Sol: esta tarde a las ${c.rise} por el horizonte este, mientras el Sol se pone a las ${c.sunset}. Luce mejor cerca del horizonte: obsérvela desde un lugar abierto con vista despejada al este. Se pone a la mañana siguiente a las ${c.set}. Las horas son para Sofía; en otras ciudades varían unos minutos.`,
      faqH: 'Preguntas frecuentes',
      faq: c => [
        [`¿Cuándo es la luna llena del ${c.date}?`, `Exactamente a las ${c.time}, hora de Sofía, el ${c.weekday} ${c.date} (${c.utc} UTC).`],
        [`¿Es una superluna la luna llena del ${c.date}?`, c.super ? 'Sí, la Luna está entre las más cercanas a la Tierra.' : 'No, es una luna llena normal.'],
        ['¿Cuándo es la próxima luna llena?', c.next ? `La próxima luna llena es el ${c.next}.` : 'Consulte la lista de lunas llenas.']
      ],
      prev: 'Luna llena anterior', next: 'Próxima luna llena', all: y => `Todas las lunas llenas de ${y}`
    },
    fr: {
      title: c => `Pleine lune du ${c.date}${c.super ? ' (super-lune)' : ''} : heure, lever de la Lune et où l’observer`,
      h1: c => `Pleine lune du ${c.date}`,
      description: c => `La pleine lune a lieu le ${c.date} à ${c.time}, heure de Sofia (${c.utc} UTC). Lever à ${c.rise}, distance ${c.km} km${c.super ? ', une super-lune' : ''}.`,
      intro: c => `La pleine lune tombe le ${c.weekday} ${c.date} à ${c.time}, heure de Sofia (${c.utc} UTC). À cet instant, la Lune est exactement à l’opposé du Soleil et éclairée à près de 100 %. Elle est à ${c.km} km de la Terre.`,
      superText: 'C’est une super-lune : une pleine lune où la Lune est parmi les plus proches de la Terre. Le disque paraît un peu plus grand et plus brillant, mais la différence se remarque peu à l’œil nu.',
      blueText: 'C’est une lune bleue : la deuxième pleine lune d’un même mois. La Lune ne devient pas bleue.',
      timesH: 'Heures pour Sofia',
      labels: { time: 'Heure exacte', distance: 'Distance à la Lune', lit: 'Illumination', rise: 'Lever de la Lune', sunset: 'Coucher du Soleil', set: 'Coucher de la Lune (le lendemain matin)' },
      km: 'km',
      watchH: 'Quand et où l’observer',
      watch: c => `La pleine lune se lève vers le coucher du Soleil : ce soir à ${c.rise} à l’horizon est, tandis que le Soleil se couche à ${c.sunset}. Elle est plus belle près de l’horizon : observez-la depuis un lieu dégagé avec vue vers l’est. Elle se couche le lendemain matin à ${c.set}. Les heures valent pour Sofia ; ailleurs, elles varient de quelques minutes.`,
      faqH: 'Questions fréquentes',
      faq: c => [
        [`Quand est la pleine lune du ${c.date} ?`, `Exactement à ${c.time}, heure de Sofia, le ${c.weekday} ${c.date} (${c.utc} UTC).`],
        [`La pleine lune du ${c.date} est-elle une super-lune ?`, c.super ? 'Oui, la Lune est parmi les plus proches de la Terre.' : 'Non, c’est une pleine lune ordinaire.'],
        ['Quand est la prochaine pleine lune ?', c.next ? `La prochaine pleine lune est le ${c.next}.` : 'Voir la liste des pleines lunes.']
      ],
      prev: 'Pleine lune précédente', next: 'Pleine lune suivante', all: y => `Toutes les pleines lunes de ${y}`
    },
    nl: {
      title: c => `Volle maan op ${c.date}${c.super ? ' (supermaan)' : ''}: tijd, maanopkomst en waar te kijken`,
      h1: c => `Volle maan op ${c.date}`,
      description: c => `De volle maan is op ${c.date} om ${c.time}, Sofiase tijd (${c.utc} UTC). Maanopkomst ${c.rise}, afstand ${c.km} km${c.super ? ', een supermaan' : ''}.`,
      intro: c => `De volle maan valt op ${c.weekday} ${c.date} om ${c.time}, Sofiase tijd (${c.utc} UTC). Op dat moment staat de maan precies tegenover de zon en is bijna 100% verlicht. Ze staat ${c.km} km van de aarde.`,
      superText: 'Dit is een supermaan: een volle maan waarbij de maan tot de dichtstbijzijnde van de aarde hoort. De schijf lijkt iets groter en helderder, al is het verschil met het blote oog moeilijk te zien.',
      blueText: 'Dit is een blauwe maan: de tweede volle maan in één kalendermaand. De maan wordt niet blauw.',
      timesH: 'Tijden voor Sofia',
      labels: { time: 'Exacte tijd', distance: 'Afstand tot de maan', lit: 'Verlichting', rise: 'Maanopkomst', sunset: 'Zonsondergang', set: 'Maanondergang (de volgende ochtend)' },
      km: 'km',
      watchH: 'Wanneer en waar kijken',
      watch: c => `De volle maan komt rond zonsondergang op: vanavond om ${c.rise} boven de oostelijke horizon, terwijl de zon om ${c.sunset} ondergaat. Ze oogt het mooist laag boven de horizon, dus kijk vanaf een open plek met vrij uitzicht op het oosten. De maan gaat de volgende ochtend om ${c.set} onder. De tijden gelden voor Sofia; andere steden verschillen enkele minuten.`,
      faqH: 'Veelgestelde vragen',
      faq: c => [
        [`Wanneer is de volle maan op ${c.date}?`, `Precies om ${c.time}, Sofiase tijd, op ${c.weekday} ${c.date} (${c.utc} UTC).`],
        [`Is de volle maan op ${c.date} een supermaan?`, c.super ? 'Ja, de maan hoort tot de dichtstbijzijnde van de aarde.' : 'Nee, het is een gewone volle maan.'],
        ['Wanneer is de volgende volle maan?', c.next ? `De volgende volle maan is op ${c.next}.` : 'Zie de lijst met volle manen.']
      ],
      prev: 'Vorige volle maan', next: 'Volgende volle maan', all: y => `Alle volle manen in ${y}`
    }
  }
};
