// Site check, run by GitHub Actions on every pull request and push to main
// (.github/workflows/check.yml). Also works locally: node .github/scripts/check-site.js
//
// Fails when:
//   - a page, stylesheet or the manifest points to a local file that doesn't exist
//   - a .js file or an inline <script> has a syntax error
//   - JSON (manifest, <script type="application/ld+json">) doesn't parse
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

const checked = files.filter(f => /\.(html|js|css|webmanifest)$/.test(f)).length;
if (problems.length) {
  console.error(`Site check failed (${problems.length} problem${problems.length > 1 ? 's' : ''} in ${checked} files):`);
  problems.forEach(problem => console.error('  - ' + problem));
  process.exit(1);
}
console.log(`Site check passed: ${checked} files, no missing files or syntax errors.`);
