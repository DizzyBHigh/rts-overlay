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

      Loader.sources[id] = source;
      return source;
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
