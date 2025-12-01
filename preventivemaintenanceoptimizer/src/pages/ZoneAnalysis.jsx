import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import useStore from '../store/useStore';
import { ZONES, TEMP_THRESHOLDS } from '../services/dataProcessor';

export default function ZoneAnalysis() {
  const { processedData, selectedZones, toggleZone } = useStore();
  const [selectedZone, setSelectedZone] = useState(1);

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to view zone analysis</p>
      </div>
    );
  }

  const { zoneTemperatures, timeSeries } = processedData;
  const currentZone = zoneTemperatures?.[`zone${selectedZone}`];
  const zoneConfig = ZONES.find(z => z.id === selectedZone);
  const thresholds = TEMP_THRESHOLDS[zoneConfig?.type];

  // Prepare chart data
  const chartData = timeSeries?.slice(0, 200).map((d, i) => ({
    time: i,
    upper: d[`zone${selectedZone}Upper`],
    lower: d[`zone${selectedZone}Lower`],
    target: thresholds?.target
  })) || [];

  // Heatmap data
  const heatmapData = ZONES.map(zone => {
    const temps = zoneTemperatures?.[`zone${zone.id}`];
    return {
      zone: zone.id,
      name: zone.name,
      type: zone.type,
      upperAvg: temps?.upper?.avg || 0,
      lowerAvg: temps?.lower?.avg || 0,
      diff: temps ? Math.abs(temps.upper.avg - temps.lower.avg) : 0
    };
  });

  const getTempColor = (temp, type) => {
    const t = TEMP_THRESHOLDS[type];
    if (!t) return 'bg-gray-200';
    if (temp >= t.critical) return 'bg-red-800';
    if (temp >= t.max) return 'bg-red-500';
    if (temp >= t.target) return 'bg-orange-500';
    if (temp >= t.min) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zone Temperature Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Detailed temperature monitoring and analysis for all heating zones
        </p>
      </motion.div>

      {/* Zone Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-2">
          {ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedZone === zone.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Selected Zone Details */}
      {currentZone && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg
                ${zoneConfig?.type === 'preheat' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                ${zoneConfig?.type === 'soak' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                ${zoneConfig?.type === 'reflow' ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
                ${zoneConfig?.type === 'peak' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                ${zoneConfig?.type === 'cooling' ? 'bg-cyan-100 dark:bg-cyan-900/30' : ''}
              `}>
                <Thermometer className={`w-6 h-6
                  ${zoneConfig?.type === 'preheat' ? 'text-blue-600 dark:text-blue-400' : ''}
                  ${zoneConfig?.type === 'soak' ? 'text-purple-600 dark:text-purple-400' : ''}
                  ${zoneConfig?.type === 'reflow' ? 'text-orange-600 dark:text-orange-400' : ''}
                  ${zoneConfig?.type === 'peak' ? 'text-red-600 dark:text-red-400' : ''}
                  ${zoneConfig?.type === 'cooling' ? 'text-cyan-600 dark:text-cyan-400' : ''}
                `} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Zone {selectedZone}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {zoneConfig?.type} Zone
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Upper Heater</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentZone.upper.avg.toFixed(1)}°C
                  </span>
                  <span className="text-sm text-gray-500">avg</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Range: {currentZone.upper.min.toFixed(1)}°C - {currentZone.upper.max.toFixed(1)}°C
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Lower Heater</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentZone.lower.avg.toFixed(1)}°C
                  </span>
                  <span className="text-sm text-gray-500">avg</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Range: {currentZone.lower.min.toFixed(1)}°C - {currentZone.lower.max.toFixed(1)}°C
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Temperature Differential</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.abs(currentZone.upper.avg - currentZone.lower.avg).toFixed(1)}°C
                  </span>
                  {Math.abs(currentZone.upper.avg - currentZone.lower.avg) <= 5 ? (
                    <span className="text-success-500 text-sm">Good</span>
                  ) : Math.abs(currentZone.upper.avg - currentZone.lower.avg) <= 10 ? (
                    <span className="text-warning-500 text-sm">Monitor</span>
                  ) : (
                    <span className="text-danger-500 text-sm">High</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <p className="text-sm text-primary-600 dark:text-primary-400">Target Temperature</p>
                <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
                  {thresholds?.target}°C
                </span>
              </div>
            </div>
          </motion.div>

          {/* Temperature Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Temperature Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
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
                    dataKey="upper"
                    name="Upper Temp"
                    stroke="#ef4444"
                    fill="#ef444420"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    name="Lower Temp"
                    stroke="#3b82f6"
                    fill="#3b82f620"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#22c55e"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Temperature Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Zone Temperature Heatmap
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {heatmapData.map((zone, index) => (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">{zone.name}</span>
                <div className="flex flex-col gap-1">
                  <div
                    className={`w-16 h-12 rounded-t-lg ${getTempColor(zone.upperAvg, zone.type)} flex items-center justify-center`}
                  >
                    <span className="text-xs font-medium text-white">{zone.upperAvg.toFixed(0)}°</span>
                  </div>
                  <div
                    className={`w-16 h-12 rounded-b-lg ${getTempColor(zone.lowerAvg, zone.type)} flex items-center justify-center`}
                  >
                    <span className="text-xs font-medium text-white">{zone.lowerAvg.toFixed(0)}°</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {zone.diff <= 5 ? (
                    <Minus className="w-3 h-3 text-success-500" />
                  ) : zone.diff <= 10 ? (
                    <ArrowUp className="w-3 h-3 text-warning-500" />
                  ) : (
                    <ArrowUp className="w-3 h-3 text-danger-500" />
                  )}
                  <span className="text-gray-500 dark:text-gray-400">{zone.diff.toFixed(1)}°</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-gray-500">Below min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-gray-500">In range</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-xs text-gray-500">Above target</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs text-gray-500">Above max</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-800" />
            <span className="text-xs text-gray-500">Critical</span>
          </div>
        </div>
      </motion.div>

      {/* Blower Temperatures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Blower Temperature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blower Upper Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blower Lower Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Differential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ZONES.map(zone => {
                const temps = zoneTemperatures?.[`zone${zone.id}`];
                if (!temps) return null;
                const diff = Math.abs(temps.blowerUpper.avg - temps.blowerLower.avg);
                return (
                  <tr key={zone.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{zone.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{temps.blowerUpper.avg.toFixed(1)}°C</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{temps.blowerLower.avg.toFixed(1)}°C</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${diff <= 3 ? 'text-success-600' : diff <= 5 ? 'text-warning-600' : 'text-danger-600'}`}>
                        {diff.toFixed(1)}°C
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
