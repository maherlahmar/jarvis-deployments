import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  TrendingDown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import useStore from '../store/useStore';
import HealthGauge from '../components/HealthGauge';
import ComponentHealthCard from '../components/ComponentHealthCard';
import clsx from 'clsx';

function Health() {
  const {
    overallHealth,
    componentHealth,
    fetchHealthTrend,
    fetchComponentHealth
  } = useStore();

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [healthTrend, setHealthTrend] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const sortedComponents = useMemo(() => {
    const statusOrder = { critical: 0, warning: 1, fair: 2, good: 3 };
    return [...componentHealth].sort((a, b) =>
      statusOrder[a.status] - statusOrder[b.status]
    );
  }, [componentHealth]);

  const healthStats = useMemo(() => {
    const good = componentHealth.filter(c => c.status === 'good').length;
    const fair = componentHealth.filter(c => c.status === 'fair').length;
    const warning = componentHealth.filter(c => c.status === 'warning').length;
    const critical = componentHealth.filter(c => c.status === 'critical').length;

    return { good, fair, warning, critical, total: componentHealth.length };
  }, [componentHealth]);

  const handleComponentClick = async (component) => {
    setSelectedComponent(component);
    setLoadingTrend(true);
    const trend = fetchHealthTrend(component.id);
    setHealthTrend(trend);
    setLoadingTrend(false);
  };

  const closeModal = () => {
    setSelectedComponent(null);
    setHealthTrend([]);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Health Assessment</h1>
          <p className="text-slate-400 mt-1">Component health monitoring and predictive maintenance</p>
        </div>
        <button
          onClick={fetchComponentHealth}
          className="btn btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overall Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">Overall System Health</h3>
          </div>
          <div className="card-body flex flex-col items-center py-8">
            <HealthGauge
              value={overallHealth?.score || 0}
              size={180}
              status={overallHealth?.status}
            />
          </div>
        </motion.div>

        {/* Health Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card lg:col-span-2"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">Component Health Distribution</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-success-500/10 border border-success-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-sm text-slate-400">Good</span>
                </div>
                <p className="text-3xl font-bold text-success-500">{healthStats.good}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {((healthStats.good / healthStats.total) * 100).toFixed(0)}% of components
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-slate-400">Fair</span>
                </div>
                <p className="text-3xl font-bold text-primary-400">{healthStats.fair}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {((healthStats.fair / healthStats.total) * 100).toFixed(0)}% of components
                </p>
              </div>

              <div className="p-4 rounded-lg bg-warning-500/10 border border-warning-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  <span className="text-sm text-slate-400">Warning</span>
                </div>
                <p className="text-3xl font-bold text-warning-500">{healthStats.warning}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {((healthStats.warning / healthStats.total) * 100).toFixed(0)}% of components
                </p>
              </div>

              <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-danger-500" />
                  <span className="text-sm text-slate-400">Critical</span>
                </div>
                <p className="text-3xl font-bold text-danger-500">{healthStats.critical}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {((healthStats.critical / healthStats.total) * 100).toFixed(0)}% of components
                </p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Overall Health Distribution</span>
                </div>
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-success-500"
                    style={{ width: `${(healthStats.good / healthStats.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${(healthStats.fair / healthStats.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-warning-500"
                    style={{ width: `${(healthStats.warning / healthStats.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-danger-500"
                    style={{ width: `${(healthStats.critical / healthStats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Component List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Component Health Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedComponents.map((component, index) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <ComponentHealthCard
                component={component}
                onClick={() => handleComponentClick(component)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Component Detail Modal */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">
                    {selectedComponent.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Component ID: {selectedComponent.id}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Health Score and Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                    <p className="text-sm text-slate-400 mb-1">Health Score</p>
                    <p className={clsx(
                      'text-3xl font-bold',
                      selectedComponent.status === 'good' ? 'text-success-500' :
                      selectedComponent.status === 'fair' ? 'text-primary-400' :
                      selectedComponent.status === 'warning' ? 'text-warning-500' :
                      'text-danger-500'
                    )}>
                      {selectedComponent.healthScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                    <p className="text-sm text-slate-400 mb-1">Hours Since PM</p>
                    <p className="text-3xl font-bold text-slate-100">
                      {selectedComponent.hoursSinceLastPM.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                    <p className="text-sm text-slate-400 mb-1">Est. RUL</p>
                    <p className="text-3xl font-bold text-slate-100">
                      {selectedComponent.estimatedRUL.toLocaleString()} hrs
                    </p>
                  </div>
                </div>

                {/* Health Trend Chart */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">
                    Health Trend (90 Days)
                  </h4>
                  <div className="h-64 bg-slate-700/20 rounded-lg p-4">
                    {loadingTrend ? (
                      <div className="h-full flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={healthTrend}>
                          <defs>
                            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            stroke="#64748b"
                            fontSize={10}
                          />
                          <YAxis
                            domain={[50, 100]}
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine
                            y={selectedComponent.criticalThreshold}
                            stroke="#f59e0b"
                            strokeDasharray="5 5"
                            label={{
                              value: 'Critical Threshold',
                              position: 'right',
                              fill: '#f59e0b',
                              fontSize: 10
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="health"
                            name="Health"
                            stroke="#3b82f6"
                            fill="url(#healthGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-700/30">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Last PM Date</span>
                    </div>
                    <p className="text-lg font-medium text-slate-100">
                      {new Date(selectedComponent.lastPMDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Next PM Due</span>
                    </div>
                    <p className={clsx(
                      'text-lg font-medium',
                      new Date(selectedComponent.nextPMDue) < new Date() ? 'text-danger-500' : 'text-slate-100'
                    )}>
                      {new Date(selectedComponent.nextPMDue).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* MTBF Info */}
                <div className="p-4 rounded-lg bg-slate-700/30">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Component Specifications</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">MTBF:</span>
                      <span className="text-slate-100 ml-2">{selectedComponent.mtbf.toLocaleString()} hours</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cycles Since PM:</span>
                      <span className="text-slate-100 ml-2">{selectedComponent.cyclesSinceLastPM.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Critical Threshold:</span>
                      <span className="text-slate-100 ml-2">{selectedComponent.criticalThreshold}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                <button
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button className="btn btn-primary">
                  Schedule Maintenance
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Health;
