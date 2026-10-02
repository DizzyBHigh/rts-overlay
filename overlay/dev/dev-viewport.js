(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dev') !== 'true') return;

  const canvas = document.getElementById('rts-overlay');
  const host = document.getElementById('rts-dev-toolbar');
  if (!canvas || !host) return;

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
    stage.style.transform =
      'translate3d(' + x + 'px,' + y + 'px,0) scale(' + effective + ')';
    const status = document.getElementById('viewport-status');
    if (status)
      status.textContent = Math.round(effective / fitScale() * 100) + '%';
  };

  const reset = () => {
    scale = fitScale();
    x = (viewport.clientWidth - 1920 * scale) / 2;
    y = (viewport.clientHeight - 1080 * scale) / 2;
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

  const centreZoom = factor =>
    zoom(factor, viewport.clientWidth / 2, viewport.clientHeight / 2);

  document.getElementById('canvas-zoom-out').onclick =
    () => centreZoom(1 / 1.1);
  document.getElementById('canvas-zoom-in').onclick =
    () => centreZoom(1.1);
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
  reset();
})();
