import { motion } from 'framer-motion';
import { Thermometer, Gauge, Clock, Layers, Play, Pause, Loader2 } from 'lucide-react';
import clsx from 'clsx';

function ReactorStatus({ reactor, name }) {
  if (!reactor) return null;

  const getStateConfig = () => {
    switch (reactor.state) {
      case 'processing':
        return {
          color: 'success',
          icon: Play,
          label: 'Processing',
          bgClass: 'from-success-500/20 to-success-500/5',
          borderClass: 'border-success-500/30',
          pulseClass: 'bg-success-500'
        };
      case 'loading':
        return {
          color: 'primary',
          icon: Loader2,
          label: 'Loading',
          bgClass: 'from-primary-500/20 to-primary-500/5',
          borderClass: 'border-primary-500/30',
          pulseClass: 'bg-primary-500'
        };
      case 'cooling':
        return {
          color: 'warning',
          icon: Clock,
          label: 'Cooling',
          bgClass: 'from-warning-500/20 to-warning-500/5',
          borderClass: 'border-warning-500/30',
          pulseClass: 'bg-warning-500'
        };
      default:
        return {
          color: 'slate',
          icon: Pause,
          label: 'Idle',
          bgClass: 'from-slate-500/10 to-slate-500/5',
          borderClass: 'border-slate-600/30',
          pulseClass: 'bg-slate-500'
        };
    }
  };

  const config = getStateConfig();
  const StateIcon = config.icon;

  const formatTemp = (temp) => {
    if (temp === undefined || temp === null) return '--';
    return temp.toFixed(1);
  };

  const formatPressure = (pressure) => {
    if (pressure === undefined || pressure === null) return '--';
    if (pressure < 1) return pressure.toFixed(3);
    return pressure.toFixed(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-5',
        config.bgClass,
        config.borderClass
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-3 h-3 rounded-full',
            config.pulseClass,
            reactor.state === 'processing' && 'animate-pulse'
          )} />
          <h3 className="text-lg font-semibold text-slate-100">{name}</h3>
        </div>
        <div className={clsx(
          'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
          reactor.state === 'processing' ? 'bg-success-500/20 text-success-500' :
          reactor.state === 'loading' ? 'bg-primary-500/20 text-primary-400' :
          reactor.state === 'cooling' ? 'bg-warning-500/20 text-warning-500' :
          'bg-slate-600/30 text-slate-400'
        )}>
          <StateIcon className={clsx('w-4 h-4', reactor.state === 'loading' && 'animate-spin')} />
          {config.label}
        </div>
      </div>

      {/* Recipe info */}
      {reactor.recipe && (
        <div className="mb-4 p-3 rounded-lg bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-1">Active Recipe</p>
          <p className="text-sm font-medium text-slate-100">{reactor.recipe.name}</p>
          <p className="text-xs text-slate-500">{reactor.recipe.application}</p>
        </div>
      )}

      {/* Progress bar for processing state */}
      {reactor.state === 'processing' && reactor.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{reactor.progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${reactor.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-success-500 to-success-400 rounded-full"
            />
          </div>
          {reactor.recipe && (
            <p className="text-xs text-slate-500 mt-1">
              {reactor.elapsedMinutes} / {reactor.recipe.duration} min
            </p>
          )}
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Temperature */}
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs">Temperature</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {formatTemp(reactor.temperature)}
            <span className="text-sm text-slate-400 ml-1">C</span>
          </p>
        </div>

        {/* Pressure */}
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Gauge className="w-4 h-4" />
            <span className="text-xs">Pressure</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {formatPressure(reactor.pressure)}
            <span className="text-sm text-slate-400 ml-1">Torr</span>
          </p>
        </div>

        {/* Wafers */}
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-xs">Wafers</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {reactor.wafersLoaded}
            <span className="text-sm text-slate-400 ml-1">/ 100</span>
          </p>
        </div>

        {/* Time */}
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Elapsed</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {reactor.elapsedMinutes}
            <span className="text-sm text-slate-400 ml-1">min</span>
          </p>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-3xl" />
    </motion.div>
  );
}

export default ReactorStatus;
