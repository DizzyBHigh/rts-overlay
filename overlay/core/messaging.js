(() => {
  const queues = new Map();

  const Engine = {
    create(name, options = {}) {
      const id = String(name || '').trim();
      if (!id) throw new Error('Message queue id is required.');
      if (queues.has(id)) return queues.get(id);

      let active = false;
      const items = [];
      const queue = {
        id,

        enqueue(message) {
          if (message == null) return;
          items.push(message);
          process();
        },

        next() {
          if (active || !items.length) return null;
          active = true;
          const message = items.shift();
          const finish = () => {
            active = false;
            options.finished?.(message);
            process();
          };
          options.present?.(message, finish);
          return message;
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

        finish() {
          if (!active) return;
          active = false;
          process();
        }
      };

      function process() {
        if (!active && items.length) queue.next();
      }

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
      queues.delete(queue.id);
    }
  };

  RTS.core.messaging = Engine;
  window.RTSMessagingEngine = Engine;
})();
