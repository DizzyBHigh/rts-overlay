(() => {
  const isObject = value => value && typeof value === 'object' && !Array.isArray(value);

  const interpolate = (from, to, progress) => {
    if (typeof from === 'number' && typeof to === 'number') {
      return from + (to - from) * progress;
    }
    if (isObject(from) && isObject(to)) {
      const result = {};
      const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
      keys.forEach(key => {
        if (key in from && key in to) result[key] = interpolate(from[key], to[key], progress);
        else result[key] = progress < 1 ? from[key] ?? to[key] : to[key] ?? from[key];
      });
      return result;
    }
    if (Array.isArray(from) && Array.isArray(to)) {
      return to.map((value, index) => interpolate(from[index], value, progress));
    }
    return progress < 1 ? from : to;
  };

  const walk = (value, path, callback) => {
    if (!isObject(value)) return;
    callback(path, value);
    Object.keys(value).forEach(key => walk(value[key], path ? `${path}.${key}` : key, callback));
  };

  const LayoutAnimation = {
    interpolate,
    createRunner(targets = {}, apply) {
      let token = 0;
      let frame = null;

      const cancel = () => {
        token++;
        if (frame) cancelAnimationFrame(frame);
        frame = null;
      };

      const animate = (start, end, options = {}, complete) => {
        cancel();
        const duration = Math.max(0, Number(options.duration) || 0);
        const easing = RTS.core.animation.easing(options.easing);
        const entries = [];
        const seen = new Set();

        walk(start, '', path => {
          if (path && targets[path] && !seen.has(path)) {
            entries.push(path);
            seen.add(path);
          }
        });
        walk(end, '', path => {
          if (path && targets[path] && !seen.has(path)) {
            entries.push(path);
            seen.add(path);
          }
        });

        const drawAt = progress => {
          entries.forEach(path => {
            const from = path.split('.').reduce((value, key) => value?.[key], start);
            const to = path.split('.').reduce((value, key) => value?.[key], end);
            const value = interpolate(from, to, progress);
            apply?.(targets[path], value, path, progress);
          });
        };

        if (!duration || !entries.length) {
          drawAt(1);
          complete?.();
          return;
        }

        const runToken = token;
        const started = performance.now();
        const draw = now => {
          if (runToken !== token) return;
          const progress = Math.min(1, Math.max(0, (now - started) / duration));
          drawAt(easing(progress));
          if (progress < 1) frame = requestAnimationFrame(draw);
          else {
            frame = null;
            drawAt(1);
            complete?.();
          }
        };
        frame = requestAnimationFrame(draw);
      };

      return { animate, cancel };
    }
  };

  RTS.core.layoutAnimation = LayoutAnimation;
  window.RTSLayoutAnimation = LayoutAnimation;
})();
