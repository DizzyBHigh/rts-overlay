(() => {
  const UI = RTS.core.ui;
  UI.fontPicker = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-font-picker';
    const select = UI.dropdown({ options: options.options || [], value: options.value || '' });
    const preview = document.createElement('div');
    preview.className = 'rts-ui-font-preview';
    preview.textContent = options.value || 'Road to Somewhere';
    const update = value => {
      preview.textContent = value || 'Road to Somewhere';
      preview.style.fontFamily = value ? "'" + value.replace(/'/g, '') + "', sans-serif" : '';
      options.onChange?.(value, wrap);
    };
    select.addEventListener('change', () => update(select.value));
    wrap.append(select, preview);
    update(select.value);
    return wrap;
  };
})();
