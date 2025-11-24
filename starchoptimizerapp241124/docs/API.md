# API Documentation

## Overview

This document describes the API structure for future backend integration. Currently, the application uses simulated data, but it's designed to be easily integrated with a real backend API.

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.facilis.com/v1
```

## Authentication

All API requests require authentication using JWT tokens:

```http
Authorization: Bearer <token>
```

## Endpoints

### Process Data

#### Get Current Process Data

```http
GET /process/current
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "temperature": 65.5,
    "viscosity": 15.2,
    "moisture": 12.8,
    "flowRate": 850,
    "pressure": 2.3,
    "pH": 6.5,
    "solidsContent": 87.2,
    "drierSpeed": 1200,
    "timestamp": "2025-01-24T10:30:00Z"
  }
}
```

#### Get Historical Process Data

```http
GET /process/historical?start={timestamp}&end={timestamp}&interval={minutes}
```

**Parameters:**
- `start` (ISO 8601 timestamp): Start time
- `end` (ISO 8601 timestamp): End time
- `interval` (number): Data interval in minutes (default: 5)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "temperature": 65.5,
      "viscosity": 15.2,
      "moisture": 12.8,
      "flowRate": 850,
      "pressure": 2.3,
      "pH": 6.5,
      "solidsContent": 87.2,
      "drierSpeed": 1200,
      "timestamp": "2025-01-24T10:00:00Z"
    }
  ],
  "meta": {
    "count": 100,
    "interval": 5
  }
}
```

### KPIs

#### Get Current KPIs

```http
GET /kpis/current
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "oee": 87.5,
    "yield": 94.2,
    "energyEfficiency": 91.8,
    "qualityIndex": 96.5,
    "throughput": 850,
    "downtime": 2.5,
    "timestamp": "2025-01-24T10:30:00Z"
  }
}
```

#### Get KPI History

```http
GET /kpis/historical?start={timestamp}&end={timestamp}
```

**Parameters:**
- `start` (ISO 8601 timestamp): Start time
- `end` (ISO 8601 timestamp): End time

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "oee": 87.5,
      "yield": 94.2,
      "energyEfficiency": 91.8,
      "qualityIndex": 96.5,
      "throughput": 850,
      "downtime": 2.5,
      "timestamp": "2025-01-24T10:00:00Z"
    }
  ]
}
```

### Recommendations

#### Get Setpoint Recommendations

```http
GET /recommendations/current
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "temperature": {
      "current": 65.5,
      "recommended": 67.2,
      "confidence": 0.92,
      "impact": "high",
      "reason": "Optimal for current moisture content"
    },
    "viscosity": {
      "current": 15.2,
      "recommended": 14.8,
      "confidence": 0.88,
      "impact": "medium",
      "reason": "Improved flow characteristics"
    },
    "flowRate": {
      "current": 850,
      "recommended": 875,
      "confidence": 0.85,
      "impact": "high",
      "reason": "Maximize throughput without quality loss"
    },
    "drierSpeed": {
      "current": 1200,
      "recommended": 1250,
      "confidence": 0.90,
      "impact": "medium",
      "reason": "Optimize drying efficiency"
    }
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

#### Apply Setpoint Recommendation

```http
POST /recommendations/apply
```

**Request Body:**
```json
{
  "parameter": "temperature",
  "value": 67.2,
  "reason": "AI recommendation"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Setpoint applied successfully",
  "data": {
    "parameter": "temperature",
    "previousValue": 65.5,
    "newValue": 67.2,
    "appliedAt": "2025-01-24T10:30:00Z"
  }
}
```

### Alarms

#### Get Active Alarms

```http
GET /alarms/active
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1234,
      "severity": "warning",
      "message": "Temperature exceeds safe operating range",
      "parameter": "temperature",
      "value": "71.2",
      "threshold": "70.0",
      "timestamp": "2025-01-24T10:25:00Z",
      "acknowledged": false
    }
  ]
}
```

#### Acknowledge Alarm

```http
POST /alarms/{id}/acknowledge
```

**Request Body:**
```json
{
  "acknowledgedBy": "user@example.com",
  "notes": "Investigating high temperature"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Alarm acknowledged",
  "data": {
    "id": 1234,
    "acknowledged": true,
    "acknowledgedAt": "2025-01-24T10:30:00Z",
    "acknowledgedBy": "user@example.com"
  }
}
```

#### Get Alarm History

```http
GET /alarms/historical?start={timestamp}&end={timestamp}&severity={severity}
```

**Parameters:**
- `start` (ISO 8601 timestamp): Start time
- `end` (ISO 8601 timestamp): End time
- `severity` (string): Filter by severity (error, warning, info)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1234,
      "severity": "warning",
      "message": "Temperature exceeds safe operating range",
      "parameter": "temperature",
      "value": "71.2",
      "timestamp": "2025-01-24T10:25:00Z",
      "resolvedAt": "2025-01-24T10:35:00Z",
      "duration": 600
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 50
  }
}
```

### Reports

#### Generate Process Report

```http
POST /reports/generate
```

**Request Body:**
```json
{
  "reportType": "shift",
  "start": "2025-01-24T07:00:00Z",
  "end": "2025-01-24T15:00:00Z",
  "metrics": ["oee", "yield", "throughput"],
  "format": "pdf"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Report generation started",
  "data": {
    "reportId": "report_abc123",
    "status": "processing",
    "estimatedTime": 30
  }
}
```

#### Download Report

```http
GET /reports/{reportId}/download
```

**Response:**
Binary file (PDF, Excel, etc.)

### Configuration

#### Get Threshold Configuration

```http
GET /config/thresholds
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "temperature": {
      "min": 60,
      "max": 75,
      "optimal": { "min": 65, "max": 70 },
      "alarmThreshold": 70
    },
    "viscosity": {
      "min": 10,
      "max": 20,
      "optimal": { "min": 14, "max": 16 },
      "alarmThreshold": 18
    }
  }
}
```

#### Update Threshold Configuration

```http
PUT /config/thresholds
```

**Request Body:**
```json
{
  "temperature": {
    "min": 60,
    "max": 75,
    "optimal": { "min": 65, "max": 70 },
    "alarmThreshold": 70
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Threshold configuration updated",
  "data": {
    "updatedAt": "2025-01-24T10:30:00Z",
    "updatedBy": "user@example.com"
  }
}
```

## WebSocket Events

### Connection

```javascript
const socket = io('wss://api.facilis.com', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Subscribe to Process Updates

```javascript
socket.emit('subscribe', { channel: 'process-data' });

socket.on('process-update', (data) => {
  console.log('Process data:', data);
});
```

**Event Data:**
```json
{
  "type": "process-update",
  "data": {
    "temperature": 65.5,
    "viscosity": 15.2,
    "timestamp": "2025-01-24T10:30:00Z"
  }
}
```

### Subscribe to Alarms

```javascript
socket.emit('subscribe', { channel: 'alarms' });

socket.on('alarm-triggered', (data) => {
  console.log('New alarm:', data);
});
```

**Event Data:**
```json
{
  "type": "alarm-triggered",
  "data": {
    "id": 1234,
    "severity": "warning",
    "message": "Temperature exceeds safe operating range",
    "timestamp": "2025-01-24T10:25:00Z"
  }
}
```

### Subscribe to Recommendations

```javascript
socket.emit('subscribe', { channel: 'recommendations' });

socket.on('recommendation-update', (data) => {
  console.log('New recommendations:', data);
});
```

## Error Responses

### Error Format

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Temperature value out of range",
    "details": {
      "parameter": "temperature",
      "value": 100,
      "validRange": { "min": 60, "max": 75 }
    }
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_PARAMETER` | Invalid parameter value | 400 |
| `MISSING_PARAMETER` | Required parameter missing | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource conflict | 409 |
| `VALIDATION_ERROR` | Input validation failed | 422 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | 503 |

## Rate Limiting

Rate limits are applied per API key:

- **Process Data:** 60 requests/minute
- **KPIs:** 30 requests/minute
- **Recommendations:** 20 requests/minute
- **Configuration:** 10 requests/minute

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
```

## Integration Example

### React Hook for API Integration

```javascript
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useProcessData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/process/current`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setData(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};
```

### WebSocket Integration

```javascript
import { useEffect } from 'react';
import io from 'socket.io-client';

export const useRealtimeData = (onUpdate) => {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.emit('subscribe', { channel: 'process-data' });

    socket.on('process-update', (data) => {
      onUpdate(data);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [onUpdate]);
};
```

## Testing

### cURL Examples

```bash
# Get current process data
curl -X GET https://api.facilis.com/v1/process/current \
  -H "Authorization: Bearer <token>"

# Apply recommendation
curl -X POST https://api.facilis.com/v1/recommendations/apply \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"parameter":"temperature","value":67.2,"reason":"AI recommendation"}'

# Get active alarms
curl -X GET https://api.facilis.com/v1/alarms/active \
  -H "Authorization: Bearer <token>"
```

### Postman Collection

A Postman collection with all endpoints is available at:
`/docs/postman/facilis-api-collection.json`

## Versioning

API versioning is handled via URL path:
- v1: `/api/v1/*` (current)
- v2: `/api/v2/*` (future)

Deprecated versions will be supported for 6 months after a new version is released.

---

**Last Updated:** January 24, 2025
**API Version:** 1.0.0
