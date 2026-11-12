// Texts of /za-saita/ (About) and /poveritelnost/ (Privacy) in the five languages (build-static.js).
// i(url, text) is a link to a page of the site, x(url, text) an external link.
const MAIL = 'woodwideweb@yahoo.com';

const ABOUT = {
  bg: (i, x) => ({
    navTitle: 'За сайта',
    title: 'За сайта',
    description: 'Weather Pulse е безплатен сайт за прогноза за времето, магнитни бури и официални празници. Откъде идват данните и как се правят прогнозите.',
    h1: 'За Weather Pulse',
    lead: 'Weather Pulse е безплатен сайт за прогноза за времето, магнитни бури и официални празници, без регистрация и без платени функции. Можете да го инсталирате като приложение на телефона си от менюто на браузъра.',
    hWhat: 'Какво има в сайта',
    what: [
      `${i('/weather/', 'Прогноза за времето')} — за 16 дни и по часове, с диапазон на сигурност, сравнение на моделите, изгрев, залез и фаза на Луната;`,
      `${i('/magnitni-buri/', 'Магнитни бури')} — Kp индекс в реално време, прогноза за 3 дни, слънчев вятър и известия при буря;`,
      `${i('/maps/', 'Карти за времето')} — вятър, валежи, облаци и температура;`,
      `${i('/holliday_calendar/', 'Календар на празниците')} — официалните празници в държавата на избраното място.`,
      `${i('/luna/', 'Лунен календар')} и ${i('/nebeto/', 'Небето')} — фази на Луната, метеорни потоци, затъмнения и суперлуни;`
    ],
    hData: 'Откъде идват данните',
    data: [
      `Прогнозата за времето е от ${x('https://open-meteo.com/', 'Open-Meteo')}, който използва моделите на ECMWF (Европа), ICON (Германия), GFS (САЩ) и други метеорологични служби.`,
      `Данните за магнитните бури и слънчевия вятър са от ${x('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')}.`,
      `Празниците са от ${x('https://date.nager.at/', 'Nager.Date')}.`,
      `Картите са от ${x('https://www.windy.com/', 'Windy')}.`
    ],
    moreData: `Повече подробности има на страница ${i('/iztochnici/', 'Източници на данни')}.`,
    hHow: 'Как се правят прогнозите',
    how1: 'Прогнозата за времето е изчислена от числени модели, които симулират атмосферата върху мрежа от точки. Освен основната прогноза показваме и диапазон от ансамблови прогнози: моделът се пуска много пъти с малко различни начални условия и колкото по-близки са резултатите, толкова по-сигурна е прогнозата. Обикновено прогнозата е точна за 3–5 дни, а след 7 дни е ориентировъчна.',
    how2: `Прогнозата за магнитните бури е на синоптиците на NOAA, които следят Слънцето със спътници. Повече за това е описано на страница ${i('/magnitni-buri/', 'Магнитни бури')}.`,
    hPrivacy: 'Поверителност',
    privacy: `Не изискваме регистрация и не събираме лични данни на свой сървър. Подробности има на страница ${i('/poveritelnost/', 'Поверителност')}.`,
    hContact: 'Връзка с нас',
    contact: `Предложения, грешки и въпроси: <a href="mailto:${MAIL}">${MAIL}</a>.`,
    maintained: 'Weather Pulse се поддържа от VYZYA.'
  }),
  en: (i, x) => ({
    title: 'About',
    description: 'Weather Pulse is a free site for weather forecasts, magnetic storms and public holidays. Where the data come from and how the forecasts are made.',
    h1: 'About Weather Pulse',
    lead: 'Weather Pulse is a free site for weather forecasts, magnetic storms and public holidays, with no registration and no paid features. You can install it as an app on your phone from the browser menu.',
    hWhat: 'What the site offers',
    what: [
      `${i('/weather/', 'Weather Forecast')} — 16 days and hourly, with a range of certainty, a comparison of models, sunrise, sunset and the phase of the Moon;`,
      `${i('/magnitni-buri/', 'Magnetic Storms')} — the Kp index in real time, a 3-day forecast, solar wind and storm alerts;`,
      `${i('/maps/', 'Weather Maps')} — wind, rain, clouds and temperature;`,
      `${i('/holliday_calendar/', 'Holiday Calendar')} — the public holidays of the country of the chosen place;`,
      `${i('/luna/', 'Moon calendar')} and ${i('/nebeto/', 'The Sky')} — Moon phases, meteor showers, eclipses and supermoons;`
    ],
    hData: 'Where the data come from',
    data: [
      `The weather forecast is from ${x('https://open-meteo.com/', 'Open-Meteo')}, which uses the models of ECMWF (Europe), ICON (Germany), GFS (USA) and other weather services.`,
      `The data on magnetic storms and the solar wind are from the ${x('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')}.`,
      `Public holidays are from ${x('https://date.nager.at/', 'Nager.Date')}.`,
      `The maps are from ${x('https://www.windy.com/', 'Windy')}.`
    ],
    moreData: `More details are on the ${i('/iztochnici/', 'Data Sources')} page.`,
    hHow: 'How the forecasts are made',
    how1: 'The weather forecast is calculated by numerical models that simulate the atmosphere on a grid of points. Besides the main forecast we also show a range of ensemble forecasts: the model is run many times with slightly different starting conditions, and the closer the results are, the more certain the forecast. A forecast is usually accurate for 3–5 days and only indicative after 7 days.',
    how2: `The magnetic storm forecast comes from the NOAA forecasters, who watch the Sun with satellites. More about it is on the ${i('/magnitni-buri/', 'Magnetic Storms')} page.`,
    hPrivacy: 'Privacy',
    privacy: `We do not require registration and do not collect personal data on a server of our own. Details are on the ${i('/poveritelnost/', 'Privacy')} page.`,
    hContact: 'Contact us',
    contact: `Suggestions, errors and questions: <a href="mailto:${MAIL}">${MAIL}</a>.`,
    maintained: 'Weather Pulse is maintained by VYZYA.'
  }),
  de: (i, x) => ({
    title: 'Über uns',
    description: 'Weather Pulse ist eine kostenlose Seite für Wettervorhersagen, Magnetstürme und Feiertage. Woher die Daten stammen und wie die Vorhersagen entstehen.',
    h1: 'Über Weather Pulse',
    lead: 'Weather Pulse ist eine kostenlose Seite für Wettervorhersagen, Magnetstürme und Feiertage, ohne Registrierung und ohne kostenpflichtige Funktionen. Sie können sie über das Browsermenü als App auf Ihrem Telefon installieren.',
    hWhat: 'Was die Seite bietet',
    what: [
      `${i('/weather/', 'Wettervorhersage')} — für 16 Tage und stündlich, mit Sicherheitsbereich, Modellvergleich, Sonnenaufgang, Sonnenuntergang und Mondphase;`,
      `${i('/magnitni-buri/', 'Magnetstürme')} — der Kp-Index in Echtzeit, eine 3-Tage-Vorhersage, Sonnenwind und Sturmwarnungen;`,
      `${i('/maps/', 'Wetterkarten')} — Wind, Regen, Wolken und Temperatur;`,
      `${i('/holliday_calendar/', 'Feiertagskalender')} — die Feiertage des Landes des gewählten Ortes;`,
      `${i('/luna/', 'Mondkalender')} und ${i('/nebeto/', 'Himmel')} — Mondphasen, Meteorströme, Finsternisse und Supermonde;`
    ],
    hData: 'Woher die Daten stammen',
    data: [
      `Die Wettervorhersage stammt von ${x('https://open-meteo.com/', 'Open-Meteo')}, das die Modelle von ECMWF (Europa), ICON (Deutschland), GFS (USA) und anderen Wetterdiensten nutzt.`,
      `Die Daten zu Magnetstürmen und Sonnenwind stammen vom ${x('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')}.`,
      `Die Feiertage stammen von ${x('https://date.nager.at/', 'Nager.Date')}.`,
      `Die Karten stammen von ${x('https://www.windy.com/', 'Windy')}.`
    ],
    moreData: `Mehr Einzelheiten stehen auf der Seite ${i('/iztochnici/', 'Datenquellen')}.`,
    hHow: 'Wie die Vorhersagen entstehen',
    how1: 'Die Wettervorhersage wird von numerischen Modellen berechnet, die die Atmosphäre auf einem Gitter von Punkten simulieren. Neben der Hauptvorhersage zeigen wir auch eine Spanne von Ensemble-Vorhersagen: Das Modell wird viele Male mit leicht unterschiedlichen Anfangsbedingungen gerechnet, und je näher die Ergebnisse beieinander liegen, desto sicherer ist die Vorhersage. Meist ist eine Vorhersage für 3–5 Tage genau und nach 7 Tagen nur ein Richtwert.',
    how2: `Die Vorhersage der Magnetstürme stammt von den NOAA-Meteorologen, die die Sonne mit Satelliten beobachten. Mehr dazu steht auf der Seite ${i('/magnitni-buri/', 'Magnetstürme')}.`,
    hPrivacy: 'Datenschutz',
    privacy: `Wir verlangen keine Registrierung und sammeln keine personenbezogenen Daten auf einem eigenen Server. Einzelheiten stehen auf der Seite ${i('/poveritelnost/', 'Datenschutz')}.`,
    hContact: 'Kontakt',
    contact: `Vorschläge, Fehler und Fragen: <a href="mailto:${MAIL}">${MAIL}</a>.`,
    maintained: 'Weather Pulse wird von VYZYA betrieben.'
  }),
  it: (i, x) => ({
    title: 'Chi siamo',
    description: 'Weather Pulse è un sito gratuito di previsioni del tempo, tempeste magnetiche e festività. Da dove vengono i dati e come si fanno le previsioni.',
    h1: 'Chi siamo: Weather Pulse',
    lead: "Weather Pulse è un sito gratuito di previsioni del tempo, tempeste magnetiche e festività, senza registrazione e senza funzioni a pagamento. Puoi installarlo come app sul telefono dal menu del browser.",
    hWhat: 'Cosa offre il sito',
    what: [
      `${i('/weather/', 'Previsioni del tempo')} — a 16 giorni e ora per ora, con intervallo di affidabilità, confronto dei modelli, alba, tramonto e fase lunare;`,
      `${i('/magnitni-buri/', 'Tempeste magnetiche')} — indice Kp in tempo reale, previsioni a 3 giorni, vento solare e avvisi di tempesta;`,
      `${i('/maps/', 'Mappe meteorologiche')} — vento, pioggia, nuvole e temperatura;`,
      `${i('/holliday_calendar/', 'Calendario delle festività')} — le festività del paese del luogo scelto;`,
      `${i('/luna/', 'Calendario lunare')} e ${i('/nebeto/', 'Il cielo')} — fasi lunari, sciami meteorici, eclissi e superlune;`
    ],
    hData: 'Da dove vengono i dati',
    data: [
      `Le previsioni del tempo provengono da ${x('https://open-meteo.com/', 'Open-Meteo')}, che usa i modelli di ECMWF (Europa), ICON (Germania), GFS (USA) e di altri servizi meteorologici.`,
      `I dati su tempeste magnetiche e vento solare provengono dal ${x('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')}.`,
      `Le festività provengono da ${x('https://date.nager.at/', 'Nager.Date')}.`,
      `Le mappe provengono da ${x('https://www.windy.com/', 'Windy')}.`
    ],
    moreData: `Altri dettagli sono nella pagina ${i('/iztochnici/', 'Fonti dei dati')}.`,
    hHow: 'Come si fanno le previsioni',
    how1: "Le previsioni del tempo sono calcolate da modelli numerici che simulano l'atmosfera su una griglia di punti. Oltre alla previsione principale mostriamo anche un intervallo di previsioni d'insieme: il modello viene eseguito molte volte con condizioni iniziali leggermente diverse e più i risultati sono vicini, più la previsione è affidabile. Di solito la previsione è precisa per 3–5 giorni e dopo 7 giorni è solo indicativa.",
    how2: `La previsione delle tempeste magnetiche è dei meteorologi della NOAA, che osservano il Sole con i satelliti. Maggiori informazioni nella pagina ${i('/magnitni-buri/', 'Tempeste magnetiche')}.`,
    hPrivacy: 'Privacy',
    privacy: `Non chiediamo la registrazione e non raccogliamo dati personali su un server nostro. I dettagli sono nella pagina ${i('/poveritelnost/', 'Privacy')}.`,
    hContact: 'Contattaci',
    contact: `Suggerimenti, errori e domande: <a href="mailto:${MAIL}">${MAIL}</a>.`,
    maintained: 'Weather Pulse è gestito da VYZYA.'
  }),
  es: (i, x) => ({
    title: 'Acerca de',
    description: 'Weather Pulse es un sitio gratuito de previsión del tiempo, tormentas magnéticas y festivos. De dónde vienen los datos y cómo se hacen las previsiones.',
    h1: 'Acerca de Weather Pulse',
    lead: 'Weather Pulse es un sitio gratuito de previsión del tiempo, tormentas magnéticas y festivos, sin registro y sin funciones de pago. Puedes instalarlo como aplicación en el teléfono desde el menú del navegador.',
    hWhat: 'Qué ofrece el sitio',
    what: [
      `${i('/weather/', 'Pronóstico del tiempo')} — a 16 días y por horas, con rango de fiabilidad, comparación de modelos, salida y puesta del sol y fase de la Luna;`,
      `${i('/magnitni-buri/', 'Tormentas magnéticas')} — índice Kp en tiempo real, previsión a 3 días, viento solar y avisos de tormenta;`,
      `${i('/maps/', 'Mapas del tiempo')} — viento, lluvia, nubes y temperatura;`,
      `${i('/holliday_calendar/', 'Calendario de festivos')} — los festivos del país del lugar elegido;`,
      `${i('/luna/', 'Calendario lunar')} y ${i('/nebeto/', 'El cielo')} — fases de la Luna, lluvias de meteoros, eclipses y superlunas;`
    ],
    hData: 'De dónde vienen los datos',
    data: [
      `La previsión del tiempo procede de ${x('https://open-meteo.com/', 'Open-Meteo')}, que usa los modelos de ECMWF (Europa), ICON (Alemania), GFS (EE. UU.) y de otros servicios meteorológicos.`,
      `Los datos de tormentas magnéticas y viento solar proceden del ${x('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')}.`,
      `Los festivos proceden de ${x('https://date.nager.at/', 'Nager.Date')}.`,
      `Los mapas proceden de ${x('https://www.windy.com/', 'Windy')}.`
    ],
    moreData: `Hay más detalles en la página ${i('/iztochnici/', 'Fuentes de datos')}.`,
    hHow: 'Cómo se hacen las previsiones',
    how1: 'La previsión del tiempo la calculan modelos numéricos que simulan la atmósfera sobre una malla de puntos. Además de la previsión principal mostramos un rango de previsiones por conjuntos: el modelo se ejecuta muchas veces con condiciones iniciales ligeramente distintas y, cuanto más próximos son los resultados, más fiable es la previsión. Normalmente la previsión es precisa para 3–5 días y a partir de 7 días es solo orientativa.',
    how2: `La previsión de las tormentas magnéticas es de los meteorólogos de la NOAA, que vigilan el Sol con satélites. Hay más información en la página ${i('/magnitni-buri/', 'Tormentas magnéticas')}.`,
    hPrivacy: 'Privacidad',
    privacy: `No pedimos registro y no recogemos datos personales en un servidor propio. Los detalles están en la página ${i('/poveritelnost/', 'Privacidad')}.`,
    hContact: 'Contacto',
    contact: `Sugerencias, errores y preguntas: <a href="mailto:${MAIL}">${MAIL}</a>.`,
    maintained: 'Weather Pulse está a cargo de VYZYA.'
  })
};

const PRIVACY = {
  bg: (i, x) => ({
    title: 'Поверителност и бисквитки',
    description: 'Какви данни използва Weather Pulse: настройки в браузъра, Google Analytics само със съгласие и външни услуги за прогнозата.',
    h1: 'Поверителност и бисквитки',
    updated: 'Последна промяна: 4 ноември 2026 г.',
    lead: 'Weather Pulse (weatherpulse.eu) е безплатен сайт за прогноза за времето, магнитни бури и празници. Нямаме регистрация, формуляри или собствен сървър с данни: сайтът е статичен и се хоства в GitHub Pages. Тук обясняваме какво се случва с данните ви, докато го използвате.',
    hLocal: 'Настройки, които остават във вашия браузър',
    localIntro: 'За да помни избора ви, сайтът записва в локалното хранилище на браузъра (localStorage):',
    local: ['избран език и фон;', 'последното търсено място, последните места и любимите места;', 'избора ви за бисквитките;', 'дали са включени известията за магнитни бури.'],
    localOutro: 'Тези данни не напускат устройството ви и не се изпращат до нас. Можете да ги изтриете по всяко време, като изчистите данните на сайта от настройките на браузъра.',
    hGa: 'Google Analytics (само със съгласие)',
    ga1: 'Ако натиснете „Приемам“ в банера за бисквитки, зареждаме Google Analytics, за да виждаме обобщена статистика: колко посещения има, кои страници се отварят и от какви устройства. Google Analytics записва бисквитки и обработва IP адреса ви; доставчик е Google, който може да обработва данните и извън ЕС. Ако натиснете „Отказвам“ или не изберете нищо, Google Analytics не се зарежда и такива бисквитки не се записват.',
    ga2: 'Можете да промените избора си по всяко време с бутона 🍪 в долния ъгъл на страницата. При отказ изтриваме бисквитките на Google Analytics.',
    hExt: 'Външни услуги за данните',
    extIntro: 'Прогнозата и другите данни се зареждат директно от вашия браузър от следните услуги. Те получават IP адреса ви и, когато търсите прогноза, координатите на мястото:',
    ext: [
      `${x('https://open-meteo.com/', 'Open-Meteo')} — прогноза за времето и търсене на места;`,
      `${x('https://www.swpc.noaa.gov/', 'NOAA SWPC')} — магнитни бури и слънчев вятър;`,
      `${x('https://date.nager.at/', 'Nager.Date')} — официални празници;`,
      `${x('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')} — име на мястото по координати;`,
      `${x('https://www.windy.com/', 'Windy')} — картата на страница „Карти за времето“;`,
      'Google Fonts — шрифтовете на сайта;',
      'GitHub Pages — хостинг на сайта (записва технически логове с IP адреси за сигурност).'
    ],
    hLoc: 'Местоположение',
    loc: 'Бутонът за текущо местоположение работи само ако го разрешите в браузъра. Координатите се използват само за да се зареди прогнозата за вашето място и не се записват на сървър.',
    hNotif: 'Известия за магнитни бури',
    notif: `Ако включите известията, браузърът ви сам проверява прогнозата на NOAA и показва известие при очаквана буря. Не използваме сървър за известия и не събираме данни за устройството ви. Можете да ги изключите от страница ${i('/magnitni-buri/', 'Магнитни бури')} или от настройките на браузъра.`,
    hRights: 'Вашите права',
    rights: `Тъй като не съхраняваме лични данни на свой сървър, повечето ви данни са само на вашето устройство. За въпроси или искания относно данните, обработвани чрез Google Analytics, пишете ни на <a href="mailto:${MAIL}">${MAIL}</a>. Имате право да подадете жалба до ${x('https://www.cpdp.bg/', 'Комисията за защита на личните данни')}.`
  }),
  en: (i, x) => ({
    title: 'Privacy and cookies',
    description: 'What data Weather Pulse uses: settings in the browser, Google Analytics only with consent, and external services for the forecast.',
    h1: 'Privacy and cookies',
    updated: 'Last updated: 4 November 2026',
    lead: 'Weather Pulse (weatherpulse.eu) is a free site for weather forecasts, magnetic storms and holidays. We have no registration, forms or server of our own holding data: the site is static and hosted on GitHub Pages. Here we explain what happens to your data while you use it.',
    hLocal: 'Settings that stay in your browser',
    localIntro: 'To remember your choices, the site saves the following in the browser\'s local storage (localStorage):',
    local: ['the chosen language and background;', 'the last searched place, recent places and favourite places;', 'your choice about cookies;', 'whether notifications about magnetic storms are switched on.'],
    localOutro: 'This data does not leave your device and is not sent to us. You can delete it at any time by clearing the site data in your browser settings.',
    hGa: 'Google Analytics (only with consent)',
    ga1: 'If you press "Accept" in the cookie banner, we load Google Analytics to see summary statistics: how many visits there are, which pages are opened and from which devices. Google Analytics stores cookies and processes your IP address; the provider is Google, which may process the data outside the EU. If you press "Decline" or choose nothing, Google Analytics is not loaded and no such cookies are stored.',
    ga2: 'You can change your choice at any time with the 🍪 button in the bottom corner of the page. If you decline, we delete the Google Analytics cookies.',
    hExt: 'External services for the data',
    extIntro: 'The forecast and other data are loaded directly by your browser from the following services. They receive your IP address and, when you look up a forecast, the coordinates of the place:',
    ext: [
      `${x('https://open-meteo.com/', 'Open-Meteo')} — the weather forecast and place search;`,
      `${x('https://www.swpc.noaa.gov/', 'NOAA SWPC')} — magnetic storms and the solar wind;`,
      `${x('https://date.nager.at/', 'Nager.Date')} — public holidays;`,
      `${x('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')} — the name of a place from its coordinates;`,
      `${x('https://www.windy.com/', 'Windy')} — the map on the Weather Maps page;`,
      'Google Fonts — the fonts of the site;',
      'GitHub Pages — hosting of the site (keeps technical logs with IP addresses for security).'
    ],
    hLoc: 'Location',
    loc: 'The current location button works only if you allow it in the browser. The coordinates are used only to load the forecast for your place and are not stored on a server.',
    hNotif: 'Magnetic storm notifications',
    notif: `If you switch notifications on, your browser itself checks the NOAA forecast and shows a notification when a storm is expected. We do not use a notification server and do not collect data about your device. You can switch them off on the ${i('/magnitni-buri/', 'Magnetic Storms')} page or in the browser settings.`,
    hRights: 'Your rights',
    rights: `Because we do not store personal data on a server of our own, most of your data is only on your device. For questions or requests about the data processed through Google Analytics, write to us at <a href="mailto:${MAIL}">${MAIL}</a>. You have the right to lodge a complaint with the ${x('https://www.cpdp.bg/', 'Commission for Personal Data Protection')} (Bulgaria).`
  }),
  de: (i, x) => ({
    title: 'Datenschutz und Cookies',
    description: 'Welche Daten Weather Pulse verwendet: Einstellungen im Browser, Google Analytics nur mit Einwilligung und externe Dienste für die Vorhersage.',
    h1: 'Datenschutz und Cookies',
    updated: 'Zuletzt geändert: 4. November 2026',
    lead: 'Weather Pulse (weatherpulse.eu) ist eine kostenlose Seite für Wettervorhersagen, Magnetstürme und Feiertage. Wir haben keine Registrierung, keine Formulare und keinen eigenen Server mit Daten: Die Seite ist statisch und wird bei GitHub Pages gehostet. Hier erklären wir, was mit Ihren Daten geschieht, während Sie sie nutzen.',
    hLocal: 'Einstellungen, die in Ihrem Browser bleiben',
    localIntro: 'Um sich Ihre Auswahl zu merken, speichert die Seite im lokalen Speicher des Browsers (localStorage):',
    local: ['die gewählte Sprache und den Hintergrund;', 'den zuletzt gesuchten Ort, die letzten und die Lieblingsorte;', 'Ihre Cookie-Auswahl;', 'ob die Benachrichtigungen über Magnetstürme eingeschaltet sind.'],
    localOutro: 'Diese Daten verlassen Ihr Gerät nicht und werden nicht an uns gesendet. Sie können sie jederzeit löschen, indem Sie die Websitedaten in den Browsereinstellungen entfernen.',
    hGa: 'Google Analytics (nur mit Einwilligung)',
    ga1: 'Wenn Sie im Cookie-Banner auf „Akzeptieren“ klicken, laden wir Google Analytics, um zusammengefasste Statistiken zu sehen: wie viele Besuche es gibt, welche Seiten geöffnet werden und von welchen Geräten. Google Analytics speichert Cookies und verarbeitet Ihre IP-Adresse; Anbieter ist Google, das die Daten auch außerhalb der EU verarbeiten kann. Wenn Sie auf „Ablehnen“ klicken oder nichts auswählen, wird Google Analytics nicht geladen und es werden keine solchen Cookies gespeichert.',
    ga2: 'Sie können Ihre Auswahl jederzeit mit der Schaltfläche 🍪 in der unteren Ecke der Seite ändern. Bei Ablehnung löschen wir die Cookies von Google Analytics.',
    hExt: 'Externe Dienste für die Daten',
    extIntro: 'Die Vorhersage und andere Daten werden direkt von Ihrem Browser bei den folgenden Diensten geladen. Diese erhalten Ihre IP-Adresse und, wenn Sie eine Vorhersage abrufen, die Koordinaten des Ortes:',
    ext: [
      `${x('https://open-meteo.com/', 'Open-Meteo')} — Wettervorhersage und Ortssuche;`,
      `${x('https://www.swpc.noaa.gov/', 'NOAA SWPC')} — Magnetstürme und Sonnenwind;`,
      `${x('https://date.nager.at/', 'Nager.Date')} — gesetzliche Feiertage;`,
      `${x('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')} — Name eines Ortes anhand der Koordinaten;`,
      `${x('https://www.windy.com/', 'Windy')} — die Karte auf der Seite „Wetterkarten“;`,
      'Google Fonts — die Schriftarten der Seite;',
      'GitHub Pages — Hosting der Seite (speichert aus Sicherheitsgründen technische Logs mit IP-Adressen).'
    ],
    hLoc: 'Standort',
    loc: 'Die Schaltfläche für den aktuellen Standort funktioniert nur, wenn Sie es im Browser erlauben. Die Koordinaten werden nur verwendet, um die Vorhersage für Ihren Ort zu laden, und nicht auf einem Server gespeichert.',
    hNotif: 'Benachrichtigungen über Magnetstürme',
    notif: `Wenn Sie die Benachrichtigungen einschalten, prüft Ihr Browser selbst die NOAA-Vorhersage und zeigt bei einem erwarteten Sturm eine Benachrichtigung an. Wir nutzen keinen Benachrichtigungsserver und erheben keine Daten über Ihr Gerät. Sie können sie auf der Seite ${i('/magnitni-buri/', 'Magnetstürme')} oder in den Browsereinstellungen ausschalten.`,
    hRights: 'Ihre Rechte',
    rights: `Da wir keine personenbezogenen Daten auf einem eigenen Server speichern, befinden sich die meisten Ihrer Daten nur auf Ihrem Gerät. Bei Fragen oder Anliegen zu den über Google Analytics verarbeiteten Daten schreiben Sie uns an <a href="mailto:${MAIL}">${MAIL}</a>. Sie haben das Recht, sich bei der ${x('https://www.cpdp.bg/', 'bulgarischen Datenschutzbehörde (Commission for Personal Data Protection)')} zu beschweren.`
  }),
  it: (i, x) => ({
    title: 'Privacy e cookie',
    description: 'Quali dati usa Weather Pulse: impostazioni nel browser, Google Analytics solo con consenso e servizi esterni per le previsioni.',
    h1: 'Privacy e cookie',
    updated: 'Ultima modifica: 4 novembre 2026',
    lead: "Weather Pulse (weatherpulse.eu) è un sito gratuito di previsioni del tempo, tempeste magnetiche e festività. Non abbiamo registrazione, moduli né un server nostro con dati: il sito è statico e ospitato su GitHub Pages. Qui spieghiamo cosa succede ai tuoi dati mentre lo usi.",
    hLocal: 'Impostazioni che restano nel tuo browser',
    localIntro: 'Per ricordare le tue scelte, il sito salva nella memoria locale del browser (localStorage):',
    local: ['la lingua e lo sfondo scelti;', "l'ultimo luogo cercato, i luoghi recenti e preferiti;", 'la tua scelta sui cookie;', 'se le notifiche sulle tempeste magnetiche sono attive.'],
    localOutro: "Questi dati non lasciano il tuo dispositivo e non vengono inviati a noi. Puoi eliminarli in qualsiasi momento cancellando i dati del sito dalle impostazioni del browser.",
    hGa: 'Google Analytics (solo con consenso)',
    ga1: "Se premi «Accetto» nel banner dei cookie, carichiamo Google Analytics per vedere statistiche aggregate: quante visite ci sono, quali pagine vengono aperte e da quali dispositivi. Google Analytics salva cookie ed elabora il tuo indirizzo IP; il fornitore è Google, che può elaborare i dati anche fuori dall'UE. Se premi «Rifiuto» o non scegli nulla, Google Analytics non viene caricato e questi cookie non vengono salvati.",
    ga2: 'Puoi cambiare la tua scelta in qualsiasi momento con il pulsante 🍪 nell\'angolo in basso della pagina. In caso di rifiuto eliminiamo i cookie di Google Analytics.',
    hExt: 'Servizi esterni per i dati',
    extIntro: "Le previsioni e gli altri dati vengono caricati direttamente dal tuo browser dai servizi seguenti. Essi ricevono il tuo indirizzo IP e, quando cerchi una previsione, le coordinate del luogo:",
    ext: [
      `${x('https://open-meteo.com/', 'Open-Meteo')} — previsioni del tempo e ricerca dei luoghi;`,
      `${x('https://www.swpc.noaa.gov/', 'NOAA SWPC')} — tempeste magnetiche e vento solare;`,
      `${x('https://date.nager.at/', 'Nager.Date')} — festività;`,
      `${x('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')} — nome di un luogo dalle coordinate;`,
      `${x('https://www.windy.com/', 'Windy')} — la mappa nella pagina «Mappe meteorologiche»;`,
      'Google Fonts — i caratteri del sito;',
      'GitHub Pages — hosting del sito (registra log tecnici con indirizzi IP per sicurezza).'
    ],
    hLoc: 'Posizione',
    loc: 'Il pulsante della posizione attuale funziona solo se lo consenti nel browser. Le coordinate servono solo a caricare le previsioni per il tuo luogo e non vengono salvate su un server.',
    hNotif: 'Notifiche sulle tempeste magnetiche',
    notif: `Se attivi le notifiche, il tuo browser controlla da solo le previsioni della NOAA e mostra una notifica quando è prevista una tempesta. Non usiamo un server per le notifiche e non raccogliamo dati sul tuo dispositivo. Puoi disattivarle dalla pagina ${i('/magnitni-buri/', 'Tempeste magnetiche')} o dalle impostazioni del browser.`,
    hRights: 'I tuoi diritti',
    rights: `Poiché non conserviamo dati personali su un server nostro, la maggior parte dei tuoi dati è solo sul tuo dispositivo. Per domande o richieste sui dati elaborati tramite Google Analytics scrivici a <a href="mailto:${MAIL}">${MAIL}</a>. Hai il diritto di presentare reclamo alla ${x('https://www.cpdp.bg/', 'Commissione bulgara per la protezione dei dati personali')}.`
  }),
  es: (i, x) => ({
    title: 'Privacidad y cookies',
    description: 'Qué datos usa Weather Pulse: ajustes en el navegador, Google Analytics solo con consentimiento y servicios externos para la previsión.',
    h1: 'Privacidad y cookies',
    updated: 'Última modificación: 4 de noviembre de 2026',
    lead: 'Weather Pulse (weatherpulse.eu) es un sitio gratuito de previsión del tiempo, tormentas magnéticas y festivos. No tenemos registro, formularios ni un servidor propio con datos: el sitio es estático y está alojado en GitHub Pages. Aquí explicamos qué ocurre con tus datos mientras lo usas.',
    hLocal: 'Ajustes que se quedan en tu navegador',
    localIntro: 'Para recordar tus elecciones, el sitio guarda en el almacenamiento local del navegador (localStorage):',
    local: ['el idioma y el fondo elegidos;', 'el último lugar buscado, los lugares recientes y los favoritos;', 'tu elección sobre las cookies;', 'si las notificaciones de tormentas magnéticas están activadas.'],
    localOutro: 'Estos datos no salen de tu dispositivo y no se nos envían. Puedes borrarlos en cualquier momento eliminando los datos del sitio en los ajustes del navegador.',
    hGa: 'Google Analytics (solo con consentimiento)',
    ga1: 'Si pulsas «Aceptar» en el aviso de cookies, cargamos Google Analytics para ver estadísticas agregadas: cuántas visitas hay, qué páginas se abren y desde qué dispositivos. Google Analytics guarda cookies y procesa tu dirección IP; el proveedor es Google, que puede tratar los datos también fuera de la UE. Si pulsas «Rechazar» o no eliges nada, Google Analytics no se carga y no se guardan esas cookies.',
    ga2: 'Puedes cambiar tu elección en cualquier momento con el botón 🍪 de la esquina inferior de la página. Si rechazas, borramos las cookies de Google Analytics.',
    hExt: 'Servicios externos para los datos',
    extIntro: 'La previsión y otros datos los carga directamente tu navegador desde los servicios siguientes. Reciben tu dirección IP y, cuando buscas una previsión, las coordenadas del lugar:',
    ext: [
      `${x('https://open-meteo.com/', 'Open-Meteo')} — previsión del tiempo y búsqueda de lugares;`,
      `${x('https://www.swpc.noaa.gov/', 'NOAA SWPC')} — tormentas magnéticas y viento solar;`,
      `${x('https://date.nager.at/', 'Nager.Date')} — festivos;`,
      `${x('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')} — nombre de un lugar a partir de sus coordenadas;`,
      `${x('https://www.windy.com/', 'Windy')} — el mapa de la página «Mapas del tiempo»;`,
      'Google Fonts — las fuentes del sitio;',
      'GitHub Pages — alojamiento del sitio (guarda registros técnicos con direcciones IP por seguridad).'
    ],
    hLoc: 'Ubicación',
    loc: 'El botón de ubicación actual solo funciona si lo permites en el navegador. Las coordenadas se usan únicamente para cargar la previsión de tu lugar y no se guardan en un servidor.',
    hNotif: 'Notificaciones de tormentas magnéticas',
    notif: `Si activas las notificaciones, tu navegador consulta por sí mismo la previsión de la NOAA y muestra una notificación cuando se espera una tormenta. No usamos un servidor de notificaciones ni recogemos datos de tu dispositivo. Puedes desactivarlas en la página ${i('/magnitni-buri/', 'Tormentas magnéticas')} o en los ajustes del navegador.`,
    hRights: 'Tus derechos',
    rights: `Como no guardamos datos personales en un servidor propio, la mayor parte de tus datos está solo en tu dispositivo. Para preguntas o solicitudes sobre los datos tratados mediante Google Analytics, escríbenos a <a href="mailto:${MAIL}">${MAIL}</a>. Tienes derecho a presentar una reclamación ante la ${x('https://www.cpdp.bg/', 'Comisión búlgara de Protección de Datos Personales')}.`
  })
};

module.exports = { ABOUT, PRIVACY, MAIL };
