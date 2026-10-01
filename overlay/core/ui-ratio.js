(() => {
  const UI = RTS.core.ui;
  UI.aspectRatio = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-ratio';
    const width = UI.number({ value: options.width ?? 1, min: 1 });
    const height = UI.number({ value: options.height ?? 1, min: 1 });
    const lock = UI.aspectLock({ checked: options.locked !== false });
    const row = document.createElement('div');
    row.className = 'rts-ui-lock-row';
    row.append(width, lock, height);

    let ratio = Number(width.value) / Number(height.value) || 1;
    let updating = false;

    const sync = source => {
      if (updating || !lock.querySelector('input')?.checked) return;
      updating = true;
      if (source === width)
        height.value = Math.max(1, Math.round(Number(width.value) / ratio));
      else
        width.value = Math.max(1, Math.round(Number(height.value) * ratio));
      updating = false;
      options.onChange?.(Number(width.value), Number(height.value), true, root);
    };

    width.addEventListener('input', () => sync(width));
    height.addEventListener('input', () => sync(height));
    lock.addEventListener('change', event => {
      if (event.target.checked)
        ratio = Number(width.value) / Number(height.value) || 1;
      options.onChange?.(Number(width.value), Number(height.value), event.target.checked, root);
    });

    root.append(row);
    root.getValue = () => ({
      width: Number(width.value),
      height: Number(height.value),
      locked: lock.querySelector('input')?.checked || false
    });
    return root;
  };
})();
