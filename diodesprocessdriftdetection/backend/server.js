const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 8000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Import services
const ProcessDataGenerator = require('./src/services/processDataGenerator');
const SPCEngine = require('./src/services/spcEngine');
const DriftDetector = require('./src/services/driftDetector');
const AlertManager = require('./src/services/alertManager');

// Initialize services
const dataGenerator = new ProcessDataGenerator();
const spcEngine = new SPCEngine();
const driftDetector = new DriftDetector();
const alertManager = new AlertManager();

// Store historical data
let processHistory = [];
let batchHistory = [];
let alertHistory = [];

// Process parameters configuration
const processParameters = {
  temperature: {
    name: 'Temperature',
    unit: '\u00B0C',
    target: 25.0,
    ucl: 27.0,
    lcl: 23.0,
    usl: 28.0,
    lsl: 22.0,
    category: 'thermal'
  },
  pressure: {
    name: 'Chamber Pressure',
    unit: 'mTorr',
    target: 100.0,
    ucl: 105.0,
    lcl: 95.0,
    usl: 110.0,
    lsl: 90.0,
    category: 'vacuum'
  },
  gasFlow: {
    name: 'Gas Flow Rate',
    unit: 'sccm',
    target: 50.0,
    ucl: 52.0,
    lcl: 48.0,
    usl: 55.0,
    lsl: 45.0,
    category: 'gas'
  },
  rfPower: {
    name: 'RF Power',
    unit: 'W',
    target: 300.0,
    ucl: 310.0,
    lcl: 290.0,
    usl: 320.0,
    lsl: 280.0,
    category: 'power'
  },
  etchRate: {
    name: 'Etch Rate',
    unit: 'nm/min',
    target: 150.0,
    ucl: 158.0,
    lcl: 142.0,
    usl: 165.0,
    lsl: 135.0,
    category: 'process'
  },
  uniformity: {
    name: 'Uniformity',
    unit: '%',
    target: 2.0,
    ucl: 2.5,
    lcl: 0.5,
    usl: 3.0,
    lsl: 0.0,
    category: 'quality'
  },
  deposition: {
    name: 'Deposition Thickness',
    unit: 'nm',
    target: 100.0,
    ucl: 104.0,
    lcl: 96.0,
    usl: 108.0,
    lsl: 92.0,
    category: 'process'
  },
  humidity: {
    name: 'Humidity',
    unit: '%RH',
    target: 45.0,
    ucl: 48.0,
    lcl: 42.0,
    usl: 50.0,
    lsl: 40.0,
    category: 'environmental'
  }
};

// Manufacturing lines
const manufacturingLines = ['Line A', 'Line B', 'Line C', 'Line D'];

// Generate initial historical data
function initializeHistoricalData() {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;

  for (let i = 480; i >= 0; i--) {
    const timestamp = now - (i * hourInMs / 10);
    const reading = dataGenerator.generateReading(processParameters, timestamp, i);
    processHistory.push(reading);

    // Run SPC analysis
    const spcResults = spcEngine.analyze(reading, processParameters);
    reading.spcResults = spcResults;

    // Check for drift
    const driftResults = driftDetector.detect(processHistory, processParameters);
    reading.driftResults = driftResults;

    // Generate alerts if needed
    const alerts = alertManager.checkForAlerts(reading, spcResults, driftResults, processParameters);
    if (alerts.length > 0) {
      alertHistory.push(...alerts);
    }
  }

  // Generate batch history
  for (let i = 0; i < 50; i++) {
    const batch = {
      id: `BATCH-${String(1000 + i).padStart(4, '0')}`,
      startTime: now - ((50 - i) * 4 * hourInMs),
      endTime: now - ((49 - i) * 4 * hourInMs),
      line: manufacturingLines[i % 4],
      product: ['PM-2000', 'PM-3000', 'PM-4000'][i % 3],
      waferCount: 25,
      yieldPercent: 85 + Math.random() * 12,
      status: i < 48 ? 'completed' : (i === 49 ? 'in_progress' : 'completed'),
      defects: Math.floor(Math.random() * 5),
      processDeviations: Math.floor(Math.random() * 3)
    };
    batchHistory.push(batch);
  }

  console.log(`Initialized ${processHistory.length} historical readings`);
  console.log(`Initialized ${batchHistory.length} batch records`);
  console.log(`Generated ${alertHistory.length} historical alerts`);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial data
  ws.send(JSON.stringify({
    type: 'INIT',
    data: {
      parameters: processParameters,
      lines: manufacturingLines,
      recentHistory: processHistory.slice(-100),
      alerts: alertHistory.slice(-50),
      batches: batchHistory.slice(-10)
    }
  }));

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      handleWebSocketMessage(ws, msg);
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function handleWebSocketMessage(ws, msg) {
  switch (msg.type) {
    case 'GET_HISTORY':
      const historySlice = processHistory.slice(-(msg.count || 100));
      ws.send(JSON.stringify({ type: 'HISTORY', data: historySlice }));
      break;

    case 'GET_ALERTS':
      ws.send(JSON.stringify({ type: 'ALERTS', data: alertHistory.slice(-100) }));
      break;

    case 'ACKNOWLEDGE_ALERT':
      const alertIndex = alertHistory.findIndex(a => a.id === msg.alertId);
      if (alertIndex !== -1) {
        alertHistory[alertIndex].acknowledged = true;
        alertHistory[alertIndex].acknowledgedAt = Date.now();
        broadcast({ type: 'ALERT_UPDATED', data: alertHistory[alertIndex] });
      }
      break;

    case 'GET_BATCHES':
      ws.send(JSON.stringify({ type: 'BATCHES', data: batchHistory }));
      break;

    case 'GET_PARAMETER_HISTORY':
      const paramHistory = processHistory.map(r => ({
        timestamp: r.timestamp,
        value: r.parameters[msg.parameter],
        line: r.line
      }));
      ws.send(JSON.stringify({ type: 'PARAMETER_HISTORY', parameter: msg.parameter, data: paramHistory }));
      break;
  }
}

function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Real-time data simulation
let simulationCounter = 0;
setInterval(() => {
  simulationCounter++;
  const timestamp = Date.now();
  const reading = dataGenerator.generateReading(processParameters, timestamp, simulationCounter);

  // Run SPC analysis
  const spcResults = spcEngine.analyze(reading, processParameters);
  reading.spcResults = spcResults;

  // Add to history
  processHistory.push(reading);
  if (processHistory.length > 1000) {
    processHistory = processHistory.slice(-1000);
  }

  // Check for drift (every 10 readings)
  if (simulationCounter % 10 === 0) {
    const driftResults = driftDetector.detect(processHistory, processParameters);
    reading.driftResults = driftResults;

    // Generate alerts
    const alerts = alertManager.checkForAlerts(reading, spcResults, driftResults, processParameters);
    if (alerts.length > 0) {
      alertHistory.push(...alerts);
      alerts.forEach(alert => {
        broadcast({ type: 'NEW_ALERT', data: alert });
      });
    }
  }

  // Broadcast new reading
  broadcast({ type: 'READING', data: reading });

}, 2000);

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/parameters', (req, res) => {
  res.json({ success: true, data: processParameters });
});

app.get('/api/readings', (req, res) => {
  const count = parseInt(req.query.count) || 100;
  res.json({ success: true, data: processHistory.slice(-count) });
});

app.get('/api/readings/:parameter', (req, res) => {
  const { parameter } = req.params;
  const count = parseInt(req.query.count) || 100;

  if (!processParameters[parameter]) {
    return res.status(404).json({ success: false, error: 'Parameter not found' });
  }

  const data = processHistory.slice(-count).map(r => ({
    timestamp: r.timestamp,
    value: r.parameters[parameter],
    line: r.line,
    spc: r.spcResults?.[parameter]
  }));

  res.json({ success: true, data });
});

app.get('/api/alerts', (req, res) => {
  const count = parseInt(req.query.count) || 50;
  const unacknowledgedOnly = req.query.unacknowledged === 'true';

  let alerts = alertHistory.slice(-count);
  if (unacknowledgedOnly) {
    alerts = alerts.filter(a => !a.acknowledged);
  }

  res.json({ success: true, data: alerts });
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const alertIndex = alertHistory.findIndex(a => a.id === id);

  if (alertIndex === -1) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  alertHistory[alertIndex].acknowledged = true;
  alertHistory[alertIndex].acknowledgedAt = Date.now();

  broadcast({ type: 'ALERT_UPDATED', data: alertHistory[alertIndex] });

  res.json({ success: true, data: alertHistory[alertIndex] });
});

app.get('/api/batches', (req, res) => {
  res.json({ success: true, data: batchHistory });
});

app.get('/api/batches/:id', (req, res) => {
  const batch = batchHistory.find(b => b.id === req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

app.get('/api/spc/summary', (req, res) => {
  const recentReadings = processHistory.slice(-50);
  const summary = {};

  Object.keys(processParameters).forEach(param => {
    const values = recentReadings.map(r => r.parameters[param]).filter(v => v !== undefined);
    const config = processParameters[param];

    summary[param] = spcEngine.calculateSummary(values, config);
  });

  res.json({ success: true, data: summary });
});

app.get('/api/drift/status', (req, res) => {
  const driftResults = driftDetector.detect(processHistory, processParameters);
  res.json({ success: true, data: driftResults });
});

app.get('/api/statistics', (req, res) => {
  const totalReadings = processHistory.length;
  const totalAlerts = alertHistory.length;
  const unacknowledgedAlerts = alertHistory.filter(a => !a.acknowledged).length;
  const activeBatches = batchHistory.filter(b => b.status === 'in_progress').length;

  const recentReadings = processHistory.slice(-100);
  const outOfSpec = recentReadings.filter(r => {
    return Object.keys(r.spcResults || {}).some(param => {
      const result = r.spcResults[param];
      return result?.outOfControl || result?.outOfSpec;
    });
  }).length;

  const avgYield = batchHistory.slice(-10).reduce((sum, b) => sum + b.yieldPercent, 0) / 10;

  res.json({
    success: true,
    data: {
      totalReadings,
      totalAlerts,
      unacknowledgedAlerts,
      activeBatches,
      outOfSpecPercent: (outOfSpec / recentReadings.length * 100).toFixed(1),
      avgYield: avgYield.toFixed(1),
      uptime: process.uptime()
    }
  });
});

// Initialize and start server
initializeHistoricalData();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});
