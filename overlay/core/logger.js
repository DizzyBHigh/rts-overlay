(() => {
  const listeners = [];
  const history = [];
  const limit = 500;

  function write(level, message, data) {
    const entry = {
      time: new Date().toISOString(),
      level,
      message: String(message || ''),
      data
    };
    history.push(entry);
    if (history.length > limit) history.shift();
    const method = console[level] || console.log;
    method.call(console, '[RTS]', entry.message, data ?? '');
    listeners.slice().forEach(listener => listener(entry));
  }

  RTS.core.log = {
    debug: (message, data) => write('debug', message, data),
    info: (message, data) => write('info', message, data),
    warn: (message, data) => write('warn', message, data),
    error: (message, data) => write('error', message, data),
    on: listener => {
      if (typeof listener === 'function') listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      };
    },
    history: () => history.slice(),
    clear: () => history.splice(0, history.length)
  };
})();
