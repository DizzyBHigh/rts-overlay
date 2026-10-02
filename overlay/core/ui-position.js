(() => {
  const UI = RTS.core.ui;
  UI.positionEditor = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-position-editor';
    const fields = {};
    const allowed = options.fields || ['x', 'y', 'z', 'scale', 'rotateX', 'rotateY', 'rotateZ'];
    const limits = {
      x: [-99999, 99999], y: [-99999, 99999], z: [-3000, 3000],
      scale: [0, 300], rotateX: [-720, 720], rotateY: [-720, 720], rotateZ: [-720, 720]
    };
    const row = document.createElement('div');
    row.className = options.inline ? 'rts-ui-position-row' : '';
    allowed.forEach(key => {
      const range = limits[key] || [-99999, 99999];
      fields[key] = UI.number({ value: options.value?.[key] ?? 0, min: range[0], max: range[1] });
    });
    allowed.forEach((key, index) => {
      row.append(UI.el('span', { className: 'rts-ui-label', text: key }), fields[key]);
    });
    allowed.forEach(key => fields[key].addEventListener('input', emit));
    root.append(row);
    function emit() {
      const value = {};
      Object.entries(fields).forEach(([key, input]) => value[key] = Number(input.value));
      options.onChange?.(value, root);
    }
    root.getValue = () => {
      const value = {};
      Object.entries(fields).forEach(([key, input]) => value[key] = Number(input.value));
      return value;
    };
    root.setValue = value => {
      Object.entries(fields).forEach(([key, input]) => {
        if (value?.[key] !== undefined) input.value = value[key];
      });
    };
    return root;
  };
})();
