(() => {
  const manifest = {
    id: 'dev-test',
    name: 'RTS Core Test Extension',
    version: '0.1.0'
  };

  const source = {
    init(extension) {
      extension.state.message = 'Extension loaded';
      extension.configure = configuration => {
        extension.state.configuration = configuration;
        const output = document.getElementById('extension-test-output');
        if (output) output.textContent =
          'Configured: ' + JSON.stringify(configuration);
      };
      extension.api.test = () => 'RTS extension API works';
      const output = document.getElementById('extension-test-output');
      if (output) output.textContent = extension.state.message;
    }
  };

  RTS.core.extensions.registerManifest(manifest);
  RTS.core.extensions.registerSource(manifest.id, source);
  RTS.core.extensions.load(manifest.id);

  document.getElementById('extension-apply')?.addEventListener('click', () => {
    RTS.core.extensions.applyConfiguration({
      extensions: {
        'dev-test': { example: true, value: 42 }
      }
    });
  });

  document.getElementById('extension-dynamic')?.addEventListener('click', async () => {
    const output = document.getElementById('extension-test-output');
    if (output) output.textContent = 'Loading extension script...';
    try {
      await RTS.core.extensions.loadPublished({
        id: 'dynamic-test',
        name: 'Dynamic Test Extension',
        version: '0.1.0',
        resources: { js: ['dev/dynamic-extension.js'] }
      }, '.');
      if (output) output.textContent =
        RTS.getExtension('dynamic-test').api.test();
    } catch (error) {
      if (output) output.textContent = error.message;
    }
  });

  document.getElementById('extension-higher-lower')?.addEventListener('click', async () => {
    const output = document.getElementById('extension-test-output');
    if (output) output.textContent = 'Loading Higher Lower extension...';
    try {
      await RTS.core.extensions.loadManifest(
        'https://dizzybhigh.github.io/rts-higher-lower/overlay/manifest.json'
      );
      const extension = RTS.getExtension('rts-higher-lower');
      extension.api.showCard({
        rank: '7',
        suit: 'Hearts',
        symbol: '♥'
      });
      if (output) output.textContent =
        'Higher Lower extension loaded and test card displayed.';
    } catch (error) {
      if (output) output.textContent = error.message;
    }
  });

  document.getElementById('extension-higher-lower-flip')?.addEventListener('click', () => {
    const extension = RTS.getExtension('rts-higher-lower');
    const output = document.getElementById('extension-test-output');
    if (!extension) {
      if (output) output.textContent = 'Load Higher Lower first.';
      return;
    }
    extension.api.flipCard({
      rank: 'Queen',
      suit: 'Spades',
      symbol: '♠'
    });
    if (output) output.textContent = 'Higher Lower card flip running.';
  });

  document.getElementById('extension-higher-lower-flip-move')?.addEventListener('click', () => {
    const extension = RTS.getExtension('rts-higher-lower');
    const output = document.getElementById('extension-test-output');
    if (!extension) {
      if (output) output.textContent = 'Load Higher Lower first.';
      return;
    }

    extension.api.flipCard({
      rank: 'Queen',
      suit: 'Spades',
      symbol: '♠'
    });

    const panel = extension.state.panel;
    const from = panel.runner.getActive() || { x: 0, y: 0, scale: 100 };
    panel.runner.transition(
      from,
      { x: 28, y: 0, scale: 100 },
      600,
      'ease-in-out'
    );

    if (output) output.textContent =
      'Higher Lower card flipping while moving.';
  });

  document.getElementById('extension-higher-lower-command')?.addEventListener('click', () => {
    const output = document.getElementById('extension-test-output');
    RTS.core.events.emit('RTS - Overlay - Extension Command', {
      eventName: 'RTS - Overlay - Extension Command',
      args: {
        rtsOverlayExtension: 'rts-higher-lower',
        rtsOverlayCommand: 'flip',
        rtsOverlayData: JSON.stringify({
          rank: 'Queen',
          suit: 'Spades',
          symbol: '♠'
        })
      }
    });
    if (output) output.textContent = 'Higher Lower command event sent.';
  });

  document.getElementById('extension-higher-lower-start')?.addEventListener('click', () => {
    const extension = RTS.getExtension('rts-higher-lower');
    const output = document.getElementById('extension-test-output');
    if (!extension) {
      if (output) output.textContent = 'Load Higher Lower first.';
      return;
    }
    extension.api.startGame(10);
    if (output) output.textContent = 'Higher Lower game started.';
  });

  document.getElementById('extension-higher-lower-draw')?.addEventListener('click', async () => {
    const extension = RTS.getExtension('rts-higher-lower');
    const output = document.getElementById('extension-test-output');
    if (!extension) {
      if (output) output.textContent = 'Load Higher Lower first.';
      return;
    }
    try {
      if (output) output.textContent = 'Higher Lower: animating...';
      const result = await extension.api.drawCard();
      if (output) output.textContent =
        'Higher Lower: ' + result.type +
        (result.result ? ' (' + result.result + ')' : '');
    } catch (error) {
      if (output) output.textContent = error.message;
    }
  });

  document.getElementById('extension-api')?.addEventListener('click', () => {
    const extension = RTS.getExtension(manifest.id);
    const output = document.getElementById('extension-test-output');
    if (output) output.textContent = extension.api.test();
  });
})();
