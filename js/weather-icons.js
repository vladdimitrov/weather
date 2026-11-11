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
    moonNew: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/>',
    moonWaxCrescent: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 6A18 18 0 0 1 24 42A9 18 0 0 0 24 6Z" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    moonFirstQ: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 6A18 18 0 0 1 24 42Z" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    moonWaxGibbous: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 6A18 18 0 0 1 24 42A9 18 0 0 1 24 6Z" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    moonFull: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><circle cx="24" cy="24" r="18" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    moonWaneGibbous: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 6A18 18 0 0 0 24 42A9 18 0 0 0 24 6Z" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    moonLastQ: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 6A18 18 0 0 0 24 42Z" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    moonWaneCrescent: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><path d="M5 40v4M3 42h4" stroke="#FFF8D0" stroke-width="1" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="#1E2B52" stroke="#F7DC6F" stroke-width="1.2"/><path d="M24 6A18 18 0 0 0 24 42A9 18 0 0 1 24 6Z" fill="#FFF0A8"/><circle cx="19" cy="18" r="2.6" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.2" fill="#B8963A" opacity="0.45"/><circle cx="21" cy="32" r="1.9" fill="#B8963A" opacity="0.45"/><circle cx="30" cy="17" r="1.6" fill="#B8963A" opacity="0.45"/>',
    meteor: '<circle cx="9" cy="12" r="1.1" fill="#FFF8D0"/><circle cx="40" cy="38" r="1.2" fill="#FFF8D0"/><circle cx="26" cy="41" r="0.9" fill="#FFF8D0"/><path d="M41 5L20 26" stroke="#FFD54A" stroke-width="5" stroke-linecap="round" opacity="0.28"/><path d="M41 5L20 26" stroke="#FFE9A0" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/><path d="M42 17L28 31" stroke="#FFF3C4" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/><path d="M30 5L21 14" stroke="#FFF3C4" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/><circle cx="16" cy="31" r="7" fill="#FF9F43" opacity="0.5"/><circle cx="16" cy="31" r="4.6" fill="#FFE08A"/><circle cx="15" cy="30" r="2.4" fill="#FFFFFF"/>',
    eclipse: '<circle cx="24" cy="24" r="19" fill="none" stroke="#FFE9A0" stroke-width="1.2" opacity="0.5"/><path d="M8 37l4-3M40 37l-4-3M6 24h4M38 24h4M11 11l3.5 3.5M37 11l-3.5 3.5M24 4v4" stroke="#F7B731" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="24" r="13" fill="#FFD54A"/><circle cx="29.5" cy="20" r="12.2" fill="#161233"/><circle cx="29.5" cy="20" r="12.2" fill="none" stroke="#FFF3C4" stroke-width="0.8" opacity="0.45"/>',
    moonSuper: '<circle cx="6" cy="9" r="1.2" fill="#FFF8D0"/><circle cx="42" cy="7" r="1" fill="#FFF8D0"/><circle cx="43" cy="41" r="1.2" fill="#FFF8D0"/><circle cx="24" cy="24" r="22" fill="none" stroke="#FFE9A0" stroke-width="1.4" opacity="0.55"/><circle cx="24" cy="24" r="19" fill="#FFF0A8" stroke="#F7DC6F" stroke-width="1.2"/><circle cx="18" cy="17" r="2.8" fill="#B8963A" opacity="0.45"/><circle cx="29" cy="27" r="3.4" fill="#B8963A" opacity="0.45"/><circle cx="20" cy="32" r="2" fill="#B8963A" opacity="0.45"/><circle cx="31" cy="15" r="1.7" fill="#B8963A" opacity="0.45"/><path d="M38 4v6M35 7h6" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>',
    aurora: '<circle cx="8" cy="9" r="1" fill="#FFF8D0"/><circle cx="40" cy="7" r="1.2" fill="#FFF8D0"/><circle cx="25" cy="5" r="0.9" fill="#FFF8D0"/><path d="M5 40C7 28 5 18 11 7c4 10 3 21 5 33z" fill="#58D68D" opacity="0.8"/><path d="M15 40C17 28 16 15 23 5c5 10 4 22 6 35z" fill="#48C9B0" opacity="0.85"/><path d="M27 40C29 30 28 19 35 9c3 9 4 21 6 31z" fill="#A569BD" opacity="0.8"/><path d="M2 43l9-9 6 5 8-9 8 8 7-5 6 10z" fill="#08111f"/>',
    hourly: '<path d="M15 9h18M15 39h18" stroke="#F7DC6F" stroke-width="3" stroke-linecap="round"/><path d="M18 12h12C30 18 25 20 24 24C23 20 18 18 18 12Z" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round"/><path d="M24 24C25 28 30 30 30 36H18C18 30 23 28 24 24Z" fill="#F7DC6F"/><path d="M24 17.5V21" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>'
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
    moon: 'radial-gradient(circle at 40% 30%, #3a4f8c, #14204a 60%, #070d22 100%)',
    meteor: 'radial-gradient(circle at 65% 25%, #4a5fa8, #19275a 55%, #070d22 100%)',
    eclipse: 'radial-gradient(circle at 50% 30%, #ffcf70, #8a4a22 50%, #130b1c 100%)',
    aurora: 'radial-gradient(circle at 50% 85%, #27ae60, #0e4f5a 50%, #050c1c 100%)',
    sunrise: 'radial-gradient(circle at 50% 70%, #ffd27a, #e8745a 45%, #2b2d5c 100%)',
    sunset: 'radial-gradient(circle at 50% 70%, #ff9d6c, #b03a6b 50%, #1d1338 100%)',
    hourly: 'radial-gradient(circle at 40% 30%, #3a4a6b, #1b2a4a 65%, #0d1830 100%)'
  };

  function glyph(key) {
    const body = GLYPHS[key] || GLYPHS.cloud;
    return `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
  }

  // A medallion: size is 'lg' (table) or 'sm' (inside a warning badge)
  function medal(key, title, size) {
    const bg = BACKGROUNDS[key] || (key.startsWith('moon') ? BACKGROUNDS.moon : BACKGROUNDS.cloud);
    const cls = size === 'sm' ? 'wx-medal wx-medal-sm' : size === 'md' ? 'wx-medal wx-medal-md' : size === 'xl' ? 'wx-medal wx-medal-xl' : 'wx-medal';
    const titleAttr = title ? ` role="img" title="${title}" aria-label="${title}"` : '';
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
