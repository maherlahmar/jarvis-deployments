import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Thermometer,
  Gauge,
  Activity,
  TrendingUp,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import useStore from '../store/useStore';
import ReactorStatus from '../components/ReactorStatus';
import clsx from 'clsx';

const timeRanges = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' }
];

function Performance() {
  const {
    furnaceStatus,
    temperatureHistory,
    processHistory,
    selectedTimeRange,
    setSelectedTimeRange,
    fetchAnalytics
  } = useStore();

  const [selectedZone, setSelectedZone] = useState('all');

  const zones = [
    'Zone 1 (Top)',
    'Zone 2',
    'Zone 3 (Center)',
    'Zone 4',
    'Zone 5 (Bottom)'
  ];

  const zoneColors = {
    'Zone 1 (Top)': '#ef4444',
    'Zone 2': '#f97316',
    'Zone 3 (Center)': '#22c55e',
    'Zone 4': '#3b82f6',
    'Zone 5 (Bottom)': '#8b5cf6'
  };

  const filteredTempData = useMemo(() => {
    let data = temperatureHistory;

    // Filter by time range
    const now = new Date();
    const cutoff = {
      '1h': 12, // 12 data points (5 min intervals)
      '6h': 72,
      '24h': 288,
      '7d': temperatureHistory.length
    }[selectedTimeRange] || 288;

    return data.slice(-cutoff);
  }, [temperatureHistory, selectedTimeRange]);

  const recentProcesses = useMemo(() => {
    return processHistory.slice(0, 10);
  }, [processHistory]);

  const processStats = useMemo(() => {
    const completed = processHistory.filter(p => p.status === 'completed');
    const totalWafers = completed.reduce((sum, p) => sum + p.wafersProcessed, 0);
    const avgDuration = completed.reduce((sum, p) => sum + p.duration, 0) / completed.length || 0;
    const avgUniformity = completed.reduce((sum, p) => sum + p.results.thicknessUniformity, 0) / completed.length || 0;

    return {
      totalRuns: processHistory.length,
      completedRuns: completed.length,
      abortedRuns: processHistory.filter(p => p.status === 'aborted').length,
      totalWafers,
      avgDuration: avgDuration.toFixed(0),
      avgUniformity: avgUniformity.toFixed(2),
      successRate: ((completed.length / processHistory.length) * 100).toFixed(1)
    };
  }, [processHistory]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">
            {new Date(label).toLocaleString()}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)} C
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Performance Monitoring</h1>
          <p className="text-slate-400 mt-1">Real-time process parameters and thermal profiles</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedTimeRange(range.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  selectedTimeRange === range.value
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:text-slate-100'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Reactor Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReactorStatus
          reactor={furnaceStatus?.reactorA}
          name="Reactor A"
        />
        <ReactorStatus
          reactor={furnaceStatus?.reactorB}
          name="Reactor B"
        />
      </div>

      {/* Temperature Profile Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-slate-100">Temperature Profile</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="select text-sm py-1.5"
            >
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => {
                    const d = new Date(ts);
                    return selectedTimeRange === '7d'
                      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  }}
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `${v}C`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(selectedZone === 'all' ? zones : [selectedZone]).map((zone) => (
                  <Line
                    key={zone}
                    type="monotone"
                    dataKey={zone}
                    name={zone}
                    stroke={zoneColors[zone]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Zone Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-700/50">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(selectedZone === zone ? 'all' : zone)}
                className={clsx(
                  'flex items-center gap-2 text-sm transition-opacity',
                  selectedZone !== 'all' && selectedZone !== zone && 'opacity-40'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: zoneColors[zone] }}
                />
                <span className="text-slate-400">{zone}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Process Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Total Runs</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{processStats.totalRuns}</p>
          <p className="text-xs text-slate-500 mt-1">
            {processStats.completedRuns} completed, {processStats.abortedRuns} aborted
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-success-500">{processStats.successRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Duration</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{processStats.avgDuration} min</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Gauge className="w-4 h-4" />
            <span className="text-sm">Avg Uniformity</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{processStats.avgUniformity}%</p>
        </motion.div>
      </div>

      {/* Recent Process Runs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="font-semibold text-slate-100">Recent Process Runs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Reactor</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Wafers</th>
                <th>Temp</th>
                <th>Uniformity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProcesses.map((process) => (
                <tr key={process.id}>
                  <td>
                    <div>
                      <p className="font-medium text-slate-100">{process.recipeName}</p>
                      <p className="text-xs text-slate-500">{process.recipeId}</p>
                    </div>
                  </td>
                  <td className="text-slate-300">{process.reactor}</td>
                  <td className="text-slate-300 font-mono text-xs">
                    {new Date(process.startTime).toLocaleString()}
                  </td>
                  <td className="text-slate-300">{process.duration} min</td>
                  <td className="text-slate-300">{process.wafersProcessed}</td>
                  <td className="text-slate-300">{process.results.avgTemperature.toFixed(1)} C</td>
                  <td className="text-slate-300">{process.results.thicknessUniformity.toFixed(2)}%</td>
                  <td>
                    <span className={clsx(
                      'badge',
                      process.status === 'completed' ? 'badge-success' : 'badge-danger'
                    )}>
                      {process.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Utilities Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="font-semibold text-slate-100">Utilities Status</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/30">
              <p className="text-sm text-slate-400 mb-1">N2 Pressure</p>
              <p className="text-xl font-bold text-slate-100">
                {furnaceStatus?.utilities?.n2Pressure?.toFixed(1) || '--'} psi
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success-500 rounded-full"
                  style={{ width: `${(furnaceStatus?.utilities?.n2Pressure / 100) * 100 || 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30">
              <p className="text-sm text-slate-400 mb-1">Facility Water</p>
              <p className="text-xl font-bold text-slate-100">
                {furnaceStatus?.utilities?.facilityWater?.toFixed(1) || '--'} psi
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(furnaceStatus?.utilities?.facilityWater / 60) * 100 || 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30">
              <p className="text-sm text-slate-400 mb-1">Exhaust Flow</p>
              <p className="text-xl font-bold text-slate-100">
                {furnaceStatus?.utilities?.exhaustFlow?.toFixed(0) || '--'} CFM
              </p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning-500 rounded-full"
                  style={{ width: `${(furnaceStatus?.utilities?.exhaustFlow / 600) * 100 || 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30">
              <p className="text-sm text-slate-400 mb-1">Cleanroom Class</p>
              <p className="text-xl font-bold text-success-500">
                Class {furnaceStatus?.utilities?.cleanroomClass || '--'}
              </p>
              <p className="text-xs text-slate-500 mt-2">ISO 5 / Class 100</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Performance;
