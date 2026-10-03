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

  RTSOverlaySocket.onEvent = callback => RTSOverlaySocket.listeners.push(callback);

  RTSOverlaySocket.onConnect = callback => {
    if (typeof callback !== 'function') return;
    RTSOverlaySocket.connectListeners.push(callback);
    if (RTSOverlaySocket.socket?.readyState === WebSocket.OPEN) callback();
  };

  RTSOverlaySocket.connect = () => {
    clearTimeout(RTSOverlaySocket.reconnectTimer);
    RTS.core.log?.info('WebSocket connecting', { host: RTSOverlaySocket.host, port: RTSOverlaySocket.port });

    RTSOverlaySocket.socket =
      new WebSocket(`ws://${RTSOverlaySocket.host}:${RTSOverlaySocket.port}/`);

    RTSOverlaySocket.socket.onopen = () => {
      RTSOverlaySocket.setStatus('Connected', 'connected');
      RTS.core.log?.info('WebSocket connected');
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
        RTS.core.log?.info('WebSocket message received', message);
        RTSOverlaySocket.listeners.forEach(listener => listener(message));
      } catch (error) {
        RTS.core.log?.error('Invalid WebSocket message', error?.message || error);
        console.warn('RTS Overlay: invalid WebSocket message', error);
      }
    };

    RTSOverlaySocket.socket.onerror = () => {
      RTS.core.log?.error('WebSocket connection error');
      RTSOverlaySocket.setStatus('Connection error', 'error');
    };

    RTSOverlaySocket.socket.onclose = () => {
      RTS.core.log?.warn('WebSocket disconnected');
      RTSOverlaySocket.setStatus('Disconnected', 'error');
      RTSOverlaySocket.reconnectTimer =
        setTimeout(RTSOverlaySocket.connect, RTSOverlaySocket.reconnectDelay);
    };
  };

  RTSOverlaySocket.requestConfiguration = () => RTSOverlaySocket.doAction('get');
  RTSOverlaySocket.saveConfiguration = configuration => RTSOverlaySocket.doAction('save', configuration);

  RTSOverlaySocket.requestAction = (action, args = {}) => {
    if (!RTSOverlaySocket.socket || RTSOverlaySocket.socket.readyState !== WebSocket.OPEN) {
      RTS.core.log?.warn('Cannot request action while WebSocket is disconnected', action);
      return false;
    }

    RTS.core.log?.info('Requesting Streamer.bot action', { action, args });
    RTSOverlaySocket.socket.send(JSON.stringify({
      request: 'DoAction',
      id: `rts-overlay-action-${Date.now()}`,
      action: { name: action },
      args
    }));
    return true;
  };

  RTSOverlaySocket.doAction = (operation, configuration) => {
    if (!RTSOverlaySocket.socket || RTSOverlaySocket.socket.readyState !== WebSocket.OPEN) {
      RTS.core.log?.warn('Cannot request overlay sync while WebSocket is disconnected', operation);
      return false;
    }

    const args = { rtsOverlayOperation: operation };
    if (configuration) args.rtsOverlayConfiguration = JSON.stringify(configuration);
    RTS.core.log?.info('Requesting overlay sync', { operation });
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
