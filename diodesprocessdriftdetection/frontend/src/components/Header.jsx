import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, BellOff, Wifi, WifiOff, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import websocketService from '../services/websocket';
import { formatTime } from '../utils/formatters';
import { useState, useEffect } from 'react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/process': 'Process Monitor',
  '/drift': 'Drift Analysis',
  '/alerts': 'Alert Management',
  '/batches': 'Batch Tracking',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

function Header() {
  const location = useLocation();
  const {
    darkMode,
    toggleDarkMode,
    connected,
    notificationsEnabled,
    toggleNotifications,
    getAlertCounts
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const alertCounts = getAlertCounts();
  const isMockMode = websocketService.isMockMode();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{pageTitle}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analog IC Manufacturing Process Control
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-1.5 text-success-500">
              <Wifi className="w-4 h-4" />
              <span className="text-xs font-medium">
                {isMockMode ? 'Demo Mode' : 'Connected'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-danger-500">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs font-medium">Disconnected</span>
            </div>
          )}
        </div>

        {alertCounts.critical > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-danger-500/10 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-danger-500 rounded-full" />
            <span className="text-xs font-medium text-danger-500">
              {alertCounts.critical} Critical
            </span>
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          onClick={toggleNotifications}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
        >
          {notificationsEnabled ? (
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <BellOff className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-slate-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
