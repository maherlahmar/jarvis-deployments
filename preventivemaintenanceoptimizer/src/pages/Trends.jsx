import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import useStore from '../store/useStore';

export default function Trends() {
  const { processedData } = useStore();
  const [selectedMetric, setSelectedMetric] = useState('power');
  const [timeRange, setTimeRange] = useState('all');

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to view trends</p>
      </div>
    );
  }

  const { timeSeries, statistics, energyAnalysis } = processedData;

  // Prepare chart data (sample for performance)
  const chartData = timeSeries?.slice(0, 300).map((d, i) => ({
    time: i,
    power: d.power,
    energy: d.energy,
    powerFactor: d.powerFactor * 100,
    o2: d.o2,
    flowRate: d.flowRate,
    alarms: d.alarms,
    zone1: d.zone1Upper,
    zone5: d.zone5Upper,
    zone8: d.zone8Upper,
    zone10: d.zone10Upper
  })) || [];

  const metrics = [
    { id: 'power', label: 'Power', unit: 'kW', color: '#3b82f6' },
    { id: 'powerFactor', label: 'Power Factor', unit: '%', color: '#22c55e' },
    { id: 'o2', label: 'O2 Concentration', unit: 'ppm', color: '#f59e0b' },
    { id: 'flowRate', label: 'Flow Rate', unit: 'L/min', color: '#8b5cf6' },
    { id: 'zones', label: 'Zone Temperatures', unit: '°C', color: '#ef4444' }
  ];

  const getTrend = (values) => {
    if (!values || values.length < 2) return { direction: 'stable', value: 0 };
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((avgSecond - avgFirst) / avgFirst) * 100;

    if (Math.abs(change) < 2) return { direction: 'stable', value: Math.abs(change).toFixed(1) };
    return {
      direction: change > 0 ? 'up' : 'down',
      value: Math.abs(change).toFixed(1)
    };
  };

  const powerTrend = getTrend(chartData.map(d => d.power).filter(Boolean));
  const pfTrend = getTrend(chartData.map(d => d.powerFactor).filter(Boolean));
  const o2Trend = getTrend(chartData.map(d => d.o2).filter(Boolean));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trend Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track equipment performance trends over time
        </p>
      </motion.div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Power Consumption</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statistics?.power?.avgActivePower?.toFixed(1)} kW
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium
              ${powerTrend.direction === 'up' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' : ''}
              ${powerTrend.direction === 'down' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : ''}
              ${powerTrend.direction === 'stable' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
            `}>
              {powerTrend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
              {powerTrend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
              {powerTrend.direction === 'stable' && <Minus className="w-4 h-4" />}
              {powerTrend.value}%
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Power Factor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {(statistics?.power?.avgPowerFactor * 100)?.toFixed(1)}%
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium
              ${pfTrend.direction === 'up' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : ''}
              ${pfTrend.direction === 'down' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' : ''}
              ${pfTrend.direction === 'stable' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
            `}>
              {pfTrend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
              {pfTrend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
              {pfTrend.direction === 'stable' && <Minus className="w-4 h-4" />}
              {pfTrend.value}%
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">O2 Concentration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statistics?.o2?.avgO2?.toFixed(0)} ppm
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium
              ${o2Trend.direction === 'up' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' : ''}
              ${o2Trend.direction === 'down' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : ''}
              ${o2Trend.direction === 'stable' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
            `}>
              {o2Trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
              {o2Trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
              {o2Trend.direction === 'stable' && <Minus className="w-4 h-4" />}
              {o2Trend.value}%
            </div>
          </div>
        </motion.div>
      </div>

      {/* Metric Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-2">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMetric === metric.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {metrics.find(m => m.id === selectedMetric)?.label} Over Time
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'zones' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="zone1" name="Zone 1" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="zone5" name="Zone 5" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="zone8" name="Zone 8 (Peak)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="zone10" name="Zone 10" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  name={metrics.find(m => m.id === selectedMetric)?.label}
                  stroke={metrics.find(m => m.id === selectedMetric)?.color}
                  fill={`${metrics.find(m => m.id === selectedMetric)?.color}20`}
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Energy Consumption by Hour */}
      {energyAnalysis?.hourlyConsumption?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Average Power by Hour
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={energyAnalysis.hourlyConsumption}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(h) => `${h}:00`}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value.toFixed(1)} kW`, 'Avg Power']}
                  labelFormatter={(h) => `Hour: ${h}:00`}
                />
                <Bar dataKey="avgPower" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Power Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Average Power</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics?.power?.avgActivePower?.toFixed(2)} kW
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Peak Power</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics?.power?.peakPower?.toFixed(2)} kW
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Energy</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics?.power?.totalEnergy?.toFixed(2)} kWh
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Avg Power Factor</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(statistics?.power?.avgPowerFactor * 100)?.toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Production Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Total Boards</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics?.production?.totalBoards?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Energy per Board</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {energyAnalysis?.energyPerBoard} kWh
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Avg Flow Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics?.flow?.avgFlowRate?.toFixed(2)} L/min
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Avg O2 Level</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics?.o2?.avgO2?.toFixed(0)} ppm
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
