import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Filter,
  Search,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import useStore from '../store/useStore';
import websocketService from '../services/websocket';
import { api } from '../services/api';
import { formatRelativeTime, formatDateTime, formatTimestamp } from '../utils/formatters';
import clsx from 'clsx';

function Alerts() {
  const { alerts, acknowledgeAlert, parameters } = useStore();
  const [filter, setFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [parameterFilter, setParameterFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const parameterKeys = Object.keys(parameters);

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    if (filter === 'unacknowledged') {
      result = result.filter(a => !a.acknowledged);
    } else if (filter === 'acknowledged') {
      result = result.filter(a => a.acknowledged);
    }

    if (severityFilter !== 'all') {
      result = result.filter(a => a.severity === severityFilter);
    }

    if (parameterFilter !== 'all') {
      result = result.filter(a => a.parameter === parameterFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.message?.toLowerCase().includes(term) ||
        a.parameterName?.toLowerCase().includes(term) ||
        a.line?.toLowerCase().includes(term) ||
        a.type?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      if (sortOrder === 'oldest') return a.timestamp - b.timestamp;
      if (sortOrder === 'severity') {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return 0;
    });

    return result;
  }, [alerts, filter, severityFilter, parameterFilter, searchTerm, sortOrder]);

  const handleAcknowledge = async (alertId) => {
    try {
      websocketService.acknowledgeAlert(alertId);
      await api.acknowledgeAlert(alertId);
      acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge:', error);
      acknowledgeAlert(alertId);
    }
  };

  const handleAcknowledgeAll = async () => {
    const unacknowledged = filteredAlerts.filter(a => !a.acknowledged);
    for (const alert of unacknowledged) {
      await handleAcknowledge(alert.id);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-danger-500 bg-danger-500/10';
      case 'warning': return 'text-warning-500 bg-warning-500/10';
      default: return 'text-primary-500 bg-primary-500/10';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      OUT_OF_SPEC: 'Out of Spec',
      OUT_OF_CONTROL: 'Out of Control',
      CUSUM_DRIFT: 'CUSUM Drift',
      EWMA_DRIFT: 'EWMA Drift',
      TREND: 'Trend Detected',
      PROCESS_SHIFT: 'Process Shift'
    };
    return labels[type] || type;
  };

  const getRecommendedActions = (type) => {
    const actions = {
      OUT_OF_SPEC: [
        'Stop production immediately',
        'Isolate affected batch for review',
        'Check equipment calibration',
        'Review recent process changes'
      ],
      OUT_OF_CONTROL: [
        'Monitor closely for next 10 readings',
        'Verify sensor readings',
        'Check for environmental changes'
      ],
      CUSUM_DRIFT: [
        'Investigate root cause',
        'Check for equipment degradation',
        'Review consumable status'
      ],
      EWMA_DRIFT: [
        'Monitor trend development',
        'Check for systematic errors',
        'Review recent recipe changes'
      ],
      TREND: [
        'Track trend progression',
        'Identify potential causes',
        'Plan preventive action'
      ],
      PROCESS_SHIFT: [
        'Investigate sudden change',
        'Check for equipment malfunction',
        'Review maintenance history'
      ]
    };
    return actions[type] || ['Investigate the issue'];
  };

  const alertCounts = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-slate-500">
          <p className="text-sm text-slate-500 mb-1">Total Alerts</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{alertCounts.total}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-warning-500">
          <p className="text-sm text-slate-500 mb-1">Unacknowledged</p>
          <p className="text-2xl font-bold text-warning-500">{alertCounts.unacknowledged}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-danger-500">
          <p className="text-sm text-slate-500 mb-1">Critical</p>
          <p className="text-2xl font-bold text-danger-500">{alertCounts.critical}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-warning-500">
          <p className="text-sm text-slate-500 mb-1">Warnings</p>
          <p className="text-2xl font-bold text-warning-500">{alertCounts.warning}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Filters:</span>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="select w-40"
          >
            <option value="all">All Alerts</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="acknowledged">Acknowledged</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="select w-36"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={parameterFilter}
            onChange={(e) => setParameterFilter(e.target.value)}
            className="select w-44"
          >
            <option value="all">All Parameters</option>
            {parameterKeys.map(key => (
              <option key={key} value={key}>{parameters[key]?.name}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="select w-36"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severity">By Severity</option>
          </select>

          {alertCounts.unacknowledged > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge All ({filteredAlerts.filter(a => !a.acknowledged).length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Alert History ({filteredAlerts.length})
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckCircle className="w-12 h-12 mb-2 text-success-500" />
                <p>No alerts match your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredAlerts.map(alert => {
                  const Icon = getSeverityIcon(alert.severity);
                  const colorClass = getSeverityColor(alert.severity);
                  const isSelected = selectedAlert?.id === alert.id;

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={clsx(
                        'p-4 cursor-pointer transition-colors',
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        alert.acknowledged && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx('p-2 rounded-lg', colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {alert.parameterName}
                              </p>
                              <p className="text-sm text-slate-500 mt-0.5">{alert.message}</p>
                            </div>
                            {!alert.acknowledged && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledge(alert.id);
                                }}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(alert.timestamp)}
                            </span>
                            <span>{alert.line}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                              {getTypeLabel(alert.type)}
                            </span>
                            {alert.acknowledged && (
                              <span className="text-success-500">Acknowledged</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedAlert ? (
            <>
              <div className="card p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Alert Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Parameter</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAlert.parameterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Type</p>
                    <p className="font-medium text-slate-900 dark:text-white">{getTypeLabel(selectedAlert.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Severity</p>
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      selectedAlert.severity === 'critical' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400' :
                      selectedAlert.severity === 'warning' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
                      'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    )}>
                      {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Line</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAlert.line}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Time</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formatDateTime(selectedAlert.timestamp)}</p>
                  </div>
                  {selectedAlert.value !== undefined && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Value</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedAlert.value.toFixed(4)} {parameters[selectedAlert.parameter]?.unit}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <p className={clsx(
                      'font-medium',
                      selectedAlert.acknowledged ? 'text-success-500' : 'text-warning-500'
                    )}>
                      {selectedAlert.acknowledged ? 'Acknowledged' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recommended Actions</h3>
                <ul className="space-y-2">
                  {getRecommendedActions(selectedAlert.type).map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="card p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500">Select an alert to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alerts;
