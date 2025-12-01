import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Upload, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { parseCSV, processData } from '../../services/dataProcessor';

export default function Header() {
  const {
    darkMode,
    toggleDarkMode,
    sidebarOpen,
    isLoading,
    setLoading,
    setRawData,
    setProcessedData,
    setError,
    lastUpdated,
    notifications,
    removeNotification,
    addNotification,
    processedData
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const rawData = await parseCSV(file);
      setRawData(rawData);

      const processed = processData(rawData);
      setProcessedData(processed);

      addNotification({
        type: 'success',
        title: 'Data Loaded',
        message: `Successfully processed ${rawData.length.toLocaleString()} records`
      });
    } catch (err) {
      setError(err.message);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: err.message
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const criticalAlerts = processedData?.anomalies?.summary?.critical || 0;

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg
        border-b border-gray-200 dark:border-gray-800 z-30 flex items-center justify-between px-6
        transition-all duration-300
        ${sidebarOpen ? 'left-64' : 'left-[72px]'}
      `}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Equipment Preventive Maintenance
        </h1>
        {lastUpdated && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Upload button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isLoading ? 'Processing...' : 'Upload Data'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {(criticalAlerts > 0 || notifications.length > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && criticalAlerts === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {criticalAlerts > 0 && (
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-danger-50 dark:bg-danger-900/20">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-danger-700 dark:text-danger-400">
                                {criticalAlerts} Critical Alerts
                              </p>
                              <p className="text-sm text-danger-600 dark:text-danger-300">
                                Immediate attention required
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex items-start gap-3">
                            {notification.type === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {notification.message}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
    </header>
  );
}
