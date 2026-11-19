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
- **Magnetic storms today and tomorrow:** `/magnitni-buri/dnes/` and `/utre/` already exist, so no new pages. Their HTML has the Kp of both days, a coloured level, the peak and one sentence for people; the title and description carry the numbers of the day ("Магнитни бури днес (19 ноември) – Kp 5.0, слаба буря"), written every morning by `build-storms.js`. These places sit between `<!-- volatile -->` marks, so the sitemap `lastmod` does not move every day. Bulgarian only.
- **10- and 14-day pages:** the title starts with the exact query ("Времето в Перник за 10 дни – …") and ends with "10-дневна прогноза по дни"; the hub `/vremeto/` links to all of them. Pernik keeps its old texts (`KEEP_TEXT` in `build-extra.js`): its 10-day page has a 28 % CTR at position 9, do not touch it without data. No new cities, no "25 days" pages (the forecast reaches 16 days).
- **Widget for hotels (external links):** `/uidzhet/` has a section with ready code for the five ski resorts. The code is the iframe plus a plain, visible, dofollow link "Прогноза: WeatherPulse" to the city page **outside** the iframe (a link inside an iframe is not a link of the page that embeds it); the widget has the same link inside. Keep the anchor the brand name, not keywords, and do not hide it (Google treats keyword-rich links in distributed widgets as link spam). Open-Meteo's free API is for non-commercial use and the widget calls it from visitors' browsers: check their terms before spreading the widget widely. Emails to hotels are written by the owner.
- **Posts for warnings (Facebook/Instagram):** the owner wants to see every new kind of post before it goes out. An orange or red code of NIMH (`data/warnings-bg.json`) makes a DRAFT (card + text in `tools/social/queue/drafts/`, `python main.py warnings`) and a GitHub issue (e-mail to the owner); the workflow "Social draft" publishes (next slot or at once) or deletes it. One draft per warning, at most 2 new drafts a day (red first). Magnetic storms of Kp 5+ are the older automatic posts of `alerts.py` and stay as they are (Kp 7+ needs no extra post). Everything else in `tools/social` (forecast, queue, storms) still posts by itself.
- Don't add hundreds of new pages at once: Google is still indexing the site slowly (Nov 2026: ~780 indexed, ~700 waiting).

## Next task (decided)

- **Agro forecast (агропрогноза):** a section for farmers – frost risk, spraying windows, soil temperature and moisture, weekly rain totals, days for sowing and harvest. Plan in `NEXT_TASK.md`.

## Suggested next (not decided yet, ask first)

- Last-minute offers from local hotels on the city pages, tied to the forecast; start with affiliate links to test interest (see `NEXT_TASK.md`).
- Later, a separate VYZYA product: simple software for small guest houses (offers panel, availability calendar, direct booking, iCal sync), feeding offers to the city pages. Not a full PMS. Needs a backend outside GitHub Pages (see `NEXT_TASK.md`).
- Languages by tourist numbers: Greek and more Romanian pages first, then Polish, Serbian, Turkish; Spanish has the least potential.

## How to work here

- Generated pages are never edited by hand: change the generator or its `text-*.js` file, then run the generator (README, "Scripts").
- After any change: `node .github/scripts/build-sitemap.js` and `node .github/scripts/check-site.js` (must pass). For forecast or moon changes also `test-moon.js` / `test-sun.js`.
- Running the generators twice must change nothing.
- The sandbox may have no network: `build-forecast.js` and friends can be tested with a fake `fetch`; the real run is the "Daily forecast in the city pages" workflow (can be started by hand).
- `main` gets automatic commits every day (forecast, warnings, share cards): pull before working.
- Work on a branch and open a pull request; the owner merges. Commit messages in English, the owner talks in Bulgarian.
- GitHub Pages has no real 301: a moved page gets a redirect page from `build-redirects.js`.

## Keep this file current

Without being asked: when the owner takes a decision about the site (a language, an address, a kind of page wanted or not, a priority), or a suggestion above is done or rejected, update this file in the same pull request. Keep it short: decisions and reasons, not a log of the work.
