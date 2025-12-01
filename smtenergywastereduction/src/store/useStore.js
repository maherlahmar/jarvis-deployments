import { create } from 'zustand';
import {
  generateMockData,
  generateHourlyData,
  generateWasteAlerts,
  generateZoneEfficiency,
  generateEnergyBreakdown,
  generateProductionMetrics,
  generateWeeklyTrend,
  generateDashboardSummary,
  createRealtimeSimulator
} from '../services/mockData';

const useStore = create((set, get) => ({
  // Data state
  realtimeData: [],
  hourlyData: [],
  wasteAlerts: [],
  zoneEfficiency: [],
  energyBreakdown: [],
  productionMetrics: null,
  weeklyTrend: [],
  dashboardSummary: null,

  // UI state
  selectedTimeRange: '24h',
  selectedZone: null,
  sidebarOpen: true,
  currentPage: 'dashboard',
  isLoading: true,
  lastUpdated: null,

  // Filters
  alertFilter: 'all',
  severityFilter: 'all',

  // Simulator reference
  simulator: null,

  // Actions
  initializeData: () => {
    const hourlyData = generateHourlyData(24);
    const realtimeData = generateMockData(360);
    const wasteAlerts = generateWasteAlerts();
    const zoneEfficiency = generateZoneEfficiency();
    const energyBreakdown = generateEnergyBreakdown();
    const productionMetrics = generateProductionMetrics();
    const weeklyTrend = generateWeeklyTrend();
    const dashboardSummary = generateDashboardSummary();

    set({
      hourlyData,
      realtimeData,
      wasteAlerts,
      zoneEfficiency,
      energyBreakdown,
      productionMetrics,
      weeklyTrend,
      dashboardSummary,
      isLoading: false,
      lastUpdated: new Date()
    });
  },

  startRealtimeSimulation: () => {
    const { simulator } = get();
    if (simulator) return; // Already running

    const newSimulator = createRealtimeSimulator((dataPoint) => {
      set((state) => {
        const newRealtimeData = [...state.realtimeData.slice(-359), dataPoint];
        return {
          realtimeData: newRealtimeData,
          lastUpdated: new Date()
        };
      });
    }, 2000);

    set({ simulator: newSimulator });
  },

  stopRealtimeSimulation: () => {
    const { simulator } = get();
    if (simulator) {
      simulator.stop();
      set({ simulator: null });
    }
  },

  refreshData: () => {
    set({ isLoading: true });

    setTimeout(() => {
      const wasteAlerts = generateWasteAlerts();
      const zoneEfficiency = generateZoneEfficiency();
      const energyBreakdown = generateEnergyBreakdown();
      const productionMetrics = generateProductionMetrics();
      const dashboardSummary = generateDashboardSummary();

      set({
        wasteAlerts,
        zoneEfficiency,
        energyBreakdown,
        productionMetrics,
        dashboardSummary,
        isLoading: false,
        lastUpdated: new Date()
      });
    }, 500);
  },

  setTimeRange: (range) => {
    set({ selectedTimeRange: range, isLoading: true });

    setTimeout(() => {
      const hours = range === '1h' ? 1 : range === '6h' ? 6 : range === '24h' ? 24 : 168;
      const hourlyData = generateHourlyData(hours);

      set({
        hourlyData,
        isLoading: false
      });
    }, 300);
  },

  setSelectedZone: (zone) => set({ selectedZone: zone }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setCurrentPage: (page) => set({ currentPage: page }),

  setAlertFilter: (filter) => set({ alertFilter: filter }),

  setSeverityFilter: (filter) => set({ severityFilter: filter }),

  dismissAlert: (alertId) => {
    set((state) => ({
      wasteAlerts: state.wasteAlerts.filter((a) => a.id !== alertId)
    }));
  },

  // Computed values
  getFilteredAlerts: () => {
    const { wasteAlerts, alertFilter, severityFilter } = get();
    return wasteAlerts.filter((alert) => {
      if (alertFilter !== 'all' && alert.type !== alertFilter) return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      return true;
    });
  },

  getLatestReading: () => {
    const { realtimeData } = get();
    return realtimeData.length > 0 ? realtimeData[realtimeData.length - 1] : null;
  },

  getZoneStats: () => {
    const latest = get().getLatestReading();
    if (!latest) return [];

    return Object.entries(latest.zones).map(([id, zone]) => ({
      id,
      name: id.replace('zone', 'Zone '),
      ...zone
    }));
  },

  getTotalWastedEnergy: () => {
    const { wasteAlerts } = get();
    return wasteAlerts.reduce((sum, alert) => sum + parseFloat(alert.potentialSavings || 0), 0);
  }
}));

export default useStore;
