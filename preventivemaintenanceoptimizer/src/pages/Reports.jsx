import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Thermometer,
  Zap,
  Activity
} from 'lucide-react';
import useStore from '../store/useStore';
import { ZONES } from '../services/dataProcessor';

export default function Reports() {
  const { processedData } = useStore();
  const [selectedReport, setSelectedReport] = useState('summary');
  const [exporting, setExporting] = useState(false);

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to generate reports</p>
      </div>
    );
  }

  const { summary, statistics, healthScores, anomalies, recommendations, energyAnalysis } = processedData;

  const exportToCSV = (data, filename) => {
    setExporting(true);
    setTimeout(() => {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setExporting(false);
    }, 500);
  };

  const exportHealthReport = () => {
    const data = ZONES.map(zone => {
      const health = healthScores[`zone${zone.id}`];
      return {
        Zone: zone.name,
        Type: zone.type,
        'Overall Score': health?.overall || 0,
        'Temperature Score': health?.temperature || 0,
        'Stability Score': health?.stability || 0,
        'Balance Score': health?.balance || 0
      };
    });
    exportToCSV(data, 'health_report');
  };

  const exportMaintenanceReport = () => {
    const data = recommendations.map(rec => ({
      Priority: rec.priority,
      Category: rec.category,
      Title: rec.title,
      Description: rec.description.replace(/,/g, ';'),
      'Estimated Time': rec.estimatedTime,
      Impact: rec.impact,
      Zone: rec.zone || 'N/A'
    }));
    exportToCSV(data, 'maintenance_recommendations');
  };

  const exportAnomaliesReport = () => {
    const data = anomalies.list.map(a => ({
      Type: a.type,
      Severity: a.severity,
      Zone: a.zone || 'N/A',
      Position: a.position || 'N/A',
      Value: typeof a.value === 'number' ? a.value.toFixed(2) : a.value,
      Threshold: typeof a.threshold === 'number' ? a.threshold.toFixed(2) : a.threshold,
      Timestamp: a.timestamp || 'N/A'
    }));
    exportToCSV(data, 'anomalies_report');
  };

  const reportTypes = [
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'health', label: 'Equipment Health', icon: Activity },
    { id: 'maintenance', label: 'Maintenance Plan', icon: CheckCircle },
    { id: 'energy', label: 'Energy Analysis', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Export</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Generate and export detailed maintenance reports
        </p>
      </motion.div>

      {/* Report Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-2">
          {reportTypes.map(report => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedReport === report.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {report.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Export Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Export
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportHealthReport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <Download className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="font-medium text-primary-700 dark:text-primary-300">Health Report (CSV)</span>
          </button>
          <button
            onClick={exportMaintenanceReport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors"
          >
            <Download className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            <span className="font-medium text-warning-700 dark:text-warning-300">Maintenance Plan (CSV)</span>
          </button>
          <button
            onClick={exportAnomaliesReport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 hover:bg-danger-100 dark:hover:bg-danger-900/30 transition-colors"
          >
            <Download className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            <span className="font-medium text-danger-700 dark:text-danger-300">Anomalies Report (CSV)</span>
          </button>
        </div>
      </motion.div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {reportTypes.find(r => r.id === selectedReport)?.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Data period: {summary.dateRange?.start ? new Date(summary.dateRange.start).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900">
          {/* Executive Summary Report */}
          {selectedReport === 'summary' && (
            <div className="space-y-6">
              <section>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-500" />
                  Overall Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Health Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.overallHealth.score}%
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{summary.overallHealth.status}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Records Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.totalRecords.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Critical Alerts</p>
                    <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                      {anomalies.summary.critical}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Recommendations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {recommendations.length}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  Key Findings
                </h4>
                <ul className="space-y-2">
                  {recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <span className={`px-2 py-0.5 text-xs rounded uppercase
                        ${rec.priority === 'critical' ? 'bg-danger-100 text-danger-700' : ''}
                        ${rec.priority === 'high' ? 'bg-warning-100 text-warning-700' : ''}
                        ${rec.priority === 'medium' ? 'bg-primary-100 text-primary-700' : ''}
                        ${rec.priority === 'low' ? 'bg-success-100 text-success-700' : ''}
                      `}>
                        {rec.priority}
                      </span>
                      <span>{rec.title}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {/* Health Report */}
          {selectedReport === 'health' && (
            <div className="space-y-6">
              <section>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Zone Health Summary
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stability</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {ZONES.map(zone => {
                        const health = healthScores[`zone${zone.id}`];
                        return (
                          <tr key={zone.id}>
                            <td className="px-4 py-2 text-sm">{zone.name}</td>
                            <td className="px-4 py-2 text-sm capitalize">{zone.type}</td>
                            <td className="px-4 py-2 text-sm font-medium">{health?.overall || 0}%</td>
                            <td className="px-4 py-2 text-sm">{health?.temperature || 0}%</td>
                            <td className="px-4 py-2 text-sm">{health?.stability || 0}%</td>
                            <td className="px-4 py-2 text-sm">{health?.balance || 0}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  System Health
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Electrical</p>
                    <p className="text-xl font-bold">{healthScores.electrical?.overall || 0}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Flow System</p>
                    <p className="text-xl font-bold">{healthScores.flowSystem?.overall || 0}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Atmosphere</p>
                    <p className="text-xl font-bold">{healthScores.atmosphere?.overall || 0}%</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Maintenance Report */}
          {selectedReport === 'maintenance' && (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded uppercase
                      ${rec.priority === 'critical' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300' : ''}
                      ${rec.priority === 'high' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300' : ''}
                      ${rec.priority === 'medium' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : ''}
                      ${rec.priority === 'low' ? 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300' : ''}
                    `}>
                      {rec.priority}
                    </span>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{rec.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Est. Time: {rec.estimatedTime}</span>
                        <span>Impact: {rec.impact}</span>
                        {rec.zone && <span>Zone: {rec.zone}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Energy Report */}
          {selectedReport === 'energy' && (
            <div className="space-y-6">
              <section>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Energy Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Total Energy</p>
                    <p className="text-xl font-bold">{energyAnalysis?.totalEnergy} kWh</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Avg Power</p>
                    <p className="text-xl font-bold">{energyAnalysis?.avgPower} kW</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Peak Power</p>
                    <p className="text-xl font-bold">{energyAnalysis?.peakPower} kW</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Efficiency</p>
                    <p className="text-xl font-bold">{energyAnalysis?.efficiency}%</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Power Quality
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Avg Power Factor</p>
                    <p className="text-xl font-bold">{(statistics?.power?.avgPowerFactor * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Min Power Factor</p>
                    <p className="text-xl font-bold">{(statistics?.power?.minPowerFactor * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">Energy/Board</p>
                    <p className="text-xl font-bold">{energyAnalysis?.energyPerBoard} kWh</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
