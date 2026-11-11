// Site check, run by GitHub Actions on every pull request and push to main
// (.github/workflows/check.yml). Also works locally: node .github/scripts/check-site.js
//
// Fails when:
//   - a page, stylesheet or the manifest points to a local file that doesn't exist
//   - a .js file or an inline <script> has a syntax error
//   - JSON (manifest, <script type="application/ld+json">) doesn't parse
//   - a page's canonical or og:url is not its own address
//   - hreflang links point to a missing page, or the translations of a page don't list each other
//   - sitemap.xml lists a page that doesn't exist, or misses a page that has a canonical address
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const problems = [];

function walk(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else found.push(full);
  }
  return found;
}

const files = walk(root);
// the generators too (walk() skips .github): a syntax error there stops the next build
for (const name of fs.readdirSync(__dirname)) if (name.endsWith('.js')) files.push(path.join(__dirname, name));
const relative = file => path.relative(root, file).split(path.sep).join('/');

// Resolve a reference from a file to a path in the repository, or null for
// external and special links
function resolveReference(fromFile, reference) {
  const ref = reference.trim();
  if (!ref || /^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(ref) || ref.includes('${')) return null;
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
  if (!clean) return null;
  const target = clean.startsWith('/') ? path.join(root, clean) : path.join(path.dirname(fromFile), clean);
  return target.endsWith(path.sep) || clean.endsWith('/') ? path.join(target, 'index.html') : target;
}

function checkReference(fromFile, reference, kind) {
  const target = resolveReference(fromFile, reference);
  if (!target) return;
  const exists = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
  if (!exists) problems.push(`${relative(fromFile)}: ${kind} "${reference}" not found`);
}

function checkSyntax(label, code) {
  try {
    new Function(code);
  } catch (err) {
    problems.push(`${label}: JavaScript syntax error: ${err.message}`);
  }
}

for (const file of files) {
  const text = () => fs.readFileSync(file, 'utf8');

  if (file.endsWith('.html')) {
    // commented-out markup is never loaded
    const html = text().replace(/<!--[\s\S]*?-->/g, '');
    // src="..." and href="..." (links, scripts, styles, images, icons, manifest)
    for (const match of html.matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
      checkReference(file, match[1], 'reference');
    }
    // url(...) in inline styles
    for (const match of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      checkReference(file, match[1], 'url()');
    }
    // inline scripts
    for (const match of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
      const attributes = match[1] || '';
      const code = match[2];
      if (/\ssrc\s*=/.test(attributes) || !code.trim()) continue;
      if (/application\/ld\+json/.test(attributes)) {
        try { JSON.parse(code); } catch (err) { problems.push(`${relative(file)}: invalid JSON-LD: ${err.message}`); }
      } else {
        checkSyntax(`${relative(file)} (inline script)`, code);
      }
    }
  } else if (file.endsWith('.js')) {
    checkSyntax(relative(file), text());
  } else if (file.endsWith('.css')) {
    for (const match of text().matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      checkReference(file, match[1], 'url()');
    }
  } else if (file.endsWith('.webmanifest')) {
    try {
      const manifest = JSON.parse(text());
      (manifest.icons || []).forEach(icon => checkReference(file, icon.src, 'icon'));
      checkReference(file, manifest.start_url || '/', 'start_url');
    } catch (err) {
      problems.push(`${relative(file)}: invalid JSON: ${err.message}`);
    }
  }
}

// ---- Addresses: canonical, hreflang and the sitemap ----
const SITE = 'https://weatherpulse.eu';
// "/en/luna/" for en/luna/index.html; null for files that are not pages of their own
const pageUrl = file => {
  const rel = relative(file);
  return rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? '/' + rel.slice(0, -'index.html'.length) : null;
};
const pageFile = url => path.join(root, url, 'index.html');
const pages = new Map(); // url -> { canonical, alternates: { hreflang: url } }
for (const file of files) {
  const url = pageUrl(file);
  if (!url) continue;
  const html = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canonical) continue; // 404 page, widget
  const alternates = {};
  for (const match of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) alternates[match[1]] = match[2];
  pages.set(url, { canonical, alternates });
  if (canonical !== SITE + url) problems.push(`${relative(file)}: canonical is "${canonical}", expected "${SITE + url}"`);
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]+)"/) || [])[1];
  if (ogUrl && ogUrl !== canonical) problems.push(`${relative(file)}: og:url "${ogUrl}" differs from the canonical address`);
}
for (const [url, page] of pages) {
  const label = relative(pageFile(url));
  const languages = Object.keys(page.alternates);
  if (!languages.length) continue;
  if (!Object.values(page.alternates).includes(SITE + url)) problems.push(`${label}: its hreflang links don't include the page itself`);
  for (const language of languages) {
    const target = page.alternates[language];
    const other = target.startsWith(SITE + '/') ? pages.get(target.slice(SITE.length)) : null;
    if (!other) { problems.push(`${label}: hreflang "${language}" points to "${target}", which is not a page of the site`); continue; }
    // every translation lists the same set of pages
    if (JSON.stringify(other.alternates) !== JSON.stringify(page.alternates)) problems.push(`${label}: hreflang "${language}" page "${target}" has different hreflang links`);
  }
}
const sitemapFile = path.join(root, 'sitemap.xml');
if (fs.existsSync(sitemapFile)) {
  const listed = [...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const seen = new Set();
  for (const loc of listed) {
    if (seen.has(loc)) problems.push(`sitemap.xml: "${loc}" is listed twice`);
    seen.add(loc);
    if (!loc.startsWith(SITE + '/') || !pages.has(loc.slice(SITE.length))) problems.push(`sitemap.xml: "${loc}" is not a page of the site`);
  }
  for (const url of pages.keys()) if (!seen.has(SITE + url)) problems.push(`sitemap.xml: "${SITE + url}" is missing`);
}

const checked = files.filter(f => /\.(html|js|css|webmanifest)$/.test(f)).length;
if (problems.length) {
  console.error(`Site check failed (${problems.length} problem${problems.length > 1 ? 's' : ''} in ${checked} files):`);
  problems.forEach(problem => console.error('  - ' + problem));
  process.exit(1);
}
console.log(`Site check passed: ${checked} files, no missing files or syntax errors.`);
