class ProcessDataGenerator {
  constructor() {
    this.driftStates = {};
    this.shiftStates = {};
    this.noiseLevel = 0.3;
  }

  generateReading(parameters, timestamp, iteration) {
    const lines = ['Line A', 'Line B', 'Line C', 'Line D'];
    const line = lines[iteration % 4];

    const reading = {
      id: `RDG-${timestamp}-${iteration}`,
      timestamp,
      line,
      parameters: {},
      quality: {}
    };

    Object.keys(parameters).forEach(param => {
      const config = parameters[param];
      reading.parameters[param] = this.generateParameterValue(param, config, iteration, line);
    });

    // Calculate quality metrics
    reading.quality = this.calculateQualityMetrics(reading.parameters, parameters);

    return reading;
  }

  generateParameterValue(paramName, config, iteration, line) {
    const { target, ucl, lcl } = config;
    const range = ucl - lcl;

    // Initialize drift state for this parameter
    if (!this.driftStates[paramName]) {
      this.driftStates[paramName] = {
        drift: 0,
        driftRate: (Math.random() - 0.5) * 0.001,
        lastShift: 0
      };
    }

    const state = this.driftStates[paramName];

    // Simulate gradual drift
    state.drift += state.driftRate;

    // Occasionally reset or reverse drift
    if (Math.random() < 0.001) {
      state.driftRate = (Math.random() - 0.5) * 0.002;
    }

    // Simulate occasional step changes (process shifts)
    if (Math.random() < 0.002 && iteration - state.lastShift > 50) {
      state.drift += (Math.random() - 0.5) * range * 0.3;
      state.lastShift = iteration;
    }

    // Line-specific offset
    const lineOffset = {
      'Line A': 0,
      'Line B': 0.02,
      'Line C': -0.01,
      'Line D': 0.015
    }[line] || 0;

    // Add cyclical variation (simulating environmental effects)
    const cyclical = Math.sin(iteration * 0.05) * range * 0.05;

    // Random noise
    const noise = (Math.random() - 0.5) * range * this.noiseLevel;

    // Occasional outliers
    let outlier = 0;
    if (Math.random() < 0.005) {
      outlier = (Math.random() - 0.5) * range * 0.8;
    }

    // Calculate final value
    let value = target + state.drift + (lineOffset * range) + cyclical + noise + outlier;

    // Ensure value stays within physical limits (spec limits)
    const { usl, lsl } = config;
    value = Math.max(lsl * 0.9, Math.min(usl * 1.1, value));

    return parseFloat(value.toFixed(4));
  }

  calculateQualityMetrics(paramValues, parameters) {
    const metrics = {
      cpk: 0,
      ppk: 0,
      overallStatus: 'normal'
    };

    let outOfControlCount = 0;
    let outOfSpecCount = 0;

    Object.keys(paramValues).forEach(param => {
      const value = paramValues[param];
      const config = parameters[param];

      if (value > config.ucl || value < config.lcl) {
        outOfControlCount++;
      }

      if (value > config.usl || value < config.lsl) {
        outOfSpecCount++;
      }
    });

    if (outOfSpecCount > 0) {
      metrics.overallStatus = 'critical';
    } else if (outOfControlCount > 0) {
      metrics.overallStatus = 'warning';
    }

    return metrics;
  }

  // Generate correlated parameter changes (e.g., temperature affects etch rate)
  applyCorrelations(paramValues, parameters) {
    const correlations = {
      temperature: { etchRate: 0.8, uniformity: -0.3 },
      pressure: { etchRate: 0.5, deposition: 0.6 },
      rfPower: { etchRate: 0.7, uniformity: 0.4 },
      gasFlow: { etchRate: 0.4, deposition: 0.5 }
    };

    Object.keys(correlations).forEach(source => {
      const targets = correlations[source];
      const sourceDeviation = (paramValues[source] - parameters[source].target) /
        (parameters[source].ucl - parameters[source].lcl);

      Object.keys(targets).forEach(target => {
        if (paramValues[target] !== undefined) {
          const correlation = targets[target];
          const targetRange = parameters[target].ucl - parameters[target].lcl;
          paramValues[target] += sourceDeviation * correlation * targetRange * 0.1;
        }
      });
    });

    return paramValues;
  }
}

module.exports = ProcessDataGenerator;
