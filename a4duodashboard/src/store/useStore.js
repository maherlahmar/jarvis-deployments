import { create } from 'zustand';
import {
  generateFurnaceStatus,
  generateComponentHealth,
  generateAlarmHistory,
  generateMaintenanceSchedule,
  generateThroughputData,
  generateOEEData,
  generateProcessHistory,
  calculateOverallHealth,
  generateMaintenanceRecommendations,
  generateTemperatureHistory,
  generateHealthTrend,
  FURNACE_CONFIG
} from '../services/syntheticData';

const useStore = create((set, get) => ({
  // Furnace configuration
  furnaceConfig: FURNACE_CONFIG,

  // Real-time status
  furnaceStatus: null,
  lastUpdate: null,

  // Component health
  componentHealth: [],
  overallHealth: null,

  // Alarms
  alarms: [],
  unacknowledgedCount: 0,

  // Maintenance
  maintenanceSchedule: [],
  recommendations: [],

  // Analytics
  throughputData: [],
  oeeData: [],
  processHistory: [],
  temperatureHistory: [],

  // UI State
  selectedReactor: 'all',
  selectedTimeRange: '24h',
  selectedComponent: null,
  sidebarCollapsed: false,
  activeTab: 'overview',

  // Loading states
  isLoading: false,
  error: null,

  // Actions
  setSelectedReactor: (reactor) => set({ selectedReactor: reactor }),
  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
  setSelectedComponent: (component) => set({ selectedComponent: component }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Data fetching actions
  fetchFurnaceStatus: () => {
    const status = generateFurnaceStatus();
    set({
      furnaceStatus: status,
      lastUpdate: new Date().toISOString()
    });
  },

  fetchComponentHealth: () => {
    const health = generateComponentHealth();
    const overall = calculateOverallHealth();
    set({
      componentHealth: health,
      overallHealth: overall
    });
  },

  fetchAlarms: () => {
    const alarms = generateAlarmHistory(7);
    const unacknowledged = alarms.filter(a => !a.acknowledged).length;
    set({
      alarms,
      unacknowledgedCount: unacknowledged
    });
  },

  fetchMaintenanceData: () => {
    const schedule = generateMaintenanceSchedule();
    const recommendations = generateMaintenanceRecommendations();
    set({
      maintenanceSchedule: schedule,
      recommendations
    });
  },

  fetchAnalytics: () => {
    const throughput = generateThroughputData(30);
    const oee = generateOEEData(30);
    const history = generateProcessHistory(50);
    const temps = generateTemperatureHistory(24);
    set({
      throughputData: throughput,
      oeeData: oee,
      processHistory: history,
      temperatureHistory: temps
    });
  },

  fetchHealthTrend: (componentId) => {
    return generateHealthTrend(componentId, 90);
  },

  acknowledgeAlarm: (alarmId) => {
    set((state) => ({
      alarms: state.alarms.map(a =>
        a.id === alarmId ? { ...a, acknowledged: true } : a
      ),
      unacknowledgedCount: state.unacknowledgedCount - 1
    }));
  },

  resolveAlarm: (alarmId) => {
    set((state) => ({
      alarms: state.alarms.map(a =>
        a.id === alarmId ? { ...a, resolved: true, acknowledged: true } : a
      )
    }));
  },

  // Initialize all data
  initializeData: async () => {
    set({ isLoading: true, error: null });
    try {
      const store = get();
      store.fetchFurnaceStatus();
      store.fetchComponentHealth();
      store.fetchAlarms();
      store.fetchMaintenanceData();
      store.fetchAnalytics();
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Refresh real-time data
  refreshRealTimeData: () => {
    const store = get();
    store.fetchFurnaceStatus();
  }
}));

export default useStore;
