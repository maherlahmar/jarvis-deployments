# Diodes Process Variation & Drift Detection System

Real-time monitoring and drift detection system for analog IC manufacturing processes. Designed to address process sensitivity issues in temperature, pressure, and chemical concentrations that impact Diodes' 28-32% gross margin targets.

## Features

### Real-Time Monitoring
- Live parameter tracking with control charts
- 8 critical process parameters monitored simultaneously
- Multi-line manufacturing support (Lines A-D)
- 2-second update intervals

### Drift Detection Algorithms
- **CUSUM (Cumulative Sum)**: Detects sustained small shifts
- **EWMA (Exponentially Weighted Moving Average)**: Sensitive to gradual changes
- **Trend Analysis**: Linear regression for drift prediction
- **Process Shift Detection**: Identifies sudden mean changes

### Statistical Process Control
- X-bar and Moving Range charts
- Control limits (UCL/LCL) and Specification limits (USL/LSL)
- Process capability indices (Cp, Cpk, Ppk)
- Western Electric rules for pattern detection

### Alert Management
- Real-time alerts for out-of-control conditions
- Severity levels: Critical, Warning, Info
- Alert cooldown to prevent notification fatigue
- Recommended actions for each alert type

### Batch Tracking
- Production batch monitoring
- Yield analysis by line and product
- Defect tracking and correlation
- Historical batch performance

### Reports & Analytics
- SPC summary reports
- Capability index comparisons
- Yield impact analysis
- Export to JSON format

## Process Parameters Monitored

| Parameter | Target | UCL/LCL | USL/LSL | Unit |
|-----------|--------|---------|---------|------|
| Temperature | 25.0 | 27.0/23.0 | 28.0/22.0 | C |
| Chamber Pressure | 100.0 | 105.0/95.0 | 110.0/90.0 | mTorr |
| Gas Flow Rate | 50.0 | 52.0/48.0 | 55.0/45.0 | sccm |
| RF Power | 300.0 | 310.0/290.0 | 320.0/280.0 | W |
| Etch Rate | 150.0 | 158.0/142.0 | 165.0/135.0 | nm/min |
| Uniformity | 2.0 | 2.5/0.5 | 3.0/0.0 | % |
| Deposition Thickness | 100.0 | 104.0/96.0 | 108.0/92.0 | nm |
| Humidity | 45.0 | 48.0/42.0 | 50.0/40.0 | %RH |

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Recharts, Zustand
- **Backend**: Node.js, Express, WebSocket (ws)
- **Deployment**: Docker, nginx, Coolify-ready

## Quick Start

### Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (separate terminal)
cd backend
npm install
npm start
```

Frontend: http://localhost:3000
Backend API: http://localhost:8000

### Production Build

```bash
cd frontend
npm run build
```

### Docker Deployment

```bash
docker-compose up --build
```

## Project Structure

```
diodes-process-drift-detection/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API & WebSocket services
│   │   ├── store/          # Zustand state management
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # Global CSS
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── src/
│   │   └── services/       # Business logic
│   ├── server.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/parameters | Get parameter configurations |
| GET | /api/readings | Get recent readings |
| GET | /api/readings/:param | Get readings for specific parameter |
| GET | /api/alerts | Get alerts |
| POST | /api/alerts/:id/acknowledge | Acknowledge alert |
| GET | /api/batches | Get batch history |
| GET | /api/spc/summary | Get SPC summary statistics |
| GET | /api/drift/status | Get drift detection results |
| GET | /api/statistics | Get system statistics |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| INIT | Server -> Client | Initial data on connection |
| READING | Server -> Client | New process reading |
| NEW_ALERT | Server -> Client | New alert generated |
| ALERT_UPDATED | Server -> Client | Alert status changed |

## Drift Detection Methods

### CUSUM (Cumulative Sum Control Chart)
- Slack parameter (K): 0.5
- Decision interval (H): 5.0
- Detects small sustained shifts (~0.5-1.0 sigma)

### EWMA (Exponentially Weighted Moving Average)
- Smoothing factor (lambda): 0.2
- Control limit width (L): 3.0
- Sensitive to gradual process changes

### Trend Analysis
- Window size: 50 readings
- Significance threshold: R-squared > 0.3
- Projects drift 100 readings ahead

## Environment Variables

### Backend
- `PORT`: Server port (default: 8000)
- `NODE_ENV`: Environment (production/development)

### Frontend (Coolify)
- `COOLIFY_FQDN`: Domain name for deployment
- `COOLIFY_RESOURCE_UUID`: Resource identifier
