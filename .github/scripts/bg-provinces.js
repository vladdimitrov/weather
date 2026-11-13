// The 28 provinces of Bulgaria (the areas of the official warnings of NIMH), with the names
// MeteoAlarm may use for them, and the province of each city that has a page (bg-cities.js).
const PROVINCES = {
  'sofia-city': ['София-град', 'Sofia City', 'Sofia Grad', 'Sofia capital'],
  'sofia-province': ['София-област', 'Софийска област', 'Sofia Province', 'Sofia oblast', 'Sofia'],
  blagoevgrad: ['Благоевград', 'Blagoevgrad'], burgas: ['Бургас', 'Burgas', 'Bourgas'], varna: ['Варна', 'Varna'],
  'veliko-tarnovo': ['Велико Търново', 'Veliko Tarnovo', 'Veliko Turnovo'], vidin: ['Видин', 'Vidin'], vratsa: ['Враца', 'Vratsa', 'Vratza'],
  gabrovo: ['Габрово', 'Gabrovo'], dobrich: ['Добрич', 'Dobrich'], kardzhali: ['Кърджали', 'Kardzhali', 'Kardjali', 'Kurdzhali'],
  kyustendil: ['Кюстендил', 'Kyustendil'], lovech: ['Ловеч', 'Lovech'], montana: ['Монтана', 'Montana'],
  pazardzhik: ['Пазарджик', 'Pazardzhik', 'Pazardjik'], pernik: ['Перник', 'Pernik'], pleven: ['Плевен', 'Pleven'],
  plovdiv: ['Пловдив', 'Plovdiv'], razgrad: ['Разград', 'Razgrad'], ruse: ['Русе', 'Ruse', 'Rousse'], silistra: ['Силистра', 'Silistra'],
  sliven: ['Сливен', 'Sliven'], smolyan: ['Смолян', 'Smolyan'], 'stara-zagora': ['Стара Загора', 'Stara Zagora'],
  targovishte: ['Търговище', 'Targovishte', 'Turgovishte'], haskovo: ['Хасково', 'Haskovo'], shumen: ['Шумен', 'Shumen'], yambol: ['Ямбол', 'Yambol']
};
const OTHER = { sofia: 'sofia-city', asenovgrad: 'plovdiv', kazanlak: 'stara-zagora', dimitrovgrad: 'haskovo', bansko: 'blagoevgrad', borovets: 'sofia-province', pamporovo: 'smolyan', sozopol: 'burgas', nesebar: 'burgas' };
const provinceOf = slug => OTHER[slug] || (PROVINCES[slug] ? slug : null);

// The province of an area name of a warning: "София-град", "Sofia City", "Област Варна" ...
const plain = text => text.toLowerCase().replace(/[^a-zа-я]+/g, ' ').replace(/\b(област|обл|oblast|province|region|district)\b/g, ' ').replace(/\s+/g, ' ').trim();
function provinceOfArea(name) {
  const text = plain(name);
  if (/софия|sofia|софийска/.test(text)) return /град|city|grad|capital|столица/.test(text) ? 'sofia-city' : 'sofia-province';
  for (const [id, names] of Object.entries(PROVINCES)) {
    if (id.startsWith('sofia')) continue;
    if (names.some(n => text.includes(plain(n)))) return id;
  }
  return null;
}

module.exports = { PROVINCES, provinceOf, provinceOfArea };
