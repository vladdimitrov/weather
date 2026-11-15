// "Magnetic storms" page (/magnitni-buri/): live Kp, 3-day forecast in 3-hour
// steps, solar wind and NOAA's 27-day outlook, plus storm notifications (the
// check itself runs in /sw.js). The page is written in Bulgarian (for search
// engines); the texts below translate it to the other site languages.
(function () {
  const KP_NOW_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
  const KP_FORECAST_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';
  const SPEED_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json';
  const FIELD_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json';
  const OUTLOOK_URL = 'https://services.swpc.noaa.gov/text/27-day-outlook.txt';
  const ALERTS_KEY = 'stormAlerts';

  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const locales = { en: 'en-GB', bg: 'bg-BG', de: 'de-DE', it: 'it-IT', es: 'es-ES', fr: 'fr-FR', nl: 'nl-NL' };
  const $ = id => document.getElementById(id);

  // ---- Texts of the page (data-i18n="key"); Bulgarian is in the HTML ----
  const PAGE = {
    title: {
      en: 'Magnetic storms today – Kp index and 3-day forecast | Weather Pulse',
      de: 'Magnetstürme heute – Kp-Index und 3-Tage-Vorhersage | Weather Pulse',
      it: 'Tempeste magnetiche oggi – indice Kp e previsione a 3 giorni | Weather Pulse',
      es: 'Tormentas magnéticas hoy – índice Kp y pronóstico de 3 días | Weather Pulse',
      fr: 'Tempêtes magnétiques aujourd’hui – indice Kp et prévision à 3 jours | Weather Pulse',
      nl: 'Magnetische stormen vandaag – Kp-index en 3-daagse verwachting | Weather Pulse'
    },
    // <meta name="description"> of the translated pages (build-main.js); not shown on the page
    description: {
      en: 'Magnetic storms today, tomorrow and for the next 3 days: live Kp index, solar wind and the NOAA forecast. Updates automatically. Storm alerts.',
      de: 'Magnetstürme heute, morgen und in den nächsten 3 Tagen: Kp-Index in Echtzeit, Sonnenwind und NOAA-Vorhersage. Automatisch aktualisiert. Benachrichtigung bei Sturm.',
      it: 'Tempeste magnetiche oggi, domani e nei prossimi 3 giorni: indice Kp in tempo reale, vento solare e previsione NOAA. Aggiornamento automatico. Avviso in caso di tempesta.',
      es: 'Tormentas magnéticas hoy, mañana y en los próximos 3 días: índice Kp en tiempo real, viento solar y pronóstico de la NOAA. Actualización automática. Aviso de tormenta.',
      fr: 'Tempêtes magnétiques aujourd’hui, demain et pour les 3 prochains jours : indice Kp en direct, vent solaire et prévision de la NOAA. Mise à jour automatique. Alertes de tempête.',
      nl: 'Magnetische stormen vandaag, morgen en de komende 3 dagen: live Kp-index, zonnewind en de verwachting van de NOAA. Automatisch bijgewerkt. Stormwaarschuwingen.'
    },
    h1: { en: 'Magnetic storms today and tomorrow', de: 'Magnetstürme heute und morgen', it: 'Tempeste magnetiche oggi e domani', es: 'Tormentas magnéticas hoy y mañana', fr: 'Tempêtes magnétiques aujourd’hui et demain', nl: 'Magnetische stormen vandaag en morgen' },
    intro: {
      en: 'Forecast of magnetic storms (geomagnetic activity) for today and the next 3 days, based on NOAA data. The data update automatically.',
      de: 'Vorhersage der Magnetstürme (geomagnetische Aktivität) für heute und die nächsten 3 Tage nach Daten der NOAA. Die Daten werden automatisch aktualisiert.',
      it: 'Previsione delle tempeste magnetiche (attività geomagnetica) per oggi e i prossimi 3 giorni, con i dati della NOAA. I dati si aggiornano automaticamente.',
      es: 'Pronóstico de tormentas magnéticas (actividad geomagnética) para hoy y los próximos 3 días, con datos de la NOAA. Los datos se actualizan automáticamente.',
      fr: 'Prévision des tempêtes magnétiques (activité géomagnétique) pour aujourd’hui et les 3 prochains jours, d’après les données de la NOAA. Les données se mettent à jour automatiquement.',
      nl: 'Verwachting van magnetische stormen (geomagnetische activiteit) voor vandaag en de komende 3 dagen, op basis van gegevens van de NOAA. De gegevens worden automatisch bijgewerkt.'
    },
    kpNow: { en: 'Kp index now', de: 'Kp-Index aktuell', it: 'Indice Kp ora', es: 'Índice Kp ahora', fr: 'Indice Kp actuel', nl: 'Kp-index nu' },
    loading: { en: 'Loading…', de: 'Wird geladen…', it: 'Caricamento…', es: 'Cargando…', fr: 'Chargement…', nl: 'Laden…' },
    alertsTitle: { en: '🔔 Magnetic storm alert', de: '🔔 Benachrichtigung bei Magnetsturm', it: '🔔 Avviso di tempesta magnetica', es: '🔔 Aviso de tormenta magnética', fr: '🔔 Alerte tempête magnétique', nl: '🔔 Waarschuwing voor magnetische storm' },
    alertsText: {
      en: 'Get a notification on your phone when a storm (Kp 5 or more) is expected in the next 24 hours.',
      de: 'Erhalten Sie eine Benachrichtigung auf dem Handy, wenn in den nächsten 24 Stunden ein Sturm (Kp 5 oder mehr) erwartet wird.',
      it: 'Ricevi una notifica sul telefono quando è prevista una tempesta (Kp 5 o più) nelle prossime 24 ore.',
      es: 'Recibe un aviso en el móvil cuando se espere una tormenta (Kp 5 o más) en las próximas 24 horas.',
      fr: 'Recevez une notification sur votre téléphone quand une tempête (Kp 5 ou plus) est attendue dans les 24 heures.',
      nl: 'Ontvang een melding op uw telefoon wanneer er in de komende 24 uur een storm (Kp 5 of meer) wordt verwacht.'
    },
    q1: { en: 'What is a magnetic storm?', de: 'Was ist ein Magnetsturm?', it: "Che cos'è una tempesta magnetica?", es: '¿Qué es una tormenta magnética?', fr: 'Qu’est-ce qu’une tempête magnétique ?', nl: 'Wat is een magnetische storm?' },
    a1: {
      en: "A magnetic storm is a disturbance of the Earth's magnetic field. It is caused by the solar wind and by plasma ejections from the Sun (CMEs). When such a cloud reaches the Earth, its magnetic field is “shaken”. This can affect satellites, GPS and radio links, and in strong storms the aurora can be seen far to the south.",
      de: 'Ein Magnetsturm ist eine Störung des Erdmagnetfelds. Er wird durch den Sonnenwind und durch Plasmaauswürfe der Sonne (CME) ausgelöst. Erreicht eine solche Wolke die Erde, wird ihr Magnetfeld „durchgeschüttelt“. Das kann Satelliten, GPS und Funkverbindungen beeinträchtigen, und bei starken Stürmen sind Polarlichter weit im Süden zu sehen.',
      it: "Una tempesta magnetica è una perturbazione del campo magnetico terrestre. È causata dal vento solare e dalle espulsioni di plasma dal Sole (CME). Quando una di queste nubi raggiunge la Terra, il suo campo magnetico viene “scosso”. Ciò può influire su satelliti, GPS e collegamenti radio, e durante le tempeste forti l'aurora è visibile molto più a sud.",
      es: 'Una tormenta magnética es una perturbación del campo magnético de la Tierra. La provocan el viento solar y las eyecciones de plasma del Sol (CME). Cuando una de estas nubes llega a la Tierra, su campo magnético se «sacude». Esto puede afectar a los satélites, al GPS y a las comunicaciones por radio, y en las tormentas fuertes la aurora se ve mucho más al sur.',
      fr: 'Une tempête magnétique est une perturbation du champ magnétique terrestre. Elle est provoquée par le vent solaire et par les éjections de plasma du Soleil (CME). Quand un tel nuage atteint la Terre, son champ magnétique est « secoué ». Cela peut perturber les satellites, le GPS et les liaisons radio, et lors de fortes tempêtes, des aurores peuvent être vues loin au sud.',
      nl: 'Een magnetische storm is een verstoring van het magnetisch veld van de aarde. Die wordt veroorzaakt door de zonnewind en door plasma-uitbarstingen van de zon (CME’s). Wanneer zo’n wolk de aarde bereikt, wordt het magnetisch veld ‘door elkaar geschud’. Dat kan satellieten, gps en radioverbindingen storen, en bij zware stormen is het noorderlicht ver naar het zuiden te zien.'
    },
    q2: { en: 'What does the Kp index mean?', de: 'Was bedeutet der Kp-Index?', it: "Che cosa significa l'indice Kp?", es: '¿Qué significa el índice Kp?', fr: 'Que signifie l’indice Kp ?', nl: 'Wat betekent de Kp-index?' },
    a2: {
      en: "The Kp index shows how disturbed the Earth's magnetic field is, on a scale from 0 to 9:",
      de: 'Der Kp-Index zeigt auf einer Skala von 0 bis 9, wie stark das Erdmagnetfeld gestört ist:',
      it: "L'indice Kp indica quanto è perturbato il campo magnetico terrestre, su una scala da 0 a 9:",
      es: 'El índice Kp indica cuánto está perturbado el campo magnético de la Tierra, en una escala de 0 a 9:',
      fr: 'L’indice Kp indique à quel point le champ magnétique terrestre est perturbé, sur une échelle de 0 à 9 :',
      nl: 'De Kp-index geeft aan hoe verstoord het magnetisch veld van de aarde is, op een schaal van 0 tot 9:'
    },
    thLevel: { en: 'Level', de: 'Stufe', it: 'Livello', es: 'Nivel', fr: 'Niveau', nl: 'Niveau' },
    thMeaning: { en: 'What it means', de: 'Bedeutung', it: 'Che cosa significa', es: 'Qué significa', fr: 'Signification', nl: 'Wat het betekent' },
    l0: { en: 'Calm', de: 'Ruhig', it: 'Calmo', es: 'Tranquilo', fr: 'Calme', nl: 'Rustig' },
    m0: { en: 'Normal conditions', de: 'Normaler Zustand', it: 'Condizioni normali', es: 'Condiciones normales', fr: 'Conditions normales', nl: 'Normale omstandigheden' },
    l4: { en: 'Active', de: 'Aktiv', it: 'Attivo', es: 'Activo', fr: 'Actif', nl: 'Actief' },
    m4: { en: 'Increased activity, not a storm', de: 'Erhöhte Aktivität, kein Sturm', it: 'Attività elevata, non è una tempesta', es: 'Actividad elevada, no es una tormenta', fr: 'Activité accrue, pas de tempête', nl: 'Verhoogde activiteit, geen storm' },
    l5: { en: 'G1 — minor storm', de: 'G1 — schwacher Sturm', it: 'G1 — tempesta debole', es: 'G1 — tormenta débil', fr: 'G1 — tempête faible', nl: 'G1 — lichte storm' },
    m5: { en: 'Aurora in northern Scandinavia', de: 'Polarlicht in Nordskandinavien', it: 'Aurora nella Scandinavia settentrionale', es: 'Auroras en el norte de Escandinavia', fr: 'Aurores dans le nord de la Scandinavie', nl: 'Noorderlicht in Noord-Scandinavië' },
    l6: { en: 'G2 — moderate storm', de: 'G2 — mäßiger Sturm', it: 'G2 — tempesta moderata', es: 'G2 — tormenta moderada', fr: 'G2 — tempête modérée', nl: 'G2 — matige storm' },
    m6: { en: 'Aurora in southern Scandinavia', de: 'Polarlicht in Südskandinavien', it: 'Aurora nella Scandinavia meridionale', es: 'Auroras en el sur de Escandinavia', fr: 'Aurores dans le sud de la Scandinavie', nl: 'Noorderlicht in Zuid-Scandinavië' },
    l7: { en: 'G3 — strong storm', de: 'G3 — starker Sturm', it: 'G3 — tempesta forte', es: 'G3 — tormenta fuerte', fr: 'G3 — forte tempête', nl: 'G3 — sterke storm' },
    m7: { en: 'Aurora in northern Europe', de: 'Polarlicht in Nordeuropa', it: 'Aurora nel nord Europa', es: 'Auroras en el norte de Europa', fr: 'Aurores dans le nord de l’Europe', nl: 'Noorderlicht in Noord-Europa' },
    l8: { en: 'G4 — severe storm', de: 'G4 — sehr starker Sturm', it: 'G4 — tempesta molto forte', es: 'G4 — tormenta muy fuerte', fr: 'G4 — tempête sévère', nl: 'G4 — zware storm' },
    m8: { en: 'Aurora in central Europe', de: 'Polarlicht in Mitteleuropa', it: "Aurora nell'Europa centrale", es: 'Auroras en Europa central', fr: 'Aurores en Europe centrale', nl: 'Noorderlicht in Midden-Europa' },
    l9: { en: 'G5 — extreme storm', de: 'G5 — extremer Sturm', it: 'G5 — tempesta estrema', es: 'G5 — tormenta extrema', fr: 'G5 — tempête extrême', nl: 'G5 — extreme storm' },
    m9: { en: 'Aurora may be visible even in Bulgaria', de: 'Polarlicht auch in Bulgarien möglich', it: "L'aurora può essere visibile anche in Bulgaria", es: 'La aurora puede verse incluso en Bulgaria', fr: 'Aurores visibles parfois même en Bulgarie', nl: 'Noorderlicht soms zelfs in Bulgarije te zien' },
    q3: { en: 'How is the forecast made?', de: 'Wie entsteht die Vorhersage?', it: 'Come viene fatta la previsione?', es: '¿Cómo se hace el pronóstico?', fr: 'Comment la prévision est-elle faite ?', nl: 'Hoe wordt de verwachting gemaakt?' },
    a3: {
      en: 'The forecast comes from the NOAA Space Weather Prediction Center, the US space weather service. The SOHO and STEREO satellites photograph the Sun and detect plasma ejections. The DSCOVR satellite, 1.5 million km from the Earth towards the Sun, measures the solar wind 30–60 minutes before it reaches us. A computer model calculates when the cloud will arrive, and forecasters issue the 3-day Kp forecast. It is good for today and tomorrow and indicative for the third day, because the arrival time is uncertain by about ±7–12 hours.',
      de: 'Die Vorhersage stammt vom NOAA Space Weather Prediction Center, dem Weltraumwetterdienst der USA. Die Satelliten SOHO und STEREO fotografieren die Sonne und erkennen Plasmaauswürfe. Der Satellit DSCOVR, 1,5 Millionen km von der Erde in Richtung Sonne, misst den Sonnenwind 30–60 Minuten, bevor er uns erreicht. Ein Computermodell berechnet, wann die Wolke ankommt, und Meteorologen erstellen die Kp-Vorhersage für 3 Tage. Sie ist für heute und morgen zuverlässig und für den dritten Tag eine Orientierung, da die Ankunftszeit um etwa ±7–12 Stunden schwankt.',
      it: "La previsione è del NOAA Space Weather Prediction Center, il servizio statunitense per il meteo spaziale. I satelliti SOHO e STEREO fotografano il Sole e rilevano le espulsioni di plasma. Il satellite DSCOVR, a 1,5 milioni di km dalla Terra in direzione del Sole, misura il vento solare 30–60 minuti prima che ci raggiunga. Un modello al computer calcola quando arriverà la nube e i previsori preparano la previsione del Kp per 3 giorni. È affidabile per oggi e domani e indicativa per il terzo giorno, perché l'orario di arrivo ha un'incertezza di circa ±7–12 ore.",
      es: 'El pronóstico es del NOAA Space Weather Prediction Center, el servicio de meteorología espacial de EE. UU. Los satélites SOHO y STEREO fotografían el Sol y detectan las eyecciones de plasma. El satélite DSCOVR, a 1,5 millones de km de la Tierra en dirección al Sol, mide el viento solar 30–60 minutos antes de que nos alcance. Un modelo informático calcula cuándo llegará la nube y los meteorólogos elaboran el pronóstico de Kp para 3 días. Es fiable para hoy y mañana y orientativo para el tercer día, porque la hora de llegada tiene una incertidumbre de unas ±7–12 horas.',
      fr: 'La prévision vient du NOAA Space Weather Prediction Center, le service américain de météo spatiale. Les satellites SOHO et STEREO photographient le Soleil et détectent les éjections de plasma. Le satellite DSCOVR, à 1,5 million de km de la Terre en direction du Soleil, mesure le vent solaire 30 à 60 minutes avant qu’il ne nous atteigne. Un modèle informatique calcule l’heure d’arrivée du nuage, et les prévisionnistes publient la prévision du Kp à 3 jours. Elle est fiable pour aujourd’hui et demain et indicative pour le troisième jour, car l’heure d’arrivée est incertaine d’environ ±7 à 12 heures.',
      nl: 'De verwachting komt van het NOAA Space Weather Prediction Center, de Amerikaanse dienst voor ruimteweer. De satellieten SOHO en STEREO fotograferen de zon en zien plasma-uitbarstingen. De satelliet DSCOVR, op 1,5 miljoen km van de aarde in de richting van de zon, meet de zonnewind 30–60 minuten voordat die ons bereikt. Een computermodel berekent wanneer de wolk aankomt, en meteorologen geven de Kp-verwachting voor 3 dagen uit. Die is goed voor vandaag en morgen en een indicatie voor de derde dag, omdat de aankomsttijd ongeveer ±7–12 uur onzeker is.'
    },
    q4: { en: 'Do magnetic storms affect health?', de: 'Beeinflussen Magnetstürme die Gesundheit?', it: 'Le tempeste magnetiche influiscono sulla salute?', es: '¿Afectan las tormentas magnéticas a la salud?', fr: 'Les tempêtes magnétiques ont-elles un effet sur la santé ?', nl: 'Hebben magnetische stormen invloed op de gezondheid?' },
    a4: {
      en: 'Research shows no clear effect on most people. Some weather-sensitive people report headaches, fatigue or poor sleep on storm days. If you have health complaints, consult a doctor.',
      de: 'Studien zeigen bei den meisten Menschen keine eindeutige Wirkung. Manche wetterfühlige Menschen berichten an Sturmtagen von Kopfschmerzen, Müdigkeit oder schlechtem Schlaf. Bei gesundheitlichen Beschwerden wenden Sie sich an einen Arzt.',
      it: 'Gli studi non mostrano un effetto chiaro sulla maggior parte delle persone. Alcune persone meteosensibili riferiscono mal di testa, stanchezza o sonno disturbato nei giorni di tempesta. In caso di disturbi, consultate un medico.',
      es: 'Los estudios no muestran un efecto claro en la mayoría de las personas. Algunas personas sensibles al tiempo refieren dolor de cabeza, cansancio o mal sueño en días de tormenta. Si tiene molestias de salud, consulte a un médico.',
      fr: 'La recherche ne montre pas d’effet net sur la plupart des gens. Certaines personnes sensibles à la météo signalent des maux de tête, de la fatigue ou un mauvais sommeil les jours de tempête. En cas de problème de santé, consultez un médecin.',
      nl: 'Onderzoek laat bij de meeste mensen geen duidelijk effect zien. Sommige weergevoelige mensen melden hoofdpijn, vermoeidheid of slecht slapen op stormdagen. Raadpleeg bij gezondheidsklachten een arts.'
    },
    q5: { en: 'Can the aurora be seen in Bulgaria?', de: 'Kann man in Bulgarien Polarlichter sehen?', it: "Si può vedere l'aurora in Bulgaria?", es: '¿Se puede ver la aurora en Bulgaria?', fr: 'Peut-on voir des aurores en Bulgarie ?', nl: 'Is het noorderlicht in Bulgarije te zien?' },
    a5: {
      en: 'Rarely, only in extreme storms with Kp 8–9. That happened in May 2024, when the aurora was seen across Bulgaria low above the northern horizon.',
      de: 'Selten, nur bei extremen Stürmen mit Kp 8–9. So war es im Mai 2024, als das Polarlicht in ganz Bulgarien tief über dem nördlichen Horizont zu sehen war.',
      it: "Raramente, solo durante tempeste estreme con Kp 8–9. È successo nel maggio 2024, quando l'aurora è stata vista in tutta la Bulgaria, bassa sull'orizzonte settentrionale.",
      es: 'Pocas veces, solo en tormentas extremas con Kp 8–9. Así ocurrió en mayo de 2024, cuando la aurora se vio en toda Bulgaria, baja sobre el horizonte norte.',
      fr: 'Rarement, seulement lors de tempêtes extrêmes avec un Kp de 8 à 9. C’est arrivé en mai 2024, quand des aurores ont été vues dans toute la Bulgarie, basses au-dessus de l’horizon nord.',
      nl: 'Zelden, alleen bij extreme stormen met Kp 8–9. Dat gebeurde in mei 2024, toen het noorderlicht in heel Bulgarije laag boven de noordelijke horizon te zien was.'
    },
    widgetTitle: { en: 'Add the forecast to your website', de: 'Die Vorhersage auf Ihrer Website', it: 'Aggiungi la previsione al tuo sito', es: 'Añade el pronóstico a tu web', fr: 'Ajoutez la prévision à votre site', nl: 'Zet de verwachting op uw website' },
    widgetText: {
      en: 'A free card with the Kp index and the 3-day forecast. Copy the code into your website or blog:',
      de: 'Eine kostenlose Karte mit dem Kp-Index und der 3-Tage-Vorhersage. Kopieren Sie den Code in Ihre Website oder Ihren Blog:',
      it: "Una scheda gratuita con l'indice Kp e la previsione a 3 giorni. Copia il codice nel tuo sito o blog:",
      es: 'Una tarjeta gratuita con el índice Kp y el pronóstico de 3 días. Copia el código en tu web o blog:',
      fr: 'Une carte gratuite avec l’indice Kp et la prévision à 3 jours. Copiez le code dans votre site ou votre blog :',
      nl: 'Een gratis kaart met de Kp-index en de 3-daagse verwachting. Kopieer de code naar uw website of blog:'
    }
  };

  // ---- Texts written by this script ----
  const T = {
    kpNow: { bg: 'Kp индекс сега', ...PAGE.kpNow },
    updated: { bg: 'Обновено', en: 'Updated', de: 'Aktualisiert', it: 'Aggiornato', es: 'Actualizado', fr: 'Mis à jour', nl: 'Bijgewerkt' },
    noData: { bg: 'Данните не могат да се заредят в момента.', en: 'The data cannot be loaded right now.', de: 'Die Daten können gerade nicht geladen werden.', it: 'Al momento non è possibile caricare i dati.', es: 'No se pueden cargar los datos en este momento.', fr: 'Impossible de charger les données pour le moment.', nl: 'De gegevens kunnen nu niet worden geladen.' },
    extreme: { bg: 'Изключителна магнитна буря', en: 'Extreme magnetic storm', de: 'Extremer Magnetsturm', it: 'Tempesta magnetica estrema', es: 'Tormenta magnética extrema', fr: 'Tempête magnétique extrême', nl: 'Extreme magnetische storm' },
    severe: { bg: 'Много силна магнитна буря', en: 'Severe magnetic storm', de: 'Sehr starker Magnetsturm', it: 'Tempesta magnetica molto forte', es: 'Tormenta magnética muy fuerte', fr: 'Tempête magnétique sévère', nl: 'Zware magnetische storm' },
    strong: { bg: 'Силна магнитна буря', en: 'Strong magnetic storm', de: 'Starker Magnetsturm', it: 'Tempesta magnetica forte', es: 'Tormenta magnética fuerte', fr: 'Forte tempête magnétique', nl: 'Sterke magnetische storm' },
    moderate: { bg: 'Умерена магнитна буря', en: 'Moderate magnetic storm', de: 'Mäßiger Magnetsturm', it: 'Tempesta magnetica moderata', es: 'Tormenta magnética moderada', fr: 'Tempête magnétique modérée', nl: 'Matige magnetische storm' },
    minor: { bg: 'Слаба магнитна буря', en: 'Minor magnetic storm', de: 'Schwacher Magnetsturm', it: 'Tempesta magnetica debole', es: 'Tormenta magnética débil', fr: 'Tempête magnétique faible', nl: 'Lichte magnetische storm' },
    active: { bg: 'Повишена активност', en: 'Increased activity', de: 'Erhöhte Aktivität', it: 'Attività elevata', es: 'Actividad elevada', fr: 'Activité accrue', nl: 'Verhoogde activiteit' },
    calm: { bg: 'Спокойно', en: 'Calm', de: 'Ruhig', it: 'Calmo', es: 'Tranquilo', fr: 'Calme', nl: 'Rustig' },
    forecastTitle: { bg: 'Прогноза за 3 дни', en: '3-day forecast', de: '3-Tage-Vorhersage', it: 'Previsione a 3 giorni', es: 'Pronóstico de 3 días', fr: 'Prévision à 3 jours', nl: '3-daagse verwachting' },
    today: { bg: 'Днес', en: 'Today', de: 'Heute', it: 'Oggi', es: 'Hoy', fr: 'Aujourd’hui', nl: 'Vandaag' },
    tomorrow: { bg: 'Утре', en: 'Tomorrow', de: 'Morgen', it: 'Domani', es: 'Mañana', fr: 'Demain', nl: 'Morgen' },
    chartLabel: { bg: 'Kp индекс на всеки 3 часа', en: 'Kp index every 3 hours', de: 'Kp-Index alle 3 Stunden', it: 'Indice Kp ogni 3 ore', es: 'Índice Kp cada 3 horas', fr: 'Indice Kp toutes les 3 heures', nl: 'Kp-index elke 3 uur' },
    legend: {
      bg: 'Kp на всеки 3 часа · зелено — спокойно, жълто — буря G1–G2, червено — силна буря',
      en: 'Kp every 3 hours · green — calm, yellow — G1–G2 storm, red — strong storm',
      de: 'Kp alle 3 Stunden · grün — ruhig, gelb — Sturm G1–G2, rot — starker Sturm',
      it: 'Kp ogni 3 ore · verde — calmo, giallo — tempesta G1–G2, rosso — tempesta forte',
      es: 'Kp cada 3 horas · verde — tranquilo, amarillo — tormenta G1–G2, rojo — tormenta fuerte',
      fr: 'Kp toutes les 3 heures · vert — calme, jaune — tempête G1–G2, rouge — forte tempête',
      nl: 'Kp elke 3 uur · groen — rustig, geel — storm G1–G2, rood — sterke storm'
    },
    windTitle: { bg: '☀️ Слънчев вятър сега', en: '☀️ Solar wind now', de: '☀️ Sonnenwind aktuell', it: '☀️ Vento solare ora', es: '☀️ Viento solar ahora', fr: '☀️ Vent solaire en ce moment', nl: '☀️ Zonnewind nu' },
    speed: { bg: 'Скорост', en: 'Speed', de: 'Geschwindigkeit', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', nl: 'Snelheid' },
    windCalm: { bg: 'Спокойно, без буря в следващия час', en: 'Quiet, no storm expected in the next hour', de: 'Ruhig, kein Sturm in der nächsten Stunde erwartet', it: 'Calmo, nessuna tempesta prevista nella prossima ora', es: 'Tranquilo, sin tormenta en la próxima hora', fr: 'Calme, pas de tempête attendue dans l’heure', nl: 'Rustig, geen storm verwacht in het komende uur' },
    windWatch: { bg: 'Възможна повишена активност до час', en: 'Increased activity possible within the hour', de: 'Erhöhte Aktivität innerhalb einer Stunde möglich', it: "Possibile aumento dell'attività entro un'ora", es: 'Posible aumento de actividad en la próxima hora', fr: 'Activité accrue possible dans l’heure', nl: 'Verhoogde activiteit mogelijk binnen een uur' },
    windStorm: { bg: '⚠️ Възможна магнитна буря до час', en: '⚠️ Magnetic storm possible within the hour', de: '⚠️ Magnetsturm innerhalb einer Stunde möglich', it: "⚠️ Possibile tempesta magnetica entro un'ora", es: '⚠️ Posible tormenta magnética en la próxima hora', fr: '⚠️ Tempête magnétique possible dans l’heure', nl: '⚠️ Magnetische storm mogelijk binnen een uur' },
    windNote: {
      bg: 'Измерено от спътника DSCOVR на 1,5 млн. км от Земята; достига до нас за 30–60 минути. Бърз вятър с отрицателно (южно) Bz предизвиква бури. Обновява се на всеки 5 минути.',
      en: 'Measured by the DSCOVR satellite 1.5 million km from the Earth; it reaches us in 30–60 minutes. Fast wind with negative (southward) Bz causes storms. Updated every 5 minutes.',
      de: 'Gemessen vom Satelliten DSCOVR, 1,5 Mio. km von der Erde entfernt; der Wind erreicht uns in 30–60 Minuten. Schneller Wind mit negativem (südlichem) Bz löst Stürme aus. Alle 5 Minuten aktualisiert.',
      it: 'Misurato dal satellite DSCOVR a 1,5 milioni di km dalla Terra; ci raggiunge in 30–60 minuti. Il vento veloce con Bz negativo (verso sud) provoca le tempeste. Aggiornato ogni 5 minuti.',
      es: 'Medido por el satélite DSCOVR a 1,5 millones de km de la Tierra; nos llega en 30–60 minutos. El viento rápido con Bz negativo (hacia el sur) provoca tormentas. Se actualiza cada 5 minutos.',
      fr: 'Mesuré par le satellite DSCOVR à 1,5 million de km de la Terre ; il nous atteint en 30 à 60 minutes. Un vent rapide avec un Bz négatif (vers le sud) provoque des tempêtes. Mis à jour toutes les 5 minutes.',
      nl: 'Gemeten door de satelliet DSCOVR op 1,5 miljoen km van de aarde; de wind bereikt ons in 30–60 minuten. Snelle wind met negatieve (zuidelijke) Bz veroorzaakt stormen. Elke 5 minuten bijgewerkt.'
    },
    outlookTitle: { bg: '📅 Прогноза за 27 дни (NOAA)', en: '📅 27-day outlook (NOAA)', de: '📅 27-Tage-Prognose (NOAA)', it: '📅 Previsione a 27 giorni (NOAA)', es: '📅 Pronóstico de 27 días (NOAA)', fr: '📅 Prévision à 27 jours (NOAA)', nl: '📅 27-daagse vooruitblik (NOAA)' },
    outlookNote: {
      bg: 'Очакван най-висок Kp за всеки ден, по 27-дневното въртене на Слънцето. Ориентировъчно.',
      en: "Expected highest Kp for each day, based on the Sun's 27-day rotation. Indicative only.",
      de: 'Erwarteter höchster Kp für jeden Tag, nach der 27-tägigen Sonnenrotation. Nur zur Orientierung.',
      it: 'Kp massimo previsto per ogni giorno, in base alla rotazione di 27 giorni del Sole. Solo indicativo.',
      es: 'Kp máximo previsto para cada día, según la rotación de 27 días del Sol. Solo orientativo.',
      fr: 'Kp maximal attendu pour chaque jour, d’après la rotation de 27 jours du Soleil. À titre indicatif.',
      nl: 'Verwachte hoogste Kp voor elke dag, op basis van de draaiing van de zon in 27 dagen. Alleen een indicatie.'
    },
    alertsOn: { bg: 'Включи известията', en: 'Turn on alerts', de: 'Benachrichtigungen einschalten', it: 'Attiva gli avvisi', es: 'Activar avisos', fr: 'Activer les alertes', nl: 'Waarschuwingen inschakelen' },
    alertsOff: { bg: 'Изключи известията', en: 'Turn off alerts', de: 'Benachrichtigungen ausschalten', it: 'Disattiva gli avvisi', es: 'Desactivar avisos', fr: 'Désactiver les alertes', nl: 'Waarschuwingen uitschakelen' },
    unsupported: { bg: 'Вашият браузър не поддържа известия.', en: 'Your browser does not support notifications.', de: 'Ihr Browser unterstützt keine Benachrichtigungen.', it: 'Il tuo browser non supporta le notifiche.', es: 'Tu navegador no admite notificaciones.', fr: 'Votre navigateur ne prend pas en charge les notifications.', nl: 'Uw browser ondersteunt geen meldingen.' },
    off: { bg: 'Известията са изключени.', en: 'Alerts are off.', de: 'Benachrichtigungen sind ausgeschaltet.', it: 'Gli avvisi sono disattivati.', es: 'Los avisos están desactivados.', fr: 'Les alertes sont désactivées.', nl: 'Waarschuwingen staan uit.' },
    denied: {
      bg: 'Известията не са разрешени. Можете да ги разрешите от настройките на браузъра за weatherpulse.eu.',
      en: 'Notifications are not allowed. You can allow them in the browser settings for weatherpulse.eu.',
      de: 'Benachrichtigungen sind nicht erlaubt. Sie können sie in den Browsereinstellungen für weatherpulse.eu erlauben.',
      it: 'Le notifiche non sono consentite. Puoi consentirle nelle impostazioni del browser per weatherpulse.eu.',
      es: 'Las notificaciones no están permitidas. Puedes permitirlas en la configuración del navegador para weatherpulse.eu.',
      fr: 'Les notifications ne sont pas autorisées. Vous pouvez les autoriser dans les réglages du navigateur pour weatherpulse.eu.',
      nl: 'Meldingen zijn niet toegestaan. U kunt ze toestaan in de browserinstellingen voor weatherpulse.eu.'
    },
    onBackground: {
      bg: 'Включени. Ще получите известие и когато сайтът е затворен.',
      en: 'On. You will get an alert even when the site is closed.',
      de: 'Eingeschaltet. Sie erhalten auch bei geschlossener Website eine Benachrichtigung.',
      it: 'Attivi. Riceverai un avviso anche quando il sito è chiuso.',
      es: 'Activados. Recibirás un aviso incluso con la web cerrada.',
      fr: 'Activées. Vous recevrez une alerte même quand le site est fermé.',
      nl: 'Aan. U krijgt ook een waarschuwing als de site gesloten is.'
    },
    onForeground: {
      bg: 'Включени. Ще получите известие, когато отворите сайта и се очаква буря. За известия и при затворен сайт инсталирайте сайта като приложение (Chrome на Android).',
      en: 'On. You will get an alert when you open the site and a storm is expected. For alerts while the site is closed, install the site as an app (Chrome on Android).',
      de: 'Eingeschaltet. Sie erhalten eine Benachrichtigung, wenn Sie die Website öffnen und ein Sturm erwartet wird. Für Benachrichtigungen bei geschlossener Website installieren Sie sie als App (Chrome auf Android).',
      it: 'Attivi. Riceverai un avviso quando apri il sito e si prevede una tempesta. Per gli avvisi a sito chiuso, installa il sito come app (Chrome su Android).',
      es: 'Activados. Recibirás un aviso al abrir la web si se espera una tormenta. Para avisos con la web cerrada, instala la web como aplicación (Chrome en Android).',
      fr: 'Activées. Vous recevrez une alerte en ouvrant le site si une tempête est attendue. Pour recevoir des alertes site fermé, installez le site comme application (Chrome sur Android).',
      nl: 'Aan. U krijgt een waarschuwing als u de site opent en er een storm wordt verwacht. Voor waarschuwingen terwijl de site gesloten is, installeert u de site als app (Chrome op Android).'
    },
    onBody: { bg: 'Известията за магнитни бури са включени.', en: 'Magnetic storm alerts are on.', de: 'Benachrichtigungen bei Magnetstürmen sind eingeschaltet.', it: 'Gli avvisi di tempesta magnetica sono attivi.', es: 'Los avisos de tormentas magnéticas están activados.', fr: 'Les alertes de tempête magnétique sont activées.', nl: 'Waarschuwingen voor magnetische stormen staan aan.' },
    alreadyOn: { bg: 'Известията са включени на това устройство.', en: 'Alerts are on for this device.', de: 'Benachrichtigungen sind auf diesem Gerät eingeschaltet.', it: 'Gli avvisi sono attivi su questo dispositivo.', es: 'Los avisos están activados en este dispositivo.', fr: 'Les alertes sont activées sur cet appareil.', nl: 'Waarschuwingen staan aan op dit apparaat.' },
    error: { bg: 'Възникна грешка при включването на известията.', en: 'Something went wrong while turning on alerts.', de: 'Beim Einschalten der Benachrichtigungen ist ein Fehler aufgetreten.', it: "Si è verificato un errore durante l'attivazione degli avvisi.", es: 'Se produjo un error al activar los avisos.', fr: 'Une erreur s’est produite lors de l’activation des alertes.', nl: 'Er ging iets mis bij het inschakelen van de waarschuwingen.' },
    copy: { bg: 'Копирай кода', en: 'Copy code', de: 'Code kopieren', it: 'Copia il codice', es: 'Copiar código', fr: 'Copier le code', nl: 'Code kopiëren' },
    copied: { bg: '✓ Копирано', en: '✓ Copied', de: '✓ Kopiert', it: '✓ Copiato', es: '✓ Copiado', fr: '✓ Copié', nl: '✓ Gekopieerd' },
    ctrlC: { bg: 'Копирайте с Ctrl+C', en: 'Copy with Ctrl+C', de: 'Mit Strg+C kopieren', it: 'Copia con Ctrl+C', es: 'Copia con Ctrl+C', fr: 'Copiez avec Ctrl+C', nl: 'Kopieer met Ctrl+C' },
    widgetName: { bg: 'Магнитни бури — Weather Pulse', en: 'Magnetic storms — Weather Pulse', de: 'Magnetstürme — Weather Pulse', it: 'Tempeste magnetiche — Weather Pulse', es: 'Tormentas magnéticas — Weather Pulse', fr: 'Tempêtes magnétiques — Weather Pulse', nl: 'Magnetische stormen — Weather Pulse' }
  };

  const lang = () => (locales[document.documentElement.lang] ? document.documentElement.lang : 'en');
  const t = key => T[key][lang()] || T[key].en;
  const locale = () => locales[lang()];

  // ---- Static texts: the Bulgarian original is kept to switch back ----
  const original = new Map();
  function translatePage() {
    const language = lang();
    if (!original.has('title')) original.set('title', document.title);
    document.title = language === 'bg' ? original.get('title') : (PAGE.title[language] || PAGE.title.en);
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (!original.has(element)) original.set(element, element.textContent);
      const texts = PAGE[key];
      element.textContent = language === 'bg' || !texts ? original.get(element) : (texts[language] || texts.en);
    });
  }

  // "Kp every 3 hours · green — calm, yellow — G1–G2 storm, red — strong storm" as coloured chips
  function legendHtml() {
    const [head, rest] = t('legend').split(' · ');
    if (!rest) return t('legend');
    const keys = ['calm', 'active', 'storm'];
    const chips = rest.split(', ').map((part, i) => `<span class="chart-key key-${keys[i] || 'calm'}">${(part.split(' — ')[1] || part).trim()}</span>`).join('');
    return `<span class="chart-legend-head">${head}</span>${chips}`;
  }

  function level(kp) {
    return kp >= 7 ? 'storm' : kp >= 5 ? 'active' : 'calm';
  }

  function gScale(kp) {
    return kp >= 5 ? 'G' + Math.min(5, Math.floor(kp) - 4) : '';
  }

  function statusText(kp) {
    if (kp >= 9) return t('extreme');
    if (kp >= 8) return t('severe');
    if (kp >= 7) return t('strong');
    if (kp >= 6) return t('moderate');
    if (kp >= 5) return t('minor');
    if (kp >= 4) return t('active');
    return t('calm');
  }

  function kpScale(kp) {
    let segments = '';
    for (let i = 0; i < 10; i++) segments += `<span class="${i <= Math.round(kp) ? 'on' : ''}"></span>`;
    return `<span class="kp-scale" role="img" aria-label="Kp ${kp} / 9">${segments}</span>`;
  }

  function gBadge(kp) {
    const g = gScale(kp);
    return g ? ` <span class="kp-g-scale">${g}</span>` : '';
  }

  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // The last data, so a language change can redraw without loading again
  const data = { now: null, nowFailed: false, forecast: null, wind: null, outlook: null };

  // ---- Kp now ----
  function renderNow() {
    const box = $('stormNow');
    if (data.nowFailed) {
      box.innerHTML = `<h2>${t('kpNow')}</h2><p>${t('noData')}</p>`;
      return;
    }
    if (!data.now) return;
    const { kp, time } = data.now;
    box.innerHTML =
      `<h2>${t('kpNow')}</h2>` +
      `<div class="storm-now-value kp-${level(kp)}">${kp}</div>` +
      `<div>${kpScale(kp)}${gBadge(kp)}</div>` +
      `<div class="storm-now-status">${statusText(kp)}</div>` +
      `<div class="storm-updated">${t('updated')}: ${time.toLocaleString(locale(), { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>`;
  }

  async function loadNow() {
    try {
      const list = await getJson(KP_NOW_URL);
      const last = list[list.length - 1];
      data.now = {
        kp: Math.round(parseFloat(last.estimated_kp ?? last.kp_index) * 10) / 10,
        time: new Date(last.time_tag + (last.time_tag.endsWith('Z') ? '' : 'Z'))
      };
      data.nowFailed = false;
    } catch (err) {
      console.error('Error loading Kp:', err);
      if (!data.now) data.nowFailed = true;
    }
    renderNow();
  }

  // ---- 3-day forecast, per day and in 3-hour steps ----
  function renderForecast() {
    const box = $('stormForecast');
    if (!data.forecast) return;
    const { points, days } = data.forecast;
    const dayName = (day, index) => index === 0 ? t('today') : index === 1 ? t('tomorrow') : day.date.toLocaleDateString(locale(), { weekday: 'long' });
    const dayCards = days.map((day, index) => {
      const kp = Math.round(day.kp * 10) / 10;
      return `<div class="kp-day"><div class="kp-day-name">${dayName(day, index)}</div>` +
        `<div>Kp ${kp}${kpScale(kp)}</div><div class="kp-day-status">${statusText(kp)}${gBadge(kp)}</div></div>`;
    }).join('');

    // Bars for every 3 hours
    const shown = points.filter(point => days.some(day => day.key === point.dayKey));
    const width = 720, height = 170, pad = { left: 24, right: 6, top: 10, bottom: 34 };
    const barWidth = (width - pad.left - pad.right) / Math.max(1, shown.length);
    const y = kp => pad.top + (9 - kp) * (height - pad.top - pad.bottom) / 9;
    const colors = { calm: '#2ecc71', active: '#f1c40f', storm: '#e74c3c' };
    const bars = shown.map((point, i) => {
      const x = pad.left + i * barWidth;
      const label = point.time.toLocaleString(locale(), { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      return `<rect x="${(x + 1).toFixed(1)}" y="${y(point.kp).toFixed(1)}" width="${(barWidth - 2).toFixed(1)}" height="${(height - pad.bottom - y(point.kp)).toFixed(1)}" fill="${colors[level(point.kp)]}" opacity="${point.kind === 'predicted' ? 0.75 : 1}"><title>${label}: Kp ${point.kp}</title></rect>`;
    }).join('');
    const separators = shown.map((point, i) => {
      if (i === 0 || point.time.getHours() >= 3) return '';
      const x = pad.left + i * barWidth;
      return `<line x1="${x}" x2="${x}" y1="${pad.top}" y2="${height - pad.bottom + 18}" class="chart-grid"/>`;
    }).join('');
    const dayLabels = days.map((day, index) => {
      const first = shown.findIndex(point => point.dayKey === day.key);
      const count = shown.filter(point => point.dayKey === day.key).length;
      const x = pad.left + (first + count / 2) * barWidth;
      return `<text x="${x.toFixed(1)}" y="${height - 8}" text-anchor="middle">${dayName(day, index)}</text>`;
    }).join('');
    const grid = [0, 5, 9].map(kp => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${y(kp)}" y2="${y(kp)}" class="chart-grid"/><text x="${pad.left - 6}" y="${y(kp) + 4}" text-anchor="end">${kp}</text>`).join('');

    box.innerHTML =
      `<h3>${t('forecastTitle')}</h3>` +
      `<div class="kp-days">${dayCards}</div>` +
      `<div class="hourly-chart storm-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('chartLabel')}">${grid}${separators}${bars}${dayLabels}</svg>` +
      `<div class="chart-legend">${legendHtml()}</div></div>`;
    box.hidden = false;
  }

  async function loadForecast() {
    try {
      const list = await getJson(KP_FORECAST_URL);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      // Local calendar day of each point
      const dayKey = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const points = list
        .map(entry => ({ time: new Date(String(entry.time_tag) + 'Z'), kp: parseFloat(entry.kp), kind: entry.observed }))
        .filter(point => !isNaN(point.kp) && point.time >= startOfToday)
        .map(point => ({ ...point, dayKey: dayKey(point.time) }));

      // Highest Kp per local day, for the next 3 days
      const days = [];
      points.forEach(point => {
        let day = days.find(d => d.key === point.dayKey);
        if (!day) {
          if (days.length === 3) return;
          day = { key: point.dayKey, date: point.time, kp: 0 };
          days.push(day);
        }
        day.kp = Math.max(day.kp, point.kp);
      });
      data.forecast = { points, days };
      renderForecast();
    } catch (err) {
      console.error('Error loading Kp forecast:', err);
    }
  }

  // ---- Solar wind now ----
  function renderWind() {
    const box = $('stormWind');
    if (!data.wind) return;
    const { v, bz } = data.wind;
    const status = (bz <= -10 && v >= 500) ? 'storm' : ((bz <= -5 && v >= 400) || v >= 600) ? 'watch' : 'calm';
    const statusKey = { calm: 'windCalm', watch: 'windWatch', storm: 'windStorm' }[status];
    box.innerHTML =
      `<div class="solar-wind"><h3>${t('windTitle')}</h3>` +
      `<div class="solar-wind-values"><span>${t('speed')}: <b>${Math.round(v)} km/s</b></span><span>Bz: <b>${bz > 0 ? '+' : ''}${bz} nT</b></span></div>` +
      `<div class="solar-wind-status wind-${status}">${t(statusKey)}</div>` +
      `<p class="outlook-note">${t('windNote')}</p></div>`;
    box.hidden = false;
  }

  async function loadWind() {
    try {
      const [[speed], [field]] = await Promise.all([getJson(SPEED_URL), getJson(FIELD_URL)]);
      data.wind = { v: Number(speed.proton_speed), bz: Number(field.bz_gsm) };
      renderWind();
    } catch (err) {
      console.error('Error loading solar wind:', err);
    }
  }

  // ---- 27-day outlook ----
  function renderOutlook() {
    const box = $('stormOutlook');
    if (!data.outlook) return;
    const strip = data.outlook.map(day => {
      const label = day.date.toLocaleDateString(locale(), { day: 'numeric', month: 'short', timeZone: 'UTC' });
      return `<span class="outlook-day kp-${level(day.kp)}" title="${label}: Kp ${day.kp}"><span class="outlook-kp">${day.kp}</span><span class="outlook-date">${day.date.getUTCDate()}</span></span>`;
    }).join('');
    box.innerHTML = `<div class="kp-outlook"><h3>${t('outlookTitle')}</h3>` +
      `<div class="outlook-days">${strip}</div>` +
      `<p class="outlook-note">${t('outlookNote')}</p></div>`;
    box.hidden = false;
  }

  async function loadOutlook() {
    try {
      const response = await fetch(OUTLOOK_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const today = new Date().toISOString().slice(0, 10);
      data.outlook = (await response.text()).split('\n')
        .map(line => line.match(/^(\d{4}) (\w{3}) (\d{2})\s+\d+\s+\d+\s+(\d+)/))
        .filter(match => match && match[2] in months)
        .map(match => ({ date: new Date(Date.UTC(+match[1], months[match[2]], +match[3])), kp: Number(match[4]) }))
        .filter(day => day.date.toISOString().slice(0, 10) >= today);
      renderOutlook();
    } catch (err) {
      console.error('Error loading 27-day outlook:', err);
    }
  }

  // ---- Storm notifications ----
  let alertsMessage = ''; // key in T of the message under the button

  function alertsOn() {
    try { return localStorage.getItem(ALERTS_KEY) === 'on'; } catch (e) { return false; }
  }

  function setAlerts(on) {
    try { localStorage.setItem(ALERTS_KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
  }

  function renderAlerts(messageKey) {
    if (messageKey !== undefined) alertsMessage = messageKey;
    $('stormAlertsButton').textContent = t(alertsOn() ? 'alertsOff' : 'alertsOn');
    $('stormAlertsStatus').textContent = alertsMessage ? t(alertsMessage) : '';
  }

  async function toggleAlerts() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      renderAlerts('unsupported');
      return;
    }
    const registration = await navigator.serviceWorker.ready;

    if (alertsOn()) {
      setAlerts(false);
      if ('periodicSync' in registration) {
        try { await registration.periodicSync.unregister('storm-check'); } catch (e) { /* not registered */ }
      }
      renderAlerts('off');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      renderAlerts('denied');
      return;
    }
    setAlerts(true);

    let inBackground = false;
    if ('periodicSync' in registration) {
      try {
        await registration.periodicSync.register('storm-check', { minInterval: 6 * 60 * 60 * 1000 });
        inBackground = true;
      } catch (e) { /* only for installed apps, browser decides */ }
    }
    registration.showNotification('Weather Pulse', {
      body: t('onBody'),
      icon: '/images/icons/icon-192.png',
      tag: 'storm-alerts-on'
    });
    renderAlerts(inBackground ? 'onBackground' : 'onForeground');
  }

  function initAlerts() {
    const button = $('stormAlertsButton');
    if (!button) return;
    button.addEventListener('click', () => toggleAlerts().catch(err => {
      console.error('Storm alerts:', err);
      renderAlerts('error');
    }));
    renderAlerts(alertsOn() ? 'alreadyOn' : '');
  }

  // ---- Widget: code and preview in the page language ----
  function renderWidget() {
    const code = $('widgetCode');
    const preview = $('widgetPreview');
    const button = $('copyWidgetCode');
    const language = lang();
    const query = language === 'bg' ? '' : `?lang=${language}`;
    if (code) code.value = `<iframe src="https://weatherpulse.eu/widget/kp.html${query}" width="320" height="190" style="border:0" title="${t('widgetName')}" loading="lazy"></iframe>`;
    if (preview) {
      const src = `/widget/kp.html${query}`;
      if (preview.getAttribute('src') !== src) preview.setAttribute('src', src);
      preview.title = t('widgetName');
    }
    if (button) button.textContent = t('copy');
  }

  function initWidgetCopy() {
    const button = $('copyWidgetCode');
    const code = $('widgetCode');
    if (!button || !code) return;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.value);
        button.textContent = t('copied');
      } catch (e) {
        code.select();
        button.textContent = t('ctrlC');
      }
      setTimeout(() => { button.textContent = t('copy'); }, 2000);
    });
  }

  function renderAll() {
    translatePage();
    renderNow();
    renderForecast();
    renderWind();
    renderOutlook();
    renderAlerts();
    renderWidget();
  }

  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'language') renderAll();
  });

  translatePage();
  renderWidget();
  loadNow();
  loadForecast();
  loadWind();
  loadOutlook();
  setInterval(loadNow, 5 * 60 * 1000);
  setInterval(loadWind, 5 * 60 * 1000);
  initAlerts();
  initWidgetCopy();
})();
