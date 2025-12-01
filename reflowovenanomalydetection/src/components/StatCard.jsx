import { motion } from 'framer-motion';
import clsx from 'clsx';

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  change,
  changeLabel,
  variant = 'default',
  className,
}) {
  const variants = {
    default: 'border-dark-700/50',
    success: 'border-success-500/30 bg-success-500/5',
    warning: 'border-warning-500/30 bg-warning-500/5',
    danger: 'border-danger-500/30 bg-danger-500/5',
    info: 'border-primary-500/30 bg-primary-500/5',
  };

  const iconVariants = {
    default: 'bg-dark-800 text-dark-300',
    success: 'bg-success-500/20 text-success-400',
    warning: 'bg-warning-500/20 text-warning-400',
    danger: 'bg-danger-500/20 text-danger-400',
    info: 'bg-primary-500/20 text-primary-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('stat-card', variants[variant], className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-dark-400">{unit}</span>}
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={clsx('text-xs font-medium', {
                  'text-success-400': change > 0,
                  'text-danger-400': change < 0,
                  'text-dark-400': change === 0,
                })}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-dark-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-lg', iconVariants[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
