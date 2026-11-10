// Units switch: metric (°C, km/h, mm) or imperial (°F, mph, in), chosen in the header and
// remembered. All data stay metric inside the page (warnings and charts work on them);
// for imperial the shown texts are converted: "11°" -> "52°", "5 km/h" -> "3 mph",
// "1.5 mm" -> "0.06 in", and the unit names in the table headers. Switching reloads the page.
// Metric unless the visitor picks imperial in the header.
(function () {
  const KEY = 'units';
  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  const saved = stored();
  const imperial = saved === 'imperial';
  document.documentElement.dataset.units = imperial ? 'imperial' : 'metric';
  window.Units = { imperial };

  // ---- the selector in the header ----
  const labels = { en: 'Units:', bg: 'Мерни единици:', de: 'Einheiten:', it: 'Unità:', es: 'Unidades:' };
  const lang = () => document.documentElement.lang;

  function buildSelector() {
    if (document.getElementById('units-select')) return;
    const container = document.getElementById('selectors-container');
    if (!container) return;
    const group = document.createElement('div');
    group.className = 'form-group units';
    const label = document.createElement('label');
    label.setAttribute('for', 'units-select');
    const select = document.createElement('select');
    select.id = 'units-select';
    [['metric', '°C · km/h'], ['imperial', '°F · mph']].forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });
    select.value = imperial ? 'imperial' : 'metric';
    select.addEventListener('change', () => {
      try { localStorage.setItem(KEY, select.value); } catch (e) { /* storage blocked */ }
      location.reload();
    });
    group.append(label, select);
    container.appendChild(group);
    const setLabel = () => { label.textContent = labels[lang()] || labels.en; };
    setLabel();
    document.addEventListener('change', event => {
      if (event.target && event.target.id === 'language') setTimeout(setLabel, 0);
    });
    // the header may need to re-fit with the new selector in it
    window.dispatchEvent(new Event('resize'));
  }

  function start() {
    buildSelector();
    // the other selectors are added by scripts that run a little later
    setTimeout(buildSelector, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  if (!imperial) return;

  // ---- conversion of the shown texts ----
  const toF = c => Math.round(c * 9 / 5 + 32);
  const toMph = k => Math.round(k * 0.621371);
  const toIn = mm => (mm / 25.4).toFixed(2);
  const NOT_LETTER = '(?![A-Za-zА-Яа-я])';
  const TEMP = new RegExp('(-?\\d+(?:\\.\\d+)?)(?:(\\s*(?:…|\\.\\.\\.)\\s*)(-?\\d+(?:\\.\\d+)?))?\\s?°' + NOT_LETTER, 'g');
  const SPEED = new RegExp('(\\d+(?:\\.\\d+)?)(\\s?)(?:km/h|км/ч)' + NOT_LETTER, 'g');
  const RAIN = new RegExp('(\\d+(?:\\.\\d+)?)(\\s?)(?:mm|мм)' + NOT_LETTER, 'g');
  const FAST = /°|km\/h|км\/ч|mm|мм/;

  function convert(text) {
    if (!FAST.test(text)) return text;
    return text
      .replace(TEMP, (m, a, sep, b) => (b === undefined ? `${toF(+a)}°` : `${toF(+a)}${sep}${toF(+b)}°`))
      .replace(SPEED, (m, a, space) => `${toMph(+a)}${space}mph`)
      .replace(RAIN, (m, a, space) => `${toIn(+a)}${space}in`)
      .replace(/\(°C\)/g, '(°F)')
      .replace(/\((?:km\/h|км\/ч)\)/g, '(mph)')
      .replace(/\((?:mm|мм)\)/g, '(in)');
  }

  // hourly table cells hold bare numbers; the column tells the unit
  function convertCell(node) {
    const cell = node.parentElement && node.parentElement.closest('#hourlyTable tbody td');
    if (!cell) return null;
    const value = parseFloat(node.data);
    if (isNaN(value) || !/^\s*-?\d+(\.\d+)?\s*$/.test(node.data)) return null;
    const column = cell.cellIndex;
    if (column === 2) return String(toF(value));
    if (column === 4) return toIn(value);
    if (column === 6) return String(toMph(value));
    return null;
  }

  const written = new WeakMap(); // text node -> the text this script wrote
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'NOSCRIPT']);

  function process(node) {
    if (node.nodeType !== 3) return;
    const parent = node.parentElement;
    if (!parent || SKIP.has(parent.tagName)) return;
    if (written.get(node) === node.data) return; // our own write
    const out = convertCell(node) ?? convert(node.data);
    if (out !== node.data) {
      written.set(node, out);
      node.data = out;
    }
  }

  function walk(root) {
    if (root.nodeType === 3) { process(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.tagName)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) { process(node); node = walker.nextNode(); }
  }

  function run() {
    walk(document.body);
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') process(record.target);
        else record.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) run();
  else document.addEventListener('DOMContentLoaded', run);
})();
