import { useState, useEffect, useMemo } from 'react';
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
import { format } from 'date-fns';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import DriftIndicator from '../components/DriftIndicator';
import { formatNumber, formatTimestamp } from '../utils/formatters';
import clsx from 'clsx';

function DriftAnalysis() {
  const { parameters, readings, selectedParameter, setSelectedParameter } = useStore();
  const [driftStatus, setDriftStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('cusum');

  const parameterKeys = Object.keys(parameters);
  const config = parameters[selectedParameter];

  useEffect(() => {
    const fetchDriftStatus = async () => {
      try {
        setLoading(true);
        const response = await api.getDriftStatus();
        if (response.success) {
          setDriftStatus(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch drift status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriftStatus();
    const interval = setInterval(fetchDriftStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const cusumData = useMemo(() => {
    if (!readings.length || !config) return [];

    const values = readings.map(r => r.parameters?.[selectedParameter]).filter(v => v !== undefined);
    const target = config.target;
    const sigma = (config.ucl - config.lcl) / 6;
    const k = 0.5;
    const h = 5.0;

    let cusumPlus = 0;
    let cusumMinus = 0;

    return readings.map((reading, i) => {
      const value = reading.parameters?.[selectedParameter];
      if (value === undefined) return null;

      const z = (value - target) / sigma;
      cusumPlus = Math.max(0, cusumPlus + z - k);
      cusumMinus = Math.max(0, cusumMinus - z - k);

      return {
        timestamp: reading.timestamp,
        value,
        cusumPlus,
        cusumMinus,
        threshold: h
      };
    }).filter(Boolean);
  }, [readings, selectedParameter, config]);

  const ewmaData = useMemo(() => {
    if (!readings.length || !config) return [];

    const lambda = 0.2;
    const L = 3.0;
    const target = config.target;
    const sigma = (config.ucl - config.lcl) / 6;
    const ewmaSigma = sigma * Math.sqrt(lambda / (2 - lambda));

    let ewma = target;

    return readings.map((reading) => {
      const value = reading.parameters?.[selectedParameter];
      if (value === undefined) return null;

      ewma = lambda * value + (1 - lambda) * ewma;

      return {
        timestamp: reading.timestamp,
        value,
        ewma,
        ucl: target + L * ewmaSigma,
        lcl: target - L * ewmaSigma,
        target
      };
    }).filter(Boolean);
  }, [readings, selectedParameter, config]);

  const trendData = useMemo(() => {
    if (!readings.length || !config) return { data: [], regression: null };

    const data = readings.map((reading, i) => ({
      timestamp: reading.timestamp,
      value: reading.parameters?.[selectedParameter],
      index: i
    })).filter(d => d.value !== undefined);

    if (data.length < 10) return { data, regression: null };

    const n = data.length;
    const xMean = data.reduce((sum, d) => sum + d.index, 0) / n;
    const yMean = data.reduce((sum, d) => sum + d.value, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (const d of data) {
      numerator += (d.index - xMean) * (d.value - yMean);
      denominator += Math.pow(d.index - xMean, 2);
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    const dataWithTrend = data.map(d => ({
      ...d,
      trend: intercept + slope * d.index
    }));

    return {
      data: dataWithTrend,
      regression: { slope, intercept }
    };
  }, [readings, selectedParameter, config]);

  const currentDrift = driftStatus?.results?.[selectedParameter];

  const getDriftSummary = () => {
    if (!driftStatus?.results) return { critical: 0, warning: 0, stable: 0 };

    let critical = 0, warning = 0, stable = 0;
    Object.values(driftStatus.results).forEach((result) => {
      if (result.overall === 'critical') critical++;
      else if (result.overall === 'warning') warning++;
      else stable++;
    });

    return { critical, warning, stable };
  };

  const summary = getDriftSummary();

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-danger-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.critical}</p>
              <p className="text-sm text-slate-500">Critical Drift</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-warning-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.warning}</p>
              <p className="text-sm text-slate-500">Warnings</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-success-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.stable}</p>
              <p className="text-sm text-slate-500">Stable</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{parameterKeys.length}</p>
              <p className="text-sm text-slate-500">Parameters Monitored</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Drift Detection Charts: {config?.name}
                  </h3>
                  <p className="text-sm text-slate-500">Advanced drift analysis methods</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {['cusum', 'ewma', 'trend'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedChart(type)}
                        className={clsx(
                          'px-3 py-1.5 text-sm rounded-lg transition-colors',
                          selectedChart === type
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        )}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
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
                </div>
              </div>
            </div>
            <div className="p-4">
              {selectedChart === 'cusum' && cusumData.length > 0 && (
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cusumData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
                        stroke="#6b7280"
                        fontSize={11}
                      />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '+H', fill: '#ef4444' }} />
                      <ReferenceLine y={-5} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '-H', fill: '#ef4444' }} />
                      <ReferenceLine y={0} stroke="#6b7280" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500">{format(new Date(data.timestamp), 'HH:mm:ss')}</p>
                              <p className="text-sm">CUSUM+: <span className="font-medium text-primary-500">{formatNumber(data.cusumPlus, 3)}</span></p>
                              <p className="text-sm">CUSUM-: <span className="font-medium text-warning-500">{formatNumber(data.cusumMinus, 3)}</span></p>
                            </div>
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="cusumPlus" stroke="#3b82f6" strokeWidth={2} dot={false} name="CUSUM+" />
                      <Line type="monotone" dataKey="cusumMinus" stroke="#f59e0b" strokeWidth={2} dot={false} name="CUSUM-" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {selectedChart === 'ewma' && ewmaData.length > 0 && (
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ewmaData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
                        stroke="#6b7280"
                        fontSize={11}
                      />
                      <YAxis stroke="#6b7280" fontSize={11} domain={['auto', 'auto']} />
                      <ReferenceLine y={ewmaData[0]?.ucl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'UCL', fill: '#ef4444' }} />
                      <ReferenceLine y={ewmaData[0]?.lcl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'LCL', fill: '#ef4444' }} />
                      <ReferenceLine y={ewmaData[0]?.target} stroke="#22c55e" strokeWidth={2} label={{ value: 'Target', fill: '#22c55e' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500">{format(new Date(data.timestamp), 'HH:mm:ss')}</p>
                              <p className="text-sm">Value: <span className="font-medium">{formatNumber(data.value, 4)}</span></p>
                              <p className="text-sm">EWMA: <span className="font-medium text-primary-500">{formatNumber(data.ewma, 4)}</span></p>
                            </div>
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#94a3b8" strokeWidth={1} dot={false} opacity={0.5} />
                      <Line type="monotone" dataKey="ewma" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {selectedChart === 'trend' && trendData.data.length > 0 && (
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
                        stroke="#6b7280"
                        fontSize={11}
                      />
                      <YAxis stroke="#6b7280" fontSize={11} domain={['auto', 'auto']} />
                      <ReferenceLine y={config?.target} stroke="#22c55e" strokeDasharray="3 3" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500">{format(new Date(data.timestamp), 'HH:mm:ss')}</p>
                              <p className="text-sm">Value: <span className="font-medium">{formatNumber(data.value, 4)}</span></p>
                              <p className="text-sm">Trend: <span className="font-medium text-warning-500">{formatNumber(data.trend, 4)}</span></p>
                            </div>
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1} dot={false} />
                      <Line type="monotone" dataKey="trend" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Current Status</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <DriftIndicator driftData={currentDrift} parameterConfig={config} />
            )}
          </div>

          {trendData.regression && (
            <div className="card p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Trend Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Slope</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatNumber(trendData.regression.slope, 6)}/reading
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Intercept</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatNumber(trendData.regression.intercept, 4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Direction</span>
                  <span className={clsx(
                    'font-medium',
                    trendData.regression.slope > 0 ? 'text-warning-500' : 'text-primary-500'
                  )}>
                    {trendData.regression.slope > 0 ? 'Increasing' : 'Decreasing'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">All Parameters Drift Status</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {parameterKeys.map(key => {
              const drift = driftStatus?.results?.[key];
              const paramConfig = parameters[key];

              return (
                <div
                  key={key}
                  onClick={() => setSelectedParameter(key)}
                  className={clsx(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    selectedParameter === key ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-700',
                    drift?.overall === 'critical' && 'bg-danger-500/5',
                    drift?.overall === 'warning' && 'bg-warning-500/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{paramConfig?.name}</h4>
                    <span className={clsx(
                      'w-2 h-2 rounded-full',
                      drift?.overall === 'critical' ? 'bg-danger-500' :
                      drift?.overall === 'warning' ? 'bg-warning-500' : 'bg-success-500'
                    )} />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">CUSUM</span>
                      <span className={drift?.cusum?.alarm ? 'text-danger-500' : drift?.cusum?.warning ? 'text-warning-500' : 'text-slate-600 dark:text-slate-400'}>
                        {drift?.cusum?.alarm ? 'Alarm' : drift?.cusum?.warning ? 'Warning' : 'OK'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">EWMA</span>
                      <span className={drift?.ewma?.alarm ? 'text-danger-500' : drift?.ewma?.warning ? 'text-warning-500' : 'text-slate-600 dark:text-slate-400'}>
                        {drift?.ewma?.alarm ? 'Alarm' : drift?.ewma?.warning ? 'Warning' : 'OK'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trend</span>
                      <span className={drift?.trend?.significant ? 'text-warning-500' : 'text-slate-600 dark:text-slate-400'}>
                        {drift?.trend?.significant ? drift?.trend?.direction : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriftAnalysis;
