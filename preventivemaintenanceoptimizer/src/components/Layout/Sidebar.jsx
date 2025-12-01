import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Thermometer,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Zap,
  FileText,
  Settings,
  ChevronLeft,
  Activity
} from 'lucide-react';
import useStore from '../../store/useStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/health', icon: Activity, label: 'Equipment Health' },
  { path: '/zones', icon: Thermometer, label: 'Zone Analysis' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/trends', icon: TrendingUp, label: 'Trends' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { path: '/energy', icon: Zap, label: 'Energy' },
  { path: '/reports', icon: FileText, label: 'Reports' }
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, processedData } = useStore();
  const healthStatus = processedData?.summary?.overallHealth;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 72 }}
      className="fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">PM Optimizer</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-gray-500 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <div className={`mx-3 mt-4 p-3 rounded-lg ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className={`
            p-4 rounded-lg
            ${healthStatus.status === 'excellent' ? 'bg-success-50 dark:bg-success-900/20' : ''}
            ${healthStatus.status === 'good' ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
            ${healthStatus.status === 'fair' ? 'bg-warning-50 dark:bg-warning-900/20' : ''}
            ${healthStatus.status === 'poor' ? 'bg-danger-50 dark:bg-danger-900/20' : ''}
          `}>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overall Health</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold
                ${healthStatus.status === 'excellent' ? 'text-success-600 dark:text-success-400' : ''}
                ${healthStatus.status === 'good' ? 'text-primary-600 dark:text-primary-400' : ''}
                ${healthStatus.status === 'fair' ? 'text-warning-600 dark:text-warning-400' : ''}
                ${healthStatus.status === 'poor' ? 'text-danger-600 dark:text-danger-400' : ''}
              `}>
                {healthStatus.score}%
              </span>
              <span className={`text-sm font-medium uppercase
                ${healthStatus.status === 'excellent' ? 'text-success-600 dark:text-success-400' : ''}
                ${healthStatus.status === 'good' ? 'text-primary-600 dark:text-primary-400' : ''}
                ${healthStatus.status === 'fair' ? 'text-warning-600 dark:text-warning-400' : ''}
                ${healthStatus.status === 'poor' ? 'text-danger-600 dark:text-danger-400' : ''}
              `}>
                Grade {healthStatus.grade}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
            ${isActive
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>
    </motion.aside>
  );
}
