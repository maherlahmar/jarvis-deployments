import { useEffect } from 'react';
import {
  Zap,
  Battery,
  Gauge,
  Package,
  AlertTriangle,
  TrendingUp,
  Leaf,
  DollarSign,
  Flame,
  Clock
} from 'lucide-react';
import useStore from '../store/useStore';
import StatCard from '../components/Cards/StatCard';
import AlertCard from '../components/Cards/AlertCard';
import PowerChart from '../components/Charts/PowerChart';
import ZoneHeatmap from '../components/Charts/ZoneHeatmap';
import EnergyBreakdownChart from '../components/Charts/EnergyBreakdownChart';
import WeeklyTrendChart from '../components/Charts/WeeklyTrendChart';
import EnergyGauge from '../components/Charts/EnergyGauge';

export default function Dashboard() {
  const {
    dashboardSummary,
    hourlyData,
    wasteAlerts,
    zoneEfficiency,
    energyBreakdown,
    weeklyTrend,
    productionMetrics,
    isLoading,
    initializeData,
    startRealtimeSimulation,
    stopRealtimeSimulation,
    getLatestReading,
    dismissAlert
  } = useStore();

  useEffect(() => {
    initializeData();
    startRealtimeSimulation();
    return () => stopRealtimeSimulation();
  }, []);

  const latestReading = getLatestReading();

  if (isLoading || !dashboardSummary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading energy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Energy Dashboard</h1>
          <p className="text-slate-400 mt-1">Reflow oven energy analysis and waste detection</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Equipment Operating</span>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard
          title="Current Power"
          value={dashboardSummary.currentPower}
          unit="kW"
          icon={Zap}
          color="primary"
          trend="up"
          trendValue="+2.3%"
        />
        <StatCard
          title="Daily Energy"
          value={dashboardSummary.dailyEnergy}
          unit="kWh"
          icon={Battery}
          color="cyan"
          trend="down"
          trendValue="-5.1%"
        />
        <StatCard
          title="Power Factor"
          value={dashboardSummary.powerFactor}
          unit=""
          icon={Gauge}
          color={parseFloat(dashboardSummary.powerFactor) >= 0.92 ? 'success' : 'warning'}
          subtitle="Target: 0.95"
        />
        <StatCard
          title="Boards Today"
          value={dashboardSummary.boardsToday}
          unit="units"
          icon={Package}
          color="success"
          trend="up"
          trendValue="+12"
        />
        <StatCard
          title="Active Alerts"
          value={dashboardSummary.activeAlerts}
          unit=""
          icon={AlertTriangle}
          color={parseInt(dashboardSummary.activeAlerts) > 3 ? 'danger' : 'warning'}
        />
      </div>

      {/* Waste metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10">
            <Flame className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dashboardSummary.wastedEnergy} <span className="text-sm text-slate-400">kWh</span></p>
            <p className="text-sm text-slate-400">Wasted Energy</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">${dashboardSummary.costSavings}</p>
            <p className="text-sm text-slate-400">Potential Savings/day</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dashboardSummary.co2Saved} <span className="text-sm text-slate-400">kg</span></p>
            <p className="text-sm text-slate-400">CO2 Reducible</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dashboardSummary.idleTime} <span className="text-sm text-slate-400">min</span></p>
            <p className="text-sm text-slate-400">Idle Time Today</p>
          </div>
        </div>
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power consumption chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Power Consumption</h3>
            <span className="text-xs text-slate-400">Last 24 hours</span>
          </div>
          <div className="card-body">
            <PowerChart data={hourlyData} height={280} />
          </div>
        </div>

        {/* Real-time gauges */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Real-time Metrics</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <EnergyGauge
                value={parseFloat(dashboardSummary.currentPower)}
                max={50}
                label="Power"
                unit="kW"
                color="primary"
                size="sm"
              />
              <EnergyGauge
                value={parseFloat(dashboardSummary.efficiency)}
                max={100}
                label="Efficiency"
                unit="%"
                color="success"
                size="sm"
              />
              <EnergyGauge
                value={parseFloat(dashboardSummary.powerFactor) * 100}
                max={100}
                label="Power Factor"
                unit="%"
                color="cyan"
                size="sm"
              />
              <EnergyGauge
                value={parseFloat(dashboardSummary.avgZoneTemp)}
                max={250}
                label="Avg Temp"
                unit="°C"
                color="warning"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Zone heatmap and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone heatmap */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Zone Temperature Profile</h3>
          </div>
          <div className="card-body">
            {latestReading && <ZoneHeatmap zones={latestReading.zones} />}
          </div>
        </div>

        {/* Active alerts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <span className="badge badge-danger">{wasteAlerts.length} active</span>
          </div>
          <div className="card-body space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
            {wasteAlerts.slice(0, 5).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                compact
                onDismiss={dismissAlert}
              />
            ))}
            {wasteAlerts.length === 0 && (
              <p className="text-center text-slate-500 py-8">No active alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row - Energy breakdown and weekly trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Energy Breakdown</h3>
          </div>
          <div className="card-body">
            <EnergyBreakdownChart data={energyBreakdown} height={250} />
          </div>
        </div>

        {/* Weekly trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Weekly Trend</h3>
          </div>
          <div className="card-body">
            <WeeklyTrendChart data={weeklyTrend} height={250} />
          </div>
        </div>
      </div>

      {/* Production efficiency */}
      {productionMetrics && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Production Efficiency</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{productionMetrics.kWhPerBoard}</p>
                <p className="text-sm text-slate-400 mt-1">kWh per Board</p>
                <p className="text-xs text-slate-500">Target: {productionMetrics.targetKWhPerBoard}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{productionMetrics.efficiency}%</p>
                <p className="text-sm text-slate-400 mt-1">Energy Efficiency</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-400">{productionMetrics.uptime}%</p>
                <p className="text-sm text-slate-400 mt-1">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{productionMetrics.oee}%</p>
                <p className="text-sm text-slate-400 mt-1">OEE</p>
              </div>
            </div>

            {/* Efficiency bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Overall Efficiency</span>
                <span className="text-sm font-medium text-white">{productionMetrics.efficiency}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill bg-gradient-to-r from-primary-500 to-cyan-500"
                  style={{ width: `${productionMetrics.efficiency}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
