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
      let resize = null;
      targets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = target.label || target.id;
        select.appendChild(option);
      });
      const target = id => targets.find(item => item.id === id);
      const value = id => target(id)?.get?.() || {};
      const position = RTS.core.ui.positionEditor({
        fields: ['x', 'y'], value: {}, inline: true,
        onChange: value => apply(select.value, { x: value.x, y: value.y })
      });
      const ratio = RTS.core.ui.aspectRatio({
        width: 1, height: 1, locked: true, labels: ['x', 'y'],
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
        ['nw', 'ne', 'sw', 'se'].forEach(corner => {
          const handle = document.createElement('span');
          handle.className = 'rts-position-resize rts-position-resize--' + corner;
          handle.dataset.corner = corner;
          handle.addEventListener('pointerdown', event => startResize(event, target.id, corner, handle));
          marker.appendChild(handle);
        });
        marker.addEventListener('pointerdown', event => startDrag(event, target.id, marker));
        marker.addEventListener('pointerup', stopDrag);
        marker.addEventListener('pointercancel', stopDrag);
        marker.addEventListener('contextmenu', event => event.preventDefault());
        markers.set(target.id, marker);
        if (overlay) overlay.appendChild(marker);
      });
      function apply(id, patch, transient = false) {
        const item = target(id);
        if (!item?.set) return;
        item.set(patch, { transient });
        options.onChange?.(item.get?.(), id);
        render(id, patch);
      }
      function render(overrideId, override = {}) {
        const selected = select.value;
        targets.forEach(item => {
          const marker = markers.get(item.id);
          const current = item.id === overrideId
            ? { ...value(item.id), ...override }
            : value(item.id);
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
        ratio.setValue({ width: current.width || 1, height: current.height || 1 });
      }
      function pointerScale() {
        return overlay?.getBoundingClientRect().width / 1920 || 1;
      }
      function startDrag(event, id, marker) {
        if (event.button !== 0 || event.target !== marker) return;
        event.preventDefault(); event.stopPropagation(); select.value = id; render();
        const current = value(id);
        drag = { id, x: current.x || 0, y: current.y || 0, px: event.clientX, py: event.clientY, scale: pointerScale(), pointerId: event.pointerId };
        marker.setPointerCapture(event.pointerId); options.onSelect?.(id, current);
      }
      function moveDrag(event) {
        if (!drag) return;
        event.preventDefault(); event.stopPropagation();
        apply(drag.id, { x: drag.x + (event.clientX - drag.px) / drag.scale, y: drag.y + (event.clientY - drag.py) / drag.scale }, true);
      }
      function stopDrag(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        event.preventDefault(); event.stopPropagation();
        const id = drag.id; const marker = markers.get(id); drag = null;
        options.onCommit?.(value(id), id);
        if (marker?.hasPointerCapture(event.pointerId)) marker.releasePointerCapture(event.pointerId);
      }
      function startResize(event, id, corner, handle) {
        if (event.button !== 0) return;
        event.preventDefault(); event.stopPropagation(); select.value = id; render();
        const current = value(id);
        resize = { id, corner, x: current.x || 0, y: current.y || 0, width: Math.max(1, current.width || 1), height: Math.max(1, current.height || 1), px: event.clientX, py: event.clientY, scale: pointerScale(), pointerId: event.pointerId, ratio: Math.max(0.0001, (current.width || 1) / (current.height || 1)) };
        handle.setPointerCapture(event.pointerId); options.onSelect?.(id, current);
      }
      function moveResize(event) {
        if (!resize) return;
        event.preventDefault(); event.stopPropagation();
        const dx = (event.clientX - resize.px) / resize.scale;
        const dy = (event.clientY - resize.py) / resize.scale;
        let { x, y, width, height } = resize;
        let nextWidth = width; let nextHeight = height;
        if (resize.corner.includes('e')) nextWidth = Math.max(20, width + dx);
        if (resize.corner.includes('w')) nextWidth = Math.max(20, width - dx);
        if (resize.corner.includes('s')) nextHeight = Math.max(20, height + dy);
        if (resize.corner.includes('n')) nextHeight = Math.max(20, height - dy);
        if (ratio.getValue().locked) {
          if (Math.abs(dx) >= Math.abs(dy)) nextHeight = Math.max(20, nextWidth / resize.ratio);
          else nextWidth = Math.max(20, nextHeight * resize.ratio);
        }
        if (resize.corner.includes('w')) x = resize.x + width - nextWidth;
        if (resize.corner.includes('n')) y = resize.y + height - nextHeight;
        apply(resize.id, { x, y, width: nextWidth, height: nextHeight }, true);
      }
      function stopResize(event) {
        if (!resize || event.pointerId !== resize.pointerId) return;
        event.preventDefault(); event.stopPropagation();
        const id = resize.id;
        const handle = markers.get(id)?.querySelector('.rts-position-resize[data-corner="' + resize.corner + '"]');
        resize = null; options.onCommit?.(value(id), id);
        if (handle?.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      }
      markers.forEach(marker => {
        marker.addEventListener('pointermove', moveDrag);
        marker.querySelectorAll('.rts-position-resize').forEach(handle => {
          handle.addEventListener('pointermove', moveResize);
          handle.addEventListener('pointerup', stopResize);
          handle.addEventListener('pointercancel', stopResize);
          handle.addEventListener('contextmenu', event => event.preventDefault());
        });
      });
      select.addEventListener('change', () => {
        render(); options.onSelect?.(select.value, value(select.value));
      });
      root.refresh = render;
      render();
      return root;
    }
  };
  RTS.core.positionEditor = Editor;
})();
