# System Architecture

## Overview

Facilis Starch Optimizer is a single-page application (SPA) built with React and optimized for real-time manufacturing process monitoring and optimization. The architecture follows modern web development best practices with a focus on performance, maintainability, and scalability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Dashboard │  │ KPI Metrics  │  │  Recommendations  │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Component Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  KPICard     │  │ MetricCard   │  │  AlarmPanel      │  │
│  │  TrendChart  │  │ Header       │  │  RecCard         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management (Zustand)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • Process Data      • Recommendations                 │ │
│  │  • KPI Metrics       • Alarms                          │ │
│  │  • Historical Data   • Connection Status              │ │
│  │  • Dark Mode         • UI State                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Utility Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Formatters  │  │   Validators │  │   Calculators    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Simulation Layer                     │
│            (Future: Replace with Real API/WebSocket)        │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. State Management (Zustand)

**File:** `src/store/useProcessStore.js`

Centralized state management using Zustand for:
- Process data (temperature, viscosity, moisture, etc.)
- KPI metrics (OEE, yield, efficiency)
- Setpoint recommendations
- Alarm notifications
- Historical data for trending
- UI state (dark mode, connection status)

**Key Features:**
- Single source of truth
- Minimal boilerplate
- TypeScript-ready
- DevTools integration
- Persistent state (localStorage for dark mode)

### 2. Component Architecture

#### Presentation Components
Stateless components focused on UI rendering:

- **KPICard**: Displays key performance indicators with trend arrows
- **ProcessMetricCard**: Shows real-time process parameters with range bars
- **RecommendationCard**: Presents AI-generated setpoint suggestions
- **AlarmPanel**: Lists active alarms with severity indicators
- **TrendChart**: Visualizes historical data using Recharts
- **Header**: Application header with status and theme toggle

#### Container Components
Stateful components managing data flow:

- **Dashboard**: Main container orchestrating all components
- **App**: Root component with routing and initialization

### 3. Data Flow

```
User Action → Component → State Update → Re-render → UI Update
                                  ↓
                          Side Effects (if any)
                                  ↓
                          External API (future)
```

### 4. Styling Architecture

**Approach:** Utility-first with TailwindCSS

- **Global Styles:** `src/styles/index.css`
  - CSS custom properties for theme colors
  - Dark mode configuration
  - Component utility classes

- **Component Styles:** Inline Tailwind classes
  - Responsive design with breakpoints
  - Dark mode variants
  - Custom animations

- **Theme System:**
  - CSS variables for colors
  - Automatic dark mode switching
  - System preference detection

## Key Design Decisions

### 1. State Management: Zustand vs Redux

**Choice:** Zustand

**Rationale:**
- Simpler API with less boilerplate
- Better performance (no context providers)
- Smaller bundle size
- Easier testing
- TypeScript-first design

### 2. Styling: TailwindCSS vs CSS-in-JS

**Choice:** TailwindCSS

**Rationale:**
- Faster development
- Smaller runtime overhead
- Better performance (no runtime style injection)
- Consistent design system
- Excellent dark mode support

### 3. Charts: Recharts vs Chart.js

**Choice:** Recharts

**Rationale:**
- React-first API
- Composable components
- Better TypeScript support
- Declarative syntax
- Responsive by default

### 4. Animation: Framer Motion vs CSS

**Choice:** Framer Motion

**Rationale:**
- Physics-based animations
- Gesture support
- Layout animations
- Simple API
- Production-ready performance

## Data Model

### Process Data Structure

```javascript
{
  temperature: Number,      // °C
  viscosity: Number,        // cP
  moisture: Number,         // %
  flowRate: Number,         // kg/h
  pressure: Number,         // bar
  pH: Number,               // 0-14
  solidsContent: Number,    // %
  drierSpeed: Number        // RPM
}
```

### KPI Structure

```javascript
{
  oee: Number,              // % (0-100)
  yield: Number,            // % (0-100)
  energyEfficiency: Number, // % (0-100)
  qualityIndex: Number,     // % (0-100)
  throughput: Number,       // kg/h
  downtime: Number          // hours
}
```

### Recommendation Structure

```javascript
{
  [parameter]: {
    current: Number,
    recommended: Number,
    confidence: Number      // 0-1
  }
}
```

### Alarm Structure

```javascript
{
  id: Number,
  severity: 'error' | 'warning' | 'info',
  message: String,
  parameter: String,
  value: String,
  timestamp: Date,
  acknowledged: Boolean
}
```

## Performance Optimizations

### 1. Code Splitting
- Route-based splitting
- Manual chunks for vendor libraries
- Dynamic imports for heavy components

### 2. Memoization
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers

### 3. Bundle Optimization
- Tree shaking enabled
- Minification with Terser
- Gzip compression in nginx
- Asset caching with hashed filenames

### 4. Render Optimization
- Virtualization for long lists (if needed)
- Debounced updates for high-frequency data
- Lazy loading for off-screen content

## Security Architecture

### 1. Content Security Policy
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self' ws: wss:
```

### 2. HTTP Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer-when-downgrade

### 3. Input Validation
- Client-side validation with Zod schemas
- Sanitization of user inputs
- Type checking at runtime

## Deployment Architecture

### Docker Multi-Stage Build

```dockerfile
Stage 1: Builder
- Node.js 18 Alpine
- Install dependencies
- Build production bundle

Stage 2: Production
- Nginx Alpine
- Copy built files
- Configure nginx
- Expose port 80
```

### Nginx Configuration
- MIME type handling for ES modules
- Gzip compression
- Asset caching
- SPA routing
- Security headers

## Scalability Considerations

### Current Architecture
- Single-page application
- Client-side rendering
- In-memory state management
- Simulated data updates

### Future Enhancements

#### Backend Integration
```
React App ←→ REST API ←→ Database
     ↕                    ↕
  WebSocket ←→ Message Queue
```

#### Real-Time Data
- WebSocket connection for live updates
- Server-Sent Events (SSE) for push notifications
- MQTT for IoT sensor integration

#### Data Persistence
- PostgreSQL for structured data
- TimescaleDB for time-series data
- Redis for caching
- S3 for file storage

#### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- OAuth2 integration
- Session management

## Testing Strategy

### Unit Tests
- Component testing with Testing Library
- State management tests
- Utility function tests
- 80%+ code coverage target

### Integration Tests
- User flow testing
- API integration tests
- WebSocket connection tests

### E2E Tests (Future)
- Playwright for browser automation
- Critical user journeys
- Cross-browser testing

## Monitoring & Observability

### Client-Side Monitoring (Future)
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User analytics (Mixpanel/Amplitude)
- Real User Monitoring (RUM)

### Metrics to Track
- Page load time
- Time to interactive
- API response times
- Error rates
- User engagement

## Future Roadmap

### Phase 1: Backend Integration
- REST API development
- WebSocket implementation
- Database setup
- Authentication system

### Phase 2: Advanced Analytics
- Machine learning model integration
- Predictive maintenance
- Anomaly detection
- Advanced reporting

### Phase 3: Multi-Plant Support
- Multi-tenancy
- Plant comparison dashboards
- Centralized monitoring
- Cross-plant analytics

### Phase 4: Mobile App
- React Native application
- Push notifications
- Offline support
- Mobile-optimized UI

## Maintenance & Updates

### Dependency Management
- Monthly security updates
- Quarterly feature updates
- Annual major version upgrades

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- Automated testing in CI/CD

### Documentation
- Component documentation
- API documentation
- Deployment guides
- Troubleshooting guides

---

**Last Updated:** January 24, 2025
**Version:** 1.0.0
