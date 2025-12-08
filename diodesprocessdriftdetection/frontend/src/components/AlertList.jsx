import { AlertTriangle, AlertCircle, Info, Check, X } from 'lucide-react';
import clsx from 'clsx';
import useStore from '../store/useStore';
import websocketService from '../services/websocket';
import { api } from '../services/api';
import { formatRelativeTime } from '../utils/formatters';

function AlertList({ limit = 10, showAcknowledged = false }) {
  const { alerts, acknowledgeAlert } = useStore();

  const filteredAlerts = showAcknowledged
    ? alerts.slice(0, limit)
    : alerts.filter(a => !a.acknowledged).slice(0, limit);

  const handleAcknowledge = async (alertId) => {
    try {
      websocketService.acknowledgeAlert(alertId);
      await api.acknowledgeAlert(alertId);
      acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      acknowledgeAlert(alertId);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-danger-500 bg-danger-500/10';
      case 'warning':
        return 'text-warning-500 bg-warning-500/10';
      default:
        return 'text-primary-500 bg-primary-500/10';
    }
  };

  if (filteredAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Check className="w-12 h-12 mb-2 text-success-500" />
        <p className="text-sm">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredAlerts.map((alert) => {
        const Icon = getSeverityIcon(alert.severity);
        const colorClass = getSeverityColor(alert.severity);

        return (
          <div
            key={alert.id}
            className={clsx(
              'flex items-start gap-3 p-3 rounded-lg border transition-all',
              alert.acknowledged
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
              alert.severity === 'critical' && !alert.acknowledged && 'border-danger-500/50'
            )}
          >
            <div className={clsx('p-2 rounded-lg', colorClass)}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {alert.parameterName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {alert.message}
                  </p>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Acknowledge"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>{alert.line}</span>
                <span>{alert.type.replace(/_/g, ' ')}</span>
                <span>{formatRelativeTime(alert.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AlertList;
