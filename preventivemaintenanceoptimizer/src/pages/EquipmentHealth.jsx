import { motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import useStore from '../store/useStore';
import { ZONES } from '../services/dataProcessor';

export default function EquipmentHealth() {
  const { processedData } = useStore();

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Please upload data to view equipment health</p>
      </div>
    );
  }

  const { healthScores, statistics, anomalies } = processedData;

  const getHealthColor = (score) => {
    if (score >= 90) return { bg: 'bg-success-500', text: 'text-success-600 dark:text-success-400' };
    if (score >= 75) return { bg: 'bg-primary-500', text: 'text-primary-600 dark:text-primary-400' };
    if (score >= 60) return { bg: 'bg-warning-500', text: 'text-warning-600 dark:text-warning-400' };
    return { bg: 'bg-danger-500', text: 'text-danger-600 dark:text-danger-400' };
  };

  const systemHealth = [
    {
      name: 'Electrical System',
      score: healthScores.electrical?.overall || 0,
      metrics: [
        { label: 'Power Factor', value: `${(healthScores.electrical?.powerFactor || 0)}%`, target: '95%+' },
        { label: 'Stability', value: `${healthScores.electrical?.stability || 0}%`, target: '95%+' }
      ]
    },
    {
      name: 'Flow System',
      score: healthScores.flowSystem?.overall || 0,
      metrics: [
        { label: 'Flow Rate', value: `${healthScores.flowSystem?.flowRate || 0}%`, target: '100%' },
        { label: 'Stability', value: `${healthScores.flowSystem?.stability || 0}%`, target: '90%+' }
      ]
    },
    {
      name: 'Atmosphere Control',
      score: healthScores.atmosphere?.overall || 0,
      metrics: [
        { label: 'O2 Control', value: `${healthScores.atmosphere?.o2Control || 0}%`, target: '90%+' },
        { label: 'Stability', value: `${healthScores.atmosphere?.stability || 0}%`, target: '90%+' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment Health</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Comprehensive health status for all equipment subsystems
        </p>
      </motion.div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systemHealth.map((system, index) => {
          const colors = getHealthColor(system.score);
          return (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{system.name}</h3>
                <span className={`text-2xl font-bold ${colors.text}`}>{system.score}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${system.score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full ${colors.bg} rounded-full`}
                />
              </div>
              <div className="space-y-2">
                {system.metrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{metric.label}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {metric.value} <span className="text-gray-400 text-xs">(target: {metric.target})</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zone Health Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zone Health Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Overall</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Temperature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ZONES.map((zone) => {
                const zoneHealth = healthScores[`zone${zone.id}`];
                if (!zoneHealth) return null;
                const colors = getHealthColor(zoneHealth.overall);

                return (
                  <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {zone.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded capitalize
                        ${zone.type === 'preheat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${zone.type === 'soak' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        ${zone.type === 'reflow' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                        ${zone.type === 'peak' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${zone.type === 'cooling' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : ''}
                      `}>
                        {zone.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${zoneHealth.overall}%` }} />
                        </div>
                        <span className={`text-sm font-medium ${colors.text}`}>{zoneHealth.overall}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {zoneHealth.temperature}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {zoneHealth.stability}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {zoneHealth.balance}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {zoneHealth.overall >= 80 ? (
                        <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
                          <CheckCircle className="w-4 h-4" /> Good
                        </span>
                      ) : zoneHealth.overall >= 60 ? (
                        <span className="flex items-center gap-1 text-warning-600 dark:text-warning-400">
                          <AlertCircle className="w-4 h-4" /> Monitor
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-danger-600 dark:text-danger-400">
                          <AlertCircle className="w-4 h-4" /> Attention
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Anomaly Summary */}
      {anomalies && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Anomaly Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
              <div className="text-3xl font-bold text-danger-600 dark:text-danger-400">
                {anomalies.summary?.critical || 0}
              </div>
              <p className="text-sm text-danger-700 dark:text-danger-300">Critical Issues</p>
            </div>
            <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                {anomalies.summary?.warning || 0}
              </div>
              <p className="text-sm text-warning-700 dark:text-warning-300">Warnings</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {anomalies.summary?.total || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Anomalies</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
