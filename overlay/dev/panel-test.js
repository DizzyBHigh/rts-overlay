(() => {
  const stage = document.getElementById('panel-stage');
  if (!stage || !RTS.core.panels) return;

  const positions = {
    Center: { x: 0, y: 0, scale: 100 },
    Left: { x: -28, y: 0, scale: 100 },
    Right: { x: 28, y: 0, scale: 100 }
  };

  const profile = {
    start: [
      { position: 'Left', duration: 0, easing: 'linear' },
      { position: 'Center', duration: 500, easing: 'ease-out' }
    ],
    end: [
      { position: 'Right', duration: 500, easing: 'ease-in' }
    ]
  };

  const panel = RTS.core.panels.create('core-test', {
    parent: stage,
    positions
  });

  panel.setContent('<strong>Shared RTS Panel</strong><p>Core panel lifecycle test.</p>');

  document.getElementById('panel-show')?.addEventListener('click', () => {
    panel.show(positions.Left).animate(profile, 'start');
  });

  document.getElementById('panel-hide')?.addEventListener('click', () => {
    panel.animate(profile, 'end', () => panel.hide());
  });
})();
