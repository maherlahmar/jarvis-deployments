import { AlertTriangle, AlertCircle, Info, X, DollarSign } from 'lucide-react';

export default function AlertCard({ alert, onDismiss, compact = false }) {
  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-400'
    }
  };

  const config = severityConfig[alert.severity] || severityConfig.info;
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg} ${config.border} border`}>
        <Icon size={16} className={config.iconColor} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate">{alert.title}</p>
          <p className="text-xs text-slate-400">{alert.timeAgo}</p>
        </div>
        {alert.potentialSavings && (
          <span className="text-xs text-green-400 font-medium whitespace-nowrap">
            ${alert.potentialSavings}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl ${config.bg} ${config.border} border overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon size={18} className={config.iconColor} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">{alert.title}</h4>
              <p className="text-xs text-slate-400">{alert.timeAgo}</p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="text-sm text-slate-300 mb-3">{alert.description}</p>

        <div className="flex items-center justify-between">
          <span className={`badge ${config.badge}`}>
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </span>
          {alert.potentialSavings && (
            <div className="flex items-center gap-1 text-green-400">
              <DollarSign size={14} />
              <span className="text-sm font-medium">{alert.potentialSavings}/hr savings</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
