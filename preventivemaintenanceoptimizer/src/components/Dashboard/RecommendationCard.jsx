import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const priorityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-danger-50 dark:bg-danger-900/20',
    border: 'border-danger-200 dark:border-danger-800',
    text: 'text-danger-700 dark:text-danger-400',
    badge: 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300'
  },
  high: {
    icon: AlertCircle,
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    border: 'border-warning-200 dark:border-warning-800',
    text: 'text-warning-700 dark:text-warning-400',
    badge: 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300'
  },
  medium: {
    icon: Info,
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    border: 'border-primary-200 dark:border-primary-800',
    text: 'text-primary-700 dark:text-primary-400',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
  },
  low: {
    icon: CheckCircle,
    bg: 'bg-success-50 dark:bg-success-900/20',
    border: 'border-success-200 dark:border-success-800',
    text: 'text-success-700 dark:text-success-400',
    badge: 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300'
  }
};

export default function RecommendationCard({ recommendations }) {
  const topRecommendations = recommendations?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Recommendations
        </h3>
        <Link
          to="/maintenance"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {topRecommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-500" />
          <p>No urgent recommendations</p>
          <p className="text-sm mt-1">Equipment is operating within normal parameters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topRecommendations.map((rec, index) => {
            const config = priorityConfig[rec.priority];
            const Icon = config.icon;

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${config.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {rec.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {rec.description}
                    </p>
                    {rec.estimatedTime && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Est. time: {rec.estimatedTime}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
