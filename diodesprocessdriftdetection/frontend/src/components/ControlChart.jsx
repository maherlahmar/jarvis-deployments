import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import useStore from '../store/useStore';
import { formatNumber } from '../utils/formatters';

function ControlChart({ paramKey, height = 300, showLimits = true }) {
  const { parameters, getFilteredReadings } = useStore();
  const readings = getFilteredReadings();
  const config = parameters[paramKey];

  const chartData = useMemo(() => {
    if (!readings.length || !config) return [];

    return readings.map((reading) => ({
      timestamp: reading.timestamp,
      value: reading.parameters?.[paramKey],
      line: reading.line,
      outOfControl: reading.spcResults?.[paramKey]?.outOfControl,
      outOfSpec: reading.spcResults?.[paramKey]?.outOfSpec
    })).filter(d => d.value !== undefined);
  }, [readings, paramKey, config]);

  if (!config || !chartData.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const status = data.outOfSpec ? 'Out of Spec' : data.outOfControl ? 'Out of Control' : 'Normal';
    const statusColor = data.outOfSpec ? 'text-danger-500' : data.outOfControl ? 'text-warning-500' : 'text-success-500';

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          {format(new Date(label), 'MMM d, HH:mm:ss')}
        </p>
        <p className="font-semibold text-slate-900 dark:text-white">
          {formatNumber(data.value, 4)} {config.unit}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Line: {data.line}</p>
        <p className={`text-xs font-medium ${statusColor}`}>{status}</p>
      </div>
    );
  };

  const minValue = Math.min(config.lsl * 0.98, ...chartData.map(d => d.value));
  const maxValue = Math.max(config.usl * 1.02, ...chartData.map(d => d.value));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

          {showLimits && (
            <>
              <ReferenceArea
                y1={config.lsl}
                y2={config.lcl}
                fill="#f59e0b"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y1={config.ucl}
                y2={config.usl}
                fill="#f59e0b"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y1={minValue}
                y2={config.lsl}
                fill="#ef4444"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y1={config.usl}
                y2={maxValue}
                fill="#ef4444"
                fillOpacity={0.1}
              />

              <ReferenceLine
                y={config.usl}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'USL', position: 'right', fill: '#ef4444', fontSize: 10 }}
              />
              <ReferenceLine
                y={config.lsl}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'LSL', position: 'right', fill: '#ef4444', fontSize: 10 }}
              />
              <ReferenceLine
                y={config.ucl}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: 'UCL', position: 'right', fill: '#f59e0b', fontSize: 10 }}
              />
              <ReferenceLine
                y={config.lcl}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: 'LCL', position: 'right', fill: '#f59e0b', fontSize: 10 }}
              />
              <ReferenceLine
                y={config.target}
                stroke="#22c55e"
                strokeWidth={2}
                label={{ value: 'Target', position: 'right', fill: '#22c55e', fontSize: 10 }}
              />
            </>
          )}

          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            domain={[minValue, maxValue]}
            tickFormatter={(v) => formatNumber(v, 1)}
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.outOfSpec) {
                return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#ef4444" />;
              }
              if (payload.outOfControl) {
                return <circle cx={cx} cy={cy} r={3} fill="#f59e0b" stroke="#f59e0b" />;
              }
              return null;
            }}
            activeDot={{ r: 5, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ControlChart;
