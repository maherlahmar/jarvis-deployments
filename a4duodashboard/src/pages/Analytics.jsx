import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Layers,
  Activity,
  Download,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import useStore from '../store/useStore';
import { RECIPES } from '../services/syntheticData';
import clsx from 'clsx';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function Analytics() {
  const { throughputData, oeeData, processHistory, furnaceConfig } = useStore();
  const [dateRange, setDateRange] = useState('30d');

  const filteredThroughput = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
    return throughputData.slice(-days);
  }, [throughputData, dateRange]);

  const filteredOEE = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
    return oeeData.slice(-days);
  }, [oeeData, dateRange]);

  const summaryStats = useMemo(() => {
    const totalWafers = filteredThroughput.reduce((sum, d) => sum + d.wafersProcessed, 0);
    const totalBatches = filteredThroughput.reduce((sum, d) => sum + d.batches, 0);
    const avgUptime = filteredThroughput.reduce((sum, d) => sum + d.uptime, 0) / filteredThroughput.length;
    const avgYield = filteredThroughput.reduce((sum, d) => sum + d.yield, 0) / filteredThroughput.length;
    const avgOEE = filteredOEE.reduce((sum, d) => sum + d.oee, 0) / filteredOEE.length;

    return {
      totalWafers,
      totalBatches,
      avgUptime: avgUptime.toFixed(1),
      avgYield: avgYield.toFixed(2),
      avgOEE: avgOEE.toFixed(1)
    };
  }, [filteredThroughput, filteredOEE]);

  const recipeDistribution = useMemo(() => {
    const distribution = {};
    processHistory.forEach(p => {
      const recipe = RECIPES.find(r => r.id === p.recipeId);
      const app = recipe?.application || 'Other';
      distribution[app] = (distribution[app] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  }, [processHistory]);

  const reactorUtilization = useMemo(() => {
    const reactorA = processHistory.filter(p => p.reactor === 'Reactor A').length;
    const reactorB = processHistory.filter(p => p.reactor === 'Reactor B').length;
    const total = reactorA + reactorB;

    return [
      { name: 'Reactor A', value: reactorA, percentage: ((reactorA / total) * 100).toFixed(1) },
      { name: 'Reactor B', value: reactorB, percentage: ((reactorB / total) * 100).toFixed(1) }
    ];
  }, [processHistory]);

  const dailyByRecipe = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayProcesses = processHistory.filter(p =>
        p.startTime.startsWith(dateStr)
      );

      const entry = { date: dateStr };
      RECIPES.forEach(recipe => {
        entry[recipe.id] = dayProcesses.filter(p => p.recipeId === recipe.id).length;
      });

      data.push(entry);
    }

    return data;
  }, [processHistory, dateRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-slate-100">{payload[0].name}</p>
          <p className="text-xs text-slate-400">{payload[0].value} runs</p>
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
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-400 mt-1">Production analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {[
              { value: '7d', label: '7 Days' },
              { value: '14d', label: '14 Days' },
              { value: '30d', label: '30 Days' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  dateRange === range.value
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:text-slate-100'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-sm">Total Wafers</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {summaryStats.totalWafers.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Total Batches</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {summaryStats.totalBatches.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Uptime</span>
          </div>
          <p className="text-2xl font-bold text-success-500">{summaryStats.avgUptime}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">Avg Yield</span>
          </div>
          <p className="text-2xl font-bold text-success-500">{summaryStats.avgYield}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Avg OEE</span>
          </div>
          <p className="text-2xl font-bold text-primary-400">{summaryStats.avgOEE}%</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">Daily Wafer Throughput</h3>
          </div>
          <div className="card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredThroughput}>
                  <defs>
                    <linearGradient id="wafersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} domain={[80, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="wafersProcessed"
                    name="Wafers"
                    stroke="#22c55e"
                    fill="url(#wafersGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="yield"
                    name="Yield %"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* OEE Components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">OEE Components</h3>
          </div>
          <div className="card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredOEE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <YAxis domain={[70, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="availability"
                    name="Availability"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="performance"
                    name="Performance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    name="Quality"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="oee"
                    name="OEE"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">Process Distribution</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recipeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {recipeDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {recipeDistribution.slice(0, 6).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-400 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reactor Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">Reactor Utilization</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reactorUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {reactorUtilization.map((reactor, index) => (
                <div key={reactor.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: index === 0 ? '#3b82f6' : '#22c55e' }}
                    />
                    <span className="text-sm text-slate-300">{reactor.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-100">{reactor.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Uptime Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="font-semibold text-slate-100">Uptime Trend</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredThroughput}>
                  <defs>
                    <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric' })}
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <YAxis domain={[80, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="uptime"
                    name="Uptime %"
                    stroke="#3b82f6"
                    fill="url(#uptimeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Equipment Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="font-semibold text-slate-100">Equipment Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Model</p>
              <p className="text-slate-100 font-medium">{furnaceConfig.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Serial Number</p>
              <p className="text-slate-100 font-medium font-mono">{furnaceConfig.serialNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Install Date</p>
              <p className="text-slate-100 font-medium">
                {new Date(furnaceConfig.installDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Wafer Size</p>
              <p className="text-slate-100 font-medium">{furnaceConfig.waferSize}mm</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Max Batch Size</p>
              <p className="text-slate-100 font-medium">{furnaceConfig.maxBatchSize} wafers</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Reactors</p>
              <p className="text-slate-100 font-medium">{furnaceConfig.reactors.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Temperature Range</p>
              <p className="text-slate-100 font-medium">
                {furnaceConfig.temperatureRange.min} - {furnaceConfig.temperatureRange.max} C
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Pressure Range</p>
              <p className="text-slate-100 font-medium">
                {furnaceConfig.pressureRange.min} - {furnaceConfig.pressureRange.max} Torr
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-sm text-slate-500 mb-2">Supported Applications</p>
            <div className="flex flex-wrap gap-2">
              {furnaceConfig.applications.map((app) => (
                <span key={app} className="badge badge-primary">
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Analytics;
