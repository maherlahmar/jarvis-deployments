import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, X, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatTime } from '../utils/formatters';
import useProcessStore from '../store/useProcessStore';

const AlarmPanel = () => {
  const { alarms, acknowledgeAlarm, removeAlarm } = useProcessStore();

  const getSeverityConfig = (severity) => {
    const configs = {
      error: {
        icon: AlertCircle,
        className: 'bg-error/10 border-error/20 text-error',
        iconClassName: 'text-error',
      },
      warning: {
        icon: AlertTriangle,
        className: 'bg-warning/10 border-warning/20 text-warning',
        iconClassName: 'text-warning',
      },
      info: {
        icon: AlertCircle,
        className: 'bg-primary/10 border-primary/20 text-primary',
        iconClassName: 'text-primary',
      },
    };
    return configs[severity] || configs.info;
  };

  if (alarms.length === 0) {
    return (
      <div className="chart-container">
        <h2 className="text-lg font-semibold mb-4">Active Alarms</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Check className="h-12 w-12 mx-auto mb-2 text-success" />
          <p>No active alarms</p>
          <p className="text-sm mt-1">All systems operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Active Alarms ({alarms.length})</h2>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alarms.map((alarm) => {
            const config = getSeverityConfig(alarm.severity);
            const Icon = config.icon;

            return (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'border rounded-lg p-3',
                  config.className,
                  alarm.acknowledged && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClassName)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{alarm.message}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs opacity-75">
                          <span>{formatTime(alarm.timestamp)}</span>
                          {alarm.parameter && (
                            <span className="capitalize">
                              {alarm.parameter}: {alarm.value}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!alarm.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlarm(alarm.id)}
                            className="p-1 hover:bg-background/50 rounded transition-colors"
                            title="Acknowledge"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeAlarm(alarm.id)}
                          className="p-1 hover:bg-background/50 rounded transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {alarm.acknowledged && (
                      <div className="mt-2 text-xs opacity-75">
                        ✓ Acknowledged
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlarmPanel;
