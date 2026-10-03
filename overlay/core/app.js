(() => {
  const log = message => {
    const element = document.getElementById('log');
    if (element) element.textContent = message;
  };

  const params = new URLSearchParams(window.location.search);
  const isDev = params.get('dev') === 'true';

  const loadExtension = async (url, id = '') => {
    if (!url) return false;

    try {
      await RTS.core.extensions.loadManifest(url, { dev: isDev });
      log('Extension loaded: ' + (id || 'extension'));
      return true;
    } catch (error) {
      log('Extension load failed: ' + error.message);
      return false;
    }
  };

  window.RTSOverlaySocket.onEvent(message => {
    const eventName =
      message?.data?.eventName ??
      message?.eventName;

    if (eventName === 'RTS - Overlay - Configuration') {
      const configuration =
        message?.data?.args?.rtsOverlayConfiguration ??
        message?.args?.rtsOverlayConfiguration;

      if (!configuration) return;

      try {
        window.RTSOverlayConfiguration.apply(
          typeof configuration === 'string'
            ? JSON.parse(configuration)
            : configuration
        );
        log('Configuration received from Streamer.bot.');
      } catch (error) {
        log(error.message);
      }
      return;
    }

    if (eventName === 'RTS - Overlay - Load Extension') {
      const args = message?.data?.args ?? message?.args ?? {};
      loadExtension(
        args.rtsOverlayManifestUrl,
        args.rtsOverlayExtension
      );
      return;
    }

    RTS.core.events?.emit(eventName, message);
  });

  const manifestUrl = params.get('manifest');
  if (manifestUrl) loadExtension(manifestUrl);

  const loadButton = document.getElementById('load');
  if (loadButton) {
    loadButton.onclick = () => {
      window.RTSOverlayConfiguration.request();
      log('Requested configuration from Streamer.bot.');
    };
  }

  const saveButton = document.getElementById('save');
  if (saveButton) {
    saveButton.onclick = () => {
      try {
        if (window.RTSOverlayConfiguration.save())
          log('Configuration sent to Streamer.bot.');
      } catch (error) {
        log(error.message);
      }
    };
  }

  window.RTSOverlaySocket.connect();
})();
