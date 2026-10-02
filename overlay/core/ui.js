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
    const wrap = UI.el('div', { className: 'rts-ui-slider' });
    const range = UI.el('input', {
      type: 'range', min: options.min ?? 0, max: options.max ?? 100,
      step: options.step ?? 1, value: options.value ?? 0
    });
    const value = UI.el('output', { className: 'rts-ui-slider-value', text: range.value });
    const numeric = options.numericInput ? UI.number({
      value: range.value, min: options.min, max: options.max, step: options.step ?? 1
    }) : null;

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
    return wrap;
  };

  UI.color = options => UI.textbox({ type: 'color', value: options.value || '#0384CB', onInput: options.onInput });
  UI.date = options => UI.textbox({ type: 'date', value: options.value, onInput: options.onInput });
  UI.time = options => UI.textbox({ type: 'time', value: options.value, onInput: options.onInput });
  UI.datetime = options => UI.textbox({ type: 'datetime-local', value: options.value, onInput: options.onInput });

  UI.aspectLock = options => {
    const label = UI.el('label', { className: 'rts-ui-lock', title: 'Lock aspect ratio' });
    const input = UI.el('input', { type: 'checkbox', checked: !!options.checked });
    const icon = UI.el('span', { className: 'rts-ui-lock-icon', text: input.checked ? 'LOCKED' : 'UNLOCKED' });
    label.append(input, icon);
    input.addEventListener('change', () => {
      icon.textContent = input.checked ? 'LOCKED' : 'UNLOCKED';
      label.title = input.checked ? 'Unlock aspect ratio' : 'Lock aspect ratio';
      options.onChange?.(input.checked, input);
    });
    return label;
  };

  window.RTS = window.RTS || { core: {} };
  RTS.core = RTS.core || {};
  RTS.core.ui = UI;
})();
