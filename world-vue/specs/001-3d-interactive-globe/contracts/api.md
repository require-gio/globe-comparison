# API Contract: Countries API

**Version**: 1.0.0  
**Base URL**: `/api/v1`  
**Protocol**: HTTP/HTTPS  
**Format**: JSON  
**Created**: 2025-10-12

## Endpoints

### GET /countries/:iso

Retrieve detailed information about a specific country by its ISO 3166-1 alpha-3 code.

**Purpose**: Fetch country data to display in hover popovers.

**Path Parameters**:
- `iso` (string, required): ISO 3166-1 alpha-3 country code (3 uppercase letters)
  - Examples: `USA`, `FRA`, `JPN`, `BRA`, `AUS`
  - Validation: Must be exactly 3 uppercase letters

**Query Parameters**: None

**Request Headers**:
- `Accept`: `application/json` (optional, default)

**Success Response** (200 OK):
```json
{
  "id": "FRA",
  "name": "France",
  "capital": "Paris",
  "population": 67391582,
  "region": "Europe",
  "subregion": "Western Europe",
  "area": 643801.0,
  "currency": "EUR",
  "languages": ["fra"],
  "flag": "🇫🇷",
  "coordinates": {
    "lat": 46.2276,
    "lng": 2.2137
  },
  "timezone": "UTC+1",
  "source": "cache",
  "updatedAt": "2025-10-08T12:34:56.789Z"
}
```

**Error Responses**:

**404 Not Found** - Country not found:
```json
{
  "error": "Country not found",
  "message": "No country found with ISO code: XYZ",
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/v1/countries/XYZ"
}
```

**400 Bad Request** - Invalid ISO code format:
```json
{
  "error": "Invalid country code",
  "message": "Country code must be a 3-letter ISO 3166-1 alpha-3 code",
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/v1/countries/INVALID"
}
```

**503 Service Unavailable** - Backend service error:
```json
{
  "error": "Information unavailable",
  "message": "Service temporarily unavailable. Please try again later.",
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 60 seconds.",
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

**Performance Expectations**:
- Response time: <500ms (p95)
- Cache hit ratio: >80%
- Concurrent requests: Up to 100 req/s

**Caching**:
- Response cached for 6 hours in Redis
- Client-side caching via TanStack Query
- Cache headers: `Cache-Control: public, max-age=21600`

**Rate Limiting**:
- Per IP: 100 requests per minute
- Per session: 50 requests per minute
- Burst allowance: 20 requests

---

### GET /countries

List all available countries with basic information (future enhancement).

**Purpose**: Retrieve complete country list for search or filtering features.

**Query Parameters**:
- `region` (string, optional): Filter by region (e.g., `Europe`, `Asia`, `Americas`)
- `limit` (number, optional): Maximum number of results (default: 50, max: 250)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response** (200 OK):
```json
{
  "countries": [
    {
      "id": "USA",
      "name": "United States of America",
      "region": "Americas",
      "flag": "🇺🇸"
    },
    {
      "id": "FRA",
      "name": "France",
      "region": "Europe",
      "flag": "🇫🇷"
    }
  ],
  "total": 195,
  "limit": 50,
  "offset": 0
}
```

**Performance Expectations**:
- Response time: <200ms (p95)
- Full list cached for 24 hours

---

### GET /health

Health check endpoint for monitoring and load balancer health checks.

**Purpose**: Verify API availability and dependencies status.

**Query Parameters**: None

**Success Response** (200 OK):
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected",
  "cache": "connected",
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

**Degraded Response** (200 OK):
```json
{
  "status": "degraded",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected",
  "cache": "disconnected",
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

**Error Response** (503 Service Unavailable):
```json
{
  "status": "error",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "disconnected",
  "cache": "disconnected",
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

**Performance Expectations**:
- Response time: <50ms
- No database queries on health check

---

## Request/Response Standards

### Common Headers

**Request Headers**:
- `User-Agent`: Client identification (optional but recommended)
- `Accept`: `application/json`
- `Accept-Encoding`: `gzip, br`

**Response Headers**:
- `Content-Type`: `application/json; charset=utf-8`
- `Content-Encoding`: `gzip` or `br`
- `Cache-Control`: Appropriate caching directives
- `X-Response-Time`: Response duration in milliseconds
- `X-Request-ID`: Unique request identifier for tracing

### Error Format

All error responses follow consistent structure:
```typescript
interface ErrorResponse {
  error: string;          // Short error identifier
  message?: string;       // Human-readable error description
  timestamp: string;      // ISO 8601 timestamp
  path?: string;         // Request path that caused error
  requestId?: string;    // Unique request ID for debugging
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error
- `503 Service Unavailable`: Service temporarily unavailable

### Versioning

- URL versioning: `/api/v1/...`
- Breaking changes require version increment
- Old versions maintained for 6 months minimum
- Deprecation warnings in response headers

## Security

### CORS Configuration
```
Access-Control-Allow-Origin: https://world-vue.app (production)
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Access-Control-Max-Age: 86400
```

### Rate Limiting
- Implemented via Fastify rate-limit plugin
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Exponential backoff recommended for clients

### Input Validation
- All inputs validated using Zod schemas
- ISO codes validated against allowed list
- SQL injection prevention via parameterized queries
- XSS prevention via input sanitization

## Monitoring & Observability

### Metrics Tracked
- Request count per endpoint
- Response times (p50, p95, p99)
- Error rate by status code
- Cache hit/miss ratio
- Database query duration
- Rate limit violations

### Logging
- All requests logged with metadata
- Error stack traces in non-production
- Performance warnings for slow queries
- Structured JSON logging format

### Tracing
- Request ID propagation through system
- OpenTelemetry integration (optional)
- Correlation between frontend and backend requests

## Client Integration Guidelines

### Recommended Client Behavior
1. **Debounce hover events**: Wait 200ms before requesting country data
2. **Abort in-flight requests**: Cancel previous request when hovering new country
3. **Handle errors gracefully**: Show "Information unavailable" on errors
4. **Respect rate limits**: Implement exponential backoff on 429 responses
5. **Cache responses**: Use TanStack Query or similar caching layer
6. **Retry transient errors**: Retry 503 errors with exponential backoff

### Example Request (JavaScript)
```javascript
const response = await fetch(
  `https://api.world-vue.app/api/v1/countries/FRA`,
  {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'WorldVue/1.0.0'
    },
    signal: abortController.signal // For cancellation
  }
);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${await response.text()}`);
}

const country = await response.json();
```

## Testing Scenarios

### Unit Tests
- Validate request/response schema compliance
- Test error handling for all error cases
- Verify rate limiting behavior
- Check cache hit/miss logic

### Integration Tests
- End-to-end API calls with real database
- Cache invalidation scenarios
- Concurrent request handling
- Database connection failure scenarios

### Load Tests
- Sustained load: 100 req/s for 5 minutes
- Burst load: 500 req/s for 30 seconds
- Cache warming scenarios
- Rate limit enforcement

## Change Log

**Version 1.0.0** (2025-10-12):
- Initial API specification
- GET /countries/:iso endpoint
- Health check endpoint
- Rate limiting and caching specifications