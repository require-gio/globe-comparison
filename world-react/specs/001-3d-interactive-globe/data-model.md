# Data Model: 3D Interactive Globe with Country Information

**Feature**: 001-3d-interactive-globe  
**Date**: 2025-10-08  
**Status**: Complete

## Overview

This document defines the data entities, their attributes, relationships, and validation rules for the 3D interactive globe application.

## Entity Diagram

```
┌─────────────────┐
│     Country     │
│  (PostgreSQL)   │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐      ┌──────────────────┐
│ CountryInfo API │      │   Globe State    │
│   (Response)    │      │ (Client Memory)  │
└─────────────────┘      └──────────────────┘
                                   │
                                   │ contains
                                   ▼
                         ┌──────────────────┐
                         │   Hover State    │
                         │ (Client Memory)  │
                         └──────────────────┘
```

## Entities

### 1. Country (Backend - PostgreSQL)

Represents a sovereign nation or territory with its metadata and geographic information.

**Table Name**: `countries`

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing internal ID |
| iso_code | VARCHAR(3) | UNIQUE, NOT NULL | ISO 3166-1 alpha-3 country code (e.g., "USA", "FRA") |
| name | VARCHAR(255) | NOT NULL | Official country name (e.g., "United States of America") |
| population | BIGINT | NOT NULL, CHECK (population >= 0) | Current population count |
| capital | VARCHAR(255) | NOT NULL | Capital city name (e.g., "Washington, D.C.") |
| region | VARCHAR(100) | NOT NULL | Geographic region (e.g., "Americas", "Europe", "Africa") |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `iso_code` (for fast lookups by code)
- INDEX on `region` (for potential future filtering)

**Validation Rules**:
- `iso_code` must be exactly 3 uppercase letters
- `population` must be non-negative
- `name`, `capital`, `region` must not be empty strings
- `updated_at` automatically updated on record modification

**Sample Data**:
```sql
INSERT INTO countries (iso_code, name, population, capital, region) VALUES
('USA', 'United States of America', 331000000, 'Washington, D.C.', 'Americas'),
('FRA', 'France', 67000000, 'Paris', 'Europe'),
('JPN', 'Japan', 126000000, 'Tokyo', 'Asia'),
('BRA', 'Brazil', 212000000, 'Brasília', 'Americas'),
('ZAF', 'South Africa', 59000000, 'Pretoria', 'Africa');
```

**State Transitions**: None (static reference data, updates are rare)

---

### 2. Country Geometry (Frontend - TopoJSON File)

Represents the geographic boundaries of countries as polygon coordinates for 3D rendering.

**Format**: TopoJSON topology with embedded properties

**Structure**:
```json
{
  "type": "Topology",
  "objects": {
    "countries": {
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Polygon",
          "id": "USA",
          "properties": {
            "iso_code": "USA",
            "name": "United States of America"
          },
          "arcs": [[0, 1, 2, 3, 4]]
        }
      ]
    }
  },
  "arcs": [/* encoded coordinate arrays */],
  "transform": {/* scale and translate */}
}
```

**Attributes**:
- `id`: ISO 3166-1 alpha-3 country code (links to backend Country.iso_code)
- `properties.iso_code`: Duplicate of id for convenience
- `properties.name`: Country name for tooltip fallback
- `arcs`: Topology-encoded polygon boundaries (shared edges)

**Processing**:
1. Load TopoJSON file from CDN
2. Parse using topojson-client library
3. Convert to GeoJSON features
4. Triangulate polygons using earcut
5. Create THREE.Mesh for each country with BVH indexing

**Validation**:
- All countries in TopoJSON must have corresponding database records
- Polygon coordinates must be in WGS84 (longitude/latitude)
- Arc indices must be valid references within topology

---

### 3. Globe State (Frontend - Zustand Store)

Represents the current orientation, rotation, and interaction mode of the 3D globe.

**Store Name**: `useGlobeStore`

**Attributes**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| rotation | `{ x: number, y: number, z: number }` | `{ x: 0, y: 0, z: 0 }` | Globe rotation in radians (Euler angles) |
| rotationVelocity | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Angular velocity for momentum |
| isDragging | `boolean` | `false` | Whether user is currently dragging |
| dragStart | `{ x: number, y: number } \| null` | `null` | Mouse position when drag started |
| lastDragPosition | `{ x: number, y: number } \| null` | `null` | Last mouse position during drag |

**Actions**:
- `setRotation(rotation: { x, y, z })`: Update globe rotation
- `startDrag(position: { x, y })`: Enter drag mode
- `updateDrag(position: { x, y })`: Update rotation during drag
- `endDrag()`: Exit drag mode, apply momentum
- `applyMomentum()`: Update rotation based on velocity (called in animation loop)

**State Transitions**:
```
idle ──(mousedown)──> dragging ──(mousemove)──> dragging ──(mouseup)──> momentum
  ▲                                                                           │
  └───────────────────────────(velocity reaches 0)─────────────────────────┘
```

**Validation**:
- Rotation angles normalized to [0, 2π)
- Velocity damped by 0.95 per frame (exponential decay)
- Drag positions validated against canvas bounds

---

### 4. Hover State (Frontend - Zustand Store)

Represents the current mouse interaction state for country hover detection.

**Store Name**: `useHoverStore`

**Attributes**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| hoveredCountryId | `string \| null` | `null` | ISO code of currently hovered country |
| mousePosition | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Current mouse coordinates (normalized device coords) |
| hoverStartTime | `number \| null` | `null` | Timestamp when hover started (ms) |
| isPopoverVisible | `boolean` | `false` | Whether popover should be displayed |
| popoverPosition | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Popover screen coordinates |

**Actions**:
- `setHoveredCountry(countryId: string | null)`: Update hovered country
- `setMousePosition(position: { x, y })`: Update mouse coords
- `showPopover(position: { x, y })`: Display popover at position
- `hidePopover()`: Hide popover and reset hover state

**State Transitions**:
```
no_hover ──(raycast hit)──> country_hovered ──(200ms delay)──> popover_shown
    ▲                              │                                  │
    │                              │                                  │
    └──────────(raycast miss)─────┴──────(raycast miss)─────────────┘
```

**Validation**:
- `hoveredCountryId` must match valid ISO code or be null
- `hoverStartTime` used to enforce 200ms delay before popover
- Popover position clamped to viewport bounds

---

### 5. Country Information (API Response Type)

Represents the data structure returned by the backend API for country information display.

**Type Name**: `CountryInfo` (TypeScript interface)

**Attributes**:

```typescript
interface CountryInfo {
  iso_code: string;        // ISO 3166-1 alpha-3 code
  name: string;            // Official country name
  population: number;      // Current population count
  capital: string;         // Capital city name
  region: string;          // Geographic region
  retrieved_at: string;    // ISO 8601 timestamp of data retrieval
}
```

**Example Response**:
```json
{
  "iso_code": "FRA",
  "name": "France",
  "population": 67000000,
  "capital": "Paris",
  "region": "Europe",
  "retrieved_at": "2025-10-08T14:30:00.000Z"
}
```

**Validation** (Backend):
- All fields are required (no nulls)
- `iso_code` must be valid ISO 3166-1 alpha-3
- `population` must be non-negative integer
- `retrieved_at` must be valid ISO 8601 timestamp

**Caching**:
- Cached in Redis with key pattern: `country:info:{iso_code}`
- TTL: 1 hour (3600 seconds)
- TanStack Query caches on client with same TTL

---

## Relationships

### Country ↔ Country Geometry
- **Type**: One-to-One
- **Link**: `Country.iso_code` = `CountryGeometry.id`
- **Integrity**: All countries in database must have geometry in TopoJSON
- **Validation**: Startup check compares database country list against TopoJSON features

### Country ↔ Country Information API
- **Type**: One-to-One (per request)
- **Link**: `Country.iso_code` = `CountryInfo.iso_code`
- **Integrity**: API always returns data for valid ISO codes
- **Error Handling**: 404 for invalid codes, 500 for database errors

### Globe State ↔ Hover State
- **Type**: Compositional (Hover State depends on Globe State)
- **Link**: Hover detection requires current globe rotation for raycasting
- **Coupling**: Loosely coupled via Zustand stores (no direct references)

---

## Database Schema (PostgreSQL)

```sql
-- Create countries table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    iso_code VARCHAR(3) UNIQUE NOT NULL CHECK (iso_code ~ '^[A-Z]{3}$'),
    name VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    population BIGINT NOT NULL CHECK (population >= 0),
    capital VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(capital)) > 0),
    region VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(region)) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on region for potential future filtering
CREATE INDEX idx_countries_region ON countries(region);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data (sample countries)
INSERT INTO countries (iso_code, name, population, capital, region) VALUES
('USA', 'United States of America', 331000000, 'Washington, D.C.', 'Americas'),
('CAN', 'Canada', 38000000, 'Ottawa', 'Americas'),
('MEX', 'Mexico', 128000000, 'Mexico City', 'Americas'),
('BRA', 'Brazil', 212000000, 'Brasília', 'Americas'),
('ARG', 'Argentina', 45000000, 'Buenos Aires', 'Americas'),
('GBR', 'United Kingdom', 67000000, 'London', 'Europe'),
('FRA', 'France', 67000000, 'Paris', 'Europe'),
('DEU', 'Germany', 83000000, 'Berlin', 'Europe'),
('ITA', 'Italy', 60000000, 'Rome', 'Europe'),
('ESP', 'Spain', 47000000, 'Madrid', 'Europe'),
('RUS', 'Russia', 144000000, 'Moscow', 'Europe'),
('CHN', 'China', 1400000000, 'Beijing', 'Asia'),
('IND', 'India', 1380000000, 'New Delhi', 'Asia'),
('JPN', 'Japan', 126000000, 'Tokyo', 'Asia'),
('KOR', 'South Korea', 52000000, 'Seoul', 'Asia'),
('AUS', 'Australia', 25000000, 'Canberra', 'Oceania'),
('NZL', 'New Zealand', 5000000, 'Wellington', 'Oceania'),
('ZAF', 'South Africa', 59000000, 'Pretoria', 'Africa'),
('EGY', 'Egypt', 102000000, 'Cairo', 'Africa'),
('NGA', 'Nigeria', 206000000, 'Abuja', 'Africa');

-- Note: Production deployment would include all ~200 countries
```

---

## Migration Strategy

**Initial Migration** (`001_create_countries_table.sql`):
- Create `countries` table with all columns and constraints
- Create indexes and trigger for `updated_at`
- Seed initial data (all 200+ countries)

**Future Migrations**:
- `002_add_country_flag_url.sql`: Add optional `flag_url` column
- `003_add_country_currency.sql`: Add `currency_code` and `currency_name` columns
- All migrations must have corresponding rollback scripts

**Rollback Plan**:
```sql
-- Rollback 001_create_countries_table.sql
DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS countries CASCADE;
```

---

## Data Validation Rules Summary

| Entity | Validation | Enforced By |
|--------|------------|-------------|
| Country.iso_code | 3 uppercase letters | PostgreSQL CHECK constraint |
| Country.population | Non-negative | PostgreSQL CHECK constraint |
| Country.name | Non-empty | PostgreSQL CHECK constraint |
| GlobeState.rotation | Angles in [0, 2π) | Zustand action normalization |
| HoverState.hoveredCountryId | Valid ISO code or null | Frontend validation + API 404 |
| CountryInfo API | All fields present | Fastify JSON schema validation |

---

## Performance Considerations

1. **Database Queries**: Country lookups by `iso_code` are O(1) due to unique index
2. **Redis Caching**: Reduces database load by 95%+ for repeated country requests
3. **TopoJSON Size**: ~500KB compressed, parsed once at startup
4. **Geometry Storage**: Keep triangulated meshes in GPU memory (avoid re-triangulation)
5. **BVH Updates**: BVH is static after initial build (countries don't move)

---

## Data Sources

- **Country Boundaries**: Natural Earth 1:110m Cultural Vectors (public domain)
- **Country Metadata**: REST Countries API for initial data population
- **Population Data**: World Bank Open Data (updated annually)
