import Papa from 'papaparse';

const ZONE_COUNT = 10;
const ENERGY_COST_PER_KWH = 0.12; // USD per kWh
const OPTIMAL_POWER_FACTOR = 0.95;
const IDLE_POWER_THRESHOLD = 5; // kW - power below this when not producing is waste

export async function loadCSVData(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => reject(error)
    });
  });
}

export function processOvenData(rawData) {
  const processed = rawData.map((row, index) => {
    const timestamp = new Date(row['Logging time']);
    const status = row['Equipment status'];
    const boardsInside = row['Number of boards inside equipment'] || 0;
    const boardsProduced = row['Number of boards produced'] || 0;
    const activePower = row['Active power (kW)'] || 0;
    const cumulativeEnergy = row['Cumulative electric energy (kWh)'] || 0;
    const powerFactor = row['Power factor (PF)'] || 0;

    // Extract zone temperatures
    const zones = [];
    for (let i = 1; i <= ZONE_COUNT; i++) {
      zones.push({
        zone: i,
        upperTemp: row[`ZONE${i} UPPER Temperature (°C)`] || 0,
        lowerTemp: row[`ZONE${i} LOWER Temperature (°C)`] || 0,
        blowerUpper: row[`BLOWER${i} UPPER Temperature (°C)`] || 0,
        blowerLower: row[`BLOWER${i} LOWER Temperature (°C)`] || 0,
      });
    }

    // Calculate zone average temp
    const avgZoneTemp = zones.reduce((acc, z) => acc + (z.upperTemp + z.lowerTemp) / 2, 0) / zones.length;

    // Identify energy waste scenarios
    const isIdle = status === 'Operating' && boardsInside === 0 && activePower > IDLE_POWER_THRESHOLD;
    const lowPowerFactor = powerFactor > 0 && powerFactor < OPTIMAL_POWER_FACTOR - 0.05;
    const highTempVariance = calculateTempVariance(zones) > 10;

    return {
      id: index,
      timestamp,
      hour: timestamp.getHours(),
      dayOfWeek: timestamp.getDay(),
      date: timestamp.toISOString().split('T')[0],
      status,
      boardsInside,
      boardsProduced,
      productNumber: row['Product number information'],
      conveyorSpeed: row['C/V (Conveyor speed m/min)'] || 0,
      activePower,
      reactivePower: row['Reactive power (kVAR)'] || 0,
      apparentPower: row['Apparent power (kVA)'] || 0,
      powerFactor,
      cumulativeEnergy,
      voltage: row['Voltage (V)'] || 0,
      current: row['Electric current (A)'] || 0,
      o2Concentration: row['O2 concentration (ppm)'] || 0,
      flowRate: row['Flow rate (L/min)'] || 0,
      alarmCount: row['Number of alarms'] || 0,
      zones,
      avgZoneTemp,
      cool1Temp: row['COOL1 upper'] || 0,
      cool2Temp: row['COOL2 upper'] || 0,
      // Waste indicators
      isIdle,
      lowPowerFactor,
      highTempVariance,
      hasWaste: isIdle || lowPowerFactor || highTempVariance,
    };
  });

  return processed;
}

function calculateTempVariance(zones) {
  const temps = zones.flatMap(z => [z.upperTemp, z.lowerTemp]);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  const variance = temps.reduce((acc, t) => acc + Math.pow(t - avg, 2), 0) / temps.length;
  return Math.sqrt(variance);
}

export function calculateEnergyMetrics(data) {
  if (!data || data.length === 0) return null;

  const operatingData = data.filter(d => d.status === 'Operating');
  const idleData = data.filter(d => d.isIdle);

  // Calculate total energy from cumulative readings
  const maxEnergy = Math.max(...data.map(d => d.cumulativeEnergy));
  const minEnergy = Math.min(...data.map(d => d.cumulativeEnergy));
  const totalEnergyConsumed = maxEnergy - minEnergy;

  // Calculate average power
  const avgPower = operatingData.reduce((acc, d) => acc + d.activePower, 0) / operatingData.length || 0;
  const maxPower = Math.max(...operatingData.map(d => d.activePower));
  const minPower = Math.min(...operatingData.filter(d => d.activePower > 0).map(d => d.activePower)) || 0;

  // Calculate idle energy waste
  const idleEnergyWaste = idleData.length * (avgPower * 10 / 3600); // 10 second intervals
  const idlePercentage = (idleData.length / data.length) * 100;

  // Power factor analysis
  const avgPowerFactor = operatingData.reduce((acc, d) => acc + d.powerFactor, 0) / operatingData.length || 0;
  const powerFactorLosses = operatingData.filter(d => d.lowPowerFactor).length;

  // Total boards produced
  const totalBoardsProduced = Math.max(...data.map(d => d.boardsProduced));

  // Energy per board
  const energyPerBoard = totalBoardsProduced > 0 ? totalEnergyConsumed / totalBoardsProduced : 0;

  // Cost calculations
  const totalEnergyCost = totalEnergyConsumed * ENERGY_COST_PER_KWH;
  const wastedEnergyCost = idleEnergyWaste * ENERGY_COST_PER_KWH;

  // Calculate potential savings
  const potentialIdleSavings = idleEnergyWaste * ENERGY_COST_PER_KWH;
  const potentialPFSavings = (1 - avgPowerFactor / OPTIMAL_POWER_FACTOR) * totalEnergyCost * 0.1;

  return {
    totalEnergyConsumed,
    avgPower,
    maxPower,
    minPower,
    avgPowerFactor,
    idleEnergyWaste,
    idlePercentage,
    totalBoardsProduced,
    energyPerBoard,
    totalEnergyCost,
    wastedEnergyCost,
    potentialIdleSavings,
    potentialPFSavings,
    totalPotentialSavings: potentialIdleSavings + potentialPFSavings,
    powerFactorLossInstances: powerFactorLosses,
    dataPointCount: data.length,
    operatingDataCount: operatingData.length,
  };
}

export function calculateHourlyMetrics(data) {
  const hourlyData = {};

  data.forEach(d => {
    const hour = d.hour;
    if (!hourlyData[hour]) {
      hourlyData[hour] = {
        hour,
        totalPower: 0,
        count: 0,
        idleCount: 0,
        boardsProduced: 0,
      };
    }
    hourlyData[hour].totalPower += d.activePower;
    hourlyData[hour].count += 1;
    if (d.isIdle) hourlyData[hour].idleCount += 1;
  });

  return Object.values(hourlyData).map(h => ({
    hour: h.hour,
    hourLabel: `${h.hour.toString().padStart(2, '0')}:00`,
    avgPower: h.totalPower / h.count,
    idlePercentage: (h.idleCount / h.count) * 100,
  })).sort((a, b) => a.hour - b.hour);
}

export function calculateDailyMetrics(data) {
  const dailyData = {};

  data.forEach(d => {
    const date = d.date;
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        readings: [],
        idleCount: 0,
        totalPower: 0,
        count: 0,
        maxEnergy: 0,
        minEnergy: Infinity,
      };
    }
    dailyData[date].readings.push(d);
    dailyData[date].totalPower += d.activePower;
    dailyData[date].count += 1;
    if (d.isIdle) dailyData[date].idleCount += 1;
    dailyData[date].maxEnergy = Math.max(dailyData[date].maxEnergy, d.cumulativeEnergy);
    dailyData[date].minEnergy = Math.min(dailyData[date].minEnergy, d.cumulativeEnergy);
  });

  return Object.values(dailyData).map(day => ({
    date: day.date,
    energyConsumed: day.maxEnergy - day.minEnergy,
    avgPower: day.totalPower / day.count,
    idlePercentage: (day.idleCount / day.count) * 100,
    cost: (day.maxEnergy - day.minEnergy) * ENERGY_COST_PER_KWH,
    readingCount: day.count,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getZoneAnalysis(data) {
  const zoneStats = Array(ZONE_COUNT).fill(null).map((_, i) => ({
    zone: i + 1,
    avgUpperTemp: 0,
    avgLowerTemp: 0,
    maxUpperTemp: -Infinity,
    minUpperTemp: Infinity,
    tempVariance: 0,
    count: 0,
    readings: [],
  }));

  data.forEach(d => {
    d.zones.forEach((zone, i) => {
      zoneStats[i].avgUpperTemp += zone.upperTemp;
      zoneStats[i].avgLowerTemp += zone.lowerTemp;
      zoneStats[i].maxUpperTemp = Math.max(zoneStats[i].maxUpperTemp, zone.upperTemp);
      zoneStats[i].minUpperTemp = Math.min(zoneStats[i].minUpperTemp, zone.upperTemp);
      zoneStats[i].count += 1;
      zoneStats[i].readings.push(zone.upperTemp);
    });
  });

  return zoneStats.map(z => {
    const avgTemp = z.avgUpperTemp / z.count;
    const variance = z.readings.reduce((acc, t) => acc + Math.pow(t - avgTemp, 2), 0) / z.count;

    return {
      zone: z.zone,
      avgUpperTemp: z.avgUpperTemp / z.count,
      avgLowerTemp: z.avgLowerTemp / z.count,
      maxUpperTemp: z.maxUpperTemp,
      minUpperTemp: z.minUpperTemp,
      tempVariance: Math.sqrt(variance),
      tempRange: z.maxUpperTemp - z.minUpperTemp,
    };
  });
}

export function generateAlerts(data, metrics) {
  const alerts = [];
  const recentData = data.slice(-360); // Last hour (10-second intervals)

  // High idle time alert
  if (metrics.idlePercentage > 10) {
    alerts.push({
      id: 'idle-high',
      type: 'warning',
      title: 'High Idle Time Detected',
      message: `Oven is idle ${metrics.idlePercentage.toFixed(1)}% of the time while still consuming power. Consider optimizing batch scheduling.`,
      potentialSavings: metrics.potentialIdleSavings,
      priority: 'high',
    });
  }

  // Low power factor alert
  if (metrics.avgPowerFactor < OPTIMAL_POWER_FACTOR - 0.03) {
    alerts.push({
      id: 'pf-low',
      type: 'warning',
      title: 'Low Power Factor',
      message: `Average power factor is ${(metrics.avgPowerFactor * 100).toFixed(1)}%. Target is ${(OPTIMAL_POWER_FACTOR * 100)}%. Consider power factor correction equipment.`,
      potentialSavings: metrics.potentialPFSavings,
      priority: 'medium',
    });
  }

  // High energy consumption alert
  const avgDailyEnergy = metrics.totalEnergyConsumed / (data.length / 8640); // Assuming ~8640 readings per day
  if (avgDailyEnergy > 600) {
    alerts.push({
      id: 'energy-high',
      type: 'danger',
      title: 'High Energy Consumption',
      message: `Average daily energy consumption is ${avgDailyEnergy.toFixed(0)} kWh. Review zone temperature settings and conveyor speed.`,
      potentialSavings: avgDailyEnergy * 0.1 * ENERGY_COST_PER_KWH,
      priority: 'high',
    });
  }

  // Zone temperature variance alert
  const zoneAnalysis = getZoneAnalysis(recentData);
  const highVarianceZones = zoneAnalysis.filter(z => z.tempVariance > 15);
  if (highVarianceZones.length > 0) {
    alerts.push({
      id: 'zone-variance',
      type: 'warning',
      title: 'Temperature Variance Detected',
      message: `Zones ${highVarianceZones.map(z => z.zone).join(', ')} show high temperature variance. Check heater elements and blowers.`,
      priority: 'medium',
    });
  }

  // Recent idle detection
  const recentIdleCount = recentData.filter(d => d.isIdle).length;
  if (recentIdleCount > 60) { // More than 10 minutes idle in last hour
    alerts.push({
      id: 'recent-idle',
      type: 'info',
      title: 'Recent Idle Period',
      message: `Oven was idle for ${Math.round(recentIdleCount * 10 / 60)} minutes in the last hour while consuming power.`,
      priority: 'low',
    });
  }

  return alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function generateRecommendations(metrics, zoneAnalysis, alerts) {
  const recommendations = [];

  // Based on idle time
  if (metrics.idlePercentage > 5) {
    recommendations.push({
      id: 'rec-batch',
      title: 'Optimize Batch Scheduling',
      description: 'Schedule PCB batches closer together to reduce idle time between runs.',
      impact: 'high',
      estimatedSavings: metrics.potentialIdleSavings,
      category: 'scheduling',
    });
  }

  // Based on power factor
  if (metrics.avgPowerFactor < OPTIMAL_POWER_FACTOR) {
    recommendations.push({
      id: 'rec-pf',
      title: 'Install Power Factor Correction',
      description: 'Add capacitor banks or active PFC to improve power factor and reduce reactive power losses.',
      impact: 'medium',
      estimatedSavings: metrics.potentialPFSavings,
      category: 'equipment',
    });
  }

  // Based on zone analysis
  const hotZones = zoneAnalysis.filter(z => z.avgUpperTemp > 200);
  if (hotZones.length > 3) {
    recommendations.push({
      id: 'rec-temp',
      title: 'Review Temperature Profiles',
      description: `${hotZones.length} zones running above 200°C. Verify if lower temperatures are acceptable for current products.`,
      impact: 'medium',
      estimatedSavings: metrics.totalEnergyCost * 0.05,
      category: 'process',
    });
  }

  // Conveyor speed optimization
  if (metrics.energyPerBoard > 1.5) {
    recommendations.push({
      id: 'rec-conveyor',
      title: 'Optimize Conveyor Speed',
      description: 'Energy per board is high. Consider adjusting conveyor speed to optimize throughput vs energy consumption.',
      impact: 'medium',
      estimatedSavings: metrics.totalEnergyCost * 0.08,
      category: 'process',
    });
  }

  // Standby mode
  if (metrics.idlePercentage > 15) {
    recommendations.push({
      id: 'rec-standby',
      title: 'Implement Automatic Standby',
      description: 'Configure automatic standby mode when no boards are detected for extended periods.',
      impact: 'high',
      estimatedSavings: metrics.potentialIdleSavings * 0.7,
      category: 'automation',
    });
  }

  // Preventive maintenance
  const highVarianceZones = zoneAnalysis.filter(z => z.tempVariance > 10);
  if (highVarianceZones.length > 0) {
    recommendations.push({
      id: 'rec-maintenance',
      title: 'Schedule Zone Maintenance',
      description: `Zones ${highVarianceZones.map(z => z.zone).join(', ')} show temperature instability. Check heaters, thermocouples, and blowers.`,
      impact: 'medium',
      estimatedSavings: 0,
      category: 'maintenance',
    });
  }

  return recommendations.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

export function getTimeRangeData(data, startDate, endDate) {
  return data.filter(d => {
    const timestamp = d.timestamp;
    return timestamp >= startDate && timestamp <= endDate;
  });
}

export function aggregateForChart(data, interval = 'hour') {
  const aggregated = {};

  data.forEach(d => {
    let key;
    switch (interval) {
      case 'minute':
        key = `${d.date} ${d.hour.toString().padStart(2, '0')}:${Math.floor(d.timestamp.getMinutes() / 5) * 5}`;
        break;
      case 'hour':
        key = `${d.date} ${d.hour.toString().padStart(2, '0')}:00`;
        break;
      case 'day':
      default:
        key = d.date;
    }

    if (!aggregated[key]) {
      aggregated[key] = {
        timestamp: key,
        totalPower: 0,
        count: 0,
        avgTemp: 0,
        maxPower: 0,
      };
    }

    aggregated[key].totalPower += d.activePower;
    aggregated[key].count += 1;
    aggregated[key].avgTemp += d.avgZoneTemp;
    aggregated[key].maxPower = Math.max(aggregated[key].maxPower, d.activePower);
  });

  return Object.values(aggregated).map(a => ({
    timestamp: a.timestamp,
    avgPower: a.totalPower / a.count,
    avgTemp: a.avgTemp / a.count,
    maxPower: a.maxPower,
  }));
}
