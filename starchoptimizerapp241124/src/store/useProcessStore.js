import { create } from 'zustand';

const useProcessStore = create((set, get) => ({
  // Process state
  processData: {
    temperature: 65.5,
    viscosity: 15.2,
    moisture: 12.8,
    flowRate: 850,
    pressure: 2.3,
    pH: 6.5,
    solidsContent: 87.2,
    drierSpeed: 1200,
  },

  // Historical data for trending
  historicalData: [],

  // Setpoint recommendations
  recommendations: {
    temperature: { current: 65.5, recommended: 67.2, confidence: 0.92 },
    viscosity: { current: 15.2, recommended: 14.8, confidence: 0.88 },
    flowRate: { current: 850, recommended: 875, confidence: 0.85 },
    drierSpeed: { current: 1200, recommended: 1250, confidence: 0.90 },
  },

  // Alarms and notifications
  alarms: [],

  // KPI metrics
  kpis: {
    oee: 87.5,
    yield: 94.2,
    energyEfficiency: 91.8,
    qualityIndex: 96.5,
    throughput: 850,
    downtime: 2.5,
  },

  // Connection status
  isConnected: false,
  lastUpdate: null,

  // Dark mode
  darkMode: false,

  // Actions
  setProcessData: (data) => set({ processData: data, lastUpdate: new Date() }),

  updateHistoricalData: (dataPoint) => {
    const { historicalData } = get();
    const newHistory = [...historicalData, { ...dataPoint, timestamp: new Date() }];
    // Keep last 100 data points
    if (newHistory.length > 100) {
      newHistory.shift();
    }
    set({ historicalData: newHistory });
  },

  setRecommendations: (recommendations) => set({ recommendations }),

  addAlarm: (alarm) => {
    const { alarms } = get();
    set({
      alarms: [...alarms, {
        ...alarm,
        id: Date.now(),
        timestamp: new Date(),
        acknowledged: false
      }]
    });
  },

  acknowledgeAlarm: (id) => {
    const { alarms } = get();
    set({
      alarms: alarms.map(alarm =>
        alarm.id === id ? { ...alarm, acknowledged: true } : alarm
      )
    });
  },

  removeAlarm: (id) => {
    const { alarms } = get();
    set({ alarms: alarms.filter(alarm => alarm.id !== id) });
  },

  setKPIs: (kpis) => set({ kpis }),

  setConnectionStatus: (status) => set({ isConnected: status }),

  toggleDarkMode: () => {
    const { darkMode } = get();
    const newMode = !darkMode;
    set({ darkMode: newMode });

    // Update document class
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Persist to localStorage
    localStorage.setItem('darkMode', newMode);
  },

  initializeDarkMode: () => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = savedMode || systemPrefersDark;

    set({ darkMode });

    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  },

  // Simulate live data updates
  simulateLiveData: () => {
    const { processData, updateHistoricalData, setKPIs, addAlarm } = get();

    setInterval(() => {
      // Simulate realistic process variations
      const newData = {
        temperature: processData.temperature + (Math.random() - 0.5) * 2,
        viscosity: Math.max(10, processData.viscosity + (Math.random() - 0.5) * 1),
        moisture: Math.max(10, Math.min(15, processData.moisture + (Math.random() - 0.5) * 0.5)),
        flowRate: Math.max(700, processData.flowRate + (Math.random() - 0.5) * 50),
        pressure: Math.max(2, Math.min(3, processData.pressure + (Math.random() - 0.5) * 0.2)),
        pH: Math.max(6, Math.min(7, processData.pH + (Math.random() - 0.5) * 0.1)),
        solidsContent: Math.max(85, Math.min(90, processData.solidsContent + (Math.random() - 0.5) * 0.5)),
        drierSpeed: Math.max(1000, processData.drierSpeed + (Math.random() - 0.5) * 100),
      };

      set({ processData: newData, lastUpdate: new Date() });
      updateHistoricalData(newData);

      // Check for alarm conditions
      if (newData.temperature > 70) {
        addAlarm({
          severity: 'warning',
          message: 'Temperature exceeds safe operating range',
          value: newData.temperature.toFixed(1),
          parameter: 'temperature'
        });
      }

      if (newData.moisture < 11) {
        addAlarm({
          severity: 'error',
          message: 'Moisture content critically low',
          value: newData.moisture.toFixed(1),
          parameter: 'moisture'
        });
      }

      // Update KPIs with slight variations
      const { kpis } = get();
      const newKPIs = {
        oee: Math.max(80, Math.min(95, kpis.oee + (Math.random() - 0.5) * 2)),
        yield: Math.max(90, Math.min(98, kpis.yield + (Math.random() - 0.5) * 1)),
        energyEfficiency: Math.max(85, Math.min(95, kpis.energyEfficiency + (Math.random() - 0.5) * 1.5)),
        qualityIndex: Math.max(92, Math.min(99, kpis.qualityIndex + (Math.random() - 0.5) * 1)),
        throughput: newData.flowRate,
        downtime: Math.max(0, kpis.downtime + (Math.random() - 0.5) * 0.5),
      };
      setKPIs(newKPIs);

    }, 3000); // Update every 3 seconds
  },
}));

export default useProcessStore;
