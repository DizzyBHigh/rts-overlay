(() => {
  const Loader = {
    manifests: {},
    sources: {},

    registerManifest(manifest) {
      if (!manifest || !manifest.id)
        throw new Error('Extension manifest requires an id.');
      if (Loader.manifests[manifest.id])
        throw new Error('Extension manifest already registered: ' +
          manifest.id);
      Loader.manifests[manifest.id] = manifest;
      return manifest;
    },

    registerSource(id, source) {
      if (!id || !source)
        throw new Error('Extension source requires an id and source.');
      if (Loader.sources[id])
        throw new Error('Extension source already registered: ' + id);
      Loader.sources[id] = source;
      return source;
    },

    loadPublished(manifest, baseUrl = '', options = {}) {
      Loader.registerManifest(manifest);
      const base = String(baseUrl || '').replace(/\\/$/, '');
      const css = manifest.resources?.css || [];
      css.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = base + '/' + src;
        document.head.appendChild(link);
      });

      const scripts = manifest.resources?.js || [];
      return scripts.reduce((promise, src) => promise.then(() =>
        Loader.loadResource(base + '/' + src)
      ), Promise.resolve()).then(() => Loader.load(manifest.id, options));
    },

    loadResource(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          try {
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        script.onerror = () =>
          reject(new Error('Failed to load extension resource: ' + src));
        document.head.appendChild(script);
      });
    },

    load(id, options = {}) {
      const manifest = Loader.manifests[id];
      const source = Loader.sources[id];
      if (!manifest) throw new Error('Extension manifest not found: ' + id);
      if (!source) throw new Error('Extension source not found: ' + id);

      const extension = RTS.registerExtension(id);
      extension.manifest = manifest;
      extension.options = options;
      if (typeof source.init === 'function')
        source.init(extension, options);
      return extension;
    },

    applyConfiguration(configuration = {}) {
      const values = configuration.extensions || {};
      Object.keys(RTS.extensions).forEach(id => {
        const extension = RTS.extensions[id];
        if (typeof extension.configure === 'function')
          extension.configure(values[id] || {});
      });
    },

    getManifest(id) {
      return Loader.manifests[id] || null;
    },

    getSource(id) {
      return Loader.sources[id] || null;
    }
  };

  window.RTS.core.extensions = Loader;
})();
