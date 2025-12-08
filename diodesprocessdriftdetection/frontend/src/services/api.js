import {
  getMockInitData,
  getMockStatistics,
  getMockSpcSummary,
  getMockDriftStatus,
  getMockReadings,
  getMockBatches,
  getMockAlerts
} from './mockData';

const API_BASE = '/api';

let useMockData = false;

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) {
      if (response.status >= 502 && response.status <= 504) {
        console.warn(`Backend not ready (${response.status}), switching to mock data`);
        useMockData = true;
        throw new Error(`Backend starting up (${response.status})`);
      }
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Health check
  health: async () => {
    if (useMockData) return { status: 'ok', mock: true };
    try {
      return await fetchApi('/health');
    } catch {
      useMockData = true;
      return { status: 'ok', mock: true };
    }
  },

  // Parameters
  getParameters: async () => {
    if (useMockData) {
      const { parameters } = getMockInitData();
      return { success: true, data: parameters, mock: true };
    }
    try {
      return await fetchApi('/parameters');
    } catch {
      useMockData = true;
      const { parameters } = getMockInitData();
      return { success: true, data: parameters, mock: true };
    }
  },

  // Readings
  getReadings: async (count = 100) => {
    if (useMockData) {
      return { success: true, data: getMockReadings(count), mock: true };
    }
    try {
      return await fetchApi(`/readings?count=${count}`);
    } catch {
      useMockData = true;
      return { success: true, data: getMockReadings(count), mock: true };
    }
  },

  getParameterReadings: async (parameter, count = 100) => {
    if (useMockData) {
      const readings = getMockReadings(count);
      const data = readings.map(r => ({
        timestamp: r.timestamp,
        value: r.parameters[parameter],
        line: r.line,
        spc: r.spcResults?.[parameter]
      }));
      return { success: true, data, mock: true };
    }
    try {
      return await fetchApi(`/readings/${parameter}?count=${count}`);
    } catch {
      useMockData = true;
      const readings = getMockReadings(count);
      const data = readings.map(r => ({
        timestamp: r.timestamp,
        value: r.parameters[parameter],
        line: r.line,
        spc: r.spcResults?.[parameter]
      }));
      return { success: true, data, mock: true };
    }
  },

  // Alerts
  getAlerts: async (count = 50, unacknowledgedOnly = false) => {
    if (useMockData) {
      let alerts = getMockAlerts();
      if (unacknowledgedOnly) {
        alerts = alerts.filter(a => !a.acknowledged);
      }
      return { success: true, data: alerts.slice(0, count), mock: true };
    }
    try {
      const params = new URLSearchParams({ count: count.toString() });
      if (unacknowledgedOnly) params.append('unacknowledged', 'true');
      return await fetchApi(`/alerts?${params}`);
    } catch {
      useMockData = true;
      let alerts = getMockAlerts();
      if (unacknowledgedOnly) {
        alerts = alerts.filter(a => !a.acknowledged);
      }
      return { success: true, data: alerts.slice(0, count), mock: true };
    }
  },

  acknowledgeAlert: async (id) => {
    if (useMockData) {
      return { success: true, mock: true };
    }
    try {
      return await fetchApi(`/alerts/${id}/acknowledge`, { method: 'POST' });
    } catch {
      return { success: true, mock: true };
    }
  },

  // Batches
  getBatches: async () => {
    if (useMockData) {
      return { success: true, data: getMockBatches(), mock: true };
    }
    try {
      return await fetchApi('/batches');
    } catch {
      useMockData = true;
      return { success: true, data: getMockBatches(), mock: true };
    }
  },

  getBatch: async (id) => {
    if (useMockData) {
      const batches = getMockBatches();
      const batch = batches.find(b => b.id === id);
      return { success: true, data: batch, mock: true };
    }
    try {
      return await fetchApi(`/batches/${id}`);
    } catch {
      useMockData = true;
      const batches = getMockBatches();
      const batch = batches.find(b => b.id === id);
      return { success: true, data: batch, mock: true };
    }
  },

  // SPC Summary
  getSpcSummary: async () => {
    if (useMockData) {
      return { success: true, data: getMockSpcSummary(), mock: true };
    }
    try {
      return await fetchApi('/spc/summary');
    } catch {
      useMockData = true;
      return { success: true, data: getMockSpcSummary(), mock: true };
    }
  },

  // Drift Status
  getDriftStatus: async () => {
    if (useMockData) {
      return { success: true, data: getMockDriftStatus(), mock: true };
    }
    try {
      return await fetchApi('/drift/status');
    } catch {
      useMockData = true;
      return { success: true, data: getMockDriftStatus(), mock: true };
    }
  },

  // Statistics
  getStatistics: async () => {
    if (useMockData) {
      return { success: true, data: getMockStatistics(), mock: true };
    }
    try {
      return await fetchApi('/statistics');
    } catch {
      useMockData = true;
      return { success: true, data: getMockStatistics(), mock: true };
    }
  }
};

export function isUsingMockData() {
  return useMockData;
}

export function setUseMockData(value) {
  useMockData = value;
}

export default api;
