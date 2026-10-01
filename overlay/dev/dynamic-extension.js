(() => {
  const manifest = {
    id: 'dynamic-test',
    name: 'Dynamic Test Extension',
    version: '0.1.0'
  };

  const source = {
    init(extension) {
      extension.state.loaded = true;
      extension.api.test = () => 'Dynamic extension loaded from script.';
      const output = document.getElementById('extension-test-output');
      if (output) output.textContent = extension.api.test();
    }
  };

  RTS.core.extensions.registerManifest(manifest);
  RTS.core.extensions.registerSource(manifest.id, source);
})();
