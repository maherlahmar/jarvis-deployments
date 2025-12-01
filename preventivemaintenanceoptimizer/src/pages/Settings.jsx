import { motion } from 'framer-motion';
import { Sun, Moon, Trash2, RefreshCw, Info, Database, Shield, Bell } from 'lucide-react';
import useStore from '../store/useStore';

export default function Settings() {
  const {
    darkMode,
    toggleDarkMode,
    clearData,
    processedData,
    selectedZones,
    setSelectedZones
  } = useStore();

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all loaded data? This action cannot be undone.')) {
      clearData();
    }
  };

  const handleSelectAllZones = () => {
    setSelectedZones([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  };

  const handleClearZones = () => {
    setSelectedZones([]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure your PM Optimizer preferences
        </p>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-gray-400" />
          Appearance
        </h3>
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
              animate={{ left: darkMode ? 'calc(100% - 28px)' : '4px' }}
            >
              {darkMode ? (
                <Moon className="w-4 h-4 text-primary-600" />
              ) : (
                <Sun className="w-4 h-4 text-gray-400" />
              )}
            </motion.div>
          </button>
        </div>
      </motion.div>

      {/* Zone Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          Zone Monitoring
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select which zones to include in analysis and alerts
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(zone => (
            <button
              key={zone}
              onClick={() => {
                const current = selectedZones;
                if (current.includes(zone)) {
                  setSelectedZones(current.filter(z => z !== zone));
                } else {
                  setSelectedZones([...current, zone].sort((a, b) => a - b));
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedZones.includes(zone)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Zone {zone}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAllZones}
            className="btn-secondary text-sm"
          >
            Select All
          </button>
          <button
            onClick={handleClearZones}
            className="btn-secondary text-sm"
          >
            Clear All
          </button>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />
          Data Management
        </h3>

        {processedData && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Data</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Records:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {processedData.summary.totalRecords.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Analyzed:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {processedData.summary.analyzedRecords.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date Range:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {processedData.summary.dateRange?.start
                    ? new Date(processedData.summary.dateRange.start).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Health Score:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {processedData.summary.overallHealth.score}%
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleClearData}
          disabled={!processedData}
          className="flex items-center gap-2 px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </button>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Critical Alerts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about critical equipment issues
              </p>
            </div>
            <span className="px-2 py-1 text-xs bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 rounded">
              Always On
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Warning Alerts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about potential issues
              </p>
            </div>
            <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded">
              Enabled
            </span>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          About PM Optimizer
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            PM Optimizer is a preventive maintenance optimization tool designed for
            reflow oven equipment monitoring and analysis.
          </p>
          <p>
            Features include real-time health monitoring, AI-powered maintenance
            recommendations, zone temperature analysis, and energy efficiency tracking.
          </p>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
