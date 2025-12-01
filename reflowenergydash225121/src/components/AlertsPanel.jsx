import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X, DollarSign, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';

const alertIcons = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
};

const alertColors = {
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-500',
    badge: 'badge-warning',
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-500',
    badge: 'badge-danger',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
    badge: 'badge-info',
  },
};

function AlertCard({ alert, onDismiss }) {
  const colors = alertColors[alert.type] || alertColors.info;
  const Icon = alertIcons[alert.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-lg border ${colors.bg} ${colors.border} relative group`}
    >
      <button
        onClick={() => onDismiss(alert.id)}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium">{alert.title}</h4>
            <span className={`badge ${colors.badge}`}>{alert.priority}</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{alert.message}</p>

          {alert.potentialSavings > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">
                Potential savings: ${alert.potentialSavings.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AlertsPanel({ compact = false }) {
  const { alerts, dismissedAlerts, dismissAlert } = useStore();
  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const highPriorityAlerts = activeAlerts.filter(a => a.priority === 'high');
  const otherAlerts = activeAlerts.filter(a => a.priority !== 'high');

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          </div>
          <span className="badge badge-warning">{activeAlerts.length}</span>
        </div>
        <div className="card-body space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {activeAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-400"
              >
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts</p>
                <p className="text-sm mt-1">System is operating normally</p>
              </motion.div>
            ) : (
              activeAlerts.slice(0, 5).map((alert) => (
                <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
              ))
            )}
          </AnimatePresence>

          {activeAlerts.length > 5 && (
            <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 py-2 flex items-center justify-center gap-1">
              View all {activeAlerts.length} alerts
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30 border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{highPriorityAlerts.length}</p>
              <p className="text-sm text-gray-400">High Priority</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{activeAlerts.length}</p>
              <p className="text-sm text-gray-400">Total Active</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                ${activeAlerts.reduce((acc, a) => acc + (a.potentialSavings || 0), 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-400">Potential Savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Alerts */}
      {highPriorityAlerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-white">High Priority Alerts</h3>
            </div>
          </div>
          <div className="card-body space-y-3">
            <AnimatePresence mode="popLayout">
              {highPriorityAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Other Alerts */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">
              {highPriorityAlerts.length > 0 ? 'Other Alerts' : 'All Alerts'}
            </h3>
          </div>
        </div>
        <div className="card-body space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {otherAlerts.length === 0 && highPriorityAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-400"
              >
                <Info className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No active alerts</p>
                <p className="text-sm mt-2">Your reflow oven is operating within normal parameters</p>
              </motion.div>
            ) : otherAlerts.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No additional alerts</p>
            ) : (
              otherAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AlertsPanel;
