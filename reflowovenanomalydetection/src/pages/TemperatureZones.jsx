import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Thermometer,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import useStore from '../store/useStore';
import ZoneSelector from '../components/ZoneSelector';

const ZONE_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1',
];

function ZoneCard({ zone, stats, anomalyCount }) {
  const color = ZONE_COLORS[zone - 1];
  const trend = stats?.upper?.std > 5 ? 'volatile' : 'stable';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card hover:border-primary-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Thermometer className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Zone {zone}</h4>
            <p className="text-xs text-dark-400">Temperature Profile</p>
          </div>
        </div>
        {anomalyCount > 0 && (
          <span className="badge-danger">
            <AlertTriangle className="w-3 h-3" />
            {anomalyCount}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-dark-400 mb-1">Upper Temp</p>
          <p className="text-lg font-semibold text-white">
            {stats?.upper?.mean?.toFixed(1) || 0}C
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-400 mb-1">Lower Temp</p>
          <p className="text-lg font-semibold text-white">
            {stats?.lower?.mean?.toFixed(1) || 0}C
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-dark-400">
          Range: {stats?.upper?.min?.toFixed(0) || 0}C - {stats?.upper?.max?.toFixed(0) || 0}C
        </span>
        <div className="flex items-center gap-1">
          {trend === 'volatile' ? (
            <>
              <TrendingUp className="w-3 h-3 text-warning-400" />
              <span className="text-warning-400">Volatile</span>
            </>
          ) : (
            <>
              <Minus className="w-3 h-3 text-success-400" />
              <span className="text-success-400">Stable</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TemperatureZones() {
  const {
    processedData,
    anomalyResults,
    selectedZones,
    getTimeSeriesData,
  } = useStore();
  const [viewType, setViewType] = useState('upper');

  const timeSeriesData = useMemo(() => {
    const data = getTimeSeriesData();
    if (data.length > 300) {
      const step = Math.floor(data.length / 300);
      return data.filter((_, i) => i % step === 0);
    }
    return data;
  }, [processedData, selectedZones]);

  const zoneStats = useMemo(() => {
    if (!anomalyResults?.statistics?.zones) return {};
    const stats = {};
    anomalyResults.statistics.zones.forEach((z) => {
      stats[z.zone] = z;
    });
    return stats;
  }, [anomalyResults]);

  const zoneAnomalyCounts = useMemo(() => {
    if (!anomalyResults?.summary?.byZone) return {};
    return anomalyResults.summary.byZone;
  }, [anomalyResults]);

  if (processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <Thermometer className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Temperature Data
          </h3>
          <p className="text-dark-400">
            Load a data file to view temperature zone analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewType('upper')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewType === 'upper'
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              Upper Temps
            </button>
            <button
              onClick={() => setViewType('lower')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewType === 'lower'
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              Lower Temps
            </button>
            <button
              onClick={() => setViewType('both')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewType === 'both'
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              Both
            </button>
          </div>
        </div>
        <ZoneSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="card-header">
          <Thermometer className="w-5 h-5 text-primary-400" />
          Temperature Trends - {viewType === 'both' ? 'All' : viewType.charAt(0).toUpperCase() + viewType.slice(1)}
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
                label={{
                  value: 'Temperature (C)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#64748b', fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {selectedZones.map((zone) => (
                <Line
                  key={`zone${zone}Upper`}
                  type="monotone"
                  dataKey={`zone${zone}Upper`}
                  name={`Z${zone} ${viewType === 'both' ? 'Upper' : ''}`}
                  stroke={ZONE_COLORS[zone - 1]}
                  strokeWidth={2}
                  dot={false}
                  hide={viewType === 'lower'}
                />
              ))}
              {(viewType === 'lower' || viewType === 'both') &&
                selectedZones.map((zone) => (
                  <Line
                    key={`zone${zone}Lower`}
                    type="monotone"
                    dataKey={`zone${zone}Lower`}
                    name={`Z${zone} ${viewType === 'both' ? 'Lower' : ''}`}
                    stroke={ZONE_COLORS[zone - 1]}
                    strokeWidth={viewType === 'both' ? 1 : 2}
                    strokeDasharray={viewType === 'both' ? '5 5' : undefined}
                    dot={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {selectedZones.map((zone) => (
          <ZoneCard
            key={zone}
            zone={zone}
            stats={zoneStats[zone]}
            anomalyCount={zoneAnomalyCounts[zone] || 0}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="card-header">
          <TrendingUp className="w-5 h-5 text-success-400" />
          Cooling Zone Temperatures
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cool1"
                name="Cool Zone 1"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cool2"
                name="Cool Zone 2"
                stroke="#0891b2"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

export default TemperatureZones;
