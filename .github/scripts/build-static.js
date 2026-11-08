// Generates /za-saita/ (About) and /poveritelnost/ (Privacy) in the five languages
// (/za-saita/, /en/za-saita/, /de/za-saita/ ...). Texts: text-static.js.
// Run from the repository root: node .github/scripts/build-static.js [--sitemap]
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { ABOUT, PRIVACY } = require('./text-static.js');
const { page, write } = require('./build-pages.js');

const ROOT = process.cwd();
const L = (lang, url) => I18N.localUrl(lang, url);
// Pages that exist per language; every other internal link goes to the page at the root (translated in the browser)
const LOCALIZED = ['/luna/', '/nebeto/', '/za-saita/', '/poveritelnost/'];
const links = lang => ({
  i: (url, text) => `<a href="${LOCALIZED.includes(url) ? L(lang, url) : url}">${text}</a>`,
  x: (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`
});
const list = items => items.map(item => `        <li>${item}</li>`).join('\n');

function aboutPage(lang) {
  const { i, x } = links(lang);
  const T = ABOUT[lang](i, x);
  return page({
    url: '/za-saita/',
    lang,
    multi: true,
    title: T.title,
    description: T.description,
    body: `    <h1>${T.h1}</h1>
    <section class="info-card">
      <p>${T.lead}</p>

      <h2>${T.hWhat}</h2>
      <ul>
${list(T.what)}
      </ul>

      <h2>${T.hData}</h2>
      <ul>
${list(T.data)}
      </ul>
      <p>${T.moreData}</p>

      <h2>${T.hHow}</h2>
      <p>${T.how1}</p>
      <p>${T.how2}</p>

      <h2>${T.hPrivacy}</h2>
      <p>${T.privacy}</p>

      <h2>${T.hContact}</h2>
      <p>${T.contact}</p>
      <p>${T.maintained}</p>
    </section>`
  });
}

function privacyPage(lang) {
  const { i, x } = links(lang);
  const T = PRIVACY[lang](i, x);
  return page({
    url: '/poveritelnost/',
    lang,
    multi: true,
    title: T.title,
    description: T.description,
    body: `    <h1>${T.h1}</h1>
    <section class="info-card">
      <p class="info-updated">${T.updated}</p>
      <p>${T.lead}</p>

      <h2>${T.hLocal}</h2>
      <p>${T.localIntro}</p>
      <ul>
${list(T.local)}
      </ul>
      <p>${T.localOutro}</p>

      <h2>${T.hGa}</h2>
      <p>${T.ga1}</p>
      <p>${T.ga2}</p>

      <h2>${T.hExt}</h2>
      <p>${T.extIntro}</p>
      <ul>
${list(T.ext)}
      </ul>

      <h2>${T.hLoc}</h2>
      <p>${T.loc}</p>

      <h2>${T.hNotif}</h2>
      <p>${T.notif}</p>

      <h2>${T.hRights}</h2>
      <p>${T.rights}</p>
    </section>`
  });
}

I18N.LANGS.forEach(lang => {
  write(L(lang, '/za-saita/').slice(1), aboutPage(lang));
  write(L(lang, '/poveritelnost/').slice(1), privacyPage(lang));
});
console.log(`Wrote /za-saita/ and /poveritelnost/ in ${I18N.LANGS.length} languages.`);

if (process.argv.includes('--sitemap')) {
  const today = new Date().toISOString().slice(0, 10);
  const file = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  const nl = sitemap.includes('\r\n') ? '\r\n' : '\n';
  const urls = I18N.LANGS.flatMap(lang => ['/za-saita/', '/poveritelnost/'].map(url => L(lang, url)));
  const missing = urls.filter(url => !sitemap.includes(`https://weatherpulse.eu${url}<`));
  const entries = missing.map(url => ['  <url>', `    <loc>https://weatherpulse.eu${url}</loc>`, `    <lastmod>${today}</lastmod>`, '    <priority>0.3</priority>', '  </url>', ''].join(nl)).join(nl);
  fs.writeFileSync(file, sitemap.replace('</urlset>', entries + '</urlset>'));
  console.log(`Added ${missing.length} URLs to sitemap.xml.`);
}
