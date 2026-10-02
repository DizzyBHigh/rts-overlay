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
