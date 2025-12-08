import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  MapPin,
  Building2,
  Shield,
  CloudRain,
  Filter,
  X
} from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { getPriorityBadgeClass, formatDate } from '../utils/helpers';

const alertTypeIcons = {
  'concentration_risk': MapPin,
  'high_risk_supplier': AlertTriangle,
  'single_source': Building2,
  'esg_concern': Shield,
  'natural_disaster': CloudRain
};

const alertTypeLabels = {
  'concentration_risk': 'Geographic Concentration',
  'high_risk_supplier': 'High Risk Supplier',
  'single_source': 'Single Source',
  'esg_concern': 'ESG Concern',
  'natural_disaster': 'Natural Disaster'
};

function AlertCard({ alert, onResolve }) {
  const [resolving, setResolving] = useState(false);
  const Icon = alertTypeIcons[alert.alert_type] || AlertTriangle;

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.resolveAlert(alert.id);
      onResolve(alert.id);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      setResolving(false);
    }
  };

  const severityColors = {
    Critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    High: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    Low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
  };

  const colors = severityColors[alert.severity] || severityColors.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`card border ${alert.is_resolved ? 'opacity-60' : colors.border}`}
    >
      <div className="p-4 flex items-start gap-4">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white">{alert.title}</h3>
                <span className={`badge ${getPriorityBadgeClass(alert.severity)}`}>
                  {alert.severity}
                </span>
                {alert.is_resolved && (
                  <span className="badge bg-green-500/20 text-green-400 border-green-500/30">
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {alertTypeLabels[alert.alert_type] || alert.alert_type}
              </p>
            </div>
            {!alert.is_resolved && (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="btn btn-secondary text-sm flex items-center gap-1"
              >
                {resolving ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Resolve
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-gray-300 mt-3">{alert.message}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            {alert.supplier_id && (
              <Link
                to={`/suppliers/${alert.supplier_id}`}
                className="flex items-center gap-1 hover:text-blue-400"
              >
                <Building2 className="w-3 h-3" />
                {alert.supplier_id}
              </Link>
            )}
            {alert.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {alert.country}
              </span>
            )}
            {alert.created_at && (
              <span>{formatDate(alert.created_at)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Alerts() {
  const { alerts, setAlerts, resolveAlert } = useStore();
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const params = {};
        if (severityFilter) params.severity = severityFilter;
        if (typeFilter) params.type = typeFilter;
        if (!showResolved) params.resolved = 'false';
        const data = await api.getAlerts(params);
        setAlerts(data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [severityFilter, typeFilter, showResolved, setAlerts]);

  const handleResolve = (id) => {
    resolveAlert(id);
    if (!showResolved) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const activeAlerts = alerts.filter(a => !a.is_resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'Critical');
  const highAlerts = activeAlerts.filter(a => a.severity === 'High');

  const alertTypes = [...new Set(alerts.map(a => a.alert_type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
        <p className="text-gray-400 mt-1">
          Monitor supply chain risks and critical events
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{activeAlerts.length}</p>
              <p className="text-sm text-gray-400">Active Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{criticalAlerts.length}</p>
              <p className="text-sm text-gray-400">Critical</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{highAlerts.length}</p>
              <p className="text-sm text-gray-400">High Priority</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {alerts.filter(a => a.is_resolved).length}
              </p>
              <p className="text-sm text-gray-400">Resolved</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="select w-36"
          >
            <option value="">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select w-48"
          >
            <option value="">All Types</option>
            {alertTypes.map(type => (
              <option key={type} value={type}>
                {alertTypeLabels[type] || type}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Show resolved</span>
          </label>

          {(severityFilter || typeFilter) && (
            <button
              onClick={() => { setSeverityFilter(''); setTypeFilter(''); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <Check className="w-12 h-12 mb-4 text-green-400" />
          <p className="text-lg font-medium">All clear!</p>
          <p className="text-sm mt-1">No active alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-white mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalAlerts.length > 0 && (
              <Link
                to="/recommendations?priority=Critical"
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <span className="text-white font-medium">Address Critical Risks</span>
                  <p className="text-sm text-gray-400">
                    {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} require immediate attention
                  </p>
                </div>
              </Link>
            )}
            <Link
              to="/concentration"
              className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-white font-medium">Review Geographic Risk</span>
                <p className="text-sm text-gray-400">Analyze concentration patterns</p>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
