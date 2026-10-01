(() => {
  const Presenter = {
    present(panel, message, options = {}, finish) {
      if (!panel) {
        finish?.();
        return;
      }

      const profile = RTS.core.animationProfiles.read(options.profile);
      const positions = options.positions || {};
      panel.configure({ positions });

      panel.show(options.initialPosition || {});

      const start = profile?.start || [];
      const end = profile?.end || [];

      const begin = () => {
        panel.animate(profile, 'start', () => {
          const duration = Math.max(0, Number(options.duration) || 0);
          setTimeout(() => {
            const complete = () => {
              panel.hide();
              finish?.();
            };

            if (end.length) panel.animate(profile, 'end', complete);
            else complete();
          }, duration);
        });
      };

      if (start.length) begin();
      else {
        const duration = Math.max(0, Number(options.duration) || 0);
        setTimeout(() => {
          if (end.length) panel.animate(profile, 'end', () => {
            panel.hide();
            finish?.();
          });
          else {
            panel.hide();
            finish?.();
          }
        }, duration);
      }
    }
  };

  RTS.core.messagePresentation = Presenter;
  window.RTSMessagePresentation = Presenter;
})();
