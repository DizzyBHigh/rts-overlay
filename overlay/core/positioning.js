(() => {
  const Engine = {
    referenceWidth: 1920,
    referenceHeight: 1080,

    number(value, fallback) {
      const result = Number(value);
      return Number.isFinite(result) ? result : fallback;
    },

    normalise(position = {}) {
      const scale = this.number(position.scale, 100);
      return {
        x: this.number(position.x, 0),
        y: this.number(position.y, 0),
        z: this.number(position.z, 0),
        scaleX: this.number(position.scaleX, scale),
        scaleY: this.number(position.scaleY, scale),
        rotateX: this.number(position.rotateX, 0),
        rotateY: this.number(position.rotateY, 0),
        rotateZ: this.number(position.rotateZ, 0),
        fov: Math.max(30, Math.min(120, this.number(position.fov, 90)))
      };
    },

    resolve(positions, name, fallback = {}) {
      const target = String(name || '').trim().toLowerCase();
      const keys = Object.keys(positions || {});
      const key = keys.find(item =>
        item.toLowerCase() === target ||
        String(positions[item]?.tag || '').trim().toLowerCase() === target
      );
      return key ? positions[key] : fallback;
    },

    transform(element, position) {
      const p = this.normalise(position);
      const canvas = element?.offsetParent ||
        document.getElementById('rts-overlay') || document.body;
      const width = Math.max(1, canvas.clientWidth || this.referenceWidth);
      const height = Math.max(1, canvas.clientHeight || this.referenceHeight);
      const x = p.x / 100 * width;
      const y = -p.y / 100 * height;

      return `perspective(960px) translate3d(${x}px, ${y}px, ${p.z}px) ` +
        `rotateZ(${-p.rotateZ}deg) rotateY(${p.rotateY}deg) ` +
        `rotateX(${-p.rotateX}deg) scale3d(${p.scaleX / 100}, ${p.scaleY / 100}, 1)`;
    },

    apply(element, position) {
      if (!element) return null;
      const canvas = element.offsetParent ||
        document.getElementById('rts-overlay') || document.body;
      const width = Math.max(1, canvas.clientWidth || this.referenceWidth);
      const height = Math.max(1, canvas.clientHeight || this.referenceHeight);
      const elementWidth = Math.max(0, element.offsetWidth || 0);
      const elementHeight = Math.max(0, element.offsetHeight || 0);

      element.style.left = `${(width - elementWidth) / 2}px`;
      element.style.top = `${(height - elementHeight) / 2}px`;
      element.style.transform = this.transform(element, position);
      return element.style.transform;
    }
  };

  RTS.core.positioning = Engine;
  window.RTSPositioningEngine = Engine;
})();