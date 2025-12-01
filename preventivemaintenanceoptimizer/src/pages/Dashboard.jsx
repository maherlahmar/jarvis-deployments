import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  AlertTriangle,
  Thermometer,
  Wind,
  Gauge,
  CircuitBoard,
  Upload
} from 'lucide-react';
import useStore from '../store/useStore';
import StatCard from '../components/Dashboard/StatCard';
import HealthGauge from '../components/Dashboard/HealthGauge';
import RecommendationCard from '../components/Dashboard/RecommendationCard';
import ZoneOverview from '../components/Dashboard/ZoneOverview';

export default function Dashboard() {
  const { processedData, isLoading } = useStore();

  if (!processedData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 max-w-lg"
        >
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Upload Equipment Data
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Upload your reflow oven CSV data to get started with preventive maintenance
            analysis and recommendations.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Data:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>- Zone temperatures (upper/lower/blower)</li>
              <li>- Power metrics (energy, current, power factor)</li>
              <li>- Flow rate and O2 concentration</li>
              <li>- Production data and alarms</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  const { summary, statistics, anomalies, recommendations, healthScores, zoneTemperatures, energyAnalysis } = processedData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Analyzing {summary.totalRecords.toLocaleString()} records from{' '}
          {summary.dateRange?.start ? new Date(summary.dateRange.start).toLocaleDateString() : 'N/A'}
        </p>
      </motion.div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Overall Health"
          value={`${summary.overallHealth.score}%`}
          subValue={`Grade ${summary.overallHealth.grade}`}
          color={summary.overallHealth.status === 'excellent' ? 'success' :
                 summary.overallHealth.status === 'good' ? 'primary' :
                 summary.overallHealth.status === 'fair' ? 'warning' : 'danger'}
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={anomalies?.summary?.total || 0}
          subValue={`${anomalies?.summary?.critical || 0} critical`}
          color={anomalies?.summary?.critical > 0 ? 'danger' : 'success'}
        />
        <StatCard
          icon={Zap}
          label="Power Factor"
          value={`${(statistics?.power?.avgPowerFactor * 100).toFixed(1)}%`}
          subValue="Target: 95%+"
          color={statistics?.power?.avgPowerFactor >= 0.95 ? 'success' :
                 statistics?.power?.avgPowerFactor >= 0.85 ? 'warning' : 'danger'}
        />
        <StatCard
          icon={CircuitBoard}
          label="Boards Produced"
          value={statistics?.production?.totalBoards?.toLocaleString() || '0'}
          subValue={`${energyAnalysis?.energyPerBoard || '0'} kWh/board`}
          color="primary"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge */}
        <div className="lg:col-span-1">
          <HealthGauge
            score={summary.overallHealth.score}
            grade={summary.overallHealth.grade}
            status={summary.overallHealth.status}
          />
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2">
          <RecommendationCard recommendations={recommendations} />
        </div>
      </div>

      {/* Zone Overview */}
      <ZoneOverview healthScores={healthScores} zoneTemperatures={zoneTemperatures} />

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wind}
          label="Flow Rate"
          value={`${statistics?.flow?.avgFlowRate?.toFixed(1) || '0'} L/min`}
          subValue={`${statistics?.flow?.flowStability?.toFixed(1) || '0'}% stability`}
          color={statistics?.flow?.flowStability >= 90 ? 'success' : 'warning'}
        />
        <StatCard
          icon={Gauge}
          label="O2 Concentration"
          value={`${statistics?.o2?.avgO2?.toFixed(0) || '0'} ppm`}
          subValue="Target: <300 ppm"
          color={statistics?.o2?.avgO2 <= 300 ? 'success' :
                 statistics?.o2?.avgO2 <= 500 ? 'warning' : 'danger'}
        />
        <StatCard
          icon={Zap}
          label="Energy Consumed"
          value={`${energyAnalysis?.totalEnergy || '0'} kWh`}
          subValue={`${energyAnalysis?.efficiency || '0'}% efficiency`}
          color="primary"
        />
        <StatCard
          icon={Thermometer}
          label="Avg Peak Temp"
          value={`${zoneTemperatures?.zone8?.upper?.avg?.toFixed(0) || '0'}°C`}
          subValue="Zone 8 (Peak)"
          color="warning"
        />
      </div>

      {/* Energy Recommendations */}
      {energyAnalysis?.recommendations?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Energy Optimization Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {energyAnalysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">
                  Potential: {rec.potential}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
