(() => {
  const source = {
    init(extension) {
      extension.state.loaded = true;
      extension.api.test = () => 'Dynamic extension loaded from script.';
      const output = document.getElementById('extension-test-output');
      if (output) output.textContent = extension.api.test();
    }
  };

  RTS.core.extensions.registerSource('dynamic-test', source);
})();
