import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

function CustomTooltip({ active, payload, label, showDaily }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-medium">
            {entry.value.toFixed(2)} {showDaily ? 'kWh' : (entry.name.includes('Power') ? 'kW' : '')}
          </span>
        </div>
      ))}
    </div>
  );
}

function EnergyChart({ data, title = 'Last 7 Days Energy Consumption', showDaily = false }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="card-body h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // For daily view, show bar chart with energy consumption
  if (showDaily) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-gray-400">Energy (kWh)</span>
          </div>
        </div>
        <div className="card-body">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} kWh`}
                />
                <Tooltip content={<CustomTooltip showDaily />} />
                <Bar
                  dataKey="energyConsumed"
                  name="Energy"
                  fill="url(#colorEnergy)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  }

  // Original hourly power view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-gray-400">Avg Power</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400">Max Power</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvgPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMaxPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const parts = value.split(' ');
                  return parts[1] || value;
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} kW`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgPower"
                name="Avg Power"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#colorAvgPower)"
              />
              <Area
                type="monotone"
                dataKey="maxPower"
                name="Max Power"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorMaxPower)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

export default EnergyChart;
