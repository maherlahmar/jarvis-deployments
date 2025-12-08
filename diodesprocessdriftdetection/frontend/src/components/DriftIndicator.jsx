import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import clsx from 'clsx';
import { formatNumber, formatSigma } from '../utils/formatters';

function DriftIndicator({ driftData, parameterConfig }) {
  const { cusum, ewma, trend, shift, overall } = driftData || {};

  const getOverallStatus = () => {
    if (overall === 'critical') {
      return {
        icon: AlertTriangle,
        color: 'text-danger-500',
        bgColor: 'bg-danger-500/10',
        label: 'Critical Drift'
      };
    }
    if (overall === 'warning') {
      return {
        icon: Activity,
        color: 'text-warning-500',
        bgColor: 'bg-warning-500/10',
        label: 'Drift Warning'
      };
    }
    return {
      icon: CheckCircle,
      color: 'text-success-500',
      bgColor: 'bg-success-500/10',
      label: 'Stable'
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  if (!driftData) {
    return (
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p className="text-sm text-slate-500">No drift data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={clsx('flex items-center gap-3 p-3 rounded-lg', status.bgColor)}>
        <StatusIcon className={clsx('w-5 h-5', status.color)} />
        <div>
          <p className={clsx('font-medium', status.color)}>{status.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {parameterConfig?.name || 'Parameter'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">CUSUM</p>
          <div className="flex items-center justify-between">
            <span className={clsx(
              'text-sm font-medium',
              cusum?.alarm ? 'text-danger-500' : cusum?.warning ? 'text-warning-500' : 'text-slate-700 dark:text-slate-300'
            )}>
              {cusum?.direction === 'positive' ? '+' : '-'}{formatNumber(Math.max(cusum?.cusumPlus || 0, cusum?.cusumMinus || 0), 2)}
            </span>
            <span className="text-xs text-slate-400">/ {cusum?.threshold}</span>
          </div>
          <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                cusum?.alarm ? 'bg-danger-500' : cusum?.warning ? 'bg-warning-500' : 'bg-success-500'
              )}
              style={{
                width: `${Math.min(100, (Math.max(cusum?.cusumPlus || 0, cusum?.cusumMinus || 0) / (cusum?.threshold || 5)) * 100)}%`
              }}
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">EWMA</p>
          <div className="flex items-center justify-between">
            <span className={clsx(
              'text-sm font-medium',
              ewma?.alarm ? 'text-danger-500' : ewma?.warning ? 'text-warning-500' : 'text-slate-700 dark:text-slate-300'
            )}>
              {formatNumber(ewma?.value, 3)}
            </span>
            <span className="text-xs text-slate-400">
              {ewma?.deviation >= 0 ? '+' : ''}{formatNumber(ewma?.deviation, 3)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Target: {formatNumber(ewma?.target, 2)}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trend</p>
          <div className="flex items-center gap-2">
            {trend?.direction === 'increasing' ? (
              <TrendingUp className={clsx('w-4 h-4', trend?.significant ? 'text-warning-500' : 'text-slate-400')} />
            ) : (
              <TrendingDown className={clsx('w-4 h-4', trend?.significant ? 'text-warning-500' : 'text-slate-400')} />
            )}
            <span className={clsx(
              'text-sm font-medium',
              trend?.significant ? 'text-warning-500' : 'text-slate-700 dark:text-slate-300'
            )}>
              {trend?.significant ? 'Significant' : 'None'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            R² = {formatNumber(trend?.rSquared, 3)}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Shift</p>
          <div className="flex items-center justify-between">
            <span className={clsx(
              'text-sm font-medium',
              shift?.detected ? 'text-danger-500' : 'text-slate-700 dark:text-slate-300'
            )}>
              {shift?.detected ? 'Detected' : 'None'}
            </span>
          </div>
          {shift?.detected && (
            <p className="text-xs text-danger-500 mt-1">
              {formatSigma(shift?.shiftInSigmas)} shift
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriftIndicator;
