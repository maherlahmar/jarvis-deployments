import { create } from 'zustand';
import { parseCSV, getDataSummary } from '../utils/dataParser';
import { detectAnomalies } from '../utils/anomalyDetection';

const useStore = create((set, get) => ({
  rawData: [],
  processedData: [],
  anomalyResults: null,
  dataSummary: null,
  isLoading: false,
  error: null,

  selectedTimeRange: null,
  selectedZones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  viewMode: 'dashboard',
  selectedAnomaly: null,

  notifications: [],

  thresholds: {
    temperatureZScore: 3.0,
    temperatureRateOfChange: 15,
    zoneImbalanceThreshold: 20,
    powerFactorMin: 0.85,
    frequencyDeviation: 0.5,
    o2ConcentrationMin: 50,
    o2ConcentrationMax: 500,
    flowRateDeviation: 2.0,
    alarmSpikeThreshold: 5,
    currentZScore: 2.5,
    conveyorSpeedDeviation: 0.2,
  },

  loadData: async (file) => {
    set({ isLoading: true, error: null });

    try {
      const data = await parseCSV(file);
      const summary = getDataSummary(data);
      const { thresholds } = get();
      const anomalyResults = detectAnomalies(data, thresholds);

      set({
        rawData: data,
        processedData: data,
        dataSummary: summary,
        anomalyResults,
        isLoading: false,
        error: null,
      });

      const criticalCount = anomalyResults.summary.critical;
      if (criticalCount > 0) {
        get().addNotification({
          type: 'critical',
          title: 'Critical Anomalies Detected',
          message: `Found ${criticalCount} critical anomalies in the data`,
        });
      }

      return { success: true, recordCount: data.length };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load data',
      });
      return { success: false, error: error.message };
    }
  },

  setProcessedData: (data) => {
    set({ processedData: data });
  },

  rerunAnomalyDetection: () => {
    const { processedData, thresholds } = get();
    if (processedData.length === 0) return;

    const anomalyResults = detectAnomalies(processedData, thresholds);
    set({ anomalyResults });
  },

  updateThresholds: (newThresholds) => {
    set((state) => ({
      thresholds: { ...state.thresholds, ...newThresholds },
    }));
    get().rerunAnomalyDetection();
  },

  setSelectedTimeRange: (range) => {
    set({ selectedTimeRange: range });

    const { rawData, thresholds } = get();
    if (!range || !rawData.length) {
      set({ processedData: rawData });
      get().rerunAnomalyDetection();
      return;
    }

    const filtered = rawData.filter((d) => {
      if (!d.timestamp) return true;
      const ts = d.timestamp.getTime();
      return ts >= range.start.getTime() && ts <= range.end.getTime();
    });

    set({ processedData: filtered });
    const anomalyResults = detectAnomalies(filtered, thresholds);
    set({ anomalyResults });
  },

  setSelectedZones: (zones) => {
    set({ selectedZones: zones });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setSelectedAnomaly: (anomaly) => {
    set({ selectedAnomaly: anomaly });
  },

  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, timestamp: new Date() },
      ],
    }));

    setTimeout(() => {
      get().removeNotification(id);
    }, 10000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAllData: () => {
    set({
      rawData: [],
      processedData: [],
      anomalyResults: null,
      dataSummary: null,
      isLoading: false,
      error: null,
      selectedTimeRange: null,
      selectedAnomaly: null,
    });
  },

  getFilteredAnomalies: () => {
    const { anomalyResults, selectedZones } = get();
    if (!anomalyResults) return [];

    return anomalyResults.anomalies.filter((a) => {
      if (a.zone === undefined) return true;
      return selectedZones.includes(a.zone);
    });
  },

  getZoneData: (zoneNumber) => {
    const { processedData } = get();
    if (!processedData.length) return [];

    return processedData.map((d) => ({
      timestamp: d.timestamp,
      ...d.zones[zoneNumber - 1],
    }));
  },

  getElectricalData: () => {
    const { processedData } = get();
    return processedData.map((d) => ({
      timestamp: d.timestamp,
      ...d.electrical,
    }));
  },

  getAtmosphereData: () => {
    const { processedData } = get();
    return processedData.map((d) => ({
      timestamp: d.timestamp,
      ...d.atmosphere,
    }));
  },

  getTimeSeriesData: () => {
    const { processedData, selectedZones } = get();

    return processedData.map((d) => {
      const result = {
        timestamp: d.timestamp,
        time: d.timestamp ? d.timestamp.toLocaleTimeString() : '',
        current: d.electrical.current,
        power: d.electrical.activePower,
        powerFactor: d.electrical.powerFactor,
        o2: d.atmosphere.o2Concentration,
        flowRate: d.atmosphere.flowRate,
        alarms: d.status.alarmCount,
        cool1: d.cooling.cool1Upper,
        cool2: d.cooling.cool2Upper,
      };

      selectedZones.forEach((zone) => {
        const zoneData = d.zones[zone - 1];
        result[`zone${zone}Upper`] = zoneData.upperTemp;
        result[`zone${zone}Lower`] = zoneData.lowerTemp;
      });

      return result;
    });
  },
}));

export default useStore;
