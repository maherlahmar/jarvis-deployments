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
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Thermometer,
  Zap,
  AlertTriangle,
  Activity,
  Wind,
  Clock,
  Database,
  TrendingUp,
} from 'lucide-react';
import useStore from '../store/useStore';
import StatCard from '../components/StatCard';

const ZONE_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1',
];

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-6">
        <Database className="w-10 h-10 text-dark-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Data Loaded</h3>
      <p className="text-dark-400 max-w-md mb-6">
        Upload a CSV file containing reflow oven sensor data to start analyzing
        anomalies and monitoring equipment behavior.
      </p>
      <div className="text-sm text-dark-500">
        Click the "Load Data" button in the sidebar to get started
      </div>
    </div>
  );
}

function Dashboard() {
  const {
    processedData,
    anomalyResults,
    dataSummary,
    selectedZones,
    getTimeSeriesData,
  } = useStore();

  const timeSeriesData = useMemo(() => {
    const data = getTimeSeriesData();
    if (data.length > 200) {
      const step = Math.floor(data.length / 200);
      return data.filter((_, i) => i % step === 0);
    }
    return data;
  }, [processedData, selectedZones]);

  const stats = useMemo(() => {
    if (!anomalyResults?.statistics) return null;
    return anomalyResults.statistics;
  }, [anomalyResults]);

  if (processedData.length === 0) {
    return <EmptyState />;
  }

  const latestData = processedData[processedData.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Anomalies"
          value={anomalyResults?.summary?.total || 0}
          icon={AlertTriangle}
          variant={
            anomalyResults?.summary?.critical > 0
              ? 'danger'
              : anomalyResults?.summary?.warning > 0
              ? 'warning'
              : 'success'
          }
        />
        <StatCard
          title="Critical Issues"
          value={anomalyResults?.summary?.critical || 0}
          icon={AlertTriangle}
          variant={anomalyResults?.summary?.critical > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Active Power"
          value={latestData?.electrical?.activePower?.toFixed(1) || 0}
          unit="kW"
          icon={Zap}
          variant="info"
        />
        <StatCard
          title="Power Factor"
          value={latestData?.electrical?.powerFactor?.toFixed(3) || 0}
          icon={Activity}
          variant={
            latestData?.electrical?.powerFactor < 0.85 ? 'warning' : 'success'
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="O2 Concentration"
          value={latestData?.atmosphere?.o2Concentration?.toFixed(1) || 0}
          unit="ppm"
          icon={Wind}
        />
        <StatCard
          title="Flow Rate"
          value={latestData?.atmosphere?.flowRate?.toFixed(2) || 0}
          unit="L/min"
          icon={TrendingUp}
        />
        <StatCard
          title="Data Points"
          value={processedData.length}
          icon={Database}
        />
        <StatCard
          title="Duration"
          value={dataSummary?.timeRange?.durationMinutes || 0}
          unit="min"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="card-header">
            <Thermometer className="w-5 h-5 text-primary-400" />
            Temperature Zones Overview
          </h3>
          <div className="h-72">
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
                {selectedZones.slice(0, 5).map((zone, index) => (
                  <Line
                    key={`zone${zone}`}
                    type="monotone"
                    dataKey={`zone${zone}Upper`}
                    name={`Zone ${zone}`}
                    stroke={ZONE_COLORS[zone - 1]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="card-header">
            <Zap className="w-5 h-5 text-warning-400" />
            Power Consumption
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
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
                  dataKey="power"
                  name="Active Power (kW)"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="card-header">
            <Wind className="w-5 h-5 text-success-400" />
            Atmosphere Monitoring
          </h3>
          <div className="h-72">
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
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
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
                  dataKey="o2"
                  name="O2 (ppm)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="flowRate"
                  name="Flow (L/min)"
                  stroke="#06b6d4"
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
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="card-header">
            <AlertTriangle className="w-5 h-5 text-danger-400" />
            Anomalies by Zone
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(anomalyResults?.summary?.byZone || {}).map(
                  ([zone, count]) => ({
                    zone: `Zone ${zone}`,
                    count,
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="zone"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Anomalies"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="card-header">
          <Activity className="w-5 h-5 text-primary-400" />
          Zone Temperature Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-dark-400 font-medium">Zone</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Mean Upper</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Mean Lower</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Min</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Max</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Std Dev</th>
              </tr>
            </thead>
            <tbody>
              {stats?.zones?.map((zone) => (
                <tr
                  key={zone.zone}
                  className="border-b border-dark-800 hover:bg-dark-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ZONE_COLORS[zone.zone - 1] }}
                      />
                      <span className="text-white font-medium">Zone {zone.zone}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-dark-200">
                    {zone.upper.mean.toFixed(1)}C
                  </td>
                  <td className="text-right py-3 px-4 text-dark-200">
                    {zone.lower.mean.toFixed(1)}C
                  </td>
                  <td className="text-right py-3 px-4 text-dark-300">
                    {zone.upper.min.toFixed(1)}C
                  </td>
                  <td className="text-right py-3 px-4 text-dark-300">
                    {zone.upper.max.toFixed(1)}C
                  </td>
                  <td className="text-right py-3 px-4 text-dark-300">
                    {zone.upper.std.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
