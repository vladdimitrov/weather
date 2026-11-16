// City pages (/vremeto/<city>/): current weather and a 7-day forecast for the
// coordinates in #cityForecast. Hub page (/vremeto/): current temperature on
// every .city-tile in #cityList, in one request. Data: Open-Meteo.
(function () {
  const API = 'https://api.open-meteo.com/v1/forecast';

  // WMO weather codes, grouped (as in /js/home-weather.js)
  const conditions = [
    { codes: [0], key: 'sun', icon: '☀️', text: { en: 'Clear', bg: 'Ясно', de: 'Klar', it: 'Sereno', es: 'Despejado', fr: 'Dégagé', nl: 'Helder' } },
    { codes: [1, 2], key: 'cloudSun', icon: '⛅', text: { en: 'Partly cloudy', bg: 'Променлива облачност', de: 'Wechselnd bewölkt', it: 'Poco nuvoloso', es: 'Parcialmente nublado', fr: 'Partiellement nuageux', nl: 'Half bewolkt' } },
    { codes: [3], key: 'cloud', icon: '☁️', text: { en: 'Cloudy', bg: 'Облачно', de: 'Bewölkt', it: 'Nuvoloso', es: 'Nublado', fr: 'Nuageux', nl: 'Bewolkt' } },
    { codes: [45, 48], key: 'fog', icon: '🌫️', text: { en: 'Fog', bg: 'Мъгла', de: 'Nebel', it: 'Nebbia', es: 'Niebla', fr: 'Brouillard', nl: 'Mist' } },
    { codes: [51, 53, 55, 56, 57], key: 'drizzle', icon: '🌦️', text: { en: 'Drizzle', bg: 'Ръмеж', de: 'Nieselregen', it: 'Pioviggine', es: 'Llovizna', fr: 'Bruine', nl: 'Motregen' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], key: 'rain', icon: '🌧️', text: { en: 'Rain', bg: 'Дъжд', de: 'Regen', it: 'Pioggia', es: 'Lluvia', fr: 'Pluie', nl: 'Regen' } },
    { codes: [71, 73, 75, 77, 85, 86], key: 'snow', icon: '❄️', text: { en: 'Snow', bg: 'Сняг', de: 'Schnee', it: 'Neve', es: 'Nieve', fr: 'Neige', nl: 'Sneeuw' } },
    { codes: [95, 96, 99], key: 'thunder', icon: '⛈️', text: { en: 'Thunderstorm', bg: 'Гръмотевична буря', de: 'Gewitter', it: 'Temporale', es: 'Tormenta', fr: 'Orage', nl: 'Onweer' } }
  ];
  const condition = code => conditions.find(c => c.codes.includes(code)) || conditions[2];

  const T = {
    en: { now: 'Now', feels: 'feels like', wind: 'Wind', humidity: 'Humidity', days: '7-day forecast', hourly: 'Hourly forecast →', today: 'Today', tomorrow: 'Tomorrow', rain: 'chance of rain', error: 'The forecast could not be loaded. Please try again later.', locale: 'en-GB' },
    bg: { now: 'Сега', feels: 'усеща се като', wind: 'Вятър', humidity: 'Влажност', days: 'Прогноза за 7 дни', hourly: 'По часове →', today: 'Днес', tomorrow: 'Утре', rain: 'вероятност за валеж', error: 'Прогнозата не може да се зареди. Опитайте отново по-късно.', locale: 'bg-BG' },
    de: { now: 'Jetzt', feels: 'gefühlt', wind: 'Wind', humidity: 'Luftfeuchte', days: '7-Tage-Vorhersage', hourly: 'Stündlich →', today: 'Heute', tomorrow: 'Morgen', rain: 'Regenwahrscheinlichkeit', error: 'Die Vorhersage konnte nicht geladen werden. Bitte versuchen Sie es später erneut.', locale: 'de-DE' },
    it: { now: 'Ora', feels: 'percepita', wind: 'Vento', humidity: 'Umidità', days: 'Previsioni a 7 giorni', hourly: 'Ora per ora →', today: 'Oggi', tomorrow: 'Domani', rain: 'probabilità di pioggia', error: 'Non è stato possibile caricare le previsioni. Riprova più tardi.', locale: 'it-IT' },
    es: { now: 'Ahora', feels: 'sensación', wind: 'Viento', humidity: 'Humedad', days: 'Previsión a 7 días', hourly: 'Por horas →', today: 'Hoy', tomorrow: 'Mañana', rain: 'probabilidad de lluvia', error: 'No se pudo cargar la previsión. Inténtalo de nuevo más tarde.', locale: 'es-ES' },
    fr: { now: 'Maintenant', feels: 'ressenti', wind: 'Vent', humidity: 'Humidité', days: 'Prévisions à 7 jours', hourly: 'Heure par heure →', today: 'Aujourd’hui', tomorrow: 'Demain', rain: 'probabilité de pluie', error: 'Impossible de charger les prévisions. Réessayez plus tard.', locale: 'fr-FR' },
    nl: { now: 'Nu', feels: 'voelt als', wind: 'Wind', humidity: 'Luchtvochtigheid', days: '7-daagse verwachting', hourly: 'Per uur →', today: 'Vandaag', tomorrow: 'Morgen', rain: 'kans op regen', error: 'De verwachting kon niet worden geladen. Probeer het later opnieuw.', locale: 'nl-NL' }
  };
  const t = () => T[document.documentElement.lang] || T.en;
  // Gusts and warnings: our own (gusts of the strongest model) and the official ones of NIMH
  // (/data/warnings-bg.json, written by .github/scripts/build-warnings.js, Bulgarian cities only)
  const STRONG = 60; // km/h: gusts that break branches; 90 and more: very strong
  const WIND = {
    en: { gusts: 'gusts', official: 'Warning of NIMH', levels: { yellow: 'yellow', orange: 'orange', red: 'red' }, code: 'code' },
    bg: { gusts: 'пориви', official: 'Предупреждение на НИМХ', levels: { yellow: 'жълт', orange: 'оранжев', red: 'червен' }, code: 'код' },
    de: { gusts: 'Böen', official: 'Warnung des NIMH', levels: { yellow: 'gelb', orange: 'orange', red: 'rot' }, code: 'Stufe' },
    it: { gusts: 'raffiche', official: 'Allerta del NIMH', levels: { yellow: 'gialla', orange: 'arancione', red: 'rossa' }, code: 'allerta' },
    es: { gusts: 'rachas', official: 'Aviso del NIMH', levels: { yellow: 'amarillo', orange: 'naranja', red: 'rojo' }, code: 'aviso' },
    fr: { gusts: 'rafales', official: 'Vigilance du NIMH', levels: { yellow: 'jaune', orange: 'orange', red: 'rouge' }, code: 'vigilance' },
    nl: { gusts: 'windstoten', official: 'Waarschuwing van het NIMH', levels: { yellow: 'geel', orange: 'oranje', red: 'rood' }, code: 'code' }
  };
  const wind = () => WIND[document.documentElement.lang] || WIND.en;
  // Our own warnings from the daily forecast of today and tomorrow (gusts: the strongest model,
  // the rest: the median of the models). Each rule is left out when NIMH has an official warning
  // of one of its kinds for the province. The levels are ours, near the yellow and orange codes of
  // NIMH; they are not official. Used above the forecast of the city pages, on
  // /vremeto/preduprezhdeniya/ (window.WeatherHazards) and by .github/scripts/build-forecast.js.
  const HAZARDS = {
    rules: [
      { type: 'wind', key: 'wind_gusts_10m_max', limits: [60, 90], official: ['wind'] },
      { type: 'rain', key: 'precipitation_sum', limits: [25, 50], official: ['rain', 'rain-flood', 'flooding', 'thunderstorm'] },
      { type: 'snow', key: 'snowfall_sum', limits: [10, 25], official: ['snow-ice', 'snow'] },
      { type: 'cold', key: 'temperature_2m_min', limits: [-12, -18], below: true, official: ['low-temperature'] },
      { type: 'heat', key: 'temperature_2m_max', limits: [35, 38], official: ['high-temperature'] }
    ],
    text: {
      en: { when: ['today', 'tomorrow'], wind: (v, w, o) => `${o ? 'Very strong' : 'Strong'} wind gusts ${w}: up to ${v} km/h`, rain: (v, w, o) => `${o ? 'Very heavy' : 'Heavy'} rain ${w}: about ${v} mm`, snow: (v, w, o) => `${o ? 'Very heavy' : 'Heavy'} snowfall ${w}: about ${v} cm of new snow`, cold: (v, w, o) => `${o ? 'Severe' : 'Strong'} frost ${w}: down to ${v}`, heat: (v, w, o) => `${o ? 'Extreme' : 'Strong'} heat ${w}: up to ${v}` },
      bg: { when: ['днес', 'утре'], wind: (v, w, o) => `${o ? 'Много силни' : 'Силни'} пориви на вятъра ${w}: до ${v} км/ч`, rain: (v, w, o) => `${o ? 'Много обилен' : 'Обилен'} валеж ${w}: около ${v} л/м²`, snow: (v, w, o) => `${o ? 'Много обилен' : 'Обилен'} снеговалеж ${w}: около ${v} см нов сняг`, cold: (v, w, o) => `${o ? 'Много силен' : 'Силен'} студ ${w}: до ${v}`, heat: (v, w, o) => `${o ? 'Силна жега' : 'Жега'} ${w}: до ${v}` },
      de: { when: ['heute', 'morgen'], wind: (v, w, o) => `${o ? 'Sehr starke' : 'Starke'} Windböen ${w}: bis ${v} km/h`, rain: (v, w, o) => `${o ? 'Sehr starker' : 'Starker'} Regen ${w}: etwa ${v} mm`, snow: (v, w, o) => `${o ? 'Sehr starker' : 'Starker'} Schneefall ${w}: etwa ${v} cm Neuschnee`, cold: (v, w, o) => `${o ? 'Sehr strenger' : 'Strenger'} Frost ${w}: bis ${v}`, heat: (v, w, o) => `${o ? 'Extreme' : 'Starke'} Hitze ${w}: bis ${v}` },
      it: { when: ['oggi', 'domani'], wind: (v, w, o) => `Raffiche di vento ${o ? 'molto forti' : 'forti'} ${w}: fino a ${v} km/h`, rain: (v, w, o) => `Pioggia ${o ? 'molto intensa' : 'intensa'} ${w}: circa ${v} mm`, snow: (v, w, o) => `Nevicata ${o ? 'molto abbondante' : 'abbondante'} ${w}: circa ${v} cm di neve fresca`, cold: (v, w, o) => `Gelo ${o ? 'molto intenso' : 'intenso'} ${w}: fino a ${v}`, heat: (v, w, o) => `Caldo ${o ? 'estremo' : 'intenso'} ${w}: fino a ${v}` },
      es: { when: ['hoy', 'mañana'], wind: (v, w, o) => `Rachas de viento ${o ? 'muy fuertes' : 'fuertes'} ${w}: hasta ${v} km/h`, rain: (v, w, o) => `Lluvia ${o ? 'muy intensa' : 'intensa'} ${w}: unos ${v} mm`, snow: (v, w, o) => `Nevada ${o ? 'muy abundante' : 'abundante'} ${w}: unos ${v} cm de nieve nueva`, cold: (v, w, o) => `Helada ${o ? 'muy fuerte' : 'fuerte'} ${w}: hasta ${v}`, heat: (v, w, o) => `Calor ${o ? 'extremo' : 'intenso'} ${w}: hasta ${v}` },
      fr: { when: ['aujourd’hui', 'demain'], wind: (v, w, o) => `Rafales de vent ${o ? 'très fortes' : 'fortes'} ${w} : jusqu’à ${v} km/h`, rain: (v, w, o) => `Pluie ${o ? 'très forte' : 'forte'} ${w} : environ ${v} mm`, snow: (v, w, o) => `Chutes de neige ${o ? 'très abondantes' : 'abondantes'} ${w} : environ ${v} cm de neige fraîche`, cold: (v, w, o) => `Gel ${o ? 'très fort' : 'fort'} ${w} : jusqu’à ${v}`, heat: (v, w, o) => `Chaleur ${o ? 'extrême' : 'forte'} ${w} : jusqu’à ${v}` },
      nl: { when: ['vandaag', 'morgen'], wind: (v, w, o) => `${o ? 'Zeer zware' : 'Zware'} windstoten ${w}: tot ${v} km/u`, rain: (v, w, o) => `${o ? 'Zeer zware' : 'Zware'} regen ${w}: ongeveer ${v} mm`, snow: (v, w, o) => `${o ? 'Zeer zware' : 'Zware'} sneeuwval ${w}: ongeveer ${v} cm verse sneeuw`, cold: (v, w, o) => `${o ? 'Zeer strenge' : 'Strenge'} vorst ${w}: tot ${v}`, heat: (v, w, o) => `${o ? 'Extreme' : 'Grote'} hitte ${w}: tot ${v}` }
    },
    // daily: Open-Meteo "daily"; official: the official warnings of the place ([{ type }]).
    // Gives [{ type, level: 'yellow' | 'orange', day: 0 | 1, text }], the worse day of each rule.
    list(daily, lang, official) {
      const text = this.text[lang] || this.text.en;
      const kinds = new Set((official || []).map(w => w.type));
      const out = [];
      this.rules.forEach(rule => {
        if (rule.official.some(kind => kinds.has(kind))) return;
        const values = (daily && daily[rule.key]) || [];
        const sign = rule.below ? -1 : 1;
        let best = null;
        [0, 1].forEach(day => {
          const value = values[day];
          if (typeof value !== 'number' || sign * value < sign * rule.limits[0]) return;
          if (!best || sign * value > sign * best.value) best = { day, value };
        });
        if (!best) return;
        const orange = sign * best.value >= sign * rule.limits[1];
        const r = Math.round(best.value);
        const shown = rule.type === 'cold' || rule.type === 'heat' ? `${r < 0 ? '−' : ''}${Math.abs(r)}°` : r;
        out.push({ type: rule.type, level: orange ? 'orange' : 'yellow', day: best.day, text: text[rule.type](shown, text.when[best.day], orange) });
      });
      return out;
    }
  };
  window.WeatherHazards = HAZARDS;
  // How sure the forecast of each day is, from how far apart the models are (data.spread of
  // js/forecast-core.js: the lowest and the highest of ECMWF, ICON and GFS for each day):
  //   high    highs and lows within 2.5° of each other, and the models agree on rain or dry
  //   medium  up to 5° apart, or one model gives 2 mm or more where another gives (almost) nothing
  //   low     more than 5° apart, or one model gives 5 mm or more where another gives nothing
  // Shown as a line on the uncertain days and as one sentence under the days; also used by
  // .github/scripts/build-forecast.js for the forecast written into the HTML.
  const CONFIDENCE = {
    day(spread, i) {
      const daily = spread && spread.daily;
      if (!daily || !daily.temperature_2m_max) return null;
      const gap = key => (daily[key] && typeof daily[key].max[i] === 'number' ? daily[key].max[i] - daily[key].min[i] : 0);
      const temp = Math.max(gap('temperature_2m_max'), gap('temperature_2m_min'));
      const rain = daily.precipitation_sum || { min: [], max: [] };
      const wetMax = rain.max[i] || 0, wetMin = rain.min[i] || 0;
      // Thresholds from the usual gap between the three models over Bulgaria: 1–3° for the first days and
      // 3–5° later in the week are normal and say nothing, so only a larger gap is marked
      const split = wetMax >= 5 && wetMin < 0.5;
      const level = temp > 6 || (wetMax >= 10 && wetMin < 0.5) ? 2 : temp > 4 || split ? 1 : 0;
      return { level, temp: Math.round(temp), split };
    },
    text: {
      en: { levels: ['', 'less certain', 'uncertain'], tip: 'How far apart the ECMWF, ICON and GFS models are for this day',
        all: 'The ECMWF, ICON and GFS models agree on all these days, so the forecast is fairly certain.',
        until: (day, why) => `The models agree up to ${day}; after that the forecast is less certain (${why}).`,
        early: (day, why) => `The models already disagree for ${day} (${why}), so check the forecast again later.`,
        temp: d => `up to ${d}° apart in temperature`, rain: 'one model gives rain, another a dry day', and: ' and ' },
      bg: { levels: ['', 'по-несигурно', 'несигурно'], tip: 'Колко се различават моделите ECMWF, ICON и GFS за този ден',
        all: 'Моделите ECMWF, ICON и GFS са единодушни за всички тези дни, така че прогнозата е сравнително сигурна.',
        until: (day, why) => `Моделите са единодушни до ${day}, след това прогнозата е по-несигурна (${why}).`,
        early: (day, why) => `Моделите се разминават още за ${day} (${why}), затова проверете прогнозата отново по-късно.`,
        temp: d => `разлика до ${d}° в температурата`, rain: 'един модел дава валеж, друг – сухо време', and: ' и ' },
      de: { levels: ['', 'weniger sicher', 'unsicher'], tip: 'Wie weit die Modelle ECMWF, ICON und GFS für diesen Tag auseinanderliegen',
        all: 'Die Modelle ECMWF, ICON und GFS stimmen an allen diesen Tagen überein, die Vorhersage ist recht sicher.',
        until: (day, why) => `Die Modelle stimmen bis ${day} überein, danach ist die Vorhersage unsicherer (${why}).`,
        early: (day, why) => `Die Modelle gehen schon für ${day} auseinander (${why}), schauen Sie später noch einmal nach.`,
        temp: d => `bis zu ${d}° Unterschied bei der Temperatur`, rain: 'ein Modell zeigt Regen, ein anderes einen trockenen Tag', and: ' und ' },
      it: { levels: ['', 'meno certo', 'incerto'], tip: 'Quanto differiscono i modelli ECMWF, ICON e GFS per questo giorno',
        all: 'I modelli ECMWF, ICON e GFS concordano su tutti questi giorni, la previsione è abbastanza affidabile.',
        until: (day, why) => `I modelli concordano fino a ${day}, poi la previsione è meno certa (${why}).`,
        early: (day, why) => `I modelli divergono già per ${day} (${why}): ricontrolla la previsione più tardi.`,
        temp: d => `fino a ${d}° di differenza nella temperatura`, rain: 'un modello prevede pioggia, un altro tempo asciutto', and: ' e ' },
      es: { levels: ['', 'menos segura', 'incierta'], tip: 'Cuánto difieren los modelos ECMWF, ICON y GFS para este día',
        all: 'Los modelos ECMWF, ICON y GFS coinciden en todos estos días, así que la previsión es bastante fiable.',
        until: (day, why) => `Los modelos coinciden hasta ${/^(hoy|mañana)$/.test(day) ? day : `el ${day}`}; después la previsión es menos segura (${why}).`,
        early: (day, why) => `Los modelos ya difieren para ${/^(hoy|mañana)$/.test(day) ? day : `el ${day}`} (${why}), conviene volver a consultar más tarde.`,
        temp: d => `hasta ${d}° de diferencia en la temperatura`, rain: 'un modelo da lluvia y otro un día seco', and: ' y ' },
      fr: { levels: ['', 'moins sûre', 'incertaine'], tip: 'L’écart entre les modèles ECMWF, ICON et GFS pour ce jour',
        all: 'Les modèles ECMWF, ICON et GFS concordent pour tous ces jours : la prévision est assez sûre.',
        until: (day, why) => `Les modèles concordent jusqu’à ${day} ; ensuite, la prévision est moins sûre (${why}).`,
        early: (day, why) => `Les modèles divergent déjà pour ${day} (${why}) : revenez consulter la prévision plus tard.`,
        temp: d => `jusqu’à ${d}° d’écart de température`, rain: 'un modèle prévoit de la pluie, un autre une journée sèche', and: ' et ' },
      nl: { levels: ['', 'minder zeker', 'onzeker'], tip: 'Hoe ver de modellen ECMWF, ICON en GFS voor deze dag uiteenlopen',
        all: 'De modellen ECMWF, ICON en GFS zijn het voor al deze dagen eens, dus de verwachting is vrij zeker.',
        until: (day, why) => `De modellen zijn het eens tot en met ${day}; daarna is de verwachting minder zeker (${why}).`,
        early: (day, why) => `De modellen lopen al uiteen voor ${day} (${why}), kijk later nog eens naar de verwachting.`,
        temp: d => `tot ${d}° verschil in temperatuur`, rain: 'het ene model geeft regen, het andere een droge dag', and: ' en ' }
    },
    // One sentence for the days shown (indexes into daily), or '' without the data of the models.
    // name(i): the name of day i ("четвъртък, 19 ноември")
    summary(spread, shown, lang, name) {
      const text = this.text[lang] || this.text.en;
      const days = shown.map(i => ({ i, c: this.day(spread, i) }));
      if (!days.length || days.some(d => !d.c)) return '';
      const first = days.findIndex(d => d.c.level > 0);
      if (first < 0) return text.all;
      const rest = days.slice(first);
      const temp = Math.max(...rest.map(d => d.c.temp));
      const why = [temp > 4 ? text.temp(temp) : '', rest.some(d => d.c.split) ? text.rain : ''].filter(Boolean).join(text.and) || text.temp(temp);
      return first >= 2 ? text.until(name(days[first - 1].i), why) : text.early(name(days[first].i), why);
    }
  };
  // Air quality: the European Air Quality Index (european_aqi) of the Open-Meteo air quality API
  // (forecast of CAMS, Copernicus; a model, not a measurement), with PM2.5 and PM10 in µg/m³.
  // Levels of the index: 0-20 good, 20-40 fair, 40-60 moderate, 60-80 poor, 80-100 very poor,
  // over 100 extremely poor. A line under "now" on the city pages; the same levels and words on
  // /vremeto/kachestvo-na-vazduha/ (window.WeatherAir, js/region-weather.js).
  const AIR = {
    url: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    colors: ['#81c784', '#c5e1a5', '#ffd54f', '#ff9800', '#e53935', '#8e24aa'],
    level: aqi => (typeof aqi !== 'number' ? null : aqi < 20 ? 0 : aqi < 40 ? 1 : aqi < 60 ? 2 : aqi < 80 ? 3 : aqi < 100 ? 4 : 5),
    text: {
      en: { label: 'Air quality', levels: ['good', 'fair', 'moderate', 'poor', 'very poor', 'extremely poor'], index: 'index', worst: 'worst in the next 48 hours', more: 'Air quality in Bulgaria →' },
      bg: { label: 'Качество на въздуха', levels: ['добро', 'задоволително', 'умерено', 'лошо', 'много лошо', 'изключително лошо'], index: 'индекс', worst: 'най-лошо до 48 часа', more: 'Качеството на въздуха в България →' },
      de: { label: 'Luftqualität', levels: ['gut', 'mäßig gut', 'mäßig', 'schlecht', 'sehr schlecht', 'extrem schlecht'], index: 'Index', worst: 'am schlechtesten in 48 Stunden', more: 'Luftqualität in Bulgarien →' },
      it: { label: 'Qualità dell\'aria', levels: ['buona', 'discreta', 'moderata', 'scadente', 'molto scadente', 'pessima'], index: 'indice', worst: 'peggiore nelle prossime 48 ore', more: 'Qualità dell\'aria in Bulgaria →' },
      es: { label: 'Calidad del aire', levels: ['buena', 'aceptable', 'moderada', 'mala', 'muy mala', 'extremadamente mala'], index: 'índice', worst: 'peor en las próximas 48 horas', more: 'Calidad del aire en Bulgaria →' },
      fr: { label: 'Qualité de l’air', levels: ['bonne', 'correcte', 'moyenne', 'médiocre', 'très médiocre', 'extrêmement mauvaise'], index: 'indice', worst: 'la pire dans les 48 prochaines heures', more: 'Qualité de l’air en Bulgarie →' },
      nl: { label: 'Luchtkwaliteit', levels: ['goed', 'redelijk', 'matig', 'slecht', 'zeer slecht', 'extreem slecht'], index: 'index', worst: 'slechtst in de komende 48 uur', more: 'Luchtkwaliteit in Bulgarije →' }
    }
  };
  window.WeatherAir = AIR;
  const isBg = () => document.documentElement.lang === 'bg';
  // Pages with more days (data-days="10") or only the coming weekend (data-weekend)
  const PERIOD = {
    en: { days: n => `${n}-day forecast`, weekend: 'The weekend' },
    bg: { days: n => `Прогноза за ${n} дни`, weekend: 'Уикендът' },
    de: { days: n => `${n}-Tage-Vorhersage`, weekend: 'Das Wochenende' },
    it: { days: n => `Previsioni a ${n} giorni`, weekend: 'Il fine settimana' },
    es: { days: n => `Previsión a ${n} días`, weekend: 'El fin de semana' },
    fr: { days: n => `Prévisions à ${n} jours`, weekend: 'Le week-end' },
    nl: { days: n => `${n}-daagse verwachting`, weekend: 'Het weekend' }
  };
  const period = () => PERIOD[document.documentElement.lang] || PERIOD.en;
  // Friday to Sunday of the coming weekend (from today when the weekend has started)
  function weekendDays(dates) {
    const weekday = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
    const start = dates.findIndex(iso => [5, 6, 0].includes(weekday(iso)));
    if (start < 0) return dates.map((d, i) => i);
    const list = [];
    for (let i = start; i < dates.length && [5, 6, 0].includes(weekday(dates[i])); i++) list.push(i);
    return list;
  }

  // Sunrise, sunset, day length and the Moon of today (labels in the 7 site languages)
  const SUN = {
    en: { sunrise: 'Sunrise', sunset: 'Sunset', daylight: 'Day length', moon: 'Moon', h: 'h', m: 'min' },
    bg: { sunrise: 'Изгрев', sunset: 'Залез', daylight: 'Дължина на деня', moon: 'Луна', h: 'ч', m: 'мин' },
    de: { sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang', daylight: 'Tageslänge', moon: 'Mond', h: 'Std', m: 'Min' },
    it: { sunrise: 'Alba', sunset: 'Tramonto', daylight: 'Durata del giorno', moon: 'Luna', h: 'h', m: 'min' },
    es: { sunrise: 'Amanecer', sunset: 'Atardecer', daylight: 'Duración del día', moon: 'Luna', h: 'h', m: 'min' },
    fr: { sunrise: 'Lever du soleil', sunset: 'Coucher du soleil', daylight: 'Durée du jour', moon: 'Lune', h: 'h', m: 'min' },
    nl: { sunrise: 'Zonsopkomst', sunset: 'Zonsondergang', daylight: 'Daglengte', moon: 'Maan', h: 'u', m: 'min' }
  };

  function sunLines() {
    const daily = forecast.daily;
    if (!daily.sunrise || !daily.sunrise[0]) return [];
    const language = SUN[document.documentElement.lang] ? document.documentElement.lang : 'en';
    const s = SUN[language];
    const minutes = Math.round(daily.daylight_duration[0] / 60);
    const lines = [el('p', 'storm-updated city-sun',
      `🌅 ${s.sunrise} ${daily.sunrise[0].slice(11, 16)} · 🌇 ${s.sunset} ${daily.sunset[0].slice(11, 16)} · ${s.daylight}: ${Math.floor(minutes / 60)} ${s.h} ${minutes % 60} ${s.m}`)];
    if (typeof Moon !== 'undefined') {
      const state = Moon.state(new Date(daily.time[0] + 'T12:00:00Z'));
      lines.push(el('p', 'storm-updated city-moon',
        `${Moon.ICONS[state.index]} ${s.moon}: ${Moon.NAMES[language][state.index]}, ${Math.round(state.fraction * 100)}%`));
    }
    return lines;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Forecasts are kept for 10 minutes in this tab, so going back to a page or
  // opening the same city again does not call the API a second time.
  const CACHE_MS = 10 * 60 * 1000;

  // the main forecast of the city is the median of three models (js/forecast-core.js)
  let corePromise = null;
  function loadCore() {
    if (window.ForecastCore) return Promise.resolve();
    if (!corePromise) {
      corePromise = new Promise(resolve => {
        const script = document.createElement('script');
        script.src = '/js/forecast-core.js?v=3';
        script.onload = script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }
    return corePromise;
  }

  async function getJson(url, consensus) {
    const key = 'wp-forecast:' + (consensus ? 'median:' : '') + url;
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved && Date.now() - saved.time < CACHE_MS) return saved.data;
    } catch (error) { /* storage unavailable: fetch as usual */ }
    let data;
    if (consensus) {
      await loadCore();
    }
    if (consensus && window.ForecastCore) {
      data = await ForecastCore.load(url);
      if (!data || data.error || !data.daily) throw new Error('forecast failed');
    } else {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    }
    try { sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data })); } catch (error) { /* full or blocked */ }
    return data;
  }

  // --- One city ---
  const box = document.getElementById('cityForecast');
  let forecast = null;

  function renderCity() {
    const nowBox = document.getElementById('cityNow');
    const daysBox = document.getElementById('cityDays');
    if (!forecast) return;
    const text = t();
    const now = forecast.current;
    const current = condition(now.weather_code);

    nowBox.replaceChildren(
      el('h2', '', `${text.now}: ${box.dataset.name}`),
      WeatherIcons.node('now-icon', current.key, pickText(current.text)),
      el('span', 'storm-now-value', `${Math.round(now.temperature_2m)}°`),
      el('p', 'storm-now-status', `${pickText(current.text)} · ${text.feels} ${Math.round(now.apparent_temperature)}°`),
      el('p', 'storm-updated', `${text.wind}: ${Math.round(now.wind_speed_10m)} km/h${typeof now.wind_gusts_10m === 'number' ? `, ${wind().gusts} ${Math.round(now.wind_gusts_10m)} km/h` : ''} · ${text.humidity}: ${now.relative_humidity_2m}%`),
      ...sunLines()
    );
    showAlerts();

    const lows = forecast.daily.temperature_2m_min, highs = forecast.daily.temperature_2m_max;
    const lowest = Math.min(...lows), highest = Math.max(...highs);
    // where the day sits between the coldest and the warmest of the period
    const rangeBar = i => {
      const bar = el('span', 'dc-range');
      bar.setAttribute('aria-hidden', 'true');
      if (highest > lowest) {
        const left = ((lows[i] - lowest) / (highest - lowest)) * 100;
        const width = Math.min(Math.max(((highs[i] - lows[i]) / (highest - lowest)) * 100, 6), 100 - left);
        const fill = document.createElement('i');
        fill.style.left = left.toFixed(1) + '%';
        fill.style.width = width.toFixed(1) + '%';
        bar.appendChild(fill);
      }
      return bar;
    };
    const shown = box.dataset.weekend ? weekendDays(forecast.daily.time) : forecast.daily.time.map((d, i) => i);
    const days = shown.map(i => {
      const date = forecast.daily.time[i];
      const day = el('a', 'kp-day city-day');
      day.href = `/weather/?${box.dataset.query}&date=${date}`;
      day.title = text.hourly;
      const name = i === 0 ? text.today : i === 1 ? text.tomorrow
        : new Date(date + 'T12:00:00').toLocaleDateString(text.locale, { weekday: 'short', day: 'numeric' });
      const dayCondition = condition(forecast.daily.weather_code[i]);
      const rain = forecast.daily.precipitation_probability_max[i];
      const amount = forecast.daily.precipitation_sum[i];
      day.append(
        el('span', 'kp-day-name', name),
        WeatherIcons.node('city-day-icon', dayCondition.key, pickText(dayCondition.text)),
        el('span', 'city-day-date', date.slice(5).split('-').reverse().join('.')),
        el('span', 'city-day-temp', `${Math.round(forecast.daily.temperature_2m_min[i])}° / ${Math.round(forecast.daily.temperature_2m_max[i])}°`),
        rangeBar(i),
        el('span', 'kp-day-status', pickText(dayCondition.text))
      );
      if (rain !== null && rain !== undefined) {
        const rainText = el('span', 'city-day-rain', `${rain}%${amount >= 0.1 ? ` · ${amount.toFixed(1)} mm` : ''}`);
        rainText.prepend(WeatherIcons.node('', 'rain', text.rain, 'sm'));
        rainText.title = text.rain;
        day.appendChild(rainText);
      }
      const gust = forecast.daily.wind_gusts_10m_max ? forecast.daily.wind_gusts_10m_max[i] : null;
      const windText = el('span', 'city-day-wind' + (gust >= STRONG ? ' city-day-gusts' : ''),
        `${Math.round(forecast.daily.wind_speed_10m_max[i])} km/h${typeof gust === 'number' ? ` · ${wind().gusts} ${Math.round(gust)}` : ''}`);
      windText.prepend(WeatherIcons.node('', 'wind', text.wind, 'sm'));
      day.appendChild(windText);
      const sure = CONFIDENCE.day(forecast.spread, i);
      if (sure && sure.level) {
        const C = CONFIDENCE.text[document.documentElement.lang] || CONFIDENCE.text.en;
        const line = el('span', 'city-day-conf', `● ${C.levels[sure.level]}`);
        line.title = C.tip;
        line.style.cssText = `font-size:0.8rem;color:${sure.level === 2 ? '#ff8a65' : '#ffd54f'}`;
        day.appendChild(line);
      }
      day.appendChild(el('span', 'city-day-hourly', text.hourly));
      return day;
    });
    const grid = el('div', 'city-days');
    grid.append(...days);
    const note = window.ForecastCore ? ForecastCore.note({ models: forecast.models, elevation: forecast.elevation }) : '';
    const heading = box.dataset.weekend ? period().weekend : box.dataset.days ? period().days(+box.dataset.days) : text.days;
    const dayLong = i => (i < 2 ? [text.today, text.tomorrow][i].toLowerCase()
      : new Date(forecast.daily.time[i] + 'T12:00:00').toLocaleDateString(text.locale, { weekday: 'long', day: 'numeric', month: 'long' }));
    const sureText = CONFIDENCE.summary(forecast.spread, shown, document.documentElement.lang, dayLong);
    daysBox.replaceChildren(el('h3', '', heading), ...(sureText ? [el('p', 'city-summary', sureText)] : []), grid, ...(note ? [el('p', 'forecast-note', note)] : []));
    daysBox.hidden = false;
  }

  // The warnings above the forecast: the official ones of NIMH for the province of a Bulgarian
  // city (data-warn on #cityForecast), then ours (HAZARDS) for the kinds NIMH has not warned of
  let official = [];
  function showAlerts() {
    const nowBox = document.getElementById('cityNow');
    if (!forecast || !nowBox) return;
    let list = document.getElementById('cityAlerts');
    if (!list) {
      list = el('div', 'city-alerts');
      list.id = 'cityAlerts';
      list.setAttribute('role', 'status');
      box.insertBefore(list, nowBox);
    }
    const W = wind();
    const items = official.map(w => {
      const item = el('p', `city-alert city-alert-${w.level}`);
      const time = iso => new Date(iso).toLocaleString(t().locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      item.textContent = `${W.official} (${W.levels[w.level] || w.level} ${W.code}): ${(isBg() ? w.event.bg : w.event.en) || w.event.bg || w.event.en}, ${time(w.onset)} – ${time(w.expires)}`;
      return item;
    });
    // ours, for the kinds NIMH has not warned of (the official warning says it better)
    HAZARDS.list(forecast.daily, document.documentElement.lang, official)
      .forEach(h => items.push(el('p', `city-alert city-alert-${h.level}`, h.text)));
    // the Bulgarian pages link to the warnings of the whole country
    if (items.length && box.dataset.warn && isBg()) {
      const all = el('a', 'city-alerts-all', 'Всички предупреждения в България →');
      all.href = '/vremeto/preduprezhdeniya/';
      all.style.cssText = 'align-self:flex-end;font-size:0.9rem';
      items.push(all);
    }
    list.replaceChildren(...items);
    list.hidden = !items.length;
  }
  async function loadWarnings() {
    if (!box.dataset.warn) return;
    try {
      const response = await fetch('/data/warnings-bg.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const now = Date.now();
      official = ((data.provinces || {})[box.dataset.warn] || []).filter(w => new Date(w.expires).getTime() > now);
      showAlerts();
    } catch (error) { /* no warnings file: only ours */ }
  }

  async function loadCity() {
    loadWarnings();
    const url = `${API}?latitude=${box.dataset.lat}&longitude=${box.dataset.lon}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset,daylight_duration' +
      `&forecast_days=${Math.min(Math.max(+box.dataset.days || 7, 7), 16)}&timezone=auto`;
    try {
      forecast = await getJson(url, true);
      renderCity();
      loadAir();
    } catch (error) {
      console.error('City forecast:', error);
      document.getElementById('cityNow').replaceChildren(el('p', 'storm-now-status', t().error));
    }
  }

  // A line under "now": the index now and its level, PM2.5 and PM10, and the worst level of the
  // next 48 hours when it is worse than now. Nothing when the air quality API does not answer.
  async function loadAir() {
    const nowBox = document.getElementById('cityNow');
    if (!nowBox) return;
    try {
      const response = await fetch(`${AIR.url}?latitude=${box.dataset.lat}&longitude=${box.dataset.lon}` +
        '&current=european_aqi,pm2_5,pm10&hourly=european_aqi&forecast_days=3&timezone=auto');
      if (!response.ok) return;
      const data = await response.json();
      const now = data.current || {};
      const level = AIR.level(now.european_aqi);
      if (level === null) return;
      const A = AIR.text[document.documentElement.lang] || AIR.text.en;
      const start = Math.max(0, (data.hourly.time || []).indexOf(now.time && now.time.slice(0, 13) + ':00'));
      const ahead = (data.hourly.european_aqi || []).slice(start, start + 48).filter(v => typeof v === 'number');
      const worst = ahead.length ? AIR.level(Math.max(...ahead)) : null;
      const line = el('p', 'storm-updated city-air');
      const dot = el('span', '', '● ');
      dot.style.color = AIR.colors[level];
      line.append(dot, `${A.label}: ${A.levels[level]} (${A.index} ${Math.round(now.european_aqi)})` +
        `${typeof now.pm2_5 === 'number' ? ` · PM2.5 ${Math.round(now.pm2_5)} µg/m³` : ''}` +
        `${typeof now.pm10 === 'number' ? ` · PM10 ${Math.round(now.pm10)} µg/m³` : ''}` +
        `${worst !== null && worst > level ? ` · ${A.worst}: ${A.levels[worst]}` : ''}`);
      if (box.dataset.warn && isBg()) {
        const link = el('a', '', ` ${A.more}`);
        link.href = '/vremeto/kachestvo-na-vazduha/';
        line.append(link);
      }
      nowBox.appendChild(line);
    } catch (e) { /* the forecast is still shown */ }
  }

  // --- All cities on the hub page ---
  async function loadTiles(list) {
    const tiles = [...list.querySelectorAll('.city-tile')];
    const url = `${API}?latitude=${tiles.map(tile => tile.dataset.lat).join(',')}` +
      `&longitude=${tiles.map(tile => tile.dataset.lon).join(',')}&current=temperature_2m,weather_code&timezone=auto`;
    try {
      const data = await getJson(url);
      const results = Array.isArray(data) ? data : [data];
      tiles.forEach((tile, i) => {
        const current = results[i] && results[i].current;
        if (!current) return;
        const tileCondition = condition(current.weather_code);
        tile.querySelector('.city-tile-temp').replaceChildren(
          WeatherIcons.node('', tileCondition.key, pickText(tileCondition.text), 'sm'),
          document.createTextNode(` ${Math.round(current.temperature_2m)}°`)
        );
      });
    } catch (error) {
      console.error('City temperatures:', error);
    }
  }

  // --- Other cities of the country near this one, with their temperature now ---
  const NEARBY = { en: 'Other cities nearby', bg: 'Други градове наблизо', de: 'Weitere Städte in der Nähe', it: 'Altre città vicine', es: 'Otras ciudades cercanas', fr: 'Autres villes proches', nl: 'Andere steden in de buurt' };
  let nearby = null; // { section, items: [{ place, current }] }

  function distanceKm(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
  }

  function renderNearby() {
    if (!nearby) return;
    const lang = document.documentElement.lang;
    const links = nearby.items.map(({ place, current }) => {
      const name = place.name[lang] || place.name.en;
      const query = new URLSearchParams({ city: name, lat: place.latitude.toFixed(4), lon: place.longitude.toFixed(4), cc: nearby.cc });
      const link = el('a', 'nearby-card');
      link.href = `/weather/?${query}`;
      link.append(el('span', 'nearby-name', name));
      if (current) {
        const info = condition(current.weather_code);
        const value = el('span', 'nearby-temp');
        value.append(WeatherIcons.node('', info.key, pickText(info.text), 'sm'), document.createTextNode(` ${Math.round(current.temperature_2m)}°`));
        link.append(value);
      }
      return link;
    });
    nearby.section.replaceChildren(el('h2', '', NEARBY[lang] || NEARBY.en), (() => { const grid = el('div', 'nearby-grid'); grid.append(...links); return grid; })());
  }

  async function loadNearby() {
    const cc = new URLSearchParams(box.dataset.query || '').get('cc');
    if (!cc) return;
    try {
      const data = await getJson('/js/destinations.json');
      const here = [+box.dataset.lat, +box.dataset.lon];
      const places = (data[cc] || [])
        .map(place => ({ place, km: distanceKm(here[0], here[1], place.latitude, place.longitude) }))
        .filter(item => item.km > 5)
        .sort((a, b) => a.km - b.km)
        .slice(0, 6)
        .map(item => item.place);
      if (!places.length) return;
      const url = `${API}?latitude=${places.map(p => p.latitude).join(',')}&longitude=${places.map(p => p.longitude).join(',')}&current=temperature_2m,weather_code&timezone=auto`;
      let results = [];
      try { const weather = await getJson(url); results = Array.isArray(weather) ? weather : [weather]; } catch (error) { /* names only */ }
      const section = document.createElement('section');
      section.className = 'info-card city-nearby';
      box.insertAdjacentElement('afterend', section);
      nearby = { cc, section, items: places.map((place, i) => ({ place, current: results[i] && results[i].current })) };
      renderNearby();
    } catch (error) {
      console.error('Nearby cities:', error);
    }
  }

  if (box) { loadCity(); if (!box.dataset.days) loadNearby(); }
  const list = document.getElementById('cityList');
  if (list) loadTiles(list);

  document.addEventListener('change', event => {
    if (event.target && event.target.id === 'language') { renderCity(); renderNearby(); }
  });
})();
