import { useEffect, useState } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Zap,
  DollarSign,
  Leaf
} from 'lucide-react';
import useStore from '../store/useStore';

export default function Reports() {
  const {
    dashboardSummary,
    weeklyTrend,
    productionMetrics,
    wasteAlerts,
    isLoading,
    initializeData
  } = useStore();

  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    initializeData();
  }, []);

  if (isLoading || !dashboardSummary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reportTypes = [
    { id: 'daily', label: 'Daily Summary' },
    { id: 'weekly', label: 'Weekly Report' },
    { id: 'efficiency', label: 'Efficiency Analysis' },
    { id: 'waste', label: 'Waste Report' }
  ];

  const handleExport = (format) => {
    // Create sample data for export
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: dateRange,
      summary: dashboardSummary,
      weeklyTrend,
      productionMetrics,
      alertsCount: wasteAlerts.length
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value', 'Unit'],
        ['Daily Energy', dashboardSummary.dailyEnergy, 'kWh'],
        ['Current Power', dashboardSummary.currentPower, 'kW'],
        ['Power Factor', dashboardSummary.powerFactor, ''],
        ['Efficiency', dashboardSummary.efficiency, '%'],
        ['Boards Today', dashboardSummary.boardsToday, 'units'],
        ['Wasted Energy', dashboardSummary.wastedEnergy, 'kWh'],
        ['Potential Savings', dashboardSummary.costSavings, '$'],
        ['Active Alerts', dashboardSummary.activeAlerts, '']
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Generate and export energy analysis reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-secondary"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn btn-primary"
          >
            <FileBarChart size={16} />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400">Report Type:</span>
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    reportType === type.id
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400">Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input w-40"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report preview */}
      <div className="card">
        <div className="card-header border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileBarChart className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">
                {reportTypes.find(t => t.id === reportType)?.label}
              </h3>
            </div>
            <span className="text-sm text-slate-400">
              Generated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="card-body">
          {/* Executive Summary */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-white mb-4 pb-2 border-b border-slate-700/50">
              Executive Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary-400" />
                  <span className="text-xs text-slate-400">Total Energy</span>
                </div>
                <p className="text-2xl font-bold text-white">{dashboardSummary.dailyEnergy} kWh</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Efficiency</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{dashboardSummary.efficiency}%</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-slate-400">Savings Potential</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">${dashboardSummary.costSavings}</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">CO2 Reducible</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{dashboardSummary.co2Saved} kg</p>
              </div>
            </div>
          </div>

          {/* Key Metrics Table */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-white mb-4 pb-2 border-b border-slate-700/50">
              Key Performance Indicators
            </h4>
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">Metric</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-right">Target</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row">
                  <td className="table-cell">Power Factor</td>
                  <td className="table-cell text-right font-medium">{dashboardSummary.powerFactor}</td>
                  <td className="table-cell text-right text-slate-400">0.95</td>
                  <td className="table-cell text-right">
                    <span className={`badge ${parseFloat(dashboardSummary.powerFactor) >= 0.92 ? 'badge-success' : 'badge-warning'}`}>
                      {parseFloat(dashboardSummary.powerFactor) >= 0.92 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">Energy Efficiency</td>
                  <td className="table-cell text-right font-medium">{dashboardSummary.efficiency}%</td>
                  <td className="table-cell text-right text-slate-400">92%</td>
                  <td className="table-cell text-right">
                    <span className={`badge ${parseFloat(dashboardSummary.efficiency) >= 90 ? 'badge-success' : 'badge-warning'}`}>
                      {parseFloat(dashboardSummary.efficiency) >= 90 ? 'On Target' : 'Below Target'}
                    </span>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">Daily Production</td>
                  <td className="table-cell text-right font-medium">{dashboardSummary.boardsToday} units</td>
                  <td className="table-cell text-right text-slate-400">500 units</td>
                  <td className="table-cell text-right">
                    <span className={`badge ${parseInt(dashboardSummary.boardsToday) >= 500 ? 'badge-success' : 'badge-info'}`}>
                      {parseInt(dashboardSummary.boardsToday) >= 500 ? 'Target Met' : 'In Progress'}
                    </span>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">Wasted Energy</td>
                  <td className="table-cell text-right font-medium">{dashboardSummary.wastedEnergy} kWh</td>
                  <td className="table-cell text-right text-slate-400">&lt; 20 kWh</td>
                  <td className="table-cell text-right">
                    <span className={`badge ${parseFloat(dashboardSummary.wastedEnergy) <= 20 ? 'badge-success' : 'badge-warning'}`}>
                      {parseFloat(dashboardSummary.wastedEnergy) <= 20 ? 'Acceptable' : 'High'}
                    </span>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">Active Alerts</td>
                  <td className="table-cell text-right font-medium">{dashboardSummary.activeAlerts}</td>
                  <td className="table-cell text-right text-slate-400">0</td>
                  <td className="table-cell text-right">
                    <span className={`badge ${parseInt(dashboardSummary.activeAlerts) === 0 ? 'badge-success' : 'badge-danger'}`}>
                      {parseInt(dashboardSummary.activeAlerts) === 0 ? 'Clear' : 'Action Required'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Weekly Trend */}
          {weeklyTrend && weeklyTrend.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-white mb-4 pb-2 border-b border-slate-700/50">
                Weekly Trend Summary
              </h4>
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left">Day</th>
                    <th className="px-4 py-3 text-right">Energy (kWh)</th>
                    <th className="px-4 py-3 text-right">Production</th>
                    <th className="px-4 py-3 text-right">Efficiency</th>
                    <th className="px-4 py-3 text-right">Waste (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyTrend.map((day, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell font-medium">{day.day}</td>
                      <td className="table-cell text-right">{day.energy.toFixed(1)}</td>
                      <td className="table-cell text-right">{day.production}</td>
                      <td className="table-cell text-right">
                        <span className={day.efficiency >= 90 ? 'text-green-400' : 'text-yellow-400'}>
                          {day.efficiency.toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell text-right text-red-400">{day.waste.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800/50">
                    <td className="table-cell font-bold text-white">Total/Avg</td>
                    <td className="table-cell text-right font-bold text-white">
                      {weeklyTrend.reduce((sum, d) => sum + d.energy, 0).toFixed(1)}
                    </td>
                    <td className="table-cell text-right font-bold text-white">
                      {weeklyTrend.reduce((sum, d) => sum + d.production, 0)}
                    </td>
                    <td className="table-cell text-right font-bold text-white">
                      {(weeklyTrend.reduce((sum, d) => sum + d.efficiency, 0) / weeklyTrend.length).toFixed(1)}%
                    </td>
                    <td className="table-cell text-right font-bold text-red-400">
                      {weeklyTrend.reduce((sum, d) => sum + d.waste, 0).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h4 className="text-md font-semibold text-white mb-4 pb-2 border-b border-slate-700/50">
              Recommendations
            </h4>
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-yellow-500">
                <h5 className="font-medium text-white mb-1">Power Factor Improvement</h5>
                <p className="text-sm text-slate-400">
                  Install capacitor bank for reactive power compensation. Expected savings: $25-50/day.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-orange-500">
                <h5 className="font-medium text-white mb-1">Idle Time Reduction</h5>
                <p className="text-sm text-slate-400">
                  Configure automatic standby mode to reduce idle power consumption by 60%.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-green-500">
                <h5 className="font-medium text-white mb-1">Zone Temperature Optimization</h5>
                <p className="text-sm text-slate-400">
                  Calibrate heater zones to reduce temperature variance and improve energy efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
