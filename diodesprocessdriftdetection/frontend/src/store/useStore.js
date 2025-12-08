import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Theme
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // Connection status
  connected: false,
  setConnected: (connected) => set({ connected }),

  // Process parameters configuration
  parameters: {},
  setParameters: (parameters) => set({ parameters }),

  // Manufacturing lines
  lines: [],
  setLines: (lines) => set({ lines }),

  // Real-time readings
  readings: [],
  addReading: (reading) => set((state) => {
    const newReadings = [...state.readings, reading];
    if (newReadings.length > 500) {
      return { readings: newReadings.slice(-500) };
    }
    return { readings: newReadings };
  }),
  setReadings: (readings) => set({ readings }),

  // Alerts
  alerts: [],
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 200)
  })),
  setAlerts: (alerts) => set({ alerts }),
  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? { ...a, acknowledged: true, acknowledgedAt: Date.now() } : a
    )
  })),
  unacknowledgedCount: () => get().alerts.filter(a => !a.acknowledged).length,

  // Batches
  batches: [],
  setBatches: (batches) => set({ batches }),

  // Drift analysis results
  driftResults: {},
  setDriftResults: (driftResults) => set({ driftResults }),

  // SPC summary
  spcSummary: {},
  setSpcSummary: (spcSummary) => set({ spcSummary }),

  // Selected filters
  selectedLine: 'all',
  setSelectedLine: (selectedLine) => set({ selectedLine }),
  selectedParameter: 'temperature',
  setSelectedParameter: (selectedParameter) => set({ selectedParameter }),
  timeRange: '1h',
  setTimeRange: (timeRange) => set({ timeRange }),

  // Statistics
  statistics: {
    totalReadings: 0,
    totalAlerts: 0,
    unacknowledgedAlerts: 0,
    activeBatches: 0,
    outOfSpecPercent: 0,
    avgYield: 0
  },
  setStatistics: (statistics) => set({ statistics }),

  // UI state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  activePage: 'dashboard',
  setActivePage: (activePage) => set({ activePage }),

  // Notification preferences
  notificationsEnabled: true,
  toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  // Get filtered readings
  getFilteredReadings: () => {
    const state = get();
    let filtered = state.readings;

    if (state.selectedLine !== 'all') {
      filtered = filtered.filter(r => r.line === state.selectedLine);
    }

    const now = Date.now();
    const timeRanges = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    const range = timeRanges[state.timeRange] || timeRanges['1h'];
    filtered = filtered.filter(r => now - r.timestamp < range);

    return filtered;
  },

  // Get latest reading for each parameter
  getLatestValues: () => {
    const readings = get().readings;
    if (readings.length === 0) return {};

    const latest = readings[readings.length - 1];
    return latest.parameters || {};
  },

  // Get parameter statistics
  getParameterStats: (paramName) => {
    const readings = get().getFilteredReadings();
    const values = readings.map(r => r.parameters?.[paramName]).filter(v => v !== undefined);

    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];

    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, min, max, stdDev, count: values.length };
  },

  // Get alert counts by severity
  getAlertCounts: () => {
    const alerts = get().alerts;
    return {
      critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
      warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length,
      info: alerts.filter(a => a.severity === 'info' && !a.acknowledged).length,
      total: alerts.filter(a => !a.acknowledged).length
    };
  }
}));

export default useStore;
