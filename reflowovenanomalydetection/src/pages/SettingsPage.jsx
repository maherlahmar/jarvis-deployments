import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Sliders,
  RotateCcw,
  Save,
  Thermometer,
  Zap,
  Wind,
  AlertTriangle,
  Gauge,
  Info,
} from 'lucide-react';
import useStore from '../store/useStore';

const THRESHOLD_CONFIG = [
  {
    key: 'temperatureZScore',
    label: 'Temperature Z-Score Threshold',
    description: 'Standard deviations from mean to flag temperature anomalies',
    icon: Thermometer,
    min: 1,
    max: 5,
    step: 0.5,
    unit: 'std dev',
  },
  {
    key: 'temperatureRateOfChange',
    label: 'Temperature Rate of Change',
    description: 'Maximum allowed temperature change between readings',
    icon: Thermometer,
    min: 5,
    max: 30,
    step: 1,
    unit: 'C',
  },
  {
    key: 'zoneImbalanceThreshold',
    label: 'Zone Imbalance Threshold',
    description: 'Maximum allowed difference between upper and lower temperatures',
    icon: Thermometer,
    min: 5,
    max: 40,
    step: 5,
    unit: 'C',
  },
  {
    key: 'powerFactorMin',
    label: 'Minimum Power Factor',
    description: 'Power factor below this value triggers a warning',
    icon: Gauge,
    min: 0.7,
    max: 0.95,
    step: 0.05,
    unit: '',
  },
  {
    key: 'frequencyDeviation',
    label: 'Frequency Deviation',
    description: 'Maximum allowed deviation from 60Hz',
    icon: Zap,
    min: 0.1,
    max: 2,
    step: 0.1,
    unit: 'Hz',
  },
  {
    key: 'o2ConcentrationMin',
    label: 'O2 Concentration Minimum',
    description: 'Minimum O2 concentration threshold',
    icon: Wind,
    min: 10,
    max: 200,
    step: 10,
    unit: 'ppm',
  },
  {
    key: 'o2ConcentrationMax',
    label: 'O2 Concentration Maximum',
    description: 'Maximum O2 concentration threshold',
    icon: Wind,
    min: 200,
    max: 2000,
    step: 100,
    unit: 'ppm',
  },
  {
    key: 'flowRateDeviation',
    label: 'Flow Rate Z-Score',
    description: 'Standard deviations for flow rate anomaly detection',
    icon: Wind,
    min: 1,
    max: 5,
    step: 0.5,
    unit: 'std dev',
  },
  {
    key: 'alarmSpikeThreshold',
    label: 'Alarm Spike Threshold',
    description: 'Number of alarms that triggers an alert',
    icon: AlertTriangle,
    min: 1,
    max: 20,
    step: 1,
    unit: 'alarms',
  },
  {
    key: 'currentZScore',
    label: 'Current Z-Score Threshold',
    description: 'Standard deviations for current/power anomalies',
    icon: Zap,
    min: 1,
    max: 5,
    step: 0.5,
    unit: 'std dev',
  },
  {
    key: 'conveyorSpeedDeviation',
    label: 'Conveyor Speed Deviation',
    description: 'Percentage deviation from mean conveyor speed',
    icon: Gauge,
    min: 0.05,
    max: 0.5,
    step: 0.05,
    unit: '%',
  },
];

const DEFAULT_THRESHOLDS = {
  temperatureZScore: 3.0,
  temperatureRateOfChange: 15,
  zoneImbalanceThreshold: 20,
  powerFactorMin: 0.85,
  frequencyDeviation: 0.5,
  o2ConcentrationMin: 50,
  o2ConcentrationMax: 500,
  flowRateDeviation: 2.0,
  alarmSpikeThreshold: 5,
  currentZScore: 2.5,
  conveyorSpeedDeviation: 0.2,
};

function ThresholdSlider({ config, value, onChange }) {
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary-500/10">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-white">{config.label}</h4>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary-400">
                {value}
              </span>
              {config.unit && (
                <span className="text-sm text-dark-400">{config.unit}</span>
              )}
            </div>
          </div>
          <p className="text-sm text-dark-400 mb-4">{config.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-dark-500">{config.min}</span>
            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <span className="text-xs text-dark-500">{config.max}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsPage() {
  const { thresholds, updateThresholds, clearAllData, processedData } = useStore();
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key, value) => {
    setLocalThresholds((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateThresholds(localThresholds);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalThresholds(DEFAULT_THRESHOLDS);
    setHasChanges(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary-400" />
            Detection Settings
          </h2>
          <p className="text-dark-400 mt-1">
            Configure anomaly detection thresholds and parameters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="btn-outline">
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`btn-primary ${!hasChanges && 'opacity-50 cursor-not-allowed'}`}
          >
            <Save className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <Info className="w-5 h-5 text-warning-400 flex-shrink-0" />
          <p className="text-sm text-warning-400">
            You have unsaved changes. Click "Apply Changes" to rerun anomaly detection with the new thresholds.
          </p>
        </motion.div>
      )}

      <div className="card">
        <h3 className="card-header">
          <Sliders className="w-5 h-5 text-primary-400" />
          Current Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-dark-400">Data Points</p>
            <p className="text-xl font-semibold text-white">
              {processedData.length.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Sensitivity Level</p>
            <p className="text-xl font-semibold text-white">
              {localThresholds.temperatureZScore <= 2.5
                ? 'High'
                : localThresholds.temperatureZScore <= 3.5
                ? 'Medium'
                : 'Low'}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Active Thresholds</p>
            <p className="text-xl font-semibold text-white">
              {THRESHOLD_CONFIG.length}
            </p>
          </div>
          <div>
            <button
              onClick={clearAllData}
              className="btn-danger w-full mt-2"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-primary-400" />
          Temperature Thresholds
        </h3>
        {THRESHOLD_CONFIG.filter((c) => c.icon === Thermometer).map((config) => (
          <ThresholdSlider
            key={config.key}
            config={config}
            value={localThresholds[config.key]}
            onChange={(value) => handleChange(config.key, value)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning-400" />
          Power Thresholds
        </h3>
        {THRESHOLD_CONFIG.filter(
          (c) => c.icon === Zap || (c.icon === Gauge && c.key === 'powerFactorMin')
        ).map((config) => (
          <ThresholdSlider
            key={config.key}
            config={config}
            value={localThresholds[config.key]}
            onChange={(value) => handleChange(config.key, value)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wind className="w-5 h-5 text-success-400" />
          Atmosphere Thresholds
        </h3>
        {THRESHOLD_CONFIG.filter((c) => c.icon === Wind).map((config) => (
          <ThresholdSlider
            key={config.key}
            config={config}
            value={localThresholds[config.key]}
            onChange={(value) => handleChange(config.key, value)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger-400" />
          Operational Thresholds
        </h3>
        {THRESHOLD_CONFIG.filter(
          (c) => c.icon === AlertTriangle || (c.icon === Gauge && c.key === 'conveyorSpeedDeviation')
        ).map((config) => (
          <ThresholdSlider
            key={config.key}
            config={config}
            value={localThresholds[config.key]}
            onChange={(value) => handleChange(config.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
