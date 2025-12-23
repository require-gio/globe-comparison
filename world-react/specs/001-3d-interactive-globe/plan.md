# Implementation Plan: 3D Interactive Globe with Country Information

**Branch**: `001-3d-interactive-globe` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-3d-interactive-globe/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a single-page web application featuring a 3D interactive globe where users can rotate the globe with mouse drag interactions and hover over countries to display information popovers. The frontend uses React + TypeScript with three.js for 3D rendering, while the backend provides a REST API for country information using Node.js + Fastify with PostgreSQL storage. The application prioritizes performance (60 FPS), sleek visual design, and sub-500ms API responses.

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.x with React 19.x
- Backend: Node.js 20.x with TypeScript 5.x

**Primary Dependencies**:
- Frontend: React 19, three.js, react-three-fiber, @react-three/drei, Vite, TanStack Query, Zustand, Tailwind CSS, Radix UI, Framer Motion
- Backend: Fastify 4.x, PostgreSQL 15+, Redis 7.x
- Geometry: TopoJSON, GeoJSON, earcut, three-mesh-bvh

**Storage**: PostgreSQL 15+ for country metadata (name, population, capital, region); Redis for API caching and rate limiting; Object storage (S3/R2) for TopoJSON/textures

**Testing**: 
- Frontend: Vitest (unit), Playwright (E2E interaction tests)
- Backend: Vitest (unit), integration tests via Fastify inject
- Visual regression: Chromatic or Percy

**Target Platform**: Desktop web browsers (Chrome, Firefox, Safari, Edge) with WebGL support; minimum 2GB RAM and modern GPU

**Project Type**: web (frontend + backend SPA architecture)

**Performance Goals**: 
- 60 FPS globe rotation (< 16ms frame time)
- < 100ms country highlight response
- < 200ms popover display
- < 500ms API response time (p95)
- < 3s initial page load

**Constraints**:
- WebGL 2.0 required for 3D rendering
- Desktop-only (no touch/mobile in MVP)
- Mouse interaction only (no keyboard navigation in MVP)
- Single-page application (no routing)
- Real-time hover detection with spatial indexing (BVH)

**Scale/Scope**:
- ~200 countries with polygon boundaries
- Single page application (1 route)
- Estimated 10-50 concurrent users (MVP scale)
- Moderate API caching (Redis TTL: 1 hour for country data)
- TopoJSON asset ~500KB compressed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Frontend-Backend Separation
✅ **PASS** - Clear separation maintained:
- Frontend: React components handle only presentation and user interaction (3D rendering, mouse events, UI)
- Backend: Fastify API handles only data processing (country information retrieval, caching)
- Communication: REST API endpoints with JSON payloads
- No business logic in frontend components (country data comes from backend)

### Principle II: API-First Development
✅ **PASS** - API contracts defined:
- GET /api/countries/:iso - Returns country information (name, population, capital, region)
- GET /api/globe/topojson - Returns geographic boundary data
- All responses use JSON format with consistent error handling
- API documentation will be maintained in contracts/ directory (OpenAPI spec)

### Principle III: Component Architecture
✅ **PASS** - Component-based frontend:
- React components with TypeScript interfaces for props
- Zustand for predictable state management (globe orientation, hover state)
- TanStack Query decouples data fetching from UI components
- Reusable components: Globe, CountryMesh, Popover, etc.

### Principle IV: Data Persistence
✅ **PASS** - PostgreSQL with migrations:
- PostgreSQL database for country metadata with proper schema
- Database migrations will be versioned and reversible
- Data validation at database level (NOT NULL constraints, foreign keys)
- Service layer abstraction between API and database

### Principle V: Environment Management
✅ **PASS** - Multi-environment support:
- Environment variables for API endpoints, database connections, Redis config
- Separate dev/staging/production configurations
- Vite for frontend env variables, dotenv for backend
- Docker-based deployment with environment-specific configs

## Project Structure

### Documentation (this feature)

```
specs/001-3d-interactive-globe/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── get-country-info.yaml
│   └── get-topojson.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/
│   │   └── Country.ts           # PostgreSQL country model
│   ├── services/
│   │   ├── CountryService.ts    # Business logic for country data
│   │   └── CacheService.ts      # Redis caching layer
│   ├── api/
│   │   ├── routes/
│   │   │   ├── countries.ts     # GET /api/countries/:iso
│   │   │   └── globe.ts         # GET /api/globe/topojson
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimit.ts
│   │   └── server.ts            # Fastify app setup
│   ├── db/
│   │   ├── migrations/          # Versioned DB schema changes
│   │   └── connection.ts        # PostgreSQL connection pool
│   └── config/
│       └── env.ts               # Environment configuration
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── models/
│   ├── integration/
│   │   └── api/
│   └── fixtures/
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── Globe/
│   │   │   ├── Globe.tsx        # Main 3D globe container
│   │   │   ├── CountryMesh.tsx  # Individual country geometry
│   │   │   ├── useGlobeControls.ts
│   │   │   └── useCountryHover.ts
│   │   ├── Popover/
│   │   │   └── CountryPopover.tsx
│   │   └── Layout/
│   │       └── AppLayout.tsx
│   ├── services/
│   │   ├── api/
│   │   │   └── countryApi.ts    # TanStack Query hooks
│   │   └── geometry/
│   │       ├── topoJsonLoader.ts
│   │       └── raycastHelper.ts # BVH raycasting
│   ├── store/
│   │   ├── globeStore.ts        # Zustand state management
│   │   └── hoverStore.ts
│   ├── types/
│   │   ├── Country.ts
│   │   ├── GlobeState.ts
│   │   └── api.ts
│   ├── assets/
│   │   ├── textures/            # Earth textures
│   │   └── data/                # TopoJSON files
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   │   └── components/
│   └── e2e/
│       └── globe-interaction.spec.ts
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js

docker/
├── backend.Dockerfile
├── frontend.Dockerfile
└── docker-compose.yml

.github/
└── workflows/
    ├── backend-ci.yml
    └── frontend-ci.yml
```

**Structure Decision**: Selected web application structure (Option 2) with separate frontend/ and backend/ directories. This aligns with the constitution's Frontend-Backend Separation principle and enables independent development, testing, and deployment of each layer. The structure supports the API-first approach with clear contracts/ documentation and maintains component architecture in the frontend.
