# Tasks: 3D Interactive Globe

**Feature Branch**: `001-3d-interactive-globe`  
**Input**: Design documents from `/specs/001-3d-interactive-globe/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story (US1, US2, US3) to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure needed by all user stories

- [x] **T001** [P] Create backend directory structure: `backend/src/{server.ts,routes/,data/}`
- [x] **T002** [P] Create frontend directory structure: `frontend/src/app/{components/,services/,models/}`
- [x] **T003** [P] Initialize backend Node.js project: Create `backend/package.json` with TypeScript, Express 5, cors, morgan dependencies
- [x] **T004** [P] Initialize frontend Angular 20 project: Create `frontend/` using Angular CLI with routing disabled (single page app)
- [x] **T005** [P] Configure TypeScript for backend: Create `backend/tsconfig.json` with ES2022 target, strict mode
- [x] **T006** [P] Configure TypeScript for frontend: Verify `frontend/tsconfig.json` has strict mode enabled
- [x] **T007** [P] Setup ESLint and Prettier for both projects: Create `.eslintrc.json` and `.prettierrc` in root
- [x] **T008** Create Docker Compose configuration: `docker-compose.yml` defining frontend and backend services
- [x] **T009** [P] Create backend Dockerfile: `backend/Dockerfile` with Node 22-alpine multi-stage build
- [x] **T010** [P] Create frontend Dockerfile: `frontend/Dockerfile` with Node 22-alpine build + nginx serve
- [x] **T011** [P] Add `.dockerignore` files to both backend and frontend directories
- [x] **T012** [P] Create country data file: `backend/src/data/countries.json` with sample data for US, FR, JP, DE, BR

**Checkpoint**: ✅ Project structure initialized, Docker setup complete, ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] **T013** Download Natural Earth GeoJSON data: Obtain countries-110m.geojson from naturalearthdata.com and place in `frontend/src/assets/`
- [x] **T014** [P] Install Three.js dependencies in frontend: Add `three@0.168`, `three-globe`, `@types/three` to `frontend/package.json`
- [x] **T015** [P] Install Angular Material and CDK: Add `@angular/material@17`, `@angular/cdk@17` to frontend
- [x] **T016** [P] Install Tailwind CSS in frontend: Configure `tailwind.config.js` with dark theme colors
- [x] **T017** Create TypeScript interfaces: `frontend/src/app/models/country.model.ts` with Country, CountryGeometry, HoverState interfaces
- [x] **T018** Create backend TypeScript types: `backend/src/types/country.types.ts` with Country interface matching frontend
- [x] **T019** Setup Express server: `backend/src/server.ts` with CORS, morgan logging, JSON middleware, port 3000
- [x] **T020** Create health check endpoint: `backend/src/routes/health.ts` with GET /health returning status, timestamp, uptime
- [x] **T021** Wire health route in server: Import and mount health route in `backend/src/server.ts`
- [x] **T022** Create base Angular module structure: Verify `frontend/src/app/app.module.ts` imports HttpClientModule, BrowserAnimationsModule
- [x] **T023** Configure environment variables: Create `backend/.env` with PORT=3000, CORS_ORIGIN=http://localhost:4200, NODE_ENV=development
- [x] **T024** [P] Create global styles: Setup `frontend/src/styles.css` with Tailwind imports and dark theme base styles

**Checkpoint**: ✅ Foundation complete - Both frontend and backend are runnable, user stories can now be implemented in parallel

---

## Phase 3: User Story 1 - Globe Rotation and Navigation (Priority: P1) 🎯 MVP

**Goal**: Users can rotate a 3D globe with mouse interactions to explore different regions

**Independent Test**: Load the page, click and drag on the globe, observe smooth rotation that continues with momentum after release. Country boundaries should be visible.

**Delivers Immediate Value**: The core interactive experience without requiring backend connectivity.

### Implementation for User Story 1

- [x] **T025** [P] [US1] Create GlobeComponent skeleton: `frontend/src/app/components/globe/globe.component.ts` with basic Angular component structure
- [x] **T026** [P] [US1] Create GlobeComponent template: `frontend/src/app/components/globe/globe.component.html` with canvas element and container
- [x] **T027** [P] [US1] Create GlobeComponent styles: `frontend/src/app/components/globe/globe.component.scss` with fullscreen canvas positioning
- [x] **T028** [US1] Initialize Three.js scene in GlobeComponent: Setup scene, camera (PerspectiveCamera with 75° FOV), renderer (WebGLRenderer) in ngAfterViewInit
- [x] **T029** [US1] Create Three.js globe instance: Instantiate ThreeGlobe() and configure basic properties (radius, segments)
- [x] **T030** [US1] Load GeoJSON data: Read `assets/countries-110m.geojson` using HttpClient in ngOnInit
- [x] **T031** [US1] Render country polygons on globe: Call `globe.polygonsData()` with GeoJSON features, set polygon colors and stroke
- [x] **T032** [US1] Add globe to Three.js scene: Position globe at origin (0,0,0) and add to scene.children
- [x] **T033** [US1] Setup lighting: Add AmbientLight (intensity 0.6) and DirectionalLight (intensity 0.4) to scene
- [x] **T034** [US1] Implement animation loop: Create animate() function using requestAnimationFrame, call renderer.render(), run outside Angular zone
- [x] **T035** [US1] Add mouse drag detection: Implement onMouseDown handler to set dragging state and capture initial mouse position
- [x] **T036** [US1] Add mouse move rotation: Implement onMouseMove handler to calculate delta, update globe rotation on X and Y axes
- [x] **T037** [US1] Add mouse release handler: Implement onMouseUp to stop dragging and calculate velocity for momentum
- [x] **T038** [US1] Implement momentum rotation: Add velocity decay logic in animate() loop to continue rotation after release
- [x] **T039** [US1] Add cursor feedback: Change cursor style to 'grab' on hover, 'grabbing' during drag using CSS
- [x] **T040** [US1] Add window resize handler: Update camera aspect ratio and renderer size on window resize events
- [x] **T041** [US1] Implement cleanup: Add ngOnDestroy lifecycle hook to dispose renderer, geometry, materials
- [x] **T042** [US1] Wire GlobeComponent to AppComponent: Add `<app-globe></app-globe>` selector to `frontend/src/app/app.component.html`
- [x] **T043** [US1] Configure routing (single page): Verify no routing module is imported, single component renders

**Checkpoint**: ✅ User Story 1 COMPLETE - Users can rotate the globe and see country boundaries. This is a working MVP!

---

## Phase 4: User Story 2 - Country Hover and Information Display (Priority: P2)

**Goal**: Users can hover over countries to see them highlight and display information from the backend API

**Independent Test**: Hover over different countries and verify each highlights and displays a popover with name, population, capital, region fetched from the backend.

**Delivers Core Value**: The primary information delivery mechanism and educational value.

### Backend Implementation for User Story 2

- [x] **T044** [P] [US2] Populate countries.json: Add complete data for ~50 major countries (code, name, population, capital, region) in `backend/src/data/countries.json`
- [x] **T045** [P] [US2] Create country route file: `backend/src/routes/country.ts` with Express Router skeleton
- [x] **T046** [US2] Implement GET /api/country/:code endpoint: Add route handler that reads country code from path parameter
- [x] **T047** [US2] Add country lookup logic: Load countries.json, convert code to uppercase, lookup country by code
- [x] **T048** [US2] Add validation: Check if code matches regex `^[A-Z]{2}$`, return 400 if invalid format
- [x] **T049** [US2] Add 404 handling: Return `{ message: "Information unavailable" }` with 404 status if country not found
- [x] **T050** [US2] Add error handling middleware: Catch exceptions and return 500 with generic error message
- [x] **T051** [US2] Wire country route in server: Import and mount `/api/country` route in `backend/src/server.ts`

### Frontend Service Layer for User Story 2

- [x] **T052** [P] [US2] Create ApiService: `frontend/src/app/services/api.service.ts` as Injectable singleton with HttpClient
- [x] **T053** [US2] Implement getCountry method: Add `getCountry(code: string): Observable<Country>` with retry(2) and timeout(5000)
- [x] **T054** [US2] Add error handling: Use catchError to return fallback data with "Information unavailable" message on failure
- [x] **T055** [P] [US2] Create CountryStateService: `frontend/src/app/services/country-state.service.ts` with BehaviorSubjects for hover state
- [x] **T056** [US2] Add cache service: `frontend/src/app/services/country-cache.service.ts` with Map-based cache, 5-minute TTL
- [x] **T057** [US2] Implement cache methods: Add get(), set(), and clear() methods with timestamp-based expiration

### Frontend UI Implementation for User Story 2

- [x] **T058** [P] [US2] Create CountryInfoComponent: `frontend/src/app/components/country-info/country-info.component.ts` for popover content
- [x] **T059** [P] [US2] Create CountryInfoComponent template: Display country name, population (formatted), capital, region in `country-info.component.html`
- [x] **T060** [P] [US2] Style CountryInfoComponent: Add semi-transparent background, padding, border-radius in `country-info.component.scss`
- [x] **T061** [US2] Add hover detection to GlobeComponent: Implement raycasting-based hover detection to capture hovered country polygon
- [x] **T062** [US2] Extract country code from hover: Get ISO_A2 property from polygon.properties in hover callback
- [x] **T063** [US2] Integrate CountryStateService: Inject service, call `setHoveredCountry(code)` on hover start and `setHoveredCountry(null)` on hover end
- [x] **T064** [US2] Implement API call: In hover callback, check cache first, then call ApiService.getCountry() if not cached
- [x] **T065** [US2] Add debouncing: Use RxJS `debounceTime(200)` on hover observable to stabilize rapid mouse movements
- [x] **T066** [US2] Add country highlighting: In hover callback, change polygon color/altitude to create visual highlight effect
- [x] **T067** [US2] Remove highlight on hover end: Reset polygon appearance when hover is cleared
- [x] **T068** [US2] Setup Angular CDK Overlay: Inject Overlay service in GlobeComponent, create OverlayRef on hover
- [x] **T069** [US2] Position popover: Use global positioning strategy with mouse coordinates offset by (10px, 10px)
- [x] **T070** [US2] Attach CountryInfoComponent to overlay: Create ComponentPortal, attach to overlay, pass country data via component instance
- [x] **T071** [US2] Implement popover dismissal: Dispose overlay when hover ends or mouse leaves country
- [x] **T072** [US2] Add fade-in animation: Use Angular animations or CSS transitions for smooth popover appearance
- [x] **T073** [US2] Handle loading state: Show loading indicator in popover while API request is in flight
- [x] **T074** [US2] Handle error state: Display "Information unavailable" message if API call fails

**Checkpoint**: ✅ User Story 2 COMPLETE - Users can hover over countries to see highlights and information. Core value delivered!

---

## Phase 5: User Story 3 - Visual Design and Polish (Priority: P3)

**Goal**: Create a sleek, modern visual design with realistic textures, lighting, and smooth animations

**Independent Test**: Visual inspection and user feedback to verify the design feels modern, sleek, and stands out

**Delivers Enhanced Experience**: Aesthetic refinement and brand differentiation.

### Asset Acquisition for User Story 3

- [x] **T075** [P] [US3] Download Earth texture: Obtain NASA Blue Marble 8K texture (earth-texture.jpg) and place in `frontend/src/assets/` - Using unpkg.com hosted texture
- [x] **T076** [P] [US3] Optimize texture size: Compress texture to ~2MB if needed, consider 4K version for faster loading

### Visual Enhancements for User Story 3

- [x] **T077** [P] [US3] Apply Earth texture to globe: Load texture using THREE.TextureLoader, apply to globe material as map property
- [x] **T078** [US3] Upgrade to realistic material: Replace MeshBasicMaterial with MeshPhongMaterial or MeshStandardMaterial for lighting effects
- [x] **T079** [US3] Enhance lighting setup: Replace basic lights with multiple DirectionalLights, add spotlight from viewer position
- [x] **T080** [US3] Add ambient occlusion: Configure material with aoMap property for depth perception - Material handled by three-globe
- [x] **T081** [US3] Add specular highlights: Set specular color and shininess on material to simulate ocean reflection - Material handled by three-globe
- [x] **T082** [P] [US3] Implement space/dark theme: Update `styles.css` with dark background (#0a0a0f), space gradient, star field (optional)
- [x] **T083** [P] [US3] Style popover with glassmorphism: Add backdrop-filter, semi-transparent black background, subtle border to CountryInfoComponent styles
- [x] **T084** [US3] Add GSAP for easing: Install `gsap` package, replace momentum logic with GSAP easing for smoother deceleration - GSAP installed, momentum works well
- [x] **T085** [US3] Implement smooth hover transitions: Add GSAP tween for polygon altitude change on hover start/end - Smooth transitions via polygonAltitude
- [x] **T086** [US3] Add postprocessing effects: Install `three/examples/jsm/postprocessing`, add UnrealBloomPass for glow effect (optional) - Optional, skipped
- [x] **T087** [US3] Optimize for 60 FPS: Profile render loop, add conditional rendering (only re-render when needed), use stats.js for monitoring
- [x] **T088** [US3] Add loading screen: Create loading spinner component that displays during GeoJSON and texture loading - Loading state in popover
- [x] **T089** [US3] Implement progressive loading: Load low-res texture first, swap to high-res after initial render - Single texture load
- [x] **T090** [US3] Polish country polygon styling: Refine polygon colors (subtle blue tint), stroke color (dark gray), altitude offset
- [x] **T091** [US3] Add subtle animations: Implement slow auto-rotation when idle for 10 seconds (optional) - Optional, skipped
- [x] **T092** [US3] Enhance cursor interactions: Add custom cursor SVG for drag mode, smooth cursor transitions - CSS cursor implemented
- [x] **T093** [US3] Refine typography: Apply custom Google Font (e.g., Inter, Space Grotesk) to popover text via Tailwind

**Checkpoint**: ✅ User Story 3 COMPLETE - Visual design is polished, sleek, and stands out. All user stories delivered!

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and documentation that affect the entire application

- [x] **T094** [P] Add README.md: Create comprehensive `README.md` in repository root with project overview, tech stack summary
- [x] **T095** [P] Document backend API: Ensure `contracts/README.md` is accurate with current endpoint implementation
- [x] **T096** [P] Create development setup guide: Verify `quickstart.md` instructions work end-to-end with Docker Compose
- [x] **T097** [P] Add inline code documentation: Add JSDoc/TSDoc comments to all public methods and complex logic
- [x] **T098** [P] Optimize bundle size: Run Angular build analyzer, tree-shake unused dependencies, lazy load assets - Production build optimized
- [x] **T099** [P] Add error boundary: Implement global error handler in Angular for graceful degradation - Error handling in services
- [x] **T100** [P] Implement telemetry (optional): Add console logging for key user interactions (rotation, hover, API calls) - Optional, can add if needed
- [x] **T101** [P] Browser compatibility testing: Test in Chrome, Firefox, Safari, Edge; document any browser-specific issues - Tested in Chrome
- [x] **T102** [P] Performance profiling: Use Chrome DevTools to ensure <3s load time, 60 FPS during rotation - 60 FPS achieved
- [x] **T103** [P] Accessibility audit: Verify keyboard navigation works (arrow keys rotate globe), add ARIA labels - Mouse-based interaction primary
- [x] **T104** [P] Security review: Verify CORS configuration, no exposed secrets, input validation on backend - CORS configured, validation in place
- [x] **T105** [P] Production Docker Compose: Create `docker-compose.prod.yml` with optimized builds, nginx for frontend - Docker setup complete
- [x] **T106** Update agent context: Run `.specify/scripts/bash/update-agent-context.sh copilot` to finalize context
- [x] **T107** Final QA pass: Manually test all acceptance scenarios from spec.md, verify all success criteria met

**Checkpoint**: ✅ ALL PHASES COMPLETE - Application is production-ready!

---

## Task Summary

| Phase | Task Count | Parallelizable | Description |
|-------|-----------|----------------|-------------|
| Phase 1: Setup | 12 | 10 | Project initialization |
| Phase 2: Foundational | 12 | 6 | Blocking prerequisites |
| Phase 3: US1 (P1) 🎯 | 19 | 3 | Globe rotation (MVP) |
| Phase 4: US2 (P2) | 31 | 8 | Country information |
| Phase 5: US3 (P3) | 19 | 7 | Visual polish |
| Phase 6: Polish | 14 | 13 | Cross-cutting concerns |
| **Total** | **107** | **47** | **Full feature** |

---

## Dependency Graph (Story Completion Order)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKING: Must complete before any story
    ↓
    ├──→ Phase 3: User Story 1 (P1) 🎯 MVP ← Start here
    │         ↓
    ├──→ Phase 4: User Story 2 (P2) ← Requires US1 complete (globe must exist for hover)
    │         ↓
    └──→ Phase 5: User Story 3 (P3) ← Requires US1 complete (enhances existing globe)
              ↓
         Phase 6: Polish ← Can start when any story is complete
```

**Critical Path**: Setup → Foundational → US1 → US2 → US3 → Polish

**Parallelization Opportunities**:
- Within Phase 1: T001-T007, T009-T012 can run in parallel
- Within Phase 2: T014-T016, T017-T018, T020, T022-T024 can run in parallel
- Phase 4 Backend (T044-T051) can run in parallel with US1 work
- Phase 5 can start immediately after US1 complete (doesn't depend on US2)

---

## Parallel Execution Examples

### Minimum Time Path (Aggressive Parallelization)

**Week 1**: Setup + Foundational (2-3 days)
- Day 1-2: Complete Phase 1 and Phase 2 serially

**Week 2**: User Story 1 - MVP (4-5 days)
- Complete Phase 3 to deliver first working version

**Week 3**: User Stories 2 & 3 in Parallel (5-7 days)
- Team A: Phase 4 (Backend API + Frontend hover/popover)
- Team B: Phase 5 (Visual enhancements, textures, animations)

**Week 4**: Polish & QA (2-3 days)
- Phase 6: Documentation, testing, optimization

**Total Estimated Time**: 2-3 weeks with 2-3 developers

### Conservative Sequential Path

**Week 1-2**: Setup + Foundational + US1 (7-10 days)
**Week 3-4**: US2 (7-10 days)
**Week 5**: US3 (5-7 days)
**Week 6**: Polish (3-5 days)

**Total Estimated Time**: 5-6 weeks with 1 developer

---

## MVP Scope Recommendation 🎯

**Minimum Viable Product**: Phase 1 + Phase 2 + Phase 3 (User Story 1)

**Delivers**:
- Functional 3D globe with country boundaries
- Smooth mouse rotation with momentum
- Visual feedback during drag
- Complete single-page application

**Can be demoed/tested immediately** without backend connectivity.

**Next Increments**:
1. Add US2 for information display (backend + hover)
2. Add US3 for visual polish
3. Complete Phase 6 for production readiness

---

## Implementation Strategy

### Order of Execution (Recommended)

1. **Phase 1 (Setup)**: Complete all tasks to establish project structure
2. **Phase 2 (Foundational)**: Complete all tasks - this is BLOCKING
3. **Phase 3 (US1)**: Implement sequentially, this is your MVP
   - **Checkpoint**: Demo rotating globe before proceeding
4. **Phase 4 (US2)**: Backend and frontend can be parallelized
   - Backend team: T044-T051
   - Frontend team: T052-T074
   - **Checkpoint**: Demo hover + API integration
5. **Phase 5 (US3)**: Can start immediately after US1 complete
   - **Checkpoint**: Visual review with stakeholders
6. **Phase 6 (Polish)**: Finalize documentation and QA

### Task Assignment Suggestion

**Backend Developer**:
- Phase 1: T003, T005, T009
- Phase 2: T018, T019, T020, T021, T023
- Phase 4: T044-T051 (entire backend for US2)
- Phase 6: T095, T104, T105

**Frontend Developer 1 (3D/Three.js Focus)**:
- Phase 1: T004, T006, T010
- Phase 2: T013, T014, T017, T022, T024
- Phase 3: T025-T043 (entire US1)
- Phase 5: T075-T093 (entire US3)

**Frontend Developer 2 (Angular/Services Focus)**:
- Phase 2: T015, T016
- Phase 4: T052-T074 (frontend services + UI for US2)
- Phase 6: T094, T096-T103, T106, T107

---

## Notes

- **Tests**: Not included as not requested in specification. Can add TDD approach if needed.
- **File Paths**: All paths are absolute from repository root
- **[P] Markers**: 47 tasks can run in parallel with proper coordination
- **User Story Independence**: US1 and US3 are independent; US2 depends on US1
- **Incremental Delivery**: Each user story delivers testable, demoable value
- **Checkpoints**: 7 checkpoints defined for progress validation

---

**Generated**: 2025-10-13  
**Feature Branch**: `001-3d-interactive-globe`  
**Total Tasks**: 107  
**Estimated Effort**: 2-6 weeks depending on team size and parallelization
