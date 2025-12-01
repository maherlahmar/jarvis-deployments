// Mock data service for SMT Energy Monitor
// Generates realistic reflow oven data patterns

const EQUIPMENT_STATUSES = ['Operating', 'Idle', 'Warm-up', 'Standby', 'Maintenance'];
const PRODUCT_NUMBERS = ['A-001', 'B-002', 'C-003', 'D-004', 'E-005'];

// Base temperature profiles for different zones (typical reflow oven profile)
const ZONE_TEMP_PROFILES = {
  zone1: { base: 130, variance: 5 },   // Preheat 1
  zone2: { base: 150, variance: 5 },   // Preheat 2
  zone3: { base: 165, variance: 4 },   // Preheat 3
  zone4: { base: 175, variance: 4 },   // Soak 1
  zone5: { base: 185, variance: 3 },   // Soak 2
  zone6: { base: 195, variance: 3 },   // Soak 3
  zone7: { base: 220, variance: 5 },   // Reflow 1
  zone8: { base: 245, variance: 6 },   // Reflow peak
  zone9: { base: 210, variance: 5 },   // Cooling 1
  zone10: { base: 160, variance: 10 }  // Cooling 2
};

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateZoneData(zoneId, profile, isOperating, simulationProgress) {
  const tempOffset = isOperating ? 0 : -20;
  const fluctuation = Math.sin(simulationProgress * 0.1) * profile.variance;

  const upper = profile.base + tempOffset + fluctuation + randomInRange(-2, 2);
  const lower = upper - randomInRange(1, 4);
  const blowerUpper = upper + randomInRange(3, 8);
  const blowerLower = blowerUpper - 2.5;

  return {
    upper: Math.max(25, upper),
    lower: Math.max(25, lower),
    blowerUpper: Math.max(30, blowerUpper),
    blowerLower: Math.max(30, blowerLower),
    avgTemp: (upper + lower) / 2,
    delta: Math.abs(upper - lower)
  };
}

function generateDataPoint(index, totalPoints, startDate = new Date()) {
  const timestamp = new Date(startDate.getTime() + index * 10000); // 10 second intervals
  const hourOfDay = timestamp.getHours();

  // Simulate shift patterns
  const isShiftTime = hourOfDay >= 6 && hourOfDay < 22;
  const isLunchBreak = hourOfDay >= 12 && hourOfDay < 13;
  const isBreakTime = (hourOfDay === 10 || hourOfDay === 15) && timestamp.getMinutes() < 15;

  // Determine operating status
  let status = 'Operating';
  let isProducing = true;

  if (!isShiftTime) {
    status = 'Standby';
    isProducing = false;
  } else if (isLunchBreak || isBreakTime) {
    status = 'Idle';
    isProducing = false;
  } else if (Math.random() < 0.02) {
    status = 'Idle';
    isProducing = false;
  }

  // Energy consumption varies with status
  let basePower = 34.4; // kW when operating
  if (status === 'Standby') basePower = 8.5;
  else if (status === 'Idle') basePower = 18.2;
  else if (status === 'Warm-up') basePower = 42.0;

  const activePower = basePower + randomInRange(-2, 2);
  const powerFactor = isProducing ? randomInRange(0.92, 0.98) : randomInRange(0.75, 0.88);
  const apparentPower = activePower / powerFactor;
  const reactivePower = Math.sqrt(apparentPower * apparentPower - activePower * activePower);

  // Cumulative energy
  const energyIncrement = (activePower * 10) / 3600; // kWh for 10 seconds
  const cumulativeEnergy = index * energyIncrement * (0.9 + Math.random() * 0.2);

  // Zone temperatures
  const zones = {};
  Object.keys(ZONE_TEMP_PROFILES).forEach(zoneId => {
    zones[zoneId] = generateZoneData(
      zoneId,
      ZONE_TEMP_PROFILES[zoneId],
      isProducing,
      index
    );
  });

  // Boards production
  const boardsInside = isProducing ? Math.floor(randomInRange(3, 8)) : 0;
  const boardsProduced = Math.floor(index / 6) * (isProducing ? 1 : 0);

  return {
    timestamp,
    energy: {
      cumulative: cumulativeEnergy,
      current: (activePower * 1000) / (480 * Math.sqrt(3)),
      voltage: 480,
      activePower,
      reactivePower,
      apparentPower,
      powerFactor,
      frequency: 60
    },
    operational: {
      status,
      boardsInside,
      boardsProduced,
      productNumber: PRODUCT_NUMBERS[Math.floor(index / 100) % PRODUCT_NUMBERS.length],
      conveyorSpeed: isProducing ? 1.0 : 0,
      alarmCount: Math.random() < 0.05 ? Math.floor(randomInRange(1, 3)) : 0,
      flowRate: isProducing ? randomInRange(4.5, 5.5) : 0,
      o2Concentration: randomInRange(90, 110)
    },
    zones,
    cooling: {
      cool1: randomInRange(45, 55),
      cool2: randomInRange(40, 50)
    }
  };
}

// Generate a batch of mock data points
export function generateMockData(count = 360, startDate = new Date()) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(generateDataPoint(i, count, startDate));
  }
  return data;
}

// Generate hourly aggregated data
export function generateHourlyData(hours = 24) {
  const data = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let h = hours - 1; h >= 0; h--) {
    const hour = new Date(now.getTime() - h * 3600000);
    const hourOfDay = hour.getHours();
    const isShiftTime = hourOfDay >= 6 && hourOfDay < 22;

    let baseConsumption = isShiftTime ? 34 : 10;
    if (hourOfDay >= 12 && hourOfDay < 13) baseConsumption = 20; // Lunch

    data.push({
      hour: hour.toISOString(),
      hourLabel: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      consumption: baseConsumption + randomInRange(-3, 3),
      production: isShiftTime ? Math.floor(randomInRange(45, 65)) : 0,
      efficiency: isShiftTime ? randomInRange(85, 98) : 0,
      powerFactor: isShiftTime ? randomInRange(0.92, 0.97) : randomInRange(0.75, 0.85),
      avgTemp: isShiftTime ? randomInRange(180, 200) : randomInRange(80, 120)
    });
  }

  return data;
}

// Generate waste detection alerts
export function generateWasteAlerts() {
  const alerts = [];
  const types = [
    {
      type: 'idle_power',
      title: 'High Idle Power Consumption',
      severity: 'warning',
      description: 'Equipment consuming excessive power during non-production period',
      potentialSavings: randomInRange(2, 8)
    },
    {
      type: 'power_factor',
      title: 'Low Power Factor Detected',
      severity: 'warning',
      description: 'Power factor below 0.90 threshold during production',
      potentialSavings: randomInRange(1, 4)
    },
    {
      type: 'temp_overshoot',
      title: 'Zone Temperature Overshoot',
      severity: 'critical',
      description: 'Zone 8 exceeded target temperature by 15°C',
      potentialSavings: randomInRange(3, 6)
    },
    {
      type: 'standby_duration',
      title: 'Extended Standby Duration',
      severity: 'info',
      description: 'Equipment in standby for over 30 minutes with full thermal load',
      potentialSavings: randomInRange(5, 12)
    },
    {
      type: 'inefficient_ramp',
      title: 'Inefficient Temperature Ramp',
      severity: 'warning',
      description: 'Preheat zones taking longer than optimal to reach setpoint',
      potentialSavings: randomInRange(2, 5)
    }
  ];

  // Generate 3-6 random alerts
  const alertCount = Math.floor(randomInRange(3, 7));
  const shuffled = types.sort(() => Math.random() - 0.5);

  for (let i = 0; i < alertCount; i++) {
    const template = shuffled[i % types.length];
    const timestamp = new Date(Date.now() - Math.floor(randomInRange(0, 7200000)));

    alerts.push({
      id: `alert-${i + 1}`,
      ...template,
      timestamp,
      timeAgo: formatTimeAgo(timestamp),
      potentialSavings: template.potentialSavings.toFixed(2)
    });
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

// Generate zone efficiency data
export function generateZoneEfficiency() {
  return Object.keys(ZONE_TEMP_PROFILES).map(zoneId => {
    const profile = ZONE_TEMP_PROFILES[zoneId];
    const efficiency = randomInRange(88, 99);
    const currentTemp = profile.base + randomInRange(-3, 3);
    const targetTemp = profile.base;

    return {
      zoneId,
      zoneName: zoneId.replace('zone', 'Zone '),
      currentTemp,
      targetTemp,
      deviation: currentTemp - targetTemp,
      efficiency,
      status: efficiency > 95 ? 'optimal' : efficiency > 90 ? 'acceptable' : 'warning',
      energyUsage: randomInRange(2.5, 4.5)
    };
  });
}

// Generate energy breakdown by category
export function generateEnergyBreakdown() {
  const total = randomInRange(280, 350);
  const heating = total * randomInRange(0.55, 0.65);
  const convection = total * randomInRange(0.15, 0.22);
  const cooling = total * randomInRange(0.08, 0.12);
  const conveyor = total * randomInRange(0.03, 0.06);
  const controls = total - heating - convection - cooling - conveyor;

  return [
    { name: 'Heating Elements', value: heating, color: '#ef4444', percentage: (heating / total * 100).toFixed(1) },
    { name: 'Convection System', value: convection, color: '#f97316', percentage: (convection / total * 100).toFixed(1) },
    { name: 'Cooling System', value: cooling, color: '#3b82f6', percentage: (cooling / total * 100).toFixed(1) },
    { name: 'Conveyor Motor', value: conveyor, color: '#22c55e', percentage: (conveyor / total * 100).toFixed(1) },
    { name: 'Controls & Sensors', value: controls, color: '#a855f7', percentage: (controls / total * 100).toFixed(1) }
  ];
}

// Generate production metrics
export function generateProductionMetrics() {
  const boardsProduced = Math.floor(randomInRange(450, 650));
  const energyUsed = randomInRange(280, 350);
  const kWhPerBoard = energyUsed / boardsProduced;
  const targetKWhPerBoard = 0.52;
  const efficiency = (targetKWhPerBoard / kWhPerBoard) * 100;

  return {
    boardsProduced,
    energyUsed: energyUsed.toFixed(2),
    kWhPerBoard: kWhPerBoard.toFixed(3),
    targetKWhPerBoard,
    efficiency: Math.min(100, efficiency).toFixed(1),
    uptime: randomInRange(92, 99).toFixed(1),
    oee: randomInRange(78, 92).toFixed(1),
    yield: randomInRange(97, 99.5).toFixed(1)
  };
}

// Generate weekly trend data
export function generateWeeklyTrend() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => {
    const isWeekend = index >= 5;
    return {
      day,
      energy: isWeekend ? randomInRange(120, 180) : randomInRange(280, 350),
      production: isWeekend ? Math.floor(randomInRange(100, 200)) : Math.floor(randomInRange(450, 650)),
      efficiency: isWeekend ? randomInRange(75, 85) : randomInRange(88, 96),
      waste: isWeekend ? randomInRange(15, 25) : randomInRange(4, 12)
    };
  });
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Real-time data simulation
export function createRealtimeSimulator(callback, intervalMs = 1000) {
  let index = 0;
  const startDate = new Date();

  const intervalId = setInterval(() => {
    const dataPoint = generateDataPoint(index, 1000, startDate);
    callback(dataPoint);
    index++;
  }, intervalMs);

  return {
    stop: () => clearInterval(intervalId),
    getIndex: () => index
  };
}

// Dashboard summary data
export function generateDashboardSummary() {
  return {
    currentPower: randomInRange(32, 38).toFixed(1),
    dailyEnergy: randomInRange(280, 350).toFixed(1),
    powerFactor: randomInRange(0.92, 0.97).toFixed(2),
    boardsToday: Math.floor(randomInRange(450, 650)),
    activeAlerts: Math.floor(randomInRange(2, 6)),
    efficiency: randomInRange(88, 96).toFixed(1),
    co2Saved: randomInRange(12, 25).toFixed(1),
    costSavings: randomInRange(45, 120).toFixed(0),
    wastedEnergy: randomInRange(8, 25).toFixed(1),
    peakPower: randomInRange(42, 48).toFixed(1),
    avgZoneTemp: randomInRange(175, 195).toFixed(0),
    idleTime: Math.floor(randomInRange(15, 45))
  };
}
