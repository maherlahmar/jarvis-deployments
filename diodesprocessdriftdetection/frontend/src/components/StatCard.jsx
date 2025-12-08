import clsx from 'clsx';

function StatCard({ title, value, subtitle, icon: Icon, trend, status, className }) {
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend > 0) return 'text-success-500';
    if (trend < 0) return 'text-danger-500';
    return 'text-slate-500';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'normal':
        return 'border-l-success-500';
      case 'warning':
        return 'border-l-warning-500';
      case 'danger':
      case 'critical':
        return 'border-l-danger-500';
      default:
        return 'border-l-primary-500';
    }
  };

  return (
    <div
      className={clsx(
        'card p-4 border-l-4 transition-all duration-200 hover:shadow-md',
        getStatusColor(),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p className={clsx('text-sm font-medium mt-1', getTrendColor())}>
              {trend > 0 ? '+' : ''}{trend}%
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                vs last period
              </span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            status === 'success' || status === 'normal' ? 'bg-success-500/10 text-success-500' :
            status === 'warning' ? 'bg-warning-500/10 text-warning-500' :
            status === 'danger' || status === 'critical' ? 'bg-danger-500/10 text-danger-500' :
            'bg-primary-500/10 text-primary-500'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
