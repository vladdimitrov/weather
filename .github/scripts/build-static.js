// Generates /za-saita/ (About) and /poveritelnost/ (Privacy) in the five languages
// (/za-saita/, /en/za-saita/, /de/za-saita/ ...). Texts: text-static.js.
// Run from the repository root: node .github/scripts/build-static.js, then build-sitemap.js
const fs = require('fs');
const path = require('path');
const I18N = require('./i18n.js');
const { ABOUT, PRIVACY, MAIL } = require('./text-static.js');
const { page, write } = require('./build-pages.js');

const ROOT = process.cwd();
const L = (lang, url) => I18N.localUrl(lang, url);
// Pages that exist per language; every other internal link goes to the page at the root (translated in the browser)
const LOCALIZED = ['/luna/', '/nebeto/', '/za-saita/', '/poveritelnost/', '/iztochnici/', '/gradove/'];
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
    // Who is behind the site, as structured data (search engines look for a clear owner)
    jsonLd: `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'AboutPage', name: T.title, url: `https://weatherpulse.eu${L(lang, '/za-saita/')}`, inLanguage: lang, about: { '@id': 'https://weatherpulse.eu/#organization' } },
      {
        '@type': 'Organization', '@id': 'https://weatherpulse.eu/#organization', name: 'Weather Pulse', url: 'https://weatherpulse.eu/',
        logo: 'https://weatherpulse.eu/images/icons/icon-512.png', email: MAIL,
        parentOrganization: { '@type': 'Organization', name: 'VYZYA' },
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: MAIL, availableLanguage: ['bg', 'en'] }
      }
    ]
  })}
  </script>
`,
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

// The sitemap: node .github/scripts/build-sitemap.js
