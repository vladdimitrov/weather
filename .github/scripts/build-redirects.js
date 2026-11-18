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

// French, Dutch and Romanian pages moved from the Bulgarian words to their own (/fr/vremeto/sofia/ ->
// /fr/meteo/sofia/, i18n.js): every page of these languages gets a redirect at its old address
const I18N = require('./i18n.js');
const ROOT = path.resolve(__dirname, '..', '..');
const isRedirect = file => /<meta http-equiv="refresh"/.test(fs.readFileSync(file, 'utf8').slice(0, 1500));
function pages(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) pages(full, found);
    else if (entry.name === 'index.html' && !isRedirect(full)) found.push(full);
  }
  return found;
}
let moved = 0;
Object.keys(I18N.SLUGS).forEach(lang => pages(path.join(ROOT, lang)).forEach(file => {
  const url = '/' + path.relative(ROOT, path.dirname(file)).split(path.sep).join('/') + '/';
  const old = `/${lang}` + I18N.bgPath(lang, url.slice(lang.length + 1));
  if (old === url) return;
  // a translation that is not indexed (places.js) was never in the sitemap: its old address just goes
  if (/<meta name="robots" content="[^"]*noindex/.test(fs.readFileSync(file, 'utf8').slice(0, 4000))) return;
  const oldFile = path.join(ROOT, old, 'index.html');
  if (fs.existsSync(oldFile) && !isRedirect(oldFile)) throw new Error(`${old} is still a page: it should be a redirect to ${url}`);
  redirect(old.slice(1, -1), url, lang);
  moved++;
}));
console.log(`Wrote ${existing.length + moved} redirect pages (${moved} for the French, Dutch and Romanian addresses).`);
