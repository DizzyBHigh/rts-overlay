(() => {
  const runners = new WeakMap();

  const cubicBezier = (x1, y1, x2, y2) => t => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 16; i++) {
      const u = (low + high) / 2;
      const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
      if (x < t) low = u; else high = u;
    }
    const u = (low + high) / 2;
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };

  const Engine = {
    easing(name) {
      switch (String(name || 'ease-in-out').toLowerCase()) {
        case 'linear': return t => t;
        case 'ease': return cubicBezier(.25, .1, .25, 1);
        case 'ease-in': return t => t * t * t;
        case 'ease-out': return t => 1 - Math.pow(1 - t, 3);
        default: return t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
    },
    interpolate(from, to, progress) {
      const a = RTS.core.positioning.normalise(from);
      const b = RTS.core.positioning.normalise(to);
      const result = {};
      Object.keys(a).forEach(key => { result[key] = a[key] + (b[key] - a[key]) * progress; });
      return result;
    },
    equal(from, to) {
      const a = RTS.core.positioning.normalise(from);
      const b = RTS.core.positioning.normalise(to);
      return Object.keys(a).every(key => a[key] === b[key]);
    },
    read(raw, fallback = null) {
      if (!raw) return fallback;
      try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return value && typeof value === 'object' ? value : fallback;
      } catch (_) { return fallback; }
    },
    createRunner(target, positions = {}) {
      if (target && runners.has(target)) {
        const existing = runners.get(target);
        existing.configure(positions);
        return existing;
      }
      let configured = positions;
      let active = null;
      let token = 0;
      let timer = null;
      let frame = null;
      const cancel = () => {
        token++;
        if (timer) clearTimeout(timer);
        if (frame) cancelAnimationFrame(frame);
        timer = frame = null;
      };
      const resolve = (name, fallback = {}) => RTS.core.positioning.resolve(configured, name, fallback);
      const apply = position => {
        active = position;
        RTS.core.positioning.apply(target, position);
      };
      const transition = (from, to, duration, easing, complete) => {
        cancel();
        const start = RTS.core.positioning.normalise(from);
        const end = RTS.core.positioning.normalise(to);
        const ms = Math.max(0, Number(duration) || 0);
        if (!ms || Engine.equal(start, end)) { apply(end); complete?.(); return; }
        const runToken = token;
        const ease = Engine.easing(easing);
        const started = performance.now();
        const draw = now => {
          if (runToken !== token) return;
          const progress = Math.min(1, Math.max(0, (now - started) / ms));
          apply(Engine.interpolate(start, end, ease(progress)));
          if (progress < 1) frame = requestAnimationFrame(draw);
          else { frame = null; apply(end); complete?.(); }
        };
        frame = requestAnimationFrame(draw);
      };
      const run = (sequence, complete, endRun = false) => {
        const steps = Array.isArray(sequence) ? sequence : [];
        if (!steps.length) { complete?.(); return; }
        cancel();
        let index = 0;
        let current = endRun ? active || resolve(steps[0]?.position || steps[0]?.name) : resolve(steps[0]?.position || steps[0]?.name);
        if (!endRun) apply(current);
        const advance = () => {
          if (index >= steps.length) { complete?.(); return; }
          const step = steps[index++];
          const targetPosition = resolve(step?.position || step?.name);
          const start = current || targetPosition;
          const delay = Math.max(0, Number(step?.delay) || 0);
          const finish = () => {
            current = targetPosition;
            active = current;
            if (delay) timer = setTimeout(advance, delay); else advance();
          };
          transition(start, targetPosition, step?.duration, step?.easing, finish);
        };
        advance();
      };
      const runner = {
        configure(value) { configured = value || {}; },
        resolve,
        apply,
        transition,
        run(sequence, complete) { run(sequence, complete, false); },
        runEnd(sequence, complete) { run(sequence, complete, true); },
        cancel,
        getActive: () => active,
        setActive: value => { active = value; }
      };
      if (target) runners.set(target, runner);
      return runner;
    }
  };

  RTS.core.animation = Engine;
  window.RTSAnimationEngine = Engine;
})();
