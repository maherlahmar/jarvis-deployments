// Synthetic Data Generator for ASM A400 DUO Vertical Furnace
// Generates realistic operational data for dashboard demonstration

// A400 DUO Configuration Constants
export const FURNACE_CONFIG = {
  name: 'A400 DUO',
  model: 'A400-DUO-200',
  serialNumber: 'ASM-A4D-2024-0847',
  installDate: '2022-03-15',
  waferSize: 200, // mm
  maxBatchSize: 100, // wafers per batch
  reactors: ['Reactor A', 'Reactor B'],
  temperatureRange: { min: 200, max: 1200 }, // Celsius
  pressureRange: { min: 0.1, max: 760 }, // Torr
  applications: [
    'LPCVD Polysilicon',
    'LPCVD Silicon Nitride',
    'LPCVD TEOS',
    'Oxidation (Dry)',
    'Oxidation (Wet)',
    'Diffusion',
    'Anneal',
    'ALD'
  ]
};

// Component Definitions with typical MTBF and wear patterns
export const COMPONENTS = {
  heatingElements: {
    name: 'Heating Elements',
    count: 5,
    zones: ['Zone 1 (Top)', 'Zone 2', 'Zone 3 (Center)', 'Zone 4', 'Zone 5 (Bottom)'],
    mtbfHours: 15000,
    wearRate: 0.007, // % per 100 hours
    criticalThreshold: 85
  },
  quartzTube: {
    name: 'Quartz Process Tube',
    count: 2,
    mtbfHours: 8000,
    wearRate: 0.012,
    criticalThreshold: 80
  },
  vacuumPump: {
    name: 'Vacuum Pump',
    count: 2,
    mtbfHours: 12000,
    wearRate: 0.008,
    criticalThreshold: 75
  },
  gasDelivery: {
    name: 'Gas Delivery System',
    subComponents: ['MFC N2', 'MFC O2', 'MFC SiH4', 'MFC NH3', 'MFC DCS'],
    mtbfHours: 20000,
    wearRate: 0.005,
    criticalThreshold: 90
  },
  boatLoader: {
    name: 'Boat Loader',
    count: 2,
    mtbfHours: 10000,
    wearRate: 0.01,
    criticalThreshold: 80
  },
  thermocouples: {
    name: 'Thermocouples',
    count: 10,
    mtbfHours: 6000,
    wearRate: 0.015,
    criticalThreshold: 85
  },
  doorSeal: {
    name: 'Door Seal/O-rings',
    count: 4,
    mtbfHours: 3000,
    wearRate: 0.03,
    criticalThreshold: 70
  },
  exhaustSystem: {
    name: 'Exhaust System',
    mtbfHours: 18000,
    wearRate: 0.006,
    criticalThreshold: 85
  }
};

// Process Recipes
export const RECIPES = [
  { id: 'POLY-STD', name: 'Polysilicon Standard', duration: 180, temperature: 620, pressure: 0.25, application: 'LPCVD Polysilicon' },
  { id: 'POLY-DOPED-P', name: 'P-Doped Polysilicon', duration: 200, temperature: 630, pressure: 0.3, application: 'LPCVD Polysilicon' },
  { id: 'SIN-STD', name: 'Silicon Nitride Standard', duration: 150, temperature: 780, pressure: 0.2, application: 'LPCVD Silicon Nitride' },
  { id: 'TEOS-STD', name: 'TEOS Oxide', duration: 120, temperature: 720, pressure: 0.4, application: 'LPCVD TEOS' },
  { id: 'OX-DRY', name: 'Dry Oxidation', duration: 90, temperature: 1000, pressure: 760, application: 'Oxidation (Dry)' },
  { id: 'OX-WET', name: 'Wet Oxidation', duration: 60, temperature: 950, pressure: 760, application: 'Oxidation (Wet)' },
  { id: 'DIFF-DRIVE', name: 'Drive-in Diffusion', duration: 240, temperature: 1100, pressure: 760, application: 'Diffusion' },
  { id: 'ANNEAL-STD', name: 'Standard Anneal', duration: 45, temperature: 900, pressure: 760, application: 'Anneal' }
];

// Seed for reproducible random numbers
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randomBetween(min, max, useSeed = false) {
  const r = useSeed ? seededRandom() : Math.random();
  return min + r * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function gaussianRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Generate timestamp for the last N hours
function generateTimestamps(hours, intervalMinutes = 5) {
  const timestamps = [];
  const now = new Date();
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

  let current = new Date(startTime);
  while (current <= now) {
    timestamps.push(new Date(current));
    current = new Date(current.getTime() + intervalMinutes * 60 * 1000);
  }
  return timestamps;
}

// Generate real-time furnace status
export function generateFurnaceStatus() {
  const reactorAState = Math.random() > 0.1 ? 'processing' : (Math.random() > 0.5 ? 'idle' : 'loading');
  const reactorBState = Math.random() > 0.15 ? 'processing' : (Math.random() > 0.5 ? 'idle' : 'cooling');

  const activeRecipeA = reactorAState === 'processing' ? RECIPES[randomInt(0, RECIPES.length - 1)] : null;
  const activeRecipeB = reactorBState === 'processing' ? RECIPES[randomInt(0, RECIPES.length - 1)] : null;

  return {
    timestamp: new Date().toISOString(),
    systemStatus: 'online',
    reactorA: {
      state: reactorAState,
      recipe: activeRecipeA,
      progress: reactorAState === 'processing' ? randomInt(5, 95) : 0,
      temperature: reactorAState === 'processing' ? gaussianRandom(activeRecipeA?.temperature || 700, 2) : randomBetween(25, 50),
      pressure: reactorAState === 'processing' ? gaussianRandom(activeRecipeA?.pressure || 0.25, 0.01) : 760,
      wafersLoaded: reactorAState !== 'idle' ? randomInt(75, 100) : 0,
      elapsedMinutes: reactorAState === 'processing' ? randomInt(10, activeRecipeA?.duration - 10 || 150) : 0
    },
    reactorB: {
      state: reactorBState,
      recipe: activeRecipeB,
      progress: reactorBState === 'processing' ? randomInt(5, 95) : 0,
      temperature: reactorBState === 'processing' ? gaussianRandom(activeRecipeB?.temperature || 700, 2) : randomBetween(25, 200),
      pressure: reactorBState === 'processing' ? gaussianRandom(activeRecipeB?.pressure || 0.25, 0.01) : 760,
      wafersLoaded: reactorBState !== 'idle' ? randomInt(75, 100) : 0,
      elapsedMinutes: reactorBState === 'processing' ? randomInt(10, activeRecipeB?.duration - 10 || 150) : 0
    },
    stocker: {
      capacity: 300,
      occupied: randomInt(80, 250),
      inQueue: randomInt(2, 8)
    },
    utilities: {
      n2Pressure: gaussianRandom(80, 2), // psi
      facilityWater: gaussianRandom(45, 1), // psi
      exhaustFlow: gaussianRandom(500, 20), // CFM
      cleanroomClass: 100
    }
  };
}

// Generate temperature zone data over time
export function generateTemperatureHistory(hours = 24) {
  const timestamps = generateTimestamps(hours, 5);
  const zones = COMPONENTS.heatingElements.zones;

  return timestamps.map(ts => {
    const baseTemp = 700 + Math.sin(ts.getTime() / 3600000) * 50;
    const data = { timestamp: ts.toISOString() };

    zones.forEach((zone, idx) => {
      const zoneOffset = (idx - 2) * 5; // Center zone is baseline
      data[zone] = Math.round(gaussianRandom(baseTemp + zoneOffset, 3) * 10) / 10;
    });

    return data;
  });
}

// Generate pressure data over time
export function generatePressureHistory(hours = 24) {
  const timestamps = generateTimestamps(hours, 5);

  return timestamps.map(ts => {
    const isLPCVD = Math.random() > 0.3;
    return {
      timestamp: ts.toISOString(),
      reactorA: isLPCVD ? gaussianRandom(0.25, 0.02) : gaussianRandom(760, 5),
      reactorB: isLPCVD ? gaussianRandom(0.28, 0.02) : gaussianRandom(758, 5),
      setpoint: isLPCVD ? 0.25 : 760
    };
  });
}

// Generate wafer throughput data
export function generateThroughputData(days = 30) {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseThroughput = isWeekend ? 800 : 1200;

    data.push({
      date: date.toISOString().split('T')[0],
      wafersProcessed: Math.round(gaussianRandom(baseThroughput, baseThroughput * 0.1)),
      batches: Math.round(gaussianRandom(baseThroughput / 90, 2)),
      uptime: Math.round(gaussianRandom(isWeekend ? 85 : 94, 3) * 10) / 10,
      yield: Math.round(gaussianRandom(98.5, 0.8) * 10) / 10
    });
  }

  return data;
}

// Generate component health data
export function generateComponentHealth() {
  const now = new Date();
  const installDate = new Date(FURNACE_CONFIG.installDate);
  const operatingHours = Math.round((now - installDate) / (1000 * 60 * 60));

  return Object.entries(COMPONENTS).map(([key, component]) => {
    const cyclesSinceLastPM = randomInt(500, 3000);
    const hoursSinceLastPM = cyclesSinceLastPM * 3; // ~3 hours per cycle average
    const degradation = Math.min(100, hoursSinceLastPM * component.wearRate);
    const healthScore = Math.max(0, 100 - degradation + gaussianRandom(0, 5));

    const status = healthScore >= 90 ? 'good' :
                   healthScore >= component.criticalThreshold ? 'fair' :
                   healthScore >= 60 ? 'warning' : 'critical';

    const nextPMDue = new Date(now.getTime() + (component.mtbfHours - hoursSinceLastPM) * 3600000);

    return {
      id: key,
      name: component.name,
      healthScore: Math.round(healthScore * 10) / 10,
      status,
      hoursSinceLastPM,
      cyclesSinceLastPM,
      estimatedRUL: Math.max(0, component.mtbfHours - hoursSinceLastPM), // Remaining Useful Life
      nextPMDue: nextPMDue.toISOString().split('T')[0],
      lastPMDate: new Date(now.getTime() - hoursSinceLastPM * 3600000).toISOString().split('T')[0],
      mtbf: component.mtbfHours,
      criticalThreshold: component.criticalThreshold
    };
  });
}

// Generate health trend data
export function generateHealthTrend(componentId, days = 90) {
  const component = COMPONENTS[componentId];
  if (!component) return [];

  const data = [];
  const now = new Date();
  let currentHealth = 100;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate PM events that reset health
    if (i % 30 === 0 && i !== 0) {
      currentHealth = randomBetween(95, 100);
    } else {
      currentHealth -= component.wearRate * 24 / 100 * randomBetween(0.8, 1.2);
      currentHealth = Math.max(50, currentHealth);
    }

    data.push({
      date: date.toISOString().split('T')[0],
      health: Math.round(currentHealth * 10) / 10,
      threshold: component.criticalThreshold
    });
  }

  return data;
}

// Generate alarm/event history
export function generateAlarmHistory(days = 7) {
  const alarms = [];
  const alarmTypes = [
    { code: 'TEMP-001', message: 'Temperature deviation Zone 3', severity: 'warning', component: 'heatingElements' },
    { code: 'TEMP-002', message: 'Over-temperature alarm Zone 1', severity: 'critical', component: 'heatingElements' },
    { code: 'PRES-001', message: 'Pressure setpoint deviation', severity: 'warning', component: 'vacuumPump' },
    { code: 'PRES-002', message: 'Vacuum pump performance degradation', severity: 'warning', component: 'vacuumPump' },
    { code: 'GAS-001', message: 'N2 flow rate deviation', severity: 'info', component: 'gasDelivery' },
    { code: 'GAS-002', message: 'SiH4 MFC calibration required', severity: 'warning', component: 'gasDelivery' },
    { code: 'MECH-001', message: 'Boat loader position sensor', severity: 'warning', component: 'boatLoader' },
    { code: 'MECH-002', message: 'Door seal integrity check', severity: 'info', component: 'doorSeal' },
    { code: 'TC-001', message: 'Thermocouple drift detected', severity: 'warning', component: 'thermocouples' },
    { code: 'SYS-001', message: 'Scheduled PM reminder', severity: 'info', component: null }
  ];

  const now = new Date();
  const alarmsPerDay = randomInt(2, 8);

  for (let d = 0; d < days; d++) {
    const count = randomInt(1, alarmsPerDay);
    for (let i = 0; i < count; i++) {
      const alarm = alarmTypes[randomInt(0, alarmTypes.length - 1)];
      const timestamp = new Date(now.getTime() - d * 24 * 60 * 60 * 1000 - randomInt(0, 23) * 60 * 60 * 1000);

      alarms.push({
        id: `ALM-${Date.now()}-${d}-${i}`,
        ...alarm,
        timestamp: timestamp.toISOString(),
        reactor: Math.random() > 0.5 ? 'Reactor A' : 'Reactor B',
        acknowledged: d > 0 || Math.random() > 0.3,
        resolved: d > 1 || Math.random() > 0.5
      });
    }
  }

  return alarms.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Generate maintenance schedule
export function generateMaintenanceSchedule() {
  const componentHealth = generateComponentHealth();
  const now = new Date();

  const schedule = componentHealth
    .filter(c => c.status !== 'good' || new Date(c.nextPMDue) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
    .map(c => {
      const urgency = c.status === 'critical' ? 'immediate' :
                      c.status === 'warning' ? 'high' :
                      c.status === 'fair' ? 'medium' : 'low';

      const tasks = generatePMTasks(c.id);
      const estimatedDuration = tasks.reduce((sum, t) => sum + t.duration, 0);

      return {
        id: `PM-${c.id}-${Date.now()}`,
        componentId: c.id,
        componentName: c.name,
        scheduledDate: c.nextPMDue,
        urgency,
        status: urgency === 'immediate' ? 'overdue' : 'scheduled',
        healthScore: c.healthScore,
        estimatedDuration,
        tasks,
        estimatedCost: estimatedDuration * 150 + randomInt(500, 2000),
        spareParts: generateSpareParts(c.id)
      };
    })
    .sort((a, b) => {
      const urgencyOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

  return schedule;
}

// Generate PM tasks for a component
function generatePMTasks(componentId) {
  const taskTemplates = {
    heatingElements: [
      { name: 'Visual inspection of heating elements', duration: 30 },
      { name: 'Resistance measurement', duration: 45 },
      { name: 'Zone uniformity calibration', duration: 60 },
      { name: 'Replace degraded elements', duration: 120 }
    ],
    quartzTube: [
      { name: 'Inspect for cracks and deposits', duration: 30 },
      { name: 'Clean quartz tube', duration: 90 },
      { name: 'Check tube alignment', duration: 20 }
    ],
    vacuumPump: [
      { name: 'Check oil level and quality', duration: 15 },
      { name: 'Replace pump oil', duration: 45 },
      { name: 'Inspect pump seals', duration: 30 },
      { name: 'Performance test', duration: 30 }
    ],
    gasDelivery: [
      { name: 'MFC calibration verification', duration: 60 },
      { name: 'Leak check gas lines', duration: 45 },
      { name: 'Replace gas filters', duration: 30 }
    ],
    boatLoader: [
      { name: 'Lubricate moving parts', duration: 30 },
      { name: 'Check alignment', duration: 45 },
      { name: 'Inspect paddle condition', duration: 20 }
    ],
    thermocouples: [
      { name: 'Calibration verification', duration: 60 },
      { name: 'Replace drifted thermocouples', duration: 45 }
    ],
    doorSeal: [
      { name: 'Inspect O-ring condition', duration: 15 },
      { name: 'Replace O-rings', duration: 30 },
      { name: 'Vacuum integrity test', duration: 20 }
    ],
    exhaustSystem: [
      { name: 'Clean exhaust lines', duration: 60 },
      { name: 'Check scrubber efficiency', duration: 30 }
    ]
  };

  return taskTemplates[componentId] || [{ name: 'General inspection', duration: 30 }];
}

// Generate spare parts requirements
function generateSpareParts(componentId) {
  const partsTemplates = {
    heatingElements: [
      { partNumber: 'HE-A400-Z1', name: 'Heating Element Zone 1', quantity: 1, cost: 850 },
      { partNumber: 'HE-A400-Z3', name: 'Heating Element Zone 3', quantity: 1, cost: 950 }
    ],
    quartzTube: [
      { partNumber: 'QT-A400-200', name: 'Quartz Process Tube 200mm', quantity: 1, cost: 4500 }
    ],
    vacuumPump: [
      { partNumber: 'VP-OIL-5L', name: 'Vacuum Pump Oil 5L', quantity: 2, cost: 120 },
      { partNumber: 'VP-SEAL-KIT', name: 'Pump Seal Kit', quantity: 1, cost: 280 }
    ],
    gasDelivery: [
      { partNumber: 'MFC-CAL-KIT', name: 'MFC Calibration Kit', quantity: 1, cost: 350 },
      { partNumber: 'GAS-FILTER', name: 'Gas Line Filter', quantity: 5, cost: 45 }
    ],
    doorSeal: [
      { partNumber: 'OR-A400-DOOR', name: 'Door O-Ring Set', quantity: 1, cost: 180 }
    ],
    thermocouples: [
      { partNumber: 'TC-K-TYPE', name: 'K-Type Thermocouple', quantity: 2, cost: 95 }
    ]
  };

  return partsTemplates[componentId] || [];
}

// Generate OEE (Overall Equipment Effectiveness) data
export function generateOEEData(days = 30) {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const availability = gaussianRandom(92, 3);
    const performance = gaussianRandom(95, 2);
    const quality = gaussianRandom(98.5, 0.8);
    const oee = (availability * performance * quality) / 10000;

    data.push({
      date: date.toISOString().split('T')[0],
      availability: Math.round(Math.min(100, Math.max(75, availability)) * 10) / 10,
      performance: Math.round(Math.min(100, Math.max(80, performance)) * 10) / 10,
      quality: Math.round(Math.min(100, Math.max(95, quality)) * 10) / 10,
      oee: Math.round(Math.min(100, Math.max(70, oee)) * 10) / 10
    });
  }

  return data;
}

// Generate process run history
export function generateProcessHistory(count = 50) {
  const history = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const recipe = RECIPES[randomInt(0, RECIPES.length - 1)];
    const startTime = new Date(now.getTime() - i * randomInt(180, 300) * 60 * 1000);
    const actualDuration = Math.round(recipe.duration * gaussianRandom(1, 0.05));
    const endTime = new Date(startTime.getTime() + actualDuration * 60 * 1000);

    const tempDeviation = gaussianRandom(0, 2);
    const pressDeviation = gaussianRandom(0, 0.02);

    history.push({
      id: `RUN-${Date.now()}-${i}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      reactor: Math.random() > 0.5 ? 'Reactor A' : 'Reactor B',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: actualDuration,
      wafersProcessed: randomInt(85, 100),
      status: Math.random() > 0.05 ? 'completed' : 'aborted',
      results: {
        avgTemperature: Math.round((recipe.temperature + tempDeviation) * 10) / 10,
        tempUniformity: Math.round(gaussianRandom(0.5, 0.2) * 100) / 100,
        avgPressure: Math.round((recipe.pressure + pressDeviation) * 1000) / 1000,
        filmThickness: Math.round(gaussianRandom(100, 5)),
        thicknessUniformity: Math.round(gaussianRandom(1.5, 0.5) * 10) / 10
      }
    });
  }

  return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

// Calculate overall health score
export function calculateOverallHealth() {
  const components = generateComponentHealth();
  const weights = {
    heatingElements: 0.2,
    quartzTube: 0.15,
    vacuumPump: 0.15,
    gasDelivery: 0.15,
    boatLoader: 0.1,
    thermocouples: 0.1,
    doorSeal: 0.08,
    exhaustSystem: 0.07
  };

  let weightedSum = 0;
  let totalWeight = 0;

  components.forEach(c => {
    const weight = weights[c.id] || 0.1;
    weightedSum += c.healthScore * weight;
    totalWeight += weight;
  });

  const overallScore = weightedSum / totalWeight;

  return {
    score: Math.round(overallScore * 10) / 10,
    status: overallScore >= 90 ? 'excellent' :
            overallScore >= 80 ? 'good' :
            overallScore >= 70 ? 'fair' : 'needs attention',
    components
  };
}

// Generate maintenance recommendations
export function generateMaintenanceRecommendations() {
  const health = calculateOverallHealth();
  const recommendations = [];

  health.components
    .filter(c => c.status !== 'good')
    .forEach(c => {
      const daysUntilPM = Math.ceil((new Date(c.nextPMDue) - new Date()) / (1000 * 60 * 60 * 24));

      recommendations.push({
        id: `REC-${c.id}`,
        priority: c.status === 'critical' ? 1 : c.status === 'warning' ? 2 : 3,
        component: c.name,
        action: c.status === 'critical'
          ? `Immediate maintenance required for ${c.name}`
          : c.status === 'warning'
          ? `Schedule PM for ${c.name} within ${Math.max(1, daysUntilPM)} days`
          : `Plan PM for ${c.name} in the next maintenance window`,
        impact: c.status === 'critical'
          ? 'Risk of unplanned downtime'
          : 'Potential performance degradation',
        estimatedDowntime: c.status === 'critical' ? '4-8 hours' : '2-4 hours',
        confidence: Math.round(gaussianRandom(85, 5))
      });
    });

  // Add predictive recommendations
  if (Math.random() > 0.5) {
    recommendations.push({
      id: 'REC-PRED-1',
      priority: 3,
      component: 'System',
      action: 'Consider scheduling a full system calibration based on recent process data trends',
      impact: 'Improved process consistency',
      estimatedDowntime: '6-8 hours',
      confidence: 72
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

// Export all generators
export default {
  FURNACE_CONFIG,
  COMPONENTS,
  RECIPES,
  generateFurnaceStatus,
  generateTemperatureHistory,
  generatePressureHistory,
  generateThroughputData,
  generateComponentHealth,
  generateHealthTrend,
  generateAlarmHistory,
  generateMaintenanceSchedule,
  generateOEEData,
  generateProcessHistory,
  calculateOverallHealth,
  generateMaintenanceRecommendations
};
