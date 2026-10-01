(() => {
  const UI = RTS.core.ui;
  UI.tabs = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-tabs';
    const bar = document.createElement('div');
    bar.className = 'rts-ui-tab-bar';
    const body = document.createElement('div');
    body.className = 'rts-ui-tab-body';
    (options.items || []).forEach((item, index) => {
      const button = UI.button(item.title, { variant: 'tab' });
      button.classList.toggle('active', index === 0);
      button.addEventListener('click', () => {
        [...bar.children].forEach(x => x.classList.remove('active'));
        [...body.children].forEach(x => x.hidden = true);
        button.classList.add('active');
        body.children[index].hidden = false;
        options.onChange?.(item, index);
      });
      bar.append(button);
      const panel = document.createElement('div');
      panel.append(...(item.children || []));
      panel.hidden = index !== 0;
      body.append(panel);
    });
    root.append(bar, body);
    return root;
  };

  UI.position = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-position';
    const fields = {};
    ['x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'rotateX', 'rotateY', 'rotateZ'].forEach(key => {
      if (options.fields && !options.fields.includes(key)) return;
      fields[key] = UI.number({ value: options.value?.[key] ?? 0, min: key.startsWith('rotate') ? -720 : -300, max: key.startsWith('rotate') ? 720 : 300 });
      wrap.append(UI.field(key.toUpperCase(), fields[key]));
    });
    const update = () => {
      const value = {};
      Object.entries(fields).forEach(([key, input]) => value[key] = Number(input.value));
      options.onChange?.(value, wrap);
    };
    Object.values(fields).forEach(input => input.addEventListener('input', update));
    return wrap;
  };
})();
