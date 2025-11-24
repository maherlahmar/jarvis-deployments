import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { formatNumber, formatPercentage } from '../utils/formatters';

const KPICard = ({
  title,
  value,
  unit = '',
  trend,
  status = 'normal',
  icon: Icon,
  percentage = false,
  decimals = 1
}) => {
  const statusColors = {
    normal: 'border-border',
    success: 'border-success',
    warning: 'border-warning',
    error: 'border-error',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-foreground',
  };

  const formattedValue = percentage
    ? formatPercentage(value, decimals)
    : unit
      ? `${formatNumber(value, decimals)} ${unit}`
      : formatNumber(value, decimals);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'metric-card border-l-4',
        statusColors[status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="kpi-label">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="kpi-value">{formattedValue}</p>
            {trend && (
              <span className={cn('text-sm font-medium', trendColors[trend.direction])}>
                {trend.direction === 'up' && '↑'}
                {trend.direction === 'down' && '↓'}
                {trend.direction === 'neutral' && '→'}
                {trend.value && ` ${formatNumber(Math.abs(trend.value))}%`}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KPICard;
