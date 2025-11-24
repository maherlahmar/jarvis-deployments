import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formatters';

const RecommendationCard = ({
  parameter,
  currentValue,
  recommendedValue,
  confidence,
  unit,
  impact,
  decimals = 1
}) => {
  const difference = recommendedValue - currentValue;
  const percentChange = (difference / currentValue) * 100;
  const shouldChange = Math.abs(difference) > 0.1;

  const getConfidenceColor = () => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.8) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getImpactBadge = () => {
    const impacts = {
      high: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      low: 'bg-muted text-muted-foreground border-border',
    };
    return impacts[impact] || impacts.low;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'metric-card',
        shouldChange && 'border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{parameter}</h3>
          {impact && (
            <span className={cn('status-badge border mt-1', getImpactBadge())}>
              {impact.toUpperCase()} IMPACT
            </span>
          )}
        </div>
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="text-lg font-bold">
            {formatNumber(currentValue, decimals)}
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          </p>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Recommended</p>
          <p className="text-lg font-bold text-primary">
            {formatNumber(recommendedValue, decimals)}
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <span className={cn('text-sm font-semibold', getConfidenceColor())}>
            {formatNumber(confidence * 100, 0)}%
          </span>
        </div>

        {shouldChange && (
          <div className="flex items-center gap-1 text-xs">
            <span className={cn(
              'font-medium',
              difference > 0 ? 'text-success' : 'text-warning'
            )}>
              {difference > 0 ? '+' : ''}{formatNumber(percentChange, 1)}%
            </span>
          </div>
        )}
      </div>

      {!shouldChange && (
        <div className="flex items-center gap-2 pt-3 border-t border-border text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Operating at optimal setpoint</span>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationCard;
