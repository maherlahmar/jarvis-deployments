import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Data state
      rawData: null,
      processedData: null,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // UI state
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      sidebarOpen: true,
      activeTab: 'dashboard',

      // Filter state
      dateRange: { start: null, end: null },
      selectedZones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      alertFilter: 'all',

      // Notification state
      notifications: [],

      // Actions
      setRawData: (data) => set({ rawData: data }),

      setProcessedData: (data) => set({
        processedData: data,
        lastUpdated: new Date().toISOString(),
        error: null
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),

      clearData: () => set({
        rawData: null,
        processedData: null,
        error: null,
        lastUpdated: null
      }),

      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        set({ darkMode: newMode });
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setDateRange: (range) => set({ dateRange: range }),

      setSelectedZones: (zones) => set({ selectedZones: zones }),

      toggleZone: (zone) => {
        const current = get().selectedZones;
        if (current.includes(zone)) {
          set({ selectedZones: current.filter(z => z !== zone) });
        } else {
          set({ selectedZones: [...current, zone].sort((a, b) => a - b) });
        }
      },

      setAlertFilter: (filter) => set({ alertFilter: filter }),

      addNotification: (notification) => {
        const id = Date.now();
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }]
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      // Computed getters
      getHealthStatus: () => {
        const { processedData } = get();
        if (!processedData?.summary?.overallHealth) return null;
        return processedData.summary.overallHealth;
      },

      getRecommendationsByPriority: (priority) => {
        const { processedData } = get();
        if (!processedData?.recommendations) return [];
        if (priority === 'all') return processedData.recommendations;
        return processedData.recommendations.filter(r => r.priority === priority);
      },

      getFilteredAnomalies: () => {
        const { processedData, alertFilter, selectedZones } = get();
        if (!processedData?.anomalies?.list) return [];

        let filtered = processedData.anomalies.list;

        if (alertFilter !== 'all') {
          filtered = filtered.filter(a => a.severity === alertFilter);
        }

        filtered = filtered.filter(a => !a.zone || selectedZones.includes(a.zone));

        return filtered;
      },

      getZoneHealthScores: () => {
        const { processedData, selectedZones } = get();
        if (!processedData?.healthScores) return [];

        return selectedZones.map(zone => ({
          zone,
          ...processedData.healthScores[`zone${zone}`]
        }));
      }
    }),
    {
      name: 'pm-optimizer-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        selectedZones: state.selectedZones
      })
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('pm-optimizer-storage');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.darkMode) {
      document.documentElement.classList.add('dark');
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
}

export default useStore;
