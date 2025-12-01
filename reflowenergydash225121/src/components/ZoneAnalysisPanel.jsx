import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Thermometer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import useStore from '../store/useStore';
import { ZoneHeatmap } from './charts';

function ZoneDetailCard({ zone, isExpanded, onToggle }) {
  const getStatusColor = () => {
    if (zone.tempVariance > 15) return 'border-red-500/30 bg-red-500/10';
    if (zone.tempVariance > 10) return 'border-yellow-500/30 bg-yellow-500/10';
    return 'border-green-500/30 bg-green-500/10';
  };

  const getStatusLabel = () => {
    if (zone.tempVariance > 15) return { text: 'Unstable', color: 'text-red-400' };
    if (zone.tempVariance > 10) return { text: 'Variable', color: 'text-yellow-400' };
    return { text: 'Stable', color: 'text-green-400' };
  };

  const status = getStatusLabel();

  return (
    <motion.div
      layout
      className={`rounded-xl border ${getStatusColor()} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-primary-400" />
          </div>
          <div className="text-left">
            <h4 className="text-white font-semibold">Zone {zone.zone}</h4>
            <p className="text-sm text-gray-400">
              Avg: {zone.avgUpperTemp.toFixed(1)}°C / {zone.avgLowerTemp.toFixed(1)}°C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`badge ${status.color} bg-current/10 border border-current/30`}>
            {status.text}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 border-t border-gray-700/50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Upper Temp</p>
              <p className="text-xl font-bold text-white">{zone.avgUpperTemp.toFixed(1)}°C</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Lower Temp</p>
              <p className="text-xl font-bold text-white">{zone.avgLowerTemp.toFixed(1)}°C</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Max Temp</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                {zone.maxUpperTemp.toFixed(1)}°C
                <TrendingUp className="w-4 h-4 text-red-400" />
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Min Temp</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                {zone.minUpperTemp.toFixed(1)}°C
                <TrendingDown className="w-4 h-4 text-blue-400" />
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Temperature Range</p>
              <p className="text-lg font-bold text-white">{zone.tempRange.toFixed(1)}°C</p>
              <p className="text-xs text-gray-500">Max - Min difference</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Standard Deviation</p>
              <p className="text-lg font-bold text-white flex items-center gap-2">
                {zone.tempVariance.toFixed(2)}°C
                {zone.tempVariance > 10 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
              </p>
              <p className="text-xs text-gray-500">Temperature stability</p>
            </div>
          </div>

          {zone.tempVariance > 10 && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 font-medium">Temperature Instability Detected</p>
                  <p className="text-sm text-yellow-200/70 mt-1">
                    This zone shows high temperature variance. Consider checking heater elements, thermocouples, and blower operation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function ZoneAnalysisPanel() {
  const { zoneAnalysis, processedData } = useStore();
  const [expandedZone, setExpandedZone] = useState(null);

  const toggleZone = (zoneId) => {
    setExpandedZone(expandedZone === zoneId ? null : zoneId);
  };

  // Calculate zone comparison data for chart
  const zoneComparisonData = zoneAnalysis.map(z => ({
    zone: `Z${z.zone}`,
    avgTemp: z.avgUpperTemp,
    variance: z.tempVariance,
  }));

  // Find problem zones
  const problemZones = zoneAnalysis.filter(z => z.tempVariance > 10);
  const stableZones = zoneAnalysis.filter(z => z.tempVariance <= 10);

  return (
    <div className="space-y-6">
      {/* Zone Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Thermometer className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{zoneAnalysis.length}</p>
              <p className="text-sm text-gray-400">Total Zones</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stableZones.length}</p>
              <p className="text-sm text-gray-400">Stable Zones</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{problemZones.length}</p>
              <p className="text-sm text-gray-400">Need Attention</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/20">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {Math.max(...zoneAnalysis.map(z => z.maxUpperTemp)).toFixed(0)}°C
              </p>
              <p className="text-sm text-gray-400">Peak Temperature</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zone Heatmap */}
      <ZoneHeatmap zoneAnalysis={zoneAnalysis} />

      {/* Zone Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Average Temperature by Zone</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="zone" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v}°`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value.toFixed(1)}°C`, 'Avg Temp']}
                  />
                  <Bar dataKey="avgTemp" radius={[4, 4, 0, 0]}>
                    {zoneComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.avgTemp > 200 ? '#ef4444' : entry.avgTemp > 150 ? '#eab308' : '#0ea5e9'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Temperature Variance by Zone</h3>
            <p className="text-sm text-gray-400">Lower is better (more stable)</p>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="zone" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v}°`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value.toFixed(2)}°C`, 'Variance']}
                  />
                  <Bar dataKey="variance" radius={[4, 4, 0, 0]}>
                    {zoneComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.variance > 15 ? '#ef4444' : entry.variance > 10 ? '#eab308' : '#22c55e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Zone List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Zone Details</h3>
          <p className="text-sm text-gray-400">Click to expand for more information</p>
        </div>
        <div className="card-body space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
          {zoneAnalysis.map((zone) => (
            <ZoneDetailCard
              key={zone.zone}
              zone={zone}
              isExpanded={expandedZone === zone.zone}
              onToggle={() => toggleZone(zone.zone)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ZoneAnalysisPanel;
