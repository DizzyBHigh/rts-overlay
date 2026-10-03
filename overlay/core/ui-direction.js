(() => {
  const UI = window.RTS?.core?.ui;
  if (!UI) return;

  UI.angle = options => {
    const dial = UI.el('div', { className: 'rts-ui-direction-control' });
    const face = UI.el('div', { className: 'rts-ui-direction', role: 'slider', tabIndex: 0 });
    const line = UI.el('span', { className: 'rts-ui-direction-line' });
    const manual = UI.el('div', { className: 'rts-ui-direction-manual' });
    const maxDistance = Math.max(0, Number(options.maxDistance ?? 10));
    const angleInput = UI.el('input', { className: 'rts-ui-input', type: 'number', min: '0', max: '360', step: '1' });
    const distanceInput = UI.el('input', { className: 'rts-ui-input', type: 'number', min: '0', max: String(maxDistance), step: '1' });
    const objectMode = options.value && typeof options.value === 'object';
    let angle = 0;
    let distance = Math.min(3, maxDistance);

    dial.append(face);
    manual.append(angleInput, distanceInput);
    dial.append(manual);
    face.append(line);
    dial.setAttribute('aria-label', options.label || 'Direction');
    face.setAttribute('aria-label', options.label || 'Direction');
    face.setAttribute('aria-valuemin', '0');
    face.setAttribute('aria-valuemax', '360');

    const normalise = value => ((Number(value) % 360) + 360) % 360;
    const clampDistance = value => Math.min(maxDistance, Math.max(0, Number(value) || 0));

    const readValue = value => {
      if (value && typeof value === 'object') {
        angle = normalise(value.angle);
        distance = clampDistance(value.distance);
        return;
      }
      angle = normalise(value);
      distance = Math.min(3, maxDistance);
    };

    const render = () => {
      angle = normalise(angle);
      distance = clampDistance(distance);
      line.style.height = distance + 'px';
      line.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
      face.setAttribute('aria-valuenow', String(Math.round(angle)));
      angleInput.value = String(Math.round(angle));
      distanceInput.value = String(Math.round(distance));
    };

    const emit = () => options.onInput?.({ angle, distance }, face);
    const setDirection = (nextAngle, nextDistance = distance, notify = true) => {
      angle = normalise(nextAngle);
      distance = clampDistance(nextDistance);
      render();
      if (notify) emit();
    };

    const updateFromPointer = event => {
      const rect = face.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const length = Math.min(Math.hypot(x, y), maxDistance);
      const nextAngle = Math.atan2(x, -y) * 180 / Math.PI;
      setDirection(nextAngle, length);
    };

    face.addEventListener('pointerdown', event => {
      face.setPointerCapture?.(event.pointerId);
      updateFromPointer(event);
      const move = moveEvent => updateFromPointer(moveEvent);
      const stop = () => {
        face.removeEventListener('pointermove', move);
        face.removeEventListener('pointerup', stop);
        face.removeEventListener('pointercancel', stop);
      };
      face.addEventListener('pointermove', move);
      face.addEventListener('pointerup', stop);
      face.addEventListener('pointercancel', stop);
    });

    face.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); setDirection(angle - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setDirection(angle + 1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setDirection(angle, distance + 1); }
      if (event.key === 'ArrowDown') { event.preventDefault(); setDirection(angle, distance - 1); }
    });

    angleInput.addEventListener('input', () => setDirection(angleInput.value, distance));
    distanceInput.addEventListener('input', () => setDirection(angle, distanceInput.value));

    dial.getValue = () => objectMode ? { angle, distance } : angle;
    dial.getDirection = () => ({ angle, distance });
    dial.setValue = next => { readValue(next); render(); };
    dial.classList.toggle('has-manual-values', objectMode);
    readValue(options.value);
    render();
    return dial;
  };
})();
