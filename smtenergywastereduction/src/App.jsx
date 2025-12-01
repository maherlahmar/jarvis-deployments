import { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import EnergyMonitor from './pages/EnergyMonitor';
import ZoneAnalysis from './pages/ZoneAnalysis';
import WasteAlerts from './pages/WasteAlerts';
import Trends from './pages/Trends';
import IdleDetection from './pages/IdleDetection';
import PowerFactor from './pages/PowerFactor';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Error Boundary Component
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-lg text-center border border-red-500/30 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-500 text-3xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">An unexpected error occurred in the application.</p>
            <pre className="text-left bg-slate-950 rounded-lg p-4 mb-4 text-xs text-red-400 overflow-auto max-h-32 border border-slate-700">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="energy" element={<EnergyMonitor />} />
            <Route path="zones" element={<ZoneAnalysis />} />
            <Route path="alerts" element={<WasteAlerts />} />
            <Route path="trends" element={<Trends />} />
            <Route path="idle" element={<IdleDetection />} />
            <Route path="power-factor" element={<PowerFactor />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
