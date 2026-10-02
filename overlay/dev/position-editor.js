(() => {
  const Editor = {
    mount(host, options = {}) {
      const root = document.createElement('section');
      root.className = 'rts-position-editor';
      root.innerHTML = '<h3>' + (options.title || 'Position Editor') + '</h3>';

      const select = document.createElement('select');
      const fields = {};
      const marker = document.createElement('div');
      const overlay = document.getElementById('rts-overlay');
      const targets = options.targets || [];

      targets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = target.label || target.id;
        select.appendChild(option);
      });

      root.appendChild(select);
      ['x', 'y', 'width', 'height'].forEach(key => {
        const input = document.createElement('input');
        input.type = 'number';
        input.dataset.field = key;
        fields[key] = input;
        root.appendChild(input);
        input.addEventListener('input', () => applyField(key));
      });

      marker.className = 'rts-position-marker';
      if (overlay) overlay.appendChild(marker);
      host.appendChild(root);

      const target = () => targets.find(item => item.id === select.value);
      const value = () => target()?.get?.() || {};

      const render = () => {
        const item = value();
        Object.keys(fields).forEach(key => fields[key].value = item[key] ?? 0);
        marker.dataset.target = target()?.label || select.value;
        marker.style.left = (item.x || 0) + 'px';
        marker.style.top = (item.y || 0) + 'px';
        marker.style.width = Math.max(1, item.width || 1) + 'px';
        marker.style.height = Math.max(1, item.height || 1) + 'px';
      };

      const applyField = key => {
        const item = target();
        if (!item?.set) return;
        item.set({ [key]: Number(fields[key].value) });
        options.onChange?.(item.get?.());
        render();
      };

      let drag = null;
      marker.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        const item = value();
        const scale = overlay?.getBoundingClientRect().width / 1920 || 1;
        drag = { x: item.x || 0, y: item.y || 0, px: event.clientX, py: event.clientY, scale };
        marker.setPointerCapture(event.pointerId);
      });

      marker.addEventListener('pointermove', event => {
        if (!drag) return;
        const item = target();
        if (!item?.set) return;
        item.set({
          x: drag.x + (event.clientX - drag.px) / drag.scale,
          y: drag.y + (event.clientY - drag.py) / drag.scale
        });
        options.onChange?.(item.get?.());
        render();
      });

      const stop = event => {
        if (!drag) return;
        drag = null;
        if (marker.hasPointerCapture(event.pointerId)) marker.releasePointerCapture(event.pointerId);
      };
      marker.addEventListener('pointerup', stop);
      marker.addEventListener('pointercancel', stop);
      select.addEventListener('change', render);
      root.refresh = render;
      render();
      return root;
    }
  };

  RTS.core.positionEditor = Editor;
})();
