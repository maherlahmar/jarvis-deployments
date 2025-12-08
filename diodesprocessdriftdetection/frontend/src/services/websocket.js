import { getMockInitData, startMockSimulation, stopMockSimulation } from './mockData';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.listeners = new Map();
    this.useMock = false;
    this.mockCallbacks = null;
  }

  connect(callbacks = {}) {
    this.mockCallbacks = callbacks;

    // Auto-detect protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('Connecting to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.useMock = false;
        if (callbacks.onConnect) callbacks.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data, callbacks);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code);
        if (callbacks.onDisconnect) callbacks.onDisconnect();

        if (event.code !== 1000) {
          this.attemptReconnect(callbacks);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.switchToMock(callbacks);
      };

      // Timeout for connection
      setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout, switching to mock');
          this.switchToMock(callbacks);
        }
      }, 5000);

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.switchToMock(callbacks);
    }
  }

  switchToMock(callbacks) {
    if (this.useMock) return;

    this.useMock = true;
    console.log('Switching to mock data simulation');

    // Send mock init data
    const initData = getMockInitData();
    if (callbacks.onInit) {
      callbacks.onInit(initData);
    }
    if (callbacks.onConnect) {
      callbacks.onConnect();
    }

    // Start mock simulation
    startMockSimulation({
      onReading: (reading) => {
        if (callbacks.onReading) callbacks.onReading(reading);
      },
      onAlert: (alert) => {
        if (callbacks.onAlert) callbacks.onAlert(alert);
      }
    });
  }

  handleMessage(data, callbacks) {
    switch (data.type) {
      case 'INIT':
        if (callbacks.onInit) callbacks.onInit(data.data);
        break;

      case 'READING':
        if (callbacks.onReading) callbacks.onReading(data.data);
        break;

      case 'NEW_ALERT':
        if (callbacks.onAlert) callbacks.onAlert(data.data);
        break;

      case 'ALERT_UPDATED':
        if (callbacks.onAlertUpdated) callbacks.onAlertUpdated(data.data);
        break;

      case 'HISTORY':
        if (callbacks.onHistory) callbacks.onHistory(data.data);
        break;

      case 'ALERTS':
        if (callbacks.onAlerts) callbacks.onAlerts(data.data);
        break;

      case 'BATCHES':
        if (callbacks.onBatches) callbacks.onBatches(data.data);
        break;

      case 'PARAMETER_HISTORY':
        if (callbacks.onParameterHistory) {
          callbacks.onParameterHistory(data.parameter, data.data);
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }

    // Notify all generic listeners
    this.listeners.forEach((callback) => callback(data));
  }

  attemptReconnect(callbacks) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, switching to mock');
      this.switchToMock(callbacks);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.useMock) {
        this.connect(callbacks);
      }
    }, delay);
  }

  send(type, data = {}) {
    if (this.useMock) {
      console.log('Mock mode: ignoring send', type);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  requestHistory(count = 100) {
    this.send('GET_HISTORY', { count });
  }

  requestAlerts() {
    this.send('GET_ALERTS');
  }

  requestBatches() {
    this.send('GET_BATCHES');
  }

  requestParameterHistory(parameter) {
    this.send('GET_PARAMETER_HISTORY', { parameter });
  }

  acknowledgeAlert(alertId) {
    this.send('ACKNOWLEDGE_ALERT', { alertId });
  }

  subscribe(callback) {
    const id = Date.now() + Math.random();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  disconnect() {
    this.maxReconnectAttempts = 0;

    if (this.useMock) {
      stopMockSimulation();
    }

    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }
  }

  isConnected() {
    return this.useMock || (this.ws?.readyState === WebSocket.OPEN);
  }

  isMockMode() {
    return this.useMock;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
