// Romanian texts (the language is added for the ski resorts first: the home page, /kurorti/ and the
// pages /ro/vremeto/<resort>/). Used by build-pages.js (TXT.ro, CITY_TEXT[slug].ro), build-main.js
// and build-extra.js. Diacritics with a comma below: ș, ț (not the cedilla forms), plus ă, â, î.
// Dates in the text are written dd.mm.yyyy (see build-pages.js, climateSection).

// the pages of the site that exist in Romanian (everything else a Romanian page links to is the English page)
const RESORTS = ['bansko', 'borovets', 'pamporovo', 'chepelare', 'dobrinishte'];
const URLS = ['/', '/kurorti/', ...RESORTS.map(slug => `/vremeto/${slug}/`)];

const TXT = {
  where: name => name,
  hubName: 'Stațiuni de schi',
  cityName: where => `Vremea în ${where}`,
  title: where => `Vremea în ${where} – prognoza meteo pe 7 zile`,
  description: where => `Vremea în ${where} azi și prognoza pe 7 zile: temperatură, vânt și precipitații. Climatul pe luni, răsăritul și apusul soarelui.`,
  intro: where => `Prognoza meteo pentru ${where} pe azi, mâine și următoarele 7 zile: temperatură, precipitații, vânt și probabilitatea de ploaie. Datele provin de la Open-Meteo și sunt actualizate la fiecare oră.`,
  loading: 'Se încarcă…',
  hourly: 'Prognoza detaliată pe ore →',
  storms: 'Furtuni magnetice azi →',
  moon: 'Calendar lunar →',
  others: 'Vremea în alte stațiuni de schi',
  climateH: where => `Clima în ${where}`,
  climateText: c => `${c.name} se află la o altitudine de aproximativ ${c.elevation} m. Cea mai caldă lună este ${c.warm}, cu o temperatură maximă medie de ${c.warmHigh}C; cea mai rece este ${c.cold}, când noaptea temperatura medie este de ${c.coldLow}C. Într-un an cad în medie circa ${c.yearly} mm de precipitații, cele mai multe în ${c.wet} (circa ${c.wetMm} mm).`,
  climateHead: ['Luna', 'Max. medie', 'Min. medie', 'Precipitații', 'Zile cu ploaie'],
  mm: 'mm',
  climateNote: years => `Valori medii pentru ${years}, pe baza datelor Open-Meteo (ERA5). „Zile cu ploaie” sunt zilele cu cel puțin 1 mm de precipitații. Datele provin dintr-un model cu grilă de circa 10 km; la munte pot diferi de măsurătorile unei stații meteo.`,
  sunH: where => `Răsăritul și apusul soarelui în ${where}`,
  sunText: s => `Cea mai lungă zi în ${s.where} este în jurul datei de 21 iunie: soarele răsare la ${s.a}, apune la ${s.b}, iar ziua durează ${s.len}. Cea mai scurtă este în jurul datei de 21 decembrie: de la ${s.c} la ${s.d}, în total ${s.len2}. Răsăritul și apusul de azi sunt afișate în prognoza de mai sus.`,
  sunHead: ['Data', 'Răsărit', 'Apus', 'Durata zilei'],
  sunNote: year => `Orele sunt ora Bulgariei (ora de vară în sezonul cald) pentru ${year}. Calculate cu formule astronomice (Meeus, NOAA) și verificate cu o precizie de aproximativ un minut față de Open-Meteo.`,
  dayLength: (h, m) => `${h} h ${m} min`,
  and: ' și ', km: 'km',
  nearH: 'Stațiuni din apropiere', abroad: '',
  bestH: where => `Cel mai bun moment pentru o vizită în ${where}`,
  bestText: b => `Vremea cea mai plăcută în ${b.where} este de obicei în ${b.months}: temperaturile maxime medii sunt ${b.from === b.to ? `de aproximativ ${b.from}C` : `între ${b.from}C și ${b.to}C`}, cu cel mult ${b.rain} zile cu ploaie pe lună.${b.hot ? ` În ${b.hot} este cald: în medie peste 30°C după-amiaza.` : ''}${b.cold ? ` În ${b.cold} nopțile sunt geroase (în medie sub −3°C), iar ninsorile sunt frecvente.` : ''}`,
  recordText: r => `Cea mai ridicată temperatură înregistrată în ${r.where} în ${r.years} a fost de ${r.max}C (${r.maxDate}), iar cea mai scăzută de ${r.min}C (${r.minDate}).`,
  skiTitle: where => `Vremea în ${where} – prognoza meteo pe 7 zile`,
  skiDescription: where => `Vremea în ${where} azi și prognoza pe 7 zile: zăpadă pe pârtii (strat de zăpadă, ninsoare), temperatură, vânt și precipitații. Clima pe luni.`,
  snowH: where => `Zăpadă pe pârtii în ${where}`,
  snowIntro: 'Stratul de zăpadă acum, zăpada proaspătă din următoarele 7 zile și temperaturile minime și maxime în stațiune și sus, pe pârtii. Valorile provin dintr-un model pentru acea altitudine; nu sunt măsurate pe pârtie.',
  snowHead: ['Locul', 'Strat de zăpadă', 'Zăpadă proaspătă, 7 zile', 'Min. / max.'],
  snowNote: 'Date: Open-Meteo, actualizate la fiecare oră. Zăpada reală de pe pârtie depinde și de zăpada artificială și de întreținerea pârtiilor.',
  snowNoJs: 'Tabelul se completează la încărcarea paginii.',
  m: 'm'
};

// the climate text of each resort (CITY_TEXT[slug].ro in build-pages.js)
const CITY = {
  bansko: 'Bansko se află la poalele nordice ale munților Pirin, la aproximativ 900 m altitudine, și este una dintre cele mai cunoscute stațiuni de iarnă din Bulgaria. Sezonul de schi ține de obicei de la jumătatea lui decembrie până în aprilie, iar pârtiile sunt mult mai sus și mai friguroase decât orașul. Verile sunt plăcut de calde ziua, cu nopți răcoroase, potrivite pentru drumeții în Pirin.',
  borovets: 'Borovets se află pe versanții nordici ai munților Rila, la aproximativ 1300 m altitudine, și este cea mai veche stațiune montană din Bulgaria. Zăpada se menține de obicei din decembrie până în aprilie, iar mai sus de stațiune, pe pârtiile spre Iastrebeț, este și mai frig. Verile sunt răcoroase și rar caniculare, cu averse frecvente după-amiaza în zona montană.',
  pamporovo: 'Pamporovo se află în Rodopii Centrali, la aproximativ 1600 m altitudine, și este cunoscută drept una dintre cele mai însorite stațiuni de schi din Bulgaria, datorită poziției sale sudice. Zăpada se menține de obicei din decembrie până în martie, iar Marea Mediterană aduce atât ninsori abundente, cât și zile de iarnă blânde și însorite. Verile sunt răcoroase, cu temperaturi rareori peste 25°.',
  chepelare: 'Chepelare se află în Rodopii Centrali, la aproximativ 1150 m altitudine, iar pârtiile de pe Mechi Chal urcă până aproape de 1900 m. Ca și Pamporovo, stațiunea primește zăpadă de la ciclonii mediteraneeni; pe pârtii zăpada se ține de obicei din decembrie până în martie.',
  dobrinishte: 'Dobrinishte se află la poalele munților Pirin, la aproximativ 850 m altitudine, la circa 6 km de Bansko. Domeniul schiabil Bezbog este sus în munți, la aproximativ 2200 m, unde zăpada se menține mai mult, iar localitatea are izvoare minerale.'
};

// /kurorti/: only the ski resorts have Romanian pages so far
const RESORTS_PAGE = {
  title: 'Stațiuni de schi din Bulgaria – vremea și zăpada pe pârtii',
  h1: 'Vremea în stațiunile de schi din Bulgaria',
  description: 'Vremea în stațiunile de schi din Bulgaria: Bansko, Borovets, Pamporovo, Chepelare, Dobrinishte – prognoza pe 7 zile și zăpada de pe pârtii.',
  intro: 'Prognoza pe 7 zile, stratul de zăpadă și zăpada proaspătă de pe pârtii pentru stațiunile de schi din Bulgaria.',
  ski: 'Stațiuni de schi în Bulgaria'
};

module.exports = { RESORTS, URLS, TXT, CITY, RESORTS_PAGE };
