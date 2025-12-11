import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle,
  Filter,
  Search,
  Bell,
  BellOff,
  Clock,
  RefreshCw
} from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';

function Alarms() {
  const { alarms, acknowledgeAlarm, resolveAlarm, fetchAlarms } = useStore();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlarms = useMemo(() => {
    return alarms.filter(alarm => {
      // Severity filter
      if (filterSeverity !== 'all' && alarm.severity !== filterSeverity) return false;

      // Status filter
      if (filterStatus === 'active' && alarm.resolved) return false;
      if (filterStatus === 'acknowledged' && !alarm.acknowledged) return false;
      if (filterStatus === 'unacknowledged' && alarm.acknowledged) return false;
      if (filterStatus === 'resolved' && !alarm.resolved) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          alarm.message.toLowerCase().includes(query) ||
          alarm.code.toLowerCase().includes(query) ||
          alarm.reactor.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [alarms, filterSeverity, filterStatus, searchQuery]);

  const alarmStats = useMemo(() => {
    const total = alarms.length;
    const active = alarms.filter(a => !a.resolved).length;
    const unacknowledged = alarms.filter(a => !a.acknowledged).length;
    const critical = alarms.filter(a => a.severity === 'critical' && !a.resolved).length;
    const warning = alarms.filter(a => a.severity === 'warning' && !a.resolved).length;

    return { total, active, unacknowledged, critical, warning };
  }, [alarms]);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-danger-500',
          bg: 'bg-danger-500/10',
          border: 'border-danger-500/30',
          label: 'Critical'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-warning-500',
          bg: 'bg-warning-500/10',
          border: 'border-warning-500/30',
          label: 'Warning'
        };
      case 'info':
        return {
          icon: Info,
          color: 'text-primary-400',
          bg: 'bg-primary-500/10',
          border: 'border-primary-500/30',
          label: 'Info'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          label: 'Unknown'
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // More than 24 hours
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Alarms & Events</h1>
          <p className="text-slate-400 mt-1">System alarms and event monitoring</p>
        </div>
        <button
          onClick={fetchAlarms}
          className="btn btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{alarmStats.active}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-warning-500 mb-2">
            <BellOff className="w-4 h-4" />
            <span className="text-sm">Unacknowledged</span>
          </div>
          <p className="text-2xl font-bold text-warning-500">{alarmStats.unacknowledged}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-danger-500 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Critical</span>
          </div>
          <p className="text-2xl font-bold text-danger-500">{alarmStats.critical}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-warning-500 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Warning</span>
          </div>
          <p className="text-2xl font-bold text-warning-500">{alarmStats.warning}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Total (7 days)</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{alarmStats.total}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search alarms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="select"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlarms.map((alarm, idx) => {
            const config = getSeverityConfig(alarm.severity);
            const SeverityIcon = config.icon;

            return (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: 0.03 * idx }}
                className={clsx(
                  'card p-4 border-l-4 transition-all duration-200',
                  config.border,
                  alarm.resolved && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={clsx('p-2 rounded-lg flex-shrink-0', config.bg)}>
                    <SeverityIcon className={clsx('w-5 h-5', config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-500">{alarm.code}</span>
                          <span className={clsx(
                            'badge text-xs',
                            alarm.severity === 'critical' ? 'badge-danger' :
                            alarm.severity === 'warning' ? 'badge-warning' :
                            'badge-primary'
                          )}>
                            {config.label}
                          </span>
                          {alarm.resolved && (
                            <span className="badge badge-success text-xs">Resolved</span>
                          )}
                          {!alarm.acknowledged && !alarm.resolved && (
                            <span className="badge badge-warning text-xs animate-pulse">
                              Unacknowledged
                            </span>
                          )}
                        </div>
                        <p className="text-slate-100 font-medium">{alarm.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>{alarm.reactor}</span>
                          {alarm.component && (
                            <>
                              <span>|</span>
                              <span>{alarm.component}</span>
                            </>
                          )}
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(alarm.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alarm.acknowledged && !alarm.resolved && (
                          <button
                            onClick={() => acknowledgeAlarm(alarm.id)}
                            className="btn btn-ghost text-xs px-3 py-1.5"
                          >
                            Acknowledge
                          </button>
                        )}
                        {!alarm.resolved && (
                          <button
                            onClick={() => resolveAlarm(alarm.id)}
                            className="btn btn-ghost text-xs px-3 py-1.5 text-success-500 hover:bg-success-500/10"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlarms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">
              No Alarms Found
            </h3>
            <p className="text-slate-400">
              {searchQuery
                ? 'No alarms match your search criteria.'
                : filterSeverity !== 'all' || filterStatus !== 'all'
                ? 'No alarms match the selected filters.'
                : 'All systems operating normally.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Alarm History Note */}
      <div className="text-center text-sm text-slate-500">
        Showing alarms from the last 7 days. Older alarms are archived automatically.
      </div>
    </div>
  );
}

export default Alarms;
