// "Share" button: every [data-share] element gets a button that opens the share sheet of the phone
// (navigator.share) or, where there is none, copies the text and the address of the page.
// On the city and resort pages the share is a picture of the forecast on the screen (drawCard) plus the address.
// The text is the heading of the page plus, on a pass page, the verdict that is on the screen
// ("Петрохан: Внимание – сняг след 18:00"), so the message says something before it is opened.
(function () {
  // loaded twice (by the page and by mobile-nav.js, which may run first): only the first copy works
  if (window.__wpShareLoaded) return;
  window.__wpShareLoaded = true;

  // The last crumb of the breadcrumbs is the page itself and repeats the big heading: leave it out
  const crumbs = document.querySelector('p.breadcrumbs');
  const h1 = document.querySelector('h1');
  if (crumbs && h1 && crumbs.lastChild && crumbs.lastChild.nodeType === 3) {
    const text = crumbs.lastChild.textContent;
    const cut = text.lastIndexOf('›');
    const crumb = cut >= 0 ? text.slice(cut + 1).trim() : '';
    if (crumb && h1.textContent.includes(crumb)) crumbs.lastChild.textContent = text.slice(0, cut).replace(/\s+$/, '');
  }
  const L = {
    bg: ['Сподели', 'Връзката е копирана'], en: ['Share', 'Link copied'], de: ['Teilen', 'Link kopiert'],
    it: ['Condividi', 'Link copiato'], es: ['Compartir', 'Enlace copiado'], fr: ['Partager', 'Lien copié'], ro: ['Distribuie', 'Link copiat'], nl: ['Delen', 'Link gekopieerd']
  };
  const [label, copied] = L[document.documentElement.lang] || L.en;
  let boxes = document.querySelectorAll('[data-share]');
  if (!boxes.length) {
    // a page without a [data-share] box (and without its own share button): the button goes right after the main heading
    const heading = document.querySelector('main h1, h1');
    if (!heading || document.getElementById('moonShare') || document.querySelector('.share-btn')) return;
    const box = document.createElement('div');
    box.setAttribute('data-share', '');
    heading.insertAdjacentElement('afterend', box);
    boxes = [box];
  }
  const style = document.createElement('style');
  style.textContent = '[data-share]{text-align:center}.share-btn{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;padding:9px 16px;border-radius:999px;border:1px solid var(--panel-border,rgba(255,255,255,.25));background:var(--panel,rgba(255,255,255,.08));color:inherit;font:inherit;font-weight:600;cursor:pointer}.share-btn:hover,.share-btn:focus-visible{background:rgba(255,255,255,.16)}.share-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}';
  document.head.appendChild(style);
  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical ? canonical.href : location.href.split('#')[0];
  const message = () => {
    const h1 = document.querySelector('h1');
    const head = h1 ? h1.textContent.trim() : document.title;
    const verdict = document.querySelector('.pass-verdict');
    return verdict ? `${head}: ${verdict.textContent.trim()}` : head;
  };

  // ---- A picture of the forecast as it is on the screen (city and resort pages) ----
  // Built from the page's own elements (#cityNow, #cityDays, the snow table), so it shows exactly what the
  // visitor sees and needs no new request. It is made ahead of the tap, because phones allow the share sheet
  // only right after a tap.
  let cardFile = null;
  const clean = node => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');
  const gradient = (ctx, medal, x, y, r) => {
    const css = (medal.getAttribute('style') || '');
    const colors = css.match(/#[0-9a-fA-F]{3,8}(?:\s+\d+%)?/g) || [];
    const g = ctx.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r);
    colors.forEach((c, i) => {
      const [hex, pct] = c.split(/\s+/);
      g.addColorStop(pct ? parseInt(pct, 10) / 100 : colors.length === 1 ? 0 : i / (colors.length - 1), hex);
    });
    return g;
  };
  const svgImage = svg => new Promise(resolve => {
    const markup = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup.includes('xmlns=') ? markup : markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
  });
  const fit = (ctx, text, width) => {
    if (ctx.measureText(text).width <= width) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > width) text = text.slice(0, -1);
    return text + '…';
  };
  const wrap = (ctx, text, width, maxLines) => {
    const lines = [];
    let line = '';
    text.split(' ').forEach(word => {
      const next = line ? line + ' ' + word : word;
      if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = fit(ctx, lines[maxLines - 1] + '…', width); }
    return lines;
  };
  async function drawCard() {
    const days = [...document.querySelectorAll('#cityDays .city-day')].slice(0, 7);
    if (!days.length) return null;
    const snow = document.querySelector('table[data-mode="snow"]');
    const snowRows = snow ? [...snow.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(clean)).filter(r => r.some(Boolean)) : [];
    const snowHead = snow ? [...snow.querySelectorAll('thead th')].map(clean) : [];
    const now = document.getElementById('cityNow');
    const W = 1080, PAD = 56, ROW = 104;
    const FONT = '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const heading = (document.querySelector('h1') || {}).textContent || document.title;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = `800 52px ${FONT}`;
    const titleLines = wrap(probe, heading.trim(), W - PAD * 2, 2);
    const nowIcon = now && now.querySelector('.now-icon');
    const hasNow = !!(now && now.querySelector('.storm-now-value'));
    const headH = 150 + titleLines.length * 62 + (hasNow ? 170 : 0);
    const snowH = snowRows.length ? 90 + (snowRows.length + 1) * 64 : 0;
    const H = headH + days.length * ROW + snowH + 120;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1b1f4a'); bg.addColorStop(1, '#4a2a6e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffd54a'; ctx.font = `700 30px ${FONT}`;
    ctx.fillText('Weather Pulse', PAD, 80);
    ctx.font = `800 52px ${FONT}`;
    titleLines.forEach((line, i) => ctx.fillText(line, PAD, 150 + i * 62));
    let y = 150 + titleLines.length * 62;
    const medal = async (node, cx, cy, r) => {
      const svg = node && node.querySelector('svg');
      ctx.fillStyle = node ? gradient(ctx, node, cx, cy, r) : '#2e4a6b';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      const img = svg ? await svgImage(svg) : null;
      if (img) ctx.drawImage(img, cx - r * 0.78, cy - r * 0.78, r * 1.56, r * 1.56);
    };
    if (hasNow) {
      y += 20;
      await medal(nowIcon, PAD + 62, y + 62, 62);
      ctx.fillStyle = '#ffffff'; ctx.font = `800 96px ${FONT}`;
      ctx.fillText(clean(now.querySelector('.storm-now-value')), PAD + 150, y + 96);
      ctx.fillStyle = '#e8e8f5'; ctx.font = `500 30px ${FONT}`;
      ctx.fillText(fit(ctx, clean(now.querySelector('.storm-now-status')), W - PAD * 2 - 150), PAD + 150, y + 140);
      y += 170;
    }
    y += 30;
    for (const [i, day] of days.entries()) {
      const top = y + i * ROW;
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.09)';
      ctx.fillRect(PAD - 20, top, W - PAD * 2 + 40, ROW - 8);
      ctx.fillStyle = '#ffd54a'; ctx.font = `700 34px ${FONT}`;
      ctx.fillText(fit(ctx, clean(day.querySelector('.kp-day-name')), 190), PAD, top + 46);
      ctx.fillStyle = '#c9c9e0'; ctx.font = `500 26px ${FONT}`;
      ctx.fillText(clean(day.querySelector('.city-day-date')), PAD, top + 80);
      await medal(day.querySelector('.city-day-icon'), PAD + 250, top + 48, 36);
      ctx.fillStyle = '#ffffff'; ctx.font = `800 38px ${FONT}`;
      ctx.fillText(clean(day.querySelector('.city-day-temp')), PAD + 320, top + 46);
      ctx.fillStyle = '#c9c9e0'; ctx.font = `500 25px ${FONT}`;
      ctx.fillText(fit(ctx, clean(day.querySelector('.kp-day-status')), 260), PAD + 320, top + 80);
      ctx.fillStyle = '#e8e8f5'; ctx.font = `500 27px ${FONT}`;
      ctx.fillText(fit(ctx, clean(day.querySelector('.city-day-rain')), 340), PAD + 640, top + 46);
      ctx.fillStyle = '#c9c9e0'; ctx.font = `500 25px ${FONT}`;
      ctx.fillText(fit(ctx, clean(day.querySelector('.city-day-wind')), 340), PAD + 640, top + 80);
    }
    y += days.length * ROW;
    if (snowRows.length) {
      y += 40;
      const cols = Math.min(4, snowHead.length || snowRows[0].length);
      const first = 330, other = (W - PAD * 2 - first) / Math.max(1, cols - 1);
      const cell = (text, col, baseline, font, color) => {
        ctx.fillStyle = color; ctx.font = font;
        ctx.fillText(fit(ctx, text, col ? other - 12 : first - 12), PAD + (col ? first + (col - 1) * other : 0), baseline);
      };
      const head = snowHead.length ? snowHead : snowRows[0].map(() => '');
      head.slice(0, cols).forEach((text, col) => cell(text, col, y + 34, `700 22px ${FONT}`, '#ffd54a'));
      snowRows.forEach((row, i) => row.slice(0, cols).forEach((text, col) => cell(text, col, y + 34 + (i + 1) * 64, `${col ? 700 : 600} 28px ${FONT}`, '#ffffff')));
      y += (snowRows.length + 1) * 64 + 20;
    }
    ctx.fillStyle = '#c9c9e0'; ctx.font = `500 26px ${FONT}`;
    const stamp = new Date().toLocaleString(document.documentElement.lang || 'bg', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
    ctx.fillText(fit(ctx, url.replace(/^https?:\/\//, ''), W - PAD * 2 - 220), PAD, H - 50);
    ctx.textAlign = 'right';
    ctx.fillText(stamp, W - PAD, H - 50);
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9));
  }
  let preparing = null;
  function prepare() {
    clearTimeout(preparing);
    preparing = setTimeout(async () => {
      try {
        const blob = await drawCard();
        if (!blob) return;
        const file = new File([blob], 'weatherpulse.jpg', { type: 'image/jpeg' });
        cardFile = navigator.canShare && navigator.canShare({ files: [file] }) ? file : null;
      } catch (e) { cardFile = null; }
    }, 1500);
  }
  const days = document.getElementById('cityDays');
  if (days && navigator.canShare) {
    new MutationObserver(prepare).observe(days, { childList: true, subtree: true });
    const table = document.querySelector('table[data-mode="snow"]');
    if (table) new MutationObserver(prepare).observe(table, { childList: true, subtree: true, characterData: true });
    prepare();
  }
  boxes.forEach(box => {
    if (box.querySelector('.share-btn')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'share-btn';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4"/></svg><span></span>';
    const text = button.querySelector('span');
    text.textContent = label;
    button.addEventListener('click', () => {
      const data = { title: document.title, text: message(), url };
      if (navigator.share && cardFile) {
        // the forecast as the visitor sees it, as a picture, with the address in the text
        navigator.share({ files: [cardFile], title: data.title, text: `${data.text} ${url}` }).catch(() => { /* closed by the visitor */ });
        return;
      }
      if (navigator.share) {
        navigator.share(data).catch(() => { /* closed by the visitor */ });
        return;
      }
      const done = () => { text.textContent = copied; setTimeout(() => { text.textContent = label; }, 2500); };
      const line = `${data.text} ${url}`;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(line).then(done, () => {});
      else {
        const area = document.createElement('textarea');
        area.value = line;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* nothing to do */ }
        area.remove();
      }
    });
    box.appendChild(button);
  });
})();
