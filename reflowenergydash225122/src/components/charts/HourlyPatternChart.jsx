import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

function CustomTooltip({ active, payload, label }) {
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
            {entry.value.toFixed(1)}{entry.name.includes('Idle') ? '%' : ' kW'}
          </span>
        </div>
      ))}
    </div>
  );
}

function HourlyPatternChart({ data, title = 'Hourly Energy Pattern' }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const peakHour = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, d) => d.avgPower > max.avgPower ? d : max, chartData[0]);
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
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card"
    >
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {peakHour && (
            <p className="text-sm text-gray-400">
              Peak usage at {peakHour.hourLabel} ({peakHour.avgPower.toFixed(1)} kW)
            </p>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="hourLabel"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} kW`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="left"
                dataKey="avgPower"
                name="Avg Power"
                fill="#0ea5e9"
                fillOpacity={0.6}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="idlePercentage"
                name="Idle %"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

export default HourlyPatternChart;
