import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  Layers,
  Clock,
  TrendingUp,
  AlertTriangle,
  Wrench,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import useStore from '../store/useStore';
import StatCard from '../components/StatCard';
import HealthGauge from '../components/HealthGauge';
import ReactorStatus from '../components/ReactorStatus';
import ComponentHealthCard from '../components/ComponentHealthCard';

function Dashboard() {
  const {
    furnaceStatus,
    overallHealth,
    componentHealth,
    throughputData,
    oeeData,
    alarms,
    recommendations,
    unacknowledgedCount
  } = useStore();

  const recentThroughput = useMemo(() => {
    return throughputData.slice(-7);
  }, [throughputData]);

  const recentOEE = useMemo(() => {
    return oeeData.slice(-14);
  }, [oeeData]);

  const todayStats = useMemo(() => {
    const today = throughputData[throughputData.length - 1];
    const yesterday = throughputData[throughputData.length - 2];
    if (!today || !yesterday) return null;

    return {
      wafers: today.wafersProcessed,
      wafersTrend: today.wafersProcessed > yesterday.wafersProcessed ? 'up' : 'down',
      wafersDiff: Math.abs(today.wafersProcessed - yesterday.wafersProcessed),
      uptime: today.uptime,
      yield: today.yield
    };
  }, [throughputData]);

  const activeAlarms = useMemo(() => {
    return alarms.filter(a => !a.resolved).slice(0, 5);
  }, [alarms]);

  const criticalComponents = useMemo(() => {
    return componentHealth.filter(c => c.status === 'critical' || c.status === 'warning');
  }, [componentHealth]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Real-time monitoring of A400 DUO vertical furnace</p>
        </div>
        <div className="flex items-center gap-3">
          {unacknowledgedCount > 0 && (
            <Link
              to="/alarms"
              className="flex items-center gap-2 px-4 py-2 bg-danger-500/20 border border-danger-500/30 rounded-lg text-danger-500 hover:bg-danger-500/30 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{unacknowledgedCount} Active Alarms</span>
            </Link>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wafers Today"
          value={todayStats?.wafers || '--'}
          icon={Layers}
          trend={todayStats?.wafersTrend}
          trendValue={`${todayStats?.wafersDiff || 0} vs yesterday`}
          status="primary"
        />
        <StatCard
          title="Uptime"
          value={todayStats?.uptime?.toFixed(1) || '--'}
          unit="%"
          icon={Clock}
          status={todayStats?.uptime >= 90 ? 'success' : 'warning'}
        />
        <StatCard
          title="Yield Rate"
          value={todayStats?.yield?.toFixed(1) || '--'}
          unit="%"
          icon={Target}
          status={todayStats?.yield >= 98 ? 'success' : 'warning'}
        />
        <StatCard
          title="OEE"
          value={recentOEE[recentOEE.length - 1]?.oee?.toFixed(1) || '--'}
          unit="%"
          icon={Zap}
          status={recentOEE[recentOEE.length - 1]?.oee >= 85 ? 'success' : 'warning'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reactor Status - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dual Reactor Status */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Reactor Status</h2>
              <Link
                to="/performance"
                className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReactorStatus
                reactor={furnaceStatus?.reactorA}
                name="Reactor A"
              />
              <ReactorStatus
                reactor={furnaceStatus?.reactorB}
                name="Reactor B"
              />
            </div>
          </div>

          {/* OEE Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold text-slate-100">OEE Trend (14 Days)</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="text-slate-400">OEE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                  <span className="text-slate-400">Availability</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-warning-500" />
                  <span className="text-slate-400">Performance</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recentOEE}>
                    <defs>
                      <linearGradient id="oeeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis
                      domain={[70, 100]}
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="oee"
                      name="OEE"
                      stroke="#3b82f6"
                      fill="url(#oeeGradient)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="availability"
                      name="Availability"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      name="Performance"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Daily Throughput Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="font-semibold text-slate-100">Daily Wafer Throughput (7 Days)</h3>
            </div>
            <div className="card-body">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recentThroughput}>
                    <defs>
                      <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="wafersProcessed"
                      name="Wafers"
                      stroke="#22c55e"
                      fill="url(#throughputGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Health & Alerts */}
        <div className="space-y-6">
          {/* Overall Health Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="font-semibold text-slate-100">System Health</h3>
            </div>
            <div className="card-body flex flex-col items-center">
              <HealthGauge
                value={overallHealth?.score || 0}
                status={overallHealth?.status}
              />
              <Link
                to="/health"
                className="mt-4 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                View Component Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Critical Components */}
          {criticalComponents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-slate-100">Attention Required</h3>
                <span className="text-xs text-warning-500 bg-warning-500/20 px-2 py-0.5 rounded">
                  {criticalComponents.length} items
                </span>
              </div>
              <div className="p-4 space-y-3">
                {criticalComponents.slice(0, 3).map((component) => (
                  <ComponentHealthCard
                    key={component.id}
                    component={component}
                  />
                ))}
                {criticalComponents.length > 3 && (
                  <Link
                    to="/health"
                    className="block text-center text-sm text-primary-400 hover:text-primary-300 py-2"
                  >
                    View all {criticalComponents.length} components
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Maintenance Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-slate-100">Maintenance Recommendations</h3>
                <Wrench className="w-4 h-4 text-slate-400" />
              </div>
              <div className="p-4 space-y-3">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${rec.priority === 1 ? 'bg-danger-500/20 text-danger-500' :
                          rec.priority === 2 ? 'bg-warning-500/20 text-warning-500' :
                          'bg-primary-500/20 text-primary-400'}
                      `}>
                        {rec.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 line-clamp-2">{rec.action}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Est. downtime: {rec.estimatedDowntime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  to="/maintenance"
                  className="block text-center text-sm text-primary-400 hover:text-primary-300 py-2"
                >
                  View all recommendations <ArrowRight className="w-4 h-4 inline" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Recent Alarms */}
          {activeAlarms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-slate-100">Active Alarms</h3>
                <AlertTriangle className="w-4 h-4 text-warning-500" />
              </div>
              <div className="p-4 space-y-2">
                {activeAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`
                      p-3 rounded-lg border-l-2
                      ${alarm.severity === 'critical' ? 'bg-danger-500/10 border-danger-500' :
                        alarm.severity === 'warning' ? 'bg-warning-500/10 border-warning-500' :
                        'bg-primary-500/10 border-primary-500'}
                    `}
                  >
                    <p className="text-sm font-medium text-slate-200">{alarm.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{alarm.reactor}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(alarm.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  to="/alarms"
                  className="block text-center text-sm text-primary-400 hover:text-primary-300 py-2"
                >
                  View all alarms <ArrowRight className="w-4 h-4 inline" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
