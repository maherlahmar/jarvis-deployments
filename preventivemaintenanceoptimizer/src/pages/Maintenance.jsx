import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  Target
} from 'lucide-react';
import useStore from '../store/useStore';

const priorityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-danger-50 dark:bg-danger-900/20',
    border: 'border-danger-200 dark:border-danger-800',
    iconColor: 'text-danger-500',
    badge: 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300'
  },
  high: {
    icon: AlertCircle,
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    border: 'border-warning-200 dark:border-warning-800',
    iconColor: 'text-warning-500',
    badge: 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300'
  },
  medium: {
    icon: Info,
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    border: 'border-primary-200 dark:border-primary-800',
    iconColor: 'text-primary-500',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
  },
  low: {
    icon: CheckCircle,
    bg: 'bg-success-50 dark:bg-success-900/20',
    border: 'border-success-200 dark:border-success-800',
    iconColor: 'text-success-500',
    badge: 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300'
  }
};

const categoryIcons = {
  temperature: '🌡️',
  electrical: '⚡',
  mechanical: '⚙️',
  atmosphere: '💨',
  alarms: '🚨',
  preventive: '📋'
};

export default function Maintenance() {
  const { processedData } = useStore();
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to view maintenance recommendations</p>
      </div>
    );
  }

  const { recommendations } = processedData;

  const filteredRecommendations = recommendations?.filter(rec => {
    if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
    return true;
  }) || [];

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const priorities = ['critical', 'high', 'medium', 'low'];
  const categories = [...new Set(recommendations?.map(r => r.category) || [])];

  const priorityCounts = priorities.reduce((acc, p) => {
    acc[p] = recommendations?.filter(r => r.priority === p).length || 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Recommendations</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          AI-powered preventive maintenance suggestions based on equipment data analysis
        </p>
      </motion.div>

      {/* Priority Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {priorities.map((priority, index) => {
          const config = priorityConfig[priority];
          const Icon = config.icon;
          return (
            <motion.div
              key={priority}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card p-4 cursor-pointer transition-all ${
                filterPriority === priority ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setFilterPriority(filterPriority === priority ? 'all' : priority)}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {priorityCounts[priority]}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium capitalize text-gray-600 dark:text-gray-400">
                {priority}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Priorities</option>
            {priorities.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {(filterPriority !== 'all' || filterCategory !== 'all') && (
            <button
              onClick={() => { setFilterPriority('all'); setFilterCategory('all'); }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Clear filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Recommendations
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All equipment is operating within optimal parameters for the selected filters.
            </p>
          </motion.div>
        ) : (
          filteredRecommendations.map((rec, index) => {
            const config = priorityConfig[rec.priority];
            const Icon = config.icon;
            const isExpanded = expandedItems.has(rec.id);

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card overflow-hidden border-l-4 ${config.border}`}
              >
                <div
                  className={`p-6 cursor-pointer ${config.bg}`}
                  onClick={() => toggleExpand(rec.id)}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`w-6 h-6 mt-1 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${config.badge}`}>
                          {rec.priority}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {categoryIcons[rec.category]} {rec.category}
                        </span>
                        {rec.zone && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                            Zone {rec.zone}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {rec.estimatedTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {rec.estimatedTime}
                          </span>
                        )}
                        {rec.impact && (
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Impact: {rec.impact}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Recommended Actions
                        </h4>
                        <ul className="space-y-2">
                          {rec.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
                                {i + 1}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">{action}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
                          <button className="btn-primary flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule Maintenance
                          </button>
                          <button className="btn-secondary flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Mark as Completed
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Preventive Maintenance Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recommended PM Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Clean heating zones and blowers</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Weekly</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1-2 hours</td>
                <td className="px-4 py-3"><span className="badge-warning">High</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Calibrate thermocouples</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Monthly</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2-4 hours</td>
                <td className="px-4 py-3"><span className="badge-warning">High</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Inspect conveyor belt and chain</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Monthly</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1 hour</td>
                <td className="px-4 py-3"><span className="badge-info">Medium</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Replace air filters</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Quarterly</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">30 min</td>
                <td className="px-4 py-3"><span className="badge-info">Medium</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Full system calibration</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Annually</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">8 hours</td>
                <td className="px-4 py-3"><span className="badge-danger">Critical</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Check door seals and gaskets</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Bi-weekly</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">30 min</td>
                <td className="px-4 py-3"><span className="badge-success">Low</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
