const { v4: uuidv4 } = require('uuid');

class AlertManager {
  constructor() {
    this.alertCooldowns = {};
    this.cooldownPeriod = 300000; // 5 minutes between same type alerts
  }

  checkForAlerts(reading, spcResults, driftResults, parameters) {
    const alerts = [];

    // Check SPC results
    Object.keys(spcResults).forEach(param => {
      const result = spcResults[param];
      const config = parameters[param];

      // Out of specification limit
      if (result.outOfSpec) {
        const alert = this.createAlert({
          type: 'OUT_OF_SPEC',
          severity: 'critical',
          parameter: param,
          parameterName: config.name,
          value: result.value,
          limit: result.value > config.usl ? config.usl : config.lsl,
          limitType: result.value > config.usl ? 'USL' : 'LSL',
          line: reading.line,
          message: `${config.name} (${result.value.toFixed(2)} ${config.unit}) exceeded ${result.value > config.usl ? 'upper' : 'lower'} spec limit`,
          timestamp: reading.timestamp
        });
        if (alert) alerts.push(alert);
      }
      // Out of control limit
      else if (result.outOfControl) {
        const alert = this.createAlert({
          type: 'OUT_OF_CONTROL',
          severity: 'warning',
          parameter: param,
          parameterName: config.name,
          value: result.value,
          limit: result.value > config.ucl ? config.ucl : config.lcl,
          limitType: result.value > config.ucl ? 'UCL' : 'LCL',
          line: reading.line,
          message: `${config.name} (${result.value.toFixed(2)} ${config.unit}) exceeded ${result.value > config.ucl ? 'upper' : 'lower'} control limit`,
          timestamp: reading.timestamp
        });
        if (alert) alerts.push(alert);
      }
    });

    // Check drift results
    if (driftResults && driftResults.results) {
      Object.keys(driftResults.results).forEach(param => {
        const result = driftResults.results[param];
        const config = parameters[param];

        // CUSUM alarm
        if (result.cusum && result.cusum.alarm) {
          const alert = this.createAlert({
            type: 'CUSUM_DRIFT',
            severity: 'critical',
            parameter: param,
            parameterName: config.name,
            direction: result.cusum.direction,
            cusumValue: result.cusum.direction === 'positive' ? result.cusum.cusumPlus : result.cusum.cusumMinus,
            threshold: result.cusum.threshold,
            line: reading.line,
            message: `CUSUM drift detected for ${config.name} (${result.cusum.direction} direction)`,
            timestamp: reading.timestamp
          });
          if (alert) alerts.push(alert);
        }

        // EWMA alarm
        if (result.ewma && result.ewma.alarm) {
          const alert = this.createAlert({
            type: 'EWMA_DRIFT',
            severity: 'warning',
            parameter: param,
            parameterName: config.name,
            ewmaValue: result.ewma.value,
            deviation: result.ewma.deviation,
            line: reading.line,
            message: `EWMA drift detected for ${config.name} (deviation: ${result.ewma.deviation.toFixed(3)})`,
            timestamp: reading.timestamp
          });
          if (alert) alerts.push(alert);
        }

        // Significant trend
        if (result.trend && result.trend.significant) {
          const alert = this.createAlert({
            type: 'TREND',
            severity: 'info',
            parameter: param,
            parameterName: config.name,
            slope: result.trend.slope,
            direction: result.trend.direction,
            rSquared: result.trend.rSquared,
            projectedDrift: result.trend.projectedDrift,
            line: reading.line,
            message: `Significant trend detected for ${config.name} (${result.trend.direction}, R\u00B2=${result.trend.rSquared.toFixed(2)})`,
            timestamp: reading.timestamp
          });
          if (alert) alerts.push(alert);
        }

        // Process shift
        if (result.shift && result.shift.detected) {
          const alert = this.createAlert({
            type: 'PROCESS_SHIFT',
            severity: 'critical',
            parameter: param,
            parameterName: config.name,
            shift: result.shift.shift,
            shiftInSigmas: result.shift.shiftInSigmas,
            direction: result.shift.direction,
            line: reading.line,
            message: `Process shift detected for ${config.name} (${result.shift.shiftInSigmas.toFixed(1)}\u03C3 ${result.shift.direction})`,
            timestamp: reading.timestamp
          });
          if (alert) alerts.push(alert);
        }
      });
    }

    return alerts;
  }

  createAlert(alertData) {
    const cooldownKey = `${alertData.type}_${alertData.parameter}`;

    // Check cooldown
    if (this.alertCooldowns[cooldownKey]) {
      const lastAlert = this.alertCooldowns[cooldownKey];
      if (Date.now() - lastAlert < this.cooldownPeriod) {
        return null;
      }
    }

    // Update cooldown
    this.alertCooldowns[cooldownKey] = Date.now();

    return {
      id: uuidv4(),
      ...alertData,
      acknowledged: false,
      acknowledgedAt: null,
      createdAt: Date.now()
    };
  }

  getSeverityLevel(severity) {
    const levels = {
      info: 1,
      warning: 2,
      critical: 3
    };
    return levels[severity] || 0;
  }

  getAlertPriority(alert) {
    const severityWeight = this.getSeverityLevel(alert.severity) * 100;
    const typeWeight = {
      OUT_OF_SPEC: 50,
      PROCESS_SHIFT: 40,
      CUSUM_DRIFT: 30,
      OUT_OF_CONTROL: 20,
      EWMA_DRIFT: 15,
      TREND: 10
    }[alert.type] || 0;

    return severityWeight + typeWeight;
  }

  sortAlertsByPriority(alerts) {
    return [...alerts].sort((a, b) => this.getAlertPriority(b) - this.getAlertPriority(a));
  }

  getAlertSummary(alerts) {
    const summary = {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      },
      byType: {},
      byParameter: {},
      byLine: {}
    };

    alerts.forEach(alert => {
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
      summary.byParameter[alert.parameter] = (summary.byParameter[alert.parameter] || 0) + 1;
      summary.byLine[alert.line] = (summary.byLine[alert.line] || 0) + 1;
    });

    return summary;
  }

  getRecommendedActions(alert) {
    const actions = {
      OUT_OF_SPEC: [
        'Stop production immediately',
        'Isolate affected batch for quality review',
        'Check equipment calibration',
        'Review recent process changes',
        'Notify quality engineering team'
      ],
      OUT_OF_CONTROL: [
        'Monitor closely for next 10 readings',
        'Verify sensor readings',
        'Check for environmental changes',
        'Review control chart for patterns'
      ],
      CUSUM_DRIFT: [
        'Investigate root cause of sustained drift',
        'Check for gradual equipment degradation',
        'Review consumable status (gas, chemicals)',
        'Consider preventive maintenance'
      ],
      EWMA_DRIFT: [
        'Monitor trend development',
        'Check for systematic errors',
        'Review recent recipe changes',
        'Verify measurement system stability'
      ],
      TREND: [
        'Track trend progression',
        'Identify potential causes',
        'Plan preventive action if trend continues',
        'Schedule equipment review'
      ],
      PROCESS_SHIFT: [
        'Investigate cause of sudden change',
        'Check for equipment malfunction',
        'Review maintenance history',
        'Verify process recipe settings',
        'Check lot-to-lot material variation'
      ]
    };

    return actions[alert.type] || ['Investigate the issue', 'Contact process engineering'];
  }

  calculateYieldImpact(alert, currentYield = 95) {
    const impactEstimates = {
      OUT_OF_SPEC: { min: 2, max: 10 },
      OUT_OF_CONTROL: { min: 0.5, max: 2 },
      CUSUM_DRIFT: { min: 1, max: 5 },
      EWMA_DRIFT: { min: 0.5, max: 3 },
      TREND: { min: 0.2, max: 1 },
      PROCESS_SHIFT: { min: 2, max: 8 }
    };

    const estimate = impactEstimates[alert.type] || { min: 0, max: 1 };
    const severityMultiplier = { critical: 1.5, warning: 1.0, info: 0.5 }[alert.severity] || 1;

    const avgImpact = ((estimate.min + estimate.max) / 2) * severityMultiplier;

    return {
      estimatedYieldLoss: parseFloat(avgImpact.toFixed(2)),
      projectedYield: parseFloat((currentYield - avgImpact).toFixed(2)),
      impactRange: estimate,
      confidence: 'medium'
    };
  }
}

module.exports = AlertManager;
