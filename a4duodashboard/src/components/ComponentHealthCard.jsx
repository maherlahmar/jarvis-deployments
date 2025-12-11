import { motion } from 'framer-motion';
import { ChevronRight, AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

function ComponentHealthCard({ component, onClick }) {
  const getStatusConfig = () => {
    switch (component.status) {
      case 'good':
        return {
          icon: CheckCircle,
          color: 'text-success-500',
          bg: 'bg-success-500/10',
          border: 'border-success-500/20',
          label: 'Good'
        };
      case 'fair':
        return {
          icon: AlertCircle,
          color: 'text-primary-400',
          bg: 'bg-primary-500/10',
          border: 'border-primary-500/20',
          label: 'Fair'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-warning-500',
          bg: 'bg-warning-500/10',
          border: 'border-warning-500/20',
          label: 'Warning'
        };
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-danger-500',
          bg: 'bg-danger-500/10',
          border: 'border-danger-500/20',
          label: 'Critical'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const getHealthBarColor = () => {
    if (component.healthScore >= 90) return 'bg-success-500';
    if (component.healthScore >= 80) return 'bg-primary-500';
    if (component.healthScore >= 70) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-200',
        'bg-slate-800/30 hover:bg-slate-800/50',
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-lg', config.bg)}>
            <StatusIcon className={clsx('w-5 h-5', config.color)} />
          </div>
          <div>
            <h4 className="font-medium text-slate-100">{component.name}</h4>
            <p className="text-xs text-slate-500">ID: {component.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('text-2xl font-bold', config.color)}>
            {component.healthScore.toFixed(0)}%
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Health bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${component.healthScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={clsx('h-full rounded-full', getHealthBarColor())}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">Last PM:</span>
            <span className="text-slate-300 ml-1">{formatDate(component.lastPMDate)}</span>
          </div>
          <div>
            <span className="text-slate-500">Next PM:</span>
            <span className={clsx(
              'ml-1',
              new Date(component.nextPMDue) < new Date() ? 'text-danger-500' : 'text-slate-300'
            )}>
              {formatDate(component.nextPMDue)}
            </span>
          </div>
        </div>
        <div className={clsx(
          'px-2 py-0.5 rounded text-xs font-medium',
          config.bg,
          config.color
        )}>
          {config.label}
        </div>
      </div>

      {/* RUL indicator for critical/warning */}
      {(component.status === 'warning' || component.status === 'critical') && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Est. Remaining Life</span>
            <span className={clsx(
              'font-medium',
              component.estimatedRUL < 500 ? 'text-danger-500' : 'text-warning-500'
            )}>
              {component.estimatedRUL.toLocaleString()} hours
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ComponentHealthCard;
