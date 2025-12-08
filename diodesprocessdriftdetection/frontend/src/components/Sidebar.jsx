import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  AlertTriangle,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu
} from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/process', icon: Activity, label: 'Process Monitor' },
  { path: '/drift', icon: TrendingUp, label: 'Drift Analysis' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { path: '/batches', icon: Package, label: 'Batch Tracking' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, getAlertCounts } = useStore();
  const alertCounts = getAlertCounts();

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className={clsx(
          'h-16 flex items-center border-b border-slate-200 dark:border-slate-700',
          sidebarCollapsed ? 'justify-center px-2' : 'px-4'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-sm">Diodes</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Process Drift Detection</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100',
                      sidebarCollapsed && 'justify-center'
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.path === '/alerts' && alertCounts.total > 0 && (
                    <span className={clsx(
                      'flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium text-white',
                      alertCounts.critical > 0 ? 'bg-danger-500' : 'bg-warning-500',
                      sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                    )}>
                      {alertCounts.total}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
