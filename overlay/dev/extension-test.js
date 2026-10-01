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
})();
