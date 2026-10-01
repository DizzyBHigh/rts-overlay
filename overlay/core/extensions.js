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

    async loadManifest(url, options = {}) {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error('Failed to load extension manifest.');
      const manifest = await response.json();
      const base = url.substring(0, url.lastIndexOf('/'));
      return Loader.loadPublished(manifest, base, options);
    },

    loadPublished(manifest, baseUrl = '', options = {}) {
      Loader.registerManifest(manifest);
      const base = String(baseUrl || '').replace(/\/$/, '');
      const loadOptions = { ...options, baseUrl: base };
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
      ), Promise.resolve()).then(() => {
        const extension = Loader.load(manifest.id, loadOptions);
        if (!options.dev) return extension;
        const devScripts = manifest.resources?.dev?.js || [];
        return devScripts.reduce((promise, src) => promise.then(() =>
          Loader.loadResource(base + '/' + src)
        ), Promise.resolve()).then(() => extension);
      });
    },

    loadResource(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
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
