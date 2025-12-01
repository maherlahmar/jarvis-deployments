import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import CSVUpload from './components/CSVUpload';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewPanel from './components/OverviewPanel';
import AlertsPanel from './components/AlertsPanel';
import ZoneAnalysisPanel from './components/ZoneAnalysisPanel';
import TrendsPanel from './components/TrendsPanel';
import RecommendationsPanel from './components/RecommendationsPanel';

function AppContent() {
  const { activeTab, sidebarOpen, isLoading, hasData, error, loadDataFromCSV } = useStore();

  // Show upload screen if no data loaded
  if (!hasData && !isLoading) {
    return (
      <CSVUpload
        onFileUpload={(csvText) => loadDataFromCSV(csvText)}
        isLoading={isLoading}
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Processing reflow oven data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
        <div className="bg-background-card rounded-xl p-8 max-w-lg text-center border border-red-500/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => useStore.getState().clearData()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'alerts':
        return <AlertsPanel />;
      case 'zones':
        return <ZoneAnalysisPanel />;
      case 'trends':
        return <TrendsPanel />;
      case 'recommendations':
        return <RecommendationsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  const panelTitles = {
    overview: 'Dashboard Overview',
    alerts: 'Alerts & Notifications',
    zones: 'Zone Temperature Analysis',
    trends: 'Energy Trends & Analytics',
    recommendations: 'Optimization Recommendations',
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 240 : 72 }}
      >
        <Header />

        <div className="p-6">
          {/* Page Title */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-white">
              {panelTitles[activeTab] || 'Dashboard'}
            </h1>
            <p className="text-gray-400 mt-1">
              {activeTab === 'overview' && 'Real-time energy monitoring and waste detection for your reflow oven'}
              {activeTab === 'alerts' && 'View and manage energy waste alerts and system notifications'}
              {activeTab === 'zones' && 'Detailed analysis of temperature zones across the reflow oven'}
              {activeTab === 'trends' && 'Historical trends and patterns in energy consumption'}
              {activeTab === 'recommendations' && 'AI-powered recommendations to reduce energy waste'}
            </p>
          </motion.div>

          {/* Panel Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
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
