import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Package,
  Gauge,
  BarChart3,
  Target
} from 'lucide-react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import ParameterCard from '../components/ParameterCard';
import ControlChart from '../components/ControlChart';
import AlertList from '../components/AlertList';
import { formatPercent, formatUptime } from '../utils/formatters';

function Dashboard() {
  const {
    parameters,
    readings,
    selectedParameter,
    setSelectedParameter,
    getAlertCounts,
    setStatistics,
    statistics
  } = useStore();

  const alertCounts = getAlertCounts();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getStatistics();
        if (response.success) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [setStatistics]);

  const parameterKeys = Object.keys(parameters);
  const currentReading = readings[readings.length - 1];

  const processHealth = alertCounts.critical > 0 ? 'critical' :
    alertCounts.warning > 0 ? 'warning' : 'normal';

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Process Health"
          value={processHealth === 'normal' ? 'Stable' : processHealth === 'warning' ? 'Warning' : 'Critical'}
          subtitle={`${readings.length} readings in buffer`}
          icon={processHealth === 'normal' ? CheckCircle : AlertTriangle}
          status={processHealth}
        />
        <StatCard
          title="Active Alerts"
          value={alertCounts.total}
          subtitle={`${alertCounts.critical} critical, ${alertCounts.warning} warnings`}
          icon={AlertTriangle}
          status={alertCounts.critical > 0 ? 'danger' : alertCounts.warning > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Avg Yield"
          value={formatPercent(statistics.avgYield)}
          subtitle="Last 10 batches"
          icon={Target}
          status={parseFloat(statistics.avgYield) >= 90 ? 'success' : parseFloat(statistics.avgYield) >= 85 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Out of Spec"
          value={formatPercent(statistics.outOfSpecPercent)}
          subtitle="Recent readings"
          icon={Gauge}
          status={parseFloat(statistics.outOfSpecPercent) <= 2 ? 'success' : parseFloat(statistics.outOfSpecPercent) <= 5 ? 'warning' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Control Chart: {parameters[selectedParameter]?.name || selectedParameter}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Real-time process monitoring with control limits
                  </p>
                </div>
                <select
                  value={selectedParameter}
                  onChange={(e) => setSelectedParameter(e.target.value)}
                  className="select w-48"
                >
                  {parameterKeys.map(key => (
                    <option key={key} value={key}>
                      {parameters[key]?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4">
              <ControlChart paramKey={selectedParameter} height={350} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unacknowledged process alerts
            </p>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin">
            <AlertList limit={8} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Process Parameters</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click a parameter to view its control chart
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {parameterKeys.map(key => (
            <ParameterCard
              key={key}
              paramKey={key}
              onClick={setSelectedParameter}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">System Uptime</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {formatUptime(statistics.uptime || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Readings</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {statistics.totalReadings?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active Batches</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {statistics.activeBatches || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Alerts</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {statistics.totalAlerts || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Manufacturing Lines</h3>
          <div className="space-y-3">
            {['Line A', 'Line B', 'Line C', 'Line D'].map(line => {
              const lineReadings = readings.filter(r => r.line === line);
              const hasIssues = lineReadings.some(r =>
                Object.values(r.spcResults || {}).some(s => s.outOfControl || s.outOfSpec)
              );

              return (
                <div key={line} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${hasIssues ? 'bg-warning-500' : 'bg-success-500'}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{line}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    hasIssues
                      ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                      : 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                  }`}>
                    {hasIssues ? 'Attention' : 'Normal'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
