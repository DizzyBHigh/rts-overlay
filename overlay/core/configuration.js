(() => {
  const Configuration = {
    current: null,

    apply(configuration) {
      if (!configuration || typeof configuration !== 'object') return false;

      if (!configuration.extensions ||
          typeof configuration.extensions !== 'object') {
        configuration.extensions =
          configuration.extension &&
          typeof configuration.extension === 'object'
            ? configuration.extension
            : {};
      }

      delete configuration.extension;

      Configuration.current = configuration;
      window.rtsOverlayConfiguration = configuration;

      const editor = document.getElementById('configuration');
      if (editor)
        editor.value = JSON.stringify(configuration, null, 2);

      RTS.core.extensions?.applyConfiguration(configuration);
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
