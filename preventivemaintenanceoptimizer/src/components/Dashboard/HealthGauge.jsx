import { motion } from 'framer-motion';

export default function HealthGauge({ score, grade, status }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const statusColors = {
    excellent: { stroke: '#22c55e', bg: 'bg-success-50 dark:bg-success-900/20' },
    good: { stroke: '#3b82f6', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    fair: { stroke: '#f59e0b', bg: 'bg-warning-50 dark:bg-warning-900/20' },
    poor: { stroke: '#ef4444', bg: 'bg-danger-50 dark:bg-danger-900/20' }
  };

  const colors = statusColors[status] || statusColors.good;

  return (
    <div className={`card p-6 ${colors.bg}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Overall Equipment Health
      </h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              {score}%
            </motion.span>
            <span
              className="text-lg font-semibold mt-1"
              style={{ color: colors.stroke }}
            >
              Grade {grade}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize"
          style={{ backgroundColor: `${colors.stroke}20`, color: colors.stroke }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
