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
    const preview = document.createElement('div');
    preview.className = 'rts-ui-color-preview';
    const sv = document.createElement('div');
    sv.className = 'rts-ui-color-sv';
    const hue = document.createElement('div');
    hue.className = 'rts-ui-color-hue';
    hue.tabIndex = 0;
    hue.setAttribute('role', 'slider');
    const hueHandle = document.createElement('span');
    hueHandle.className = 'rts-ui-color-hue-handle';
    const svHandle = document.createElement('span');
    svHandle.className = 'rts-ui-color-handle';
    const alphaRow = document.createElement('div');
    alphaRow.className = 'rts-ui-color-alpha-row';
    const alpha = document.createElement('div');
    alpha.className = 'rts-ui-color-alpha';
    alpha.tabIndex = 0;
    alpha.setAttribute('role', 'slider');
    const alphaHandle = document.createElement('span');
    alphaHandle.className = 'rts-ui-color-alpha-handle';
    const alphaText = document.createElement('span');
    alphaText.className = 'rts-ui-alpha-value';

    hue.append(hueHandle);
    sv.append(svHandle);
    alphaRow.append(alpha, alphaText);
    popup.append(preview, hue, sv, alphaRow);
    wrap.append(swatch, text, popup);

    let color = normalize(options.value || '#0384CBFF');
    let hsv = rgbToHsv(hexToRgb(color));
    let alphaValue = alphaFromHex(color.slice(7));

    const render = notify => {
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      color = rgbToHex(rgb) + percentToHex(alphaValue);
      swatch.style.setProperty('--rts-ui-swatch-color', color);
      preview.style.backgroundColor = rgbToHex(rgb);
      sv.style.background = 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(' + hsv.h + ' 100% 50%))';
      hueHandle.style.left = (hsv.h / 360 * 100) + '%';
      svHandle.style.left = (hsv.s * 100) + '%';
      svHandle.style.top = ((1 - hsv.v) * 100) + '%';
      alphaHandle.style.left = alphaValue + '%';
      alpha.style.setProperty('--rts-ui-alpha-color', rgbToHex(rgb));
      alphaText.textContent = 'Alpha ' + alphaValue + '%';
      text.value = color;
      if (notify) {
        options.onChange?.(color, wrap);
        options.onInput?.(color, wrap);
      }
    };

    const setFromText = value => {
      color = normalize(value);
      hsv = rgbToHsv(hexToRgb(color));
      alphaValue = alphaFromHex(color.slice(7));
      render(true);
    };

    const drag = (element, callback) => {
      const move = event => { callback(event); render(true); };
      const stop = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop);
    };

    swatch.addEventListener('click', event => {
      event.stopPropagation();
      popup.classList.toggle('open');
    });
    document.addEventListener('click', event => {
      if (!wrap.contains(event.target)) popup.classList.remove('open');
    });

    hue.addEventListener('pointerdown', event => {
      hue.setPointerCapture?.(event.pointerId);
      const update = moveEvent => {
        const rect = hue.getBoundingClientRect();
        hsv.h = clamp((moveEvent.clientX - rect.left) / rect.width) * 360;
      };
      update(event);
      render(true);
      drag(hue, update);
    });
    hue.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') hsv.h = (hsv.h + 1) % 360;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') hsv.h = (hsv.h + 359) % 360;
      else return;
      event.preventDefault();
      render(true);
    });

    sv.addEventListener('pointerdown', event => {
      const update = moveEvent => {
        const rect = sv.getBoundingClientRect();
        hsv.s = clamp((moveEvent.clientX - rect.left) / rect.width);
        hsv.v = clamp(1 - (moveEvent.clientY - rect.top) / rect.height);
      };
      update(event);
      render(true);
      drag(sv, update);
    });

    alpha.addEventListener('pointerdown', event => {
      const update = moveEvent => {
        const rect = alpha.getBoundingClientRect();
        alphaValue = Math.round(clamp((moveEvent.clientX - rect.left) / rect.width) * 100);
      };
      update(event);
      render(true);
      drag(alpha, update);
    });
    alpha.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') alphaValue = Math.min(100, alphaValue + 1);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') alphaValue = Math.max(0, alphaValue - 1);
      else return;
      event.preventDefault();
      render(true);
    });

    text.addEventListener('change', () => setFromText(text.value));

    wrap.getValue = () => color;
    wrap.setValue = value => setFromText(value);
    Object.defineProperty(wrap, 'value', {
      get: () => color,
      set: value => setFromText(value)
    });

    render(false);
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