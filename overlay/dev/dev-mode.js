(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dev') !== 'true') return;

  const canvas = document.getElementById('rts-overlay');
  if (!canvas) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'dev/dev.css';
  document.head.appendChild(style);

  const viewportStyle = document.createElement('link');
  viewportStyle.rel = 'stylesheet';
  viewportStyle.href = 'dev/dev-viewport.css';
  document.head.appendChild(viewportStyle);

  const editorStyle = document.createElement('link');
  editorStyle.rel = 'stylesheet';
  editorStyle.href = 'dev/position-editor.css';
  document.head.appendChild(editorStyle);

  const toolbar = document.createElement('aside');
  toolbar.id = 'rts-dev-toolbar';
  toolbar.innerHTML = [
    '<div class="dev-toolbar-header">',
    '<strong>RTS DEV</strong><span>DEV MODE</span>',
    '</div>',
    '<div class="dev-toolbar-resize" role="separator" aria-orientation="vertical" aria-label="Resize settings panel" tabindex="0"></div>',
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
    '</aside>'
  ].join('');
  document.body.appendChild(toolbar);

  const widthKey = 'rts-dev-toolbar-width';
  const minWidth = 280;
  const maxWidth = 600;
  const setToolbarWidth = width => {
    const value = Math.max(minWidth, Math.min(maxWidth, width));
    document.documentElement.style.setProperty('--rts-dev-toolbar-width', value + 'px');
    localStorage.setItem(widthKey, String(value));
  };
  setToolbarWidth(Number(localStorage.getItem(widthKey)) || 300);

  const resize = toolbar.querySelector('.dev-toolbar-resize');
  resize.addEventListener('pointerdown', event => {
    resize.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = toolbar.getBoundingClientRect().width;
    document.body.classList.add('rts-resizing-dev-toolbar');
    const move = moveEvent => setToolbarWidth(startWidth + moveEvent.clientX - startX);
    const end = () => {
      document.body.classList.remove('rts-resizing-dev-toolbar');
      resize.removeEventListener('pointermove', move);
      resize.removeEventListener('pointerup', end);
      resize.removeEventListener('pointercancel', end);
    };
    resize.addEventListener('pointermove', move);
    resize.addEventListener('pointerup', end);
    resize.addEventListener('pointercancel', end);
  });

  loadScript('position-editor.js');

  if (params.get('ui-test') === 'true') {
    loadStyle('ui-test.css');
    loadScript('ui-test.js');
  }

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

  function loadStyle(name) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'dev/' + name;
    document.head.appendChild(link);
  }

  function loadScript(name) {
    const script = document.createElement('script');
    script.src = 'dev/' + name;
    document.body.appendChild(script);
  }

  function setLog(message) {
    const log = document.getElementById('log');
    if (log) log.textContent = message || '';
  }
})();
