(() => {
  const UI = RTS.core.ui;
  UI.aspectRatio = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-ratio';
    const width = UI.number({ value: options.width ?? 1, min: 1 });
    const height = UI.number({ value: options.height ?? 1, min: 1 });
    let ratio = Number(width.value) / Number(height.value) || 1;
    let updating = false;
    let editRatio = ratio;
    const lock = UI.aspectLock({
      checked: options.locked !== false,
      onChange: locked => {
        if (locked) ratio = Number(width.value) / Number(height.value) || 1;
        editRatio = ratio;
        options.onChange?.(Number(width.value), Number(height.value), locked, root);
      }
    });
    const row = document.createElement('div');
    row.className = 'rts-ui-lock-row';
    row.append(
      UI.el('span', { className: 'rts-ui-label', text: options.labels?.[0] || 'x' }),
      width,
      lock,
      height,
      UI.el('span', { className: 'rts-ui-label', text: options.labels?.[1] || 'y' })
    );

    const beginEdit = () => {
      if (lock.getValue()) editRatio = Number(width.value) / Number(height.value) || 1;
    };

    const sync = source => {
      if (updating || !lock.getValue()) return;
      updating = true;
      if (source === width)
        height.value = Math.max(1, Math.round(Number(width.value) / editRatio));
      else
        width.value = Math.max(1, Math.round(Number(height.value) * editRatio));
      updating = false;
      ratio = editRatio;
      options.onChange?.(Number(width.value), Number(height.value), true, root);
    };

    width.addEventListener('focus', beginEdit);
    height.addEventListener('focus', beginEdit);
    width.addEventListener('input', () => sync(width));
    height.addEventListener('input', () => sync(height));

    root.append(row);
    root.getValue = () => ({
      width: Number(width.value),
      height: Number(height.value),
      locked: lock.getValue()
    });
    root.setValue = value => {
      if (value?.width !== undefined && value?.height !== undefined) {
        ratio = Number(value.width) / Number(value.height) || 1;
        editRatio = ratio;
      }
      if (value?.width !== undefined) width.value = value.width;
      if (value?.height !== undefined) height.value = value.height;
      if (value?.locked !== undefined) lock.setValue(value.locked);
    };
    return root;
  };
})();