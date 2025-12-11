import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Heart,
  Wrench,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Flame
} from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/performance', icon: Activity, label: 'Performance' },
  { path: '/health', icon: Heart, label: 'Health' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/alarms', icon: AlertTriangle, label: 'Alarms' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' }
];

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, unacknowledgedCount, furnaceConfig } = useStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-slate-800/50 backdrop-blur-md border-r border-slate-700/50 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <h1 className="font-bold text-slate-100 whitespace-nowrap">{furnaceConfig.name}</h1>
                <p className="text-xs text-slate-400 whitespace-nowrap">Vertical Furnace</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const showBadge = path === '/alarms' && unacknowledgedCount > 0;

          return (
            <NavLink
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
              )}
            >
              <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-primary-400')} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {showBadge && (
                <span className={clsx(
                  'absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-danger-500 rounded-full',
                  sidebarCollapsed ? 'top-0 right-0' : 'right-3'
                )}>
                  {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
                </span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-slate-100 text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-slate-700/50">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

function Header() {
  const { furnaceStatus, lastUpdate, unacknowledgedCount, furnaceConfig } = useStore();

  const formatTime = (isoString) => {
    if (!isoString) return '--:--:--';
    return new Date(isoString).toLocaleTimeString();
  };

  const getSystemStatusColor = () => {
    if (!furnaceStatus) return 'bg-slate-500';
    return furnaceStatus.systemStatus === 'online' ? 'bg-success-500' : 'bg-danger-500';
  };

  return (
    <header className="h-16 bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={clsx('w-2.5 h-2.5 rounded-full animate-pulse', getSystemStatusColor())} />
          <span className="text-sm font-medium text-slate-300">
            {furnaceStatus?.systemStatus === 'online' ? 'System Online' : 'System Offline'}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="text-sm text-slate-400">
          S/N: <span className="text-slate-300 font-mono">{furnaceConfig.serialNumber}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-400">
          Last update: <span className="text-slate-300 font-mono">{formatTime(lastUpdate)}</span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          {unacknowledgedCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 text-[10px] font-bold text-white bg-danger-500 rounded-full flex items-center justify-center">
              {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
            </span>
          )}
        </button>

        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

function Layout({ children }) {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col"
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

export default Layout;
