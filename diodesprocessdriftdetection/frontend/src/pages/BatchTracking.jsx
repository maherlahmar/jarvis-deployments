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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Package, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatDateTime, formatDuration, formatPercent, formatNumber, formatBatchId } from '../utils/formatters';
import clsx from 'clsx';

function BatchTracking() {
  const { batches, setBatches } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [lineFilter, setLineFilter] = useState('all');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.getBatches();
        if (response.success) {
          setBatches(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [setBatches]);

  const filteredBatches = useMemo(() => {
    if (lineFilter === 'all') return batches;
    return batches.filter(b => b.line === lineFilter);
  }, [batches, lineFilter]);

  const statistics = useMemo(() => {
    if (!batches.length) return null;

    const completed = batches.filter(b => b.status === 'completed');
    const inProgress = batches.filter(b => b.status === 'in_progress');

    const avgYield = completed.length > 0
      ? completed.reduce((sum, b) => sum + b.yieldPercent, 0) / completed.length
      : 0;

    const totalWafers = batches.reduce((sum, b) => sum + b.waferCount, 0);
    const totalDefects = batches.reduce((sum, b) => sum + (b.defects || 0), 0);
    const defectRate = totalWafers > 0 ? (totalDefects / totalWafers) * 100 : 0;

    const yieldByLine = {};
    ['Line A', 'Line B', 'Line C', 'Line D'].forEach(line => {
      const lineBatches = completed.filter(b => b.line === line);
      yieldByLine[line] = lineBatches.length > 0
        ? lineBatches.reduce((sum, b) => sum + b.yieldPercent, 0) / lineBatches.length
        : 0;
    });

    return {
      totalBatches: batches.length,
      completedBatches: completed.length,
      inProgressBatches: inProgress.length,
      avgYield,
      totalWafers,
      defectRate,
      yieldByLine
    };
  }, [batches]);

  const yieldTrendData = useMemo(() => {
    return batches
      .filter(b => b.status === 'completed')
      .slice(-20)
      .map(b => ({
        id: formatBatchId(b.id),
        yield: b.yieldPercent,
        line: b.line
      }));
  }, [batches]);

  const lineComparisonData = useMemo(() => {
    if (!statistics) return [];
    return Object.entries(statistics.yieldByLine).map(([line, yield_]) => ({
      line,
      yield: yield_
    }));
  }, [statistics]);

  const statusDistribution = useMemo(() => {
    const completed = batches.filter(b => b.status === 'completed').length;
    const inProgress = batches.filter(b => b.status === 'in_progress').length;

    return [
      { name: 'Completed', value: completed, color: '#22c55e' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' }
    ];
  }, [batches]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success-500 bg-success-500/10';
      case 'in_progress': return 'text-primary-500 bg-primary-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Package className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics?.totalBatches || 0}</p>
              <p className="text-sm text-slate-500">Total Batches</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-success-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPercent(statistics?.avgYield)}
              </p>
              <p className="text-sm text-slate-500">Average Yield</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-warning-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPercent(statistics?.defectRate)}
              </p>
              <p className="text-sm text-slate-500">Defect Rate</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {statistics?.inProgressBatches || 0}
              </p>
              <p className="text-sm text-slate-500">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Yield Trend</h3>
            <p className="text-sm text-slate-500">Last 20 completed batches</p>
          </div>
          <div className="p-4">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yieldTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="id"
                    stroke="#6b7280"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={[80, 100]}
                    stroke="#6b7280"
                    fontSize={11}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                          <p className="font-medium text-slate-900 dark:text-white">{data.id}</p>
                          <p className="text-sm text-slate-500">{data.line}</p>
                          <p className="text-sm font-medium text-success-500">
                            Yield: {formatPercent(data.yield)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Yield by Line</h3>
          </div>
          <div className="p-4">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="line" stroke="#6b7280" fontSize={11} />
                  <YAxis domain={[80, 100]} stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700">
                          <p className="font-medium">{data.line}</p>
                          <p className="text-sm text-success-500">{formatPercent(data.yield)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="yield" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Batch History</h3>
                <p className="text-sm text-slate-500">{filteredBatches.length} batches</p>
              </div>
              <select
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                className="select w-36"
              >
                <option value="all">All Lines</option>
                <option value="Line A">Line A</option>
                <option value="Line B">Line B</option>
                <option value="Line C">Line C</option>
                <option value="Line D">Line D</option>
              </select>
            </div>
          </div>
          <div className="table-container max-h-[400px] overflow-y-auto">
            <table className="table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th>Batch ID</th>
                  <th>Product</th>
                  <th>Line</th>
                  <th>Wafers</th>
                  <th>Yield</th>
                  <th>Defects</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map(batch => (
                  <tr
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={clsx(
                      'cursor-pointer',
                      selectedBatch?.id === batch.id && 'bg-primary-50 dark:bg-primary-900/20'
                    )}
                  >
                    <td className="font-medium text-slate-900 dark:text-white">{formatBatchId(batch.id)}</td>
                    <td>{batch.product}</td>
                    <td>{batch.line}</td>
                    <td>{batch.waferCount}</td>
                    <td className={batch.yieldPercent >= 90 ? 'text-success-500' : batch.yieldPercent >= 85 ? 'text-warning-500' : 'text-danger-500'}>
                      {formatPercent(batch.yieldPercent)}
                    </td>
                    <td>{batch.defects}</td>
                    <td>
                      <span className={clsx('badge', getStatusColor(batch.status))}>
                        {batch.status === 'in_progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {selectedBatch ? (
            <div className="card p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Batch Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Batch ID</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedBatch.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Product</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedBatch.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Line</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedBatch.line}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Started</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDateTime(selectedBatch.startTime)}
                  </span>
                </div>
                {selectedBatch.endTime && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Completed</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatDateTime(selectedBatch.endTime)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Duration</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDuration((selectedBatch.endTime || Date.now()) - selectedBatch.startTime)}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Wafer Count</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedBatch.waferCount}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-500">Yield</span>
                    <span className={clsx(
                      'font-medium',
                      selectedBatch.yieldPercent >= 90 ? 'text-success-500' : 'text-warning-500'
                    )}>
                      {formatPercent(selectedBatch.yieldPercent)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-500">Defects</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedBatch.defects}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-500">Process Deviations</span>
                    <span className={clsx(
                      'font-medium',
                      selectedBatch.processDeviations > 0 ? 'text-warning-500' : 'text-success-500'
                    )}>
                      {selectedBatch.processDeviations}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500">Select a batch to view details</p>
            </div>
          )}

          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Status Distribution</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchTracking;
