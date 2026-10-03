(() => {
  const UI = window.RTS?.core?.ui;
  if (!UI) return;

  UI.angle = options => {
    const dial = UI.el('div', { className: 'rts-ui-direction', role: 'slider', tabIndex: 0 });
    const face = UI.el('span', { className: 'rts-ui-direction-face' });
    const line = UI.el('span', { className: 'rts-ui-direction-line' });
    const maxDistance = 19;
    let angle = 0;
    let distance = 3;

    dial.setAttribute('aria-label', options.label || 'Direction');
    dial.setAttribute('aria-valuemin', '0');
    dial.setAttribute('aria-valuemax', '360');

    const normalise = value => ((Number(value) % 360) + 360) % 360;
    const clampDistance = value => Math.min(maxDistance, Math.max(0, Number(value) || 0));

    const readValue = value => {
      if (value && typeof value === 'object') {
        angle = normalise(value.angle);
        distance = clampDistance(value.distance);
        return;
      }
      angle = normalise(value);
      distance = 3;
    };

    const render = () => {
      angle = normalise(angle);
      distance = clampDistance(distance);
      line.style.height = distance + 'px';
      line.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
      dial.setAttribute('aria-valuenow', String(Math.round(angle)));
    };

    const emit = () => options.onInput?.({ angle, distance }, dial);
    const setDirection = (nextAngle, nextDistance = distance, notify = true) => {
      angle = normalise(nextAngle);
      distance = clampDistance(nextDistance);
      render();
      if (notify) emit();
    };

    const updateFromPointer = event => {
      const rect = dial.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const length = Math.min(Math.hypot(x, y), maxDistance);
      const nextAngle = Math.atan2(x, -y) * 180 / Math.PI;
      setDirection(nextAngle, length);
    };

    dial.addEventListener('pointerdown', event => {
      dial.setPointerCapture?.(event.pointerId);
      updateFromPointer(event);
      const move = moveEvent => updateFromPointer(moveEvent);
      const stop = () => {
        dial.removeEventListener('pointermove', move);
        dial.removeEventListener('pointerup', stop);
        dial.removeEventListener('pointercancel', stop);
      };
      dial.addEventListener('pointermove', move);
      dial.addEventListener('pointerup', stop);
      dial.addEventListener('pointercancel', stop);
    });

    dial.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); setDirection(angle - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setDirection(angle + 1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setDirection(angle, distance + 1); }
      if (event.key === 'ArrowDown') { event.preventDefault(); setDirection(angle, distance - 1); }
    });

    face.append(line);
    dial.append(face);
    dial.getValue = () => angle;
    dial.getDirection = () => ({ angle, distance });
    dial.setValue = next => { readValue(next); render(); };
    readValue(options.value);
    render();
    return dial;
  };
})();
