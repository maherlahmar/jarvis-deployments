import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  Search,
  Thermometer,
  Zap,
  Wind,
  Gauge,
  ChevronRight,
  X,
} from 'lucide-react';
import useStore from '../store/useStore';
import { ANOMALY_TYPES, SEVERITY } from '../utils/anomalyDetection';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-danger-500/10',
    border: 'border-danger-500/30',
    text: 'text-danger-400',
    badge: 'badge-danger',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-warning-500/10',
    border: 'border-warning-500/30',
    text: 'text-warning-400',
    badge: 'badge-warning',
  },
  info: {
    icon: Info,
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/30',
    text: 'text-primary-400',
    badge: 'badge-info',
  },
};

const TYPE_ICONS = {
  temperature_spike: Thermometer,
  temperature_drop: Thermometer,
  temperature_deviation: Thermometer,
  zone_imbalance: Thermometer,
  power_anomaly: Zap,
  power_factor_low: Gauge,
  current_spike: Zap,
  frequency_deviation: Zap,
  o2_concentration_high: Wind,
  o2_concentration_low: Wind,
  flow_rate_anomaly: Wind,
  alarm_spike: AlertTriangle,
  conveyor_speed_deviation: Gauge,
};

function AnomalyCard({ anomaly, onClick, isSelected }) {
  const config = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.info;
  const TypeIcon = TYPE_ICONS[anomaly.type] || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
        config.bg
      } ${config.border} ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <TypeIcon className={`w-5 h-5 ${config.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-sm font-medium ${config.text}`}>
              {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
            <span className={config.badge}>{anomaly.severity}</span>
          </div>
          <p className="text-sm text-dark-200 mb-2 line-clamp-2">
            {anomaly.message}
          </p>
          <div className="flex items-center gap-4 text-xs text-dark-400">
            {anomaly.zone && <span>Zone {anomaly.zone}</span>}
            <span>{anomaly.timestamp?.toLocaleString()}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-dark-500 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

function AnomalyDetail({ anomaly, onClose }) {
  if (!anomaly) return null;

  const config = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.info;
  const TypeIcon = TYPE_ICONS[anomaly.type] || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="card sticky top-0"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TypeIcon className={`w-5 h-5 ${config.text}`} />
          Anomaly Details
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-dark-400 mb-1">Type</p>
          <p className="text-white font-medium">
            {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </p>
        </div>

        <div>
          <p className="text-xs text-dark-400 mb-1">Severity</p>
          <span className={config.badge}>{anomaly.severity}</span>
        </div>

        <div>
          <p className="text-xs text-dark-400 mb-1">Description</p>
          <p className="text-dark-200">{anomaly.message}</p>
        </div>

        {anomaly.zone && (
          <div>
            <p className="text-xs text-dark-400 mb-1">Zone</p>
            <p className="text-white">Zone {anomaly.zone}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-dark-400 mb-1">Timestamp</p>
          <p className="text-white">{anomaly.timestamp?.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {anomaly.value !== undefined && (
            <div>
              <p className="text-xs text-dark-400 mb-1">Actual Value</p>
              <p className="text-lg font-semibold text-white">
                {typeof anomaly.value === 'number'
                  ? anomaly.value.toFixed(2)
                  : anomaly.value}
              </p>
            </div>
          )}
          {anomaly.expected !== undefined && (
            <div>
              <p className="text-xs text-dark-400 mb-1">Expected Value</p>
              <p className="text-lg font-semibold text-dark-300">
                {typeof anomaly.expected === 'number'
                  ? anomaly.expected.toFixed(2)
                  : anomaly.expected}
              </p>
            </div>
          )}
        </div>

        {anomaly.deviation !== undefined && (
          <div>
            <p className="text-xs text-dark-400 mb-1">Deviation (Z-Score)</p>
            <p className={`text-lg font-semibold ${config.text}`}>
              {anomaly.deviation > 0 ? '+' : ''}
              {anomaly.deviation.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AnomalyPanel() {
  const { anomalyResults, getFilteredAnomalies, selectedAnomaly, setSelectedAnomaly } = useStore();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnomalies = useMemo(() => {
    let anomalies = getFilteredAnomalies();

    if (severityFilter !== 'all') {
      anomalies = anomalies.filter((a) => a.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      anomalies = anomalies.filter((a) => a.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      anomalies = anomalies.filter(
        (a) =>
          a.message?.toLowerCase().includes(query) ||
          a.type?.toLowerCase().includes(query)
      );
    }

    return anomalies;
  }, [getFilteredAnomalies, severityFilter, typeFilter, searchQuery]);

  const anomalyTypes = useMemo(() => {
    if (!anomalyResults?.summary?.byType) return [];
    return Object.keys(anomalyResults.summary.byType);
  }, [anomalyResults]);

  if (!anomalyResults || anomalyResults.anomalies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <div className="w-20 h-20 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-success-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Anomalies Detected
          </h3>
          <p className="text-dark-400">
            All process parameters are within normal operating ranges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-dark-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="input py-1.5 pr-8 w-auto"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input py-1.5 pr-8 w-auto"
            >
              <option value="all">All Types</option>
              {anomalyTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search anomalies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 py-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card bg-danger-500/10 border-danger-500/30">
            <p className="text-xs text-dark-400 mb-1">Critical</p>
            <p className="text-2xl font-bold text-danger-400">
              {anomalyResults.summary.critical}
            </p>
          </div>
          <div className="card bg-warning-500/10 border-warning-500/30">
            <p className="text-xs text-dark-400 mb-1">Warning</p>
            <p className="text-2xl font-bold text-warning-400">
              {anomalyResults.summary.warning}
            </p>
          </div>
          <div className="card bg-primary-500/10 border-primary-500/30">
            <p className="text-xs text-dark-400 mb-1">Info</p>
            <p className="text-2xl font-bold text-primary-400">
              {anomalyResults.summary.info}
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          <AnimatePresence>
            {filteredAnomalies.map((anomaly, index) => (
              <AnomalyCard
                key={`${anomaly.type}-${anomaly.recordIndex}-${index}`}
                anomaly={anomaly}
                onClick={() => setSelectedAnomaly(anomaly)}
                isSelected={selectedAnomaly === anomaly}
              />
            ))}
          </AnimatePresence>

          {filteredAnomalies.length === 0 && (
            <div className="text-center py-8 text-dark-400">
              No anomalies match your filters
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <AnimatePresence mode="wait">
          {selectedAnomaly ? (
            <AnomalyDetail
              key="detail"
              anomaly={selectedAnomaly}
              onClose={() => setSelectedAnomaly(null)}
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card h-full flex items-center justify-center text-center"
            >
              <div>
                <Info className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">
                  Select an anomaly to view details
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AnomalyPanel;
