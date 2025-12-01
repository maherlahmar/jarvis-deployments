import { useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { Gauge, Zap, AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import useStore from '../store/useStore';
import EnergyGauge from '../components/Charts/EnergyGauge';

export default function PowerFactor() {
  const {
    realtimeData,
    hourlyData,
    isLoading,
    initializeData,
    startRealtimeSimulation,
    stopRealtimeSimulation,
    getLatestReading
  } = useStore();

  useEffect(() => {
    initializeData();
    startRealtimeSimulation();
    return () => stopRealtimeSimulation();
  }, []);

  const latestReading = getLatestReading();

  if (isLoading || !latestReading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate power factor statistics
  const pfData = realtimeData.slice(-60).map(d => ({
    time: d.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    powerFactor: d.energy.powerFactor * 100,
    activePower: d.energy.activePower,
    reactivePower: d.energy.reactivePower,
    apparentPower: d.energy.apparentPower
  }));

  const avgPf = pfData.reduce((sum, d) => sum + d.powerFactor, 0) / pfData.length;
  const minPf = Math.min(...pfData.map(d => d.powerFactor));
  const maxPf = Math.max(...pfData.map(d => d.powerFactor));
  const lowPfCount = pfData.filter(d => d.powerFactor < 92).length;

  const currentPf = latestReading.energy.powerFactor;
  const pfStatus = currentPf >= 0.95 ? 'excellent' : currentPf >= 0.92 ? 'good' : currentPf >= 0.85 ? 'warning' : 'poor';

  // Calculate reactive power compensation needed
  const targetPf = 0.95;
  const currentReactive = latestReading.energy.reactivePower;
  const activePower = latestReading.energy.activePower;
  const targetReactive = activePower * Math.tan(Math.acos(targetPf));
  const compensationNeeded = Math.max(0, currentReactive - targetReactive);

  // Potential savings calculation
  const demandChargeRate = 12; // $/kVA
  const currentApparent = latestReading.energy.apparentPower;
  const targetApparent = activePower / targetPf;
  const demandReduction = currentApparent - targetApparent;
  const monthlySavings = demandReduction * demandChargeRate;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Power Factor Analysis</h1>
        <p className="text-slate-400 mt-1">Monitor and optimize power factor for reduced energy costs</p>
      </div>

      {/* Main gauge and stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large PF gauge */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm text-slate-400 mb-4">Current Power Factor</h3>
          <EnergyGauge
            value={currentPf * 100}
            max={100}
            label=""
            unit="%"
            color={pfStatus === 'excellent' || pfStatus === 'good' ? 'success' : pfStatus === 'warning' ? 'warning' : 'danger'}
            size="lg"
          />
          <div className="mt-4 text-center">
            <span className={`badge ${
              pfStatus === 'excellent' ? 'badge-success' :
              pfStatus === 'good' ? 'badge-success' :
              pfStatus === 'warning' ? 'badge-warning' : 'badge-danger'
            }`}>
              {pfStatus === 'excellent' ? (
                <><CheckCircle size={12} className="mr-1" /> Excellent</>
              ) : pfStatus === 'good' ? (
                <><CheckCircle size={12} className="mr-1" /> Good</>
              ) : (
                <><AlertTriangle size={12} className="mr-1" /> {pfStatus}</>
              )}
            </span>
            <p className="text-xs text-slate-500 mt-2">Target: 0.95 (95%)</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Average PF</span>
            </div>
            <p className="text-2xl font-bold text-white">{(avgPf / 100).toFixed(3)}</p>
            <p className="text-xs text-slate-500">Last hour</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Peak PF</span>
            </div>
            <p className="text-2xl font-bold text-white">{(maxPf / 100).toFixed(3)}</p>
            <p className="text-xs text-slate-500">Maximum</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Low PF Events</span>
            </div>
            <p className="text-2xl font-bold text-white">{lowPfCount}</p>
            <p className="text-xs text-slate-500">Below 0.92</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Monthly Savings</span>
            </div>
            <p className="text-2xl font-bold text-green-400">${monthlySavings.toFixed(0)}</p>
            <p className="text-xs text-slate-500">If corrected to 0.95</p>
          </div>
        </div>
      </div>

      {/* Power triangle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Power Triangle</h3>
          </div>
          <div className="card-body">
            <div className="relative h-64 flex items-center justify-center">
              <svg width="300" height="200" viewBox="0 0 300 200">
                {/* Triangle */}
                <line x1="50" y1="150" x2="250" y2="150" stroke="#3b82f6" strokeWidth="3" />
                <line x1="250" y1="150" x2="250" y2="50" stroke="#a855f7" strokeWidth="3" />
                <line x1="50" y1="150" x2="250" y2="50" stroke="#eab308" strokeWidth="3" />

                {/* Labels */}
                <text x="150" y="175" textAnchor="middle" fill="#94a3b8" fontSize="12">
                  Active Power: {activePower.toFixed(1)} kW
                </text>
                <text x="270" y="100" fill="#94a3b8" fontSize="12" transform="rotate(90, 270, 100)">
                  Reactive: {currentReactive.toFixed(1)} kVAR
                </text>
                <text x="120" y="90" fill="#94a3b8" fontSize="12" transform="rotate(-30, 120, 90)">
                  Apparent: {latestReading.energy.apparentPower.toFixed(1)} kVA
                </text>

                {/* Angle arc */}
                <path
                  d="M 80 150 A 30 30 0 0 0 100 135"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
                <text x="95" y="145" fill="#06b6d4" fontSize="11">
                  φ={Math.acos(currentPf).toFixed(2)}rad
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <p className="text-lg font-bold text-blue-400">{activePower.toFixed(1)}</p>
                <p className="text-xs text-slate-400">Active (kW)</p>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                <p className="text-lg font-bold text-purple-400">{currentReactive.toFixed(1)}</p>
                <p className="text-xs text-slate-400">Reactive (kVAR)</p>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <p className="text-lg font-bold text-yellow-400">{latestReading.energy.apparentPower.toFixed(1)}</p>
                <p className="text-xs text-slate-400">Apparent (kVA)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compensation calculator */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Power Factor Correction</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Current Power Factor</span>
                <span className="text-lg font-bold text-white">{currentPf.toFixed(3)}</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${currentPf >= 0.92 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${currentPf * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Target Power Factor</span>
                <span className="text-lg font-bold text-green-400">0.950</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-green-500" style={{ width: '95%' }} />
              </div>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Capacitor Bank Required</h4>
              <p className="text-3xl font-bold text-cyan-400">{compensationNeeded.toFixed(1)} kVAR</p>
              <p className="text-xs text-slate-400 mt-1">
                To improve power factor from {currentPf.toFixed(2)} to 0.95
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-sm text-slate-400">Demand Reduction</p>
                <p className="text-xl font-bold text-white">{demandReduction.toFixed(1)} kVA</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-sm text-slate-400">Monthly Savings</p>
                <p className="text-xl font-bold text-green-400">${monthlySavings.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time chart */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Power Factor Trend</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">Live</span>
          </div>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pfData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                domain={[80, 100]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [`${(value / 100).toFixed(3)}`, 'Power Factor']}
              />
              <ReferenceLine
                y={92}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: 'Target 0.92', fill: '#22c55e', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={85}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'Min 0.85', fill: '#ef4444', fontSize: 10, position: 'right' }}
              />
              <Area
                type="monotone"
                dataKey="powerFactor"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPf)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly power factor */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Hourly Power Factor (24h)</h3>
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
                domain={[0.8, 1]}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [value.toFixed(3), 'Power Factor']}
              />
              <ReferenceLine y={0.92} stroke="#22c55e" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="powerFactor"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 3, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
