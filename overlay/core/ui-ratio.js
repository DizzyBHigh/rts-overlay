(() => {
  const UI = RTS.core.ui;
  UI.aspectRatio = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-ratio';
    const width = UI.number({ value: options.width ?? 1, min: 1 });
    const height = UI.number({ value: options.height ?? 1, min: 1 });
    const lock = UI.aspectLock({ checked: options.locked !== false });
    const input = lock.querySelector('input');
    const row = document.createElement('div');
    row.className = 'rts-ui-lock-row';
    row.append(width, lock, height);

    let ratio = Number(width.value) / Number(height.value) || 1;
    let updating = false;

    const sync = source => {
      if (updating || !input.checked) return;
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
    lock.addEventListener('click', event => {
      event.preventDefault();
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    lock.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    lock.addEventListener('change', event => {
      if (event.target.checked)
        ratio = Number(width.value) / Number(height.value) || 1;
      options.onChange?.(Number(width.value), Number(height.value), event.target.checked, root);
    });

    root.append(row);
    root.getValue = () => ({
      width: Number(width.value),
      height: Number(height.value),
      locked: input.checked
    });
    root.setValue = value => {
      if (value?.width !== undefined) width.value = value.width;
      if (value?.height !== undefined) height.value = value.height;
      if (value?.locked !== undefined) input.checked = !!value.locked;
      if (input.checked)
        ratio = Number(width.value) / Number(height.value) || 1;
    };
    return root;
  };
})();
