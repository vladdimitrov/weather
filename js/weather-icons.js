// Weather icons for the forecast tables: round medallions with a coloured
// background and a gold rim. Used by weather-fixed.js (daily),
// weather-hourly.js (hourly) and forecast-extras.js (warning badges).
window.WeatherIcons = (function () {
  // Glyphs on a 48x48 grid
  const GLYPHS = {
    sun: '<circle cx="24" cy="24" r="9" fill="#FFD54A"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11.5 11.5l3.5 3.5M33 33l3.5 3.5M36.5 11.5L33 15M15 33l-3.5 3.5" stroke="#F39C12" stroke-width="3" stroke-linecap="round"/>',
    cloudSun: '<circle cx="17" cy="16" r="7" fill="#FFD54A"/><path d="M17 5v2M7 16h2M9 8l1.4 1.4M25 8l-1.4 1.4" stroke="#F39C12" stroke-width="2.5" stroke-linecap="round"/><path d="M19 36h17a6 6 0 0 0 0-12 8 8 0 0 0-15-2A5 5 0 0 0 19 36z" fill="#EAF2F8" stroke="#AED6F1" stroke-width="1.5"/>',
    cloud: '<path d="M14 34h20a7 7 0 0 0 0-14 9 9 0 0 0-17.5 2.5A6 6 0 0 0 14 34z" fill="#EAF2F8" stroke="#AED6F1" stroke-width="1.5"/>',
    rain: '<path d="M14 28h20a6 6 0 0 0 0-12 8 8 0 0 0-15.4 2.2A5 5 0 0 0 14 28z" fill="#AEB6BF"/><path d="M18 33l-2 5M26 33l-2 5M34 33l-2 5" stroke="#3498DB" stroke-width="2.5" stroke-linecap="round"/>',
    drizzle: '<path d="M14 28h20a6 6 0 0 0 0-12 8 8 0 0 0-15.4 2.2A5 5 0 0 0 14 28z" fill="#AEB6BF"/><circle cx="18" cy="35" r="1.8" fill="#85C1E9"/><circle cx="26" cy="38" r="1.8" fill="#85C1E9"/><circle cx="34" cy="35" r="1.8" fill="#85C1E9"/>',
    snow: '<path d="M14 28h20a6 6 0 0 0 0-12 8 8 0 0 0-15.4 2.2A5 5 0 0 0 14 28z" fill="#AEB6BF"/><circle cx="18" cy="36" r="2.2" fill="#D6EAF8"/><circle cx="26" cy="39" r="2.2" fill="#D6EAF8"/><circle cx="34" cy="36" r="2.2" fill="#D6EAF8"/>',
    fog: '<path d="M8 19h32M6 25h36M10 31h28M8 37h32" stroke="#D5DBDB" stroke-width="3.5" stroke-linecap="round"/>',
    thunder: '<path d="M14 26h20a6 6 0 0 0 0-12 8 8 0 0 0-15.4 2.2A5 5 0 0 0 14 26z" fill="#7F8C8D"/><path d="M25 29l-5 8h5l-3 6 8-9h-5l3-5z" fill="#F4D03F"/>',
    frost: '<path d="M24 6v36M9.8 14l28.4 20M38.2 14L9.8 34" stroke="#2E86C1" stroke-width="3" stroke-linecap="round"/><path d="M20 9l4 3 4-3M20 39l4-3 4 3" stroke="#85C1E9" stroke-width="3" stroke-linecap="round" fill="none"/>',
    wind: '<path d="M6 18h22a5 5 0 1 0-5-5M6 26h30a5 5 0 1 1-5 5M6 34h14" stroke="#AEB6BF" stroke-width="3.2" stroke-linecap="round" fill="none"/>',
    heat: '<path d="M20 9a4 4 0 0 1 8 0v21a7 7 0 1 1-8 0z" fill="#EC7063"/><circle cx="24" cy="37" r="5" fill="#E74C3C"/>',
    sunrise: '<path d="M7 37h34" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/><path d="M14 37a10 10 0 0 1 20 0z" fill="#FFD54A"/><path d="M9 30h3M36 30h3M13.5 24l2 2M34.5 24l-2 2" stroke="#FFD54A" stroke-width="2.4" stroke-linecap="round"/><path d="M24 17V7M19.5 11.5L24 7l4.5 4.5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    sunset: '<path d="M7 37h34" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/><path d="M14 37a10 10 0 0 1 20 0z" fill="#FF8A5C"/><path d="M9 30h3M36 30h3M13.5 24l2 2M34.5 24l-2 2" stroke="#FFB38A" stroke-width="2.4" stroke-linecap="round"/><path d="M24 7V17M19.5 12.5L24 17l4.5-4.5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    moonNew: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/>',
    moonWaxCrescent: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 8 A16 16 0 0 1 24 40 A8 16 0 0 0 24 8 Z" fill="#F7DC6F"/>',
    moonFirstQ: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 8 A16 16 0 0 1 24 40 Z" fill="#F7DC6F"/>',
    moonWaxGibbous: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 8 A16 16 0 0 1 24 40 A8 16 0 0 1 24 8 Z" fill="#F7DC6F"/>',
    moonFull: '<circle cx="24" cy="24" r="16" fill="#F7DC6F" stroke="#F7DC6F" stroke-width="1.2"/>',
    moonWaneGibbous: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 8 A16 16 0 0 0 24 40 A8 16 0 0 0 24 8 Z" fill="#F7DC6F"/>',
    moonLastQ: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 8 A16 16 0 0 0 24 40 Z" fill="#F7DC6F"/>',
    moonWaneCrescent: '<circle cx="24" cy="24" r="16" fill="#1B2A4A" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 8 A16 16 0 0 0 24 40 A8 16 0 0 1 24 8 Z" fill="#F7DC6F"/>',
    hourly: '<circle cx="24" cy="24" r="15" fill="#FFF6D5" stroke="#F39C12" stroke-width="2.5"/><path d="M24 15v10l7 4" stroke="#7A4B00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
  };

  // Background of each medallion
  const BACKGROUNDS = {
    sun: 'radial-gradient(circle at 50% 35%, #ffe07a, #e67e22 45%, #1b3a5c 100%)',
    cloudSun: 'radial-gradient(circle at 40% 30%, #fff3c4, #5dade2 55%, #1b3a5c 100%)',
    cloud: 'radial-gradient(circle at 50% 30%, #d6eaf8, #5d7b99 60%, #1b2a4a 100%)',
    rain: 'radial-gradient(circle at 50% 30%, #85c1e9, #2e4a6b 60%, #0f1b30 100%)',
    drizzle: 'radial-gradient(circle at 50% 30%, #aed6f1, #34495e 60%, #0f1b30 100%)',
    snow: 'radial-gradient(circle at 50% 30%, #ffffff, #aed6f1 55%, #34495e 100%)',
    fog: 'radial-gradient(circle at 50% 30%, #e5e8e8, #7f8c8d 60%, #2c3e50 100%)',
    thunder: 'radial-gradient(circle at 50% 25%, #a569bd, #4a235a 55%, #0b0716 100%)',
    frost: 'radial-gradient(circle at 50% 30%, #d4f1f9, #48c9b0 40%, #0e3a4f 100%)',
    wind: 'radial-gradient(circle at 50% 30%, #d5dbdb, #5d6d7e 60%, #1c2833 100%)',
    heat: 'radial-gradient(circle at 50% 30%, #ffb07a, #c0392b 55%, #3b0d0d 100%)',
    moon: 'radial-gradient(circle at 40% 30%, #2c3e6b, #0d1830 70%)',
    sunrise: 'radial-gradient(circle at 50% 70%, #ffd27a, #e8745a 45%, #2b2d5c 100%)',
    sunset: 'radial-gradient(circle at 50% 70%, #ff9d6c, #b03a6b 50%, #1d1338 100%)',
    hourly: 'radial-gradient(circle at 40% 30%, #ffe9a6, #d4a017 55%, #3d2a05 100%)'
  };

  function glyph(key) {
    const body = GLYPHS[key] || GLYPHS.cloud;
    return `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
  }

  // A medallion: size is 'lg' (table) or 'sm' (inside a warning badge)
  function medal(key, title, size) {
    const bg = BACKGROUNDS[key] || (key.startsWith('moon') ? BACKGROUNDS.moon : BACKGROUNDS.cloud);
    const cls = size === 'sm' ? 'wx-medal wx-medal-sm' : size === 'md' ? 'wx-medal wx-medal-md' : 'wx-medal';
    const titleAttr = title ? ` title="${title}" aria-label="${title}"` : '';
    return `<span class="${cls}" style="--bg:${bg}"${titleAttr}>${glyph(key)}</span>`;
  }

  // The same medallion as a DOM element (for pages that build their content
  // with DOM methods). className is added to the medallion.
  function node(className, key, title, size) {
    const wrapper = document.createElement('span');
    wrapper.innerHTML = medal(key, title ? escapeText(title) : '', size);
    const element = wrapper.firstElementChild;
    if (className) element.classList.add(...className.split(' ').filter(Boolean));
    return element;
  }

  function escapeText(text) {
    return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  return { medal, glyph, node };
})();
