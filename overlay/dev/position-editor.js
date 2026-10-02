(() => {
  const Editor = {
    mount(host, options = {}) {
      const root = document.createElement('section');
      root.className = 'rts-position-editor';
      root.appendChild(RTS.core.ui.title(options.title || 'Position Editor'));

      const select = document.createElement('select');
      const overlay = document.getElementById('rts-overlay');
      const targets = options.targets || [];
      const markers = new Map();
      let visible = true;
      let drag = null;

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
        onChange: value => apply(select.value, { x: value.x, y: value.y })
      });
      const ratio = RTS.core.ui.aspectRatio({
        width: 1,
        height: 1,
        locked: true,
        labels: ['x', 'y'],
        onChange: (width, height) => apply(select.value, { width, height })
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
          render();
          toggle.textContent = visible ? 'Hide Positions' : 'Show Positions';
        }
      });

      root.append(select, positionRow, scaleRow, toggle);
      host.appendChild(root);

      targets.forEach(target => {
        const marker = document.createElement('div');
        marker.className = 'rts-position-marker';
        marker.dataset.id = target.id;
        marker.addEventListener('pointerdown', event => startDrag(event, target.id, marker));
        marker.addEventListener('pointerup', stopDrag);
        marker.addEventListener('pointercancel', stopDrag);
        marker.addEventListener('contextmenu', event => event.preventDefault());
        markers.set(target.id, marker);
        if (overlay) overlay.appendChild(marker);
      });

      const target = id => targets.find(item => item.id === id);
      const value = id => target(id)?.get?.() || {};

      function apply(id, patch, transient = false) {
        const item = target(id);
        if (!item?.set) return;
        item.set(patch, { transient });
        options.onChange?.(item.get?.(), id);
        render();
      }

      function render() {
        const selected = select.value;
        targets.forEach(item => {
          const marker = markers.get(item.id);
          const current = value(item.id);
          if (!marker) return;
          marker.hidden = !visible;
          marker.dataset.target = item.label || item.id;
          marker.classList.toggle('is-selected', item.id === selected);
          marker.style.left = (current.x || 0) + 'px';
          marker.style.top = (current.y || 0) + 'px';
          marker.style.width = Math.max(1, current.width || 1) + 'px';
          marker.style.height = Math.max(1, current.height || 1) + 'px';
        });
        const current = value(selected);
        position.setValue({ x: current.x || 0, y: current.y || 0 });
        ratio.setValue({
          width: current.width || 1,
          height: current.height || 1
        });
      }

      function startDrag(event, id, marker) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        select.value = id;
        render();
        const current = value(id);
        const scale = overlay?.getBoundingClientRect().width / 1920 || 1;
        drag = { id, x: current.x || 0, y: current.y || 0, px: event.clientX, py: event.clientY, scale, pointerId: event.pointerId };
        marker.setPointerCapture(event.pointerId);
        options.onSelect?.(id, current);
      }

      function moveDrag(event) {
        if (!drag) return;
        event.preventDefault();
        event.stopPropagation();
        apply(drag.id, {
          x: drag.x + (event.clientX - drag.px) / drag.scale,
          y: drag.y + (event.clientY - drag.py) / drag.scale
        }, true);
      }

      function stopDrag(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        event.preventDefault();
        event.stopPropagation();
        const id = drag.id;
        const marker = markers.get(id);
        drag = null;
        options.onCommit?.(value(id), id);
        if (marker?.hasPointerCapture(event.pointerId)) marker.releasePointerCapture(event.pointerId);
      }

      markers.forEach(marker => marker.addEventListener('pointermove', moveDrag));
      select.addEventListener('change', () => {
        render();
        options.onSelect?.(select.value, value(select.value));
      });
      root.refresh = render;
      render();
      return root;
    }
  };

  RTS.core.positionEditor = Editor;
})();
