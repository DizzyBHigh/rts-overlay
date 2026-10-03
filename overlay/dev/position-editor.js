(() => {
  const Editor = {
    mount(host, options = {}) {
      const root = document.createElement('section');
      root.className = 'rts-position-editor';
      root.tabIndex = -1;
      root.appendChild(RTS.core.ui.title(options.title || 'Position Editor'));
      const select = document.createElement('select');
      const overlay = document.getElementById('rts-overlay');
      const targets = options.targets || [];
      const markers = new Map();
      const selected = new Set();
      let visible = true;
      let drag = null;
      let resize = null;
      targets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = target.label || target.id;
        select.appendChild(option);
      });
      if (select.value) selected.add(select.value);
      const target = id => targets.find(item => item.id === id);
      const value = id => target(id)?.get?.() || {};
      const position = RTS.core.ui.positionEditor({
        fields: ['x', 'y'], value: {}, inline: true,
        onChange: value => applySelected({ x: value.x, y: value.y })
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
      const selectAll = RTS.core.ui.button('Select All', {
        variant: 'blue',
        onClick: () => {
          targets.forEach(item => selected.add(item.id));
          if (!selected.has(select.value) && targets[0]) select.value = targets[0].id;
          render();
          options.onSelect?.(select.value, value(select.value));
        }
      });
      const toggle = RTS.core.ui.button('Hide Positions', {
        onClick: () => {
          visible = !visible;
          render();
          toggle.textContent = visible ? 'Hide Positions' : 'Show Positions';
        }
      });
      const save = options.onSave
        ? RTS.core.ui.button('Save Layout', { onClick: () => options.onSave?.() })
        : null;
      const saveStatus = document.createElement('span');
      saveStatus.className = 'rts-position-save-status';
      root.append(select, selectAll, positionRow, scaleRow, toggle);
      if (save) root.append(save, saveStatus);
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
      function setSelection(id, additive) {
        if (additive) {
          if (selected.has(id) && selected.size > 1) selected.delete(id);
          else selected.add(id);
        } else if (!selected.has(id)) {
          selected.clear();
          selected.add(id);
        }
        if (!selected.size) selected.add(id);
        select.value = id;
        render();
      }
      function apply(id, patch, transient = false) {
        const item = target(id);
        if (!item?.set) return;
        item.set(patch, { transient });
        options.onChange?.(item.get?.(), id);
        render(id, patch);
      }
      function applySelected(patch, transient = false) {
        [...selected].forEach(id => apply(id, patch, transient));
      }
      function render(overrideId, override = {}) {
        const primary = select.value;
        targets.forEach(item => {
          const marker = markers.get(item.id);
          const current = item.id === overrideId
            ? { ...value(item.id), ...override }
            : value(item.id);
          if (!marker) return;
          marker.hidden = !visible;
          marker.style.zIndex = visible ? '2147483647' : '';
          marker.dataset.target = item.label || item.id;
          marker.classList.toggle('is-selected', selected.has(item.id));
          marker.classList.toggle('is-primary', item.id === primary);
          marker.style.left = (current.x || 0) + 'px';
          marker.style.top = (current.y || 0) + 'px';
          marker.style.width = Math.max(1, current.width || 1) + 'px';
          marker.style.height = Math.max(1, current.height || 1) + 'px';
        });
        const current = value(primary);
        position.setValue({ x: current.x || 0, y: current.y || 0 });
        ratio.setValue({ width: current.width || 1, height: current.height || 1 });
      }
      function pointerScale() {
        return overlay?.getBoundingClientRect().width / 1920 || 1;
      }
      function startDrag(event, id, marker) {
        if (event.button !== 0 || event.target !== marker) return;
        event.preventDefault(); event.stopPropagation();
        setSelection(id, event.ctrlKey || event.metaKey);
        root.focus({ preventScroll: true });
        const items = [...selected].map(itemId => {
          const current = value(itemId);
          return { id: itemId, x: current.x || 0, y: current.y || 0 };
        });
        drag = { items, px: event.clientX, py: event.clientY, scale: pointerScale(), pointerId: event.pointerId, marker };
        marker.setPointerCapture(event.pointerId);
        options.onSelect?.(id, value(id));
      }
      function moveDrag(event) {
        if (!drag) return;
        event.preventDefault(); event.stopPropagation();
        const dx = (event.clientX - drag.px) / drag.scale;
        const dy = (event.clientY - drag.py) / drag.scale;
        drag.items.forEach(item => apply(item.id, { x: item.x + dx, y: item.y + dy }, true));
      }
      function stopDrag(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        event.preventDefault(); event.stopPropagation();
        const items = drag.items; const marker = drag.marker; drag = null;
        items.forEach(item => options.onCommit?.(value(item.id), item.id));
        if (marker?.hasPointerCapture(event.pointerId)) marker.releasePointerCapture(event.pointerId);
      }
      function startResize(event, id, corner, handle) {
        if (event.button !== 0) return;
        event.preventDefault(); event.stopPropagation();
        setSelection(id, false);
        root.focus({ preventScroll: true });
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
      function moveSelected(dx, dy) {
        if (!selected.size) return;
        [...selected].forEach(id => {
          const current = value(id);
          apply(id, { x: (current.x || 0) + dx, y: (current.y || 0) + dy }, true);
        });
        [...selected].forEach(id => options.onCommit?.(value(id), id));
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
      root.addEventListener('keydown', event => {
        if (['INPUT', 'SELECT', 'BUTTON'].includes(document.activeElement?.tagName)) return;
        const steps = event.shiftKey ? 10 : 1;
        const moves = {
          ArrowLeft: [-steps, 0], ArrowRight: [steps, 0],
          ArrowUp: [0, -steps], ArrowDown: [0, steps]
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault(); event.stopPropagation();
        moveSelected(move[0], move[1]);
      });
      select.addEventListener('change', () => {
        selected.clear();
        selected.add(select.value);
        render(); options.onSelect?.(select.value, value(select.value));
      });
      root.refresh = render;
      root.setSaveStatus = text => {
        saveStatus.textContent = text || '';
      };
      render();
      return root;
    }
  };
  RTS.core.positionEditor = Editor;
})();
