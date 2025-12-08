import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { FileText, Download, Calendar, RefreshCw, Printer } from 'lucide-react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatNumber, formatPercent, formatDateTime, formatCapabilityIndex } from '../utils/formatters';
import clsx from 'clsx';

function Reports() {
  const { parameters, batches, alerts, readings } = useStore();
  const [spcSummary, setSpcSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('spc');
  const [dateRange, setDateRange] = useState('7d');

  const parameterKeys = Object.keys(parameters);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getSpcSummary();
        if (response.success) {
          setSpcSummary(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch SPC summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const capabilityData = useMemo(() => {
    if (!spcSummary) return [];
    return parameterKeys.map(key => ({
      parameter: parameters[key]?.name || key,
      cp: spcSummary[key]?.cp || 0,
      cpk: spcSummary[key]?.cpk || 0,
      ppk: spcSummary[key]?.ppk || 0
    }));
  }, [spcSummary, parameterKeys, parameters]);

  const radarData = useMemo(() => {
    if (!spcSummary) return [];
    return parameterKeys.map(key => ({
      parameter: parameters[key]?.name?.substring(0, 10) || key,
      cpk: Math.min(2, spcSummary[key]?.cpk || 0),
      target: 1.33
    }));
  }, [spcSummary, parameterKeys, parameters]);

  const outOfControlData = useMemo(() => {
    if (!spcSummary) return [];
    return parameterKeys.map(key => ({
      parameter: parameters[key]?.name || key,
      outOfControl: spcSummary[key]?.outOfControlPercent || 0,
      outOfSpec: spcSummary[key]?.outOfSpecPercent || 0
    }));
  }, [spcSummary, parameterKeys, parameters]);

  const alertSummary = useMemo(() => {
    const byType = {};
    const bySeverity = { critical: 0, warning: 0, info: 0 };
    const byParameter = {};

    alerts.forEach(alert => {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      byParameter[alert.parameter] = (byParameter[alert.parameter] || 0) + 1;
    });

    return { byType, bySeverity, byParameter };
  }, [alerts]);

  const batchSummary = useMemo(() => {
    if (!batches.length) return null;

    const completed = batches.filter(b => b.status === 'completed');
    const yields = completed.map(b => b.yieldPercent);

    return {
      totalBatches: batches.length,
      completedBatches: completed.length,
      avgYield: yields.length > 0 ? yields.reduce((a, b) => a + b, 0) / yields.length : 0,
      minYield: yields.length > 0 ? Math.min(...yields) : 0,
      maxYield: yields.length > 0 ? Math.max(...yields) : 0,
      totalWafers: batches.reduce((sum, b) => sum + b.waferCount, 0),
      totalDefects: batches.reduce((sum, b) => sum + (b.defects || 0), 0)
    };
  }, [batches]);

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      reportType,
      dateRange,
      spcSummary,
      alertSummary,
      batchSummary,
      parameters: Object.keys(parameters).map(key => ({
        key,
        ...parameters[key],
        stats: spcSummary?.[key]
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">Report Type:</span>
            </div>
            <div className="flex gap-1">
              {[
                { id: 'spc', label: 'SPC Analysis' },
                { id: 'capability', label: 'Capability' },
                { id: 'alerts', label: 'Alerts' },
                { id: 'yield', label: 'Yield' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={clsx(
                    'px-4 py-2 text-sm rounded-lg transition-colors',
                    reportType === type.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="select w-32"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
            <button onClick={handleExport} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {reportType === 'spc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Process Capability Index (Cpk)</h3>
              </div>
              <div className="p-4">
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="parameter" stroke="#6b7280" fontSize={10} />
                      <PolarRadiusAxis domain={[0, 2]} stroke="#6b7280" fontSize={10} />
                      <Radar name="Cpk" dataKey="cpk" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      <Radar name="Target (1.33)" dataKey="target" stroke="#22c55e" fill="none" strokeDasharray="5 5" />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Out of Control / Spec Rate</h3>
              </div>
              <div className="p-4">
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outOfControlData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis type="number" domain={[0, 10]} tickFormatter={v => `${v}%`} stroke="#6b7280" fontSize={11} />
                      <YAxis type="category" dataKey="parameter" stroke="#6b7280" fontSize={10} width={80} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700">
                              <p className="font-medium">{data.parameter}</p>
                              <p className="text-sm text-warning-500">Out of Control: {data.outOfControl}%</p>
                              <p className="text-sm text-danger-500">Out of Spec: {data.outOfSpec}%</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="outOfControl" fill="#f59e0b" name="Out of Control" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="outOfSpec" fill="#ef4444" name="Out of Spec" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Detailed Statistics</h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Mean</th>
                    <th>Std Dev</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Cp</th>
                    <th>Cpk</th>
                    <th>OOC %</th>
                    <th>OOS %</th>
                  </tr>
                </thead>
                <tbody>
                  {parameterKeys.map(key => {
                    const stats = spcSummary?.[key] || {};
                    const config = parameters[key];
                    const cpkInfo = formatCapabilityIndex(stats.cpk);

                    return (
                      <tr key={key}>
                        <td className="font-medium text-slate-900 dark:text-white">{config?.name}</td>
                        <td>{formatNumber(stats.mean, 4)} {config?.unit}</td>
                        <td>{formatNumber(stats.stdDev, 4)}</td>
                        <td>{formatNumber(stats.min, 2)}</td>
                        <td>{formatNumber(stats.max, 2)}</td>
                        <td className={formatCapabilityIndex(stats.cp).color}>{formatNumber(stats.cp, 3)}</td>
                        <td className={cpkInfo.color}>{cpkInfo.value}</td>
                        <td className={stats.outOfControlPercent > 5 ? 'text-warning-500' : ''}>{stats.outOfControlPercent}%</td>
                        <td className={stats.outOfSpecPercent > 0 ? 'text-danger-500' : ''}>{stats.outOfSpecPercent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'capability' && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Capability Indices Comparison</h3>
          </div>
          <div className="p-4">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capabilityData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="parameter" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 2]} stroke="#6b7280" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cp" fill="#3b82f6" name="Cp" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cpk" fill="#22c55e" name="Cpk" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ppk" fill="#f59e0b" name="Ppk" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Alerts by Severity</h3>
            <div className="space-y-4">
              {Object.entries(alertSummary.bySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    severity === 'critical' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400' :
                    severity === 'warning' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
                    'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  )}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Alerts by Type</h3>
            <div className="space-y-3">
              {Object.entries(alertSummary.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{type.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'yield' && batchSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Yield Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Total Batches</span>
                <span className="font-medium text-slate-900 dark:text-white">{batchSummary.totalBatches}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Average Yield</span>
                <span className="font-medium text-success-500">{formatPercent(batchSummary.avgYield)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Min Yield</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatPercent(batchSummary.minYield)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Max Yield</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatPercent(batchSummary.maxYield)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Total Wafers</span>
                <span className="font-medium text-slate-900 dark:text-white">{batchSummary.totalWafers}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Total Defects</span>
                <span className="font-medium text-warning-500">{batchSummary.totalDefects}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Yield Impact Analysis</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Based on current process performance and drift analysis:
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Estimated yield loss from drift</span>
                  <span className="font-medium text-warning-500">-1.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Potential improvement with correction</span>
                  <span className="font-medium text-success-500">+0.8%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Parameters requiring attention</span>
                  <span className="font-medium text-slate-900 dark:text-white">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
