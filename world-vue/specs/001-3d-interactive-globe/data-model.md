# Data Model: 3D Interactive Globe

**Created**: 2025-10-12  
**Feature**: 3D Interactive Globe with Country Information  
**Purpose**: Define data structures and relationships for country information system

## Entities

### Country
Primary entity representing country information displayed in popovers.

**Fields**:
- `id`: string (Primary Key) - ISO 3166-1 alpha-3 country code (e.g., "USA", "FRA", "JPN")
- `name`: string (Required) - Official country name (e.g., "United States of America")
- `capital`: string (Optional) - Capital city name (e.g., "Washington, D.C.")
- `population`: number (Optional) - Current population estimate
- `region`: string (Optional) - Geographic region (e.g., "North America", "Europe", "Asia")
- `subregion`: string (Optional) - Sub-geographic region (e.g., "Northern America", "Western Europe")
- `area`: number (Optional) - Total area in square kilometers
- `currency`: string (Optional) - Primary currency code (e.g., "USD", "EUR", "JPY")
- `languages`: string[] (Optional) - Array of official language codes
- `flag`: string (Optional) - URL to flag image or emoji representation
- `coordinates`: { lat: number, lng: number } (Optional) - Country centroid coordinates
- `timezone`: string (Optional) - Primary timezone (e.g., "UTC-5", "UTC+1")
- `updatedAt`: string (Required) - ISO 8601 timestamp of last update
- `source`: enum ("static" | "api" | "cache") - Data source indicator for debugging

**Validation Rules**:
- `id` must be valid ISO 3166-1 alpha-3 code (3 uppercase letters)
- `name` must be non-empty string, max 100 characters
- `population` must be positive integer if provided
- `area` must be positive number if provided
- `coordinates.lat` must be between -90 and 90
- `coordinates.lng` must be between -180 and 180
- `updatedAt` must be valid ISO 8601 datetime string

**Relationships**:
- One-to-one with GeoJSON country geometry (linked by ISO code)
- One-to-many with historical data (future enhancement)

### Cache Entry (Redis)
Internal entity for caching country data to meet <500ms response requirements.

**Fields**:
- `key`: string - Format: "country:{id}" (e.g., "country:USA")
- `value`: string - JSON serialized Country entity
- `ttl`: number - Time to live in seconds (default: 21600 = 6 hours)
- `accessed`: number - Unix timestamp of last access

**Validation Rules**:
- `key` must follow "country:{iso_code}" pattern
- `value` must be valid JSON containing Country entity
- `ttl` must be positive integer

### Globe State (Frontend)
Client-side entity managing 3D globe interaction state.

**Fields**:
- `rotation`: { x: number, y: number, z: number } - Current globe rotation in radians
- `velocity`: { x: number, y: number } - Angular velocity for momentum simulation
- `zoom`: number - Camera distance from globe center
- `isDragging`: boolean - Whether user is currently dragging
- `hoveredCountry`: string | null - ISO code of currently hovered country
- `selectedCountry`: string | null - ISO code of selected country (future enhancement)
- `lastInteraction`: number - Timestamp of last user interaction

**Validation Rules**:
- `rotation` values must be finite numbers
- `velocity` values must be finite numbers, clamped to reasonable ranges
- `zoom` must be positive number within min/max bounds
- `hoveredCountry` must be valid ISO code or null

### Hover State (Frontend)
Client-side entity managing hover interactions and debouncing.

**Fields**:
- `countryId`: string | null - ISO code of country being hovered
- `debounceTimer`: number | null - Timer ID for debounced hover effect
- `isLoading`: boolean - Whether country data is being fetched
- `position`: { x: number, y: number } - Mouse/touch position for popover placement
- `startTime`: number - Timestamp when hover started

**Validation Rules**:
- `countryId` must be valid ISO code or null
- `position.x` and `position.y` must be finite numbers
- `startTime` must be valid timestamp

## State Transitions

### Country Data Lifecycle
```
[Not Cached] 
    ↓ (hover trigger after 200ms)
[Loading from API] 
    ↓ (success) OR ↓ (error)
[Cached] OR [Error State]
    ↓ (TTL expires)
[Not Cached]
```

### Hover Interaction Flow
```
[No Hover]
    ↓ (mouse enter country)
[Hover Started]
    ↓ (wait 200ms)
[Debounce Complete] → Trigger API request
    ↓ (mouse leave OR new country hover)
[Hover Cancelled] → Abort request, return to [No Hover]
```

### Globe Interaction States
```
[Idle]
    ↓ (mouse down)
[Dragging] → Update rotation
    ↓ (mouse up)
[Momentum] → Apply velocity decay
    ↓ (velocity reaches threshold)
[Idle]
```

## Database Schema (PostgreSQL + Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Country {
  id          String    @id @db.VarChar(3)  // ISO 3166-1 alpha-3
  name        String    @db.VarChar(100)
  capital     String?   @db.VarChar(100)
  population  BigInt?
  region      String?   @db.VarChar(50)
  subregion   String?   @db.VarChar(50)
  area        Decimal?  @db.Decimal(12, 2)
  currency    String?   @db.VarChar(10)
  languages   String[]  @db.VarChar(10)
  flag        String?   @db.VarChar(200)
  latitude    Decimal?  @db.Decimal(10, 7)
  longitude   Decimal?  @db.Decimal(10, 7)
  timezone    String?   @db.VarChar(20)
  updatedAt   DateTime  @updatedAt
  createdAt   DateTime  @default(now())

  @@map("countries")
  @@index([region])
  @@index([updatedAt])
}

model RequestLog {
  id        String   @id @default(cuid())
  countryId String?  @db.VarChar(3)
  endpoint  String   @db.VarChar(100)
  method    String   @db.VarChar(10)
  duration  Int      // milliseconds
  status    Int      // HTTP status code
  userAgent String?  @db.Text
  ip        String?  @db.VarChar(45)
  createdAt DateTime @default(now())

  @@map("request_logs")
  @@index([countryId, createdAt])
  @@index([createdAt])
}
```

## API Response Types (TypeScript)

```typescript
// Frontend/Backend shared types
export interface CountryResponse {
  id: string;
  name: string;
  capital?: string;
  population?: number;
  region?: string;
  subregion?: string;
  area?: number;
  currency?: string;
  languages?: string[];
  flag?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string;
  source: 'static' | 'api' | 'cache';
  updatedAt: string; // ISO 8601
}

export interface ErrorResponse {
  error: string;
  message?: string;
  timestamp: string;
  path?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  database: 'connected' | 'disconnected';
  cache: 'connected' | 'disconnected';
  timestamp: string;
}
```

## Data Sources & Integration

### Primary Data Sources
1. **Static GeoJSON Files**: Country boundaries and basic metadata
2. **Database Seed Data**: Extended country information from reliable sources
3. **External APIs**: Real-time data updates (future enhancement)

### Data Synchronization
- Initial seed from curated country dataset
- Periodic updates via migration scripts
- Cache invalidation on data updates
- Fallback to static data if database unavailable

### Performance Considerations
- Database indexes on frequently queried fields (region, updatedAt)
- Redis caching with 6-hour TTL reduces database load
- Request logging for monitoring and optimization
- Prepared statements and connection pooling for scalability

This data model supports the constitutional requirements for data persistence, API-first development, and performance optimization while providing flexibility for future enhancements.