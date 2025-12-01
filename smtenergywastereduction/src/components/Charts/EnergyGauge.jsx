import { useMemo } from 'react';

export default function EnergyGauge({ value, max, label, unit, color = 'primary', size = 'md' }) {
  const percentage = Math.min(100, (value / max) * 100);

  const sizes = {
    sm: { width: 100, stroke: 8, fontSize: 'text-lg' },
    md: { width: 140, stroke: 10, fontSize: 'text-2xl' },
    lg: { width: 180, stroke: 12, fontSize: 'text-3xl' }
  };

  const colors = {
    primary: { stroke: '#3b82f6', bg: '#1e3a5f' },
    success: { stroke: '#22c55e', bg: '#14532d' },
    warning: { stroke: '#eab308', bg: '#422006' },
    danger: { stroke: '#ef4444', bg: '#450a0a' },
    cyan: { stroke: '#06b6d4', bg: '#164e63' }
  };

  const { width, stroke, fontSize } = sizes[size];
  const { stroke: strokeColor, bg: bgColor } = colors[color];

  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = useMemo(() => {
    if (percentage >= 90) return colors.danger.stroke;
    if (percentage >= 70) return colors.warning.stroke;
    return strokeColor;
  }, [percentage, strokeColor]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={getStatusColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${getStatusColor}40)`
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold text-white`}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-sm text-slate-400 font-medium">{label}</span>
      )}
    </div>
  );
}
