import { useMemo } from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import useStore from '../store/useStore';
import { formatNumber, formatDeviation } from '../utils/formatters';

function ParameterCard({ paramKey, onClick }) {
  const { parameters, readings, selectedParameter } = useStore();

  const config = parameters[paramKey];
  const isSelected = selectedParameter === paramKey;

  const stats = useMemo(() => {
    if (!readings.length) return null;

    const values = readings.slice(-50).map(r => r.parameters?.[paramKey]).filter(v => v !== undefined);
    if (!values.length) return null;

    const current = values[values.length - 1];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const deviation = current - config.target;
    const deviationPercent = (deviation / config.target) * 100;

    let trend = 0;
    if (values.length >= 10) {
      const recent = values.slice(-5).reduce((a, b) => a + b, 0) / 5;
      const earlier = values.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
      trend = recent - earlier;
    }

    const outOfControl = current > config.ucl || current < config.lcl;
    const outOfSpec = current > config.usl || current < config.lsl;

    let status = 'normal';
    if (outOfSpec) status = 'critical';
    else if (outOfControl) status = 'warning';

    return {
      current,
      mean,
      min,
      max,
      deviation,
      deviationPercent,
      trend,
      status,
      outOfControl,
      outOfSpec
    };
  }, [readings, paramKey, config]);

  if (!config || !stats) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
    );
  }

  const getStatusBorder = () => {
    switch (stats.status) {
      case 'critical':
        return 'border-danger-500';
      case 'warning':
        return 'border-warning-500';
      default:
        return 'border-transparent';
    }
  };

  const TrendIcon = stats.trend > 0.01 ? TrendingUp : stats.trend < -0.01 ? TrendingDown : Minus;
  const trendColor = Math.abs(stats.trend) < 0.01 ? 'text-slate-400' :
    stats.trend > 0 ? 'text-warning-500' : 'text-primary-500';

  return (
    <div
      className={clsx(
        'card p-4 cursor-pointer border-2 transition-all duration-200 hover:shadow-md',
        isSelected ? 'ring-2 ring-primary-500 border-primary-500' : getStatusBorder(),
        stats.status === 'critical' && 'bg-danger-500/5'
      )}
      onClick={() => onClick?.(paramKey)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white text-sm">{config.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{config.unit}</p>
        </div>
        {stats.status !== 'normal' && (
          <AlertTriangle className={clsx(
            'w-4 h-4',
            stats.status === 'critical' ? 'text-danger-500' : 'text-warning-500'
          )} />
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={clsx(
          'text-2xl font-bold tabular-nums',
          stats.status === 'critical' ? 'text-danger-500' :
          stats.status === 'warning' ? 'text-warning-500' :
          'text-slate-900 dark:text-white'
        )}>
          {formatNumber(stats.current, 2)}
        </span>
        <span className="text-sm text-slate-400">{config.unit}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Target</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {formatNumber(config.target, 2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Deviation</span>
          <span className={clsx(
            'font-medium',
            stats.status === 'critical' ? 'text-danger-500' :
            stats.status === 'warning' ? 'text-warning-500' :
            'text-slate-700 dark:text-slate-300'
          )}>
            {formatDeviation(stats.deviation)} ({formatNumber(stats.deviationPercent, 1)}%)
          </span>
        </div>

        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, ((stats.current - config.lsl) / (config.usl - config.lsl)) * 100))}%`,
              backgroundColor: stats.status === 'critical' ? '#ef4444' :
                stats.status === 'warning' ? '#f59e0b' : '#22c55e'
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>LSL: {formatNumber(config.lsl, 1)}</span>
          <div className={clsx('flex items-center gap-1', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span>Trend</span>
          </div>
          <span>USL: {formatNumber(config.usl, 1)}</span>
        </div>
      </div>
    </div>
  );
}

export default ParameterCard;
