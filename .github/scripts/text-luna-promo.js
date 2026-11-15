// Texts of the Moon calendar's extra pages and blocks, in the seven languages (bg, en, de, it, es, fr, nl):
//   - the list pages "Full moons <year>" and "New moons <year>" (/luna/<year>/pylnolunie/, /novolunie/)
//   - the questions and answers on /luna/ (also written as FAQPage data)
//   - the subscription to the calendar (the .ics file) and the share button
// Used by build-luna.js. Change the seven languages together.
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
    },
    fr: {
      listFull: {
        title: y => `Pleines lunes ${y} – dates et heures`,
        h1: y => `Pleines lunes en ${y}`,
        description: (y, n, first) => `Toutes les pleines lunes de ${y} : ${n} dates avec l’heure exacte à l’heure bulgare, super-lunes et lune bleue. La première est le ${first}.`,
        intro: c => `Il y a ${c.n} pleines lunes en ${c.year}. La première est le ${c.first} et la dernière le ${c.last}.${c.blue ? ` La deuxième pleine lune du ${c.blue} est une « lune bleue ».` : ''}${c.super ? ` Super-lunes : ${c.super}.` : ''} Les heures sont à l’heure bulgare.`,
        sub: 'Pleine lune'
      },
      listNew: {
        title: y => `Nouvelles lunes ${y} – dates et heures`,
        h1: y => `Nouvelles lunes en ${y}`,
        description: (y, n, first) => `Toutes les nouvelles lunes de ${y} : ${n} dates avec l’heure exacte à l’heure bulgare. La première est le ${first}.`,
        intro: c => `Il y a ${c.n} nouvelles lunes en ${c.year}. La première est le ${c.first} et la dernière le ${c.last}. La nouvelle lune est la nuit la plus sombre du mois et la meilleure pour observer les étoiles et les nébuleuses. Les heures sont à l’heure bulgare.`,
        sub: 'Nouvelle lune'
      },
      cols: { n: 'N°', date: 'Date', day: 'Jour', time: 'Heure', distance: 'Distance', note: 'Remarque' },
      superMoon: 'super-lune', blueMoon: 'lune bleue', km: 'km',
      otherKind: { full: 'Nouvelles lunes', new: 'Pleines lunes' },
      listNote: 'La distance est mesurée du centre de la Terre au centre de la Lune au moment de la phase. Calculé avec l’algorithme de Jean Meeus ; les heures sont vérifiées avec les données de l’USNO.',
      faqH: 'Questions fréquentes sur la Lune',
      faq: c => [
        ['Quand a lieu la prochaine pleine lune et la prochaine nouvelle lune ?', `La prochaine pleine lune est le ${c.full} et la prochaine nouvelle lune le ${c.fresh} (heure bulgare).`],
        ['Combien de temps dure le cycle lunaire ?', 'D’une nouvelle lune à la suivante, il faut en moyenne 29 jours, 12 heures et 44 minutes. C’est ce qu’on appelle le mois synodique. L’intervalle entre deux nouvelles lunes peut être de quelques heures plus court ou plus long, car l’orbite de la Lune est une ellipse.'],
        ['Pourquoi la Lune a-t-elle des phases ?', 'La Lune ne brille pas par elle-même, elle réfléchit la lumière du Soleil. En tournant autour de la Terre, elle nous montre une part différente de sa moitié éclairée : d’un mince croissant au premier quartier et à la pleine lune, puis au dernier quartier et de nouveau à la nouvelle lune.'],
        ['Qu’est-ce qu’une super-lune ?', 'Une super-lune est une pleine lune qui coïncide avec le périgée, le point de l’orbite lunaire le plus proche de la Terre (environ 356 000 km, contre 406 000 km à l’apogée). Elle paraît jusqu’à environ 14 % plus grande et 30 % plus brillante que la pleine lune la plus lointaine.'],
        ['Qu’est-ce qu’une lune bleue ?', `Une lune bleue est la deuxième pleine lune d’un même mois civil. Elle n’est pas bleue. ${c.blue ? `La prochaine aura lieu le ${c.blue}.` : 'Il n’y a pas de lune bleue au cours de ces deux années.'}`]
      ],
      subscribe: {
        h: 'Le calendrier lunaire dans votre agenda',
        text: years => `Abonnez-vous et toutes les phases de la Lune pour ${years} apparaîtront dans votre agenda Google, Apple ou Outlook, à l’heure exacte de votre fuseau horaire. Le calendrier est prolongé chaque année.`,
        btn: '📅 S’abonner',
        download: 'Télécharger le .ics',
        how: 'Google Agenda : « Autres agendas » → « À partir de l’URL », puis collez l’adresse :'
      },
      share: { btn: '📤 Partager', copied: '✓ Lien copié' },
      cal: 'Calendrier lunaire',
      ics: { name: 'Phases de la Lune', super: 'super-lune', blue: 'lune bleue' }
    },
    nl: {
      listFull: {
        title: y => `Volle manen ${y} – data en tijden`,
        h1: y => `Volle manen in ${y}`,
        description: (y, n, first) => `Alle volle manen in ${y}: ${n} data met de exacte tijd in Bulgaarse tijd, supermanen en de blauwe maan. De eerste is op ${first}.`,
        intro: c => `In ${c.year} zijn er ${c.n} volle manen. De eerste is op ${c.first} en de laatste op ${c.last}.${c.blue ? ` De tweede volle maan op ${c.blue} is een "blauwe maan".` : ''}${c.super ? ` Supermanen: ${c.super}.` : ''} De tijden zijn Bulgaarse tijd.`,
        sub: 'Volle maan'
      },
      listNew: {
        title: y => `Nieuwe manen ${y} – data en tijden`,
        h1: y => `Nieuwe manen in ${y}`,
        description: (y, n, first) => `Alle nieuwe manen in ${y}: ${n} data met de exacte tijd in Bulgaarse tijd. De eerste is op ${first}.`,
        intro: c => `In ${c.year} zijn er ${c.n} nieuwe manen. De eerste is op ${c.first} en de laatste op ${c.last}. Nieuwe maan is de donkerste nacht van de maand en de beste om sterren en nevels te bekijken. De tijden zijn Bulgaarse tijd.`,
        sub: 'Nieuwe maan'
      },
      cols: { n: 'Nr.', date: 'Datum', day: 'Dag', time: 'Tijd', distance: 'Afstand', note: 'Opmerking' },
      superMoon: 'supermaan', blueMoon: 'blauwe maan', km: 'km',
      otherKind: { full: 'Nieuwe manen', new: 'Volle manen' },
      listNote: 'De afstand is gemeten van het middelpunt van de aarde tot het middelpunt van de maan op het moment van de fase. Berekend met het algoritme van Jean Meeus; de tijden zijn vergeleken met gegevens van het USNO.',
      faqH: 'Veelgestelde vragen over de maan',
      faq: c => [
        ['Wanneer is de volgende volle maan en nieuwe maan?', `De volgende volle maan is op ${c.full} en de volgende nieuwe maan op ${c.fresh} (Bulgaarse tijd).`],
        ['Hoe lang duurt de maancyclus?', 'Van de ene nieuwe maan tot de volgende duurt gemiddeld 29 dagen, 12 uur en 44 minuten. Dat heet de synodische maand. De tijd tussen twee nieuwe manen kan een paar uur korter of langer zijn, omdat de baan van de maan een ellips is.'],
        ['Waarom heeft de maan fasen?', 'De maan geeft zelf geen licht, ze weerkaatst het zonlicht. Terwijl ze om de aarde draait, zien we telkens een ander deel van haar verlichte helft: van een dunne sikkel via het eerste kwartier en de volle maan naar het laatste kwartier en weer de nieuwe maan.'],
        ['Wat is een supermaan?', 'Een supermaan is een volle maan die samenvalt met het perigeum, het punt van de maanbaan dat het dichtst bij de aarde ligt (ongeveer 356.000 km, tegen 406.000 km in het apogeum). Ze lijkt tot ongeveer 14% groter en 30% helderder dan de verste volle maan.'],
        ['Wat is een blauwe maan?', `Een blauwe maan is de tweede volle maan in één kalendermaand. Ze is niet blauw van kleur. ${c.blue ? `De volgende is op ${c.blue}.` : 'In deze twee jaren is er geen blauwe maan.'}`]
      ],
      subscribe: {
        h: 'De maankalender in uw agenda',
        text: years => `Abonneer u en alle maanfasen voor ${years} staan in uw Google-, Apple- of Outlook-agenda, op de exacte tijd in uw tijdzone. De kalender wordt elk jaar verlengd.`,
        btn: '📅 Abonneren',
        download: '.ics downloaden',
        how: 'Google Agenda: "Andere agenda\'s" → "Via URL" en plak het adres:'
      },
      share: { btn: '📤 Delen', copied: '✓ Link gekopieerd' },
      cal: 'Maankalender',
      ics: { name: 'Maanfasen', super: 'supermaan', blue: 'blauwe maan' }
    }

  }
};
