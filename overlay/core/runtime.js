(() => {
  const RTS = window.RTS || {
    version: 1,
    core: {},
    extensions: {}
  };

  RTS.version = RTS.version || 1;
  RTS.core = RTS.core || {};
  RTS.extensions = RTS.extensions || {};

  RTS.registerExtension = id => {
    if (!id || typeof id !== 'string')
      throw new Error('Extension id is required.');

    if (RTS.extensions[id])
      throw new Error('Extension already registered: ' + id);

    const extension = {
      id,
      state: {},
      api: {}
    };

    RTS.extensions[id] = extension;
    return extension;
  };

  RTS.getExtension = id => RTS.extensions[id] || null;

  RTS.hasExtension = id =>
    Object.prototype.hasOwnProperty.call(RTS.extensions, id);

  window.RTS = RTS;
})();
