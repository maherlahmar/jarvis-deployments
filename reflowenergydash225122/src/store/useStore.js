import { create } from 'zustand';
import {
  loadCSVData,
  processOvenData,
  calculateEnergyMetrics,
  calculateHourlyMetrics,
  calculateDailyMetrics,
  getZoneAnalysis,
  generateAlerts,
  generateRecommendations,
  aggregateForChart,
} from '../services/dataProcessor';

const useStore = create((set, get) => ({
  // Data state
  rawData: [],
  processedData: [],
  isLoading: false,
  hasData: false,
  error: null,
  lastUpdated: null,
  fileName: null,

  // Metrics
  energyMetrics: null,
  hourlyMetrics: [],
  dailyMetrics: [],
  zoneAnalysis: [],
  alerts: [],
  recommendations: [],
  chartData: [],

  // Filters
  dateRange: {
    start: null,
    end: null,
  },
  selectedZone: null,
  viewMode: 'dashboard', // dashboard, zones, alerts, trends

  // UI state
  sidebarOpen: true,
  activeTab: 'overview',
  dismissedAlerts: [],

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedZone: (zone) => set({ selectedZone: zone }),

  dismissAlert: (alertId) => set((state) => ({
    dismissedAlerts: [...state.dismissedAlerts, alertId],
  })),

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } });
    get().recalculateMetrics();
  },

  // Load data from uploaded CSV text
  loadDataFromCSV: async (csvText, fileName = 'uploaded.csv') => {
    set({ isLoading: true, error: null });
    try {
      const rawData = await loadCSVData(csvText);

      if (!rawData || rawData.length === 0) {
        throw new Error('No data found in CSV file');
      }

      const processedData = processOvenData(rawData);

      // Set date range to full data range
      const dates = processedData.map(d => d.timestamp);
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      set({
        rawData,
        processedData,
        dateRange: { start: minDate, end: maxDate },
        lastUpdated: new Date(),
        hasData: true,
        fileName,
      });

      get().recalculateMetrics();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ error: error.message, isLoading: false, hasData: false });
    }
  },

  // Clear data and return to upload screen
  clearData: () => {
    set({
      rawData: [],
      processedData: [],
      hasData: false,
      error: null,
      lastUpdated: null,
      fileName: null,
      energyMetrics: null,
      hourlyMetrics: [],
      dailyMetrics: [],
      zoneAnalysis: [],
      alerts: [],
      recommendations: [],
      chartData: [],
      dateRange: { start: null, end: null },
      dismissedAlerts: [],
      activeTab: 'overview',
    });
  },

  recalculateMetrics: () => {
    const { processedData, dateRange } = get();
    if (!processedData || processedData.length === 0) return;

    // Filter by date range
    let filteredData = processedData;
    if (dateRange.start && dateRange.end) {
      filteredData = processedData.filter(d =>
        d.timestamp >= dateRange.start && d.timestamp <= dateRange.end
      );
    }

    const energyMetrics = calculateEnergyMetrics(filteredData);
    const hourlyMetrics = calculateHourlyMetrics(filteredData);
    const dailyMetrics = calculateDailyMetrics(filteredData);
    const zoneAnalysis = getZoneAnalysis(filteredData);
    const alerts = generateAlerts(filteredData, energyMetrics);
    const recommendations = generateRecommendations(energyMetrics, zoneAnalysis, alerts);
    const chartData = aggregateForChart(filteredData, 'hour');

    set({
      energyMetrics,
      hourlyMetrics,
      dailyMetrics,
      zoneAnalysis,
      alerts,
      recommendations,
      chartData,
    });
  },

  getFilteredAlerts: () => {
    const { alerts, dismissedAlerts } = get();
    return alerts.filter(a => !dismissedAlerts.includes(a.id));
  },

  getActiveAlertCount: () => {
    return get().getFilteredAlerts().length;
  },

  getHighPriorityAlerts: () => {
    return get().getFilteredAlerts().filter(a => a.priority === 'high');
  },
}));

export default useStore;
