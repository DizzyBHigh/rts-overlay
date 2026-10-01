(() => {
  const panels = new Map();

  const Engine = {
    create(id, options = {}) {
      const key = String(id || '').trim();
      if (!key) throw new Error('Panel id is required.');
      if (panels.has(key)) return panels.get(key);

      const element = options.element || document.createElement('section');
      element.classList.add('rts-panel');
      element.dataset.panelId = key;
      element.setAttribute('aria-hidden', 'true');
      element.hidden = true;

      const parent = options.parent ||
        document.getElementById('rts-overlay') || document.body;
      parent.appendChild(element);

      const runner = RTS.core.animation.createRunner(
        element,
        options.positions || {}
      );

      const panel = {
        id: key,
        element,
        runner,
        options,

        configure(value = {}) {
          this.options = { ...this.options, ...value };
          if (value.positions)
            this.runner.configure(value.positions);
          return this;
        },

        setContent(content) {
          if (content instanceof Node) {
            this.element.replaceChildren(content);
          } else {
            this.element.innerHTML = String(content ?? '');
          }
          return this;
        },

        show(position) {
          this.element.hidden = false;
          this.element.setAttribute('aria-hidden', 'false');
          if (position) this.runner.apply(position);
          return this;
        },

        hide() {
          this.element.hidden = true;
          this.element.setAttribute('aria-hidden', 'true');
          return this;
        },

        destroy() {
          this.runner.cancel();
          this.element.remove();
          panels.delete(key);
        }
      };

      panels.set(key, panel);
      return panel;
    },

    get(id) {
      return panels.get(String(id || '').trim()) || null;
    },

    has(id) {
      return panels.has(String(id || '').trim());
    },

    remove(id) {
      const panel = this.get(id);
      if (panel) panel.destroy();
    },

    all() {
      return Array.from(panels.values());
    }
  };

  RTS.core.panels = Engine;
  window.RTSPanelEngine = Engine;
})();
