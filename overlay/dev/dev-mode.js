(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dev') !== 'true') return;

  const canvas = document.getElementById('rts-overlay');
  if (!canvas) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'dev/dev.css';
  document.head.appendChild(style);

  const toolbar = document.createElement('aside');
  toolbar.id = 'rts-dev-toolbar';
  toolbar.innerHTML = [
    '<div class="dev-toolbar-header">',
    '<strong>RTS DEV</strong><span>DEV MODE</span>',
    '</div>',
    '<section class="dev-section">',
    '<h3>Overlay</h3>',
    '<label>Extension manifest',
    '<input id="extension-manifest" type="url" value="https://dizzybhigh.github.io/rts-higher-lower/overlay/manifest.json">',
    '</label>',
    '<button id="extension-load" type="button">Load Extension</button>',
    '</section>',
    '<section class="dev-section">',
    '<h3>Viewport</h3>',
    '<div class="dev-grid">',
    '<button id="canvas-zoom-out" type="button">-</button>',
    '<button id="canvas-zoom-reset" type="button">Reset View</button>',
    '<button id="canvas-zoom-in" type="button">+</button>',
    '</div>',
    '<span id="viewport-status">100%</span>',
    '</section>',
    '<div id="extension-tools"></div>',
    '<pre id="log"></pre>',
    '</aside>';
  document.body.appendChild(toolbar);

  const viewport = document.createElement('main');
  viewport.id = 'rts-dev-viewport';
  const stage = document.createElement('div');
  stage.id = 'rts-dev-stage';
  const screen = document.createElement('div');
  screen.id = 'rts-dev-screen';
  screen.innerHTML = '<span>1920 x 1080</span>';
  stage.append(screen, canvas);
  viewport.appendChild(stage);
  document.body.appendChild(viewport);

  let scale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let pointerX = 0;
  let pointerY = 0;

  const fitScale = () =>
    Math.min(viewport.clientWidth / 1920, viewport.clientHeight / 1080);

  const minScale = () => Math.max(0.2, fitScale() * 0.5);

  const render = () => {
    const effective = Math.max(scale, minScale());
    const width = 1920 * effective;
    const height = 1080 * effective;

    if (width <= viewport.clientWidth)
      x = (viewport.clientWidth - width) / 2;
    else
      x = Math.min(0, Math.max(viewport.clientWidth - width, x));

    if (height <= viewport.clientHeight)
      y = (viewport.clientHeight - height) / 2;
    else
      y = Math.min(0, Math.max(viewport.clientHeight - height, y));

    stage.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + effective + ')';
    document.getElementById('viewport-status').textContent =
      Math.round(effective / fitScale() * 100) + '%';
  };

  const reset = () => {
    scale = fitScale();
    x = 0;
    y = 0;
    render();
  };

  const zoom = (factor, clientX, clientY) => {
    const oldScale = Math.max(scale, minScale());
    const nextScale = Math.min(3, Math.max(minScale(), oldScale * factor));
    if (nextScale === oldScale) return;

    const bounds = viewport.getBoundingClientRect();
    const localX = clientX - bounds.left;
    const localY = clientY - bounds.top;
    x = localX - (localX - x) * (nextScale / oldScale);
    y = localY - (localY - y) * (nextScale / oldScale);
    scale = nextScale;
    render();
  };

  const setLog = message => {
    const log = document.getElementById('log');
    if (log) log.textContent = message || '';
  };

  document.getElementById('canvas-zoom-out').onclick =
    () => zoom(1 / 1.1, viewport.clientWidth / 2, viewport.clientHeight / 2);
  document.getElementById('canvas-zoom-in').onclick =
    () => zoom(1.1, viewport.clientWidth / 2, viewport.clientHeight / 2);
  document.getElementById('canvas-zoom-reset').onclick = reset;

  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button,input,select')) return;
    dragging = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('dragging');
  });

  viewport.addEventListener('pointermove', event => {
    if (!dragging) return;
    x += event.clientX - pointerX;
    y += event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    render();
  });

  const stopDrag = event => {
    if (!dragging) return;
    dragging = false;
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
    viewport.classList.remove('dragging');
  };

  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);
  viewport.addEventListener('wheel', event => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? 1.1 : 1 / 1.1, event.clientX, event.clientY);
  }, { passive: false });

  window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'r' &&
        !/input|select|textarea/i.test(document.activeElement?.tagName || ''))
      reset();
  });

  window.addEventListener('resize', reset);

  document.getElementById('extension-load').onclick = async () => {
    const input = document.getElementById('extension-manifest');
    const url = input?.value.trim();
    if (!url) return;

    setLog('Loading extension...');

    try {
      await RTS.core.extensions.loadManifest(url, { dev: true });
      setLog('Extension loaded.');
    } catch (error) {
      setLog(error?.message || String(error));
    }
  };

  reset();
})();
