import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
      <p className="text-gray-400 text-sm mb-2">{format(parseISO(label), 'EEEE, MMM d, yyyy')}</p>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Energy:</span>
          <span className="text-white font-medium">{data.energyConsumed.toFixed(1)} kWh</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Avg Power:</span>
          <span className="text-white font-medium">{data.avgPower.toFixed(1)} kW</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Idle Time:</span>
          <span className={`font-medium ${data.idlePercentage > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
            {data.idlePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Cost:</span>
          <span className="text-white font-medium">${data.cost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function DailyEnergyChart({ data, title = 'Daily Energy Consumption' }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-14); // Last 14 days
  }, [data]);

  const avgEnergy = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((acc, d) => acc + d.energyConsumed, 0) / chartData.length;
  }, [chartData]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card"
    >
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">
            Average: {avgEnergy.toFixed(1)} kWh/day
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary-500" />
            <span className="text-gray-400">Below Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-400">Above Avg</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => format(parseISO(value), 'MMM d')}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} kWh`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="energyConsumed" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.energyConsumed > avgEnergy ? '#eab308' : '#0ea5e9'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

export default DailyEnergyChart;
