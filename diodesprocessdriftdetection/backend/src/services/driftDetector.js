class DriftDetector {
  constructor() {
    this.cusumStates = {};
    this.ewmaStates = {};
    this.trendStates = {};

    // CUSUM parameters
    this.cusumK = 0.5; // Slack value (allowable slack)
    this.cusumH = 5.0; // Decision interval (threshold)

    // EWMA parameters
    this.ewmaLambda = 0.2; // Smoothing factor (0 < lambda <= 1)
    this.ewmaL = 3.0; // Control limit width in sigmas
  }

  detect(history, parameters) {
    if (history.length < 20) {
      return { status: 'insufficient_data', results: {} };
    }

    const results = {};

    Object.keys(parameters).forEach(param => {
      const values = history.map(r => r.parameters[param]).filter(v => v !== undefined);
      const config = parameters[param];

      results[param] = {
        cusum: this.detectCUSUM(param, values, config),
        ewma: this.detectEWMA(param, values, config),
        trend: this.detectTrend(param, values, config),
        shift: this.detectShift(values, config),
        overall: null
      };

      // Determine overall drift status
      const { cusum, ewma, trend, shift } = results[param];
      if (cusum.alarm || ewma.alarm || shift.detected) {
        results[param].overall = 'critical';
      } else if (trend.significant || cusum.warning || ewma.warning) {
        results[param].overall = 'warning';
      } else {
        results[param].overall = 'normal';
      }
    });

    return {
      status: 'analyzed',
      timestamp: Date.now(),
      results
    };
  }

  detectCUSUM(paramName, values, config) {
    if (!this.cusumStates[paramName]) {
      this.cusumStates[paramName] = {
        cusumPlus: 0,
        cusumMinus: 0,
        baseline: null
      };
    }

    const state = this.cusumStates[paramName];
    const { target } = config;
    const sigma = (config.ucl - config.lcl) / 6;

    // Initialize baseline
    if (state.baseline === null && values.length >= 20) {
      const baselineValues = values.slice(0, 20);
      state.baseline = baselineValues.reduce((a, b) => a + b, 0) / baselineValues.length;
    }

    const baseline = state.baseline || target;
    const currentValue = values[values.length - 1];

    // Normalized deviation
    const z = (currentValue - baseline) / sigma;

    // Update CUSUM statistics
    state.cusumPlus = Math.max(0, state.cusumPlus + z - this.cusumK);
    state.cusumMinus = Math.max(0, state.cusumMinus - z - this.cusumK);

    const result = {
      cusumPlus: parseFloat(state.cusumPlus.toFixed(3)),
      cusumMinus: parseFloat(state.cusumMinus.toFixed(3)),
      threshold: this.cusumH,
      alarm: false,
      warning: false,
      direction: null
    };

    // Check for alarms
    if (state.cusumPlus > this.cusumH) {
      result.alarm = true;
      result.direction = 'positive';
    } else if (state.cusumMinus > this.cusumH) {
      result.alarm = true;
      result.direction = 'negative';
    } else if (state.cusumPlus > this.cusumH * 0.7 || state.cusumMinus > this.cusumH * 0.7) {
      result.warning = true;
      result.direction = state.cusumPlus > state.cusumMinus ? 'positive' : 'negative';
    }

    // Reset if alarm triggered (optional auto-reset)
    if (result.alarm) {
      state.cusumPlus = 0;
      state.cusumMinus = 0;
    }

    return result;
  }

  detectEWMA(paramName, values, config) {
    if (!this.ewmaStates[paramName]) {
      this.ewmaStates[paramName] = {
        ewma: null,
        variance: null
      };
    }

    const state = this.ewmaStates[paramName];
    const { target } = config;
    const sigma = (config.ucl - config.lcl) / 6;

    // Initialize EWMA
    if (state.ewma === null) {
      state.ewma = target;
      state.variance = sigma * sigma;
    }

    const currentValue = values[values.length - 1];

    // Update EWMA
    state.ewma = this.ewmaLambda * currentValue + (1 - this.ewmaLambda) * state.ewma;

    // EWMA control limits (time-varying, but we use asymptotic limits)
    const ewmaSigma = sigma * Math.sqrt(this.ewmaLambda / (2 - this.ewmaLambda));
    const ewmaUcl = target + this.ewmaL * ewmaSigma;
    const ewmaLcl = target - this.ewmaL * ewmaSigma;

    const result = {
      value: parseFloat(state.ewma.toFixed(4)),
      ucl: parseFloat(ewmaUcl.toFixed(4)),
      lcl: parseFloat(ewmaLcl.toFixed(4)),
      target,
      alarm: false,
      warning: false,
      deviation: parseFloat((state.ewma - target).toFixed(4))
    };

    // Check for alarms
    if (state.ewma > ewmaUcl || state.ewma < ewmaLcl) {
      result.alarm = true;
    } else {
      const warningUcl = target + this.ewmaL * 0.7 * ewmaSigma;
      const warningLcl = target - this.ewmaL * 0.7 * ewmaSigma;
      if (state.ewma > warningUcl || state.ewma < warningLcl) {
        result.warning = true;
      }
    }

    return result;
  }

  detectTrend(paramName, values, config) {
    if (values.length < 10) {
      return { detected: false, slope: 0, significant: false };
    }

    // Use last 50 points for trend analysis
    const analysisWindow = values.slice(-50);
    const n = analysisWindow.length;

    // Linear regression
    const xMean = (n - 1) / 2;
    const yMean = analysisWindow.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (analysisWindow[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Calculate R-squared
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = intercept + slope * i;
      ssRes += Math.pow(analysisWindow[i] - predicted, 2);
      ssTot += Math.pow(analysisWindow[i] - yMean, 2);
    }
    const rSquared = 1 - (ssRes / ssTot);

    // Calculate significance
    const sigma = (config.ucl - config.lcl) / 6;
    const slopePerReading = slope;
    const projectedDrift = slopePerReading * 100; // Project 100 readings ahead

    const result = {
      slope: parseFloat(slope.toFixed(6)),
      intercept: parseFloat(intercept.toFixed(4)),
      rSquared: parseFloat(rSquared.toFixed(4)),
      projectedDrift: parseFloat(projectedDrift.toFixed(4)),
      significant: false,
      direction: slope > 0 ? 'increasing' : 'decreasing'
    };

    // Trend is significant if it would drift by more than 1 sigma over 100 readings
    // and R-squared is above 0.3
    if (Math.abs(projectedDrift) > sigma && rSquared > 0.3) {
      result.significant = true;
    }

    return result;
  }

  detectShift(values, config) {
    if (values.length < 30) {
      return { detected: false };
    }

    // Compare recent window to baseline
    const baselineWindow = values.slice(-60, -30);
    const recentWindow = values.slice(-30);

    const baselineMean = baselineWindow.reduce((a, b) => a + b, 0) / baselineWindow.length;
    const recentMean = recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length;

    const baselineStd = Math.sqrt(
      baselineWindow.reduce((sum, v) => sum + Math.pow(v - baselineMean, 2), 0) / baselineWindow.length
    );

    const shift = recentMean - baselineMean;
    const shiftInSigmas = shift / baselineStd;

    const result = {
      baselineMean: parseFloat(baselineMean.toFixed(4)),
      recentMean: parseFloat(recentMean.toFixed(4)),
      shift: parseFloat(shift.toFixed(4)),
      shiftInSigmas: parseFloat(shiftInSigmas.toFixed(2)),
      detected: false,
      direction: shift > 0 ? 'positive' : 'negative'
    };

    // Shift is detected if mean changed by more than 1.5 sigma
    if (Math.abs(shiftInSigmas) > 1.5) {
      result.detected = true;
    }

    return result;
  }

  // Reset drift detection states (e.g., after process adjustment)
  reset(paramName) {
    if (paramName) {
      delete this.cusumStates[paramName];
      delete this.ewmaStates[paramName];
      delete this.trendStates[paramName];
    } else {
      this.cusumStates = {};
      this.ewmaStates = {};
      this.trendStates = {};
    }
  }

  // Calculate time to predicted out-of-control
  predictTimeToOOC(values, config) {
    const trend = this.detectTrend('temp', values, config);

    if (!trend.significant || Math.abs(trend.slope) < 0.0001) {
      return { predicted: false };
    }

    const currentValue = values[values.length - 1];
    const { ucl, lcl } = config;

    let readingsToOOC;
    if (trend.slope > 0) {
      readingsToOOC = (ucl - currentValue) / trend.slope;
    } else {
      readingsToOOC = (lcl - currentValue) / trend.slope;
    }

    return {
      predicted: true,
      readingsToOOC: Math.max(0, Math.round(readingsToOOC)),
      direction: trend.direction,
      confidence: trend.rSquared
    };
  }
}

module.exports = DriftDetector;
