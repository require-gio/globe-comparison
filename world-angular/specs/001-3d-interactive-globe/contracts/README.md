# API Contract Documentation

**Feature**: 3D Interactive Globe  
**Date**: 2025-10-13  
**Version**: 1.0.0

## Overview

This document describes the REST API contract between the Angular frontend and Node.js backend for the 3D interactive globe application. The API follows RESTful principles with JSON request/response format.

---

## Base URL

**Local Development**: `http://localhost:3000`

All API endpoints are prefixed with `/api` in the application.

---

## Endpoints

### 1. Get Country Information

Retrieves detailed information about a specific country by its ISO code.

**Endpoint**: `GET /api/country/{code}`

**Method**: `GET`

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `code` | string | Yes | ISO 3166-1 alpha-2 country code (2 uppercase letters) | `US`, `FR`, `JP` |

**Request Headers**:
```
Accept: application/json
```

**Success Response** (200 OK):

```json
{
  "code": "US",
  "name": "United States",
  "population": 331002651,
  "capital": "Washington, D.C.",
  "region": "Americas"
}
```

**Response Fields**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `code` | string | ISO 3166-1 alpha-2 country code | `US` |
| `name` | string | Official country name | `United States` |
| `population` | number | Total population (integer) | `331002651` |
| `capital` | string | Capital city name | `Washington, D.C.` |
| `region` | string | Geographic region (Africa, Americas, Asia, Europe, Oceania) | `Americas` |

**Error Responses**:

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 404 | Country not found | `{"message": "Information unavailable"}` |
| 400 | Invalid country code format | `{"message": "Invalid country code format. Must be 2 uppercase letters."}` |
| 500 | Internal server error | `{"message": "Internal server error"}` |

**Example Requests**:

```bash
# Get United States information
curl http://localhost:3000/api/country/US

# Get France information
curl http://localhost:3000/api/country/FR

# Get Japan information
curl http://localhost:3000/api/country/JP
```

**Example Success Response**:
```json
{
  "code": "FR",
  "name": "France",
  "population": 67391582,
  "capital": "Paris",
  "region": "Europe"
}
```

**Example Error Response** (404):
```json
{
  "message": "Information unavailable"
}
```

---

### 2. Health Check

Provides server health status for monitoring and container orchestration.

**Endpoint**: `GET /health`

**Method**: `GET`

**Success Response** (200 OK):

```json
{
  "status": "ok",
  "timestamp": "2025-10-13T12:00:00.000Z",
  "uptime": 3600
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Health status (`ok` or `error`) |
| `timestamp` | string | Current server timestamp (ISO 8601) |
| `uptime` | number | Server uptime in seconds |

**Error Response** (503):
```json
{
  "status": "error",
  "message": "Service unavailable"
}
```

**Example Request**:
```bash
curl http://localhost:3000/health
```

---

## Data Types

### Country

```typescript
interface Country {
  code: string;        // ISO 3166-1 alpha-2 (2 uppercase letters)
  name: string;        // Official country name
  population: number;  // Total population (integer >= 0)
  capital: string;     // Capital city name
  region: string;      // Geographic region
}
```

**Validation Rules**:
- `code`: Must match regex `^[A-Z]{2}$`
- `name`: Non-empty, max 100 characters
- `population`: Non-negative integer
- `capital`: Non-empty, max 100 characters
- `region`: Must be one of: Africa, Americas, Asia, Europe, Oceania

### ErrorResponse

```typescript
interface ErrorResponse {
  message: string;     // Human-readable error message
  code?: string;       // Optional machine-readable error code
  details?: object;    // Optional additional error details
}
```

---

## Frontend Integration

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

interface Country {
  code: string;
  name: string;
  population: number;
  capital: string;
  region: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getCountry(code: string): Observable<Country> {
    return this.http.get<Country>(`${this.API_URL}/country/${code}`).pipe(
      retry(2),
      timeout(5000),
      catchError(error => {
        console.error('Failed to fetch country:', error);
        return of({
          code: code,
          name: 'Unknown',
          population: 0,
          capital: 'Unknown',
          region: 'Unknown'
        } as Country);
      })
    );
  }

  healthCheck(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.API_URL}/../health`).pipe(
      catchError(() => of({ status: 'error' }))
    );
  }
}
```

### Usage in Component

```typescript
export class GlobeComponent {
  constructor(private apiService: ApiService) {}

  onCountryHover(countryCode: string) {
    this.apiService.getCountry(countryCode).subscribe({
      next: (country) => {
        this.showPopover(country);
      },
      error: (error) => {
        console.error('Error fetching country:', error);
        this.showErrorMessage('Information unavailable');
      }
    });
  }
}
```

---

## Backend Implementation

### Express Route Example

```typescript
import { Router, Request, Response } from 'express';
import countries from '../data/countries.json';

const router = Router();

router.get('/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();

  // Validate code format
  if (!/^[A-Z]{2}$/.test(code)) {
    return res.status(400).json({
      message: 'Invalid country code format. Must be 2 uppercase letters.'
    });
  }

  // Look up country
  const country = countries[code];

  if (!country) {
    return res.status(404).json({
      message: 'Information unavailable'
    });
  }

  res.json(country);
});

export default router;
```

---

## CORS Configuration

The backend must allow cross-origin requests from the frontend during local development:

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
```

**Production**: Replace with actual frontend domain.

---

## Error Handling

### Frontend Error Handling Strategy

1. **Network Errors**: Retry up to 2 times with exponential backoff
2. **Timeout**: 5-second timeout for API calls
3. **404 Errors**: Display "Information unavailable" message
4. **500 Errors**: Display generic error message
5. **Fallback**: Always provide user-friendly error message

### Backend Error Response Format

All errors should return consistent JSON format:

```json
{
  "message": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "additionalInfo": "value"
  }
}
```

---

## Rate Limiting

**Current**: No rate limiting (local development only)

**Future Production Considerations**:
- Implement rate limiting (e.g., 100 requests per minute per IP)
- Use Redis for distributed rate limiting
- Return 429 status code when limit exceeded

---

## Caching Strategy

### Frontend Caching

Implement in-memory cache with 5-minute TTL:

```typescript
class CountryCacheService {
  private cache = new Map<string, Country>();
  private timestamps = new Map<string, number>();
  private readonly MAX_AGE = 5 * 60 * 1000;

  get(code: string): Country | null {
    const timestamp = this.timestamps.get(code);
    if (!timestamp || Date.now() - timestamp > this.MAX_AGE) {
      return null;
    }
    return this.cache.get(code) || null;
  }

  set(code: string, country: Country): void {
    this.cache.set(code, country);
    this.timestamps.set(code, Date.now());
  }
}
```

### Backend Caching

**Current**: Static JSON file loaded into memory at startup

**Future**: Add HTTP Cache-Control headers:
```
Cache-Control: public, max-age=86400
```

---

## Testing

### Contract Testing

Use the OpenAPI specification (`openapi.yaml`) for automated contract testing:

```bash
# Install dependencies
npm install --save-dev @openapitools/openapi-generator-cli

# Generate client SDK for testing
openapi-generator-cli generate -i contracts/openapi.yaml -g typescript-fetch -o tests/api-client
```

### Integration Tests

```typescript
describe('GET /api/country/:code', () => {
  it('should return country data for valid code', async () => {
    const response = await request(app).get('/api/country/US');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      code: 'US',
      name: expect.any(String),
      population: expect.any(Number),
      capital: expect.any(String),
      region: expect.any(String)
    });
  });

  it('should return 404 for invalid code', async () => {
    const response = await request(app).get('/api/country/XX');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Information unavailable');
  });

  it('should return 400 for malformed code', async () => {
    const response = await request(app).get('/api/country/USA');
    expect(response.status).toBe(400);
  });
});
```

---

## API Versioning

**Current Version**: 1.0.0 (no versioning in URL)

**Future Versioning Strategy**:
- Add version prefix to URL: `/api/v1/country/:code`
- Maintain backward compatibility for at least 2 major versions
- Deprecation notices in response headers

---

## Security Considerations

1. **Input Validation**: Validate all path parameters against regex patterns
2. **SQL Injection**: Not applicable (no database, static JSON)
3. **XSS Prevention**: JSON responses automatically escaped
4. **CORS**: Restrict to known frontend origins in production
5. **HTTPS**: Enforce HTTPS in production environments
6. **Secrets**: No sensitive data exposed in API responses

---

## Monitoring & Logging

### Request Logging

```typescript
import morgan from 'morgan';

app.use(morgan('combined', {
  skip: (req, res) => req.path === '/health'
}));
```

**Log Format**: Apache Combined Log Format

**Log Example**:
```
127.0.0.1 - - [13/Oct/2025:12:00:00 +0000] "GET /api/country/US HTTP/1.1" 200 123 "-" "Mozilla/5.0"
```

### Health Check Monitoring

Monitor `/health` endpoint for:
- Response time < 100ms
- Status code 200
- Uptime tracking

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
- **File**: `contracts/openapi.yaml`
- **Interactive Docs**: Use Swagger UI or Redoc to view

To view interactive documentation:

```bash
npm install -g @redocly/cli
redocly preview-docs contracts/openapi.yaml
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Protocol** | HTTP/1.1, REST |
| **Format** | JSON |
| **Base URL** | `http://localhost:3000/api` |
| **Endpoints** | 2 (country lookup, health check) |
| **Authentication** | None (public API) |
| **Rate Limiting** | None (local dev) |
| **Caching** | Frontend: 5 min TTL, Backend: In-memory |
| **CORS** | Enabled for localhost:4200 |
| **Error Handling** | Consistent JSON error responses |

---

## References

- OpenAPI Specification: `contracts/openapi.yaml`
- Data Model: `data-model.md`
- Feature Specification: `spec.md`
- ISO 3166-1 alpha-2 codes: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
