import { useEffect, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Thermometer, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import useStore from '../store/useStore';
import ZoneHeatmap from '../components/Charts/ZoneHeatmap';

export default function ZoneAnalysis() {
  const {
    realtimeData,
    zoneEfficiency,
    isLoading,
    initializeData,
    startRealtimeSimulation,
    stopRealtimeSimulation,
    getLatestReading,
    selectedZone,
    setSelectedZone
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

  // Process zone data for charts
  const zoneData = Object.entries(latestReading.zones).map(([id, zone]) => ({
    id,
    name: id.replace('zone', 'Zone '),
    num: parseInt(id.replace('zone', '')),
    ...zone
  })).sort((a, b) => a.num - b.num);

  const radarData = zoneData.map(z => ({
    zone: z.name,
    temperature: z.avgTemp,
    target: z.num <= 3 ? 150 : z.num <= 6 ? 180 : z.num <= 8 ? 230 : 180,
    delta: z.delta
  }));

  const deviationData = zoneData.map(z => {
    const target = z.num <= 3 ? 150 : z.num <= 6 ? 180 : z.num <= 8 ? 230 : 180;
    return {
      zone: z.name,
      deviation: z.avgTemp - target,
      isOverheat: z.avgTemp > target
    };
  });

  const getZoneStatus = (zone) => {
    if (zone.delta > 10) return { status: 'warning', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (zone.delta > 15) return { status: 'critical', color: 'text-red-400', bg: 'bg-red-500/10' };
    return { status: 'optimal', color: 'text-green-400', bg: 'bg-green-500/10' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Zone Analysis</h1>
        <p className="text-slate-400 mt-1">Temperature profile and zone efficiency monitoring</p>
      </div>

      {/* Zone heatmap */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Reflow Oven Profile</h3>
        </div>
        <div className="card-body">
          <ZoneHeatmap zones={latestReading.zones} onZoneClick={setSelectedZone} />
        </div>
      </div>

      {/* Zone details grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {zoneData.map((zone) => {
          const status = getZoneStatus(zone);
          const zoneType = zone.num <= 3 ? 'Preheat' : zone.num <= 6 ? 'Soak' : zone.num <= 8 ? 'Reflow' : 'Cooling';

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`card p-4 cursor-pointer transition-all hover:scale-105 ${
                selectedZone?.id === zone.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{zoneType}</span>
                <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`} />
              </div>
              <p className="text-lg font-bold text-white">{zone.name}</p>
              <p className="text-2xl font-bold text-primary-400 mt-1">{zone.avgTemp.toFixed(0)}°C</p>
              <div className="mt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Upper:</span>
                  <span className="text-slate-300">{zone.upper.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Lower:</span>
                  <span className="text-slate-300">{zone.lower.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Delta:</span>
                  <span className={status.color}>{zone.delta.toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Temperature Profile Radar</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 300]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Temperature"
                  dataKey="temperature"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deviation chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Temperature Deviation from Target</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviationData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} domain={[-20, 20]} />
                <YAxis dataKey="zone" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="deviation" name="Deviation (°C)">
                  {deviationData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isOverheat ? '#ef4444' : '#22c55e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone efficiency table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Zone Efficiency Analysis</h3>
        </div>
        <div className="card-body overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Current Temp</th>
                <th className="px-4 py-3">Target Temp</th>
                <th className="px-4 py-3">Deviation</th>
                <th className="px-4 py-3">Upper/Lower Delta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Energy Impact</th>
              </tr>
            </thead>
            <tbody>
              {zoneData.map((zone) => {
                const target = zone.num <= 3 ? 150 : zone.num <= 6 ? 180 : zone.num <= 8 ? 230 : 180;
                const deviation = zone.avgTemp - target;
                const status = getZoneStatus(zone);
                const zoneType = zone.num <= 3 ? 'Preheat' : zone.num <= 6 ? 'Soak' : zone.num <= 8 ? 'Reflow' : 'Cooling';

                return (
                  <tr key={zone.id} className="table-row">
                    <td className="table-cell font-medium text-white">{zone.name}</td>
                    <td className="table-cell">
                      <span className="badge badge-info">{zoneType}</span>
                    </td>
                    <td className="table-cell text-white font-medium">{zone.avgTemp.toFixed(1)}°C</td>
                    <td className="table-cell text-slate-400">{target}°C</td>
                    <td className="table-cell">
                      <span className={`flex items-center gap-1 ${deviation > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {deviation > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={status.color}>{zone.delta.toFixed(1)}°C</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${status.status === 'optimal' ? 'badge-success' : status.status === 'warning' ? 'badge-warning' : 'badge-danger'}`}>
                        {status.status === 'optimal' ? (
                          <><CheckCircle size={12} className="mr-1" /> Optimal</>
                        ) : (
                          <><AlertTriangle size={12} className="mr-1" /> {status.status}</>
                        )}
                      </span>
                    </td>
                    <td className="table-cell">
                      {Math.abs(deviation) > 10 || zone.delta > 10 ? (
                        <span className="text-yellow-400">+{(Math.abs(deviation) * 0.02 + zone.delta * 0.01).toFixed(1)}% waste</span>
                      ) : (
                        <span className="text-green-400">Minimal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cooling zones */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Cooling System</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-400">Cooling Zone 1</span>
              </div>
              <p className="text-3xl font-bold text-white">{latestReading.cooling.cool1.toFixed(1)}°C</p>
              <p className="text-xs text-slate-400 mt-1">Target: 40-60°C</p>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-slate-400">Cooling Zone 2</span>
              </div>
              <p className="text-3xl font-bold text-white">{latestReading.cooling.cool2.toFixed(1)}°C</p>
              <p className="text-xs text-slate-400 mt-1">Target: 35-50°C</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
