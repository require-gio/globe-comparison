# Data Model

**Feature**: 3D Interactive Globe  
**Date**: 2025-10-13  
**Phase**: 1 - Design

## Overview

This document defines the data structures used across the frontend and backend for the 3D interactive globe application. The primary entity is the Country, with supporting structures for geographic data and UI state.

---

## Core Entities

### 1. Country (Backend)

Represents a country with metadata served by the REST API.

```typescript
interface Country {
  /**
   * ISO 3166-1 alpha-2 country code (2 letters, uppercase)
   * Examples: "US", "FR", "JP"
   */
  code: string;
  
  /**
   * Official country name
   * Example: "United States", "France", "Japan"
   */
  name: string;
  
  /**
   * Total population (integer)
   * Example: 331002651
   */
  population: number;
  
  /**
   * Capital city name
   * Example: "Washington, D.C.", "Paris", "Tokyo"
   */
  capital: string;
  
  /**
   * Geographic region
   * Example: "Americas", "Europe", "Asia"
   */
  region: string;
}
```

**Validation Rules**:
- `code`: Must be exactly 2 uppercase letters, must exist in ISO 3166-1 standard
- `name`: Required, non-empty string, max 100 characters
- `population`: Positive integer, >= 0
- `capital`: Required, non-empty string, max 100 characters
- `region`: Required, must be one of predefined regions (Americas, Europe, Asia, Africa, Oceania)

**Storage**: Static JSON file (`backend/src/data/countries.json`)

**Example**:
```json
{
  "US": {
    "code": "US",
    "name": "United States",
    "population": 331002651,
    "capital": "Washington, D.C.",
    "region": "Americas"
  },
  "FR": {
    "code": "FR",
    "name": "France",
    "population": 67391582,
    "capital": "Paris",
    "region": "Europe"
  }
}
```

---

### 2. CountryGeometry (Frontend)

Represents geographic polygon data for rendering countries on the globe.

```typescript
interface CountryGeometry {
  /**
   * GeoJSON feature type
   */
  type: 'Feature';
  
  /**
   * Country properties from GeoJSON
   */
  properties: {
    /**
     * ISO 3166-1 alpha-2 code
     */
    ISO_A2: string;
    
    /**
     * Country name from Natural Earth dataset
     */
    NAME: string;
    
    /**
     * Additional Natural Earth properties (optional)
     */
    [key: string]: any;
  };
  
  /**
   * Geographic geometry (polygon or multi-polygon)
   */
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface CountryGeoJSON {
  type: 'FeatureCollection';
  features: CountryGeometry[];
}
```

**Source**: Natural Earth 110m Cultural Vectors (countries.geojson)

**Usage**: Loaded once at application startup, passed to `three-globe` for rendering

**Example**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ISO_A2": "US",
        "NAME": "United States"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [[-122.4, 37.8], [-122.5, 37.7], [-122.3, 37.6], [-122.4, 37.8]]
          ]
        ]
      }
    }
  ]
}
```

---

### 3. HoverState (Frontend)

Represents the current hover interaction state in the UI.

```typescript
interface HoverState {
  /**
   * Currently hovered country code (null if no hover)
   */
  countryCode: string | null;
  
  /**
   * Mouse position for popover placement
   */
  mousePosition: {
    x: number;
    y: number;
  } | null;
  
  /**
   * Whether country data is being fetched
   */
  isLoading: boolean;
  
  /**
   * Fetched country data (null if not available)
   */
  countryData: Country | null;
  
  /**
   * Error message (null if no error)
   */
  error: string | null;
}
```

**State Management**: Managed via RxJS BehaviorSubject in `CountryStateService`

**State Transitions**:
1. **Idle**: `countryCode = null, isLoading = false, countryData = null`
2. **Hovering**: `countryCode = "US", mousePosition = {x, y}, isLoading = true`
3. **Data Loaded**: `isLoading = false, countryData = {...}`
4. **Error**: `isLoading = false, error = "Information unavailable"`

---

### 4. CountryCache (Frontend)

Implements a simple cache for API responses to minimize backend requests.

```typescript
interface CountryCache {
  /**
   * Map of country code to cached Country data
   */
  data: Map<string, Country>;
  
  /**
   * Timestamp when each entry was cached
   */
  timestamps: Map<string, number>;
  
  /**
   * Maximum cache age in milliseconds (5 minutes)
   */
  maxAge: number;
}
```

**Implementation**:
```typescript
class CountryCacheService {
  private cache = new Map<string, Country>();
  private timestamps = new Map<string, number>();
  private readonly MAX_AGE = 5 * 60 * 1000; // 5 minutes
  
  get(code: string): Country | null {
    const timestamp = this.timestamps.get(code);
    if (!timestamp || Date.now() - timestamp > this.MAX_AGE) {
      this.cache.delete(code);
      this.timestamps.delete(code);
      return null;
    }
    return this.cache.get(code) || null;
  }
  
  set(code: string, country: Country): void {
    this.cache.set(code, country);
    this.timestamps.set(code, Date.now());
  }
  
  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }
}
```

---

## API Response Types

### 1. Success Response

```typescript
interface CountryResponse {
  code: string;
  name: string;
  population: number;
  capital: string;
  region: string;
}
```

**HTTP Status**: 200 OK

**Example**:
```json
{
  "code": "US",
  "name": "United States",
  "population": 331002651,
  "capital": "Washington, D.C.",
  "region": "Americas"
}
```

---

### 2. Error Response

```typescript
interface ErrorResponse {
  message: string;
}
```

**HTTP Status**: 404 Not Found

**Example**:
```json
{
  "message": "Information unavailable"
}
```

---

## Frontend Component State

### GlobeComponent State

```typescript
interface GlobeComponentState {
  /**
   * Three.js scene, camera, renderer references
   */
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  globe: ThreeGlobe;
  
  /**
   * Rotation state
   */
  rotation: {
    velocity: { x: number; y: number };
    isDragging: boolean;
    lastMousePosition: { x: number; y: number } | null;
  };
  
  /**
   * Current hover state (from service)
   */
  hoverState$: Observable<HoverState>;
  
  /**
   * Whether globe is fully initialized
   */
  isInitialized: boolean;
}
```

---

## Database Schema (Not Used)

This application uses static JSON files instead of a database. If database persistence were needed in the future, the schema would be:

```sql
-- PostgreSQL schema (for future reference)
CREATE TABLE countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  population INTEGER NOT NULL CHECK (population >= 0),
  capital VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_countries_region ON countries(region);
```

**Note**: Not implemented in current design. Data is read-only from JSON file.

---

## Data Flow

### 1. Application Initialization

```
1. Angular app bootstraps
2. GlobeComponent ngOnInit
3. Load countries.geojson from assets
4. Initialize Three.js scene with GeoJSON data
5. Render globe with country polygons
```

### 2. Hover Interaction

```
1. User hovers over country polygon
2. three-globe detects hover event
3. Extract country code from polygon properties
4. CountryStateService.setHoveredCountry(code)
5. Check CountryCacheService for cached data
6. If not cached: ApiService.getCountry(code) → backend
7. Backend reads countries.json → return Country data
8. Cache response in CountryCacheService
9. Update HoverState with country data
10. GlobeComponent displays popover via CDK Overlay
```

### 3. Error Handling

```
1. API call fails (timeout, 404, 500)
2. catchError operator catches error
3. Return fallback: { message: "Information unavailable" }
4. Update HoverState with error message
5. Display error message in popover
```

---

## Validation Summary

### Backend Validation

- **Country Code**: Must match `/^[A-Z]{2}$/` regex
- **Data File**: Must be valid JSON with country objects keyed by code
- **Response**: Must conform to Country interface

### Frontend Validation

- **GeoJSON**: Must be valid FeatureCollection with country features
- **ISO Code Mapping**: Frontend ISO_A2 must match backend country codes
- **Mouse Position**: Must be within viewport bounds for popover placement

---

## Type Safety

All entities are defined as TypeScript interfaces with strict type checking enabled:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true
  }
}
```

This ensures:
- No implicit `any` types
- Null/undefined checks enforced
- Property initialization verified
- Type compatibility validated at compile time

---

## Summary

| Entity | Purpose | Location | Format |
|--------|---------|----------|--------|
| Country | Metadata for API responses | Backend | JSON |
| CountryGeometry | Polygon data for rendering | Frontend | GeoJSON |
| HoverState | UI interaction state | Frontend | TypeScript |
| CountryCache | Response caching | Frontend | In-memory Map |

All data structures are immutable after initialization except for UI state managed through RxJS observables.
