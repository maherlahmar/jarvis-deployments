import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { format } from 'date-fns';
import { Filter, RefreshCw, Download } from 'lucide-react';
import useStore from '../store/useStore';
import ControlChart from '../components/ControlChart';
import { formatNumber, formatTimestamp } from '../utils/formatters';
import clsx from 'clsx';

function ProcessMonitor() {
  const {
    parameters,
    readings,
    selectedParameter,
    setSelectedParameter,
    selectedLine,
    setSelectedLine,
    timeRange,
    setTimeRange,
    lines,
    getFilteredReadings
  } = useStore();

  const [chartType, setChartType] = useState('control');
  const filteredReadings = getFilteredReadings();
  const parameterKeys = Object.keys(parameters);

  const statistics = useMemo(() => {
    const values = filteredReadings
      .map(r => r.parameters?.[selectedParameter])
      .filter(v => v !== undefined);

    if (values.length === 0) return null;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const range = max - min;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
    const stdDev = Math.sqrt(variance);

    const config = parameters[selectedParameter];
    const cp = (config.usl - config.lsl) / (6 * stdDev);
    const cpupper = (config.usl - mean) / (3 * stdDev);
    const cplower = (mean - config.lsl) / (3 * stdDev);
    const cpk = Math.min(cpupper, cplower);

    const outOfControl = values.filter(v => v > config.ucl || v < config.lcl).length;
    const outOfSpec = values.filter(v => v > config.usl || v < config.lsl).length;

    return {
      mean,
      min,
      max,
      range,
      stdDev,
      cp,
      cpk,
      count: values.length,
      outOfControl,
      outOfSpec,
      outOfControlPercent: (outOfControl / values.length * 100).toFixed(1),
      outOfSpecPercent: (outOfSpec / values.length * 100).toFixed(1)
    };
  }, [filteredReadings, selectedParameter, parameters]);

  const histogramData = useMemo(() => {
    const values = filteredReadings
      .map(r => r.parameters?.[selectedParameter])
      .filter(v => v !== undefined);

    if (values.length < 10) return [];

    const config = parameters[selectedParameter];
    const min = Math.min(config.lsl, ...values);
    const max = Math.max(config.usl, ...values);
    const binCount = 20;
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0).map((_, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count: 0,
      label: formatNumber(min + (i + 0.5) * binWidth, 2)
    }));

    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
      if (binIndex >= 0) bins[binIndex].count++;
    });

    return bins;
  }, [filteredReadings, selectedParameter, parameters]);

  const movingRangeData = useMemo(() => {
    const values = filteredReadings.map(r => ({
      timestamp: r.timestamp,
      value: r.parameters?.[selectedParameter]
    })).filter(d => d.value !== undefined);

    if (values.length < 2) return [];

    const mrData = [];
    for (let i = 1; i < values.length; i++) {
      mrData.push({
        timestamp: values[i].timestamp,
        mr: Math.abs(values[i].value - values[i - 1].value)
      });
    }

    return mrData;
  }, [filteredReadings, selectedParameter]);

  const mrBar = useMemo(() => {
    if (movingRangeData.length === 0) return 0;
    return movingRangeData.reduce((sum, d) => sum + d.mr, 0) / movingRangeData.length;
  }, [movingRangeData]);

  const config = parameters[selectedParameter];

  return (
    <div className="space-y-6 animate-in">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Filters:</span>
          </div>

          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            className="select w-48"
          >
            {parameterKeys.map(key => (
              <option key={key} value={key}>{parameters[key]?.name}</option>
            ))}
          </select>

          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="select w-36"
          >
            <option value="all">All Lines</option>
            {['Line A', 'Line B', 'Line C', 'Line D'].map(line => (
              <option key={line} value={line}>{line}</option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select w-32"
          >
            <option value="15m">15 min</option>
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
          </select>

          <div className="flex items-center gap-1 ml-auto">
            {['control', 'histogram', 'mr'].map(type => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  chartType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
              >
                {type === 'control' ? 'Control' : type === 'histogram' ? 'Histogram' : 'Moving Range'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {chartType === 'control' ? 'Control Chart' : chartType === 'histogram' ? 'Distribution Histogram' : 'Moving Range Chart'}
              : {config?.name}
            </h3>
            <p className="text-sm text-slate-500">
              {filteredReadings.length} data points | {selectedLine === 'all' ? 'All lines' : selectedLine}
            </p>
          </div>
          <div className="p-4">
            {chartType === 'control' && (
              <ControlChart paramKey={selectedParameter} height={400} />
            )}

            {chartType === 'histogram' && histogramData.length > 0 && (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="label"
                      type="category"
                      stroke="#6b7280"
                      fontSize={11}
                      allowDuplicatedCategory={false}
                    />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <ZAxis range={[100, 100]} />
                    <ReferenceLine x={formatNumber(config?.lsl, 2)} stroke="#ef4444" strokeDasharray="5 5" />
                    <ReferenceLine x={formatNumber(config?.usl, 2)} stroke="#ef4444" strokeDasharray="5 5" />
                    <ReferenceLine x={formatNumber(config?.target, 2)} stroke="#22c55e" strokeWidth={2} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium">{data.label} {config?.unit}</p>
                            <p className="text-xs text-slate-500">Count: {data.count}</p>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      data={histogramData}
                      fill="#3b82f6"
                      shape={(props) => {
                        const { cx, cy, payload } = props;
                        const height = (payload.count / Math.max(...histogramData.map(d => d.count))) * 300;
                        return (
                          <rect
                            x={cx - 10}
                            y={cy - height}
                            width={20}
                            height={height}
                            fill="#3b82f6"
                            opacity={0.8}
                          />
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {chartType === 'mr' && movingRangeData.length > 0 && (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={movingRangeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
                      stroke="#6b7280"
                      fontSize={11}
                    />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <ReferenceLine y={mrBar} stroke="#22c55e" strokeWidth={2} label={{ value: 'MR-bar', fill: '#22c55e' }} />
                    <ReferenceLine y={mrBar * 3.267} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'UCL', fill: '#ef4444' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500">{format(new Date(data.timestamp), 'HH:mm:ss')}</p>
                            <p className="text-sm font-medium">MR: {formatNumber(data.mr, 4)}</p>
                          </div>
                        );
                      }}
                    />
                    <Line type="monotone" dataKey="mr" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Statistics</h3>
            {statistics ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mean</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatNumber(statistics.mean, 4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Std Dev</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatNumber(statistics.stdDev, 4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Min / Max</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatNumber(statistics.min, 2)} / {formatNumber(statistics.max, 2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Range</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatNumber(statistics.range, 4)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cp</span>
                    <span className={clsx(
                      'font-medium',
                      statistics.cp >= 1.33 ? 'text-success-500' : statistics.cp >= 1.0 ? 'text-warning-500' : 'text-danger-500'
                    )}>
                      {formatNumber(statistics.cp, 3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-500">Cpk</span>
                    <span className={clsx(
                      'font-medium',
                      statistics.cpk >= 1.33 ? 'text-success-500' : statistics.cpk >= 1.0 ? 'text-warning-500' : 'text-danger-500'
                    )}>
                      {formatNumber(statistics.cpk, 3)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Out of Control</span>
                    <span className={clsx(
                      'font-medium',
                      statistics.outOfControl > 0 ? 'text-warning-500' : 'text-success-500'
                    )}>
                      {statistics.outOfControl} ({statistics.outOfControlPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-500">Out of Spec</span>
                    <span className={clsx(
                      'font-medium',
                      statistics.outOfSpec > 0 ? 'text-danger-500' : 'text-success-500'
                    )}>
                      {statistics.outOfSpec} ({statistics.outOfSpecPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No data available</p>
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Limits</h3>
            {config && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Target</span>
                  <span className="font-medium text-success-500">{formatNumber(config.target, 2)} {config.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">UCL / LCL</span>
                  <span className="font-medium text-warning-500">
                    {formatNumber(config.ucl, 2)} / {formatNumber(config.lcl, 2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">USL / LSL</span>
                  <span className="font-medium text-danger-500">
                    {formatNumber(config.usl, 2)} / {formatNumber(config.lsl, 2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessMonitor;
