import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Zap, TrendingUp, TrendingDown, Target, Leaf } from 'lucide-react';
import useStore from '../store/useStore';

export default function Energy() {
  const { processedData } = useStore();

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to view energy analysis</p>
      </div>
    );
  }

  const { statistics, energyAnalysis, timeSeries } = processedData;

  // Prepare power consumption chart data
  const powerData = timeSeries?.slice(0, 200).map((d, i) => ({
    time: i,
    power: d.power,
    powerFactor: d.powerFactor * 100
  })) || [];

  // Energy distribution mock data based on zones
  const energyDistribution = [
    { name: 'Preheat Zones', value: 15, color: '#3b82f6' },
    { name: 'Soak Zones', value: 20, color: '#8b5cf6' },
    { name: 'Reflow Zones', value: 35, color: '#f59e0b' },
    { name: 'Peak Zone', value: 20, color: '#ef4444' },
    { name: 'Cooling', value: 10, color: '#22c55e' }
  ];

  const efficiency = parseFloat(energyAnalysis?.efficiency) || 0;
  const avgPF = statistics?.power?.avgPowerFactor * 100 || 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Energy Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor and optimize energy consumption for your reflow oven
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Energy</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {energyAnalysis?.totalEnergy || '0'} kWh
          </p>
          <p className="text-xs text-gray-500 mt-1">During analysis period</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Peak Power</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {energyAnalysis?.peakPower || '0'} kW
          </p>
          <p className="text-xs text-gray-500 mt-1">Maximum demand</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
              <Target className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {efficiency}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Avg vs Peak utilization</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Leaf className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Energy/Board</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {energyAnalysis?.energyPerBoard || '0'} kWh
          </p>
          <p className="text-xs text-gray-500 mt-1">Per unit produced</p>
        </motion.div>
      </div>

      {/* Power Consumption Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Power Consumption Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[80, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="power"
                name="Active Power (kW)"
                stroke="#3b82f6"
                fill="#3b82f620"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="powerFactor"
                name="Power Factor (%)"
                stroke="#22c55e"
                fill="#22c55e20"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estimated Energy Distribution by Zone Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {energyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {energyDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Power Factor Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Power Factor Performance
          </h3>

          <div className="relative pt-8 pb-4">
            {/* Gauge Background */}
            <div className="w-48 h-24 mx-auto relative overflow-hidden">
              <div className="absolute inset-0 rounded-t-full border-8 border-gray-200 dark:border-gray-700" />
              <div
                className="absolute inset-0 rounded-t-full border-8 origin-bottom"
                style={{
                  borderColor: avgPF >= 95 ? '#22c55e' : avgPF >= 85 ? '#f59e0b' : '#ef4444',
                  clipPath: `polygon(0 100%, 0 ${100 - avgPF}%, 100% ${100 - avgPF}%, 100% 100%)`,
                  transform: 'rotate(180deg)'
                }}
              />
            </div>
            <div className="text-center -mt-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {avgPF.toFixed(1)}%
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Power Factor</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Minimum PF</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(statistics?.power?.minPowerFactor * 100)?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Maximum PF</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(statistics?.power?.maxPowerFactor * 100)?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Target</span>
              <span className="font-medium text-success-600 dark:text-success-400">95%+</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Energy Recommendations */}
      {energyAnalysis?.recommendations?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Energy Optimization Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {energyAnalysis.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{rec.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-success-500" />
                  <span className="text-sm font-medium text-success-600 dark:text-success-400">
                    {rec.potential}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Energy Stats Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Energy Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Average Active Power</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{energyAnalysis?.avgPower} kW</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">- kW</td>
                <td className="px-4 py-3"><span className="badge-info">Baseline</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Peak Power</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{energyAnalysis?.peakPower} kW</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">&lt;40 kW</td>
                <td className="px-4 py-3">
                  {parseFloat(energyAnalysis?.peakPower || 0) < 40 ? (
                    <span className="badge-success">Good</span>
                  ) : (
                    <span className="badge-warning">Review</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Power Factor</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{avgPF.toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">&gt;95%</td>
                <td className="px-4 py-3">
                  {avgPF >= 95 ? (
                    <span className="badge-success">Excellent</span>
                  ) : avgPF >= 85 ? (
                    <span className="badge-warning">Fair</span>
                  ) : (
                    <span className="badge-danger">Poor</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Load Factor</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{efficiency}%</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">&gt;80%</td>
                <td className="px-4 py-3">
                  {efficiency >= 80 ? (
                    <span className="badge-success">Good</span>
                  ) : (
                    <span className="badge-warning">Optimize</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Energy per Board</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{energyAnalysis?.energyPerBoard} kWh</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">&lt;0.05 kWh</td>
                <td className="px-4 py-3">
                  {parseFloat(energyAnalysis?.energyPerBoard || 0) < 0.05 ? (
                    <span className="badge-success">Efficient</span>
                  ) : (
                    <span className="badge-info">Normal</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
