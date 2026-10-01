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
        'https://raw.githubusercontent.com/DizzyBHigh/rts-higher-lower/main/overlay/manifest.json'
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

  document.getElementById('extension-api')?.addEventListener('click', () => {
    const extension = RTS.getExtension(manifest.id);
    const output = document.getElementById('extension-test-output');
    if (output) output.textContent = extension.api.test();
  });
})();
