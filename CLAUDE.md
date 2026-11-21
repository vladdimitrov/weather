# WeatherPulse – notes for Claude

weatherpulse.eu: a static weather site on GitHub Pages, part of the VYZYA brand (vyzya.com). The technical documentation is README.md; this file is about the goals, the decisions already taken and how to work in this repo. Read both before changing anything.

## Audience and goals

- Bulgarians in Bulgaria, Bulgarians abroad and foreign tourists in Bulgaria and Greece.
- Search Console (Nov 2026): most impressions for "времето" and "времето утре" come from the Bulgarian pages of cities abroad (Munich, The Hague, Vienna…) shown to Bulgarians living there. These pages matter as much as the Bulgarian cities.
- Growth comes from Google. The weak point is the click-through rate (under 1 %), not the position (7–10 on the main queries): titles and descriptions are worth more than new pages.
- Pages that bring clicks: magnetic storms (`/magnitni-buri/`), the ski resorts (Bansko, Borovets, Pamporovo), the 10- and 14-day city pages.
- Later: ads (needs more traffic, and the Open-Meteo licence first), automated Facebook/Instagram posts.

## Decisions already taken (do not undo without asking)

- **Languages:** bg, en, de, it, es, fr, nl; Romanian (ro) for the ski resorts and the magnetic storms only.
- **Addresses:** French, Dutch and Romanian use their own words (`/fr/meteo/sofia/`, `SLUGS` in `i18n.js`). German, Italian, Spanish and English keep the Bulgarian words (`/de/vremeto/sofia/`) because those pages are indexed: do not translate them.
- **SEO focus:** the Bulgarian ski resorts first, then the Greek resorts and the coast.
- **Not wanted:** astrology-style lunar pages (gardening, haircuts) and seasonal pages.
- **Moon calendar:** past months are noindex and out of the sitemap (automatic).
- **Descriptions of the city pages** start with today and tomorrow, written every morning by `build-forecast.js` (the resorts start with the snow); keep it that way.
- **Magnetic storms today and tomorrow:** `/magnitni-buri/dnes/` and `/utre/` already exist, so no new pages. Their HTML has the Kp of both days, a coloured level, the peak and one sentence for people; the title and description carry the numbers of the day ("Магнитни бури днес (19 ноември) – Kp 5.0, слаба буря"), written every morning by `build-storms.js`. These places sit between `<!-- volatile -->` marks, so the sitemap `lastmod` does not move every day. Bulgarian and, since 21 Nov 2026, English (`/en/magnitni-buri/dnes/`, `/utre/`, `DAY_LANGS` in `build-storm-pages.js`: the English storm page had a 26 % CTR and storms are the same over all of Europe); the other storm subpages are Bulgarian only. Romanian too (21 Nov 2026, owner's decision, an exception to "foreign languages only for Bulgaria and Greece" because storms do not depend on a place): `/ro/furtuni-magnetice/` (texts in `js/storm-page.js`, `RO_URLS` in `text-ro.js`), `/azi/` and `/maine/`.
- **10- and 14-day pages:** the title starts with the exact query ("Времето в Перник за 10 дни – …") and ends with "10-дневна прогноза по дни"; the hub `/vremeto/` links to all of them. Pernik keeps its old texts (`KEEP_TEXT` in `build-extra.js`): its 10-day page has a 28 % CTR at position 9, do not touch it without data. No new cities, no "25 days" pages (the forecast reaches 16 days).
- **Widget for hotels (external links):** `/uidzhet/` has a section with ready code for the five ski resorts. The code is the iframe plus a plain, visible, dofollow link "Прогноза: WeatherPulse" to the city page **outside** the iframe (a link inside an iframe is not a link of the page that embeds it); the widget has the same link inside. Keep the anchor the brand name, not keywords, and do not hide it (Google treats keyword-rich links in distributed widgets as link spam). Open-Meteo's free API is for non-commercial use and the widget calls it from visitors' browsers: check their terms before spreading the widget widely. Emails to hotels are written by the owner.
- **Rain radar (21 Nov 2026):** the "now" of the site is the forecast model, not a measurement, so a shower the models miss is not shown. Radar through the Windy embed already used on `/maps/` (layer "radar", `/maps/?layer=radar`), linked under the "now" block of `/weather/`. Free only for non-commercial use (Windy, like Open-Meteo): settle it together with the licence before ads. RainViewer rejected (personal/educational only, zoom ≤ 7).
- **Kartala (20 Nov 2026):** `/vremeto/kartala/` (Bodrost, near Blagoevgrad), same as Aleko below, requested by the owner.
- **Aleko / Vitosha (20 Nov 2026):** `/vremeto/aleko/` is a ski page like Bansko (`SKI_POINTS` in `build-pages.js`: Aleko 1800 m, Cherni vrah 2290 m), listed in the snow table and on the hub of the resorts; Bulgarian and English indexed only (not in `TOURIST_BG`), name "Алеко, Витоша" because both are searched.
- **Posts for warnings (Facebook/Instagram):** the owner wants to see every new kind of post before it goes out. An orange or red code of NIMH (`data/warnings-bg.json`) makes a DRAFT (card + text in `tools/social/queue/drafts/`, `python main.py warnings`) and a GitHub issue (e-mail to the owner); the workflow "Social draft" publishes (next slot or at once) or deletes it. One draft per warning, at most 2 new drafts a day (red first). Magnetic storms of Kp 5+ are the older automatic posts of `alerts.py` and stay as they are (Kp 7+ needs no extra post). Everything else in `tools/social` (forecast, queue, storms) still posts by itself.
- **Bulgarians abroad (Bulgarian pages of European cities):** the title already starts with "Времето в <град>" and ends with "прогноза на български", the description starts with the numbers of the day: unchanged. New (Nov 2026, `build-europe.js` + `build-forecast.js`): on the Bulgarian city pages of the **test group** the block "Днес в <град> и в София" (time difference to Bulgaria computed from the IANA zone, a table of today and tomorrow in the city and in Sofia between `<!-- volatile -->`, links "Времето у дома"). Test group (`ABROAD` in `build-europe.js`): Germany, Netherlands, France, Austria, Belgium, Spain, Italy, United Kingdom, Ireland, because the Bulgarian impressions come from there. **Control group:** every other country has no block and must stay that way until the check on **7 December 2026** (compare impressions, position and CTR of the two groups in Search Console; roll the block out to the rest only if the test group is better). One new page: `/europe/balgari-v-chuzhbina/` ("Времето за българите в чужбина": "Популярни градове" first, then the test countries), linked from the home page (`data-bg-page`, hidden in the translations) and from `/europe/`. No invented data (no numbers of Bulgarians, flights).
- **Spanish Dublin:** `/es/europe/ireland/dublin/` has "clima" in the title and description (1,224 of its 1,253 impressions are the query "clima"); nothing else in Spanish until there is data.
- Don't add hundreds of new pages at once: Google is still indexing the site slowly (Nov 2026: ~1 190 indexed, ~675 "crawled/discovered – not indexed").
- **Indexing cleanup (20 Nov 2026, after a discussion in the VYZYA AI Forum):** the not-indexed pages were almost all translations. Now noindex, out of the sitemap, without hreflang and without links from indexed pages (they still exist for visitors and the language switcher): the translated pages of every country abroad except Greece (`FOREIGN_COUNTRIES` in `places.js`; the Spanish Dublin stays), the translated country hubs except Greece and the translated `/europe/`, and the whole Moon calendar in the six translations (`INDEXED` in `build-luna.js`). Bulgarian Europe pages are untouched apart from losing their hreflang and footer links to those translations (same change in the test and the control group). In Bulgarian all full moons are one page with an address without the year, `/luna/pylnolunie/` (the dated pages and the yearly lists redirect to it). Weekend pages of their own only for Bansko, Borovets, Pamporovo, Varna and Slanchev bryag (`WEEKEND_PAGES`); for the other tourist places the weekend is a block `#uikend` of the 10-day page and the old address redirects there. Sitemap: 1 810 → 764 addresses. Measure the number of indexed Bulgarian pages and how fast a new one is indexed, not the clicks, in weeks 4 and 8 (about 18 Dec and 15 Jan). Once Google has dropped the noindex pages, stop generating them (less work for the daily forecast). Not done: 410 (GitHub Pages cannot send it).

## Plan (decided Nov 2026, details in `NEXT_TASK.md`)

1. **First: Open-Meteo commercial licence** (paid plan or self-hosting) – before any affiliate link or ad, since the free API is non-commercial.
2. **Nov–Dec: hotel offers on the ski resort pages**, tied to the forecast ("sunny weekend – free rooms"); start with affiliate links. Also: real numbers of the day in the ski titles and descriptions ("Банско утре: −4°, 20 см нов сняг"), like the city and storm pages.
3. **Jan–Feb: agro forecast as a layer inside the existing city pages** (frost, spraying window, soil temperature and moisture, weekly rain) – no new URLs, so the indexing problem does not grow; ready for March. Paid agro alerts only later, after a free Telegram/Viber frost channel shows interest.
4. **Fix indexing before adding pages:** first step done on 20 Nov 2026 (see "Indexing cleanup"). Still to check: Google knows ~2 300 addresses but the sitemap had 1 810 – find the others in Search Console (old addresses, parameters, trailing slash).
- **Expansion rule:** new destinations only in Bulgarian and only where Bulgarians really search (GSC, Google Trends), e.g. Thessaloniki, Halkidiki, Istanbul. Foreign-language pages stay for Bulgaria and Greece only. No "weather for the world".
- **Dropped for now:** software for guest houses (separate business), YouTube channel.
- **Not worth it:** FAQPage/HowTo schema for CTR (Google limits FAQ rich results to government/health sites and removed HowTo).

## Suggested next (not decided yet, ask first)

- Languages by tourist numbers: Greek and more Romanian pages first, then Polish, Serbian, Turkish; Spanish has the least potential.

## How to work here

- Generated pages are never edited by hand: change the generator or its `text-*.js` file, then run the generator (README, "Scripts").
- After any change: `node .github/scripts/build-sitemap.js` and `node .github/scripts/check-site.js` (must pass). For forecast or moon changes also `test-moon.js` / `test-sun.js`.
- Running the generators twice must change nothing.
- **Open-Meteo free limit** (< 10 000 calls a day, a call with many places/variables/models counts as several): the forecast workflow asks Open-Meteo only on its first run of the day (UTC) and in the scheduled morning run; the runs after pushes reuse the day's answers (`om-cache.js`, actions/cache). New scripts that call Open-Meteo in a workflow go through `OmCache.json()`.
- The sandbox may have no network: `build-forecast.js` and friends can be tested with a fake `fetch`; the real run is the "Daily forecast in the city pages" workflow (can be started by hand).
- `main` gets automatic commits every day (forecast, warnings, share cards): pull before working.
- Work on a branch and open a pull request; the owner merges. Commit messages in English, the owner talks in Bulgarian.
- GitHub Pages has no real 301: a moved page gets a redirect page from `build-redirects.js`.

## Keep this file current

Without being asked: when the owner takes a decision about the site (a language, an address, a kind of page wanted or not, a priority), or a suggestion above is done or rejected, update this file in the same pull request. Keep it short: decisions and reasons, not a log of the work.
