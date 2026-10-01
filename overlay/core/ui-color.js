(() => {
  const UI = RTS.core.ui;
  UI.colorPicker = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-color-picker';
    const input = document.createElement('input');
    input.type = 'color';
    input.value = normalize(options.value || '#0384CBFF').slice(0, 7);
    const alpha = UI.slider({ value: alphaValue(options.value), min: 0, max: 100, step: 1 });
    const text = UI.textbox({ value: normalize(options.value || '#0384CBFF') });
    const alphaValueLabel = document.createElement('span');
    alphaValueLabel.className = 'rts-ui-alpha-value';

    const update = value => {
      const color = normalize(value);
      input.value = color.slice(0, 7);
      text.value = color;
      alpha.value = alphaToPercent(color.slice(7));
      alphaValueLabel.textContent = Math.round(alpha.value) + '%';
      options.onChange?.(color, wrap);
    };

    input.addEventListener('input', () => {
      const current = normalize(text.value);
      update(input.value + current.slice(7));
    });

    text.addEventListener('change', () => update(text.value));
    alpha.addEventListener('input', () => {
      const current = normalize(text.value);
      update(current.slice(0, 7) + percentToHex(alpha.value));
    });

    wrap.append(input, text, UI.field('Alpha', alpha), alphaValueLabel);
    return wrap;
  };

  function normalize(value) {
    let v = String(value || '').trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-f]{6}$/i.test(v)) return (v + 'FF').toUpperCase();
    if (/^#[0-9a-f]{8}$/i.test(v)) return v.toUpperCase();
    return '#0384CBFF';
  }

  function alphaValue(value) {
    return alphaToPercent(normalize(value).slice(7));
  }

  function alphaToPercent(hex) {
    return Math.round(parseInt(hex, 16) / 255 * 100);
  }

  function percentToHex(value) {
    return Math.round(Number(value) / 100 * 255).toString(16).padStart(2, '0').toUpperCase();
  }
})();
