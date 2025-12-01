import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Zap, TrendingUp, TrendingDown, Activity, Gauge, Battery, Power } from 'lucide-react';
import useStore from '../store/useStore';
import EnergyGauge from '../components/Charts/EnergyGauge';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)} {entry.name.includes('Power') ? 'kW' : entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EnergyMonitor() {
  const {
    realtimeData,
    hourlyData,
    dashboardSummary,
    isLoading,
    initializeData,
    startRealtimeSimulation,
    stopRealtimeSimulation
  } = useStore();

  const [viewMode, setViewMode] = useState('power');

  useEffect(() => {
    initializeData();
    startRealtimeSimulation();
    return () => stopRealtimeSimulation();
  }, []);

  if (isLoading || !dashboardSummary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Process realtime data for chart
  const chartData = realtimeData.slice(-60).map((d, i) => ({
    time: d.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    activePower: d.energy.activePower,
    reactivePower: d.energy.reactivePower,
    apparentPower: d.energy.apparentPower,
    powerFactor: d.energy.powerFactor * 100,
    current: d.energy.current,
    voltage: d.energy.voltage
  }));

  const latestReading = realtimeData[realtimeData.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Energy Monitor</h1>
          <p className="text-slate-400 mt-1">Real-time power consumption and electrical parameters</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
          {['power', 'current', 'factor'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {mode === 'power' ? 'Power' : mode === 'current' ? 'Current' : 'Power Factor'}
            </button>
          ))}
        </div>
      </div>

      {/* Live metrics */}
      {latestReading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Power className="w-4 h-4 text-primary-400" />
              <span className="text-xs text-slate-400">Active Power</span>
            </div>
            <p className="text-2xl font-bold text-white">{latestReading.energy.activePower.toFixed(1)}</p>
            <span className="text-xs text-slate-500">kW</span>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Reactive Power</span>
            </div>
            <p className="text-2xl font-bold text-white">{latestReading.energy.reactivePower.toFixed(1)}</p>
            <span className="text-xs text-slate-500">kVAR</span>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Apparent Power</span>
            </div>
            <p className="text-2xl font-bold text-white">{latestReading.energy.apparentPower.toFixed(1)}</p>
            <span className="text-xs text-slate-500">kVA</span>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Power Factor</span>
            </div>
            <p className="text-2xl font-bold text-white">{latestReading.energy.powerFactor.toFixed(3)}</p>
            <span className={`text-xs ${latestReading.energy.powerFactor >= 0.92 ? 'text-green-400' : 'text-yellow-400'}`}>
              {latestReading.energy.powerFactor >= 0.92 ? 'Good' : 'Low'}
            </span>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Current</span>
            </div>
            <p className="text-2xl font-bold text-white">{latestReading.energy.current.toFixed(1)}</p>
            <span className="text-xs text-slate-500">A</span>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Voltage</span>
            </div>
            <p className="text-2xl font-bold text-white">{latestReading.energy.voltage.toFixed(0)}</p>
            <span className="text-xs text-slate-500">V (3-phase)</span>
          </div>
        </div>
      )}

      {/* Real-time chart */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Real-time Power Monitoring</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">Live</span>
          </div>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                domain={viewMode === 'factor' ? [80, 100] : ['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {viewMode === 'power' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="activePower"
                    name="Active Power"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="reactivePower"
                    name="Reactive Power"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="apparentPower"
                    name="Apparent Power"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{ value: 'Max', fill: '#ef4444', fontSize: 10 }}
                  />
                </>
              )}

              {viewMode === 'current' && (
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {viewMode === 'factor' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="powerFactor"
                    name="Power Factor"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine
                    y={92}
                    stroke="#22c55e"
                    strokeDasharray="5 5"
                    label={{ value: 'Target 0.92', fill: '#22c55e', fontSize: 10 }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Power gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Power Distribution</h3>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-around">
              {latestReading && (
                <>
                  <EnergyGauge
                    value={latestReading.energy.activePower}
                    max={50}
                    label="Active"
                    unit="kW"
                    color="primary"
                  />
                  <EnergyGauge
                    value={latestReading.energy.reactivePower}
                    max={20}
                    label="Reactive"
                    unit="kVAR"
                    color="warning"
                  />
                  <EnergyGauge
                    value={latestReading.energy.apparentPower}
                    max={55}
                    label="Apparent"
                    unit="kVA"
                    color="cyan"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Cumulative Energy</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-3xl font-bold text-primary-400">
                  {latestReading ? latestReading.energy.cumulative.toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-slate-400 mt-1">kWh Today</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-3xl font-bold text-green-400">
                  ${latestReading ? (latestReading.energy.cumulative * 0.12).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-slate-400 mt-1">Cost Today</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Daily target</span>
                <span className="text-sm text-slate-300">350 kWh</span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className="progress-fill bg-gradient-to-r from-primary-500 to-cyan-500"
                  style={{
                    width: `${Math.min(100, ((latestReading?.energy.cumulative || 0) / 350) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly consumption */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Hourly Energy Consumption</h3>
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
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="consumption"
                name="Consumption"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
