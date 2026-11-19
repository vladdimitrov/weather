# WeatherPulse – notes for Claude

weatherpulse.eu: a static weather site on GitHub Pages, part of the VYZYA brand (vyzya.com). The technical documentation is README.md; this file is about the goals, the decisions already taken and how to work in this repo. Read both before changing anything.

## Audience and goals

- Bulgarians in Bulgaria, Bulgarians abroad and foreign tourists in Bulgaria and Greece.
- Search Console (Nov 2026): most impressions for "времето" and "времето утре" come from the Bulgarian pages of cities abroad (Munich, The Hague, Vienna…) shown to Bulgarians living there. These pages matter as much as the Bulgarian cities.
- Growth comes from Google. The weak point is the click-through rate (under 1 %), not the position (7–10 on the main queries): titles and descriptions are worth more than new pages.
- Pages that bring clicks: magnetic storms (`/magnitni-buri/`), the ski resorts (Bansko, Borovets, Pamporovo), the 10- and 14-day city pages.
- Later: ads (needs more traffic), automated Facebook/Instagram posts, maybe a YouTube channel.

## Decisions already taken (do not undo without asking)

- **Languages:** bg, en, de, it, es, fr, nl; Romanian (ro) for the ski resorts only.
- **Addresses:** French, Dutch and Romanian use their own words (`/fr/meteo/sofia/`, `SLUGS` in `i18n.js`). German, Italian, Spanish and English keep the Bulgarian words (`/de/vremeto/sofia/`) because those pages are indexed: do not translate them.
- **SEO focus:** the Bulgarian ski resorts first, then the Greek resorts and the coast.
- **Not wanted:** astrology-style lunar pages (gardening, haircuts) and seasonal pages.
- **Moon calendar:** past months are noindex and out of the sitemap (automatic).
- **Descriptions of the city pages** start with today and tomorrow, written every morning by `build-forecast.js` (the resorts start with the snow); keep it that way.
- Don't add hundreds of new pages at once: Google is still indexing the site slowly (Nov 2026: ~780 indexed, ~700 waiting).

## Suggested next (not decided yet, ask first)

- Languages by tourist numbers: Greek and more Romanian pages first, then Polish, Serbian, Turkish; Spanish has the least potential.
- External links: offer the embeddable widget (`/uidzhet/`) to hotels and ski schools in the resorts.
- Shareable posts for official weather warnings and strong magnetic storms.

## How to work here

- Generated pages are never edited by hand: change the generator or its `text-*.js` file, then run the generator (README, "Scripts").
- After any change: `node .github/scripts/build-sitemap.js` and `node .github/scripts/check-site.js` (must pass). For forecast or moon changes also `test-moon.js` / `test-sun.js`.
- Running the generators twice must change nothing.
- The sandbox may have no network: `build-forecast.js` and friends can be tested with a fake `fetch`; the real run is the "Daily forecast in the city pages" workflow (can be started by hand).
- `main` gets automatic commits every day (forecast, warnings, share cards): pull before working.
- Work on a branch and open a pull request; the owner merges. Commit messages in English, the owner talks in Bulgarian.
- GitHub Pages has no real 301: a moved page gets a redirect page from `build-redirects.js`.
