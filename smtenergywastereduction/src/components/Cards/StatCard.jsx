import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon: Icon,
  color = 'primary',
  subtitle
}) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/5 border-primary-500/30',
    success: 'from-green-500/20 to-green-600/5 border-green-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
    danger: 'from-red-500/20 to-red-600/5 border-red-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30'
  };

  const iconColors = {
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={14} />;
    if (trend === 'down') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className={`card bg-gradient-to-br ${colors[color]} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconColors[color]}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-white">{value}</span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
        <p className="text-sm text-slate-400 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
