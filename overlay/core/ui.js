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
    const control = UI.slider({
      min: 0,
      max: 360,
      step: 1,
      value: options.value ?? 0,
      numericInput: true,
      onInput: options.onInput
    });
    control.classList.add('rts-ui-angle');
    return control;
  };

  UI.fontSelector = options => {
    const wrap = UI.el('div', { className: 'rts-ui-font-picker' });
    const select = UI.dropdown({ options: options.options || [], value: options.value || '', onChange: value => {
      preview.style.fontFamily = value;
      options.onChange?.(value, select);
    }});
    const preview = UI.el('div', { className: 'rts-ui-font-preview', text: options.preview || 'Higher Lower' });
    preview.style.fontFamily = select.value;
    wrap.append(select, preview);
    Object.defineProperty(wrap, 'value', {
      get: () => select.value,
      set: value => {
        select.value = value || '';
        preview.style.fontFamily = select.value;
      }
    });
    return wrap;
  };

  UI.color = options => UI.textbox({ type: 'color', value: options.value || '#0384CB', onInput: options.onInput });
  UI.date = options => UI.textbox({ type: 'date', value: options.value, onInput: options.onInput });
  UI.time = options => UI.textbox({ type: 'time', value: options.value, onInput: options.onInput });
  UI.datetime = options => UI.textbox({ type: 'datetime-local', value: options.value, onInput: options.onInput });

  UI.aspectLock = options => {
    const button = UI.el('button', {
      className: 'rts-ui-lock',
      type: 'button',
      title: options.checked ? 'Unlock aspect ratio' : 'Lock aspect ratio'
    });
    const icon = UI.el('span', { className: 'rts-ui-lock-icon', text: 'LOCK' });
    let checked = !!options.checked;

    const render = () => {
      button.setAttribute('aria-pressed', checked ? 'true' : 'false');
      button.setAttribute('aria-label', checked ? 'Unlock aspect ratio' : 'Lock aspect ratio');
      button.title = checked ? 'Unlock aspect ratio' : 'Lock aspect ratio';
      icon.textContent = checked ? 'LOCKED' : 'UNLOCKED';
    };

    button.append(icon);
    button.addEventListener('click', () => {
      checked = !checked;
      render();
      options.onChange?.(checked, button);
    });
    button.getValue = () => checked;
    button.setValue = value => {
      checked = !!value;
      render();
    };
    render();
    return button;
  };

  window.RTS = window.RTS || { core: {} };
  RTS.core = RTS.core || {};
  RTS.core.ui = UI;
})();
