// Countries and cities for the English "weather in Europe" pages (see build-europe.js).
// Bulgaria has its own Bulgarian pages (/vremeto/), so it is not listed here.
// city: [slug, English name, local name, latitude, longitude]
// word: how people search for the weather in the local language (put before the city name)
module.exports = [
  { slug: 'albania', en: 'Albania', code: 'AL', word: 'Moti', cities: [
    ['tirana', 'Tirana', 'Tiranë', 41.3275, 19.8187], ['durres', 'Durrës', 'Durrës', 41.3246, 19.4565], ['vlore', 'Vlorë', 'Vlorë', 40.4660, 19.4914], ['shkoder', 'Shkodër', 'Shkodër', 42.0693, 19.5126] ] },
  { slug: 'austria', en: 'Austria', code: 'AT', word: 'Wetter', cities: [
    ['vienna', 'Vienna', 'Wien', 48.2082, 16.3738], ['graz', 'Graz', 'Graz', 47.0707, 15.4395], ['linz', 'Linz', 'Linz', 48.3069, 14.2858], ['salzburg', 'Salzburg', 'Salzburg', 47.8095, 13.0550], ['innsbruck', 'Innsbruck', 'Innsbruck', 47.2692, 11.4041] ] },
  { slug: 'belgium', en: 'Belgium', code: 'BE', word: 'Météo', cities: [
    ['brussels', 'Brussels', 'Bruxelles', 50.8503, 4.3517], ['antwerp', 'Antwerp', 'Antwerpen', 51.2194, 4.4025], ['ghent', 'Ghent', 'Gent', 51.0543, 3.7174], ['bruges', 'Bruges', 'Brugge', 51.2093, 3.2247], ['liege', 'Liège', 'Liège', 50.6326, 5.5797] ] },
  { slug: 'bosnia-and-herzegovina', en: 'Bosnia and Herzegovina', code: 'BA', word: 'Vrijeme', cities: [
    ['sarajevo', 'Sarajevo', 'Sarajevo', 43.8563, 18.4131], ['banja-luka', 'Banja Luka', 'Banja Luka', 44.7722, 17.1910], ['mostar', 'Mostar', 'Mostar', 43.3438, 17.8078], ['tuzla', 'Tuzla', 'Tuzla', 44.5384, 18.6671] ] },
  { slug: 'croatia', en: 'Croatia', code: 'HR', word: 'Vrijeme', cities: [
    ['zagreb', 'Zagreb', 'Zagreb', 45.8150, 15.9819], ['split', 'Split', 'Split', 43.5081, 16.4402], ['dubrovnik', 'Dubrovnik', 'Dubrovnik', 42.6507, 18.0944], ['rijeka', 'Rijeka', 'Rijeka', 45.3271, 14.4422], ['zadar', 'Zadar', 'Zadar', 44.1194, 15.2314] ] },
  { slug: 'cyprus', en: 'Cyprus', code: 'CY', word: 'Καιρός', cities: [
    ['nicosia', 'Nicosia', 'Λευκωσία', 35.1856, 33.3823], ['limassol', 'Limassol', 'Λεμεσός', 34.6841, 33.0379], ['paphos', 'Paphos', 'Πάφος', 34.7754, 32.4218], ['larnaca', 'Larnaca', 'Λάρνακα', 34.9229, 33.6233] ] },
  { slug: 'czechia', en: 'Czechia', code: 'CZ', word: 'Počasí', cities: [
    ['prague', 'Prague', 'Praha', 50.0755, 14.4378], ['brno', 'Brno', 'Brno', 49.1951, 16.6068], ['ostrava', 'Ostrava', 'Ostrava', 49.8209, 18.2625], ['plzen', 'Plzeň', 'Plzeň', 49.7384, 13.3736], ['olomouc', 'Olomouc', 'Olomouc', 49.5938, 17.2509] ] },
  { slug: 'denmark', en: 'Denmark', code: 'DK', word: 'Vejret', cities: [
    ['copenhagen', 'Copenhagen', 'København', 55.6761, 12.5683], ['aarhus', 'Aarhus', 'Aarhus', 56.1629, 10.2039], ['odense', 'Odense', 'Odense', 55.4038, 10.4024], ['aalborg', 'Aalborg', 'Aalborg', 57.0488, 9.9217] ] },
  { slug: 'estonia', en: 'Estonia', code: 'EE', word: 'Ilm', cities: [
    ['tallinn', 'Tallinn', 'Tallinn', 59.4370, 24.7536], ['tartu', 'Tartu', 'Tartu', 58.3780, 26.7290], ['parnu', 'Pärnu', 'Pärnu', 58.3859, 24.4971] ] },
  { slug: 'finland', en: 'Finland', code: 'FI', word: 'Sää', cities: [
    ['helsinki', 'Helsinki', 'Helsinki', 60.1699, 24.9384], ['espoo', 'Espoo', 'Espoo', 60.2055, 24.6559], ['tampere', 'Tampere', 'Tampere', 61.4978, 23.7610], ['turku', 'Turku', 'Turku', 60.4518, 22.2666], ['rovaniemi', 'Rovaniemi', 'Rovaniemi', 66.5039, 25.7294] ] },
  { slug: 'france', en: 'France', code: 'FR', word: 'Météo', cities: [
    ['paris', 'Paris', 'Paris', 48.8566, 2.3522], ['marseille', 'Marseille', 'Marseille', 43.2965, 5.3698], ['lyon', 'Lyon', 'Lyon', 45.7640, 4.8357], ['toulouse', 'Toulouse', 'Toulouse', 43.6047, 1.4442], ['nice', 'Nice', 'Nice', 43.7102, 7.2620], ['bordeaux', 'Bordeaux', 'Bordeaux', 44.8378, -0.5792] ] },
  { slug: 'germany', en: 'Germany', code: 'DE', word: 'Wetter', cities: [
    ['berlin', 'Berlin', 'Berlin', 52.5200, 13.4050], ['hamburg', 'Hamburg', 'Hamburg', 53.5511, 9.9937], ['munich', 'Munich', 'München', 48.1351, 11.5820], ['cologne', 'Cologne', 'Köln', 50.9375, 6.9603], ['frankfurt', 'Frankfurt', 'Frankfurt', 50.1109, 8.6821], ['stuttgart', 'Stuttgart', 'Stuttgart', 48.7758, 9.1829], ['dresden', 'Dresden', 'Dresden', 51.0504, 13.7373] ] },
  { slug: 'greece', en: 'Greece', code: 'GR', word: 'Καιρός', cities: [
    ['athens', 'Athens', 'Αθήνα', 37.9838, 23.7275], ['thessaloniki', 'Thessaloniki', 'Θεσσαλονίκη', 40.6401, 22.9444], ['patras', 'Patras', 'Πάτρα', 38.2466, 21.7346], ['heraklion', 'Heraklion', 'Ηράκλειο', 35.3387, 25.1442], ['rhodes', 'Rhodes', 'Ρόδος', 36.4341, 28.2176],
    // resorts: Northern Greece (most visited from Bulgaria), the islands and the mainland
    ['kavala', 'Kavala', 'Καβάλα', 40.9396, 24.4069], ['thassos', 'Thassos', 'Θάσος', 40.7790, 24.7090], ['keramoti', 'Keramoti', 'Κεραμωτή', 40.8560, 24.7040],
    ['alexandroupoli', 'Alexandroupoli', 'Αλεξανδρούπολη', 40.8457, 25.8730], ['asprovalta', 'Asprovalta', 'Ασπροβάλτα', 40.7240, 23.7110], ['stavros', 'Stavros', 'Σταυρός', 40.6640, 23.6970],
    ['olympiada', 'Olympiada', 'Ολυμπιάδα', 40.5940, 23.7920], ['ouranoupoli', 'Ouranoupoli', 'Ουρανούπολη', 40.3270, 23.9830], ['nikiti', 'Nikiti', 'Νικήτη', 40.2240, 23.6670],
    ['neos-marmaras', 'Neos Marmaras', 'Νέος Μαρμαράς', 40.0950, 23.7830], ['hanioti', 'Hanioti', 'Χανιώτη', 39.9990, 23.5950], ['kallithea', 'Kallithea', 'Καλλιθέα', 40.0790, 23.4460],
    ['paralia-katerinis', 'Paralia Katerinis', 'Παραλία Κατερίνης', 40.2680, 22.5970], ['kalambaka', 'Kalambaka', 'Καλαμπάκα', 39.7060, 21.6290], ['parga', 'Parga', 'Πάργα', 39.2840, 20.4000],
    ['corfu', 'Corfu', 'Κέρκυρα', 39.6243, 19.9217], ['lefkada', 'Lefkada', 'Λευκάδα', 38.8300, 20.7060], ['kefalonia', 'Kefalonia', 'Κεφαλονιά', 38.1760, 20.4890],
    ['zakynthos', 'Zakynthos', 'Ζάκυνθος', 37.7870, 20.8990], ['nafplio', 'Nafplio', 'Ναύπλιο', 37.5673, 22.8015], ['santorini', 'Santorini', 'Σαντορίνη', 36.4167, 25.4320],
    ['mykonos', 'Mykonos', 'Μύκονος', 37.4467, 25.3289], ['chania', 'Chania', 'Χανιά', 35.5138, 24.0180], ['kos', 'Kos', 'Κως', 36.8930, 27.2880] ] },
  { slug: 'hungary', en: 'Hungary', code: 'HU', word: 'Időjárás', cities: [
    ['budapest', 'Budapest', 'Budapest', 47.4979, 19.0402], ['debrecen', 'Debrecen', 'Debrecen', 47.5316, 21.6273], ['szeged', 'Szeged', 'Szeged', 46.2530, 20.1414], ['pecs', 'Pécs', 'Pécs', 46.0727, 18.2323] ] },
  { slug: 'iceland', en: 'Iceland', code: 'IS', word: 'Veður', cities: [
    ['reykjavik', 'Reykjavik', 'Reykjavík', 64.1466, -21.9426], ['akureyri', 'Akureyri', 'Akureyri', 65.6835, -18.1105], ['keflavik', 'Keflavík', 'Keflavík', 64.0049, -22.5624] ] },
  { slug: 'ireland', en: 'Ireland', code: 'IE', word: '', cities: [
    ['dublin', 'Dublin', 'Dublin', 53.3498, -6.2603], ['cork', 'Cork', 'Cork', 51.8985, -8.4756], ['galway', 'Galway', 'Galway', 53.2707, -9.0568], ['limerick', 'Limerick', 'Limerick', 52.6638, -8.6267] ] },
  { slug: 'italy', en: 'Italy', code: 'IT', word: 'Meteo', cities: [
    ['rome', 'Rome', 'Roma', 41.9028, 12.4964], ['milan', 'Milan', 'Milano', 45.4642, 9.1900], ['naples', 'Naples', 'Napoli', 40.8518, 14.2681], ['turin', 'Turin', 'Torino', 45.0703, 7.6869], ['florence', 'Florence', 'Firenze', 43.7696, 11.2558], ['venice', 'Venice', 'Venezia', 45.4408, 12.3155], ['palermo', 'Palermo', 'Palermo', 38.1157, 13.3615] ] },
  { slug: 'latvia', en: 'Latvia', code: 'LV', word: 'Laika apstākļi', cities: [
    ['riga', 'Riga', 'Rīga', 56.9496, 24.1052], ['daugavpils', 'Daugavpils', 'Daugavpils', 55.8714, 26.5161], ['liepaja', 'Liepāja', 'Liepāja', 56.5047, 21.0108] ] },
  { slug: 'lithuania', en: 'Lithuania', code: 'LT', word: 'Orai', cities: [
    ['vilnius', 'Vilnius', 'Vilnius', 54.6872, 25.2797], ['kaunas', 'Kaunas', 'Kaunas', 54.8985, 23.9036], ['klaipeda', 'Klaipėda', 'Klaipėda', 55.7033, 21.1443] ] },
  { slug: 'luxembourg', en: 'Luxembourg', code: 'LU', word: 'Météo', cities: [
    ['luxembourg', 'Luxembourg', 'Luxembourg', 49.6116, 6.1319], ['esch-sur-alzette', 'Esch-sur-Alzette', 'Esch-sur-Alzette', 49.4958, 5.9806] ] },
  { slug: 'malta', en: 'Malta', code: 'MT', word: '', cities: [
    ['valletta', 'Valletta', 'Valletta', 35.8989, 14.5146], ['sliema', 'Sliema', 'Sliema', 35.9122, 14.5043], ['mosta', 'Mosta', 'Mosta', 35.9097, 14.4259] ] },
  { slug: 'moldova', en: 'Moldova', code: 'MD', word: 'Vremea', cities: [
    ['chisinau', 'Chișinău', 'Chișinău', 47.0105, 28.8638], ['balti', 'Bălți', 'Bălți', 47.7540, 27.9184], ['tiraspol', 'Tiraspol', 'Tiraspol', 46.8403, 29.6433] ] },
  { slug: 'montenegro', en: 'Montenegro', code: 'ME', word: 'Vrijeme', cities: [
    ['podgorica', 'Podgorica', 'Podgorica', 42.4304, 19.2594], ['budva', 'Budva', 'Budva', 42.2864, 18.8400], ['kotor', 'Kotor', 'Kotor', 42.4247, 18.7712] ] },
  { slug: 'netherlands', en: 'Netherlands', code: 'NL', word: 'Weer', cities: [
    ['amsterdam', 'Amsterdam', 'Amsterdam', 52.3676, 4.9041], ['rotterdam', 'Rotterdam', 'Rotterdam', 51.9244, 4.4777], ['the-hague', 'The Hague', 'Den Haag', 52.0705, 4.3007], ['utrecht', 'Utrecht', 'Utrecht', 52.0907, 5.1214], ['eindhoven', 'Eindhoven', 'Eindhoven', 51.4416, 5.4697] ] },
  { slug: 'north-macedonia', en: 'North Macedonia', code: 'MK', word: 'Времето', cities: [
    ['skopje', 'Skopje', 'Скопје', 41.9981, 21.4254], ['bitola', 'Bitola', 'Битола', 41.0297, 21.3292], ['ohrid', 'Ohrid', 'Охрид', 41.1231, 20.8016] ] },
  { slug: 'norway', en: 'Norway', code: 'NO', word: 'Vær', cities: [
    ['oslo', 'Oslo', 'Oslo', 59.9139, 10.7522], ['bergen', 'Bergen', 'Bergen', 60.3913, 5.3221], ['trondheim', 'Trondheim', 'Trondheim', 63.4305, 10.3951], ['stavanger', 'Stavanger', 'Stavanger', 58.9700, 5.7331], ['tromso', 'Tromsø', 'Tromsø', 69.6492, 18.9553] ] },
  { slug: 'poland', en: 'Poland', code: 'PL', word: 'Pogoda', cities: [
    ['warsaw', 'Warsaw', 'Warszawa', 52.2297, 21.0122], ['krakow', 'Kraków', 'Kraków', 50.0647, 19.9450], ['lodz', 'Łódź', 'Łódź', 51.7592, 19.4560], ['wroclaw', 'Wrocław', 'Wrocław', 51.1079, 17.0385], ['gdansk', 'Gdańsk', 'Gdańsk', 54.3520, 18.6466], ['poznan', 'Poznań', 'Poznań', 52.4064, 16.9252] ] },
  { slug: 'portugal', en: 'Portugal', code: 'PT', word: 'Tempo', cities: [
    ['lisbon', 'Lisbon', 'Lisboa', 38.7223, -9.1393], ['porto', 'Porto', 'Porto', 41.1579, -8.6291], ['faro', 'Faro', 'Faro', 37.0194, -7.9304], ['braga', 'Braga', 'Braga', 41.5454, -8.4265], ['funchal', 'Funchal', 'Funchal', 32.6669, -16.9241] ] },
  { slug: 'romania', en: 'Romania', code: 'RO', word: 'Vremea', cities: [
    ['bucharest', 'Bucharest', 'București', 44.4268, 26.1025], ['cluj-napoca', 'Cluj-Napoca', 'Cluj-Napoca', 46.7712, 23.6236], ['timisoara', 'Timișoara', 'Timișoara', 45.7489, 21.2087], ['iasi', 'Iași', 'Iași', 47.1585, 27.6014], ['constanta', 'Constanța', 'Constanța', 44.1598, 28.6348], ['brasov', 'Brașov', 'Brașov', 45.6427, 25.5887] ] },
  { slug: 'serbia', en: 'Serbia', code: 'RS', word: 'Vreme', cities: [
    ['belgrade', 'Belgrade', 'Beograd', 44.7866, 20.4489], ['novi-sad', 'Novi Sad', 'Novi Sad', 45.2671, 19.8335], ['nis', 'Niš', 'Niš', 43.3209, 21.8958], ['kragujevac', 'Kragujevac', 'Kragujevac', 44.0128, 20.9114] ] },
  { slug: 'slovakia', en: 'Slovakia', code: 'SK', word: 'Počasie', cities: [
    ['bratislava', 'Bratislava', 'Bratislava', 48.1486, 17.1077], ['kosice', 'Košice', 'Košice', 48.7164, 21.2611], ['zilina', 'Žilina', 'Žilina', 49.2231, 18.7394], ['poprad', 'Poprad', 'Poprad', 49.0614, 20.2980] ] },
  { slug: 'slovenia', en: 'Slovenia', code: 'SI', word: 'Vreme', cities: [
    ['ljubljana', 'Ljubljana', 'Ljubljana', 46.0569, 14.5058], ['maribor', 'Maribor', 'Maribor', 46.5547, 15.6459], ['bled', 'Bled', 'Bled', 46.3683, 14.1146], ['koper', 'Koper', 'Koper', 45.5469, 13.7294] ] },
  { slug: 'spain', en: 'Spain', code: 'ES', word: 'Tiempo', cities: [
    ['madrid', 'Madrid', 'Madrid', 40.4168, -3.7038], ['barcelona', 'Barcelona', 'Barcelona', 41.3874, 2.1686], ['valencia', 'Valencia', 'Valencia', 39.4699, -0.3763], ['seville', 'Seville', 'Sevilla', 37.3891, -5.9845], ['malaga', 'Málaga', 'Málaga', 36.7213, -4.4214], ['bilbao', 'Bilbao', 'Bilbao', 43.2630, -2.9350], ['palma', 'Palma de Mallorca', 'Palma', 39.5696, 2.6502] ] },
  { slug: 'sweden', en: 'Sweden', code: 'SE', word: 'Väder', cities: [
    ['stockholm', 'Stockholm', 'Stockholm', 59.3293, 18.0686], ['gothenburg', 'Gothenburg', 'Göteborg', 57.7089, 11.9746], ['malmo', 'Malmö', 'Malmö', 55.6050, 13.0038], ['uppsala', 'Uppsala', 'Uppsala', 59.8586, 17.6389], ['kiruna', 'Kiruna', 'Kiruna', 67.8558, 20.2253] ] },
  { slug: 'switzerland', en: 'Switzerland', code: 'CH', word: 'Wetter', cities: [
    ['zurich', 'Zurich', 'Zürich', 47.3769, 8.5417], ['geneva', 'Geneva', 'Genève', 46.2044, 6.1432], ['basel', 'Basel', 'Basel', 47.5596, 7.5886], ['bern', 'Bern', 'Bern', 46.9480, 7.4474], ['lucerne', 'Lucerne', 'Luzern', 47.0502, 8.3093] ] },
  { slug: 'turkey', en: 'Turkey', code: 'TR', word: 'Hava durumu', cities: [
    ['istanbul', 'Istanbul', 'İstanbul', 41.0082, 28.9784], ['ankara', 'Ankara', 'Ankara', 39.9334, 32.8597], ['edirne', 'Edirne', 'Edirne', 41.6771, 26.5557],
    ['bursa', 'Bursa', 'Bursa', 40.1885, 29.0610], ['canakkale', 'Çanakkale', 'Çanakkale', 40.1553, 26.4142], ['izmir', 'Izmir', 'İzmir', 38.4237, 27.1428],
    ['kusadasi', 'Kuşadası', 'Kuşadası', 37.8579, 27.2610], ['didim', 'Didim', 'Didim', 37.3750, 27.2670], ['bodrum', 'Bodrum', 'Bodrum', 37.0344, 27.4305],
    ['marmaris', 'Marmaris', 'Marmaris', 36.8550, 28.2740], ['fethiye', 'Fethiye', 'Fethiye', 36.6210, 29.1160], ['kemer', 'Kemer', 'Kemer', 36.6000, 30.5590],
    ['antalya', 'Antalya', 'Antalya', 36.8969, 30.7133], ['belek', 'Belek', 'Belek', 36.8620, 31.0560], ['side', 'Side', 'Side', 36.7670, 31.3890],
    ['alanya', 'Alanya', 'Alanya', 36.5440, 31.9990], ['goreme', 'Göreme (Cappadocia)', 'Göreme', 38.6431, 34.8289] ] },
  { slug: 'ukraine', en: 'Ukraine', code: 'UA', word: 'Погода', cities: [
    ['kyiv', 'Kyiv', 'Київ', 50.4501, 30.5234], ['lviv', 'Lviv', 'Львів', 49.8397, 24.0297], ['odesa', 'Odesa', 'Одеса', 46.4825, 30.7233], ['kharkiv', 'Kharkiv', 'Харків', 49.9935, 36.2304], ['dnipro', 'Dnipro', 'Дніпро', 48.4647, 35.0462] ] },
  { slug: 'united-kingdom', en: 'United Kingdom', code: 'GB', word: '', cities: [
    ['london', 'London', 'London', 51.5074, -0.1278], ['manchester', 'Manchester', 'Manchester', 53.4808, -2.2426], ['birmingham', 'Birmingham', 'Birmingham', 52.4862, -1.8904], ['edinburgh', 'Edinburgh', 'Edinburgh', 55.9533, -3.1883], ['glasgow', 'Glasgow', 'Glasgow', 55.8642, -4.2518], ['cardiff', 'Cardiff', 'Cardiff', 51.4816, -3.1791], ['belfast', 'Belfast', 'Belfast', 54.5973, -5.9301] ] }
];
