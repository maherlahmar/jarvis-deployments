import Papa from 'papaparse';

export const COLUMN_MAPPING = {
  timestamp: 'Logging time',
  fileName: 'File name',
  cumulativeEnergy: 'Cumulative electric energy (kWh)',
  current: 'Electric current (A)',
  voltage: 'Voltage (V)',
  activePower: 'Active power (kW)',
  reactivePower: 'Reactive power (kVAR)',
  apparentPower: 'Apparent power (kVA)',
  powerFactor: 'Power factor (PF)',
  acFrequency: 'AC frequency (Hz)',
  phaseShift: 'Phase shift',
  boardsInside: 'Number of boards inside equipment',
  boardsProduced: 'Number of boards produced',
  productNumber: 'Product number information',
  productionStart: 'Production start time',
  productionEnd: 'Production end time',
  conveyorSpeed: 'C/V (Conveyor speed m/min)',
  conveyorWidth: 'Conveyor width (mm)',
  warpPreventionWidth: 'Warp prevention width (mm)',
  equipmentStatus: 'Equipment status',
  alarmCount: 'Number of alarms',
  flowRate: 'Flow rate (L/min)',
  o2Concentration: 'O2 concentration (ppm)',
};

export const ZONE_COLUMNS = [];
for (let i = 1; i <= 10; i++) {
  ZONE_COLUMNS.push({
    zone: i,
    upperTemp: `ZONE${i} UPPER Temperature (°C)`,
    lowerTemp: `ZONE${i} LOWER Temperature (°C)`,
    blowerUpperTemp: `BLOWER${i} UPPER Temperature (°C)`,
    blowerLowerTemp: `BLOWER${i} LOWER Temperature (°C)`,
  });
}

export const COOL_COLUMNS = [
  { name: 'COOL1 upper', key: 'cool1Upper' },
  { name: 'COOL2 upper', key: 'cool2Upper' },
];

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        const processedData = processData(results.data);
        resolve(processedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function parseCSVString(csvString) {
  const results = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }

  return processData(results.data);
}

function processData(rawData) {
  return rawData.map((row, index) => {
    const processed = {
      id: index,
      timestamp: row[COLUMN_MAPPING.timestamp] ? new Date(row[COLUMN_MAPPING.timestamp]) : null,
      fileName: row[COLUMN_MAPPING.fileName],

      electrical: {
        cumulativeEnergy: parseFloat(row[COLUMN_MAPPING.cumulativeEnergy]) || 0,
        current: parseFloat(row[COLUMN_MAPPING.current]) || 0,
        voltage: parseFloat(row[COLUMN_MAPPING.voltage]) || 0,
        activePower: parseFloat(row[COLUMN_MAPPING.activePower]) || 0,
        reactivePower: parseFloat(row[COLUMN_MAPPING.reactivePower]) || 0,
        apparentPower: parseFloat(row[COLUMN_MAPPING.apparentPower]) || 0,
        powerFactor: parseFloat(row[COLUMN_MAPPING.powerFactor]) || 0,
        acFrequency: parseFloat(row[COLUMN_MAPPING.acFrequency]) || 0,
        phaseShift: parseFloat(row[COLUMN_MAPPING.phaseShift]) || 0,
      },

      production: {
        boardsInside: parseInt(row[COLUMN_MAPPING.boardsInside]) || 0,
        boardsProduced: parseInt(row[COLUMN_MAPPING.boardsProduced]) || 0,
        productNumber: row[COLUMN_MAPPING.productNumber],
        productionStart: row[COLUMN_MAPPING.productionStart] ? new Date(row[COLUMN_MAPPING.productionStart]) : null,
        productionEnd: row[COLUMN_MAPPING.productionEnd] ? new Date(row[COLUMN_MAPPING.productionEnd]) : null,
      },

      conveyor: {
        speed: parseFloat(row[COLUMN_MAPPING.conveyorSpeed]) || 0,
        width: parseFloat(row[COLUMN_MAPPING.conveyorWidth]) || 0,
        warpPreventionWidth: parseFloat(row[COLUMN_MAPPING.warpPreventionWidth]) || 0,
      },

      status: {
        equipment: row[COLUMN_MAPPING.equipmentStatus],
        alarmCount: parseInt(row[COLUMN_MAPPING.alarmCount]) || 0,
      },

      atmosphere: {
        flowRate: parseFloat(row[COLUMN_MAPPING.flowRate]) || 0,
        o2Concentration: parseFloat(row[COLUMN_MAPPING.o2Concentration]) || 0,
      },

      zones: ZONE_COLUMNS.map((zone) => ({
        zone: zone.zone,
        upperTemp: parseFloat(row[zone.upperTemp]) || 0,
        lowerTemp: parseFloat(row[zone.lowerTemp]) || 0,
        blowerUpperTemp: parseFloat(row[zone.blowerUpperTemp]) || 0,
        blowerLowerTemp: parseFloat(row[zone.blowerLowerTemp]) || 0,
      })),

      cooling: {
        cool1Upper: parseFloat(row['COOL1 upper']) || 0,
        cool2Upper: parseFloat(row['COOL2 upper']) || 0,
      },
    };

    return processed;
  });
}

export function getDataSummary(data) {
  if (!data || data.length === 0) {
    return null;
  }

  const timestamps = data.filter(d => d.timestamp).map(d => d.timestamp);
  const startTime = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
  const endTime = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

  return {
    totalRecords: data.length,
    timeRange: {
      start: startTime,
      end: endTime,
      durationMinutes: startTime && endTime ? Math.round((endTime - startTime) / 60000) : 0,
    },
    zones: 10,
    uniqueProducts: [...new Set(data.map(d => d.production.productNumber).filter(Boolean))],
    equipmentStatuses: [...new Set(data.map(d => d.status.equipment).filter(Boolean))],
  };
}
