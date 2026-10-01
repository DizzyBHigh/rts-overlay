(() => {
  const log = message => {
    const element = document.getElementById('log');
    if (element) element.textContent = message;
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

    RTS.core.events?.emit(eventName, message);
  });

  document.getElementById('load').onclick = () => {
    window.RTSOverlayConfiguration.request();
    log('Requested configuration from Streamer.bot.');
  };

  document.getElementById('save').onclick = () => {
    try {
      if (window.RTSOverlayConfiguration.save())
        log('Configuration sent to Streamer.bot.');
    } catch (error) {
      log(error.message);
    }
  };

  window.RTSOverlaySocket.connect();
})();
