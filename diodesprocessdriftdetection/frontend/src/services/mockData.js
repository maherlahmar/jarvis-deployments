// Mock data for preview mode when backend is unavailable

const processParameters = {
  temperature: {
    name: 'Temperature',
    unit: '\u00B0C',
    target: 25.0,
    ucl: 27.0,
    lcl: 23.0,
    usl: 28.0,
    lsl: 22.0,
    category: 'thermal'
  },
  pressure: {
    name: 'Chamber Pressure',
    unit: 'mTorr',
    target: 100.0,
    ucl: 105.0,
    lcl: 95.0,
    usl: 110.0,
    lsl: 90.0,
    category: 'vacuum'
  },
  gasFlow: {
    name: 'Gas Flow Rate',
    unit: 'sccm',
    target: 50.0,
    ucl: 52.0,
    lcl: 48.0,
    usl: 55.0,
    lsl: 45.0,
    category: 'gas'
  },
  rfPower: {
    name: 'RF Power',
    unit: 'W',
    target: 300.0,
    ucl: 310.0,
    lcl: 290.0,
    usl: 320.0,
    lsl: 280.0,
    category: 'power'
  },
  etchRate: {
    name: 'Etch Rate',
    unit: 'nm/min',
    target: 150.0,
    ucl: 158.0,
    lcl: 142.0,
    usl: 165.0,
    lsl: 135.0,
    category: 'process'
  },
  uniformity: {
    name: 'Uniformity',
    unit: '%',
    target: 2.0,
    ucl: 2.5,
    lcl: 0.5,
    usl: 3.0,
    lsl: 0.0,
    category: 'quality'
  },
  deposition: {
    name: 'Deposition Thickness',
    unit: 'nm',
    target: 100.0,
    ucl: 104.0,
    lcl: 96.0,
    usl: 108.0,
    lsl: 92.0,
    category: 'process'
  },
  humidity: {
    name: 'Humidity',
    unit: '%RH',
    target: 45.0,
    ucl: 48.0,
    lcl: 42.0,
    usl: 50.0,
    lsl: 40.0,
    category: 'environmental'
  }
};

const lines = ['Line A', 'Line B', 'Line C', 'Line D'];

function generateMockReading(timestamp, index) {
  const line = lines[index % 4];
  const parameters = {};

  Object.keys(processParameters).forEach(param => {
    const config = processParameters[param];
    const range = config.ucl - config.lcl;
    const noise = (Math.random() - 0.5) * range * 0.4;
    const drift = Math.sin(index * 0.02) * range * 0.1;
    parameters[param] = parseFloat((config.target + noise + drift).toFixed(4));
  });

  const spcResults = {};
  Object.keys(parameters).forEach(param => {
    const value = parameters[param];
    const config = processParameters[param];
    spcResults[param] = {
      value,
      target: config.target,
      ucl: config.ucl,
      lcl: config.lcl,
      usl: config.usl,
      lsl: config.lsl,
      deviation: value - config.target,
      deviationPercent: ((value - config.target) / config.target * 100),
      outOfControl: value > config.ucl || value < config.lcl,
      outOfSpec: value > config.usl || value < config.lsl,
      status: value > config.usl || value < config.lsl ? 'critical' :
        value > config.ucl || value < config.lcl ? 'warning' : 'normal'
    };
  });

  return {
    id: `RDG-${timestamp}-${index}`,
    timestamp,
    line,
    parameters,
    spcResults,
    quality: { overallStatus: 'normal' }
  };
}

function generateMockHistory(count = 200) {
  const now = Date.now();
  const readings = [];

  for (let i = count; i >= 0; i--) {
    const timestamp = now - (i * 30000);
    readings.push(generateMockReading(timestamp, count - i));
  }

  return readings;
}

function generateMockAlerts(count = 20) {
  const alerts = [];
  const types = ['OUT_OF_CONTROL', 'OUT_OF_SPEC', 'CUSUM_DRIFT', 'TREND', 'EWMA_DRIFT'];
  const severities = ['warning', 'critical', 'info'];
  const paramKeys = Object.keys(processParameters);

  for (let i = 0; i < count; i++) {
    const param = paramKeys[Math.floor(Math.random() * paramKeys.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = type === 'OUT_OF_SPEC' ? 'critical' :
      type === 'OUT_OF_CONTROL' ? 'warning' : severities[Math.floor(Math.random() * severities.length)];

    alerts.push({
      id: `ALT-${Date.now()}-${i}`,
      type,
      severity,
      parameter: param,
      parameterName: processParameters[param].name,
      value: processParameters[param].target + (Math.random() - 0.5) * 2,
      line: lines[Math.floor(Math.random() * lines.length)],
      message: `${type.replace(/_/g, ' ')} detected for ${processParameters[param].name}`,
      timestamp: Date.now() - (i * 300000),
      acknowledged: i > 5,
      acknowledgedAt: i > 5 ? Date.now() - (i * 200000) : null,
      createdAt: Date.now() - (i * 300000)
    });
  }

  return alerts;
}

function generateMockBatches(count = 15) {
  const batches = [];
  const products = ['PM-2000', 'PM-3000', 'PM-4000'];
  const statuses = ['completed', 'in_progress', 'completed'];

  for (let i = 0; i < count; i++) {
    const startTime = Date.now() - ((count - i) * 4 * 60 * 60 * 1000);
    batches.push({
      id: `BATCH-${String(1000 + i).padStart(4, '0')}`,
      startTime,
      endTime: i < count - 1 ? startTime + (4 * 60 * 60 * 1000) : null,
      line: lines[i % 4],
      product: products[i % 3],
      waferCount: 25,
      yieldPercent: 85 + Math.random() * 12,
      status: i === count - 1 ? 'in_progress' : 'completed',
      defects: Math.floor(Math.random() * 5),
      processDeviations: Math.floor(Math.random() * 3)
    });
  }

  return batches;
}

function generateMockStatistics() {
  return {
    totalReadings: 1247,
    totalAlerts: 34,
    unacknowledgedAlerts: 8,
    activeBatches: 1,
    outOfSpecPercent: '2.3',
    avgYield: '91.4',
    uptime: 86400
  };
}

function generateMockSpcSummary() {
  const summary = {};

  Object.keys(processParameters).forEach(param => {
    const config = processParameters[param];
    const mean = config.target + (Math.random() - 0.5) * 0.5;
    const stdDev = (config.ucl - config.lcl) / 6 * (0.8 + Math.random() * 0.4);

    summary[param] = {
      mean: parseFloat(mean.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      min: parseFloat((mean - 2 * stdDev).toFixed(4)),
      max: parseFloat((mean + 2 * stdDev).toFixed(4)),
      range: parseFloat((4 * stdDev).toFixed(4)),
      cp: parseFloat((1.0 + Math.random() * 0.5).toFixed(3)),
      cpk: parseFloat((0.9 + Math.random() * 0.4).toFixed(3)),
      ppk: parseFloat((0.85 + Math.random() * 0.4).toFixed(3)),
      outOfControlPercent: parseFloat((Math.random() * 5).toFixed(1)),
      outOfSpecPercent: parseFloat((Math.random() * 2).toFixed(1)),
      sampleSize: 100
    };
  });

  return summary;
}

function generateMockDriftResults() {
  const results = {};

  Object.keys(processParameters).forEach(param => {
    const hasDrift = Math.random() > 0.7;
    const hasTrend = Math.random() > 0.6;

    results[param] = {
      cusum: {
        cusumPlus: parseFloat((Math.random() * 4).toFixed(3)),
        cusumMinus: parseFloat((Math.random() * 4).toFixed(3)),
        threshold: 5.0,
        alarm: hasDrift && Math.random() > 0.5,
        warning: hasDrift && Math.random() > 0.3,
        direction: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      ewma: {
        value: processParameters[param].target + (Math.random() - 0.5) * 0.5,
        ucl: processParameters[param].ucl,
        lcl: processParameters[param].lcl,
        target: processParameters[param].target,
        alarm: false,
        warning: hasDrift,
        deviation: parseFloat(((Math.random() - 0.5) * 0.5).toFixed(4))
      },
      trend: {
        slope: parseFloat(((Math.random() - 0.5) * 0.01).toFixed(6)),
        intercept: processParameters[param].target,
        rSquared: parseFloat((Math.random() * 0.5).toFixed(4)),
        projectedDrift: parseFloat(((Math.random() - 0.5) * 2).toFixed(4)),
        significant: hasTrend,
        direction: Math.random() > 0.5 ? 'increasing' : 'decreasing'
      },
      shift: {
        baselineMean: processParameters[param].target,
        recentMean: processParameters[param].target + (Math.random() - 0.5) * 0.3,
        shift: parseFloat(((Math.random() - 0.5) * 0.3).toFixed(4)),
        shiftInSigmas: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
        detected: false,
        direction: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      overall: hasDrift ? 'warning' : 'normal'
    };
  });

  return { status: 'analyzed', timestamp: Date.now(), results };
}

// Simulation for real-time updates
let simulationInterval = null;
let readingIndex = 200;

export function startMockSimulation(callbacks) {
  if (simulationInterval) return;

  simulationInterval = setInterval(() => {
    readingIndex++;
    const reading = generateMockReading(Date.now(), readingIndex);

    if (callbacks.onReading) {
      callbacks.onReading(reading);
    }

    // Occasionally generate alerts
    if (Math.random() > 0.9 && callbacks.onAlert) {
      const paramKeys = Object.keys(processParameters);
      const param = paramKeys[Math.floor(Math.random() * paramKeys.length)];
      const alert = {
        id: `ALT-${Date.now()}`,
        type: 'OUT_OF_CONTROL',
        severity: 'warning',
        parameter: param,
        parameterName: processParameters[param].name,
        value: reading.parameters[param],
        line: reading.line,
        message: `Parameter deviation detected for ${processParameters[param].name}`,
        timestamp: Date.now(),
        acknowledged: false,
        createdAt: Date.now()
      };
      callbacks.onAlert(alert);
    }
  }, 2000);
}

export function stopMockSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

export function getMockInitData() {
  return {
    parameters: processParameters,
    lines,
    recentHistory: generateMockHistory(200),
    alerts: generateMockAlerts(20),
    batches: generateMockBatches(15)
  };
}

export function getMockStatistics() {
  return generateMockStatistics();
}

export function getMockSpcSummary() {
  return generateMockSpcSummary();
}

export function getMockDriftStatus() {
  return generateMockDriftResults();
}

export function getMockReadings(count = 100) {
  return generateMockHistory(count);
}

export function getMockBatches() {
  return generateMockBatches(15);
}

export function getMockAlerts() {
  return generateMockAlerts(20);
}

export { processParameters, lines };
