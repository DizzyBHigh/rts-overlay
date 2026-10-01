(() => {
  const UI = RTS.core.ui;

  UI.colorPicker = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-color-picker';
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'rts-ui-color-swatch';
    const text = UI.textbox({ value: normalize(options.value || '#0384CBFF') });
    const popup = document.createElement('div');
    popup.className = 'rts-ui-color-popup';
    const sv = document.createElement('div');
    sv.className = 'rts-ui-color-sv';
    const hue = document.createElement('input');
    hue.type = 'range';
    hue.min = 0; hue.max = 360; hue.className = 'rts-ui-color-hue';
    const alpha = document.createElement('input');
    alpha.type = 'range';
    alpha.min = 0; alpha.max = 100; alpha.className = 'rts-ui-color-alpha';
    const alphaText = document.createElement('span');
    alphaText.className = 'rts-ui-alpha-value';
    const hex = document.createElement('input');
    hex.className = 'rts-ui-input';
    hex.value = text.value;
    popup.append(sv, hue, alpha, alphaText, hex);
    wrap.append(swatch, text, popup);

    let color = normalize(options.value || '#0384CBFF');
    let hsv = rgbToHsv(hexToRgb(color));

    const render = () => {
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      color = rgbToHex(rgb) + percentToHex(alpha.value);
      swatch.style.background = color;
      sv.style.background = 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(' + hsv.h + ' 100% 50%))';
      hue.value = hsv.h;
      alpha.value = alphaFromHex(color.slice(7));
      alphaText.textContent = 'Alpha ' + alpha.value + '%';
      alpha.style.background = 'linear-gradient(to right, transparent, ' + rgbToHex(rgb) + ')';
      text.value = color;
      hex.value = color;
      options.onChange?.(color, wrap);
    };

    const setFromText = value => {
      color = normalize(value);
      hsv = rgbToHsv(hexToRgb(color));
      alpha.value = alphaFromHex(color.slice(7));
      render();
    };

    swatch.addEventListener('click', () => popup.classList.toggle('open'));
    document.addEventListener('click', event => {
      if (!wrap.contains(event.target)) popup.classList.remove('open');
    });
    hue.addEventListener('input', () => { hsv.h = Number(hue.value); render(); });
    alpha.addEventListener('input', render);
    text.addEventListener('change', () => setFromText(text.value));
    hex.addEventListener('change', () => setFromText(hex.value));
    sv.addEventListener('pointerdown', event => {
      const move = e => {
        const rect = sv.getBoundingClientRect();
        hsv.s = clamp((e.clientX - rect.left) / rect.width);
        hsv.v = clamp(1 - (e.clientY - rect.top) / rect.height);
        render();
      };
      move(event);
      const stop = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop);
    });

    render();
    return wrap;
  };

  UI.color = UI.colorPicker;

  function normalize(value) {
    let v = String(value || '').trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-f]{6}$/i.test(v)) return (v + 'FF').toUpperCase();
    if (/^#[0-9a-f]{8}$/i.test(v)) return v.toUpperCase();
    return '#0384CBFF';
  }
  function hexToRgb(value) {
    return { r: parseInt(value.slice(1, 3), 16), g: parseInt(value.slice(3, 5), 16), b: parseInt(value.slice(5, 7), 16) };
  }
  function rgbToHex(c) {
    return '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function rgbToHsv(c) {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = d === 0 ? 0 : max === r ? 60 * ((g - b) / d % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    return { h: (h + 360) % 360, s: max ? d / max : 0, v: max };
  }
  function hsvToRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    const p = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
    return { r: (p[0] + m) * 255, g: (p[1] + m) * 255, b: (p[2] + m) * 255 };
  }
  function alphaFromHex(value) { return Math.round(parseInt(value, 16) / 255 * 100); }
  function percentToHex(value) { return Math.round(Number(value) / 100 * 255).toString(16).padStart(2, '0').toUpperCase(); }
  function clamp(value) { return Math.max(0, Math.min(1, value)); }
})();
