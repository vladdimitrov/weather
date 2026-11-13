// Writes the pages of addresses that have moved (GitHub Pages cannot answer 301: each old
// address gets a page with the canonical address of the new one and a meta refresh,
// which search engines follow as a redirect):
//   /bg/europe/...  ->  /europe/...       Bulgarian /europe/ pages moved to the root (English went to /en/europe/)
//   /bg/            ->  /                 there was never a page here, but /bg/europe/ made people try it
//   /contacts/      ->  /iztochnici/      the data sources page (and its translations /en/iztochnici/ ...)
// Run from the repository root: node .github/scripts/build-redirects.js
const { redirect } = require('./build-pages.js');
const COUNTRIES = require('./europe-data.js');

const MOVED = [
  ['bg', '/'],
  ['contacts', '/iztochnici/'],
  ['bg/europe', '/europe/'],
  ...COUNTRIES.flatMap(country => [
    [`bg/europe/${country.slug}`, `/europe/${country.slug}/`],
    ...country.cities.map(city => [`bg/europe/${country.slug}/${city[0]}`, `/europe/${country.slug}/${city[0]}/`])
  ])
];
// /bg/europe/ had only the cities of the time: pages added later never had a /bg/ address
const fs = require('fs');
const path = require('path');
const existing = MOVED.filter(([from]) => !from.startsWith('bg/europe/') || fs.existsSync(path.resolve(__dirname, '..', '..', from, 'index.html')));
existing.forEach(([from, to]) => redirect(from, to));
console.log(`Wrote ${existing.length} redirect pages.`);
