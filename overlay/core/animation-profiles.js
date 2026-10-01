(() => {
  const Profiles = {
    read(raw) {
      if (!raw) return null;
      try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return value && typeof value === 'object' ? value : null;
      } catch (_) {
        return null;
      }
    },

    sequence(profile, phase) {
      const value = profile?.[phase];
      return Array.isArray(value) ? value : [];
    },

    run(runner, positions, sequence, complete) {
      if (!runner || !Array.isArray(sequence) || !sequence.length) {
        complete?.();
        return;
      }

      let index = 0;
      const advance = () => {
        if (index >= sequence.length) {
          complete?.();
          return;
        }

        const step = sequence[index++];
        const name = step?.position || step?.name;
        const target = runner.resolve(name, step?.position || {});
        const duration = Math.max(0, Number(step?.duration) || 0);
        const delay = Math.max(0, Number(step?.delay) || 0);
        const easing = step?.easing || 'ease-in-out';
        const from = runner.getActive() || target;

        const next = () => {
          if (delay) {
            setTimeout(advance, delay);
            return;
          }
          advance();
        };

        runner.transition(from, target, duration, easing, next);
      };

      runner.configure(positions);
      advance();
    }
  };

  RTS.core.animationProfiles = Profiles;
  window.RTSAnimationProfiles = Profiles;
})();