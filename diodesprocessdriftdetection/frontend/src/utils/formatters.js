import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatTimestamp(timestamp, includeTime = true) {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return includeTime ? `Today ${format(date, 'HH:mm:ss')}` : 'Today';
  }

  if (isYesterday(date)) {
    return includeTime ? `Yesterday ${format(date, 'HH:mm:ss')}` : 'Yesterday';
  }

  return includeTime
    ? format(date, 'MMM d, HH:mm:ss')
    : format(date, 'MMM d, yyyy');
}

export function formatRelativeTime(timestamp) {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function formatDateTime(timestamp) {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
}

export function formatDate(timestamp) {
  return format(new Date(timestamp), 'yyyy-MM-dd');
}

export function formatTime(timestamp) {
  return format(new Date(timestamp), 'HH:mm:ss');
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimals);
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatDeviation(value, unit = '') {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(3)}${unit ? ` ${unit}` : ''}`;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

export function formatCapabilityIndex(value) {
  if (value === null || value === undefined) return '-';
  const num = Number(value);

  return {
    value: num.toFixed(2),
    status: num >= 1.33 ? 'excellent' : num >= 1.0 ? 'good' : num >= 0.67 ? 'marginal' : 'poor',
    color: num >= 1.33 ? 'text-success-500' : num >= 1.0 ? 'text-primary-500' : num >= 0.67 ? 'text-warning-500' : 'text-danger-500'
  };
}

export function getStatusColor(status) {
  switch (status) {
    case 'normal':
    case 'good':
    case 'excellent':
      return 'text-success-500';
    case 'warning':
    case 'marginal':
      return 'text-warning-500';
    case 'critical':
    case 'poor':
      return 'text-danger-500';
    default:
      return 'text-slate-500';
  }
}

export function getStatusBgColor(status) {
  switch (status) {
    case 'normal':
    case 'good':
    case 'completed':
      return 'bg-success-500/10';
    case 'warning':
      return 'bg-warning-500/10';
    case 'critical':
    case 'error':
      return 'bg-danger-500/10';
    case 'in_progress':
      return 'bg-primary-500/10';
    default:
      return 'bg-slate-500/10';
  }
}

export function getSeverityColor(severity) {
  switch (severity) {
    case 'critical':
      return 'bg-danger-500';
    case 'warning':
      return 'bg-warning-500';
    case 'info':
      return 'bg-primary-500';
    default:
      return 'bg-slate-500';
  }
}

export function formatBatchId(id) {
  return id.replace('BATCH-', '#');
}

export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function formatParameterValue(value, parameter, parameters) {
  if (value === null || value === undefined) return '-';

  const config = parameters?.[parameter];
  if (!config) return formatNumber(value, 4);

  const unit = config.unit || '';
  return `${formatNumber(value, 2)} ${unit}`.trim();
}

export function getZoneColor(zone) {
  switch (zone) {
    case 'A+':
    case 'A-':
      return 'text-success-500';
    case 'B+':
    case 'B-':
      return 'text-success-400';
    case 'C+':
    case 'C-':
      return 'text-warning-500';
    case 'OUT+':
    case 'OUT-':
      return 'text-danger-500';
    default:
      return 'text-slate-500';
  }
}

export function formatSigma(value) {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}\u03C3`;
}
