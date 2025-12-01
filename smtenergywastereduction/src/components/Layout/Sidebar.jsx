import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Clock,
  Gauge,
  Settings,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import useStore from '../../store/useStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/energy', label: 'Energy Monitor', icon: Zap },
  { path: '/zones', label: 'Zone Analysis', icon: Thermometer },
  { path: '/alerts', label: 'Waste Alerts', icon: AlertTriangle },
  { path: '/trends', label: 'Efficiency Trends', icon: TrendingUp },
  { path: '/idle', label: 'Idle Detection', icon: Clock },
  { path: '/power-factor', label: 'Power Factor', icon: Gauge },
  { path: '/reports', label: 'Reports', icon: FileBarChart }
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, dashboardSummary } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-white">SMT Energy</h1>
              <p className="text-xs text-slate-400">Waste Monitor</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Status Indicator */}
      {sidebarOpen && dashboardSummary && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-slate-300">System Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Power</span>
              <p className="text-white font-medium">{dashboardSummary.currentPower} kW</p>
            </div>
            <div>
              <span className="text-slate-500">PF</span>
              <p className="text-white font-medium">{dashboardSummary.powerFactor}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-3' : ''}`
            }
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Alert Badge */}
      {dashboardSummary && dashboardSummary.activeAlerts > 0 && (
        <div className={`mx-3 mt-6 ${sidebarOpen ? 'px-4 py-3' : 'p-2'}`}>
          <div className={`rounded-lg bg-red-500/10 border border-red-500/30 ${sidebarOpen ? 'p-3' : 'p-2 text-center'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              {sidebarOpen && (
                <span className="text-sm text-red-400 font-medium">
                  {dashboardSummary.activeAlerts} Active Alerts
                </span>
              )}
            </div>
            {sidebarOpen && (
              <p className="text-xs text-slate-400 mt-1">
                Est. savings: ${parseFloat(dashboardSummary.costSavings).toFixed(0)}/day
              </p>
            )}
          </div>
        </div>
      )}

      {/* Settings Link */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-3' : ''}`
          }
        >
          <Settings size={20} />
          {sidebarOpen && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
