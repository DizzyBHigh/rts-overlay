(() => {
  const UI = RTS.core.ui;

  UI.textAlignment = options => {
    const values = ['left', 'center', 'right'];
    const wrap = UI.el('div', { className: 'rts-ui-alignment' });
    let value = values.includes(options.value) ? options.value : 'left';

    const render = () => {
      wrap.querySelectorAll('button').forEach(button => {
        const active = button.dataset.value === value;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };

    values.forEach(item => {
      const button = UI.el('button', {
        className: 'rts-ui-alignment-button',
        type: 'button',
        text: item.charAt(0).toUpperCase() + item.slice(1)
      });
      button.dataset.value = item;
      button.addEventListener('click', () => {
        value = item;
        render();
        options.onChange?.(value, wrap);
      });
      wrap.append(button);
    });

    wrap.getValue = () => value;
    wrap.setValue = next => {
      if (values.includes(next)) value = next;
      render();
    };
    render();
    return wrap;
  };
})();
