import { motion } from 'framer-motion';
import clsx from 'clsx';

function HealthGauge({ value, size = 160, strokeWidth = 12, label, status }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (value >= 90) return { stroke: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
    if (value >= 80) return { stroke: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    if (value >= 70) return { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const colors = getColor();

  const getStatusText = () => {
    if (value >= 90) return 'Excellent';
    if (value >= 80) return 'Good';
    if (value >= 70) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${colors.stroke}40)`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-4xl font-bold text-slate-100"
          >
            {Math.round(value)}
          </motion.span>
          <span className="text-sm text-slate-400">{label || 'Health Score'}</span>
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={clsx(
          'mt-3 px-3 py-1 rounded-full text-sm font-medium',
          value >= 90 ? 'bg-success-500/20 text-success-500' :
          value >= 80 ? 'bg-primary-500/20 text-primary-400' :
          value >= 70 ? 'bg-warning-500/20 text-warning-500' :
          'bg-danger-500/20 text-danger-500'
        )}
      >
        {status || getStatusText()}
      </motion.div>
    </div>
  );
}

export default HealthGauge;
