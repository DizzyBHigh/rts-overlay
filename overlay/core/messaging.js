(() => {
  const queues = new Map();

  const Engine = {
    create(name, options = {}) {
      const id = String(name || '').trim();
      if (!id) throw new Error('Message queue id is required.');
      if (queues.has(id)) return queues.get(id);

      let active = false;
      let current = null;
      const items = [];

      const finish = () => {
        if (!active) return;
        const message = current;
        current = null;
        active = false;
        options.finished?.(message);
        process();
      };

      const process = () => {
        if (active || !items.length) return;
        current = items.shift();
        active = true;
        if (typeof options.present === 'function') {
          options.present(current, finish);
        } else {
          finish();
        }
      };

      const queue = {
        id,

        enqueue(message) {
          if (message == null) return;
          items.push(message);
          process();
        },

        next() {
          process();
          return current;
        },

        clear() {
          items.length = 0;
        },

        size() {
          return items.length;
        },

        isActive() {
          return active;
        },

        finish
      };

      queues.set(id, queue);
      return queue;
    },

    get(name) {
      return queues.get(String(name || '').trim()) || null;
    },

    remove(name) {
      const queue = this.get(name);
      if (!queue) return;
      queue.clear();
      queue.finish();
      queues.delete(queue.id);
    }
  };

  RTS.core.messaging = Engine;
  window.RTSMessagingEngine = Engine;
})();
