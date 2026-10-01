(() => {
  const host = document.getElementById('message-test-output');
  const count = document.getElementById('message-test-count');
  if (!host || !count || !RTS.core.messaging || !RTS.core.panels) return;

  const panel = RTS.core.panels.create('message-test', { parent: host });
  const positions = {
    Left: { x: -28, y: 0, scale: 100 },
    Center: { x: 0, y: 0, scale: 100 },
    Right: { x: 28, y: 0, scale: 100 }
  };
  const profile = {
    start: [{ position: 'Left', duration: 0 }],
    end: [{ position: 'Right', duration: 400, easing: 'ease-in' }]
  };

  let sequence = 0;
  const queue = RTS.core.messaging.create('dev-test', {
    present(message, finish) {
      panel.setContent('<strong>' + message.text + '</strong>');
      RTS.core.messagePresentation.present(panel, message, {
        positions,
        profile,
        initialPosition: positions.Left,
        duration: 1000
      }, finish);
      updateCount();
    },
    finished() {
      updateCount();
    }
  });

  const updateCount = () => {
    count.textContent = queue.isActive()
      ? 'Active message - ' + queue.size() + ' waiting'
      : queue.size() + ' waiting';
  };

  document.getElementById('message-enqueue')?.addEventListener('click', () => {
    sequence++;
    queue.enqueue({ text: 'Message ' + sequence });
    updateCount();
  });

  document.getElementById('message-clear')?.addEventListener('click', () => {
    queue.clear();
    panel.hide();
    host.classList.remove('message-test-output--active', 'message-test-output--finished');
    updateCount();
  });

  updateCount();
})();
