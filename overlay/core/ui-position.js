(() => {
  const UI = RTS.core.ui;
  UI.positionEditor = options => {
    const root = document.createElement('div');
    root.className = 'rts-ui-position-editor';
    const fields = {};
    const allowed = options.fields || ['x', 'y', 'z', 'scale', 'rotateX', 'rotateY', 'rotateZ'];
    const limits = {
      x: [-300, 300], y: [-300, 300], z: [-3000, 3000],
      scale: [0, 300], rotateX: [-720, 720], rotateY: [-720, 720], rotateZ: [-720, 720]
    };
    allowed.forEach(key => {
      const range = limits[key] || [-9999, 9999];
      fields[key] = UI.number({ value: options.value?.[key] ?? 0, min: range[0], max: range[1] });
      root.append(UI.field(key, fields[key]));
      fields[key].addEventListener('input', emit);
    });
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
