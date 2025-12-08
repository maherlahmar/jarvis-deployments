import { Component, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import websocketService from './services/websocket';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProcessMonitor from './pages/ProcessMonitor';
import DriftAnalysis from './pages/DriftAnalysis';
import Alerts from './pages/Alerts';
import BatchTracking from './pages/BatchTracking';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <div className="bg-slate-800 rounded-lg p-8 max-w-lg text-center border border-red-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">An unexpected error occurred.</p>
            <pre className="text-left bg-black/30 rounded p-3 mb-4 text-xs text-red-400 overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
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

function AppContent() {
  const {
    darkMode,
    setConnected,
    setParameters,
    setLines,
    setReadings,
    addReading,
    setAlerts,
    addAlert,
    acknowledgeAlert,
    setBatches,
    sidebarCollapsed
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    websocketService.connect({
      onConnect: () => {
        setConnected(true);
        setLoading(false);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onInit: (data) => {
        setParameters(data.parameters);
        setLines(data.lines);
        setReadings(data.recentHistory || []);
        setAlerts(data.alerts || []);
        setBatches(data.batches || []);
        setLoading(false);
      },
      onReading: (reading) => {
        addReading(reading);
      },
      onAlert: (alert) => {
        addAlert(alert);
      },
      onAlertUpdated: (alert) => {
        if (alert.acknowledged) {
          acknowledgeAlert(alert.id);
        }
      }
    });

    // Fallback timeout for loading
    const timeout = setTimeout(() => {
      if (loading && retryCount < 30) {
        setRetryCount(r => r + 1);
      } else if (loading) {
        setLoading(false);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      websocketService.disconnect();
    };
  }, [retryCount]);

  if (loading && retryCount < 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Connecting to process monitoring system...</p>
          <p className="text-slate-500 text-sm mt-2">Attempt {retryCount + 1}/5</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/process" element={<ProcessMonitor />} />
            <Route path="/drift" element={<DriftAnalysis />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/batches" element={<BatchTracking />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
