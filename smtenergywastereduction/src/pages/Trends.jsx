import { useEffect, useState } from 'react';
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
  ComposedChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart2, Target } from 'lucide-react';
import useStore from '../store/useStore';

export default function Trends() {
  const {
    hourlyData,
    weeklyTrend,
    productionMetrics,
    isLoading,
    initializeData
  } = useStore();

  const [selectedMetric, setSelectedMetric] = useState('efficiency');

  useEffect(() => {
    initializeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metrics = [
    { key: 'efficiency', label: 'Efficiency', color: '#22c55e' },
    { key: 'consumption', label: 'Consumption', color: '#3b82f6' },
    { key: 'powerFactor', label: 'Power Factor', color: '#06b6d4' },
    { key: 'production', label: 'Production', color: '#a855f7' }
  ];

  // Calculate trends
  const getWeeklyTrend = () => {
    if (!weeklyTrend || weeklyTrend.length < 2) return { direction: 'stable', value: 0 };
    const recent = weeklyTrend.slice(-3);
    const earlier = weeklyTrend.slice(0, 3);

    const recentAvg = recent.reduce((sum, d) => sum + d.efficiency, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.efficiency, 0) / earlier.length;

    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      value: Math.abs(change).toFixed(1)
    };
  };

  const trend = getWeeklyTrend();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Efficiency Trends</h1>
          <p className="text-slate-400 mt-1">Track energy efficiency patterns over time</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === m.key
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Weekly Trend</span>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-5 h-5 text-red-400" />
            ) : (
              <div className="w-5 h-1 bg-slate-400 rounded" />
            )}
          </div>
          <p className="text-2xl font-bold text-white">
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.value}%
          </p>
          <p className="text-xs text-slate-500 mt-1">vs previous period</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avg Efficiency</span>
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {weeklyTrend.length > 0
              ? (weeklyTrend.reduce((sum, d) => sum + d.efficiency, 0) / weeklyTrend.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Target: 92%</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Consumption</span>
            <BarChart2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {weeklyTrend.reduce((sum, d) => sum + d.energy, 0).toFixed(0)} kWh
          </p>
          <p className="text-xs text-slate-500 mt-1">This week</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Waste Reduction</span>
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">
            -{weeklyTrend.reduce((sum, d) => sum + d.waste, 0).toFixed(0)} kWh
          </p>
          <p className="text-xs text-slate-500 mt-1">Potential savings</p>
        </div>
      </div>

      {/* Main trend chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">
            {metrics.find(m => m.key === selectedMetric)?.label} Trend - Last 24 Hours
          </h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="hourLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                domain={selectedMetric === 'efficiency' || selectedMetric === 'powerFactor' ? [0, 100] : ['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly comparison */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Weekly Performance Comparison</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weeklyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="energy" name="Energy (kWh)" fill="#3b82f6" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="production" name="Production" fill="#a855f7" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency (%)" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Efficiency breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Daily Efficiency Pattern</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="hourLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval={2}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="efficiency" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="powerFactor" stroke="#06b6d4" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500 rounded" />
                <span className="text-slate-400">Efficiency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-cyan-500 rounded border-dashed" />
                <span className="text-slate-400">Power Factor</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Production vs Energy</h3>
          </div>
          <div className="card-body">
            {productionMetrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{productionMetrics.boardsProduced}</p>
                    <p className="text-xs text-slate-400">Boards Today</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{productionMetrics.energyUsed}</p>
                    <p className="text-xs text-slate-400">kWh Used</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Energy per Board</span>
                    <span className={`text-sm font-medium ${
                      parseFloat(productionMetrics.kWhPerBoard) <= productionMetrics.targetKWhPerBoard
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}>
                      {productionMetrics.kWhPerBoard} kWh
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        parseFloat(productionMetrics.kWhPerBoard) <= productionMetrics.targetKWhPerBoard
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (productionMetrics.targetKWhPerBoard / parseFloat(productionMetrics.kWhPerBoard)) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Target: {productionMetrics.targetKWhPerBoard} kWh/board</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-lg font-bold text-green-400">{productionMetrics.efficiency}%</p>
                    <p className="text-[10px] text-slate-400">Efficiency</p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-lg font-bold text-cyan-400">{productionMetrics.uptime}%</p>
                    <p className="text-[10px] text-slate-400">Uptime</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-lg font-bold text-yellow-400">{productionMetrics.oee}%</p>
                    <p className="text-[10px] text-slate-400">OEE</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
