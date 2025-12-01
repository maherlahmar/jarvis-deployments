export const ANOMALY_TYPES = {
  TEMPERATURE_SPIKE: 'temperature_spike',
  TEMPERATURE_DROP: 'temperature_drop',
  TEMPERATURE_DEVIATION: 'temperature_deviation',
  POWER_ANOMALY: 'power_anomaly',
  POWER_FACTOR_LOW: 'power_factor_low',
  FREQUENCY_DEVIATION: 'frequency_deviation',
  O2_CONCENTRATION_HIGH: 'o2_concentration_high',
  O2_CONCENTRATION_LOW: 'o2_concentration_low',
  FLOW_RATE_ANOMALY: 'flow_rate_anomaly',
  ALARM_SPIKE: 'alarm_spike',
  ZONE_IMBALANCE: 'zone_imbalance',
  CURRENT_SPIKE: 'current_spike',
  CONVEYOR_SPEED_DEVIATION: 'conveyor_speed_deviation',
};

export const SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
};

const DEFAULT_THRESHOLDS = {
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
};

function calculateStatistics(values) {
  if (!values || values.length === 0) {
    return { mean: 0, std: 0, min: 0, max: 0, median: 0 };
  }

  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / n;
  const std = Math.sqrt(variance);

  const sorted = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  return {
    mean,
    std,
    min: Math.min(...values),
    max: Math.max(...values),
    median,
  };
}

function calculateZScore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

function calculateRateOfChange(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function detectTemperatureAnomalies(data, thresholds) {
  const anomalies = [];

  const zoneStats = {};
  for (let zone = 0; zone < 10; zone++) {
    const upperTemps = data.map(d => d.zones[zone].upperTemp);
    const lowerTemps = data.map(d => d.zones[zone].lowerTemp);
    const blowerUpperTemps = data.map(d => d.zones[zone].blowerUpperTemp);
    const blowerLowerTemps = data.map(d => d.zones[zone].blowerLowerTemp);

    zoneStats[zone] = {
      upper: calculateStatistics(upperTemps),
      lower: calculateStatistics(lowerTemps),
      blowerUpper: calculateStatistics(blowerUpperTemps),
      blowerLower: calculateStatistics(blowerLowerTemps),
    };
  }

  data.forEach((record, index) => {
    record.zones.forEach((zone, zoneIndex) => {
      const stats = zoneStats[zoneIndex];

      const upperZScore = calculateZScore(zone.upperTemp, stats.upper.mean, stats.upper.std);
      if (Math.abs(upperZScore) > thresholds.temperatureZScore) {
        anomalies.push({
          type: upperZScore > 0 ? ANOMALY_TYPES.TEMPERATURE_SPIKE : ANOMALY_TYPES.TEMPERATURE_DROP,
          severity: Math.abs(upperZScore) > 4 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
          timestamp: record.timestamp,
          recordIndex: index,
          zone: zoneIndex + 1,
          location: 'upper',
          value: zone.upperTemp,
          expected: stats.upper.mean,
          deviation: upperZScore,
          message: `Zone ${zoneIndex + 1} upper temp ${upperZScore > 0 ? 'spike' : 'drop'}: ${zone.upperTemp.toFixed(1)}C (expected: ${stats.upper.mean.toFixed(1)}C)`,
        });
      }

      const lowerZScore = calculateZScore(zone.lowerTemp, stats.lower.mean, stats.lower.std);
      if (Math.abs(lowerZScore) > thresholds.temperatureZScore) {
        anomalies.push({
          type: lowerZScore > 0 ? ANOMALY_TYPES.TEMPERATURE_SPIKE : ANOMALY_TYPES.TEMPERATURE_DROP,
          severity: Math.abs(lowerZScore) > 4 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
          timestamp: record.timestamp,
          recordIndex: index,
          zone: zoneIndex + 1,
          location: 'lower',
          value: zone.lowerTemp,
          expected: stats.lower.mean,
          deviation: lowerZScore,
          message: `Zone ${zoneIndex + 1} lower temp ${lowerZScore > 0 ? 'spike' : 'drop'}: ${zone.lowerTemp.toFixed(1)}C (expected: ${stats.lower.mean.toFixed(1)}C)`,
        });
      }

      const tempDiff = Math.abs(zone.upperTemp - zone.lowerTemp);
      if (tempDiff > thresholds.zoneImbalanceThreshold) {
        anomalies.push({
          type: ANOMALY_TYPES.ZONE_IMBALANCE,
          severity: tempDiff > 30 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
          timestamp: record.timestamp,
          recordIndex: index,
          zone: zoneIndex + 1,
          value: tempDiff,
          upperTemp: zone.upperTemp,
          lowerTemp: zone.lowerTemp,
          message: `Zone ${zoneIndex + 1} temperature imbalance: ${tempDiff.toFixed(1)}C difference between upper and lower`,
        });
      }
    });

    if (index > 0) {
      record.zones.forEach((zone, zoneIndex) => {
        const prevZone = data[index - 1].zones[zoneIndex];
        const rateOfChange = Math.abs(zone.upperTemp - prevZone.upperTemp);

        if (rateOfChange > thresholds.temperatureRateOfChange) {
          anomalies.push({
            type: ANOMALY_TYPES.TEMPERATURE_DEVIATION,
            severity: rateOfChange > 25 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
            timestamp: record.timestamp,
            recordIndex: index,
            zone: zoneIndex + 1,
            value: rateOfChange,
            previousValue: prevZone.upperTemp,
            currentValue: zone.upperTemp,
            message: `Zone ${zoneIndex + 1} rapid temp change: ${rateOfChange.toFixed(1)}C in one interval`,
          });
        }
      });
    }
  });

  return anomalies;
}

function detectPowerAnomalies(data, thresholds) {
  const anomalies = [];

  const currentValues = data.map(d => d.electrical.current);
  const powerValues = data.map(d => d.electrical.activePower);

  const currentStats = calculateStatistics(currentValues);
  const powerStats = calculateStatistics(powerValues);

  data.forEach((record, index) => {
    if (record.electrical.powerFactor < thresholds.powerFactorMin && record.electrical.powerFactor > 0) {
      anomalies.push({
        type: ANOMALY_TYPES.POWER_FACTOR_LOW,
        severity: record.electrical.powerFactor < 0.7 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.electrical.powerFactor,
        threshold: thresholds.powerFactorMin,
        message: `Low power factor: ${record.electrical.powerFactor.toFixed(3)} (threshold: ${thresholds.powerFactorMin})`,
      });
    }

    const freqDeviation = Math.abs(record.electrical.acFrequency - 60);
    if (freqDeviation > thresholds.frequencyDeviation) {
      anomalies.push({
        type: ANOMALY_TYPES.FREQUENCY_DEVIATION,
        severity: freqDeviation > 1 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.electrical.acFrequency,
        expected: 60,
        deviation: freqDeviation,
        message: `AC frequency deviation: ${record.electrical.acFrequency.toFixed(2)}Hz (expected: 60Hz)`,
      });
    }

    const currentZScore = calculateZScore(record.electrical.current, currentStats.mean, currentStats.std);
    if (Math.abs(currentZScore) > thresholds.currentZScore) {
      anomalies.push({
        type: ANOMALY_TYPES.CURRENT_SPIKE,
        severity: Math.abs(currentZScore) > 3.5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.electrical.current,
        expected: currentStats.mean,
        deviation: currentZScore,
        message: `Current anomaly: ${record.electrical.current.toFixed(2)}A (z-score: ${currentZScore.toFixed(2)})`,
      });
    }

    const powerZScore = calculateZScore(record.electrical.activePower, powerStats.mean, powerStats.std);
    if (Math.abs(powerZScore) > thresholds.currentZScore) {
      anomalies.push({
        type: ANOMALY_TYPES.POWER_ANOMALY,
        severity: Math.abs(powerZScore) > 3.5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.electrical.activePower,
        expected: powerStats.mean,
        deviation: powerZScore,
        message: `Power anomaly: ${record.electrical.activePower.toFixed(2)}kW (z-score: ${powerZScore.toFixed(2)})`,
      });
    }
  });

  return anomalies;
}

function detectAtmosphereAnomalies(data, thresholds) {
  const anomalies = [];

  const o2Values = data.map(d => d.atmosphere.o2Concentration);
  const flowValues = data.map(d => d.atmosphere.flowRate);

  const o2Stats = calculateStatistics(o2Values);
  const flowStats = calculateStatistics(flowValues);

  data.forEach((record, index) => {
    if (record.atmosphere.o2Concentration > thresholds.o2ConcentrationMax) {
      anomalies.push({
        type: ANOMALY_TYPES.O2_CONCENTRATION_HIGH,
        severity: record.atmosphere.o2Concentration > 1000 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.atmosphere.o2Concentration,
        threshold: thresholds.o2ConcentrationMax,
        message: `High O2 concentration: ${record.atmosphere.o2Concentration.toFixed(1)}ppm (threshold: ${thresholds.o2ConcentrationMax}ppm)`,
      });
    }

    if (record.atmosphere.o2Concentration < thresholds.o2ConcentrationMin && record.atmosphere.o2Concentration > 0) {
      anomalies.push({
        type: ANOMALY_TYPES.O2_CONCENTRATION_LOW,
        severity: SEVERITY.INFO,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.atmosphere.o2Concentration,
        threshold: thresholds.o2ConcentrationMin,
        message: `Low O2 concentration: ${record.atmosphere.o2Concentration.toFixed(1)}ppm (threshold: ${thresholds.o2ConcentrationMin}ppm)`,
      });
    }

    const flowZScore = calculateZScore(record.atmosphere.flowRate, flowStats.mean, flowStats.std);
    if (Math.abs(flowZScore) > thresholds.flowRateDeviation) {
      anomalies.push({
        type: ANOMALY_TYPES.FLOW_RATE_ANOMALY,
        severity: Math.abs(flowZScore) > 3 ? SEVERITY.WARNING : SEVERITY.INFO,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.atmosphere.flowRate,
        expected: flowStats.mean,
        deviation: flowZScore,
        message: `Flow rate anomaly: ${record.atmosphere.flowRate.toFixed(2)}L/min (z-score: ${flowZScore.toFixed(2)})`,
      });
    }
  });

  return anomalies;
}

function detectOperationalAnomalies(data, thresholds) {
  const anomalies = [];

  const conveyorSpeeds = data.map(d => d.conveyor.speed);
  const conveyorStats = calculateStatistics(conveyorSpeeds);

  data.forEach((record, index) => {
    if (record.status.alarmCount > thresholds.alarmSpikeThreshold) {
      anomalies.push({
        type: ANOMALY_TYPES.ALARM_SPIKE,
        severity: record.status.alarmCount > 10 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        timestamp: record.timestamp,
        recordIndex: index,
        value: record.status.alarmCount,
        threshold: thresholds.alarmSpikeThreshold,
        message: `High alarm count: ${record.status.alarmCount} alarms (threshold: ${thresholds.alarmSpikeThreshold})`,
      });
    }

    if (conveyorStats.std > 0) {
      const speedDeviation = Math.abs(record.conveyor.speed - conveyorStats.mean) / conveyorStats.mean;
      if (speedDeviation > thresholds.conveyorSpeedDeviation && conveyorStats.mean > 0) {
        anomalies.push({
          type: ANOMALY_TYPES.CONVEYOR_SPEED_DEVIATION,
          severity: speedDeviation > 0.4 ? SEVERITY.WARNING : SEVERITY.INFO,
          timestamp: record.timestamp,
          recordIndex: index,
          value: record.conveyor.speed,
          expected: conveyorStats.mean,
          deviation: speedDeviation * 100,
          message: `Conveyor speed deviation: ${record.conveyor.speed.toFixed(2)}m/min (${(speedDeviation * 100).toFixed(1)}% from mean)`,
        });
      }
    }
  });

  return anomalies;
}

export function detectAnomalies(data, customThresholds = {}) {
  if (!data || data.length === 0) {
    return {
      anomalies: [],
      summary: {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        byType: {},
      },
      statistics: {},
    };
  }

  const thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };

  const temperatureAnomalies = detectTemperatureAnomalies(data, thresholds);
  const powerAnomalies = detectPowerAnomalies(data, thresholds);
  const atmosphereAnomalies = detectAtmosphereAnomalies(data, thresholds);
  const operationalAnomalies = detectOperationalAnomalies(data, thresholds);

  const allAnomalies = [
    ...temperatureAnomalies,
    ...powerAnomalies,
    ...atmosphereAnomalies,
    ...operationalAnomalies,
  ].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return (a.timestamp || 0) - (b.timestamp || 0);
  });

  const summary = {
    total: allAnomalies.length,
    critical: allAnomalies.filter(a => a.severity === SEVERITY.CRITICAL).length,
    warning: allAnomalies.filter(a => a.severity === SEVERITY.WARNING).length,
    info: allAnomalies.filter(a => a.severity === SEVERITY.INFO).length,
    byType: {},
    byZone: {},
  };

  allAnomalies.forEach(a => {
    summary.byType[a.type] = (summary.byType[a.type] || 0) + 1;
    if (a.zone !== undefined) {
      summary.byZone[a.zone] = (summary.byZone[a.zone] || 0) + 1;
    }
  });

  const statistics = calculateOverallStatistics(data);

  return {
    anomalies: allAnomalies,
    summary,
    statistics,
    thresholds,
  };
}

function calculateOverallStatistics(data) {
  const electrical = {
    current: calculateStatistics(data.map(d => d.electrical.current)),
    voltage: calculateStatistics(data.map(d => d.electrical.voltage)),
    activePower: calculateStatistics(data.map(d => d.electrical.activePower)),
    powerFactor: calculateStatistics(data.map(d => d.electrical.powerFactor)),
    frequency: calculateStatistics(data.map(d => d.electrical.acFrequency)),
  };

  const atmosphere = {
    o2Concentration: calculateStatistics(data.map(d => d.atmosphere.o2Concentration)),
    flowRate: calculateStatistics(data.map(d => d.atmosphere.flowRate)),
  };

  const zones = [];
  for (let i = 0; i < 10; i++) {
    zones.push({
      zone: i + 1,
      upper: calculateStatistics(data.map(d => d.zones[i].upperTemp)),
      lower: calculateStatistics(data.map(d => d.zones[i].lowerTemp)),
      blowerUpper: calculateStatistics(data.map(d => d.zones[i].blowerUpperTemp)),
      blowerLower: calculateStatistics(data.map(d => d.zones[i].blowerLowerTemp)),
    });
  }

  const cooling = {
    cool1: calculateStatistics(data.map(d => d.cooling.cool1Upper)),
    cool2: calculateStatistics(data.map(d => d.cooling.cool2Upper)),
  };

  return {
    electrical,
    atmosphere,
    zones,
    cooling,
    operational: {
      alarmCount: calculateStatistics(data.map(d => d.status.alarmCount)),
      conveyorSpeed: calculateStatistics(data.map(d => d.conveyor.speed)),
    },
  };
}

export function getAnomalyColor(severity) {
  switch (severity) {
    case SEVERITY.CRITICAL:
      return '#ef4444';
    case SEVERITY.WARNING:
      return '#f59e0b';
    case SEVERITY.INFO:
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

export function getAnomalyIcon(type) {
  const icons = {
    [ANOMALY_TYPES.TEMPERATURE_SPIKE]: 'Thermometer',
    [ANOMALY_TYPES.TEMPERATURE_DROP]: 'Thermometer',
    [ANOMALY_TYPES.TEMPERATURE_DEVIATION]: 'TrendingUp',
    [ANOMALY_TYPES.POWER_ANOMALY]: 'Zap',
    [ANOMALY_TYPES.POWER_FACTOR_LOW]: 'Activity',
    [ANOMALY_TYPES.FREQUENCY_DEVIATION]: 'Radio',
    [ANOMALY_TYPES.O2_CONCENTRATION_HIGH]: 'Wind',
    [ANOMALY_TYPES.O2_CONCENTRATION_LOW]: 'Wind',
    [ANOMALY_TYPES.FLOW_RATE_ANOMALY]: 'Droplets',
    [ANOMALY_TYPES.ALARM_SPIKE]: 'AlertTriangle',
    [ANOMALY_TYPES.ZONE_IMBALANCE]: 'Scale',
    [ANOMALY_TYPES.CURRENT_SPIKE]: 'Zap',
    [ANOMALY_TYPES.CONVEYOR_SPEED_DEVIATION]: 'Gauge',
  };
  return icons[type] || 'AlertCircle';
}
