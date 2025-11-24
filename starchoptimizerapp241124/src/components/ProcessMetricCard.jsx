import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formatters';

const ProcessMetricCard = ({
  label,
  value,
  unit,
  min,
  max,
  optimal,
  icon: Icon,
  decimals = 1
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const isInOptimalRange = optimal ? value >= optimal.min && value <= optimal.max : true;

  const getStatusColor = () => {
    if (!isInOptimalRange) return 'text-warning';
    if (value < min || value > max) return 'text-error';
    return 'text-success';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="metric-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', getStatusColor())}>
            {formatNumber(value, decimals)} <span className="text-sm font-normal">{unit}</span>
          </p>
        </div>
        {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
      </div>

      <div className="relative">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            transition={{ duration: 0.5 }}
            className={cn(
              'h-full rounded-full',
              isInOptimalRange ? 'bg-success' : 'bg-warning'
            )}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatNumber(min, decimals)}</span>
          <span>{formatNumber(max, decimals)}</span>
        </div>
      </div>

      {optimal && (
        <div className="mt-2 text-xs text-muted-foreground">
          Optimal: {formatNumber(optimal.min, decimals)} - {formatNumber(optimal.max, decimals)} {unit}
        </div>
      )}
    </motion.div>
  );
};

export default ProcessMetricCard;
