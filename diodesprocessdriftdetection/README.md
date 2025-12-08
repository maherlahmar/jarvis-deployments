# Supply Chain Visibility Platform - Diodes Inc.

Multi-tier supply chain visibility and mapping application for monitoring suppliers across all tiers, identifying geographic concentration risks, and providing diversification recommendations.

## Features

### Dashboard
- Executive summary with key metrics and KPIs
- Tier distribution visualization (Tier 1, 2, 3 suppliers)
- Geographic concentration analysis by country
- Risk distribution overview
- High-risk supplier alerts

### Interactive Supply Chain Map
- Geographic visualization of all suppliers using Leaflet
- Color-coded markers by tier level
- Risk indicators via marker borders
- Interactive popups with supplier details
- Filtering by tier, country, and risk level

### Network View
- D3.js force-directed graph visualization
- Hierarchical radial layout by tier
- Interactive node selection with detail panel
- Zoom and pan capabilities
- Filter by specific tiers

### Risk Alerts
- Comprehensive risk monitoring dashboard
- Multi-factor risk scoring (geopolitical, natural disaster, water scarcity)
- ESG audit score tracking
- Single-source dependency identification
- Sortable and filterable risk table

### Product Dependencies
- Component-to-supplier mapping
- Criticality tracking (High/Medium)
- Volume analysis
- Risk exposure by product
- Expandable component details

### Diversification Recommendations
- AI-generated strategic recommendations
- Priority-based action items
- Risk reduction estimates
- Implementation guidance
- Impact assessment

## Technology Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Zustand for state management
- Recharts for charts
- Leaflet + React-Leaflet for maps
- D3.js for network visualization

### Backend
- Node.js + Express
- PostgreSQL database
- RESTful API

### Deployment
- Docker + Docker Compose
- Nginx reverse proxy
- Coolify-ready configuration

## Quick Start

### Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (requires PostgreSQL)
cd backend
npm install
npm run dev
```

### Production (Docker)

```bash
docker-compose up -d
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/suppliers` - List all suppliers (filterable)
- `GET /api/suppliers/:id` - Get supplier details with risk
- `GET /api/risk` - Get risk monitoring data
- `GET /api/products` - Get product components
- `GET /api/analytics/concentration` - Geographic concentration analysis
- `GET /api/analytics/recommendations` - Diversification recommendations
- `GET /api/network` - Supply chain network graph data
- `GET /api/alerts` - High-risk supplier alerts

## Data Model

### Suppliers
- Supplier ID, Name, Tier Level
- Location (Country, City, Lat/Long)
- Site Function
- Supply Chain Relationships

### Risk Monitoring
- Geopolitical Risk Index
- Natural Disaster Risk Index
- Water Scarcity Index
- Overall Risk Score
- ESG Audit Score
- Alternative Source Count

### Product Components
- Diodes SKU
- Component Name
- Supplier ID
- Annual Volume
- Criticality Flag

## Environment Variables

### Backend
- `PORT` - Server port (default: 8000)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

## Architecture

```
supply-chain-visibility/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   └── package.json
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   └── src/
│       └── utils/
│           └── initDb.js
└── README.md
```

## Key Insights from Data

1. **Geographic Concentration Risk**: Taiwan and China represent significant concentration with high geopolitical risk indices
2. **Single Source Dependencies**: Multiple suppliers have no alternatives (alternative_source_count = 0)
3. **Natural Disaster Exposure**: Japan suppliers show high natural disaster risk due to seismic activity
4. **ESG Compliance Gaps**: Vietnam suppliers show lower ESG audit scores requiring improvement programs

## Deployment Notes

- Uses relative asset paths (`base: './'`) for Coolify/Docker compatibility
- No internal Docker healthchecks (managed externally by Coolify)
- Uses `expose` instead of `ports` for container networking
- Nginx proxies `/api/*` requests to backend service
