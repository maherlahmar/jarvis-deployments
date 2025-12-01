import { Component, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Thermometer,
  Zap,
  AlertTriangle,
  Settings,
  Upload,
  X,
  Menu,
} from 'lucide-react';
import useStore from './store/useStore';
import Dashboard from './pages/Dashboard';
import TemperatureZones from './pages/TemperatureZones';
import PowerMetrics from './pages/PowerMetrics';
import AnomalyPanel from './pages/AnomalyPanel';
import SettingsPage from './pages/SettingsPage';
import FileUpload from './components/FileUpload';
import NotificationCenter from './components/NotificationCenter';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
          <div className="bg-dark-900 rounded-xl p-8 max-w-lg text-center border border-danger-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-danger-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-dark-400 mb-4">An unexpected error occurred.</p>
            <pre className="text-left bg-dark-950 rounded p-3 mb-4 text-xs text-danger-400 overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'temperature', label: 'Temperature Zones', icon: Thermometer },
  { id: 'power', label: 'Power Metrics', icon: Zap },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function AppContent() {
  const { viewMode, setViewMode, rawData, anomalyResults, isLoading } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const criticalCount = anomalyResults?.summary?.critical || 0;
  const warningCount = anomalyResults?.summary?.warning || 0;

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-dark-900/50 border-r border-dark-700/50 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-dark-700/50 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">Reflow Monitor</h1>
                <p className="text-xs text-dark-400">Anomaly Detection</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = viewMode === item.id;
            const showBadge = item.id === 'anomalies' && criticalCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === 'anomalies' && (criticalCount > 0 || warningCount > 0) && (
                      <div className="flex gap-1">
                        {criticalCount > 0 && (
                          <span className="badge-danger">{criticalCount}</span>
                        )}
                        {warningCount > 0 && (
                          <span className="badge-warning">{warningCount}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-700/50">
          <button
            onClick={() => setShowUpload(true)}
            className={`btn-primary w-full ${!sidebarOpen && 'px-2'}`}
          >
            <Upload className="w-5 h-5" />
            {sidebarOpen && <span>Load Data</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-dark-900/30 border-b border-dark-700/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {NAV_ITEMS.find((n) => n.id === viewMode)?.label || 'Dashboard'}
            </h2>
            {rawData.length > 0 && (
              <span className="badge-info">
                {rawData.length.toLocaleString()} records loaded
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-primary-400">
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {viewMode === 'dashboard' && <Dashboard />}
              {viewMode === 'temperature' && <TemperatureZones />}
              {viewMode === 'power' && <PowerMetrics />}
              {viewMode === 'anomalies' && <AnomalyPanel />}
              {viewMode === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-900 rounded-xl border border-dark-700 max-w-xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <h3 className="text-lg font-semibold text-white">Load Data File</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
              <div className="p-6">
                <FileUpload onComplete={() => setShowUpload(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationCenter />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
