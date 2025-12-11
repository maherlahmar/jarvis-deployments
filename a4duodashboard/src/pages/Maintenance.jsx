import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Package,
  ListChecks,
  X,
  Filter
} from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';

function Maintenance() {
  const { maintenanceSchedule, recommendations, fetchMaintenanceData } = useStore();
  const [expandedItem, setExpandedItem] = useState(null);
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [showRecommendations, setShowRecommendations] = useState(true);

  const filteredSchedule = useMemo(() => {
    if (filterUrgency === 'all') return maintenanceSchedule;
    return maintenanceSchedule.filter(item => item.urgency === filterUrgency);
  }, [maintenanceSchedule, filterUrgency]);

  const scheduleStats = useMemo(() => {
    const immediate = maintenanceSchedule.filter(s => s.urgency === 'immediate').length;
    const high = maintenanceSchedule.filter(s => s.urgency === 'high').length;
    const medium = maintenanceSchedule.filter(s => s.urgency === 'medium').length;
    const low = maintenanceSchedule.filter(s => s.urgency === 'low').length;
    const totalCost = maintenanceSchedule.reduce((sum, s) => sum + s.estimatedCost, 0);
    const totalDuration = maintenanceSchedule.reduce((sum, s) => sum + s.estimatedDuration, 0);

    return { immediate, high, medium, low, totalCost, totalDuration, total: maintenanceSchedule.length };
  }, [maintenanceSchedule]);

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'immediate':
        return {
          color: 'text-danger-500',
          bg: 'bg-danger-500/10',
          border: 'border-danger-500/30',
          badge: 'badge-danger',
          label: 'Immediate'
        };
      case 'high':
        return {
          color: 'text-warning-500',
          bg: 'bg-warning-500/10',
          border: 'border-warning-500/30',
          badge: 'badge-warning',
          label: 'High'
        };
      case 'medium':
        return {
          color: 'text-primary-400',
          bg: 'bg-primary-500/10',
          border: 'border-primary-500/30',
          badge: 'badge-primary',
          label: 'Medium'
        };
      default:
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          badge: 'badge-primary',
          label: 'Low'
        };
    }
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Preventive Maintenance</h1>
          <p className="text-slate-400 mt-1">Optimal maintenance scheduling and recommendations</p>
        </div>
        <button
          onClick={fetchMaintenanceData}
          className="btn btn-secondary"
        >
          <Wrench className="w-4 h-4" />
          Refresh Schedule
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-danger-500 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Immediate</span>
          </div>
          <p className="text-2xl font-bold text-danger-500">{scheduleStats.immediate}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-warning-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">High Priority</span>
          </div>
          <p className="text-2xl font-bold text-warning-500">{scheduleStats.high}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-primary-400">{scheduleStats.medium + scheduleStats.low}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ListChecks className="w-4 h-4" />
            <span className="text-sm">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{scheduleStats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Est. Downtime</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {Math.round(scheduleStats.totalDuration / 60)}h
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Est. Cost</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            ${scheduleStats.totalCost.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div
            className="card-header flex items-center justify-between cursor-pointer"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">AI Maintenance Recommendations</h3>
                <p className="text-xs text-slate-400">{recommendations.length} recommendations based on health analysis</p>
              </div>
            </div>
            {showRecommendations ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <AnimatePresence>
            {showRecommendations && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {recommendations.map((rec, idx) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className={clsx(
                        'p-4 rounded-lg border-l-4',
                        rec.priority === 1 ? 'bg-danger-500/10 border-danger-500' :
                        rec.priority === 2 ? 'bg-warning-500/10 border-warning-500' :
                        'bg-primary-500/10 border-primary-500'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={clsx(
                              'text-xs font-bold px-2 py-0.5 rounded',
                              rec.priority === 1 ? 'bg-danger-500/20 text-danger-500' :
                              rec.priority === 2 ? 'bg-warning-500/20 text-warning-500' :
                              'bg-primary-500/20 text-primary-400'
                            )}>
                              Priority {rec.priority}
                            </span>
                            <span className="text-xs text-slate-500">{rec.component}</span>
                          </div>
                          <p className="text-sm text-slate-200 mb-2">{rec.action}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Impact: {rec.impact}</span>
                            <span>Downtime: {rec.estimatedDowntime}</span>
                            <span>Confidence: {rec.confidence}%</span>
                          </div>
                        </div>
                        <button className="btn btn-ghost text-xs">
                          Schedule
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter by urgency:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {['all', 'immediate', 'high', 'medium', 'low'].map((urgency) => (
            <button
              key={urgency}
              onClick={() => setFilterUrgency(urgency)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                filterUrgency === urgency
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-slate-100'
              )}
            >
              {urgency}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="space-y-4">
        {filteredSchedule.map((item, idx) => {
          const config = getUrgencyConfig(item.urgency);
          const isExpanded = expandedItem === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className={clsx(
                'card overflow-hidden border-l-4',
                config.border
              )}
            >
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx('p-2 rounded-lg', config.bg)}>
                    <Wrench className={clsx('w-5 h-5', config.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-100">{item.componentName}</h4>
                      <span className={clsx('badge', config.badge)}>{config.label}</span>
                      {item.status === 'overdue' && (
                        <span className="badge badge-danger">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(item.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.estimatedDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${item.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Health Score</p>
                    <p className={clsx(
                      'text-xl font-bold',
                      item.healthScore >= 80 ? 'text-success-500' :
                      item.healthScore >= 70 ? 'text-warning-500' :
                      'text-danger-500'
                    )}>
                      {item.healthScore.toFixed(0)}%
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-700/50"
                  >
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Tasks */}
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <ListChecks className="w-4 h-4" />
                          Maintenance Tasks
                        </h5>
                        <div className="space-y-2">
                          {item.tasks.map((task, tIdx) => (
                            <div
                              key={tIdx}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                                  {tIdx + 1}
                                </div>
                                <span className="text-sm text-slate-300">{task.name}</span>
                              </div>
                              <span className="text-xs text-slate-500">{task.duration} min</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Spare Parts */}
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Required Spare Parts
                        </h5>
                        {item.spareParts.length > 0 ? (
                          <div className="space-y-2">
                            {item.spareParts.map((part, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                              >
                                <div>
                                  <p className="text-sm text-slate-300">{part.name}</p>
                                  <p className="text-xs text-slate-500 font-mono">{part.partNumber}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-slate-300">Qty: {part.quantity}</p>
                                  <p className="text-xs text-slate-500">${part.cost.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 p-3 bg-slate-800/30 rounded-lg">
                            No spare parts required for this maintenance
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 pb-4 flex items-center justify-end gap-3">
                      <button className="btn btn-secondary">
                        View Details
                      </button>
                      <button className="btn btn-primary">
                        Schedule Maintenance
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredSchedule.length === 0 && (
          <div className="card p-12 text-center">
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">
              No Maintenance Required
            </h3>
            <p className="text-slate-400">
              {filterUrgency === 'all'
                ? 'All components are operating within acceptable parameters.'
                : `No ${filterUrgency} priority maintenance items at this time.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Maintenance;
