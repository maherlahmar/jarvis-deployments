// Waste Detection Service for SMT Energy Monitor
// Implements algorithms to identify energy waste patterns

export const WASTE_THRESHOLDS = {
  idlePowerMax: 15, // kW - max acceptable power during idle
  powerFactorMin: 0.90, // Minimum acceptable power factor
  tempOvershootMax: 10, // °C - max acceptable temperature overshoot
  tempUndershootMax: 8, // °C - max acceptable temperature undershoot
  idleDurationWarning: 15, // minutes - warning threshold for idle duration
  idleDurationCritical: 30, // minutes - critical threshold for idle duration
  rampEfficiencyMin: 85, // % - minimum ramp efficiency
  zoneImbalanceMax: 15, // °C - max difference between upper/lower heaters
  standbyPowerMax: 12, // kW - max acceptable standby power
  productionEfficiencyMin: 0.55 // kWh per board - target efficiency
};

export const WASTE_CATEGORIES = {
  IDLE_POWER: 'idle_power',
  POWER_FACTOR: 'power_factor',
  TEMP_OVERSHOOT: 'temp_overshoot',
  TEMP_UNDERSHOOT: 'temp_undershoot',
  STANDBY_DURATION: 'standby_duration',
  RAMP_INEFFICIENCY: 'ramp_inefficiency',
  ZONE_IMBALANCE: 'zone_imbalance',
  PRODUCTION_INEFFICIENCY: 'production_inefficiency',
  THERMAL_LOSS: 'thermal_loss'
};

export const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

// Analyze a data point for waste patterns
export function analyzeDataPoint(current, previous, context = {}) {
  const issues = [];

  // Check idle power consumption
  if (current.operational.status === 'Idle' || current.operational.boardsInside === 0) {
    if (current.energy.activePower > WASTE_THRESHOLDS.idlePowerMax) {
      issues.push({
        category: WASTE_CATEGORIES.IDLE_POWER,
        severity: current.energy.activePower > WASTE_THRESHOLDS.idlePowerMax * 1.5
          ? SEVERITY_LEVELS.CRITICAL
          : SEVERITY_LEVELS.WARNING,
        message: `Idle power consumption at ${current.energy.activePower.toFixed(1)} kW exceeds threshold of ${WASTE_THRESHOLDS.idlePowerMax} kW`,
        value: current.energy.activePower,
        threshold: WASTE_THRESHOLDS.idlePowerMax,
        potentialSavings: estimateIdlePowerSavings(current.energy.activePower)
      });
    }
  }

  // Check power factor
  if (current.energy.powerFactor < WASTE_THRESHOLDS.powerFactorMin) {
    issues.push({
      category: WASTE_CATEGORIES.POWER_FACTOR,
      severity: current.energy.powerFactor < 0.85 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.WARNING,
      message: `Power factor at ${current.energy.powerFactor.toFixed(2)} is below minimum ${WASTE_THRESHOLDS.powerFactorMin}`,
      value: current.energy.powerFactor,
      threshold: WASTE_THRESHOLDS.powerFactorMin,
      potentialSavings: estimatePowerFactorSavings(current.energy.powerFactor, current.energy.activePower)
    });
  }

  // Check zone temperatures
  const zoneIssues = analyzeZoneTemperatures(current.zones, context.targetTemps);
  issues.push(...zoneIssues);

  return issues;
}

// Analyze zone temperatures for waste
function analyzeZoneTemperatures(zones, targetTemps = {}) {
  const issues = [];
  const defaultTargets = {
    zone1: 130, zone2: 150, zone3: 165, zone4: 175, zone5: 185,
    zone6: 195, zone7: 220, zone8: 245, zone9: 210, zone10: 160
  };
  const targets = { ...defaultTargets, ...targetTemps };

  Object.entries(zones).forEach(([zoneId, zone]) => {
    const target = targets[zoneId] || 180;

    // Check for temperature overshoot
    if (zone.avgTemp > target + WASTE_THRESHOLDS.tempOvershootMax) {
      const overshoot = zone.avgTemp - target;
      issues.push({
        category: WASTE_CATEGORIES.TEMP_OVERSHOOT,
        severity: overshoot > WASTE_THRESHOLDS.tempOvershootMax * 2
          ? SEVERITY_LEVELS.CRITICAL
          : SEVERITY_LEVELS.WARNING,
        message: `${zoneId.replace('zone', 'Zone ')} temperature overshoot: ${zone.avgTemp.toFixed(1)}°C vs target ${target}°C (+${overshoot.toFixed(1)}°C)`,
        zone: zoneId,
        value: zone.avgTemp,
        target,
        deviation: overshoot,
        potentialSavings: estimateTemperatureSavings(overshoot, zone.avgTemp)
      });
    }

    // Check for zone imbalance
    if (zone.delta > WASTE_THRESHOLDS.zoneImbalanceMax) {
      issues.push({
        category: WASTE_CATEGORIES.ZONE_IMBALANCE,
        severity: SEVERITY_LEVELS.WARNING,
        message: `${zoneId.replace('zone', 'Zone ')} heater imbalance: ${zone.delta.toFixed(1)}°C difference between upper and lower`,
        zone: zoneId,
        value: zone.delta,
        threshold: WASTE_THRESHOLDS.zoneImbalanceMax,
        potentialSavings: zone.delta * 0.02 // Rough estimate
      });
    }
  });

  return issues;
}

// Analyze production efficiency
export function analyzeProductionEfficiency(data, timeWindowMinutes = 60) {
  if (data.length < 2) return null;

  const startRecord = data[0];
  const endRecord = data[data.length - 1];

  const energyConsumed = endRecord.energy.cumulative - startRecord.energy.cumulative;
  const boardsProduced = endRecord.operational.boardsProduced - startRecord.operational.boardsProduced;

  if (boardsProduced === 0) {
    return {
      efficiency: 0,
      kWhPerBoard: null,
      status: 'no_production',
      energyConsumed,
      boardsProduced: 0
    };
  }

  const kWhPerBoard = energyConsumed / boardsProduced;
  const efficiencyRatio = WASTE_THRESHOLDS.productionEfficiencyMin / kWhPerBoard;
  const efficiency = Math.min(100, efficiencyRatio * 100);

  return {
    efficiency,
    kWhPerBoard,
    target: WASTE_THRESHOLDS.productionEfficiencyMin,
    status: efficiency >= 90 ? 'optimal' : efficiency >= 75 ? 'acceptable' : 'inefficient',
    energyConsumed,
    boardsProduced,
    potentialSavings: kWhPerBoard > WASTE_THRESHOLDS.productionEfficiencyMin
      ? (kWhPerBoard - WASTE_THRESHOLDS.productionEfficiencyMin) * boardsProduced
      : 0
  };
}

// Detect idle periods and their energy impact
export function detectIdlePeriods(data) {
  const idlePeriods = [];
  let currentIdleStart = null;
  let currentIdleRecords = [];

  data.forEach((record, index) => {
    const isIdle = record.operational.status !== 'Operating' ||
                   record.operational.boardsInside === 0;

    if (isIdle) {
      if (!currentIdleStart) {
        currentIdleStart = { index, timestamp: record.timestamp };
        currentIdleRecords = [record];
      } else {
        currentIdleRecords.push(record);
      }
    } else if (currentIdleStart) {
      // End of idle period
      const duration = (record.timestamp - currentIdleStart.timestamp) / 1000 / 60;

      if (duration >= 1) { // Only track idle periods >= 1 minute
        const avgPower = currentIdleRecords.reduce((sum, r) => sum + r.energy.activePower, 0) / currentIdleRecords.length;
        const energyWasted = avgPower * (duration / 60); // kWh

        idlePeriods.push({
          startTime: currentIdleStart.timestamp,
          endTime: record.timestamp,
          duration,
          recordCount: currentIdleRecords.length,
          avgPower,
          energyWasted,
          severity: duration > WASTE_THRESHOLDS.idleDurationCritical
            ? SEVERITY_LEVELS.CRITICAL
            : duration > WASTE_THRESHOLDS.idleDurationWarning
              ? SEVERITY_LEVELS.WARNING
              : SEVERITY_LEVELS.INFO,
          potentialSavings: energyWasted * 0.7 // 70% could be saved with better standby
        });
      }

      currentIdleStart = null;
      currentIdleRecords = [];
    }
  });

  return idlePeriods;
}

// Calculate overall waste metrics
export function calculateWasteMetrics(data) {
  if (data.length < 2) {
    return { totalWaste: 0, categories: {}, recommendations: [] };
  }

  const metrics = {
    totalEnergy: data[data.length - 1].energy.cumulative - data[0].energy.cumulative,
    idleEnergy: 0,
    lowPfEnergy: 0,
    tempWaste: 0,
    categories: {},
    recommendations: []
  };

  // Analyze all data points
  let lowPfRecords = 0;
  let idleRecords = 0;
  let avgTempDeviation = 0;

  data.forEach((record, index) => {
    const isIdle = record.operational.status !== 'Operating';

    if (isIdle && record.energy.activePower > WASTE_THRESHOLDS.standbyPowerMax) {
      idleRecords++;
      metrics.idleEnergy += (record.energy.activePower - WASTE_THRESHOLDS.standbyPowerMax) * (10 / 3600);
    }

    if (record.energy.powerFactor < WASTE_THRESHOLDS.powerFactorMin) {
      lowPfRecords++;
      const pfPenalty = (WASTE_THRESHOLDS.powerFactorMin - record.energy.powerFactor) * record.energy.activePower * 0.1;
      metrics.lowPfEnergy += pfPenalty * (10 / 3600);
    }

    // Temperature analysis
    Object.values(record.zones).forEach(zone => {
      if (zone.avgTemp > 200) { // Only check hot zones
        avgTempDeviation += Math.max(0, zone.delta - 5);
      }
    });
  });

  metrics.tempWaste = (avgTempDeviation / data.length) * 0.01 * metrics.totalEnergy;
  metrics.totalWaste = metrics.idleEnergy + metrics.lowPfEnergy + metrics.tempWaste;
  metrics.wastePercentage = (metrics.totalWaste / metrics.totalEnergy) * 100;

  // Generate recommendations
  if (metrics.idleEnergy > 0.5) {
    metrics.recommendations.push({
      priority: 'high',
      category: 'idle_power',
      title: 'Reduce Idle Power Consumption',
      description: `${metrics.idleEnergy.toFixed(2)} kWh wasted during idle periods. Consider implementing automatic standby mode.`,
      potentialSavings: metrics.idleEnergy * 0.7,
      implementation: 'Configure equipment to enter deep standby after 10 minutes of inactivity'
    });
  }

  if (lowPfRecords > data.length * 0.1) {
    metrics.recommendations.push({
      priority: 'medium',
      category: 'power_factor',
      title: 'Power Factor Correction Needed',
      description: `Power factor below ${WASTE_THRESHOLDS.powerFactorMin} in ${((lowPfRecords / data.length) * 100).toFixed(0)}% of readings.`,
      potentialSavings: metrics.lowPfEnergy * 0.8,
      implementation: 'Install capacitor bank for reactive power compensation'
    });
  }

  if (metrics.tempWaste > 1) {
    metrics.recommendations.push({
      priority: 'medium',
      category: 'temperature',
      title: 'Zone Temperature Optimization',
      description: 'Temperature variations between upper and lower heaters causing inefficiency.',
      potentialSavings: metrics.tempWaste * 0.5,
      implementation: 'Calibrate zone heaters and check thermal insulation'
    });
  }

  return metrics;
}

// Estimate savings from idle power reduction
function estimateIdlePowerSavings(currentPower) {
  const targetPower = WASTE_THRESHOLDS.standbyPowerMax;
  const excessPower = currentPower - targetPower;
  // Assuming idle period of 1 hour average
  return excessPower * 1 * 0.12; // kWh * hours * $/kWh
}

// Estimate savings from power factor improvement
function estimatePowerFactorSavings(currentPf, activePower) {
  const targetPf = WASTE_THRESHOLDS.powerFactorMin;
  const currentApparent = activePower / currentPf;
  const targetApparent = activePower / targetPf;
  const reactiveReduction = Math.sqrt(
    currentApparent * currentApparent - activePower * activePower
  ) - Math.sqrt(
    targetApparent * targetApparent - activePower * activePower
  );
  // Rough estimate based on demand charges
  return reactiveReduction * 0.05; // $/kVAR-month
}

// Estimate savings from temperature optimization
function estimateTemperatureSavings(overshoot, currentTemp) {
  // Rough estimate: 2% energy reduction per 10°C reduction
  const reductionPercentage = (overshoot / 10) * 0.02;
  // Assuming 35 kW average power
  return 35 * reductionPercentage * 0.12; // $/hour
}

// Generate waste summary report
export function generateWasteSummary(data, period = 'day') {
  const wasteMetrics = calculateWasteMetrics(data);
  const idlePeriods = detectIdlePeriods(data);
  const productionEfficiency = analyzeProductionEfficiency(data);

  const totalIdleTime = idlePeriods.reduce((sum, p) => sum + p.duration, 0);
  const totalIdleWaste = idlePeriods.reduce((sum, p) => sum + p.energyWasted, 0);

  return {
    period,
    summary: {
      totalEnergy: wasteMetrics.totalEnergy,
      totalWaste: wasteMetrics.totalWaste,
      wastePercentage: wasteMetrics.wastePercentage,
      potentialSavingsKwh: wasteMetrics.totalWaste * 0.7,
      potentialSavingsCost: wasteMetrics.totalWaste * 0.7 * 0.12
    },
    idleAnalysis: {
      totalIdleTime,
      totalIdleWaste,
      periodCount: idlePeriods.length,
      averageDuration: idlePeriods.length > 0 ? totalIdleTime / idlePeriods.length : 0,
      worstPeriod: idlePeriods.sort((a, b) => b.energyWasted - a.energyWasted)[0] || null
    },
    productionEfficiency,
    recommendations: wasteMetrics.recommendations,
    breakdown: {
      idle: { value: wasteMetrics.idleEnergy, percentage: (wasteMetrics.idleEnergy / wasteMetrics.totalWaste) * 100 || 0 },
      powerFactor: { value: wasteMetrics.lowPfEnergy, percentage: (wasteMetrics.lowPfEnergy / wasteMetrics.totalWaste) * 100 || 0 },
      thermal: { value: wasteMetrics.tempWaste, percentage: (wasteMetrics.tempWaste / wasteMetrics.totalWaste) * 100 || 0 }
    }
  };
}
