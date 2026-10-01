(() => {
  const UI = RTS.core.ui;
  UI.colorPicker = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-color';
    const input = document.createElement('input');
    input.type = 'color';
    input.value = normalize(options.value || '#0384CB');
    const text = UI.textbox({ value: input.value });
    wrap.append(input, text);
    const update = value => {
      const color = normalize(value);
      input.value = color.slice(0, 7);
      text.value = color;
      options.onChange?.(color, wrap);
    };
    input.addEventListener('input', () => update(input.value));
    text.addEventListener('change', () => update(text.value));
    return wrap;
  };
  function normalize(value) {
    let v = String(value || '').trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
    if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7).toUpperCase();
    return '#0384CB';
  }
})();
