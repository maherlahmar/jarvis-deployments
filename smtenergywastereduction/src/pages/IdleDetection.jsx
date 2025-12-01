import { useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Clock, Zap, DollarSign, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import useStore from '../store/useStore';

export default function IdleDetection() {
  const {
    realtimeData,
    hourlyData,
    dashboardSummary,
    isLoading,
    initializeData,
    startRealtimeSimulation,
    stopRealtimeSimulation
  } = useStore();

  useEffect(() => {
    initializeData();
    startRealtimeSimulation();
    return () => stopRealtimeSimulation();
  }, []);

  // Calculate idle periods from hourly data
  const idleAnalysis = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return null;

    const periods = hourlyData.map((h, i) => {
      const isIdle = h.production === 0 || h.efficiency === 0;
      const idlePower = isIdle ? h.consumption * 0.5 : 0; // Assume 50% of power during idle is waste
      return {
        ...h,
        isIdle,
        idlePower,
        wastedEnergy: idlePower,
        status: isIdle ? 'Idle' : 'Active'
      };
    });

    const totalIdleHours = periods.filter(p => p.isIdle).length;
    const totalIdleEnergy = periods.reduce((sum, p) => sum + p.wastedEnergy, 0);
    const productiveHours = periods.filter(p => !p.isIdle).length;

    return {
      periods,
      totalIdleHours,
      totalIdleEnergy,
      productiveHours,
      utilizationRate: ((productiveHours / periods.length) * 100).toFixed(1),
      potentialSavings: (totalIdleEnergy * 0.12).toFixed(2)
    };
  }, [hourlyData]);

  if (isLoading || !idleAnalysis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const utilizationData = [
    { name: 'Active', value: idleAnalysis.productiveHours, color: '#22c55e' },
    { name: 'Idle', value: idleAnalysis.totalIdleHours, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Idle Time Detection</h1>
        <p className="text-slate-400 mt-1">Identify and reduce non-productive energy consumption</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm text-slate-400">Idle Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{idleAnalysis.totalIdleHours}h</p>
          <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-slate-400">Wasted Energy</span>
          </div>
          <p className="text-3xl font-bold text-white">{idleAnalysis.totalIdleEnergy.toFixed(1)} kWh</p>
          <p className="text-xs text-slate-500 mt-1">During idle periods</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">Potential Savings</span>
          </div>
          <p className="text-3xl font-bold text-white">${idleAnalysis.potentialSavings}</p>
          <p className="text-xs text-slate-500 mt-1">Daily recoverable</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <TrendingDown className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm text-slate-400">Utilization Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{idleAnalysis.utilizationRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Equipment utilization</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly activity */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Hourly Activity Status</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={idleAnalysis.periods} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="hourLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={1}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => [
                    `${value.toFixed(1)} kWh`,
                    name === 'consumption' ? 'Total' : 'Wasted'
                  ]}
                />
                <Bar dataKey="consumption" name="consumption" radius={[4, 4, 0, 0]}>
                  {idleAnalysis.periods.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isIdle ? '#ef4444' : '#22c55e'}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-slate-400">Active (Producing)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-slate-400">Idle (Not Producing)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Utilization pie chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Time Utilization</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {utilizationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value) => [`${value} hours`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              {utilizationData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-slate-400">
                    {entry.name}: {entry.value}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Idle periods table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Hourly Breakdown</h3>
        </div>
        <div className="card-body overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Production</th>
                <th className="px-4 py-3">Consumption</th>
                <th className="px-4 py-3">Wasted Energy</th>
                <th className="px-4 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {idleAnalysis.periods.slice(0, 12).map((period, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell font-medium text-white">{period.hourLabel}</td>
                  <td className="table-cell">
                    {period.isIdle ? (
                      <span className="badge badge-danger">
                        <AlertCircle size={12} className="mr-1" /> Idle
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <CheckCircle size={12} className="mr-1" /> Active
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-slate-300">{period.production} units</td>
                  <td className="table-cell text-slate-300">{period.consumption.toFixed(1)} kWh</td>
                  <td className="table-cell">
                    {period.wastedEnergy > 0 ? (
                      <span className="text-red-400">{period.wastedEnergy.toFixed(1)} kWh</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 progress-bar h-2 max-w-[80px]">
                        <div
                          className={`progress-fill ${
                            period.efficiency >= 90 ? 'bg-green-500' :
                            period.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${period.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300">{period.efficiency.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Idle Time Reduction Strategies</h3>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Automatic Standby Mode</h4>
            <p className="text-sm text-slate-400 mb-3">
              Configure equipment to enter deep standby after 10 minutes of inactivity.
              Reduces idle power from 18kW to 5kW.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Est. savings: $35/day</span>
              <span className="badge badge-success">High Impact</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Production Scheduling</h4>
            <p className="text-sm text-slate-400 mb-3">
              Optimize production batches to minimize warm-up cycles.
              Group similar products to reduce changeover time.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Est. savings: $20/day</span>
              <span className="badge badge-warning">Medium Impact</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Break Time Optimization</h4>
            <p className="text-sm text-slate-400 mb-3">
              Coordinate breaks with natural production pauses.
              Use thermal inertia to reduce warm-up energy after breaks.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Est. savings: $15/day</span>
              <span className="badge badge-info">Low Impact</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Predictive Maintenance</h4>
            <p className="text-sm text-slate-400 mb-3">
              Schedule maintenance during planned downtime.
              Reduce unplanned idle time due to equipment issues.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Est. savings: $25/day</span>
              <span className="badge badge-warning">Medium Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
