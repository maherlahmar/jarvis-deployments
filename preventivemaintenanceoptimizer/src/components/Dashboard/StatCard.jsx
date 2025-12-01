import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, subValue, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
    danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400'
  };

  const trendColors = {
    up: 'text-success-500',
    down: 'text-danger-500',
    stable: 'text-gray-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend.direction]}`}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subValue && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}
