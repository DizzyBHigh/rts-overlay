(() => {
  const Editor = {
    mount(host, options = {}) {
      const root = document.createElement('section');
      root.className = 'rts-position-editor';
      root.appendChild(RTS.core.ui.title(options.title || 'Position Editor'));

      const select = document.createElement('select');
      const marker = document.createElement('div');
      const overlay = document.getElementById('rts-overlay');
      const targets = options.targets || [];
      let visible = true;

      targets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = target.label || target.id;
        select.appendChild(option);
      });

      const position = RTS.core.ui.positionEditor({
        fields: ['x', 'y'],
        value: {},
        inline: true,
        onChange: value => apply({ x: value.x, y: value.y })
      });
      const ratio = RTS.core.ui.aspectRatio({
        width: 1,
        height: 1,
        locked: true,
        labels: ['x', 'y'],
        onChange: (width, height) => apply({ width, height })
      });
      const positionRow = document.createElement('div');
      positionRow.className = 'rts-position-control-row';
      positionRow.append(
        RTS.core.ui.el('span', { className: 'rts-position-control-title', text: 'Position' }),
        position
      );
      const scaleRow = document.createElement('div');
      scaleRow.className = 'rts-position-control-row';
      scaleRow.append(
        RTS.core.ui.el('span', { className: 'rts-position-control-title', text: 'Scale' }),
        ratio
      );
      const toggle = RTS.core.ui.button('Hide Positions', {
        onClick: () => {
          visible = !visible;
          marker.hidden = !visible;
          toggle.textContent = visible ? 'Hide Positions' : 'Show Positions';
        }
      });

      root.append(select, positionRow, scaleRow, toggle);
      marker.className = 'rts-position-marker';
      if (overlay) overlay.appendChild(marker);
      host.appendChild(root);

      const target = () => targets.find(item => item.id === select.value);
      const value = () => target()?.get?.() || {};

      function apply(patch, transient = false) {
        const item = target();
        if (!item?.set) return;
        item.set(patch, { transient });
        options.onChange?.(item.get?.());
        render();
      }

      function render() {
        const item = value();
        position.setValue({ x: item.x || 0, y: item.y || 0 });
        ratio.setValue({
          width: item.width || 1,
          height: item.height || 1
        });
        marker.dataset.target = target()?.label || select.value;
        marker.style.left = (item.x || 0) + 'px';
        marker.style.top = (item.y || 0) + 'px';
        marker.style.width = Math.max(1, item.width || 1) + 'px';
        marker.style.height = Math.max(1, item.height || 1) + 'px';
      }

      let drag = null;
      marker.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const item = value();
        const scale = overlay?.getBoundingClientRect().width / 1920 || 1;
        drag = { x: item.x || 0, y: item.y || 0, px: event.clientX, py: event.clientY, scale };
        marker.setPointerCapture(event.pointerId);
      });

      marker.addEventListener('pointermove', event => {
        if (!drag) return;
        event.preventDefault();
        event.stopPropagation();
        apply({
          x: drag.x + (event.clientX - drag.px) / drag.scale,
          y: drag.y + (event.clientY - drag.py) / drag.scale
        }, true);
      });

      const stop = event => {
        if (!drag) return;
        event.preventDefault();
        event.stopPropagation();
        drag = null;
        options.onCommit?.(value());
        if (marker.hasPointerCapture(event.pointerId)) marker.releasePointerCapture(event.pointerId);
      };
      marker.addEventListener('pointerup', stop);
      marker.addEventListener('pointercancel', stop);
      marker.addEventListener('contextmenu', event => event.preventDefault());
      select.addEventListener('change', render);
      root.refresh = render;
      render();
      return root;
    }
  };

  RTS.core.positionEditor = Editor;
})();
