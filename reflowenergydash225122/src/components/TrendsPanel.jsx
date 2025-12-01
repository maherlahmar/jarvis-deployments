import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Zap,
  Clock,
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
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import useStore from '../store/useStore';
import { DailyEnergyChart, HourlyPatternChart } from './charts';

function TrendsPanel() {
  const { dailyMetrics, hourlyMetrics, chartData, energyMetrics } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Calculate trend data
  const trendData = useMemo(() => {
    if (!dailyMetrics || dailyMetrics.length < 2) return null;

    const recent = dailyMetrics.slice(-7);
    const previous = dailyMetrics.slice(-14, -7);

    const recentAvg = recent.reduce((acc, d) => acc + d.energyConsumed, 0) / recent.length;
    const previousAvg = previous.length > 0
      ? previous.reduce((acc, d) => acc + d.energyConsumed, 0) / previous.length
      : recentAvg;

    const energyTrend = ((recentAvg - previousAvg) / previousAvg) * 100;

    const recentIdleAvg = recent.reduce((acc, d) => acc + d.idlePercentage, 0) / recent.length;
    const previousIdleAvg = previous.length > 0
      ? previous.reduce((acc, d) => acc + d.idlePercentage, 0) / previous.length
      : recentIdleAvg;

    const idleTrend = ((recentIdleAvg - previousIdleAvg) / Math.max(previousIdleAvg, 1)) * 100;

    return {
      energyTrend,
      idleTrend,
      recentAvg,
      previousAvg,
      recentIdleAvg,
    };
  }, [dailyMetrics]);

  // Efficiency trend data
  const efficiencyData = useMemo(() => {
    if (!dailyMetrics || dailyMetrics.length === 0) return [];
    return dailyMetrics.map(d => ({
      date: d.date,
      efficiency: 100 - d.idlePercentage,
      energyPerUnit: d.avgPower > 0 ? d.energyConsumed / d.avgPower : 0,
    }));
  }, [dailyMetrics]);

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/30 border"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Energy This Week</p>
              <p className="text-2xl font-bold text-white mt-1">
                {trendData ? `${trendData.recentAvg.toFixed(0)} kWh` : '--'}
              </p>
              {trendData && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  trendData.energyTrend < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trendData.energyTrend < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>{Math.abs(trendData.energyTrend).toFixed(1)}% vs last week</span>
                </div>
              )}
            </div>
            <div className="p-2 rounded-lg bg-primary-500/20">
              <Zap className="w-5 h-5 text-primary-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 border"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Idle Time</p>
              <p className="text-2xl font-bold text-white mt-1">
                {trendData ? `${trendData.recentIdleAvg.toFixed(1)}%` : '--'}
              </p>
              {trendData && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  trendData.idleTrend < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trendData.idleTrend < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>{Math.abs(trendData.idleTrend).toFixed(1)}% vs last week</span>
                </div>
              )}
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 border"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Cost Per Day</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${trendData ? (trendData.recentAvg * 0.12).toFixed(2) : '--'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                @$0.12/kWh
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/20">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 border"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Data Points</p>
              <p className="text-2xl font-bold text-white mt-1">
                {energyMetrics?.dataPointCount?.toLocaleString() || '--'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {dailyMetrics?.length || 0} days analyzed
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Energy Consumption Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Power Consumption Trend</h3>
            <p className="text-sm text-gray-400">Hourly average and peak power</p>
          </div>
        </div>
        <div className="card-body">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.slice(-168)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => {
                    const parts = v.split(' ');
                    return parts[1] || v;
                  }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v} kW`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v}°C`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgPower"
                  name="Avg Power (kW)"
                  stroke="#0ea5e9"
                  fill="url(#colorPower)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgTemp"
                  name="Avg Temp (°C)"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Daily and Hourly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyEnergyChart data={dailyMetrics} />
        <HourlyPatternChart data={hourlyMetrics} />
      </div>

      {/* Efficiency Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Efficiency Trend</h3>
          <p className="text-sm text-gray-400">Operating efficiency over time (100% - idle%)</p>
        </div>
        <div className="card-body">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => format(parseISO(v), 'MMM d')}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[80, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Efficiency']}
                  labelFormatter={(label) => format(parseISO(label), 'EEEE, MMM d')}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  name="Operating Efficiency"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Key Insights</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h4 className="text-blue-400 font-medium mb-2">Peak Usage Hours</h4>
              <p className="text-gray-300">
                Highest energy consumption typically occurs between 09:00-11:00 and 14:00-16:00.
                Consider load shifting for non-critical operations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <h4 className="text-green-400 font-medium mb-2">Best Performance</h4>
              <p className="text-gray-300">
                Lowest idle time observed during mid-morning hours. Maintain batch scheduling
                patterns from these periods.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="text-yellow-400 font-medium mb-2">Improvement Opportunity</h4>
              <p className="text-gray-300">
                Late afternoon shows elevated idle percentages. Review batch completion timing
                to reduce end-of-day idle consumption.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <h4 className="text-purple-400 font-medium mb-2">Temperature Correlation</h4>
              <p className="text-gray-300">
                Power consumption correlates with zone temperatures. Verify profile requirements
                to avoid over-heating.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TrendsPanel;
