export const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  return Number(value).toFixed(decimals);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatUnit = (value, unit, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  return `${Number(value).toFixed(decimals)} ${unit}`;
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const getStatusColor = (value, thresholds) => {
  if (value >= thresholds.good) return 'success';
  if (value >= thresholds.warning) return 'warning';
  return 'error';
};

export const getTrendIcon = (current, previous) => {
  if (current > previous) return '↑';
  if (current < previous) return '↓';
  return '→';
};

export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
