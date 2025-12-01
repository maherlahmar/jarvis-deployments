import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function StatCard({ title, value, unit, change, changeLabel, icon: Icon, color = 'primary', delay = 0 }) {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'from-green-500/20 to-green-600/10 border-green-500/30';
      case 'yellow':
        return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 'red':
        return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'blue':
        return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
      default:
        return 'from-primary-500/20 to-primary-600/10 border-primary-500/30';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      case 'blue': return 'text-blue-400';
      default: return 'text-primary-400';
    }
  };

  const renderChange = () => {
    if (change === undefined || change === null) return null;

    const isPositive = change > 0;
    const isNegative = change < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    return (
      <div className={`stat-change ${isPositive ? 'positive' : isNegative ? 'negative' : 'text-gray-400'}`}>
        <TrendIcon className="w-4 h-4" />
        <span>{Math.abs(change).toFixed(1)}%</span>
        {changeLabel && <span className="text-gray-500 ml-1">{changeLabel}</span>}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`stat-card bg-gradient-to-br ${getColorClasses()} border`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="stat-value">{value}</span>
            {unit && <span className="text-lg text-gray-400">{unit}</span>}
          </div>
          {renderChange()}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-black/20 ${getIconColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
