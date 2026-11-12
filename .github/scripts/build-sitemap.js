// Writes sitemap.xml from the pages that exist, with a <lastmod> that changes only when the
// content of a page really changes (search engines stop trusting a date that changes every day).
//
//   node .github/scripts/build-sitemap.js           update sitemap.xml
//   node .github/scripts/build-sitemap.js --seed    only remember the content of every page as it is now
//
// A page is listed when it has a canonical address that is its own address, is not a redirect
// (meta refresh) and is not marked noindex. Its content is remembered as a hash in
// sitemap-hashes.json; when the hash changes, <lastmod> becomes today, otherwise it stays.
// Parts that change every day without being new content are left out of the hash:
//   - the forecast written by build-forecast.js inside #cityForecast
//   - anything between <!-- volatile --> and <!-- /volatile -->
//   - the year in the footer
// Run it after the generators (the daily workflow runs it after build-forecast.js and build-storms.js).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const SITE = 'https://weatherpulse.eu';
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const HASHES = path.join(__dirname, 'sitemap-hashes.json');
const SEED = process.argv.includes('--seed');
const today = new Date().toISOString().slice(0, 10);

function walk(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else if (entry.name === 'index.html') found.push(full);
  }
  return found;
}

// What a page says, without the parts that change every day
function content(html) {
  return html
    .replace(/\r\n/g, '\n')
    .replace(/(<div class="city-forecast" id="cityForecast"[^>]*>\n)[\s\S]*?(\n    <\/div>\n)/, '$1$2')
    .replace(/<!-- volatile -->[\s\S]*?<!-- \/volatile -->/g, '')
    .replace(/<span class="current-year">\d+<\/span>/g, '');
}

// Pages that belong in the sitemap
function indexable(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const url = rel === 'index.html' ? '/' : '/' + rel.slice(0, -'index.html'.length);
  const html = fs.readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>') + 1 || undefined).replace(/<!--[\s\S]*?-->/g, '');
  const canonical = (head.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (canonical !== SITE + url) return null;
  if (/<meta http-equiv="refresh"/i.test(head) || /<meta name="robots" content="[^"]*noindex/i.test(head)) return null;
  return { url, hash: crypto.createHash('sha1').update(content(html)).digest('hex').slice(0, 16) };
}

// Priority of a new page; pages already in the sitemap keep theirs
function priority(url) {
  const bare = url.replace(/^\/(en|de|it|es)(?=\/)/, '');
  if (bare === '/') return url === '/' ? '1.0' : '0.8';
  if (['/magnitni-buri/', '/weather/', '/maps/', '/holliday_calendar/'].includes(bare)) return '0.8';
  const depth = bare.split('/').length - 2;
  return depth <= 1 ? '0.7' : depth === 2 ? '0.6' : '0.5';
}

const old = new Map();
if (fs.existsSync(SITEMAP)) {
  for (const match of fs.readFileSync(SITEMAP, 'utf8').matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]*)<\/lastmod>\s*)?(?:<priority>([^<]*)<\/priority>\s*)?<\/url>/g)) {
    old.set(match[1].slice(SITE.length), { lastmod: match[2] || today, priority: match[3] });
  }
}
const hashes = fs.existsSync(HASHES) ? JSON.parse(fs.readFileSync(HASHES, 'utf8')) : {};
const pages = walk(ROOT).map(indexable).filter(Boolean);
const newHashes = {};
let changed = 0;
const entries = pages.map(({ url, hash }) => {
  newHashes[url] = hash;
  const before = old.get(url);
  let lastmod = before ? before.lastmod : today;
  if (!SEED && hashes[url] !== hash) {
    if (hashes[url] || !before) changed++;
    // a page seen for the first time keeps the date it had in the sitemap
    if (hashes[url] || !before) lastmod = today;
  }
  return { url, lastmod, priority: (before && before.priority) || priority(url) };
});
// Order: the order of the old sitemap, new pages after it in alphabetical order
const order = [...old.keys()];
entries.sort((a, b) => {
  const ia = order.indexOf(a.url), ib = order.indexOf(b.url);
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  return a.url.localeCompare(b.url);
});

fs.writeFileSync(HASHES, JSON.stringify(Object.fromEntries(Object.keys(newHashes).sort().map(url => [url, newHashes[url]])), null, 0).replace(/,"/g, ',\n"') + '\n');
if (SEED) {
  console.log(`Remembered the content of ${pages.length} pages; sitemap.xml not changed.`);
} else {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `
  <url>
    <loc>${SITE}${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}

</urlset>
`;
  fs.writeFileSync(SITEMAP, xml);
  const removed = [...old.keys()].filter(url => !newHashes[url]).length;
  console.log(`sitemap.xml: ${entries.length} pages, ${changed} with new content (lastmod ${today}), ${removed} removed.`);
}
