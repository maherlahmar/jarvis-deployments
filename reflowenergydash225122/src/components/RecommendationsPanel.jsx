import { motion } from 'framer-motion';
import {
  Lightbulb,
  DollarSign,
  Clock,
  Wrench,
  Settings,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import useStore from '../store/useStore';

const categoryIcons = {
  scheduling: Clock,
  equipment: Wrench,
  process: Settings,
  automation: TrendingUp,
  maintenance: Wrench,
};

const impactColors = {
  high: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  low: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
};

function RecommendationCard({ recommendation, index }) {
  const colors = impactColors[recommendation.impact] || impactColors.medium;
  const CategoryIcon = categoryIcons[recommendation.category] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-5 rounded-xl border ${colors.bg} ${colors.border} hover:scale-[1.02] transition-transform cursor-pointer group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
          <CategoryIcon className={`w-6 h-6 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-white font-semibold">{recommendation.title}</h4>
            <span className={`badge ${colors.text} ${colors.bg} border ${colors.border}`}>
              {recommendation.impact} impact
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-4">{recommendation.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {recommendation.estimatedSavings > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">
                    ${recommendation.estimatedSavings.toFixed(2)} savings
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-500 capitalize bg-gray-700/50 px-2 py-1 rounded">
                {recommendation.category}
              </span>
            </div>

            <button className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecommendationsPanel() {
  const { recommendations, energyMetrics } = useStore();

  const totalPotentialSavings = recommendations.reduce(
    (acc, r) => acc + (r.estimatedSavings || 0),
    0
  );

  const highImpactCount = recommendations.filter(r => r.impact === 'high').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Lightbulb className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{recommendations.length}</p>
              <p className="text-sm text-gray-400">Recommendations</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">${totalPotentialSavings.toFixed(0)}</p>
              <p className="text-sm text-gray-400">Potential Savings</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 border"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{highImpactCount}</p>
              <p className="text-sm text-gray-400">High Impact</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Wins */}
      {energyMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Quick Efficiency Wins</h3>
            <p className="text-sm text-gray-400 mt-1">
              Immediate actions based on your current data
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Reduce idle time</p>
                  <p className="text-sm text-gray-400">
                    Currently at {energyMetrics.idlePercentage?.toFixed(1)}% - target &lt;5%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Improve power factor</p>
                  <p className="text-sm text-gray-400">
                    Currently at {((energyMetrics.avgPowerFactor || 0) * 100).toFixed(1)}% - target 95%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Optimize energy per board</p>
                  <p className="text-sm text-gray-400">
                    Currently {energyMetrics.energyPerBoard?.toFixed(3)} kWh/board
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Monitor zone temperatures</p>
                  <p className="text-sm text-gray-400">
                    Check zones with high variance for maintenance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Optimization Recommendations</h3>
          <p className="text-sm text-gray-400 mt-1">
            Prioritized actions to reduce energy waste
          </p>
        </div>
        <div className="card-body space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No recommendations available</p>
              <p className="text-sm mt-2">Your system is operating optimally</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <RecommendationCard key={rec.id} recommendation={rec} index={index} />
            ))
          )}
        </div>
      </div>

      {/* Implementation Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Implementation Priority</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">High Impact - Implement First</p>
                <p className="text-sm text-gray-400">
                  Focus on scheduling optimizations and standby automation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Medium Impact - Plan for Next Quarter</p>
                <p className="text-sm text-gray-400">
                  Power factor correction and process optimizations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Maintenance Items - Schedule Appropriately</p>
                <p className="text-sm text-gray-400">
                  Zone calibration and equipment maintenance
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default RecommendationsPanel;
