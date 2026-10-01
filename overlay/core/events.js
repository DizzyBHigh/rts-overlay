(() => {
  const listeners = new Map();

  const Events = {
    on(name, callback) {
      const key = String(name || '').trim();
      if (!key || typeof callback !== 'function')
        throw new Error('Event name and callback are required.');

      const handlers = listeners.get(key) || [];
      handlers.push(callback);
      listeners.set(key, handlers);

      return () => Events.off(key, callback);
    },

    off(name, callback) {
      const key = String(name || '').trim();
      const handlers = listeners.get(key);
      if (!handlers) return;

      const remaining = handlers.filter(item => item !== callback);
      if (remaining.length) listeners.set(key, remaining);
      else listeners.delete(key);
    },

    emit(name, payload) {
      const handlers = listeners.get(String(name || '').trim()) || [];
      handlers.slice().forEach(handler => handler(payload));
    }
  };

  RTS.core.events = Events;
})();
