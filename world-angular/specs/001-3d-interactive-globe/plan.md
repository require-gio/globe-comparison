# Implementation Plan: 3D Interactive Globe

**Branch**: `001-3d-interactive-globe` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-3d-interactive-globe/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a 3D interactive globe web application that displays countries using Three.js/three-globe for rendering and provides detailed information on hover via REST API. The application uses Angular 20 for the frontend SPA and Node.js 22 + Express 5 for the backend API, both containerized with Docker Compose for local development.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend and Backend)  
**Primary Dependencies**: 
  - Frontend: Angular 20, Three.js 0.168, three-globe, Angular Material 17+, Tailwind CSS, RxJS
  - Backend: Node.js 22 LTS, Express 5, cors, morgan
**Storage**: Static JSON files (countries.json, countries-110m.geojson) - No database required  
**Testing**: 
  - Frontend: Jasmine + Karma (Angular default)
  - Backend: Jest + Supertest
**Target Platform**: Web browsers with WebGL 2.0 support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 60 FPS during 3D globe rotation, < 3 second initial load time, < 100ms API response time  
**Constraints**: < 200MB memory usage for 3D scene, client-side rendering only (no SSR), localhost development with Docker  
**Scale/Scope**: ~200 countries, single API endpoint, 2 containers, local development focus

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Frontend-Backend Separation ✅

- **Frontend**: Angular 20 SPA handles only presentation and user interaction (globe rendering, popover display)
- **Backend**: Node.js + Express handles only data processing (country metadata serving)
- **Communication**: Well-defined REST API (`GET /api/country/:code`)
- **No Business Logic in Frontend**: Country data validation and lookup occurs in backend

**Status**: ✅ PASS

### II. API-First Development ✅

- **REST API Defined**: OpenAPI 3.0 specification in `contracts/openapi.yaml`
- **JSON API**: All endpoints return consistent JSON format
- **Error Handling**: Consistent error formats (404, 400, 500 with message field)
- **Documentation**: API contracts documented in `contracts/README.md`

**Status**: ✅ PASS

### III. Component Architecture ✅

- **Reusable Components**: GlobeComponent, CountryInfoComponent (popover)
- **Clear Interfaces**: TypeScript interfaces for Country, HoverState
- **State Management**: RxJS BehaviorSubjects in services (CountryStateService, ApiService)
- **Decoupled UI**: Three.js rendering logic separated from Angular change detection

**Status**: ✅ PASS

### IV. Data Persistence ✅

- **Persistent Storage**: Static JSON files (read-only reference data)
- **No Migrations**: Data is static, no schema changes required
- **Validation**: Backend validates country code format (`^[A-Z]{2}$`)
- **Service Layer**: ApiService abstracts HTTP calls from components

**Status**: ✅ PASS (No database required for this use case)

### V. Environment Management ✅

- **Multiple Environments**: Development (docker-compose.yml) and Production (docker-compose.prod.yml)
- **Externalized Config**: Environment variables for API_URL, PORT, CORS_ORIGIN, NODE_ENV
- **Functional Equivalence**: Both environments use same Docker images with different configs
- **Reproducible Setup**: Docker Compose setup documented in quickstart.md

**Status**: ✅ PASS

### Technology Standards Compliance ✅

- **Frontend**: Angular 20 (modern framework) ✅
- **Backend**: Express 5 with HTTP routing and middleware ✅
- **Database**: Static JSON files (acceptable for read-only data) ✅
- **API**: RESTful HTTP with JSON (OpenAPI documented) ✅
- **Deployment**: Docker + Docker Compose ✅

### Code Quality Standards ✅

- **Linting**: ESLint for both frontend and backend ✅
- **Formatting**: Prettier configured ✅
- **Type Checking**: TypeScript with strict mode ✅
- **Dependencies**: package-lock.json for pinned versions ✅

**Overall Status**: ✅ ALL GATES PASSED - No constitutional violations

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
world-angular/
├── backend/                         # Node.js + Express REST API
│   ├── src/
│   │   ├── server.ts               # Main server entry point
│   │   ├── routes/
│   │   │   └── country.ts          # Country API route handler
│   │   └── data/
│   │       └── countries.json      # Country metadata (static)
│   ├── tests/
│   │   ├── unit/
│   │   │   └── country.route.spec.ts
│   │   └── integration/
│   │       └── api.integration.spec.ts
│   ├── Dockerfile                  # Production build
│   ├── Dockerfile.dev              # Development with hot reload
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                        # Angular 20 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── globe/
│   │   │   │   │   ├── globe.component.ts
│   │   │   │   │   ├── globe.component.html
│   │   │   │   │   └── globe.component.scss
│   │   │   │   └── country-info/
│   │   │   │       ├── country-info.component.ts
│   │   │   │       ├── country-info.component.html
│   │   │   │       └── country-info.component.scss
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── country-state.service.ts
│   │   │   │   └── country-cache.service.ts
│   │   │   ├── models/
│   │   │   │   └── country.model.ts
│   │   │   └── app.component.ts
│   │   ├── assets/
│   │   │   ├── earth-texture-8k.jpg    # NASA Blue Marble
│   │   │   ├── earth-texture-1k.jpg    # Low-res placeholder
│   │   │   └── countries-110m.geojson  # Natural Earth data
│   │   └── styles.css
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── api.service.spec.ts
│   │   │   └── country-state.service.spec.ts
│   │   ├── integration/
│   │   │   └── globe.component.spec.ts
│   │   └── e2e/
│   │       └── globe-interaction.spec.ts
│   ├── Dockerfile                      # Production build
│   ├── Dockerfile.dev                  # Development with hot reload
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── .env.example
│
├── specs/                              # Feature specifications
│   └── 001-3d-interactive-globe/
│       ├── spec.md
│       ├── plan.md                     # This file
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       └── contracts/
│           ├── openapi.yaml
│           └── README.md
│
├── .github/
│   ├── copilot-instructions.md         # GitHub Copilot context
│   └── workflows/
│       └── ci.yml
│
├── .specify/                           # Specification framework
│   ├── memory/
│   │   └── constitution.md
│   └── scripts/
│       └── bash/
│           ├── setup-plan.sh
│           └── update-agent-context.sh
│
├── docker-compose.yml                  # Development orchestration
├── docker-compose.prod.yml             # Production orchestration
├── .dockerignore
├── .gitignore
└── README.md
```

**Structure Decision**: 

Selected **Web Application** structure (Option 2) with separate `backend/` and `frontend/` directories. This aligns with:

1. **Constitution Principle I**: Clear frontend-backend separation
2. **Development Workflow**: Independent development and testing of each layer
3. **Docker Containerization**: Each directory has its own Dockerfile
4. **Technology Stack**: Angular (frontend) and Express (backend) are separate frameworks

The structure supports:
- Parallel development of frontend and backend after API contract agreement
- Independent deployment of containers
- Clear separation of concerns (UI vs. data)
- TypeScript across both layers for consistency

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected.** All design decisions comply with the constitution.

---

## Phase 0: Research (COMPLETED ✅)

**Output**: `research.md`

**Key Findings**:
1. Angular 20 + Three.js integration patterns (Zone.js considerations)
2. three-globe helper library for country polygon rendering
3. Natural Earth GeoJSON data source (110m resolution)
4. RxJS BehaviorSubjects sufficient for state management (no NgRx needed)
5. Angular CDK Overlay for native popover implementation
6. Static JSON storage appropriate for read-only country data
7. Docker multi-stage builds for optimized production images

**All NEEDS CLARIFICATION items resolved.**

---

## Phase 1: Design & Contracts (COMPLETED ✅)

**Outputs**:
- `data-model.md`: Country entity, HoverState, CountryCache, GeoJSON structures
- `contracts/openapi.yaml`: OpenAPI 3.0 specification for REST API
- `contracts/README.md`: API documentation with examples
- `quickstart.md`: Local development setup guide

**Key Artifacts**:
1. **Data Model**: TypeScript interfaces for Country, CountryGeometry, HoverState
2. **API Contract**: `GET /api/country/:code` endpoint with 200/404/400/500 responses
3. **Frontend-Backend Contract**: JSON communication with consistent error format
4. **Development Setup**: Docker Compose configuration for 2-container architecture

**Constitution Re-Check**: ✅ ALL GATES PASSED (see Constitution Check section above)

---

## Next Steps (Phase 2 - NOT part of /speckit.plan)

Phase 2 will be executed via the `/speckit.tasks` command and will generate:

1. `tasks.md`: Detailed implementation tasks broken down by component
2. Task assignment to frontend/backend/DevOps
3. Dependency graph between tasks
4. Estimated effort per task

**Command**: `copilot: /speckit.tasks` (to be run separately)

---

## Summary

| Aspect | Status | Details |
|--------|--------|---------|
| **Branch** | ✅ Created | `001-3d-interactive-globe` |
| **Research** | ✅ Complete | Technology stack finalized, no unknowns |
| **Data Model** | ✅ Complete | Country, HoverState, Cache structures defined |
| **API Contracts** | ✅ Complete | OpenAPI spec + documentation |
| **Quickstart** | ✅ Complete | Docker setup guide |
| **Constitution** | ✅ Compliant | All principles satisfied |
| **Agent Context** | ✅ Updated | Copilot instructions updated |

**Planning Phase Complete** ✅

The feature is ready for implementation. All design artifacts have been generated and validated against the constitution. Developers can now proceed with:

1. Setting up the Docker environment (`quickstart.md`)
2. Implementing backend API (`contracts/openapi.yaml`)
3. Implementing frontend components (`data-model.md`)
4. Following the API contract for integration

**Generated Files**:
- `/specs/001-3d-interactive-globe/spec.md`
- `/specs/001-3d-interactive-globe/plan.md` (this file)
- `/specs/001-3d-interactive-globe/research.md`
- `/specs/001-3d-interactive-globe/data-model.md`
- `/specs/001-3d-interactive-globe/quickstart.md`
- `/specs/001-3d-interactive-globe/contracts/openapi.yaml`
- `/specs/001-3d-interactive-globe/contracts/README.md`

**Branch**: `001-3d-interactive-globe`  
**Date**: 2025-10-13  
**Status**: Phase 0 & 1 Complete, Ready for Phase 2 (Tasks)
