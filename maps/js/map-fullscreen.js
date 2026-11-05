// Full screen button on the weather map (Maps page).
// Uses the browser's real full screen where it exists (Android, desktop). Where
// it doesn't (iPhone Safari does not allow it for a map) the map is stretched
// over the whole screen instead (class .map-fullscreen, /css/theme.css).
// The phone's Back button and the Esc key close it. Texts in 5 languages.
(function () {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  const texts = {
    en: { enter: 'Full screen', exit: 'Exit full screen' },
    bg: { enter: 'На цял екран', exit: 'Изход от цял екран' },
    de: { enter: 'Vollbild', exit: 'Vollbild beenden' },
    it: { enter: 'Schermo intero', exit: 'Esci da schermo intero' },
    es: { enter: 'Pantalla completa', exit: 'Salir de pantalla completa' }
  };
  const t = () => texts[document.documentElement.lang] || texts.en;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'map-fullscreen-button';
  // Corners pointing outwards (enter) and inwards (exit)
  const ICON_ENTER = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_EXIT = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  container.appendChild(button);

  let active = false;
  let pushedState = false;

  function render() {
    const label = active ? t().exit : t().enter;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(active));
    button.innerHTML = active ? ICON_EXIT : ICON_ENTER;
  }

  function enter() {
    if (active) return;
    active = true;
    container.classList.add('map-fullscreen');
    document.documentElement.classList.add('map-fullscreen-open');
    render();
    const request = container.requestFullscreen || container.webkitRequestFullscreen;
    let native = null;
    if (request) {
      try { native = request.call(container); } catch (e) { native = null; }
    }
    const pushBackState = () => {
      if (!active || pushedState) return;
      try { history.pushState({ mapFullscreen: true }, ''); pushedState = true; } catch (e) { /* ignore */ }
    };
    // Real full screen closes with the Back button by itself; otherwise add
    // a history entry so Back closes the stretched map instead of the page
    if (native && native.then) native.catch(pushBackState); else if (!native) pushBackState();
  }

  function exit() {
    if (!active) return;
    active = false;
    container.classList.remove('map-fullscreen');
    document.documentElement.classList.remove('map-fullscreen-open');
    render();
    if (document.fullscreenElement === container || document.webkitFullscreenElement === container) {
      const leave = document.exitFullscreen || document.webkitExitFullscreen;
      try { leave.call(document); } catch (e) { /* ignore */ }
    }
  }

  function toggle() {
    if (!active) { enter(); return; }
    // Our own history entry goes away together with the full screen
    if (pushedState && history.state && history.state.mapFullscreen) {
      pushedState = false;
      history.back();
    }
    exit();
  }

  button.addEventListener('click', toggle);

  // Back button: closes the full screen
  window.addEventListener('popstate', () => {
    if (active) {
      pushedState = false;
      exit();
    }
  });

  // Esc on a stretched map, and the browser leaving real full screen on its own
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active && !document.fullscreenElement) toggle();
  });
  const onFullscreenChange = () => {
    if (active && !document.fullscreenElement && !document.webkitFullscreenElement) {
      // Real full screen ended (Esc, Back): close ours too
      if (pushedState && history.state && history.state.mapFullscreen) {
        pushedState = false;
        history.back();
      }
      exit();
    }
  };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  const languageSelect = document.getElementById('language');
  if (languageSelect) languageSelect.addEventListener('change', render);
  render();
})();
