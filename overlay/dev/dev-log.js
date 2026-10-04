(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dev') !== 'true') return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'dev/dev-log.css';
  document.head.appendChild(style);

  const windowElement = document.createElement('section');
  windowElement.id = 'rts-dev-log-window';
  windowElement.innerHTML = [
    '<header class="rts-dev-log-header">',
    '<strong>RTS LOG</strong>',
    '<span class="rts-dev-log-actions"><button id="rts-log-clear">Clear</button><button id="rts-log-close">Close</button></span>',
    '</header>',
    '<pre id="rts-dev-log-output"></pre>'
  ].join('');
  document.body.appendChild(windowElement);

  const output = windowElement.querySelector('#rts-dev-log-output');
  const toggleButton = document.getElementById('rts-dev-log-toggle');
  const positionKey = 'rts-dev-log-position';
  const sizeKey = 'rts-dev-log-size';

  restorePosition();
  restoreSize();
  setVisible(true);

  windowElement.querySelector('#rts-log-clear').onclick = () => {
    RTS.core.log.clear();
    render();
  };

  windowElement.querySelector('#rts-log-close').onclick = () => {
    setVisible(false);
  };

  toggleButton?.addEventListener('click', () => {
    setVisible(windowElement.style.display === 'none');
  });

  windowElement.querySelector('.rts-dev-log-header').addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    const rect = windowElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    const move = moveEvent => {
      windowElement.style.left = Math.max(0, startLeft + moveEvent.clientX - startX) + 'px';
      windowElement.style.top = Math.max(0, startTop + moveEvent.clientY - startY) + 'px';
      windowElement.style.right = 'auto';
      windowElement.style.bottom = 'auto';
    };
    const end = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', end);
      savePosition();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end, { once: true });
  });

  windowElement.addEventListener('mouseup', saveSize);
  RTS.core.log.on(renderEntry);
  render();

  function setVisible(visible) {
    windowElement.style.display = visible ? '' : 'none';
    if (toggleButton) toggleButton.textContent = visible ? 'Hide Log' : 'Show Log';
  }

  function renderEntry() {
    render();
  }

  function render() {
    output.textContent = RTS.core.log.history().map(entry => {
      const data = entry.data === undefined ? '' : ' ' + formatData(entry.data);
      return '[' + entry.time.slice(11, 23) + '] [' + entry.level.toUpperCase() + '] ' + entry.message + data;
    }).join('\n');
    output.scrollTop = output.scrollHeight;
  }

  function formatData(data) {
    try { return JSON.stringify(data); }
    catch { return String(data); }
  }

  function restorePosition() {
    try {
      const value = JSON.parse(localStorage.getItem(positionKey));
      if (!value) return;
      windowElement.style.left = value.left + 'px';
      windowElement.style.top = value.top + 'px';
      windowElement.style.right = 'auto';
      windowElement.style.bottom = 'auto';
    } catch {}
  }

  function restoreSize() {
    try {
      const value = JSON.parse(localStorage.getItem(sizeKey));
      if (!value) return;
      windowElement.style.width = value.width + 'px';
      windowElement.style.height = value.height + 'px';
    } catch {}
  }

  function savePosition() {
    const rect = windowElement.getBoundingClientRect();
    localStorage.setItem(positionKey, JSON.stringify({ left: rect.left, top: rect.top }));
  }

  function saveSize() {
    const rect = windowElement.getBoundingClientRect();
    localStorage.setItem(sizeKey, JSON.stringify({ width: rect.width, height: rect.height }));
  }
})();
