(() => {
  const params = new URLSearchParams(window.location.search);

  const RTSOverlaySocket = {
    host: params.get('host') || '127.0.0.1',
    port: Number(params.get('port')) || 8080,
    socket: null,
    reconnectTimer: null,
    reconnectDelay: 3000,
    listeners: [],
    connectListeners: []
  };

  RTSOverlaySocket.onEvent = callback => {
    RTSOverlaySocket.listeners.push(callback);
  };

  RTSOverlaySocket.onConnect = callback => {
    if (typeof callback !== 'function') return;
    RTSOverlaySocket.connectListeners.push(callback);
    if (RTSOverlaySocket.socket?.readyState === WebSocket.OPEN)
      callback();
  };

  RTSOverlaySocket.connect = () => {
    clearTimeout(RTSOverlaySocket.reconnectTimer);

    RTSOverlaySocket.socket =
      new WebSocket(`ws://${RTSOverlaySocket.host}:${RTSOverlaySocket.port}/`);

    RTSOverlaySocket.socket.onopen = () => {
      RTSOverlaySocket.setStatus('Connected', 'connected');
      RTSOverlaySocket.socket.send(JSON.stringify({
        request: 'Subscribe',
        id: 'rts-overlay',
        events: { Custom: ['Event'] }
      }));
      RTSOverlaySocket.connectListeners.forEach(listener => listener());
    };

    RTSOverlaySocket.socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        RTSOverlaySocket.listeners.forEach(listener => listener(message));
      } catch (error) {
        console.warn('RTS Overlay: invalid WebSocket message', error);
      }
    };

    RTSOverlaySocket.socket.onerror = () =>
      RTSOverlaySocket.setStatus('Connection error', 'error');

    RTSOverlaySocket.socket.onclose = () => {
      RTSOverlaySocket.setStatus('Disconnected', 'error');
      RTSOverlaySocket.reconnectTimer =
        setTimeout(RTSOverlaySocket.connect, RTSOverlaySocket.reconnectDelay);
    };
  };

  RTSOverlaySocket.requestConfiguration = () =>
    RTSOverlaySocket.doAction('get');

  RTSOverlaySocket.saveConfiguration = configuration =>
    RTSOverlaySocket.doAction('save', configuration);

  RTSOverlaySocket.requestAction = (action, args = {}) => {
    if (!RTSOverlaySocket.socket ||
        RTSOverlaySocket.socket.readyState !== WebSocket.OPEN)
      return false;

    RTSOverlaySocket.socket.send(JSON.stringify({
      request: 'DoAction',
      id: `rts-overlay-action-${Date.now()}`,
      action: { name: action },
      args
    }));

    return true;
  };

  RTSOverlaySocket.doAction = (operation, configuration) => {
    if (!RTSOverlaySocket.socket ||
        RTSOverlaySocket.socket.readyState !== WebSocket.OPEN)
      return false;

    const args = { rtsOverlayOperation: operation };

    if (configuration)
      args.rtsOverlayConfiguration = JSON.stringify(configuration);

    RTSOverlaySocket.socket.send(JSON.stringify({
      request: 'DoAction',
      id: `rts-overlay-${operation}-${Date.now()}`,
      action: { name: 'RTS - Overlay - Sync' },
      args
    }));
    return true;
  };

  RTSOverlaySocket.setStatus = (text, state = '') => {
    const element = document.getElementById('status');
    if (!element) return;
    element.textContent = text;
    element.className = state;
  };

  window.RTSOverlaySocket = RTSOverlaySocket;
})();
