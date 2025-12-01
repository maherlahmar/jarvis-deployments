// Data processing utilities for SMT reflow oven energy analysis

export const ZONE_COLUMNS = {
  zone1: { upper: 'ZONE1 UPPER Temperature (°C)', lower: 'ZONE1 LOWER Temperature (°C)', blowerUpper: 'BLOWER1 UPPER Temperature (°C)', blowerLower: 'BLOWER1 LOWER Temperature (°C)' },
  zone2: { upper: 'ZONE2 UPPER Temperature (°C)', lower: 'ZONE2 LOWER Temperature (°C)', blowerUpper: 'BLOWER2 UPPER Temperature (°C)', blowerLower: 'BLOWER2 LOWER Temperature (°C)' },
  zone3: { upper: 'ZONE3 UPPER Temperature (°C)', lower: 'ZONE3 LOWER Temperature (°C)', blowerUpper: 'BLOWER3 UPPER Temperature (°C)', blowerLower: 'BLOWER3 LOWER Temperature (°C)' },
  zone4: { upper: 'ZONE4 UPPER Temperature (°C)', lower: 'ZONE4 LOWER Temperature (°C)', blowerUpper: 'BLOWER4 UPPER Temperature (°C)', blowerLower: 'BLOWER4 LOWER Temperature (°C)' },
  zone5: { upper: 'ZONE5 UPPER Temperature (°C)', lower: 'ZONE5 LOWER Temperature (°C)', blowerUpper: 'BLOWER5 UPPER Temperature (°C)', blowerLower: 'BLOWER5 LOWER Temperature (°C)' },
  zone6: { upper: 'ZONE6 UPPER Temperature (°C)', lower: 'ZONE6 LOWER Temperature (°C)', blowerUpper: 'BLOWER6 UPPER Temperature (°C)', blowerLower: 'BLOWER6 LOWER Temperature (°C)' },
  zone7: { upper: 'ZONE7 UPPER Temperature (°C)', lower: 'ZONE7 LOWER Temperature (°C)', blowerUpper: 'BLOWER7 UPPER Temperature (°C)', blowerLower: 'BLOWER7 LOWER Temperature (°C)' },
  zone8: { upper: 'ZONE8 UPPER Temperature (°C)', lower: 'ZONE8 LOWER Temperature (°C)', blowerUpper: 'BLOWER8 UPPER Temperature (°C)', blowerLower: 'BLOWER8 LOWER Temperature (°C)' },
  zone9: { upper: 'ZONE9 UPPER Temperature (°C)', lower: 'ZONE9 LOWER Temperature (°C)', blowerUpper: 'BLOWER9 UPPER Temperature (°C)', blowerLower: 'BLOWER9 LOWER Temperature (°C)' },
  zone10: { upper: 'ZONE10 UPPER Temperature (°C)', lower: 'ZONE10 LOWER Temperature (°C)', blowerUpper: 'BLOWER10 UPPER Temperature (°C)', blowerLower: 'BLOWER10 LOWER Temperature (°C)' }
};

export const ENERGY_COLUMNS = {
  cumulativeEnergy: 'Cumulative electric energy (kWh)',
  current: 'Electric current (A)',
  voltage: 'Voltage (V)',
  activePower: 'Active power (kW)',
  reactivePower: 'Reactive power (kVAR)',
  apparentPower: 'Apparent power (kVA)',
  powerFactor: 'Power factor (PF)',
  frequency: 'AC frequency (Hz)',
  phaseShift: 'Phase shift'
};

export const OPERATIONAL_COLUMNS = {
  loggingTime: 'Logging time',
  fileName: 'File name',
  boardsInside: 'Number of boards inside equipment',
  boardsProduced: 'Number of boards produced',
  productNumber: 'Product number information',
  productionStart: 'Production start time',
  productionEnd: 'Production end time',
  conveyorSpeed: 'C/V (Conveyor speed m/min)',
  conveyorWidth: 'Conveyor width (mm)',
  warpWidth: 'Warp prevention width (mm)',
  equipmentStatus: 'Equipment status',
  alarmCount: 'Number of alarms',
  flowRate: 'Flow rate (L/min)',
  o2Concentration: 'O2 concentration (ppm)',
  cool1: 'COOL1 upper',
  cool2: 'COOL2 upper'
};

// Parse a row from the CSV data
export function parseDataRow(row) {
  const zones = {};

  Object.entries(ZONE_COLUMNS).forEach(([zoneId, cols]) => {
    zones[zoneId] = {
      upper: parseFloat(row[cols.upper]) || 0,
      lower: parseFloat(row[cols.lower]) || 0,
      blowerUpper: parseFloat(row[cols.blowerUpper]) || 0,
      blowerLower: parseFloat(row[cols.blowerLower]) || 0
    };
    zones[zoneId].avgTemp = (zones[zoneId].upper + zones[zoneId].lower) / 2;
    zones[zoneId].delta = Math.abs(zones[zoneId].upper - zones[zoneId].lower);
  });

  return {
    timestamp: new Date(row[OPERATIONAL_COLUMNS.loggingTime]),
    energy: {
      cumulative: parseFloat(row[ENERGY_COLUMNS.cumulativeEnergy]) || 0,
      current: parseFloat(row[ENERGY_COLUMNS.current]) || 0,
      voltage: parseFloat(row[ENERGY_COLUMNS.voltage]) || 0,
      activePower: parseFloat(row[ENERGY_COLUMNS.activePower]) || 0,
      reactivePower: parseFloat(row[ENERGY_COLUMNS.reactivePower]) || 0,
      apparentPower: parseFloat(row[ENERGY_COLUMNS.apparentPower]) || 0,
      powerFactor: parseFloat(row[ENERGY_COLUMNS.powerFactor]) || 0,
      frequency: parseFloat(row[ENERGY_COLUMNS.frequency]) || 0
    },
    operational: {
      status: row[OPERATIONAL_COLUMNS.equipmentStatus] || 'Unknown',
      boardsInside: parseInt(row[OPERATIONAL_COLUMNS.boardsInside]) || 0,
      boardsProduced: parseInt(row[OPERATIONAL_COLUMNS.boardsProduced]) || 0,
      productNumber: row[OPERATIONAL_COLUMNS.productNumber] || '',
      conveyorSpeed: parseFloat(row[OPERATIONAL_COLUMNS.conveyorSpeed]) || 0,
      alarmCount: parseInt(row[OPERATIONAL_COLUMNS.alarmCount]) || 0,
      flowRate: parseFloat(row[OPERATIONAL_COLUMNS.flowRate]) || 0,
      o2Concentration: parseFloat(row[OPERATIONAL_COLUMNS.o2Concentration]) || 0
    },
    zones,
    cooling: {
      cool1: parseFloat(row[OPERATIONAL_COLUMNS.cool1]) || 0,
      cool2: parseFloat(row[OPERATIONAL_COLUMNS.cool2]) || 0
    }
  };
}

// Calculate delta between consecutive readings
export function calculateEnergyDelta(current, previous) {
  if (!previous) return 0;
  return current.energy.cumulative - previous.energy.cumulative;
}

// Group data by time intervals
export function groupByInterval(data, intervalMinutes = 60) {
  const groups = {};

  data.forEach(record => {
    const date = new Date(record.timestamp);
    const intervalStart = new Date(date);
    intervalStart.setMinutes(Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes, 0, 0);
    const key = intervalStart.toISOString();

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
  });

  return groups;
}

// Calculate statistics for a group of records
export function calculateGroupStats(records) {
  if (!records || records.length === 0) return null;

  const stats = {
    startTime: records[0].timestamp,
    endTime: records[records.length - 1].timestamp,
    recordCount: records.length,
    energy: {
      totalConsumed: records[records.length - 1].energy.cumulative - records[0].energy.cumulative,
      avgPower: 0,
      maxPower: 0,
      minPower: Infinity,
      avgPowerFactor: 0
    },
    zones: {},
    operational: {
      avgBoardsInside: 0,
      totalBoardsProduced: 0,
      avgO2: 0,
      totalAlarms: 0
    }
  };

  let powerSum = 0;
  let pfSum = 0;
  let boardsSum = 0;
  let o2Sum = 0;

  records.forEach(record => {
    powerSum += record.energy.activePower;
    pfSum += record.energy.powerFactor;
    boardsSum += record.operational.boardsInside;
    o2Sum += record.operational.o2Concentration;
    stats.operational.totalAlarms += record.operational.alarmCount;

    if (record.energy.activePower > stats.energy.maxPower) {
      stats.energy.maxPower = record.energy.activePower;
    }
    if (record.energy.activePower < stats.energy.minPower) {
      stats.energy.minPower = record.energy.activePower;
    }
  });

  stats.energy.avgPower = powerSum / records.length;
  stats.energy.avgPowerFactor = pfSum / records.length;
  stats.operational.avgBoardsInside = boardsSum / records.length;
  stats.operational.avgO2 = o2Sum / records.length;
  stats.operational.totalBoardsProduced = records[records.length - 1].operational.boardsProduced - records[0].operational.boardsProduced;

  // Zone statistics
  Object.keys(ZONE_COLUMNS).forEach(zoneId => {
    let tempSum = 0;
    let maxTemp = 0;
    let minTemp = Infinity;
    let deltaSum = 0;

    records.forEach(record => {
      const zone = record.zones[zoneId];
      tempSum += zone.avgTemp;
      deltaSum += zone.delta;
      if (zone.avgTemp > maxTemp) maxTemp = zone.avgTemp;
      if (zone.avgTemp < minTemp) minTemp = zone.avgTemp;
    });

    stats.zones[zoneId] = {
      avgTemp: tempSum / records.length,
      maxTemp,
      minTemp,
      avgDelta: deltaSum / records.length,
      tempVariance: maxTemp - minTemp
    };
  });

  return stats;
}

// Identify production phases from data
export function identifyProductionPhases(data) {
  const phases = [];
  let currentPhase = null;

  data.forEach((record, index) => {
    const isProducing = record.operational.boardsInside > 0 ||
                        record.operational.status === 'Operating';

    if (!currentPhase) {
      currentPhase = {
        type: isProducing ? 'production' : 'idle',
        startIndex: index,
        startTime: record.timestamp,
        records: [record]
      };
    } else if ((isProducing && currentPhase.type === 'idle') ||
               (!isProducing && currentPhase.type === 'production')) {
      // Phase change
      currentPhase.endIndex = index - 1;
      currentPhase.endTime = data[index - 1].timestamp;
      currentPhase.duration = (currentPhase.endTime - currentPhase.startTime) / 1000 / 60; // minutes
      phases.push(currentPhase);

      currentPhase = {
        type: isProducing ? 'production' : 'idle',
        startIndex: index,
        startTime: record.timestamp,
        records: [record]
      };
    } else {
      currentPhase.records.push(record);
    }
  });

  // Close the last phase
  if (currentPhase && currentPhase.records.length > 0) {
    currentPhase.endIndex = data.length - 1;
    currentPhase.endTime = data[data.length - 1].timestamp;
    currentPhase.duration = (currentPhase.endTime - currentPhase.startTime) / 1000 / 60;
    phases.push(currentPhase);
  }

  return phases;
}

// Format duration in human readable form
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format number with appropriate precision
export function formatNumber(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return value.toFixed(decimals);
}

// Format energy values
export function formatEnergy(kWh) {
  if (kWh >= 1000) {
    return `${(kWh / 1000).toFixed(2)} MWh`;
  }
  return `${kWh.toFixed(2)} kWh`;
}

// Format power values
export function formatPower(kW) {
  if (kW >= 1000) {
    return `${(kW / 1000).toFixed(2)} MW`;
  }
  return `${kW.toFixed(2)} kW`;
}
