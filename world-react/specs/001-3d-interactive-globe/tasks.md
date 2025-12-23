# Tasks: 3D Interactive Globe with Country Information

**Input**: Design documents from `/specs/001-3d-interactive-globe/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the specification, so test tasks are not included. Focus is on implementation of core functionality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 📊 Implementation Progress

**Last Updated**: October 9, 2025

| Phase | Tasks | Status | Completion |
|-------|-------|--------|------------|
| **Phase 1: Setup** | T001-T011 (11) | ✅ Complete | 100% |
| **Phase 2: Foundational** | T012-T029 (18) | ✅ Complete | 100% |
| **Backend API (US2)** | T043-T049 (7) | ✅ Complete | 100% |
| **Phase 3: User Story 1** | T030-T042 (13) | ✅ Complete | 100% |
| **Phase 4: User Story 2** | T050-T062 (13) | ✅ Complete | 100% |
| **Phase 5: User Story 3** | T063-T077 (15) | ⏳ Not Started | 0% |
| **Phase 6: Polish** | T078-T092 (15) | ⏳ Not Started | 0% |
| **OVERALL** | **92 tasks** | **62 complete** | **67%** |

**✅ User Stories 1 & 2 Complete!** - Interactive globe with country information display. Ready for visual polish (US3)!

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow the web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create backend project structure with package.json and TypeScript configuration in backend/
- [x] T002 [P] Create frontend project structure with Vite, React 19, and TypeScript configuration in frontend/
- [x] T003 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.js and backend/.prettierrc
- [x] T004 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.js and frontend/.prettierrc
- [x] T005 [P] Setup Tailwind CSS configuration in frontend/tailwind.config.js
- [x] T006 [P] Create Docker Compose configuration for local development in docker/docker-compose.yml
- [x] T007 [P] Create backend Dockerfile in docker/backend.Dockerfile
- [x] T008 [P] Create frontend Dockerfile in docker/frontend.Dockerfile
- [x] T009 [P] Setup GitHub Actions CI workflow for backend in .github/workflows/backend-ci.yml
- [x] T010 [P] Setup GitHub Actions CI workflow for frontend in .github/workflows/frontend-ci.yml
- [x] T011 Create environment configuration template files (.env.example for both frontend and backend)

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**✅ COMPLETE**: Foundation is ready - user story implementation can now begin!

- [x] T012 Create PostgreSQL database schema for countries table in backend/src/db/migrations/001_create_countries_table.sql
- [x] T013 Create database migration runner script in backend/src/db/migrations/index.ts
- [x] T014 [P] Create PostgreSQL connection pool module in backend/src/db/connection.ts
- [x] T015 [P] Create Redis connection module in backend/src/db/redis.ts
- [x] T016 [P] Create Country model with TypeScript types in backend/src/models/Country.ts
- [x] T017 [P] Setup Fastify server with middleware in backend/src/api/server.ts
- [x] T018 [P] Create error handler middleware in backend/src/api/middleware/errorHandler.ts
- [x] T019 [P] Create rate limiter middleware (configured in server.ts with @fastify/rate-limit)
- [x] T020 [P] Setup CORS configuration (configured in server.ts with @fastify/cors)
- [x] T020 [P] Create request logger middleware in backend/src/api/middleware/requestLogger.ts
- [x] T021 Create CountryService with database queries in backend/src/services/CountryService.ts
- [x] T022 Create CacheService for Redis operations in backend/src/services/CacheService.ts
- [x] T023 Create database seed script with 20 sample countries in backend/src/db/seed.ts
- [x] T024 [P] Setup React app entry point in frontend/src/main.tsx
- [x] T025 [P] Create root App component in frontend/src/App.tsx
- [x] T026 [P] Create AppLayout component in frontend/src/components/Layout/AppLayout.tsx
- [x] T027 [P] Setup TanStack Query provider in frontend/src/main.tsx
- [x] T028 [P] Create TypeScript types for Country in frontend/src/types/Country.ts
- [x] T029 [P] Create TypeScript types for API responses in frontend/src/types/api.ts

**✅ Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Globe Rotation and Navigation (Priority: P1) 🎯 MVP

**Goal**: Users can freely explore the 3D globe by rotating it with mouse drag interactions

**Independent Test**: Load page, click and drag globe, observe smooth rotation. No backend required.

### Implementation for User Story 1

- [x] T030 [P] [US1] Create GlobeState Zustand store in frontend/src/store/globeStore.ts
- [x] T031 [P] [US1] Create TypeScript types for GlobeState in frontend/src/types/GlobeState.ts
- [x] T032 [P] [US1] Download and add Earth texture image to frontend/src/assets/textures/earth.jpg
- [x] T033 [P] [US1] Download TopoJSON country boundaries data to frontend/public/data/countries.topojson
- [x] T034 [US1] Create TopoJSON loader utility in frontend/src/services/geometry/topoJsonLoader.ts
- [x] T035 [US1] Create Globe component with three.js sphere in frontend/src/components/Globe/Globe.tsx
- [x] T036 [US1] Create useGlobeControls hook for drag interaction in frontend/src/components/Globe/useGlobeControls.ts
- [x] T037 [US1] Create CountryMesh component for rendering country boundaries in frontend/src/components/Globe/CountryMesh.tsx
- [x] T038 [US1] Add momentum-based rotation to useGlobeControls hook in frontend/src/components/Globe/useGlobeControls.ts
- [x] T039 [US1] Add cursor change visual feedback during drag in frontend/src/components/Globe/useGlobeControls.ts
- [x] T040 [US1] Integrate Globe component into AppLayout in frontend/src/components/Layout/AppLayout.tsx
- [x] T041 [US1] Add performance monitoring (FPS counter) in frontend/src/utils/performanceMonitor.ts
- [x] T042 [US1] Optimize rendering to achieve 60 FPS target in frontend/src/components/Globe/Globe.tsx

**Checkpoint**: ✅ COMPLETE - User Story 1 is fully functional and testable independently - users can rotate the globe smoothly

---

## Phase 4: User Story 2 - Country Hover and Information Display (Priority: P2)

**Goal**: Users can hover over countries to see highlights and information popovers with data from backend

**Independent Test**: Hover over countries, verify highlight appears and popover displays country information from API

### Backend Implementation for User Story 2 ✅ COMPLETE

- [x] T043 [P] [US2] Create GET /api/countries/:iso route handler in backend/src/api/routes/countries.ts
- [x] T044 [P] [US2] Create GET /api/globe/topojson route handler in backend/src/api/routes/globe.ts
- [x] T045 [US2] Integrate CountryService with countries route in backend/src/api/routes/countries.ts
- [x] T046 [US2] Integrate CacheService with countries route for Redis caching in backend/src/api/routes/countries.ts
- [x] T047 [US2] Add JSON Schema validation for country ISO codes in backend/src/api/routes/countries.ts
- [x] T048 [US2] Add error handling for 404 (not found) and 400 (invalid ISO) in backend/src/api/routes/countries.ts
- [x] T049 [US2] Register routes in Fastify server in backend/src/api/server.ts

### Frontend Implementation for User Story 2

- [x] T050 [P] [US2] Create HoverState Zustand store in frontend/src/store/hoverStore.ts
- [x] T051 [P] [US2] Create TypeScript types for HoverState in frontend/src/types/HoverState.ts
- [x] T052 [P] [US2] Install and configure three-mesh-bvh library in frontend/package.json
- [x] T053 [US2] Create raycast helper with BVH spatial indexing in frontend/src/services/geometry/raycastHelper.ts
- [x] T054 [US2] Create useCountryHover hook for hover detection in frontend/src/components/Globe/useCountryHover.ts
- [x] T055 [US2] Add hover event handlers to Globe component in frontend/src/components/Globe/Globe.tsx
- [x] T056 [US2] Create country highlight effect in CountryMesh component in frontend/src/components/Globe/CountryMesh.tsx
- [x] T057 [US2] Create TanStack Query hook for country API in frontend/src/services/api/countryApi.ts
- [x] T058 [US2] Create CountryPopover component with Radix UI in frontend/src/components/Popover/CountryPopover.tsx
- [x] T059 [US2] Add debounce logic to hover detection (50ms) in frontend/src/components/Globe/useCountryHover.ts
- [x] T060 [US2] Add 200ms delay before showing popover in frontend/src/components/Popover/CountryPopover.tsx
- [x] T061 [US2] Add graceful error handling for API failures in frontend/src/components/Popover/CountryPopover.tsx
- [x] T062 [US2] Integrate popover with Globe component in frontend/src/components/Globe/Globe.tsx

**Checkpoint**: ✅ COMPLETE - User Stories 1 AND 2 are both fully functional - rotation works, and hovering displays country information from backend API

---

## Phase 5: User Story 3 - Visual Design and Polish (Priority: P3)

**Goal**: Application has sleek, modern visual design with lighting effects and smooth animations

**Independent Test**: Visual review to verify realistic textures, lighting effects, smooth animations, and minimal UI

### Implementation for User Story 3

- [ ] T063 [P] [US3] Add high-quality Earth texture (4K or 8K) to frontend/src/assets/textures/earth-4k.jpg
- [ ] T064 [P] [US3] Add normal map for Earth surface detail to frontend/src/assets/textures/earth-normal.jpg
- [ ] T065 [P] [US3] Add specular map for ocean shininess to frontend/src/assets/textures/earth-specular.jpg
- [ ] T066 [US3] Configure realistic lighting in Globe component (ambient + directional) in frontend/src/components/Globe/Globe.tsx
- [ ] T067 [US3] Add dynamic lighting effects that respond to globe rotation in frontend/src/components/Globe/Globe.tsx
- [ ] T068 [US3] Create dark/space-themed background with CSS in frontend/src/App.css
- [ ] T069 [US3] Add gradient or starfield background effect in frontend/src/components/Layout/AppLayout.tsx
- [ ] T070 [US3] Style CountryPopover with semi-transparent design in frontend/src/components/Popover/CountryPopover.tsx
- [ ] T071 [US3] Add Framer Motion fade-in animation to popover in frontend/src/components/Popover/CountryPopover.tsx
- [ ] T072 [US3] Add Framer Motion fade-out animation to popover in frontend/src/components/Popover/CountryPopover.tsx
- [ ] T073 [US3] Add smooth highlight transition effects to CountryMesh in frontend/src/components/Globe/CountryMesh.tsx
- [ ] T074 [US3] Optimize globe materials for performance in frontend/src/components/Globe/Globe.tsx
- [ ] T075 [US3] Add subtle glow effect to highlighted countries in frontend/src/components/Globe/CountryMesh.tsx
- [ ] T076 [US3] Remove or minimize UI chrome (headers, footers) in frontend/src/components/Layout/AppLayout.tsx
- [ ] T077 [US3] Add loading spinner/animation for initial globe load in frontend/src/components/Layout/AppLayout.tsx

**Checkpoint**: All user stories should now be independently functional with polished visual design

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories or overall application quality

- [ ] T078 [P] Add README with setup instructions in root README.md
- [ ] T079 [P] Document API endpoints in backend/README.md
- [ ] T080 [P] Document frontend architecture in frontend/README.md
- [ ] T081 [P] Create database migration rollback script in backend/src/db/migrations/rollback.ts
- [ ] T082 Add comprehensive error logging to backend in backend/src/utils/logger.ts
- [ ] T083 Add API request logging middleware in backend/src/api/middleware/requestLogger.ts
- [ ] T084 Add performance monitoring to frontend (Web Vitals) in frontend/src/utils/webVitals.ts
- [ ] T085 [P] Add health check endpoint at GET /health in backend/src/api/routes/health.ts
- [ ] T086 [P] Add environment variable validation on startup in backend/src/config/env.ts
- [ ] T087 [P] Create .env.example files with all required variables for both frontend and backend
- [ ] T088 Add fallback for WebGL not supported in frontend/src/components/Globe/Globe.tsx
- [ ] T089 Optimize bundle size with code splitting in frontend/vite.config.ts
- [ ] T090 Add proper TypeScript build scripts in both frontend and backend package.json files
- [ ] T091 Run quickstart.md validation (manual testing of all 3 user stories)
- [ ] T092 Final performance audit and optimization pass across all components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - Can run parallel to US1 if staffed
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion - Enhances existing functionality
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires backend API (T043-T049) and frontend hover (T050-T062)
- **User Story 3 (P3)**: Requires US1 and US2 complete - Adds polish to existing functionality

### Within Each Phase

**Phase 1 (Setup)**:
- All tasks marked [P] can run in parallel
- T011 should run after T001-T010 are complete

**Phase 2 (Foundational)**:
- Database tasks (T012-T013) must complete before T014
- T014 (DB connection) before T021 (CountryService)
- T015 (Redis connection) before T022 (CacheService)
- T016 (Country model) before T021 (CountryService)
- T017 (Fastify setup) before T018-T020 (middleware)
- T021-T022 (Services) before T023 (seed script)
- Frontend tasks (T024-T029) can run in parallel with backend tasks

**Phase 3 (User Story 1)**:
- T030-T033 can all run in parallel (setup tasks)
- T034 (TopoJSON loader) before T037 (CountryMesh)
- T035 (Globe component) before T036, T038, T039 (controls)
- T037 (CountryMesh) before T040 (integration)
- T035 before T040 (integration)
- T041-T042 (performance) can be done after core functionality

**Phase 4 (User Story 2)**:
- Backend tasks (T043-T049) can progress independently
- Frontend tasks (T050-T062) have dependencies:
  - T050-T052 can run in parallel
  - T053 (raycast helper) needs T052 (BVH library)
  - T054 (useCountryHover) needs T053 (raycast)
  - T057 (API hook) can run in parallel with T050-T054
  - T058 (Popover component) before T060-T061
  - T055-T056, T059, T062 require prior tasks complete

**Phase 5 (User Story 3)**:
- T063-T065 (textures) can run in parallel
- T066-T067 (lighting) sequential on same file
- T068-T069 (background) can run in parallel
- T070-T072 (popover animations) sequential on same file
- T073, T075 (highlight effects) sequential on same file

**Phase 6 (Polish)**:
- T078-T081, T085-T087 can all run in parallel (documentation)
- Others are sequential or independent

### Parallel Opportunities

**Setup Phase (Phase 1)**:
```bash
# Can run all setup tasks simultaneously
T001 (Backend project) | T002 (Frontend project) | T003 (Backend linting) | 
T004 (Frontend linting) | T005 (Tailwind) | T006-T008 (Docker) | T009-T010 (CI)
```

**Foundational Phase (Phase 2)**:
```bash
# Backend and frontend foundational work can be parallel
Backend: T012→T013→T014→T021→T022→T023
         T015→T022
         T016→T021
         T017→T018, T019, T020

Frontend: T024→T027 | T025 | T026 | T028 | T029 (all parallel after T024)
```

**User Story 1 (Phase 3)**:
```bash
# Initial setup tasks in parallel
T030 | T031 | T032 | T033

# Then sequential pipeline
T034 → T037 → T040
T035 → T036, T038, T039 → T040
```

**User Story 2 (Phase 4)**:
```bash
# Backend and frontend can be fully parallel
Backend: T043 | T044 → T045, T046, T047, T048 → T049

Frontend: T050 | T051 | T052 → T053 → T054
          T057 | T058 → T060, T061
          All → T055, T056, T059, T062
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (rotate globe)
5. Deploy/demo if ready - working 3D globe with rotation

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - interactive globe)
3. Add User Story 2 → Test independently → Deploy/Demo (country information feature)
4. Add User Story 3 → Test independently → Deploy/Demo (polished design)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phases 1-2)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Frontend - Globe rotation) - T030-T042
   - **Developer B**: User Story 2 Backend (API) - T043-T049
   - **Developer C**: User Story 2 Frontend (Hover) - T050-T062
3. User Story 3 can be done by any developer after US1 and US2 complete
4. Polish tasks can be distributed across team

---

## Task Summary

**Total Tasks**: 92

**Tasks by Phase**:
- Phase 1 (Setup): 11 tasks
- Phase 2 (Foundational): 18 tasks
- Phase 3 (User Story 1 - P1): 13 tasks
- Phase 4 (User Story 2 - P2): 20 tasks (9 backend + 13 frontend)
- Phase 5 (User Story 3 - P3): 15 tasks
- Phase 6 (Polish): 15 tasks

**Tasks by User Story**:
- User Story 1 (Globe Rotation): 13 tasks (T030-T042)
- User Story 2 (Country Hover): 20 tasks (T043-T062)
- User Story 3 (Visual Polish): 15 tasks (T063-T077)
- Infrastructure (Setup + Foundational + Polish): 44 tasks

**Parallel Opportunities**: ~35 tasks marked with [P] can run in parallel

**Critical Path**: 
Setup (11 tasks) → Foundational (18 tasks) → US1 (13 tasks) → US2 (20 tasks) → US3 (15 tasks) → Polish (15 tasks)

**Minimum MVP**: Complete through Phase 3 (42 tasks total: 11 setup + 18 foundational + 13 US1)

**Recommended First Release**: Complete through Phase 4 (62 tasks: MVP + 20 US2 tasks)

**Full Feature Complete**: All 92 tasks

---

## Notes

- **No tests included**: Tests were not explicitly requested in the specification
- **[P] tasks**: Different files, no dependencies - can execute simultaneously
- **[Story] labels**: US1, US2, US3 map tasks to specific user stories for traceability
- Each user story phase is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Performance monitoring is built into User Story 1 (T041-T042)
- Error handling and caching are part of User Story 2 backend (T046, T048)
- Visual polish is entirely contained in User Story 3 (T063-T077)
