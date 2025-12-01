import { useMemo } from 'react';
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
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  Zap,
  Activity,
  Radio,
  TrendingUp,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import useStore from '../store/useStore';
import StatCard from '../components/StatCard';

function PowerMetrics() {
  const { processedData, anomalyResults, getElectricalData } = useStore();

  const electricalData = useMemo(() => {
    const data = getElectricalData();
    if (data.length > 300) {
      const step = Math.floor(data.length / 300);
      return data.filter((_, i) => i % step === 0).map((d) => ({
        ...d,
        time: d.timestamp?.toLocaleTimeString() || '',
      }));
    }
    return data.map((d) => ({
      ...d,
      time: d.timestamp?.toLocaleTimeString() || '',
    }));
  }, [processedData]);

  const stats = useMemo(() => {
    if (!anomalyResults?.statistics?.electrical) return null;
    return anomalyResults.statistics.electrical;
  }, [anomalyResults]);

  const powerAnomalies = useMemo(() => {
    if (!anomalyResults?.anomalies) return [];
    return anomalyResults.anomalies.filter(
      (a) =>
        a.type === 'power_anomaly' ||
        a.type === 'power_factor_low' ||
        a.type === 'current_spike' ||
        a.type === 'frequency_deviation'
    );
  }, [anomalyResults]);

  if (processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <Zap className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Power Data
          </h3>
          <p className="text-dark-400">
            Load a data file to view power metrics analysis
          </p>
        </div>
      </div>
    );
  }

  const latestData = processedData[processedData.length - 1]?.electrical;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Power"
          value={latestData?.activePower?.toFixed(2) || 0}
          unit="kW"
          icon={Zap}
          variant="info"
        />
        <StatCard
          title="Current"
          value={latestData?.current?.toFixed(2) || 0}
          unit="A"
          icon={Activity}
        />
        <StatCard
          title="Power Factor"
          value={latestData?.powerFactor?.toFixed(4) || 0}
          icon={Gauge}
          variant={latestData?.powerFactor < 0.85 ? 'warning' : 'success'}
        />
        <StatCard
          title="AC Frequency"
          value={latestData?.acFrequency?.toFixed(1) || 0}
          unit="Hz"
          icon={Radio}
          variant={
            Math.abs((latestData?.acFrequency || 60) - 60) > 0.5
              ? 'warning'
              : 'success'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="card-header">
            <Zap className="w-5 h-5 text-warning-400" />
            Power Consumption Over Time
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={electricalData}>
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
                  label={{
                    value: 'Power (kW)',
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
                <Area
                  type="monotone"
                  dataKey="activePower"
                  name="Active Power (kW)"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="reactivePower"
                  name="Reactive Power (kVAR)"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="card-header">
            <Activity className="w-5 h-5 text-primary-400" />
            Current and Voltage
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={electricalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  label={{
                    value: 'Current (A)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#64748b', fontSize: 12 },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  domain={[475, 485]}
                  label={{
                    value: 'Voltage (V)',
                    angle: 90,
                    position: 'insideRight',
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
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="current"
                  name="Current (A)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="voltage"
                  name="Voltage (V)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="card-header">
            <Gauge className="w-5 h-5 text-success-400" />
            Power Factor Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={electricalData}>
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
                  domain={[0.8, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={0.85}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Min Threshold (0.85)',
                    fill: '#f59e0b',
                    fontSize: 11,
                    position: 'right',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="powerFactor"
                  name="Power Factor"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="card-header">
            <Radio className="w-5 h-5 text-primary-400" />
            AC Frequency Stability
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={electricalData}>
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
                  domain={[59, 61]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={60}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Nominal (60Hz)',
                    fill: '#22c55e',
                    fontSize: 11,
                    position: 'right',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="acFrequency"
                  name="AC Frequency (Hz)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="card-header">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          Cumulative Energy Consumption
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={electricalData}>
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
                label={{
                  value: 'Energy (kWh)',
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
              <Area
                type="monotone"
                dataKey="cumulativeEnergy"
                name="Cumulative Energy (kWh)"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {powerAnomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="card-header">
            <AlertTriangle className="w-5 h-5 text-danger-400" />
            Power-Related Anomalies ({powerAnomalies.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {powerAnomalies.slice(0, 10).map((anomaly, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  anomaly.severity === 'critical'
                    ? 'bg-danger-500/10 border-danger-500/30'
                    : 'bg-warning-500/10 border-warning-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{anomaly.message}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      anomaly.severity === 'critical'
                        ? 'bg-danger-500/20 text-danger-400'
                        : 'bg-warning-500/20 text-warning-400'
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                </div>
                <p className="text-xs text-dark-400 mt-1">
                  {anomaly.timestamp?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="card-header">
          <Activity className="w-5 h-5 text-primary-400" />
          Power Statistics Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-dark-400 mb-1">Avg Active Power</p>
            <p className="text-xl font-semibold text-white">
              {stats?.activePower?.mean?.toFixed(2) || 0} kW
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400 mb-1">Avg Current</p>
            <p className="text-xl font-semibold text-white">
              {stats?.current?.mean?.toFixed(2) || 0} A
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400 mb-1">Avg Power Factor</p>
            <p className="text-xl font-semibold text-white">
              {stats?.powerFactor?.mean?.toFixed(4) || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400 mb-1">Avg Frequency</p>
            <p className="text-xl font-semibold text-white">
              {stats?.frequency?.mean?.toFixed(2) || 0} Hz
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PowerMetrics;
