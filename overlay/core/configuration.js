(() => {
  const Configuration = {
    current: null,

    apply(configuration) {
      if (!configuration || typeof configuration !== 'object') return false;

      Configuration.current = configuration;
      window.rtsOverlayConfiguration = configuration;

      const editor = document.getElementById('configuration');
      if (editor)
        editor.value = JSON.stringify(configuration, null, 2);

      return true;
    },

    readEditor() {
      const editor = document.getElementById('configuration');
      if (!editor) return null;

      try {
        return JSON.parse(editor.value);
      } catch (error) {
        throw new Error('Configuration JSON is invalid.');
      }
    },

    request() {
      return window.RTSOverlaySocket?.requestConfiguration();
    },

    save() {
      const configuration = Configuration.readEditor();
      Configuration.current = configuration;
      return window.RTSOverlaySocket?.saveConfiguration(configuration);
    }
  };

  window.RTSOverlayConfiguration = Configuration;
})();
