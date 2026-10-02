(() => {
  const UI = RTS.core.ui;
  UI.aspectRatio = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-ratio';
    const width = UI.number({ value: options.width ?? 1, min: 1 });
    const height = UI.number({ value: options.height ?? 1, min: 1 });
    let ratio = Number(width.value) / Number(height.value) || 1;
    let updating = false;
    let editing = false;

    const lock = UI.aspectLock({
      checked: options.locked !== false,
      onChange: locked => {
        if (locked) ratio = Number(width.value) / Number(height.value) || 1;
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

    const sync = source => {
      if (updating) return;
      if (!lock.getValue()) {
        options.onChange?.(Number(width.value), Number(height.value), false, root);
        return;
      }
      updating = true;
      if (source === width)
        height.value = Math.max(1, Math.round(Number(width.value) / ratio));
      else
        width.value = Math.max(1, Math.round(Number(height.value) * ratio));
      updating = false;
      options.onChange?.(Number(width.value), Number(height.value), true, root);
    };

    const beginEdit = () => {
      if (lock.getValue()) editing = true;
    };

    const endEdit = () => {
      editing = false;
    };

    width.addEventListener('focus', beginEdit);
    height.addEventListener('focus', beginEdit);
    width.addEventListener('blur', endEdit);
    height.addEventListener('blur', endEdit);
    width.addEventListener('input', () => sync(width));
    height.addEventListener('input', () => sync(height));

    root.append(row);
    root.getValue = () => ({
      width: Number(width.value),
      height: Number(height.value),
      locked: lock.getValue()
    });
    root.setValue = value => {
      if (lock.getValue() && value?.width !== undefined && value?.height !== undefined)
        ratio = Number(value.width) / Number(value.height) || 1;
      if (value?.width !== undefined) width.value = value.width;
      if (value?.height !== undefined) height.value = value.height;
      if (value?.locked !== undefined) lock.setValue(value.locked);
      if (lock.getValue() && value?.width === undefined && value?.height === undefined)
        ratio = Number(width.value) / Number(height.value) || 1;
    };
    return root;
  };
})();
