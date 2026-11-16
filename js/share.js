// "Share" button: every [data-share] element gets a button that opens the share sheet of the phone
// (navigator.share) or, where there is none, copies the text and the address of the page.
// The text is the heading of the page plus, on a pass page, the verdict that is on the screen
// ("Петрохан: Внимание – сняг след 18:00"), so the message says something before it is opened.
(function () {
  const L = {
    bg: ['Сподели', 'Връзката е копирана'], en: ['Share', 'Link copied'], de: ['Teilen', 'Link kopiert'],
    it: ['Condividi', 'Link copiato'], es: ['Compartir', 'Enlace copiado'], fr: ['Partager', 'Lien copié'], nl: ['Delen', 'Link gekopieerd']
  };
  const [label, copied] = L[document.documentElement.lang] || L.en;
  const boxes = document.querySelectorAll('[data-share]');
  if (!boxes.length) return;
  const style = document.createElement('style');
  style.textContent = '.share-btn{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;padding:9px 16px;border-radius:999px;border:1px solid var(--panel-border,rgba(255,255,255,.25));background:var(--panel,rgba(255,255,255,.08));color:inherit;font:inherit;font-weight:600;cursor:pointer}.share-btn:hover,.share-btn:focus-visible{background:rgba(255,255,255,.16)}.share-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}';
  document.head.appendChild(style);
  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical ? canonical.href : location.href.split('#')[0];
  const message = () => {
    const h1 = document.querySelector('h1');
    const head = h1 ? h1.textContent.trim() : document.title;
    const verdict = document.querySelector('.pass-verdict');
    return verdict ? `${head}: ${verdict.textContent.trim()}` : head;
  };
  boxes.forEach(box => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'share-btn';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4"/></svg><span></span>';
    const text = button.querySelector('span');
    text.textContent = label;
    button.addEventListener('click', () => {
      const data = { title: document.title, text: message(), url };
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
