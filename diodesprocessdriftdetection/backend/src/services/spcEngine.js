class SPCEngine {
  constructor() {
    this.windowSize = 25;
    this.movingRangeWindow = 2;
  }

  analyze(reading, parameters) {
    const results = {};

    Object.keys(reading.parameters).forEach(param => {
      const value = reading.parameters[param];
      const config = parameters[param];

      results[param] = this.analyzeParameter(value, config);
    });

    return results;
  }

  analyzeParameter(value, config) {
    const { target, ucl, lcl, usl, lsl } = config;

    const result = {
      value,
      target,
      ucl,
      lcl,
      usl,
      lsl,
      deviation: value - target,
      deviationPercent: ((value - target) / target * 100),
      outOfControl: false,
      outOfSpec: false,
      zone: this.getZone(value, config),
      status: 'normal'
    };

    // Check control limits
    if (value > ucl || value < lcl) {
      result.outOfControl = true;
      result.status = 'warning';
    }

    // Check specification limits
    if (value > usl || value < lsl) {
      result.outOfSpec = true;
      result.status = 'critical';
    }

    return result;
  }

  getZone(value, config) {
    const { target, ucl, lcl } = config;
    const upperRange = ucl - target;
    const lowerRange = target - lcl;

    if (value > target) {
      const deviation = value - target;
      if (deviation <= upperRange / 3) return 'A+';
      if (deviation <= 2 * upperRange / 3) return 'B+';
      if (deviation <= upperRange) return 'C+';
      return 'OUT+';
    } else {
      const deviation = target - value;
      if (deviation <= lowerRange / 3) return 'A-';
      if (deviation <= 2 * lowerRange / 3) return 'B-';
      if (deviation <= lowerRange) return 'C-';
      return 'OUT-';
    }
  }

  calculateSummary(values, config) {
    if (values.length === 0) {
      return { mean: 0, stdDev: 0, cp: 0, cpk: 0, ppk: 0 };
    }

    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);

    const { usl, lsl, target } = config;

    // Calculate capability indices
    const cp = (usl - lsl) / (6 * stdDev);
    const cpupper = (usl - mean) / (3 * stdDev);
    const cplower = (mean - lsl) / (3 * stdDev);
    const cpk = Math.min(cpupper, cplower);

    // Process performance
    const ppk = cpk; // Simplified, normally uses overall std dev

    // Calculate percentages
    const outOfControl = values.filter(v => v > config.ucl || v < config.lcl).length;
    const outOfSpec = values.filter(v => v > config.usl || v < config.lsl).length;

    return {
      mean: parseFloat(mean.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      min: Math.min(...values),
      max: Math.max(...values),
      range: Math.max(...values) - Math.min(...values),
      cp: parseFloat(cp.toFixed(3)),
      cpk: parseFloat(cpk.toFixed(3)),
      ppk: parseFloat(ppk.toFixed(3)),
      outOfControlPercent: parseFloat((outOfControl / n * 100).toFixed(1)),
      outOfSpecPercent: parseFloat((outOfSpec / n * 100).toFixed(1)),
      sampleSize: n
    };
  }

  // Western Electric Rules for detecting non-random patterns
  applyWesternElectricRules(values, config) {
    const violations = [];
    const { target, ucl, lcl } = config;
    const sigma = (ucl - target) / 3;

    if (values.length < 9) return violations;

    const recent = values.slice(-9);

    // Rule 1: One point beyond 3 sigma
    if (recent[recent.length - 1] > ucl || recent[recent.length - 1] < lcl) {
      violations.push({ rule: 1, message: 'Point beyond control limits' });
    }

    // Rule 2: 9 points in a row on same side of center
    const allAbove = recent.every(v => v > target);
    const allBelow = recent.every(v => v < target);
    if (allAbove || allBelow) {
      violations.push({ rule: 2, message: '9 consecutive points on same side of center' });
    }

    // Rule 3: 6 points in a row steadily increasing or decreasing
    if (recent.length >= 6) {
      const last6 = recent.slice(-6);
      let increasing = true;
      let decreasing = true;
      for (let i = 1; i < 6; i++) {
        if (last6[i] <= last6[i - 1]) increasing = false;
        if (last6[i] >= last6[i - 1]) decreasing = false;
      }
      if (increasing || decreasing) {
        violations.push({ rule: 3, message: '6 consecutive points trending' });
      }
    }

    // Rule 4: 2 out of 3 points beyond 2 sigma on same side
    if (recent.length >= 3) {
      const last3 = recent.slice(-3);
      const twoSigmaUpper = target + 2 * sigma;
      const twoSigmaLower = target - 2 * sigma;

      const aboveCount = last3.filter(v => v > twoSigmaUpper).length;
      const belowCount = last3.filter(v => v < twoSigmaLower).length;

      if (aboveCount >= 2 || belowCount >= 2) {
        violations.push({ rule: 4, message: '2 of 3 points beyond 2 sigma' });
      }
    }

    return violations;
  }

  // Calculate moving range for individual measurements
  calculateMovingRange(values) {
    if (values.length < 2) return [];

    const mr = [];
    for (let i = 1; i < values.length; i++) {
      mr.push(Math.abs(values[i] - values[i - 1]));
    }
    return mr;
  }

  // Calculate control limits from data
  calculateControlLimits(values) {
    const n = values.length;
    if (n < 10) return null;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const mr = this.calculateMovingRange(values);
    const mrBar = mr.reduce((a, b) => a + b, 0) / mr.length;

    // d2 constant for n=2 is 1.128
    const sigma = mrBar / 1.128;

    return {
      mean,
      ucl: mean + 3 * sigma,
      lcl: mean - 3 * sigma,
      sigma
    };
  }
}

module.exports = SPCEngine;
