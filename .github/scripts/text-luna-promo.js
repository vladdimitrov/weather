// Texts of the Moon calendar's extra pages and blocks, in the five languages (bg, en, de, it, es):
//   - the list pages "Full moons <year>" and "New moons <year>" (/luna/<year>/pylnolunie/, /novolunie/)
//   - the questions and answers on /luna/ (also written as FAQPage data)
//   - the subscription to the calendar (the .ics file) and the share button
// Used by build-luna.js. Change the five languages together.
module.exports = {
  PROMO: {
    bg: {
      listFull: {
        title: y => `Пълнолуния ${y} – дати и часове`,
        h1: y => `Пълнолуния през ${y} г.`,
        description: (y, n, first) => `Всички пълнолуния през ${y} г.: ${n} дати с точен час по българско време, суперлуни и синя луна. Първото е на ${first}.`,
        intro: c => `През ${c.year} г. има ${c.n} пълнолуния. Първото е на ${c.first}, а последното – на ${c.last}.${c.blue ? ` Второто пълнолуние на ${c.blue} е „синя луна“.` : ''}${c.super ? ` Суперлуни: ${c.super}.` : ''} Часовете са по българско време.`,
        sub: 'Пълнолуние'
      },
      listNew: {
        title: y => `Новолуния ${y} – дати и часове`,
        h1: y => `Новолуния през ${y} г.`,
        description: (y, n, first) => `Всички новолуния през ${y} г.: ${n} дати с точен час по българско време. Първото е на ${first}.`,
        intro: c => `През ${c.year} г. има ${c.n} новолуния. Първото е на ${c.first}, а последното – на ${c.last}. Новолунието е най-тъмната нощ на месеца и най-добрата за наблюдение на звезди и мъглявини. Часовете са по българско време.`,
        sub: 'Новолуние'
      },
      cols: { n: '№', date: 'Дата', day: 'Ден', time: 'Час', distance: 'Разстояние', note: 'Бележка' },
      superMoon: 'суперлуна', blueMoon: 'синя луна', km: 'км',
      otherKind: { full: 'Новолуния', new: 'Пълнолуния' },
      listNote: 'Разстоянието е от центъра на Земята до центъра на Луната в момента на фазата. Изчислено е по алгоритъма на Жан Меюс; часовете са проверени спрямо данните на USNO.',
      faqH: 'Често задавани въпроси за Луната',
      faq: c => [
        ['Кога е следващото пълнолуние и новолуние?', `Следващото пълнолуние е на ${c.full}, а следващото новолуние – на ${c.fresh} (българско време).`],
        ['Колко трае лунният цикъл?', 'От едно новолуние до следващото минават средно 29 дни, 12 часа и 44 минути. Това се нарича синодичен месец. Времето между две новолуния може да е с до няколко часа по-кратко или по-дълго, защото орбитата на Луната е елипса.'],
        ['Защо Луната има фази?', 'Луната не свети сама, а отразява слънчева светлина. Докато обикаля около Земята, от нас се вижда различна част от осветената ѝ половина: от тънък сърп през първа четвърт и пълнолуние до последна четвърт и пак новолуние.'],
        ['Какво е суперлуна?', 'Суперлуна е пълнолуние, което съвпада с перигея – най-близката точка от орбитата на Луната (около 356 000 км, срещу 406 000 км в апогея). Тя изглежда до около 14% по-голяма и 30% по-ярка от най-далечното пълнолуние.'],
        ['Какво е синя луна?', `Синя луна е второто пълнолуние в един календарен месец. Не е синя на цвят. ${c.blue ? `Следващата е на ${c.blue}.` : 'В тези две години няма синя луна.'}`]
      ],
      subscribe: {
        h: 'Лунният календар във вашия календар',
        text: years => `Абонирайте се и всички фази на Луната за ${years} ще са във вашия Google, Apple или Outlook календар – с точния час във вашата часова зона. Календарът се допълва всяка година.`,
        btn: '📅 Абонирай се',
        download: 'Изтегли .ics',
        how: 'Google Календар: „Други календари“ → „От URL“ и поставете адреса:'
      },
      share: { btn: '📤 Сподели', copied: '✓ Линкът е копиран' },
      cal: 'Лунен календар',
      ics: { name: 'Фази на Луната', super: 'суперлуна', blue: 'синя луна' }
    },
    en: {
      listFull: {
        title: y => `Full moons ${y} – dates and times`,
        h1: y => `Full moons in ${y}`,
        description: (y, n, first) => `All full moons in ${y}: ${n} dates with the exact time in Bulgarian time, supermoons and the blue moon. The first is on ${first}.`,
        intro: c => `There are ${c.n} full moons in ${c.year}. The first is on ${c.first} and the last on ${c.last}.${c.blue ? ` The second full moon on ${c.blue} is a "blue moon".` : ''}${c.super ? ` Supermoons: ${c.super}.` : ''} Times are Bulgarian time.`,
        sub: 'Full moon'
      },
      listNew: {
        title: y => `New moons ${y} – dates and times`,
        h1: y => `New moons in ${y}`,
        description: (y, n, first) => `All new moons in ${y}: ${n} dates with the exact time in Bulgarian time. The first is on ${first}.`,
        intro: c => `There are ${c.n} new moons in ${c.year}. The first is on ${c.first} and the last on ${c.last}. The new moon is the darkest night of the month and the best for watching stars and nebulae. Times are Bulgarian time.`,
        sub: 'New moon'
      },
      cols: { n: '#', date: 'Date', day: 'Day', time: 'Time', distance: 'Distance', note: 'Note' },
      superMoon: 'supermoon', blueMoon: 'blue moon', km: 'km',
      otherKind: { full: 'New moons', new: 'Full moons' },
      listNote: 'The distance is from the centre of the Earth to the centre of the Moon at the moment of the phase. Calculated with the algorithm of Jean Meeus; the times are checked against USNO data.',
      faqH: 'Frequently asked questions about the Moon',
      faq: c => [
        ['When is the next full moon and new moon?', `The next full moon is on ${c.full} and the next new moon on ${c.fresh} (Bulgarian time).`],
        ['How long is the lunar cycle?', 'From one new moon to the next takes 29 days, 12 hours and 44 minutes on average. This is called the synodic month. The time between two new moons can be a few hours shorter or longer, because the Moon\'s orbit is an ellipse.'],
        ['Why does the Moon have phases?', 'The Moon does not shine by itself, it reflects sunlight. As it goes around the Earth, a different part of its lit half is seen from here: from a thin crescent through the first quarter and the full moon to the last quarter and the new moon again.'],
        ['What is a supermoon?', 'A supermoon is a full moon that coincides with perigee, the closest point of the Moon\'s orbit (about 356,000 km, against 406,000 km at apogee). It looks up to about 14% larger and 30% brighter than the farthest full moon.'],
        ['What is a blue moon?', `A blue moon is the second full moon in one calendar month. It is not blue in colour. ${c.blue ? `The next one is on ${c.blue}.` : 'There is no blue moon in these two years.'}`]
      ],
      subscribe: {
        h: 'The Moon calendar in your calendar',
        text: years => `Subscribe and all phases of the Moon for ${years} will be in your Google, Apple or Outlook calendar, at the exact time in your time zone. The calendar is extended every year.`,
        btn: '📅 Subscribe',
        download: 'Download .ics',
        how: 'Google Calendar: "Other calendars" → "From URL" and paste the address:'
      },
      share: { btn: '📤 Share', copied: '✓ Link copied' },
      cal: 'Moon calendar',
      ics: { name: 'Moon phases', super: 'supermoon', blue: 'blue moon' }
    },
    de: {
      listFull: {
        title: y => `Vollmond ${y} – Termine und Uhrzeiten`,
        h1: y => `Vollmond-Termine ${y}`,
        description: (y, n, first) => `Alle Vollmonde ${y}: ${n} Termine mit genauer Uhrzeit in bulgarischer Zeit, Supermonde und der Blaue Mond. Der erste ist am ${first}.`,
        intro: c => `${c.year} gibt es ${c.n} Vollmonde. Der erste ist am ${c.first}, der letzte am ${c.last}.${c.blue ? ` Der zweite Vollmond am ${c.blue} ist ein „Blauer Mond“.` : ''}${c.super ? ` Supermonde: ${c.super}.` : ''} Die Zeiten gelten in bulgarischer Zeit.`,
        sub: 'Vollmond'
      },
      listNew: {
        title: y => `Neumond ${y} – Termine und Uhrzeiten`,
        h1: y => `Neumond-Termine ${y}`,
        description: (y, n, first) => `Alle Neumonde ${y}: ${n} Termine mit genauer Uhrzeit in bulgarischer Zeit. Der erste ist am ${first}.`,
        intro: c => `${c.year} gibt es ${c.n} Neumonde. Der erste ist am ${c.first}, der letzte am ${c.last}. Der Neumond ist die dunkelste Nacht des Monats und die beste zum Beobachten von Sternen und Nebeln. Die Zeiten gelten in bulgarischer Zeit.`,
        sub: 'Neumond'
      },
      cols: { n: 'Nr.', date: 'Datum', day: 'Tag', time: 'Uhrzeit', distance: 'Entfernung', note: 'Hinweis' },
      superMoon: 'Supermond', blueMoon: 'Blauer Mond', km: 'km',
      otherKind: { full: 'Neumond', new: 'Vollmond' },
      listNote: 'Die Entfernung gilt vom Erdmittelpunkt zum Mondmittelpunkt im Moment der Phase. Berechnet mit dem Algorithmus von Jean Meeus; die Zeiten sind mit Daten des USNO abgeglichen.',
      faqH: 'Häufige Fragen zum Mond',
      faq: c => [
        ['Wann ist der nächste Vollmond und Neumond?', `Der nächste Vollmond ist am ${c.full}, der nächste Neumond am ${c.fresh} (bulgarische Zeit).`],
        ['Wie lange dauert der Mondzyklus?', 'Von einem Neumond zum nächsten vergehen im Mittel 29 Tage, 12 Stunden und 44 Minuten. Das ist der synodische Monat. Der Abstand zwischen zwei Neumonden kann einige Stunden kürzer oder länger sein, weil die Bahn des Mondes eine Ellipse ist.'],
        ['Warum hat der Mond Phasen?', 'Der Mond leuchtet nicht selbst, er reflektiert Sonnenlicht. Während er die Erde umkreist, ist von hier aus ein anderer Teil seiner beleuchteten Hälfte zu sehen: von einer schmalen Sichel über das erste Viertel und den Vollmond bis zum letzten Viertel und wieder zum Neumond.'],
        ['Was ist ein Supermond?', 'Ein Supermond ist ein Vollmond, der mit dem Perigäum zusammenfällt, dem erdnächsten Punkt der Mondbahn (etwa 356.000 km, gegenüber 406.000 km im Apogäum). Er wirkt bis zu etwa 14 % größer und 30 % heller als der fernste Vollmond.'],
        ['Was ist ein Blauer Mond?', `Ein Blauer Mond ist der zweite Vollmond in einem Kalendermonat. Er ist nicht blau gefärbt. ${c.blue ? `Der nächste ist am ${c.blue}.` : 'In diesen zwei Jahren gibt es keinen Blauen Mond.'}`]
      ],
      subscribe: {
        h: 'Der Mondkalender in Ihrem Kalender',
        text: years => `Abonnieren Sie ihn, und alle Mondphasen für ${years} erscheinen in Ihrem Google-, Apple- oder Outlook-Kalender, zur genauen Uhrzeit in Ihrer Zeitzone. Der Kalender wird jedes Jahr erweitert.`,
        btn: '📅 Abonnieren',
        download: '.ics herunterladen',
        how: 'Google Kalender: „Weitere Kalender“ → „Per URL“ und die Adresse einfügen:'
      },
      share: { btn: '📤 Teilen', copied: '✓ Link kopiert' },
      cal: 'Mondkalender',
      ics: { name: 'Mondphasen', super: 'Supermond', blue: 'Blauer Mond' }
    },
    it: {
      listFull: {
        title: y => `Luna piena ${y} – date e orari`,
        h1: y => `Date della luna piena nel ${y}`,
        description: (y, n, first) => `Tutte le lune piene del ${y}: ${n} date con l'ora esatta in ora bulgara, le superlune e la luna blu. La prima è il ${first}.`,
        intro: c => `Nel ${c.year} ci sono ${c.n} lune piene. La prima è il ${c.first} e l'ultima il ${c.last}.${c.blue ? ` La seconda luna piena del ${c.blue} è una «luna blu».` : ''}${c.super ? ` Superlune: ${c.super}.` : ''} Gli orari sono in ora bulgara.`,
        sub: 'Luna piena'
      },
      listNew: {
        title: y => `Luna nuova ${y} – date e orari`,
        h1: y => `Date della luna nuova nel ${y}`,
        description: (y, n, first) => `Tutte le lune nuove del ${y}: ${n} date con l'ora esatta in ora bulgara. La prima è il ${first}.`,
        intro: c => `Nel ${c.year} ci sono ${c.n} lune nuove. La prima è il ${c.first} e l'ultima il ${c.last}. La luna nuova è la notte più buia del mese e la migliore per osservare stelle e nebulose. Gli orari sono in ora bulgara.`,
        sub: 'Luna nuova'
      },
      cols: { n: 'N.', date: 'Data', day: 'Giorno', time: 'Ora', distance: 'Distanza', note: 'Nota' },
      superMoon: 'superluna', blueMoon: 'luna blu', km: 'km',
      otherKind: { full: 'Luna nuova', new: 'Luna piena' },
      listNote: 'La distanza va dal centro della Terra al centro della Luna nel momento della fase. Calcolata con l\'algoritmo di Jean Meeus; gli orari sono confrontati con i dati dell\'USNO.',
      faqH: 'Domande frequenti sulla Luna',
      faq: c => [
        ['Quando sono la prossima luna piena e la prossima luna nuova?', `La prossima luna piena è il ${c.full}, la prossima luna nuova il ${c.fresh} (ora bulgara).`],
        ['Quanto dura il ciclo lunare?', 'Da una luna nuova alla successiva passano in media 29 giorni, 12 ore e 44 minuti. È il mese sinodico. L\'intervallo tra due lune nuove può essere più breve o più lungo di qualche ora, perché l\'orbita della Luna è un\'ellisse.'],
        ['Perché la Luna ha le fasi?', 'La Luna non brilla di luce propria, riflette la luce del Sole. Mentre gira intorno alla Terra, da qui si vede una parte diversa della sua metà illuminata: da una falce sottile, passando per il primo quarto e la luna piena, fino all\'ultimo quarto e di nuovo alla luna nuova.'],
        ['Che cos\'è una superluna?', 'Una superluna è una luna piena che coincide con il perigeo, il punto più vicino dell\'orbita lunare (circa 356.000 km, contro 406.000 km all\'apogeo). Appare fino a circa il 14% più grande e il 30% più luminosa della luna piena più lontana.'],
        ['Che cos\'è una luna blu?', `Una luna blu è la seconda luna piena in uno stesso mese del calendario. Non è di colore blu. ${c.blue ? `La prossima è il ${c.blue}.` : 'In questi due anni non c\'è nessuna luna blu.'}`]
      ],
      subscribe: {
        h: 'Il calendario lunare nel tuo calendario',
        text: years => `Iscriviti e tutte le fasi della Luna per ${years} saranno nel tuo calendario Google, Apple o Outlook, all'ora esatta del tuo fuso orario. Il calendario viene esteso ogni anno.`,
        btn: '📅 Iscriviti',
        download: 'Scarica .ics',
        how: 'Google Calendar: «Altri calendari» → «Da URL» e incolla l\'indirizzo:'
      },
      share: { btn: '📤 Condividi', copied: '✓ Link copiato' },
      cal: 'Calendario lunare',
      ics: { name: 'Fasi lunari', super: 'superluna', blue: 'luna blu' }
    },
    es: {
      listFull: {
        title: y => `Luna llena ${y} – fechas y horas`,
        h1: y => `Fechas de la luna llena en ${y}`,
        description: (y, n, first) => `Todas las lunas llenas de ${y}: ${n} fechas con la hora exacta en hora de Bulgaria, las superlunas y la luna azul. La primera es el ${first}.`,
        intro: c => `En ${c.year} hay ${c.n} lunas llenas. La primera es el ${c.first} y la última el ${c.last}.${c.blue ? ` La segunda luna llena del ${c.blue} es una «luna azul».` : ''}${c.super ? ` Superlunas: ${c.super}.` : ''} Las horas son de Bulgaria.`,
        sub: 'Luna llena'
      },
      listNew: {
        title: y => `Luna nueva ${y} – fechas y horas`,
        h1: y => `Fechas de la luna nueva en ${y}`,
        description: (y, n, first) => `Todas las lunas nuevas de ${y}: ${n} fechas con la hora exacta en hora de Bulgaria. La primera es el ${first}.`,
        intro: c => `En ${c.year} hay ${c.n} lunas nuevas. La primera es el ${c.first} y la última el ${c.last}. La luna nueva es la noche más oscura del mes y la mejor para observar estrellas y nebulosas. Las horas son de Bulgaria.`,
        sub: 'Luna nueva'
      },
      cols: { n: 'N.º', date: 'Fecha', day: 'Día', time: 'Hora', distance: 'Distancia', note: 'Nota' },
      superMoon: 'superluna', blueMoon: 'luna azul', km: 'km',
      otherKind: { full: 'Luna nueva', new: 'Luna llena' },
      listNote: 'La distancia es del centro de la Tierra al centro de la Luna en el momento de la fase. Calculada con el algoritmo de Jean Meeus; las horas están contrastadas con los datos del USNO.',
      faqH: 'Preguntas frecuentes sobre la Luna',
      faq: c => [
        ['¿Cuándo es la próxima luna llena y luna nueva?', `La próxima luna llena es el ${c.full} y la próxima luna nueva el ${c.fresh} (hora de Bulgaria).`],
        ['¿Cuánto dura el ciclo lunar?', 'De una luna nueva a la siguiente pasan de media 29 días, 12 horas y 44 minutos. Es el mes sinódico. El tiempo entre dos lunas nuevas puede ser unas horas más corto o más largo, porque la órbita de la Luna es una elipse.'],
        ['¿Por qué la Luna tiene fases?', 'La Luna no brilla por sí misma, refleja la luz del Sol. Mientras gira alrededor de la Tierra, desde aquí se ve una parte distinta de su mitad iluminada: de una fina hoz, pasando por el cuarto creciente y la luna llena, hasta el cuarto menguante y otra vez la luna nueva.'],
        ['¿Qué es una superluna?', 'Una superluna es una luna llena que coincide con el perigeo, el punto más cercano de la órbita lunar (unos 356.000 km, frente a 406.000 km en el apogeo). Se ve hasta un 14 % más grande y un 30 % más brillante que la luna llena más lejana.'],
        ['¿Qué es una luna azul?', `Una luna azul es la segunda luna llena de un mismo mes del calendario. No es de color azul. ${c.blue ? `La próxima es el ${c.blue}.` : 'En estos dos años no hay ninguna luna azul.'}`]
      ],
      subscribe: {
        h: 'El calendario lunar en tu calendario',
        text: years => `Suscríbete y todas las fases de la Luna de ${years} estarán en tu calendario de Google, Apple u Outlook, a la hora exacta de tu zona horaria. El calendario se amplía cada año.`,
        btn: '📅 Suscribirse',
        download: 'Descargar .ics',
        how: 'Google Calendar: «Otros calendarios» → «Desde URL» y pega la dirección:'
      },
      share: { btn: '📤 Compartir', copied: '✓ Enlace copiado' },
      cal: 'Calendario lunar',
      ics: { name: 'Fases lunares', super: 'superluna', blue: 'luna azul' }
    }
  }
};
