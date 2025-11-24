import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTime, formatNumber } from '../utils/formatters';
import useProcessStore from '../store/useProcessStore';

const TrendChart = ({ parameters = ['temperature', 'viscosity', 'moisture'] }) => {
  const { historicalData, darkMode } = useProcessStore();

  const colors = {
    temperature: '#ef4444',
    viscosity: '#3b82f6',
    moisture: '#10b981',
    flowRate: '#f59e0b',
    pressure: '#8b5cf6',
    pH: '#ec4899',
    solidsContent: '#06b6d4',
    drierSpeed: '#f97316',
  };

  const chartData = historicalData.map((data) => ({
    ...data,
    time: formatTime(data.timestamp),
  }));

  const gridColor = darkMode ? '#374151' : '#e5e7eb';
  const textColor = darkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className="chart-container">
      <h2 className="text-lg font-semibold mb-4">Process Trends</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="time"
            stroke={textColor}
            style={{ fontSize: '12px' }}
            tick={{ fill: textColor }}
          />
          <YAxis
            stroke={textColor}
            style={{ fontSize: '12px' }}
            tick={{ fill: textColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${gridColor}`,
              borderRadius: '8px',
              color: textColor,
            }}
            formatter={(value) => formatNumber(value, 2)}
          />
          <Legend
            wrapperStyle={{ color: textColor }}
          />

          {parameters.map((param) => (
            <Line
              key={param}
              type="monotone"
              dataKey={param}
              stroke={colors[param] || '#6366f1'}
              strokeWidth={2}
              dot={false}
              name={param.charAt(0).toUpperCase() + param.slice(1)}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {parameters.map((param) => (
          <div key={param} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[param] }}
            />
            <span className="capitalize">{param}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;
