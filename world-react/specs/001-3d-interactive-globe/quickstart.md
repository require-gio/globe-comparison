# Quickstart Guide: 3D Interactive Globe

**Feature**: 001-3d-interactive-globe  
**Date**: 2025-10-08  
**Purpose**: Step-by-step guide to test each user story independently

## Overview

This guide provides instructions for testing the three prioritized user stories independently, enabling incremental development and validation of the 3D interactive globe feature.

## Prerequisites

- Node.js 20.x installed
- PostgreSQL 15+ running locally or accessible remotely
- Redis 7.x running locally or accessible remotely
- Modern browser with WebGL support (Chrome, Firefox, Safari, Edge)

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend** (`backend/.env`):
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/globe_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Database Setup

```bash
cd backend
npm run db:migrate    # Run migrations
npm run db:seed       # Seed country data
```

### 4. Start Services

```bash
# Terminal 1: Start backend
cd backend
npm run dev           # Starts on http://localhost:3000

# Terminal 2: Start frontend
cd frontend
npm run dev           # Starts on http://localhost:5173
```

---

## User Story 1: Globe Rotation and Navigation (P1)

**Goal**: Test that users can freely rotate the 3D globe with mouse interactions.

### What This Story Delivers

- 3D globe rendered at page center
- Mouse click-and-drag to rotate
- Momentum-based rotation after release
- Visual feedback (cursor change) during drag
- Visible country boundaries on globe

### Independent Test Steps

1. **Open the application**:
   ```
   Navigate to: http://localhost:5173
   ```

2. **Verify initial globe display**:
   - [ ] Page loads within 3 seconds
   - [ ] 3D globe appears centered in viewport
   - [ ] Globe shows realistic Earth textures
   - [ ] Country boundaries are visible
   - [ ] No console errors in browser DevTools

3. **Test mouse drag rotation**:
   - [ ] Click and hold left mouse button on globe
   - [ ] Cursor changes to indicate drag mode (e.g., grabbing hand)
   - [ ] Move mouse left/right → globe rotates horizontally
   - [ ] Move mouse up/down → globe rotates vertically
   - [ ] Globe rotation follows mouse movement smoothly
   - [ ] Frame rate stays at ~60 FPS (check DevTools Performance)

4. **Test momentum rotation**:
   - [ ] Drag globe with quick mouse movement
   - [ ] Release mouse button while moving
   - [ ] Globe continues rotating briefly
   - [ ] Rotation gradually decelerates
   - [ ] Globe stops within 1-2 seconds

5. **Test edge cases**:
   - [ ] Drag beyond browser window edge → rotation continues
   - [ ] Quick rapid drags → no lag or stuttering
   - [ ] Rotate to view poles → no visual artifacts
   - [ ] Rotate 360° → all continents visible

### Success Criteria

- ✅ **SC-001**: Globe loads and is interactive within 5 seconds
- ✅ **SC-004**: Maintains 60 FPS during rotation on tested system
- ✅ **SC-007**: Single page, no navigation/reloads

### Debugging Tips

- **Globe doesn't render**: Check WebGL support in browser (chrome://gpu)
- **Slow rotation**: Check FPS in DevTools Performance tab, look for memory leaks
- **No momentum**: Verify useGlobeStore velocity is being updated in Redux DevTools

---

## User Story 2: Country Hover and Information Display (P2)

**Goal**: Test that hovering over countries displays information popovers.

### What This Story Delivers

- Country highlighting on hover
- Popover with country information (name, population, capital, region)
- Backend API integration for country data
- Graceful error handling for API failures

### Prerequisites

- **User Story 1 must be complete** (globe rotation working)
- Backend API must be running and accessible
- PostgreSQL must be seeded with country data

### Independent Test Steps

1. **Verify backend API is responsive**:
   ```bash
   curl http://localhost:3000/api/countries/USA
   # Expected: JSON with country info
   ```

2. **Test country hover detection**:
   - [ ] Open application (http://localhost:5173)
   - [ ] Move mouse over a large country (e.g., USA, Russia, Canada)
   - [ ] Country surface highlights within 100ms
   - [ ] Highlight uses distinct color (e.g., glowing effect)
   - [ ] Move mouse away → highlight fades immediately

3. **Test popover display**:
   - [ ] Hover over a country for >200ms
   - [ ] Popover appears near cursor
   - [ ] Popover shows:
     - Country name (e.g., "United States of America")
     - Population (e.g., "331,000,000")
     - Capital (e.g., "Washington, D.C.")
     - Region (e.g., "Americas")
   - [ ] Popover has semi-transparent background
   - [ ] Popover uses smooth fade-in animation

4. **Test multiple country hovers**:
   - [ ] Hover over USA → popover displays
   - [ ] Move to France → USA popover disappears, France highlights
   - [ ] Wait 200ms → France popover displays
   - [ ] Repeat for 3+ countries (e.g., Japan, Brazil, Germany)
   - [ ] Each country shows unique information
   - [ ] No duplicate API requests (check Network tab)

5. **Test API error handling**:
   - [ ] Stop backend server
   - [ ] Hover over a country
   - [ ] Country still highlights
   - [ ] Popover shows "Information unavailable" message
   - [ ] No JavaScript errors in console
   - [ ] Restart backend → normal behavior resumes

6. **Test rapid mouse movement**:
   - [ ] Quickly move mouse across multiple countries
   - [ ] Hover events are debounced (max 1 per 50ms)
   - [ ] No API request flood (check Network tab)
   - [ ] Popover only shows for country where mouse stops

7. **Test small countries**:
   - [ ] Hover over small countries (e.g., Singapore, Malta, Vatican City)
   - [ ] Hover detection still works (may require precise mouse position)
   - [ ] Popover displays correctly without overlapping globe

### Success Criteria

- ✅ **SC-002**: Hover detection accuracy ≥95% for large countries
- ✅ **SC-003**: Popover displays within 500ms (95% of requests)
- ✅ **SC-005**: Users retrieve info for at least 3 countries per session
- ✅ **SC-008**: Country info display success rate ≥98% when backend available

### API Contract Validation

Test API responses match OpenAPI spec:

```bash
# Valid country request
curl http://localhost:3000/api/countries/USA
# Expected: 200 OK, JSON with all required fields

# Invalid ISO code
curl http://localhost:3000/api/countries/INVALID
# Expected: 400 Bad Request, error message

# Non-existent country
curl http://localhost:3000/api/countries/XXX
# Expected: 404 Not Found, error message
```

### Debugging Tips

- **No hover detection**: Check BVH build in console, verify raycaster setup
- **Popover doesn't appear**: Check 200ms delay timer, verify TanStack Query hooks
- **Wrong country data**: Verify PostgreSQL seed data, check API logs
- **Slow API responses**: Check Redis cache status, database connection pool

---

## User Story 3: Visual Design and Polish (P3)

**Goal**: Test that the application has a sleek, modern, standout visual design.

### What This Story Delivers

- Realistic Earth textures with continents and oceans
- Dynamic lighting effects for depth
- Smooth 60 FPS animations
- Dark/space-themed background
- Semi-transparent popover design with fade-in animation
- Minimal UI chrome

### Prerequisites

- **User Stories 1 & 2 must be complete** (rotation and hover working)
- Earth texture assets must be loaded
- Lighting setup must be configured

### Independent Test Steps

1. **Verify visual quality**:
   - [ ] Globe displays high-quality Earth texture
   - [ ] Continents and oceans are clearly distinguishable
   - [ ] Country boundaries are visible without texture inspection
   - [ ] No pixelation or low-resolution artifacts

2. **Test lighting effects**:
   - [ ] Globe has realistic lighting (appears 3D, not flat)
   - [ ] Light source creates visible highlights and shadows
   - [ ] Rotate globe → lighting perspective shifts correctly
   - [ ] Globe doesn't appear washed out or too dark

3. **Test background design**:
   - [ ] Background is dark (black, dark blue, or space gradient)
   - [ ] Background contrasts well with globe
   - [ ] No distracting patterns or textures in background
   - [ ] UI elements (if any) are minimal and non-intrusive

4. **Test popover visual design**:
   - [ ] Popover has semi-transparent background (can see through slightly)
   - [ ] Popover text is clearly readable against background
   - [ ] Popover appears with smooth fade-in animation (~200-300ms)
   - [ ] Popover disappears with smooth fade-out animation
   - [ ] Popover corners are rounded (modern look)
   - [ ] Popover has subtle drop shadow or border

5. **Test animation smoothness**:
   - [ ] Globe rotation is buttery smooth (60 FPS)
   - [ ] Country highlight transitions are smooth (no abrupt changes)
   - [ ] Popover fade animations are smooth (no stuttering)
   - [ ] Open DevTools Performance → no frame drops during interaction
   - [ ] CPU usage stays reasonable (<50% on modern desktop)

6. **Test overall aesthetic**:
   - [ ] UI feels "sleek" and modern
   - [ ] Design "stands out" compared to typical web apps
   - [ ] Color scheme is cohesive (no jarring color combinations)
   - [ ] Typography is clean and readable
   - [ ] No cluttered or busy visual elements

### Success Criteria

- ✅ **SC-004**: Maintains 60 FPS during rotation (90% of systems)
- ✅ **SC-006**: 80% of user testers describe design as "sleek/modern/impressive"

### User Testing Validation

Conduct informal user testing:

1. Show application to 5+ people
2. Ask: "On a scale of 1-5, how sleek/modern does this design feel?"
3. Target: Average score ≥4.0 (equivalent to 80% positive feedback)

Qualitative feedback to gather:
- "What stands out positively about the design?"
- "What could be improved visually?"
- "Does this feel like a professional/polished application?"

### Debugging Tips

- **Low frame rate**: Profile with React DevTools, check for unnecessary re-renders
- **Flat-looking globe**: Verify lighting setup (ambient + directional lights)
- **Washed out textures**: Check texture loading, verify correct color space
- **Jerky animations**: Check for blocking operations in render loop

---

## Integration Testing (All Stories Together)

### End-to-End User Journey

1. User opens application
2. Globe loads and renders within 3 seconds
3. User rotates globe to view Europe
4. User hovers over France → highlights and shows "France, 67M, Paris, Europe"
5. User rotates to Asia
6. User hovers over Japan → highlights and shows "Japan, 126M, Tokyo, Asia"
7. User hovers over China → highlights and shows "China, 1.4B, Beijing, Asia"
8. User rotates back to Americas
9. User hovers over Brazil → highlights and shows "Brazil, 212M, Brasília, Americas"

**Success**: All interactions work smoothly, no errors, performance stays at 60 FPS

### Performance Benchmarks

Use Chrome DevTools Performance tab to measure:

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Initial page load | <3s | Lighthouse performance audit |
| Globe first render | <2.5s | Mark in console.time() |
| Hover → highlight | <100ms | Performance.now() timestamps |
| Hover → popover | <200ms | Performance.now() timestamps |
| API response (cached) | <100ms | Network tab timing |
| API response (uncached) | <500ms | Network tab timing |
| Frame rate | 60 FPS | Performance monitor overlay |

### Automated E2E Tests (Playwright)

```typescript
// Example test structure (to be implemented)
test('User Story 1: Globe rotation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });
  
  // Simulate drag
  const canvas = page.locator('canvas');
  await canvas.hover();
  await page.mouse.down();
  await page.mouse.move(100, 100);
  await page.mouse.up();
  
  // Verify no errors
  const errors = await page.evaluate(() => window.errors || []);
  expect(errors).toHaveLength(0);
});

test('User Story 2: Country hover', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Hover over known coordinate (USA)
  await page.mouse.move(300, 200);
  await page.waitForTimeout(300);
  
  // Verify popover appears
  await expect(page.locator('[data-testid="country-popover"]')).toBeVisible();
  await expect(page.locator('text=/United States/i')).toBeVisible();
});
```

---

## Troubleshooting Common Issues

### Globe Doesn't Render

- **Check**: WebGL support → chrome://gpu
- **Check**: Console errors related to three.js
- **Check**: Canvas element is present in DOM
- **Fix**: Ensure WebGL context is properly initialized

### Hover Detection Not Working

- **Check**: BVH is built (console log after TopoJSON load)
- **Check**: Raycaster is configured with camera and mouse coords
- **Check**: Country meshes have proper geometry
- **Fix**: Verify triangulation of TopoJSON polygons

### API Calls Failing

- **Check**: Backend server is running (http://localhost:3000/health)
- **Check**: CORS configuration allows frontend origin
- **Check**: Database connection is successful
- **Check**: Redis is accessible
- **Fix**: Verify environment variables, check logs

### Performance Issues

- **Check**: FPS counter in DevTools Performance
- **Check**: Memory usage (look for leaks)
- **Check**: Number of draw calls (three.js stats)
- **Fix**: Profile and optimize hot paths, reduce re-renders

---

## Next Steps After Validation

Once all three user stories are independently validated:

1. Run full integration E2E tests (Playwright)
2. Conduct user testing for visual design feedback (Story 3)
3. Perform load testing on backend API
4. Run Lighthouse audit for performance metrics
5. Deploy to staging environment
6. Proceed to `/speckit.tasks` for task breakdown
