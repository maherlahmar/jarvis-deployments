import { motion } from 'framer-motion';
import clsx from 'clsx';

function StatCard({ title, value, unit, icon: Icon, trend, trendValue, status, className }) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'good':
      case 'excellent':
        return 'from-success-500/20 to-success-500/5 border-success-500/30';
      case 'warning':
      case 'fair':
        return 'from-warning-500/20 to-warning-500/5 border-warning-500/30';
      case 'danger':
      case 'critical':
        return 'from-danger-500/20 to-danger-500/5 border-danger-500/30';
      default:
        return 'from-primary-500/20 to-primary-500/5 border-primary-500/30';
    }
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success-500';
    if (trend === 'down') return 'text-danger-500';
    return 'text-slate-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-5',
        getStatusColor(),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-100">{value}</span>
            {unit && <span className="text-lg text-slate-400">{unit}</span>}
          </div>
          {trendValue && (
            <p className={clsx('text-sm mt-1 flex items-center gap-1', getTrendColor())}>
              <span>{getTrendIcon()}</span>
              <span>{trendValue}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/50">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
        )}
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
    </motion.div>
  );
}

export default StatCard;
