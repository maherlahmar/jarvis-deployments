import { motion } from 'framer-motion';
import {
  Zap,
  DollarSign,
  Clock,
  Activity,
  Gauge,
  Package,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import useStore from '../store/useStore';
import StatCard from './StatCard';
import { EnergyChart, ZoneHeatmap, HourlyPatternChart } from './charts';
import AlertsPanel from './AlertsPanel';

function OverviewPanel() {
  const { energyMetrics, dailyMetrics, hourlyMetrics, zoneAnalysis, alerts, dismissedAlerts } = useStore();

  if (!energyMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading metrics...</p>
      </div>
    );
  }

  const activeAlertCount = alerts.filter(a => !dismissedAlerts.includes(a.id)).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cumulative Energy Consumption"
          value={energyMetrics.totalEnergyConsumed.toFixed(0)}
          unit="kWh"
          icon={Zap}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Energy Cost"
          value={`$${energyMetrics.totalEnergyCost.toFixed(2)}`}
          icon={DollarSign}
          color="green"
          delay={1}
        />
        <StatCard
          title="Idle Time"
          value={energyMetrics.idlePercentage.toFixed(1)}
          unit="%"
          icon={Clock}
          color={energyMetrics.idlePercentage > 10 ? 'red' : energyMetrics.idlePercentage > 5 ? 'yellow' : 'green'}
          delay={2}
        />
        <StatCard
          title="Active Alerts"
          value={activeAlertCount}
          icon={AlertTriangle}
          color={activeAlertCount > 3 ? 'red' : activeAlertCount > 0 ? 'yellow' : 'green'}
          delay={3}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Power"
          value={energyMetrics.avgPower.toFixed(1)}
          unit="kW"
          icon={Activity}
          delay={4}
        />
        <StatCard
          title="Power Factor"
          value={(energyMetrics.avgPowerFactor * 100).toFixed(1)}
          unit="%"
          icon={Gauge}
          color={energyMetrics.avgPowerFactor < 0.90 ? 'yellow' : 'green'}
          delay={5}
        />
        <StatCard
          title="Boards Produced"
          value={energyMetrics.totalBoardsProduced.toLocaleString()}
          icon={Package}
          color="blue"
          delay={6}
        />
        <StatCard
          title="Energy per Board"
          value={energyMetrics.energyPerBoard.toFixed(3)}
          unit="kWh"
          icon={TrendingUp}
          delay={7}
        />
      </div>

      {/* Potential Savings Banner */}
      {energyMetrics.totalPotentialSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-500/20 to-primary-500/20 rounded-xl border border-green-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/30">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Potential Savings: ${energyMetrics.totalPotentialSavings.toFixed(2)}
                </h3>
                <p className="text-gray-300 mt-1">
                  Based on idle time reduction (${energyMetrics.potentialIdleSavings.toFixed(2)})
                  and power factor improvement (${energyMetrics.potentialPFSavings.toFixed(2)})
                </p>
              </div>
            </div>
            <button className="btn btn-primary">
              View Recommendations
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnergyChart data={dailyMetrics} showDaily />
        <AlertsPanel compact />
      </div>

      {/* Zone Heatmap */}
      <ZoneHeatmap zoneAnalysis={zoneAnalysis} />

      {/* Hourly Pattern */}
      <HourlyPatternChart data={hourlyMetrics} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h4 className="text-white font-semibold mb-4">Power Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Max Power</span>
              <span className="text-white font-medium">{energyMetrics.maxPower.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Min Power</span>
              <span className="text-white font-medium">{energyMetrics.minPower.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Power</span>
              <span className="text-white font-medium">{energyMetrics.avgPower.toFixed(1)} kW</span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className="progress-fill bg-primary-500"
                style={{ width: `${(energyMetrics.avgPower / energyMetrics.maxPower) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h4 className="text-white font-semibold mb-4">Efficiency Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Power Factor</span>
              <span className={`font-medium ${
                energyMetrics.avgPowerFactor >= 0.95 ? 'text-green-400' :
                energyMetrics.avgPowerFactor >= 0.90 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {(energyMetrics.avgPowerFactor * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Target PF</span>
              <span className="text-gray-300">95.0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">PF Gap</span>
              <span className={`font-medium ${
                energyMetrics.avgPowerFactor >= 0.95 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {((0.95 - energyMetrics.avgPowerFactor) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className="progress-fill bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: `${energyMetrics.avgPowerFactor * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h4 className="text-white font-semibold mb-4">Waste Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Idle Energy Waste</span>
              <span className="text-red-400 font-medium">{energyMetrics.idleEnergyWaste.toFixed(1)} kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Wasted Cost</span>
              <span className="text-red-400 font-medium">${energyMetrics.wastedEnergyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Idle Instances</span>
              <span className="text-white font-medium">
                {Math.round(energyMetrics.idlePercentage * energyMetrics.dataPointCount / 100)}
              </span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className="progress-fill bg-red-500"
                style={{ width: `${Math.min(energyMetrics.idlePercentage * 5, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default OverviewPanel;
