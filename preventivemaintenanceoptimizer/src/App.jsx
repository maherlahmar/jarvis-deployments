import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Component } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentHealth from './pages/EquipmentHealth';
import ZoneAnalysis from './pages/ZoneAnalysis';
import Maintenance from './pages/Maintenance';
import Trends from './pages/Trends';
import Alerts from './pages/Alerts';
import Energy from './pages/Energy';
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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-lg text-center border border-red-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">An unexpected error occurred in PM Optimizer.</p>
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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="health" element={<EquipmentHealth />} />
            <Route path="zones" element={<ZoneAnalysis />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="trends" element={<Trends />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="energy" element={<Energy />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
