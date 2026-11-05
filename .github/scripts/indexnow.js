// Tells the search engines that use IndexNow (Bing, Yandex, Seznam, Naver…;
// Bing also serves DuckDuckGo, Yahoo and ChatGPT search) about the pages in
// sitemap.xml, so they crawl new and changed pages sooner.
// The key file /<KEY>.txt at the site root proves the site is ours.
// Run from the repository root: node .github/scripts/indexnow.js
// (the "IndexNow" workflow runs it after every push to main).
const fs = require('fs');
const path = require('path');

const HOST = 'weatherpulse.eu';
const KEY = 'fd0de53b5adf000adbdcd0dff74d4364';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

(async function main() {
  const keyFile = path.join(process.cwd(), `${KEY}.txt`);
  if (!fs.existsSync(keyFile) || fs.readFileSync(keyFile, 'utf8').trim() !== KEY) {
    throw new Error(`Key file ${KEY}.txt is missing or does not contain the key`);
  }

  const sitemap = fs.readFileSync(path.join(process.cwd(), 'sitemap.xml'), 'utf8');
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
  if (!urlList.length) throw new Error('No URLs in sitemap.xml');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList
    })
  });
  // 200 OK and 202 Accepted (key not checked yet) both mean the list was taken
  console.log(`IndexNow: ${response.status} ${response.statusText} for ${urlList.length} URLs`);
  if (!response.ok) {
    console.log(await response.text());
    process.exit(1);
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
