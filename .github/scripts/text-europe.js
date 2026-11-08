// Texts of the /europe/ pages (build-europe.js) in the five languages. Country names come from
// Intl.DisplayNames (build-europe.js); city names stay as in europe-data.js.
// c = city, k = country, t = how people search for the weather in the local language, link(text) = link to the forecast page.
const bgIn = name => (/^[ВФвф]/.test(name) ? 'във ' : 'в ') + name;

const EUROPE = {
  bg: {
    and: ' и ',
    cityH1: c => `Времето в ${c}`,
    cityTitle: (c, t) => (t ? `${t} – Времето в ${c}, прогноза за 7 дни` : `Времето в ${c} днес – прогноза за 7 дни`),
    cityDescription: (c, k, t) => `Времето в ${c}, ${k} днес: прогноза за утре и следващите 7 дни с температура, валежи и вятър.${t ? ` ${t}.` : ''} Обновява се на всеки час (данни: Open-Meteo).`,
    cityIntro: (c, k, t, local) => `Прогноза за времето в ${c}, ${k}, за днес, утре и следващите 7 дни: температура, валежи, вятър и вероятност за валеж.${t ? ` Местно име: ${local} (${t}).` : ''} Данните са от Open-Meteo и се обновяват на всеки час.`,
    loading: 'Зареждане…', hourly: 'Прогноза по часове →', storms: 'Геомагнитни бури днес →',
    moreIn: k => `Още градове ${bgIn(k)}`, otherCountries: 'Времето в други държави',
    countryH1: k => `Времето ${bgIn(k)} по градове`,
    countryTitle: k => `Времето ${bgIn(k)} по градове – прогноза за 7 дни`,
    countryDescription: (list, k) => `Прогноза за времето за ${list}: текуща температура и прогноза за 7 дни за най-големите градове на ${k}.`,
    countryIntro: link => `Изберете град за прогноза за 7 дни. Температурата се обновява на всеки час. За друго място използвайте търсенето на страница ${link('Прогноза за времето')}.`,
    europeH1: 'Времето в Европа',
    europeTitle: 'Времето в Европа по държави и градове',
    europeDescription: n => `Прогноза за времето за ${n} европейски държави: текуща температура и прогноза за 7 дни за най-големите градове – от Лисабон до Киев и от Рейкявик до Атина.`,
    europeIntro: link => `Изберете държава, после град – за текущото време и прогноза за 7 дни. Данните са от Open-Meteo и се обновяват на всеки час. За друго място използвайте търсенето на страница ${link('Прогноза за времето')}.`,
    bulgaria: 'Времето в България →'
  },
  en: {
    and: ' and ',
    cityH1: c => `Weather in ${c}`,
    cityTitle: (c, t) => (t ? `${t} – Weather in ${c}, 7-day forecast` : `Weather in ${c} today – 7-day forecast`),
    cityDescription: (c, k, t) => `Weather in ${c}, ${k} today: forecast for tomorrow and the next 7 days with temperature, rain and wind.${t ? ` ${t}.` : ''} Updated every hour (data: Open-Meteo).`,
    cityIntro: (c, k, t, local) => `Weather forecast for ${c}, ${k}, for today, tomorrow and the next 7 days: temperature, rain, wind and chance of precipitation.${t ? ` Local name: ${local} (${t}).` : ''} Data from Open-Meteo, updated every hour.`,
    loading: 'Loading…', hourly: 'Hourly forecast →', storms: 'Geomagnetic storms today →',
    moreIn: k => `More cities in ${k}`, otherCountries: 'Weather in other countries',
    countryH1: k => `Weather in ${k} by city`,
    countryTitle: k => `Weather in ${k} by city – 7-day forecast`,
    countryDescription: (list, k) => `Weather forecast for ${list}: current temperature and 7-day forecast for the main cities of ${k}.`,
    countryIntro: link => `Choose a city for the 7-day forecast. The temperature is updated every hour. For any other place use the search on the ${link('weather forecast')} page.`,
    europeH1: 'Weather in Europe',
    europeTitle: 'Weather in Europe by country and city',
    europeDescription: n => `Weather forecast for ${n} European countries: current temperature and 7-day forecast for the main cities, from Lisbon to Kyiv and from Reykjavik to Athens.`,
    europeIntro: link => `Choose a country, then a city, for the current weather and a 7-day forecast. Data from Open-Meteo, updated every hour. For any other place use the search on the ${link('weather forecast')} page.`,
    bulgaria: 'Weather in Bulgaria →'
  },
  de: {
    and: ' und ',
    cityH1: c => `Wetter in ${c}`,
    cityTitle: (c, t) => (t ? `${t} – Wetter in ${c}, 7-Tage-Vorhersage` : `Wetter in ${c} heute – 7-Tage-Vorhersage`),
    cityDescription: (c, k, t) => `Wetter in ${c}, ${k} heute: Vorhersage für morgen und die nächsten 7 Tage mit Temperatur, Regen und Wind.${t ? ` ${t}.` : ''} Stündlich aktualisiert (Daten: Open-Meteo).`,
    cityIntro: (c, k, t, local) => `Wettervorhersage für ${c}, ${k}, für heute, morgen und die nächsten 7 Tage: Temperatur, Regen, Wind und Niederschlagswahrscheinlichkeit.${t ? ` Ortsname: ${local} (${t}).` : ''} Daten von Open-Meteo, stündlich aktualisiert.`,
    loading: 'Wird geladen…', hourly: 'Stundenvorhersage →', storms: 'Geomagnetische Stürme heute →',
    moreIn: k => `Weitere Städte in ${k}`, otherCountries: 'Wetter in anderen Ländern',
    countryH1: k => `Wetter in ${k} nach Städten`,
    countryTitle: k => `Wetter in ${k} nach Städten – 7-Tage-Vorhersage`,
    countryDescription: (list, k) => `Wettervorhersage für ${list}: aktuelle Temperatur und 7-Tage-Vorhersage für die wichtigsten Städte in ${k}.`,
    countryIntro: link => `Wählen Sie eine Stadt für die 7-Tage-Vorhersage. Die Temperatur wird stündlich aktualisiert. Für einen anderen Ort nutzen Sie die Suche auf der Seite ${link('Wettervorhersage')}.`,
    europeH1: 'Wetter in Europa',
    europeTitle: 'Wetter in Europa nach Ländern und Städten',
    europeDescription: n => `Wettervorhersage für ${n} europäische Länder: aktuelle Temperatur und 7-Tage-Vorhersage für die wichtigsten Städte, von Lissabon bis Kiew und von Reykjavik bis Athen.`,
    europeIntro: link => `Wählen Sie ein Land und dann eine Stadt für das aktuelle Wetter und die 7-Tage-Vorhersage. Daten von Open-Meteo, stündlich aktualisiert. Für einen anderen Ort nutzen Sie die Suche auf der Seite ${link('Wettervorhersage')}.`,
    bulgaria: 'Wetter in Bulgarien →'
  },
  it: {
    and: ' e ',
    cityH1: c => `Meteo a ${c}`,
    cityTitle: (c, t) => (t ? `${t} – Meteo a ${c}, previsioni a 7 giorni` : `Meteo a ${c} oggi – previsioni a 7 giorni`),
    cityDescription: (c, k, t) => `Meteo a ${c}, ${k} oggi: previsioni per domani e i prossimi 7 giorni con temperatura, pioggia e vento.${t ? ` ${t}.` : ''} Aggiornato ogni ora (dati: Open-Meteo).`,
    cityIntro: (c, k, t, local) => `Previsioni del tempo a ${c}, ${k}, per oggi, domani e i prossimi 7 giorni: temperatura, pioggia, vento e probabilità di precipitazioni.${t ? ` Nome locale: ${local} (${t}).` : ''} Dati di Open-Meteo, aggiornati ogni ora.`,
    loading: 'Caricamento…', hourly: 'Previsioni orarie →', storms: 'Tempeste geomagnetiche oggi →',
    moreIn: k => `Altre città: ${k}`, otherCountries: 'Meteo in altri paesi',
    countryH1: k => `Meteo: ${k}, per città`,
    countryTitle: k => `Meteo: ${k}, per città – previsioni a 7 giorni`,
    countryDescription: (list, k) => `Previsioni del tempo per ${list}: temperatura attuale e previsioni a 7 giorni per le principali città (${k}).`,
    countryIntro: link => `Scegli una città per le previsioni a 7 giorni. La temperatura si aggiorna ogni ora. Per un altro luogo usa la ricerca nella pagina ${link('Previsioni del tempo')}.`,
    europeH1: 'Meteo in Europa',
    europeTitle: 'Meteo in Europa per paese e città',
    europeDescription: n => `Previsioni del tempo per ${n} paesi europei: temperatura attuale e previsioni a 7 giorni per le principali città, da Lisbona a Kiev e da Reykjavik ad Atene.`,
    europeIntro: link => `Scegli un paese e poi una città per il meteo attuale e le previsioni a 7 giorni. Dati di Open-Meteo, aggiornati ogni ora. Per un altro luogo usa la ricerca nella pagina ${link('Previsioni del tempo')}.`,
    bulgaria: 'Meteo in Bulgaria →'
  },
  es: {
    and: ' y ',
    cityH1: c => `El tiempo en ${c}`,
    cityTitle: (c, t) => (t ? `${t} – El tiempo en ${c}, previsión a 7 días` : `El tiempo en ${c} hoy – previsión a 7 días`),
    cityDescription: (c, k, t) => `El tiempo en ${c}, ${k} hoy: previsión para mañana y los próximos 7 días con temperatura, lluvia y viento.${t ? ` ${t}.` : ''} Actualizado cada hora (datos: Open-Meteo).`,
    cityIntro: (c, k, t, local) => `Previsión del tiempo en ${c}, ${k}, para hoy, mañana y los próximos 7 días: temperatura, lluvia, viento y probabilidad de precipitación.${t ? ` Nombre local: ${local} (${t}).` : ''} Datos de Open-Meteo, actualizados cada hora.`,
    loading: 'Cargando…', hourly: 'Previsión por horas →', storms: 'Tormentas geomagnéticas hoy →',
    moreIn: k => `Más ciudades de ${k}`, otherCountries: 'El tiempo en otros países',
    countryH1: k => `El tiempo en ${k} por ciudades`,
    countryTitle: k => `El tiempo en ${k} por ciudades – previsión a 7 días`,
    countryDescription: (list, k) => `Previsión del tiempo para ${list}: temperatura actual y previsión a 7 días para las principales ciudades de ${k}.`,
    countryIntro: link => `Elige una ciudad para ver la previsión a 7 días. La temperatura se actualiza cada hora. Para otro lugar, usa el buscador de la página ${link('Pronóstico del tiempo')}.`,
    europeH1: 'El tiempo en Europa',
    europeTitle: 'El tiempo en Europa por país y ciudad',
    europeDescription: n => `Previsión del tiempo para ${n} países europeos: temperatura actual y previsión a 7 días para las principales ciudades, de Lisboa a Kiev y de Reikiavik a Atenas.`,
    europeIntro: link => `Elige un país y luego una ciudad para ver el tiempo actual y la previsión a 7 días. Datos de Open-Meteo, actualizados cada hora. Para otro lugar, usa el buscador de la página ${link('Pronóstico del tiempo')}.`,
    bulgaria: 'El tiempo en Bulgaria →'
  }
};

module.exports = { EUROPE };
