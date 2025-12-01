import Papa from 'papaparse';

// Column mappings for easier access
export const COLUMNS = {
  TIMESTAMP: 'Logging time',
  ENERGY: 'Cumulative electric energy (kWh)',
  CURRENT: 'Electric current (A)',
  VOLTAGE: 'Voltage (V)',
  ACTIVE_POWER: 'Active power (kW)',
  REACTIVE_POWER: 'Reactive power (kVAR)',
  APPARENT_POWER: 'Apparent power (kVA)',
  POWER_FACTOR: 'Power factor (PF)',
  FREQUENCY: 'AC frequency (Hz)',
  BOARDS_INSIDE: 'Number of boards inside equipment',
  BOARDS_PRODUCED: 'Number of boards produced',
  PRODUCT_NUMBER: 'Product number information',
  CONVEYOR_SPEED: 'C/V (Conveyor speed m/min)',
  CONVEYOR_WIDTH: 'Conveyor width (mm)',
  STATUS: 'Equipment status',
  ALARMS: 'Number of alarms',
  FLOW_RATE: 'Flow rate (L/min)',
  O2_CONCENTRATION: 'O2 concentration (ppm)'
};

// Zone configuration
export const ZONES = [
  { id: 1, name: 'Zone 1', type: 'preheat' },
  { id: 2, name: 'Zone 2', type: 'preheat' },
  { id: 3, name: 'Zone 3', type: 'soak' },
  { id: 4, name: 'Zone 4', type: 'soak' },
  { id: 5, name: 'Zone 5', type: 'reflow' },
  { id: 6, name: 'Zone 6', type: 'reflow' },
  { id: 7, name: 'Zone 7', type: 'reflow' },
  { id: 8, name: 'Zone 8', type: 'peak' },
  { id: 9, name: 'Zone 9', type: 'cooling' },
  { id: 10, name: 'Zone 10', type: 'cooling' }
];

// Temperature thresholds for maintenance
export const TEMP_THRESHOLDS = {
  preheat: { min: 100, target: 150, max: 180, critical: 200 },
  soak: { min: 150, target: 180, max: 200, critical: 220 },
  reflow: { min: 200, target: 240, max: 260, critical: 280 },
  peak: { min: 230, target: 250, max: 270, critical: 290 },
  cooling: { min: 30, target: 50, max: 80, critical: 100 }
};

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function processData(rawData) {
  if (!rawData || rawData.length === 0) return null;

  // Sample data for performance (take every 10th record for analysis)
  const sampledData = rawData.filter((_, i) => i % 10 === 0);

  // Extract zone temperatures
  const zoneTemperatures = extractZoneTemperatures(sampledData);

  // Calculate statistics
  const statistics = calculateStatistics(sampledData);

  // Detect anomalies
  const anomalies = detectAnomalies(sampledData);

  // Calculate health scores
  const healthScores = calculateHealthScores(sampledData);

  // Generate maintenance recommendations
  const recommendations = generateRecommendations(healthScores, anomalies, statistics);

  // Calculate energy efficiency
  const energyAnalysis = analyzeEnergy(sampledData);

  // Get time series data for charts
  const timeSeries = prepareTimeSeries(sampledData);

  return {
    summary: {
      totalRecords: rawData.length,
      analyzedRecords: sampledData.length,
      dateRange: getDateRange(sampledData),
      overallHealth: calculateOverallHealth(healthScores)
    },
    zoneTemperatures,
    statistics,
    anomalies,
    healthScores,
    recommendations,
    energyAnalysis,
    timeSeries,
    rawSample: sampledData.slice(0, 100)
  };
}

function extractZoneTemperatures(data) {
  const zones = {};

  for (let i = 1; i <= 10; i++) {
    const upperKey = `ZONE${i} UPPER Temperature (°C)`;
    const lowerKey = `ZONE${i} LOWER Temperature (°C)`;
    const blowerUpperKey = `BLOWER${i} UPPER Temperature (°C)`;
    const blowerLowerKey = `BLOWER${i} LOWER Temperature (°C)`;

    const upperTemps = data.map(d => d[upperKey]).filter(v => v != null);
    const lowerTemps = data.map(d => d[lowerKey]).filter(v => v != null);
    const blowerUpperTemps = data.map(d => d[blowerUpperKey]).filter(v => v != null);
    const blowerLowerTemps = data.map(d => d[blowerLowerKey]).filter(v => v != null);

    zones[`zone${i}`] = {
      id: i,
      name: `Zone ${i}`,
      type: ZONES[i - 1].type,
      upper: {
        avg: average(upperTemps),
        min: Math.min(...upperTemps),
        max: Math.max(...upperTemps),
        stdDev: standardDeviation(upperTemps)
      },
      lower: {
        avg: average(lowerTemps),
        min: Math.min(...lowerTemps),
        max: Math.max(...lowerTemps),
        stdDev: standardDeviation(lowerTemps)
      },
      blowerUpper: {
        avg: average(blowerUpperTemps),
        min: Math.min(...blowerUpperTemps),
        max: Math.max(...blowerUpperTemps),
        stdDev: standardDeviation(blowerUpperTemps)
      },
      blowerLower: {
        avg: average(blowerLowerTemps),
        min: Math.min(...blowerLowerTemps),
        max: Math.max(...blowerLowerTemps),
        stdDev: standardDeviation(blowerLowerTemps)
      }
    };
  }

  // Add cooling zones
  const cool1 = data.map(d => d['COOL1 upper']).filter(v => v != null);
  const cool2 = data.map(d => d['COOL2 upper']).filter(v => v != null);

  zones.cooling1 = {
    avg: average(cool1),
    min: Math.min(...cool1),
    max: Math.max(...cool1),
    stdDev: standardDeviation(cool1)
  };

  zones.cooling2 = {
    avg: average(cool2),
    min: Math.min(...cool2),
    max: Math.max(...cool2),
    stdDev: standardDeviation(cool2)
  };

  return zones;
}

function calculateStatistics(data) {
  const powerFactors = data.map(d => d[COLUMNS.POWER_FACTOR]).filter(v => v != null);
  const energyConsumption = data.map(d => d[COLUMNS.ENERGY]).filter(v => v != null);
  const activePower = data.map(d => d[COLUMNS.ACTIVE_POWER]).filter(v => v != null);
  const flowRates = data.map(d => d[COLUMNS.FLOW_RATE]).filter(v => v != null);
  const o2Levels = data.map(d => d[COLUMNS.O2_CONCENTRATION]).filter(v => v != null);
  const alarms = data.map(d => d[COLUMNS.ALARMS]).filter(v => v != null);
  const boardsProduced = data.map(d => d[COLUMNS.BOARDS_PRODUCED]).filter(v => v != null);

  return {
    power: {
      avgPowerFactor: average(powerFactors),
      minPowerFactor: Math.min(...powerFactors),
      maxPowerFactor: Math.max(...powerFactors),
      totalEnergy: Math.max(...energyConsumption) - Math.min(...energyConsumption),
      avgActivePower: average(activePower),
      peakPower: Math.max(...activePower)
    },
    flow: {
      avgFlowRate: average(flowRates),
      minFlowRate: Math.min(...flowRates),
      maxFlowRate: Math.max(...flowRates),
      flowStability: 100 - (standardDeviation(flowRates) / average(flowRates) * 100)
    },
    o2: {
      avgO2: average(o2Levels),
      minO2: Math.min(...o2Levels),
      maxO2: Math.max(...o2Levels),
      o2Stability: 100 - (standardDeviation(o2Levels) / average(o2Levels) * 100)
    },
    alarms: {
      totalAlarms: Math.max(...alarms),
      avgAlarmsPerHour: average(alarms),
      alarmTrend: calculateTrend(alarms)
    },
    production: {
      totalBoards: Math.max(...boardsProduced),
      avgBoardsPerHour: average(boardsProduced) * 6 // 10-second intervals
    }
  };
}

function detectAnomalies(data) {
  const anomalies = [];

  // Check for temperature anomalies
  for (let i = 1; i <= 10; i++) {
    const upperKey = `ZONE${i} UPPER Temperature (°C)`;
    const lowerKey = `ZONE${i} LOWER Temperature (°C)`;
    const zoneType = ZONES[i - 1].type;
    const thresholds = TEMP_THRESHOLDS[zoneType];

    data.forEach((row, index) => {
      const upperTemp = row[upperKey];
      const lowerTemp = row[lowerKey];

      if (upperTemp > thresholds.critical) {
        anomalies.push({
          type: 'critical_temp',
          zone: i,
          position: 'upper',
          value: upperTemp,
          threshold: thresholds.critical,
          timestamp: row[COLUMNS.TIMESTAMP],
          severity: 'critical'
        });
      } else if (upperTemp > thresholds.max) {
        anomalies.push({
          type: 'high_temp',
          zone: i,
          position: 'upper',
          value: upperTemp,
          threshold: thresholds.max,
          timestamp: row[COLUMNS.TIMESTAMP],
          severity: 'warning'
        });
      }

      // Check temperature differential
      const tempDiff = Math.abs(upperTemp - lowerTemp);
      if (tempDiff > 10) {
        anomalies.push({
          type: 'temp_imbalance',
          zone: i,
          value: tempDiff,
          threshold: 10,
          timestamp: row[COLUMNS.TIMESTAMP],
          severity: tempDiff > 20 ? 'critical' : 'warning'
        });
      }
    });
  }

  // Check for power factor anomalies
  data.forEach(row => {
    const pf = row[COLUMNS.POWER_FACTOR];
    if (pf && pf < 0.85) {
      anomalies.push({
        type: 'low_power_factor',
        value: pf,
        threshold: 0.85,
        timestamp: row[COLUMNS.TIMESTAMP],
        severity: pf < 0.7 ? 'critical' : 'warning'
      });
    }
  });

  // Check for O2 concentration anomalies
  data.forEach(row => {
    const o2 = row[COLUMNS.O2_CONCENTRATION];
    if (o2 && o2 > 500) {
      anomalies.push({
        type: 'high_o2',
        value: o2,
        threshold: 500,
        timestamp: row[COLUMNS.TIMESTAMP],
        severity: o2 > 1000 ? 'critical' : 'warning'
      });
    }
  });

  // Deduplicate and limit anomalies
  const uniqueAnomalies = deduplicateAnomalies(anomalies);

  return {
    list: uniqueAnomalies.slice(0, 100),
    summary: {
      critical: uniqueAnomalies.filter(a => a.severity === 'critical').length,
      warning: uniqueAnomalies.filter(a => a.severity === 'warning').length,
      total: uniqueAnomalies.length
    },
    byType: groupBy(uniqueAnomalies, 'type')
  };
}

function deduplicateAnomalies(anomalies) {
  const seen = new Set();
  return anomalies.filter(a => {
    const key = `${a.type}-${a.zone || ''}-${a.position || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function calculateHealthScores(data) {
  const scores = {};

  // Zone health scores
  for (let i = 1; i <= 10; i++) {
    const upperKey = `ZONE${i} UPPER Temperature (°C)`;
    const lowerKey = `ZONE${i} LOWER Temperature (°C)`;
    const blowerUpperKey = `BLOWER${i} UPPER Temperature (°C)`;
    const blowerLowerKey = `BLOWER${i} LOWER Temperature (°C)`;
    const zoneType = ZONES[i - 1].type;
    const thresholds = TEMP_THRESHOLDS[zoneType];

    const upperTemps = data.map(d => d[upperKey]).filter(v => v != null);
    const lowerTemps = data.map(d => d[lowerKey]).filter(v => v != null);

    const avgUpper = average(upperTemps);
    const avgLower = average(lowerTemps);
    const stdDevUpper = standardDeviation(upperTemps);
    const tempBalance = 100 - Math.abs(avgUpper - avgLower) * 2;

    // Calculate score based on deviation from target
    const targetDeviation = Math.abs(avgUpper - thresholds.target) / thresholds.target * 100;
    const stabilityScore = Math.max(0, 100 - stdDevUpper * 2);

    scores[`zone${i}`] = {
      overall: Math.round(Math.max(0, Math.min(100, 100 - targetDeviation + stabilityScore / 2 + tempBalance / 4))),
      temperature: Math.round(Math.max(0, 100 - targetDeviation * 2)),
      stability: Math.round(stabilityScore),
      balance: Math.round(Math.max(0, tempBalance))
    };
  }

  // Electrical health
  const powerFactors = data.map(d => d[COLUMNS.POWER_FACTOR]).filter(v => v != null);
  const avgPF = average(powerFactors);
  scores.electrical = {
    overall: Math.round(avgPF * 100),
    powerFactor: Math.round(avgPF * 100),
    stability: Math.round(100 - standardDeviation(powerFactors) * 100)
  };

  // Flow system health
  const flowRates = data.map(d => d[COLUMNS.FLOW_RATE]).filter(v => v != null);
  const avgFlow = average(flowRates);
  scores.flowSystem = {
    overall: Math.round(Math.min(100, avgFlow * 20)),
    flowRate: Math.round(Math.min(100, avgFlow * 20)),
    stability: Math.round(100 - standardDeviation(flowRates) * 10)
  };

  // Atmosphere control
  const o2Levels = data.map(d => d[COLUMNS.O2_CONCENTRATION]).filter(v => v != null);
  const avgO2 = average(o2Levels);
  scores.atmosphere = {
    overall: Math.round(Math.max(0, 100 - avgO2 / 10)),
    o2Control: Math.round(Math.max(0, 100 - avgO2 / 10)),
    stability: Math.round(100 - standardDeviation(o2Levels) / 5)
  };

  return scores;
}

function calculateOverallHealth(healthScores) {
  const zoneScores = [];
  for (let i = 1; i <= 10; i++) {
    if (healthScores[`zone${i}`]) {
      zoneScores.push(healthScores[`zone${i}`].overall);
    }
  }

  const avgZoneHealth = average(zoneScores);
  const electricalHealth = healthScores.electrical?.overall || 80;
  const flowHealth = healthScores.flowSystem?.overall || 80;
  const atmosphereHealth = healthScores.atmosphere?.overall || 80;

  const overall = Math.round(
    avgZoneHealth * 0.5 +
    electricalHealth * 0.2 +
    flowHealth * 0.15 +
    atmosphereHealth * 0.15
  );

  return {
    score: overall,
    grade: getHealthGrade(overall),
    status: getHealthStatus(overall)
  };
}

function getHealthGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getHealthStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}

function generateRecommendations(healthScores, anomalies, statistics) {
  const recommendations = [];

  // Zone-specific recommendations
  for (let i = 1; i <= 10; i++) {
    const zoneScore = healthScores[`zone${i}`];
    const zoneType = ZONES[i - 1].type;

    if (zoneScore && zoneScore.overall < 70) {
      recommendations.push({
        id: `zone-${i}-health`,
        category: 'temperature',
        priority: zoneScore.overall < 50 ? 'critical' : 'high',
        zone: i,
        title: `Zone ${i} Requires Attention`,
        description: `Zone ${i} (${zoneType}) health score is ${zoneScore.overall}%. Temperature stability and balance need improvement.`,
        actions: [
          'Inspect heating elements for degradation',
          'Check thermocouple calibration',
          'Verify blower motor operation',
          'Clean air circulation pathways'
        ],
        estimatedTime: '2-4 hours',
        impact: 'high'
      });
    }

    if (zoneScore && zoneScore.balance < 80) {
      recommendations.push({
        id: `zone-${i}-balance`,
        category: 'temperature',
        priority: 'medium',
        zone: i,
        title: `Zone ${i} Temperature Imbalance`,
        description: `Upper and lower temperatures in Zone ${i} show ${100 - zoneScore.balance}% imbalance.`,
        actions: [
          'Check for blocked airflow in zone',
          'Inspect heating element uniformity',
          'Verify conveyor belt alignment',
          'Clean reflectors and heat shields'
        ],
        estimatedTime: '1-2 hours',
        impact: 'medium'
      });
    }
  }

  // Electrical system recommendations
  if (healthScores.electrical && healthScores.electrical.powerFactor < 90) {
    recommendations.push({
      id: 'power-factor',
      category: 'electrical',
      priority: healthScores.electrical.powerFactor < 80 ? 'high' : 'medium',
      title: 'Power Factor Correction Needed',
      description: `Average power factor is ${healthScores.electrical.powerFactor}%. Target is 95%+ for optimal efficiency.`,
      actions: [
        'Install or inspect power factor correction capacitors',
        'Check for harmonic distortion in power supply',
        'Verify electrical connections are secure',
        'Consider upgrading to VFD-driven motors'
      ],
      estimatedTime: '4-8 hours',
      impact: 'high'
    });
  }

  // Flow system recommendations
  if (statistics.flow && statistics.flow.flowStability < 90) {
    recommendations.push({
      id: 'flow-stability',
      category: 'mechanical',
      priority: 'medium',
      title: 'Nitrogen Flow Inconsistency',
      description: `Flow rate stability is at ${statistics.flow.flowStability.toFixed(1)}%. Fluctuations may affect solder quality.`,
      actions: [
        'Inspect flow meters and sensors',
        'Check pressure regulator settings',
        'Verify nitrogen supply pressure',
        'Clean or replace flow control valves'
      ],
      estimatedTime: '1-2 hours',
      impact: 'medium'
    });
  }

  // O2 concentration recommendations
  if (statistics.o2 && statistics.o2.avgO2 > 300) {
    recommendations.push({
      id: 'o2-control',
      category: 'atmosphere',
      priority: statistics.o2.avgO2 > 500 ? 'high' : 'medium',
      title: 'Oxygen Level Control',
      description: `Average O2 concentration is ${statistics.o2.avgO2.toFixed(0)} ppm. Should be below 300 ppm for optimal soldering.`,
      actions: [
        'Increase nitrogen flow rate',
        'Check for air leaks in oven chamber',
        'Inspect door seals and gaskets',
        'Verify nitrogen purity from supply'
      ],
      estimatedTime: '2-4 hours',
      impact: 'high'
    });
  }

  // Alarm-based recommendations
  if (anomalies.summary && anomalies.summary.critical > 0) {
    recommendations.push({
      id: 'critical-alarms',
      category: 'alarms',
      priority: 'critical',
      title: 'Critical Alerts Detected',
      description: `${anomalies.summary.critical} critical anomalies detected. Immediate investigation required.`,
      actions: [
        'Review alarm logs for root cause',
        'Inspect affected zones and systems',
        'Verify sensor functionality',
        'Document findings and corrective actions'
      ],
      estimatedTime: '2-6 hours',
      impact: 'critical'
    });
  }

  // Preventive maintenance schedule
  recommendations.push({
    id: 'scheduled-pm',
    category: 'preventive',
    priority: 'low',
    title: 'Scheduled Preventive Maintenance',
    description: 'Regular maintenance ensures optimal performance and prevents unexpected downtime.',
    actions: [
      'Clean all heating zones and blowers (weekly)',
      'Calibrate thermocouples (monthly)',
      'Inspect conveyor belt and chain (monthly)',
      'Replace air filters (quarterly)',
      'Full system calibration (annually)'
    ],
    estimatedTime: 'Varies',
    impact: 'preventive'
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

function analyzeEnergy(data) {
  const energyData = data.map(d => ({
    timestamp: d[COLUMNS.TIMESTAMP],
    energy: d[COLUMNS.ENERGY],
    power: d[COLUMNS.ACTIVE_POWER],
    boards: d[COLUMNS.BOARDS_PRODUCED]
  })).filter(d => d.energy != null && d.power != null);

  const totalEnergy = Math.max(...energyData.map(d => d.energy)) - Math.min(...energyData.map(d => d.energy));
  const totalBoards = Math.max(...energyData.map(d => d.boards || 0));
  const avgPower = average(energyData.map(d => d.power));
  const peakPower = Math.max(...energyData.map(d => d.power));

  // Calculate energy per board
  const energyPerBoard = totalBoards > 0 ? totalEnergy / totalBoards : 0;

  // Power consumption by time of day (if data spans multiple hours)
  const hourlyConsumption = {};
  energyData.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    if (!hourlyConsumption[hour]) {
      hourlyConsumption[hour] = { power: [], count: 0 };
    }
    hourlyConsumption[hour].power.push(d.power);
    hourlyConsumption[hour].count++;
  });

  const hourlyAvg = Object.entries(hourlyConsumption).map(([hour, data]) => ({
    hour: parseInt(hour),
    avgPower: average(data.power),
    count: data.count
  }));

  return {
    totalEnergy: totalEnergy.toFixed(2),
    avgPower: avgPower.toFixed(2),
    peakPower: peakPower.toFixed(2),
    energyPerBoard: energyPerBoard.toFixed(4),
    efficiency: Math.round((avgPower / peakPower) * 100),
    hourlyConsumption: hourlyAvg,
    recommendations: generateEnergyRecommendations(avgPower, peakPower, energyPerBoard)
  };
}

function generateEnergyRecommendations(avgPower, peakPower, energyPerBoard) {
  const recommendations = [];

  const peakRatio = peakPower / avgPower;
  if (peakRatio > 1.5) {
    recommendations.push({
      title: 'Peak Demand Management',
      description: `Peak power (${peakPower.toFixed(1)} kW) is ${(peakRatio * 100 - 100).toFixed(0)}% above average. Consider load balancing.`,
      potential: '10-15% cost reduction'
    });
  }

  if (energyPerBoard > 0.1) {
    recommendations.push({
      title: 'Process Optimization',
      description: `Energy per board (${energyPerBoard.toFixed(4)} kWh) can be optimized through batch sizing.`,
      potential: '5-10% energy reduction'
    });
  }

  return recommendations;
}

function prepareTimeSeries(data) {
  // Sample for chart performance
  const chartData = data.filter((_, i) => i % 5 === 0).map(row => {
    const result = {
      timestamp: row[COLUMNS.TIMESTAMP],
      power: row[COLUMNS.ACTIVE_POWER],
      energy: row[COLUMNS.ENERGY],
      powerFactor: row[COLUMNS.POWER_FACTOR],
      o2: row[COLUMNS.O2_CONCENTRATION],
      flowRate: row[COLUMNS.FLOW_RATE],
      alarms: row[COLUMNS.ALARMS]
    };

    // Add zone temperatures
    for (let i = 1; i <= 10; i++) {
      result[`zone${i}Upper`] = row[`ZONE${i} UPPER Temperature (°C)`];
      result[`zone${i}Lower`] = row[`ZONE${i} LOWER Temperature (°C)`];
    }

    result.cool1 = row['COOL1 upper'];
    result.cool2 = row['COOL2 upper'];

    return result;
  });

  return chartData;
}

function getDateRange(data) {
  const timestamps = data
    .map(d => d[COLUMNS.TIMESTAMP])
    .filter(t => t)
    .map(t => new Date(t))
    .filter(d => !isNaN(d));

  if (timestamps.length === 0) return { start: null, end: null };

  return {
    start: new Date(Math.min(...timestamps)),
    end: new Date(Math.max(...timestamps))
  };
}

// Utility functions
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr) {
  if (!arr || arr.length === 0) return 0;
  const avg = average(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

function calculateTrend(arr) {
  if (!arr || arr.length < 2) return 'stable';
  const firstHalf = average(arr.slice(0, Math.floor(arr.length / 2)));
  const secondHalf = average(arr.slice(Math.floor(arr.length / 2)));
  const change = ((secondHalf - firstHalf) / firstHalf) * 100;
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}

function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}
