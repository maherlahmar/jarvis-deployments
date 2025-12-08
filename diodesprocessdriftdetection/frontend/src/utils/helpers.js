// Risk level helpers
export function getRiskLevel(score) {
  if (score >= 0.9) return 'critical';
  if (score >= 0.7) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

export function getRiskColor(score) {
  const level = getRiskLevel(score);
  const colors = {
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };
  return colors[level];
}

export function getRiskBadgeClass(score) {
  const level = getRiskLevel(score);
  return `badge-${level}`;
}

export function getRiskLabel(score) {
  const level = getRiskLevel(score);
  return level.charAt(0).toUpperCase() + level.slice(1);
}

// Format numbers
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(num, decimals = 1) {
  return num.toFixed(decimals) + '%';
}

// Tier helpers
export function getTierColor(tier) {
  const colors = {
    1: '#3b82f6', // blue
    2: '#8b5cf6', // purple
    3: '#10b981'  // green
  };
  return colors[tier] || '#6b7280';
}

export function getTierLabel(tier) {
  return `Tier ${tier}`;
}

// Country helpers
export const countryCoordinates = {
  'Taiwan': { lat: 23.5, lng: 121.0 },
  'Japan': { lat: 36.2, lng: 138.2 },
  'China': { lat: 35.9, lng: 104.2 },
  'South Korea': { lat: 35.9, lng: 127.8 },
  'Singapore': { lat: 1.35, lng: 103.8 },
  'Malaysia': { lat: 4.2, lng: 101.9 },
  'Vietnam': { lat: 14.0, lng: 108.2 },
  'USA': { lat: 37.1, lng: -95.7 },
  'Germany': { lat: 51.2, lng: 10.5 }
};

// ESG helpers
export function getESGLevel(score) {
  if (score >= 85) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 65) return 'fair';
  return 'poor';
}

export function getESGColor(score) {
  const level = getESGLevel(score);
  const colors = {
    excellent: '#22c55e',
    good: '#3b82f6',
    fair: '#eab308',
    poor: '#dc2626'
  };
  return colors[level];
}

// Priority helpers
export function getPriorityColor(priority) {
  const colors = {
    'Critical': '#dc2626',
    'High': '#f97316',
    'Medium': '#eab308',
    'Low': '#22c55e'
  };
  return colors[priority] || '#6b7280';
}

export function getPriorityBadgeClass(priority) {
  const classes = {
    'Critical': 'badge-critical',
    'High': 'badge-high',
    'Medium': 'badge-medium',
    'Low': 'badge-low'
  };
  return classes[priority] || 'badge';
}

// Chart color schemes
export const chartColors = {
  primary: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6', '#eab308', '#f43f5e'],
  risk: ['#22c55e', '#eab308', '#f97316', '#dc2626'],
  tier: ['#3b82f6', '#8b5cf6', '#10b981']
};

// Date helpers
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Debounce helper
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
