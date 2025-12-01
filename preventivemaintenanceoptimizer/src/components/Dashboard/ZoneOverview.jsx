import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ZONES } from '../../services/dataProcessor';

export default function ZoneOverview({ healthScores, zoneTemperatures }) {
  if (!healthScores) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-success-500';
    if (score >= 75) return 'bg-primary-500';
    if (score >= 60) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const getScoreTextColor = (score) => {
    if (score >= 90) return 'text-success-600 dark:text-success-400';
    if (score >= 75) return 'text-primary-600 dark:text-primary-400';
    if (score >= 60) return 'text-warning-600 dark:text-warning-400';
    return 'text-danger-600 dark:text-danger-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Zone Health Overview
        </h3>
        <Link
          to="/zones"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
        >
          Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ZONES.map((zone, index) => {
          const score = healthScores[`zone${zone.id}`]?.overall || 0;
          const temps = zoneTemperatures?.[`zone${zone.id}`];
          const avgTemp = temps ? ((temps.upper.avg + temps.lower.avg) / 2).toFixed(0) : '-';

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {zone.name}
                </span>
                <span className={`text-xs font-medium capitalize px-1.5 py-0.5 rounded
                  ${zone.type === 'preheat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                  ${zone.type === 'soak' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                  ${zone.type === 'reflow' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                  ${zone.type === 'peak' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                  ${zone.type === 'cooling' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : ''}
                `}>
                  {zone.type}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className={`text-lg font-bold ${getScoreTextColor(score)}`}>
                    {score}%
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {avgTemp}°C avg
                  </p>
                </div>
                <div className="w-2 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <motion.div
                    className={`w-full ${getScoreColor(score)}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${score}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    style={{ marginTop: `${100 - score}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Excellent (90+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Good (75-89)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-warning-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Fair (60-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-danger-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Poor (&lt;60)</span>
        </div>
      </div>
    </motion.div>
  );
}
