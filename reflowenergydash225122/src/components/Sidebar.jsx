import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import useStore from '../store/useStore';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'zones', label: 'Zone Analysis', icon: Thermometer },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
];

function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar, alerts, dismissedAlerts } = useStore();

  const activeAlertCount = alerts.filter(a => !dismissedAlerts.includes(a.id)).length;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 72 }}
      className="fixed left-0 top-0 h-screen bg-background-card border-r border-gray-700/50 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-green-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold text-white whitespace-nowrap">Energy Monitor</h1>
                <p className="text-xs text-gray-400 whitespace-nowrap">Reflow Oven</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showBadge = item.id === 'alerts' && activeAlertCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {showBadge && (
                <span className={`${sidebarOpen ? 'ml-auto' : 'absolute -top-1 -right-1'} min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-xs font-medium bg-red-500 text-white`}>
                  {activeAlertCount}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                />
              )}

              {/* Tooltip for collapsed state */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-700">
                  {item.label}
                  {showBadge && ` (${activeAlertCount})`}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-background-card border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
