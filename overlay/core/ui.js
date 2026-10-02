(() => {
  const UI = {
    el(tag, props = {}, children = []) {
      const node = document.createElement(tag);
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'className') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'events') Object.entries(value).forEach(([event, fn]) => node.addEventListener(event, fn));
        else if (value !== undefined && value !== null) node[key] = value;
      });
      children.forEach(child => node.append(child));
      return node;
    },
    field(label, control, description = '') {
      const wrap = UI.el('div', { className: 'rts-ui-field' });
      wrap.append(UI.el('label', { className: 'rts-ui-label', text: label }), control);
      if (description) wrap.append(UI.el('small', { className: 'rts-ui-description', text: description }));
      return wrap;
    },
    title(text) { return UI.el('h3', { className: 'rts-ui-title', text }); },
    section(title, children = []) {
      const section = UI.el('section', { className: 'rts-ui-section' });
      if (title) section.append(UI.title(title));
      children.forEach(child => section.append(child));
      return section;
    },
    button(text, options = {}) {
      const button = UI.el('button', { className: 'rts-ui-button ' + (options.variant || ''), type: 'button', text });
      if (options.onClick) button.addEventListener('click', options.onClick);
      return button;
    },
    number(options = {}) {
      const input = UI.el('input', { className: 'rts-ui-input', type: 'number', value: options.value ?? 0, min: options.min, max: options.max, step: options.step ?? 1 });
      if (options.onInput) input.addEventListener('input', () => options.onInput(Number(input.value), input));
      return input;
    },
    textbox(options = {}) {
      const input = UI.el('input', { className: 'rts-ui-input', type: options.type || 'text', value: options.value ?? '', placeholder: options.placeholder || '' });
      if (options.onInput) input.addEventListener('input', () => options.onInput(input.value, input));
      return input;
    },
    textarea(options = {}) {
      const input = UI.el('textarea', { className: 'rts-ui-input rts-ui-textarea', placeholder: options.placeholder || '' });
      input.value = options.value ?? '';
      if (options.onInput) input.addEventListener('input', () => options.onInput(input.value, input));
      return input;
    },
    checkbox(options = {}) {
      const label = UI.el('label', { className: 'rts-ui-check' });
      const input = UI.el('input', { type: 'checkbox', checked: !!options.checked });
      label.append(input, UI.el('span', { text: options.label || '' }));
      input.addEventListener('change', () => options.onChange?.(input.checked, input));
      return label;
    },
    toggle(options = {}) {
      const label = UI.el('label', { className: 'rts-ui-toggle' });
      const input = UI.el('input', { type: 'checkbox', checked: !!options.checked });
      label.append(input, UI.el('span', { className: 'rts-ui-toggle-track' }), UI.el('span', { className: 'rts-ui-toggle-text', text: options.label || '' }));
      input.addEventListener('change', () => options.onChange?.(input.checked, input));
      return label;
    },
    radio(options = {}) {
      const wrap = UI.el('div', { className: 'rts-ui-radio-group' });
      const name = options.name || 'rts-radio-' + Date.now();
      (options.options || []).forEach((value, index) => {
        const label = UI.el('label', { className: 'rts-ui-radio' });
        const input = UI.el('input', { type: 'radio', name, value, checked: value === (options.value ?? (index === 0 ? value : '')) });
        label.append(input, UI.el('span', { text: value }));
        input.addEventListener('change', () => input.checked && options.onChange?.(value, input));
        wrap.append(label);
      });
      return wrap;
    }
  };

  UI.dropdown = options => {
    const select = UI.el('select', { className: 'rts-ui-input rts-ui-select' });
    (options.options || []).forEach(value => select.append(UI.el('option', { value, text: value })));
    select.value = options.value ?? '';
    select.addEventListener('change', () => options.onChange?.(select.value, select));
    return select;
  };

  UI.slider = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-slider';
    const range = UI.el('input', { type: 'range', min: options.min ?? 0, max: options.max ?? 100, step: options.step ?? 1, value: options.value ?? 0 });
    const value = UI.el('output', { className: 'rts-ui-slider-value', text: range.value });
    const numeric = options.numericInput ? UI.number({ value: range.value, min: options.min, max: options.max, step: options.step ?? 1 }) : null;
    const sync = source => {
      const next = Number(source.value);
      range.value = next;
      value.textContent = next;
      if (numeric) numeric.value = next;
      options.onInput?.(next, source);
    };
    range.addEventListener('input', () => sync(range));
    numeric?.addEventListener('input', () => sync(numeric));
    wrap.append(numeric || range, range, value);
    if (!numeric) wrap.replaceChildren(range, value);
    wrap.getValue = () => Number(range.value);
    wrap.setValue = next => {
      const value = Math.min(Number(options.max ?? 100), Math.max(Number(options.min ?? 0), Number(next) || 0));
      range.value = value;
      if (numeric) numeric.value = value;
      wrap.querySelector('.rts-ui-slider-value').textContent = value;
    };
    return wrap;
  };

  UI.angle = options => {
    const dial = UI.el('div', { className: 'rts-ui-direction', role: 'slider', tabIndex: 0 });
    dial.setAttribute('aria-label', options.label || 'Direction');
    dial.setAttribute('aria-valuemin', '0');
    dial.setAttribute('aria-valuemax', '360');
    const face = UI.el('span', { className: 'rts-ui-direction-face' });
    const line = UI.el('span', { className: 'rts-ui-direction-line' });
    let angle = Number(options.value) || 0;
    const normalise = value => ((Number(value) % 360) + 360) % 360;
    const render = () => {
      angle = normalise(angle);
      line.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
      dial.setAttribute('aria-valuenow', String(Math.round(angle)));
    };
    const setAngle = next => { angle = normalise(next); render(); options.onInput?.(angle, dial); };
    const updateFromPointer = event => {
      const rect = dial.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      setAngle(Math.atan2(y, x) * 180 / Math.PI);
    };
    dial.addEventListener('pointerdown', event => {
      dial.setPointerCapture?.(event.pointerId);
      updateFromPointer(event);
      const move = moveEvent => updateFromPointer(moveEvent);
      const stop = () => { dial.removeEventListener('pointermove', move); dial.removeEventListener('pointerup', stop); dial.removeEventListener('pointercancel', stop); };
      dial.addEventListener('pointermove', move);
      dial.addEventListener('pointerup', stop);
      dial.addEventListener('pointercancel', stop);
    });
    dial.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setAngle(angle - 1); }
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setAngle(angle + 1); }
    });
    face.append(line);
    dial.append(face);
    dial.getValue = () => angle;
    dial.setValue = next => { angle = Number(next) || 0; render(); };
    render();
    return dial;
  };

  UI.fontSelector = options => {
    const wrap = UI.el('div', { className: 'rts-ui-font-picker' });
    const select = UI.dropdown({ options: options.options || [], value: options.value || '', onChange: value => { preview.style.fontFamily = value; options.onChange?.(value, select); } });
    const preview = UI.el('div', { className: 'rts-ui-font-preview', text: options.preview || 'Higher Lower' });
    preview.style.fontFamily = select.value;
    wrap.append(select, preview);
    Object.defineProperty(wrap, 'value', { get: () => select.value, set: value => { select.value = value || ''; preview.style.fontFamily = select.value; } });
    return wrap;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const hsvToRgb = (h, s, v) => {
    const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    const rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return rgb.map(value => Math.round(value * 255));
  };
  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) { if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; if (h < 0) h += 1; }
    return { h, s: max ? d / max : 0, v: max };
  };
  const hexToRgba = value => {
    const text = String(value || '').trim().replace(/^#/, '');
    if (![6, 8].includes(text.length) || !/^[0-9a-f]+$/i.test(text)) return null;
    return { r: parseInt(text.slice(0, 2), 16), g: parseInt(text.slice(2, 4), 16), b: parseInt(text.slice(4, 6), 16), a: text.length === 8 ? parseInt(text.slice(6, 8), 16) / 255 : 1 };
  };
  const rgbaToHex = ({ r, g, b, a }) => '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('') + (a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : '');

  UI.color = options => {
    let rgba = hexToRgba(options.value) || { r: 3, g: 132, b: 203, a: 1 };
    let hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    const wrap = UI.el('div', { className: 'rts-ui-color-picker' });
    const swatch = UI.el('button', { className: 'rts-ui-color-swatch', type: 'button', title: 'Choose colour' });
    const popover = UI.el('div', { className: 'rts-ui-color-popover' });
    const preview = UI.el('div', { className: 'rts-ui-color-preview' });
    const sv = UI.el('div', { className: 'rts-ui-color-sv' });
    const svHandle = UI.el('span', { className: 'rts-ui-color-handle' });
    const hue = UI.el('div', { className: 'rts-ui-color-hue', role: 'slider', tabIndex: 0 });
    const hueHandle = UI.el('span', { className: 'rts-ui-color-hue-handle' });
    const alpha = UI.el('div', { className: 'rts-ui-color-alpha', role: 'slider', tabIndex: 0 });
    const alphaHandle = UI.el('span', { className: 'rts-ui-color-alpha-handle' });
    const hex = UI.el('input', { className: 'rts-ui-input rts-ui-color-hex', type: 'text', value: rgbaToHex(rgba) });
    sv.append(svHandle); hue.append(hueHandle); alpha.append(alphaHandle);
    popover.append(preview, sv, hue, alpha, hex);
    wrap.append(swatch, popover);

    const emit = () => options.onInput?.(rgbaToHex(rgba), wrap);
    const render = () => {
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      rgba.r = rgb[0]; rgba.g = rgb[1]; rgba.b = rgb[2];
      const color = rgbaToHex(rgba);
      swatch.style.backgroundColor = color;
      preview.style.backgroundColor = color;
      sv.style.backgroundColor = 'hsl(' + Math.round(hsv.h * 360) + ' 100% 50%)';
      svHandle.style.left = (hsv.s * 100) + '%';
      svHandle.style.top = ((1 - hsv.v) * 100) + '%';
      hueHandle.style.left = (hsv.h * 100) + '%';
      alphaHandle.style.left = (rgba.a * 100) + '%';
      alpha.style.setProperty('--rts-ui-alpha-color', 'rgb(' + rgba.r + ' ' + rgba.g + ' ' + rgba.b + ')');
      hex.value = color;
    };
    const pick = (element, event, callback) => {
      const rect = element.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      callback(x, y); render(); emit();
    };
    const drag = (element, callback) => {
      const move = event => pick(element, event, callback);
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up, { once: true });
    };
    sv.addEventListener('pointerdown', event => { pick(sv, event, (x, y) => { hsv.s = x; hsv.v = 1 - y; }); drag(sv, (x, y) => { hsv.s = x; hsv.v = 1 - y; }); });
    hue.addEventListener('pointerdown', event => { pick(hue, event, x => { hsv.h = x; }); drag(hue, x => { hsv.h = x; }); });
    alpha.addEventListener('pointerdown', event => { pick(alpha, event, x => { rgba.a = x; }); drag(alpha, x => { rgba.a = x; }); });
    hex.addEventListener('change', () => { const parsed = hexToRgba(hex.value); if (!parsed) { render(); return; } rgba = parsed; hsv = rgbToHsv(rgba.r, rgba.g, rgba.b); render(); emit(); });
    swatch.addEventListener('click', event => { event.stopPropagation(); wrap.classList.toggle('is-open'); });
    popover.addEventListener('pointerdown', event => event.stopPropagation());
    document.addEventListener('pointerdown', event => { if (!wrap.contains(event.target)) wrap.classList.remove('is-open'); });
    hue.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowUp') hsv.h = (hsv.h + 1 / 360) % 1; else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') hsv.h = (hsv.h + 359 / 360) % 1; else return; event.preventDefault(); render(); emit(); });
    wrap.getValue = () => rgbaToHex(rgba);
    Object.defineProperty(wrap, 'value', { get: () => rgbaToHex(rgba), set: value => { const parsed = hexToRgba(value); if (!parsed) return; rgba = parsed; hsv = rgbToHsv(rgba.r, rgba.g, rgba.b); render(); } });
    render();
    return wrap;
  };

  UI.date = options => UI.textbox({ type: 'date', value: options.value, onInput: options.onInput });
  UI.time = options => UI.textbox({ type: 'time', value: options.value, onInput: options.onInput });
  UI.datetime = options => UI.textbox({ type: 'datetime-local', value: options.value, onInput: options.onInput });

  UI.aspectLock = options => {
    const button = UI.el('button', { className: 'rts-ui-lock', type: 'button', title: options.checked ? 'Unlock aspect ratio' : 'Lock aspect ratio' });
    const icon = UI.el('span', { className: 'rts-ui-lock-icon', text: 'LOCK' });
    let checked = !!options.checked;
    const render = () => { button.setAttribute('aria-pressed', checked ? 'true' : 'false'); button.setAttribute('aria-label', checked ? 'Unlock aspect ratio' : 'Lock aspect ratio'); button.title = checked ? 'Unlock aspect ratio' : 'Lock aspect ratio'; icon.textContent = checked ? 'LOCKED' : 'UNLOCKED'; };
    button.append(icon);
    button.addEventListener('click', () => { checked = !checked; render(); options.onChange?.(checked, button); });
    button.getValue = () => checked;
    button.setValue = value => { checked = !!value; render(); };
    render();
    return button;
  };

  window.RTS = window.RTS || { core: {} };
  RTS.core = RTS.core || {};
  RTS.core.ui = UI;
})();