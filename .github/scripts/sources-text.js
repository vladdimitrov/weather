// Text of the /contacts/ (data sources) page in the five languages of the site.
// build-pages.js renders Bulgarian into the page and embeds the others; the
// page script swaps them in when the visitor's language is not Bulgarian.
// Each entry is a function of link(url, text) so every language shares the same links.
module.exports = {
  bg: link => ({
    title: 'Източници на данни',
    pageTitle: 'Източници на данни и как се правят прогнозите',
    intro: 'Weather Pulse не изчислява прогнозите сам и няма собствен метеорологичен модел. Сайтът показва данни от открити източници, подрежда ги и добавя оценка колко може да им се вярва. Тук е описано откъде идва всяко число.',
    hForecast: 'Прогнозата за времето',
    forecast1: `Всички прогнози (текущо време, 7 и 16 дни, по часове и на 15 минути) са от ${link('https://open-meteo.com/', 'Open-Meteo')}. Open-Meteo събира резултатите от числените модели на националните метеорологични служби и ги предоставя чрез API. Сайтът ги иска в режима по подразбиране („най-добра комбинация“): за всяко място и час Open-Meteo сам избира или комбинира най-подходящите модели, например ICON на германската служба DWD, IFS на ECMWF, GFS на американската NOAA и модели на Météo-France. Кой точно модел е дал дадено число, Weather Pulse не определя и не показва.`,
    forecast2: 'Прогнозата за първите дни е по-надеждна, а след 7-ия ден е само ориентировъчна, както при всички модели.',
    hCertainty: 'Колко сигурна е прогнозата',
    certaintyIntro: `На страница ${link('/weather/', 'Прогноза за времето', true)} под температурите има още две неща, за да се види несигурността:`,
    liRange: '<strong>Диапазон и надеждност.</strong> Взема се ансамбълът на модела ICON (40 пускания с малко различни начални условия) от Open-Meteo Ensemble API. Показаният диапазон е между 10-ия и 90-ия процент от резултатите, т.е. в него попадат 80% от пусканията. Надеждността зависи от това колко се различават: до 2° разлика в максимума е „надеждна“, до 4° „средно надеждна“, над това „несигурна“. Дните след 7-ия са белязани като „ориентировъчни“.',
    liModels: '<strong>Сравнение на модели.</strong> Таблица „Сравнение на метеорологичните модели“ показва максималната температура и валежа за всеки ден по три отделни модела: ECMWF IFS (Европа), ICON (Германия) и GFS (САЩ). Ако се различават много, прогнозата е несигурна.',
    hAll: 'Всички източници',
    thData: 'Данни',
    thSource: 'Източник',
    rows: [
      ['Прогноза за времето, изгрев и залез', link('https://open-meteo.com/en/docs', 'Open-Meteo Forecast API')],
      ['Диапазон и надеждност (ансамбъл ICON)', link('https://open-meteo.com/en/docs/ensemble-api', 'Open-Meteo Ensemble API')],
      ['Сравнение ECMWF, ICON, GFS', 'Open-Meteo Forecast API с избран модел (ecmwf_ifs025, icon_seamless, gfs_seamless)'],
      ['Климат по месеци на градските страници', `${link('https://open-meteo.com/en/docs/historical-weather-api', 'Open-Meteo Historical Weather API')}: реанализа ERA5, средни стойности за 2015–2024 г.`],
      ['Търсене на места', `${link('https://open-meteo.com/en/docs/geocoding-api', 'Open-Meteo Geocoding API')}, а за „текущо местоположение“ ${link('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')}`],
      ['Магнитни бури, Kp индекс, слънчев вятър', link('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')],
      ['Официални празници', link('https://date.nager.at/', 'Nager.Date')],
      ['Карти (вятър, валежи, облаци, температура)', link('https://www.windy.com/', 'Windy')],
      ['Фаза на Луната', 'Изчислява се в сайта по средния лунен месец (29,53 дни) от известна нова луна, без заявка към външен източник. Подходяща е за ориентир, не за астрономически точни моменти.']
    ],
    hLimits: 'Ограничения',
    limits: [
      'Weather Pulse не е официална метеорологична служба. За предупреждения за опасно време (бури, наводнения, жеги) гледайте националната служба, например НИМХ в България.',
      'Данните са от модели с мрежа от точки, не от измервания на станция. В планини, долини и по брега реалната температура и валеж може да се различават от показаното.',
      'Климатът по градове е от реанализа ERA5 с мрежа около 10 км, затова за планински места може да се различава от измерванията на метеорологична станция.',
      'Open-Meteo е безплатна услуга. Ако няма връзка с нея, сайтът показва съобщение за грешка, а не стари данни.'
    ],
    hContact: 'Контакти',
    contact: `Предложения, грешки и въпроси за данните: <a href="mailto:woodwideweb@yahoo.com">woodwideweb@yahoo.com</a>. Weather Pulse се поддържа от VYZYA. Вижте и ${link('/za-saita/', 'За сайта', true)} и ${link('/poveritelnost/', 'Поверителност', true)}.`
  }),

  en: link => ({
    title: 'Data sources',
    pageTitle: 'Data sources and how the forecasts are made',
    intro: 'Weather Pulse does not calculate the forecasts itself and has no weather model of its own. The site shows data from open sources, arranges it and adds an estimate of how far it can be trusted. This page describes where every number comes from.',
    hForecast: 'The weather forecast',
    forecast1: `All forecasts (current weather, 7 and 16 days, hourly and 15-minute) come from ${link('https://open-meteo.com/', 'Open-Meteo')}. Open-Meteo collects the output of the numerical models of national weather services and serves it through an API. The site asks for it in the default “best match” mode: for each place and hour Open-Meteo itself chooses or combines the most suitable models, for example ICON from the German service DWD, IFS from ECMWF, GFS from the American NOAA and models from Météo-France. Weather Pulse does not decide or show which exact model produced a given number.`,
    forecast2: 'The forecast is more reliable for the first days and only a rough guide after day 7, as with all models.',
    hCertainty: 'How certain is the forecast',
    certaintyIntro: `On the ${link('/weather/', 'weather forecast', true)} page, two more things under the temperatures show the uncertainty:`,
    liRange: '<strong>Range and reliability.</strong> The ICON ensemble (40 runs with slightly different starting conditions) from the Open-Meteo Ensemble API is used. The range shown lies between the 10th and 90th percentile of the runs, so 80% of the runs fall inside it. Reliability depends on how much they disagree: up to 2° spread in the maximum is “Reliable forecast”, up to 4° “Fairly reliable forecast”, more is “Uncertain forecast”. Days after day 7 are marked “Rough forecast”.',
    liModels: '<strong>Model comparison.</strong> The “Compare weather models” table shows the maximum temperature and the rain for each day from three separate models: ECMWF IFS (Europe), ICON (Germany) and GFS (USA). If they differ a lot, the forecast is uncertain.',
    hAll: 'All sources',
    thData: 'Data',
    thSource: 'Source',
    rows: [
      ['Weather forecast, sunrise and sunset', link('https://open-meteo.com/en/docs', 'Open-Meteo Forecast API')],
      ['Range and reliability (ICON ensemble)', link('https://open-meteo.com/en/docs/ensemble-api', 'Open-Meteo Ensemble API')],
      ['ECMWF, ICON, GFS comparison', 'Open-Meteo Forecast API with a chosen model (ecmwf_ifs025, icon_seamless, gfs_seamless)'],
      ['Monthly climate on the city pages', `${link('https://open-meteo.com/en/docs/historical-weather-api', 'Open-Meteo Historical Weather API')}: ERA5 reanalysis, averages for 2015–2024`],
      ['Place search', `${link('https://open-meteo.com/en/docs/geocoding-api', 'Open-Meteo Geocoding API')}, and for “current location” ${link('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')}`],
      ['Geomagnetic storms, Kp index, solar wind', link('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')],
      ['Public holidays', link('https://date.nager.at/', 'Nager.Date')],
      ['Maps (wind, rain, clouds, temperature)', link('https://www.windy.com/', 'Windy')],
      ['Moon phase', 'Calculated on the site from the mean lunar month (29.53 days) counted from a known new moon, with no request to an outside source. Good as a guide, not for astronomically exact moments.']
    ],
    hLimits: 'Limitations',
    limits: [
      'Weather Pulse is not an official weather service. For warnings of dangerous weather (storms, floods, heat) follow your national service.',
      'The data comes from models with a grid of points, not from station measurements. In mountains, valleys and on the coast the real temperature and rain may differ from what is shown.',
      'The climate of each city comes from the ERA5 reanalysis with a grid of about 10 km, so for mountain places it may differ from the measurements of a weather station.',
      'Open-Meteo is a free service. If it cannot be reached, the site shows an error message, not old data.'
    ],
    hContact: 'Contact',
    contact: `Suggestions, errors and questions about the data: <a href="mailto:woodwideweb@yahoo.com">woodwideweb@yahoo.com</a>. Weather Pulse is maintained by VYZYA. See also ${link('/za-saita/', 'About', true)} and ${link('/poveritelnost/', 'Privacy', true)}.`
  }),

  de: link => ({
    title: 'Datenquellen',
    pageTitle: 'Datenquellen und wie die Vorhersagen entstehen',
    intro: 'Weather Pulse berechnet die Vorhersagen nicht selbst und hat kein eigenes Wettermodell. Die Seite zeigt Daten aus offenen Quellen, ordnet sie und fügt eine Einschätzung hinzu, wie verlässlich sie sind. Hier steht, woher jede Zahl kommt.',
    hForecast: 'Die Wettervorhersage',
    forecast1: `Alle Vorhersagen (aktuelles Wetter, 7 und 16 Tage, stündlich und im 15-Minuten-Takt) stammen von ${link('https://open-meteo.com/', 'Open-Meteo')}. Open-Meteo sammelt die Ergebnisse der numerischen Modelle nationaler Wetterdienste und stellt sie über eine API bereit. Die Seite ruft sie im Standardmodus („best match“) ab: Für jeden Ort und jede Stunde wählt Open-Meteo selbst die passendsten Modelle aus oder kombiniert sie, zum Beispiel ICON des Deutschen Wetterdienstes DWD, IFS des ECMWF, GFS der amerikanischen NOAA und Modelle von Météo-France. Welches Modell genau einen Wert geliefert hat, bestimmt und zeigt Weather Pulse nicht.`,
    forecast2: 'Die Vorhersage ist für die ersten Tage verlässlicher und nach dem 7. Tag nur ein grober Anhaltspunkt, wie bei allen Modellen.',
    hCertainty: 'Wie sicher ist die Vorhersage',
    certaintyIntro: `Auf der Seite ${link('/weather/', 'Wettervorhersage', true)} zeigen zwei weitere Angaben unter den Temperaturen die Unsicherheit:`,
    liRange: '<strong>Spanne und Verlässlichkeit.</strong> Verwendet wird das ICON-Ensemble (40 Läufe mit leicht unterschiedlichen Anfangsbedingungen) der Open-Meteo Ensemble API. Die angezeigte Spanne liegt zwischen dem 10. und 90. Perzentil der Läufe, 80 % der Läufe liegen also darin. Die Verlässlichkeit hängt davon ab, wie stark sie voneinander abweichen: bis 2° Unterschied beim Höchstwert ist „Zuverlässige Vorhersage“, bis 4° „Mittel zuverlässige Vorhersage“, mehr ist „Unsichere Vorhersage“. Tage nach dem 7. Tag sind als „Grobe Vorhersage“ markiert.',
    liModels: '<strong>Modellvergleich.</strong> Die Tabelle „Wettermodelle vergleichen“ zeigt für jeden Tag die Höchsttemperatur und den Niederschlag von drei getrennten Modellen: ECMWF IFS (Europa), ICON (Deutschland) und GFS (USA). Weichen sie stark voneinander ab, ist die Vorhersage unsicher.',
    hAll: 'Alle Quellen',
    thData: 'Daten',
    thSource: 'Quelle',
    rows: [
      ['Wettervorhersage, Sonnenauf- und -untergang', link('https://open-meteo.com/en/docs', 'Open-Meteo Forecast API')],
      ['Spanne und Verlässlichkeit (ICON-Ensemble)', link('https://open-meteo.com/en/docs/ensemble-api', 'Open-Meteo Ensemble API')],
      ['Vergleich ECMWF, ICON, GFS', 'Open-Meteo Forecast API mit gewähltem Modell (ecmwf_ifs025, icon_seamless, gfs_seamless)'],
      ['Monatsklima auf den Stadtseiten', `${link('https://open-meteo.com/en/docs/historical-weather-api', 'Open-Meteo Historical Weather API')}: ERA5-Reanalyse, Mittelwerte 2015–2024`],
      ['Ortssuche', `${link('https://open-meteo.com/en/docs/geocoding-api', 'Open-Meteo Geocoding API')}, für „aktueller Standort“ ${link('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')}`],
      ['Magnetstürme, Kp-Index, Sonnenwind', link('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')],
      ['Gesetzliche Feiertage', link('https://date.nager.at/', 'Nager.Date')],
      ['Karten (Wind, Niederschlag, Wolken, Temperatur)', link('https://www.windy.com/', 'Windy')],
      ['Mondphase', 'Wird auf der Seite aus dem mittleren Mondmonat (29,53 Tage) ab einem bekannten Neumond berechnet, ohne Anfrage an eine externe Quelle. Als Anhaltspunkt geeignet, nicht für astronomisch genaue Zeitpunkte.']
    ],
    hLimits: 'Einschränkungen',
    limits: [
      'Weather Pulse ist kein amtlicher Wetterdienst. Für Warnungen vor gefährlichem Wetter (Unwetter, Hochwasser, Hitze) beachten Sie Ihren nationalen Wetterdienst.',
      'Die Daten stammen aus Modellen mit einem Punktraster, nicht aus Stationsmessungen. In Bergen, Tälern und an der Küste können Temperatur und Niederschlag in Wirklichkeit vom Angezeigten abweichen.',
      'Das Klima der Städte stammt aus der ERA5-Reanalyse mit einem Raster von etwa 10 km und kann daher an Bergorten von den Messungen einer Wetterstation abweichen.',
      'Open-Meteo ist ein kostenloser Dienst. Ist er nicht erreichbar, zeigt die Seite eine Fehlermeldung und keine alten Daten.'
    ],
    hContact: 'Kontakt',
    contact: `Vorschläge, Fehler und Fragen zu den Daten: <a href="mailto:woodwideweb@yahoo.com">woodwideweb@yahoo.com</a>. Weather Pulse wird von VYZYA betrieben. Siehe auch ${link('/za-saita/', 'Über die Seite', true)} und ${link('/poveritelnost/', 'Datenschutz', true)}.`
  }),

  it: link => ({
    title: 'Fonti dei dati',
    pageTitle: 'Fonti dei dati e come si fanno le previsioni',
    intro: 'Weather Pulse non calcola le previsioni da sé e non ha un proprio modello meteorologico. Il sito mostra dati da fonti aperte, li ordina e aggiunge una stima di quanto ci si può fidare. Qui è descritto da dove viene ogni numero.',
    hForecast: 'La previsione del tempo',
    forecast1: `Tutte le previsioni (tempo attuale, 7 e 16 giorni, orarie e ogni 15 minuti) provengono da ${link('https://open-meteo.com/', 'Open-Meteo')}. Open-Meteo raccoglie i risultati dei modelli numerici dei servizi meteorologici nazionali e li offre tramite API. Il sito li richiede nella modalità predefinita („best match“): per ogni luogo e ora Open-Meteo sceglie o combina da sé i modelli più adatti, per esempio ICON del servizio tedesco DWD, IFS dell'ECMWF, GFS dell'americana NOAA e modelli di Météo-France. Quale modello abbia prodotto un dato valore, Weather Pulse non lo stabilisce né lo mostra.`.replace('„best match“', '“best match”'),
    forecast2: 'La previsione è più affidabile per i primi giorni e dopo il 7º giorno è solo indicativa, come per tutti i modelli.',
    hCertainty: 'Quanto è sicura la previsione',
    certaintyIntro: `Nella pagina ${link('/weather/', 'Previsioni del tempo', true)}, sotto le temperature, altri due elementi mostrano l'incertezza:`,
    liRange: '<strong>Intervallo e affidabilità.</strong> Si usa l\'ensemble del modello ICON (40 esecuzioni con condizioni iniziali leggermente diverse) dell\'Open-Meteo Ensemble API. L\'intervallo mostrato va dal 10º al 90º percentile dei risultati, quindi comprende l\'80% delle esecuzioni. L\'affidabilità dipende da quanto divergono: fino a 2° di differenza nella massima è «Previsione affidabile», fino a 4° «Previsione abbastanza affidabile», oltre «Previsione incerta». I giorni dopo il 7º sono segnati come «Previsione indicativa».',
    liModels: '<strong>Confronto dei modelli.</strong> La tabella «Confronto dei modelli meteo» mostra la temperatura massima e la pioggia di ogni giorno secondo tre modelli distinti: ECMWF IFS (Europa), ICON (Germania) e GFS (USA). Se differiscono molto, la previsione è incerta.',
    hAll: 'Tutte le fonti',
    thData: 'Dati',
    thSource: 'Fonte',
    rows: [
      ['Previsioni, alba e tramonto', link('https://open-meteo.com/en/docs', 'Open-Meteo Forecast API')],
      ['Intervallo e affidabilità (ensemble ICON)', link('https://open-meteo.com/en/docs/ensemble-api', 'Open-Meteo Ensemble API')],
      ['Confronto ECMWF, ICON, GFS', 'Open-Meteo Forecast API con modello scelto (ecmwf_ifs025, icon_seamless, gfs_seamless)'],
      ['Clima mensile nelle pagine delle città', `${link('https://open-meteo.com/en/docs/historical-weather-api', 'Open-Meteo Historical Weather API')}: rianalisi ERA5, medie 2015–2024`],
      ['Ricerca dei luoghi', `${link('https://open-meteo.com/en/docs/geocoding-api', 'Open-Meteo Geocoding API')}, e per «posizione attuale» ${link('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')}`],
      ['Tempeste magnetiche, indice Kp, vento solare', link('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')],
      ['Giorni festivi', link('https://date.nager.at/', 'Nager.Date')],
      ['Mappe (vento, pioggia, nuvole, temperatura)', link('https://www.windy.com/', 'Windy')],
      ['Fase lunare', 'Calcolata nel sito dal mese lunare medio (29,53 giorni) a partire da una luna nuova nota, senza richiesta a una fonte esterna. Adatta come indicazione, non per momenti astronomicamente esatti.']
    ],
    hLimits: 'Limiti',
    limits: [
      'Weather Pulse non è un servizio meteorologico ufficiale. Per le allerte di maltempo (temporali, alluvioni, caldo) consultate il servizio nazionale.',
      'I dati provengono da modelli con una griglia di punti, non da misure di stazione. In montagna, nelle valli e sulla costa temperatura e pioggia reali possono differire da quanto mostrato.',
      'Il clima delle città proviene dalla rianalisi ERA5 con una griglia di circa 10 km, quindi per le località di montagna può differire dalle misure di una stazione meteorologica.',
      'Open-Meteo è un servizio gratuito. Se non è raggiungibile, il sito mostra un messaggio di errore e non dati vecchi.'
    ],
    hContact: 'Contatti',
    contact: `Suggerimenti, errori e domande sui dati: <a href="mailto:woodwideweb@yahoo.com">woodwideweb@yahoo.com</a>. Weather Pulse è gestito da VYZYA. Vedi anche ${link('/za-saita/', 'Informazioni sul sito', true)} e ${link('/poveritelnost/', 'Privacy', true)}.`
  }),

  es: link => ({
    title: 'Fuentes de datos',
    pageTitle: 'Fuentes de datos y cómo se hacen las previsiones',
    intro: 'Weather Pulse no calcula las previsiones por sí mismo y no tiene un modelo meteorológico propio. El sitio muestra datos de fuentes abiertas, los ordena y añade una estimación de cuánto se puede confiar en ellos. Aquí se describe de dónde viene cada cifra.',
    hForecast: 'La previsión del tiempo',
    forecast1: `Todas las previsiones (tiempo actual, 7 y 16 días, por horas y cada 15 minutos) proceden de ${link('https://open-meteo.com/', 'Open-Meteo')}. Open-Meteo reúne los resultados de los modelos numéricos de los servicios meteorológicos nacionales y los ofrece mediante una API. El sitio los pide en el modo predeterminado («best match»): para cada lugar y hora, Open-Meteo elige o combina por sí mismo los modelos más adecuados, por ejemplo ICON del servicio alemán DWD, IFS del ECMWF, GFS de la estadounidense NOAA y modelos de Météo-France. Qué modelo concreto ha dado una cifra, Weather Pulse no lo determina ni lo muestra.`,
    forecast2: 'La previsión es más fiable para los primeros días y, pasado el día 7, solo orientativa, como en todos los modelos.',
    hCertainty: 'Qué seguridad tiene la previsión',
    certaintyIntro: `En la página ${link('/weather/', 'Pronóstico del tiempo', true)}, bajo las temperaturas, otros dos elementos muestran la incertidumbre:`,
    liRange: '<strong>Rango y fiabilidad.</strong> Se usa el conjunto (ensemble) del modelo ICON (40 ejecuciones con condiciones iniciales ligeramente distintas) de la Open-Meteo Ensemble API. El rango mostrado va del percentil 10 al 90 de los resultados, es decir, incluye el 80 % de las ejecuciones. La fiabilidad depende de cuánto difieren: hasta 2° de diferencia en la máxima es «Pronóstico fiable», hasta 4° «Pronóstico bastante fiable», más es «Pronóstico incierto». Los días posteriores al 7 se marcan como «Pronóstico orientativo».',
    liModels: '<strong>Comparación de modelos.</strong> La tabla «Comparar modelos meteorológicos» muestra la temperatura máxima y la lluvia de cada día según tres modelos distintos: ECMWF IFS (Europa), ICON (Alemania) y GFS (EE. UU.). Si difieren mucho, la previsión es incierta.',
    hAll: 'Todas las fuentes',
    thData: 'Datos',
    thSource: 'Fuente',
    rows: [
      ['Previsión, amanecer y atardecer', link('https://open-meteo.com/en/docs', 'Open-Meteo Forecast API')],
      ['Rango y fiabilidad (ensemble ICON)', link('https://open-meteo.com/en/docs/ensemble-api', 'Open-Meteo Ensemble API')],
      ['Comparación ECMWF, ICON, GFS', 'Open-Meteo Forecast API con el modelo elegido (ecmwf_ifs025, icon_seamless, gfs_seamless)'],
      ['Clima mensual en las páginas de ciudades', `${link('https://open-meteo.com/en/docs/historical-weather-api', 'Open-Meteo Historical Weather API')}: reanálisis ERA5, medias de 2015–2024`],
      ['Búsqueda de lugares', `${link('https://open-meteo.com/en/docs/geocoding-api', 'Open-Meteo Geocoding API')}, y para «ubicación actual» ${link('https://nominatim.openstreetmap.org/', 'OpenStreetMap Nominatim')}`],
      ['Tormentas geomagnéticas, índice Kp, viento solar', link('https://www.swpc.noaa.gov/', 'NOAA Space Weather Prediction Center')],
      ['Festivos oficiales', link('https://date.nager.at/', 'Nager.Date')],
      ['Mapas (viento, lluvia, nubes, temperatura)', link('https://www.windy.com/', 'Windy')],
      ['Fase lunar', 'Se calcula en el sitio a partir del mes lunar medio (29,53 días) contado desde una luna nueva conocida, sin consultar una fuente externa. Sirve como referencia, no para momentos astronómicamente exactos.']
    ],
    hLimits: 'Limitaciones',
    limits: [
      'Weather Pulse no es un servicio meteorológico oficial. Para avisos de tiempo peligroso (tormentas, inundaciones, calor) consulte el servicio nacional.',
      'Los datos proceden de modelos con una cuadrícula de puntos, no de mediciones de estaciones. En montañas, valles y en la costa, la temperatura y la lluvia reales pueden diferir de lo mostrado.',
      'El clima de las ciudades procede del reanálisis ERA5 con una cuadrícula de unos 10 km, por lo que en lugares de montaña puede diferir de las mediciones de una estación meteorológica.',
      'Open-Meteo es un servicio gratuito. Si no se puede acceder a él, el sitio muestra un mensaje de error y no datos antiguos.'
    ],
    hContact: 'Contacto',
    contact: `Sugerencias, errores y preguntas sobre los datos: <a href="mailto:woodwideweb@yahoo.com">woodwideweb@yahoo.com</a>. Weather Pulse lo mantiene VYZYA. Vea también ${link('/za-saita/', 'Acerca del sitio', true)} y ${link('/poveritelnost/', 'Privacidad', true)}.`
  })
};
