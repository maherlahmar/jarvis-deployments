import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Filter,
  Search,
  Clock,
  Thermometer,
  Zap,
  Wind,
  CheckCircle
} from 'lucide-react';
import useStore from '../store/useStore';

export default function Alerts() {
  const { processedData, alertFilter, setAlertFilter, selectedZones, toggleZone } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to view alerts</p>
      </div>
    );
  }

  const { anomalies } = processedData;

  const getAlertIcon = (type) => {
    if (type.includes('temp')) return Thermometer;
    if (type.includes('power') || type.includes('electrical')) return Zap;
    if (type.includes('o2') || type.includes('flow')) return Wind;
    return AlertCircle;
  };

  const getAlertColor = (severity) => {
    return severity === 'critical'
      ? { bg: 'bg-danger-50 dark:bg-danger-900/20', border: 'border-danger-200 dark:border-danger-800', icon: 'text-danger-500' }
      : { bg: 'bg-warning-50 dark:bg-warning-900/20', border: 'border-warning-200 dark:border-warning-800', icon: 'text-warning-500' };
  };

  const formatAlertType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  let filteredAlerts = anomalies?.list || [];

  // Apply severity filter
  if (alertFilter !== 'all') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === alertFilter);
  }

  // Apply zone filter
  filteredAlerts = filteredAlerts.filter(a => !a.zone || selectedZones.includes(a.zone));

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredAlerts = filteredAlerts.filter(a =>
      formatAlertType(a.type).toLowerCase().includes(term) ||
      (a.zone && `zone ${a.zone}`.includes(term))
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor and manage equipment anomalies and alerts
        </p>
      </motion.div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card p-6 cursor-pointer transition-all ${alertFilter === 'critical' ? 'ring-2 ring-danger-500' : ''}`}
          onClick={() => setAlertFilter(alertFilter === 'critical' ? 'all' : 'critical')}
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 text-danger-500" />
            <span className="text-3xl font-bold text-danger-600 dark:text-danger-400">
              {anomalies?.summary?.critical || 0}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">Critical Alerts</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Requires immediate attention</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`card p-6 cursor-pointer transition-all ${alertFilter === 'warning' ? 'ring-2 ring-warning-500' : ''}`}
          onClick={() => setAlertFilter(alertFilter === 'warning' ? 'all' : 'warning')}
        >
          <div className="flex items-center justify-between">
            <AlertCircle className="w-8 h-8 text-warning-500" />
            <span className="text-3xl font-bold text-warning-600 dark:text-warning-400">
              {anomalies?.summary?.warning || 0}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Monitor closely</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-success-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {anomalies?.summary?.total || 0}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total Anomalies</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Detected in analysis</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="input w-40"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(alertFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => { setAlertFilter('all'); setSearchTerm(''); }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Zone Filter */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Zone:</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(zone => (
              <button
                key={zone}
                onClick={() => toggleZone(zone)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedZones.includes(zone)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Zone {zone}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alerts by Type */}
      {anomalies?.byType && Object.keys(anomalies.byType).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Anomalies by Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(anomalies.byType).map(([type, alerts]) => {
              const Icon = getAlertIcon(type);
              const critical = alerts.filter(a => a.severity === 'critical').length;
              const warning = alerts.filter(a => a.severity === 'warning').length;

              return (
                <div key={type} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatAlertType(type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {alerts.length}
                    </span>
                    <div className="flex gap-1">
                      {critical > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">
                          {critical} critical
                        </span>
                      )}
                      {warning > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400">
                          {warning} warning
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alert Details ({filteredAlerts.length})
          </h3>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Alerts Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {anomalies?.summary?.total > 0
                ? 'No alerts match your current filters. Try adjusting filters.'
                : 'No anomalies detected in the analyzed data.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => {
                const Icon = getAlertIcon(alert.type);
                const colors = getAlertColor(alert.severity);

                return (
                  <motion.div
                    key={`${alert.type}-${alert.zone}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-4 ${colors.bg}`}
                  >
                    <div className="flex items-start gap-4">
                      <Icon className={`w-5 h-5 mt-1 ${colors.icon}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatAlertType(alert.type)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase
                            ${alert.severity === 'critical'
                              ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300'
                              : 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          {alert.zone && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                              Zone {alert.zone}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {alert.position && <span>Position: {alert.position} | </span>}
                          Value: <span className="font-medium">{typeof alert.value === 'number' ? alert.value.toFixed(2) : alert.value}</span>
                          {alert.threshold && (
                            <span> | Threshold: {typeof alert.threshold === 'number' ? alert.threshold.toFixed(2) : alert.threshold}</span>
                          )}
                        </div>
                        {alert.timestamp && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
