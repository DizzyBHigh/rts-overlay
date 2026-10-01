(() => {
  const canvas = document.getElementById('rts-overlay');
  const viewport = document.getElementById('overlay-viewport');
  const manifestInput = document.getElementById('extension-manifest');
  const loadButton = document.getElementById('extension-load');
  if (!canvas || !viewport) return;

  let zoom = 0.5;

  function applyZoom() {
    canvas.style.transform = 'scale(' + zoom + ')';
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    const width = 1920 * zoom;
    const height = 1080 * zoom;
    canvas.style.marginBottom = (height - 1080) + 'px';
    canvas.style.marginRight = (width - 1920) + 'px';
    const reset = document.getElementById('canvas-zoom-reset');
    if (reset) reset.textContent = Math.round(zoom * 100) + '%';
  }

  function setZoom(value) {
    zoom = Math.max(0.25, Math.min(2, value));
    applyZoom();
  }

  document.getElementById('canvas-zoom-out')?.addEventListener(
    'click', () => setZoom(zoom - 0.1)
  );
  document.getElementById('canvas-zoom-in')?.addEventListener(
    'click', () => setZoom(zoom + 0.1)
  );
  document.getElementById('canvas-zoom-reset')?.addEventListener(
    'click', () => setZoom(0.5)
  );

  loadButton?.addEventListener('click', async () => {
    const url = manifestInput?.value.trim();
    const log = document.getElementById('log');
    if (!url) return;

    if (log) log.textContent = 'Loading extension...';

    try {
      await RTS.core.extensions.loadManifest(url, { dev: true });
      if (log) log.textContent = 'Extension loaded.';
    } catch (error) {
      if (log) log.textContent = error.message;
    }
  });

  applyZoom();
})();
