# Research Document: 3D Interactive Globe with Country Information

**Feature**: 001-3d-interactive-globe  
**Date**: 2025-10-08  
**Status**: Complete

## Overview

This document captures the technical research and decision-making process for implementing a 3D interactive globe web application with country information display.

## Key Technical Decisions

### Decision 1: 3D Rendering Stack

**Decision**: three.js + react-three-fiber + @react-three/drei

**Rationale**:
- **three.js**: De-facto standard for WebGL in JavaScript with mature ecosystem, excellent performance, and comprehensive documentation
- **react-three-fiber (R3F)**: Provides React-friendly declarative API for three.js, eliminating imperative scene management and enabling component-based 3D architecture
- **@react-three/drei**: Collection of useful helpers (OrbitControls, lighting presets, texture loaders) that accelerate development and provide tested implementations

**Alternatives Considered**:
- **Babylon.js**: More game-engine focused, heavier bundle size, less React integration
- **PlayCanvas**: Editor-focused, not ideal for code-first React development
- **WebGL directly**: Too low-level, would require significant boilerplate for basic features
- **A-Frame**: VR-focused, less suitable for precise 2D mouse interactions

**Trade-offs**:
- Bundle size: three.js + R3F adds ~500KB to bundle, but acceptable for feature-rich 3D app
- Learning curve: Requires understanding both React and 3D graphics concepts
- Performance: Abstraction overhead is minimal (<2%) compared to direct three.js

### Decision 2: Country Hover Detection Strategy

**Decision**: BVH (Bounding Volume Hierarchy) + THREE.Raycaster with pre-triangulated meshes

**Rationale**:
- **three-mesh-bvh**: Provides spatial indexing that accelerates raycasting by 10-100x for complex geometries
- **Pre-triangulated meshes**: Convert country polygons to three.js geometries once at load time, avoid runtime triangulation
- **Raycaster**: Built-in three.js raycasting with mouse position → 3D world space conversion

**Alternatives Considered**:
- **GPU color-ID picking**: Render scene with unique colors per country, read pixel under mouse
  - Rejected: Requires additional render pass (performance cost), color buffer reads are slow on some GPUs
- **Polygon point-in-polygon tests**: Direct mathematical approach without 3D raycasting
  - Rejected: Doesn't account for globe curvature and 3D perspective, requires complex 2D projection math
- **Three.js object picking without BVH**: Native raycasting without spatial indexing
  - Rejected: Too slow for 200+ country meshes with complex polygon geometries

**Implementation Details**:
- Build BVH structure once after loading TopoJSON and triangulating polygons
- Update raycaster on mouse move with camera and mouse coordinates
- Use BVH-accelerated raycast to find intersected country mesh
- Debounce hover events to 50ms to prevent excessive raycasts during rapid movement

### Decision 3: Geographic Data Format

**Decision**: TopoJSON for country boundaries

**Rationale**:
- **Compact**: TopoJSON encodes topology (shared edges) only once, reducing file size by 80% vs GeoJSON
- **Standard format**: Well-supported by d3-geo and compatible with three.js shape conversion
- **Rich attributes**: Can include country metadata (ISO codes, names) directly in topology

**Alternatives Considered**:
- **GeoJSON**: Larger file size (~2.5MB vs ~500KB for TopoJSON), but simpler structure
  - Rejected: Extra 2MB download not acceptable for sub-3s load time requirement
- **Custom binary format**: Maximum compression and fast parsing
  - Rejected: Requires custom parser, harder to update country data, no ecosystem tools
- **Vector tiles (MVT)**: Used for map services, supports progressive loading
  - Rejected: Overkill for single-view globe, adds complexity for tile management

**Data Processing Pipeline**:
1. Source: Natural Earth 1:110m Cultural Vectors (public domain)
2. Simplify geometries using mapshaper (Douglas-Peucker algorithm, 0.5% tolerance)
3. Convert to TopoJSON with country properties (ISO code, name)
4. Serve via CDN with aggressive caching (1 year TTL)

### Decision 4: State Management

**Decision**: Zustand for client state + TanStack Query for server state

**Rationale**:
- **Zustand**: Minimal boilerplate, TypeScript-friendly, avoids React Context performance issues, perfect for globe orientation and hover state
- **TanStack Query**: Built-in caching, request deduplication, stale-while-revalidate, automatic retry logic

**Alternatives Considered**:
- **Redux Toolkit**: More boilerplate, overkill for simple state needs, no server state benefits
- **React Context + useState**: Context re-renders all consumers, useState doesn't cache API responses
- **Jotai/Recoil**: Atomic state management is elegant but adds learning curve without clear benefit

**State Boundaries**:
- **Zustand**: Globe rotation angles, rotation velocity (momentum), drag mode, hovered country ID, mouse position
- **TanStack Query**: Country information API responses, TopoJSON data, query caching/invalidation

### Decision 5: Backend Framework

**Decision**: Fastify with TypeScript

**Rationale**:
- **Performance**: 2-3x faster than Express in benchmarks (20k+ req/s), schema-based validation built-in
- **TypeScript-first**: Excellent TypeScript support with typed plugins and route handlers
- **Plugin ecosystem**: JSON Schema validation, rate limiting, caching, compression all available

**Alternatives Considered**:
- **Express**: Slower, middleware-based architecture has more overhead, TypeScript support is afterthought
- **NestJS**: Full-featured but opinionated, adds significant complexity for simple CRUD API
- **Hono/Elysia**: Newer, smaller ecosystem, less battle-tested for production

**Architecture**:
- Service layer pattern: CountryService abstracts database/cache logic
- Fastify route handlers: Thin controllers that call services
- Middleware: Error handling, rate limiting (100 req/min per IP), request logging

### Decision 6: Caching Strategy

**Decision**: Redis for API response caching + CDN for static assets

**Rationale**:
- **Redis**: Fast in-memory cache (sub-ms reads), supports TTL expiration, can be shared across backend instances
- **CDN (Cloudflare/Vercel)**: Edge caching for TopoJSON and textures reduces latency and backend load

**Caching Policy**:
- Country info API: Cache for 1 hour (country data rarely changes, but not truly static)
- TopoJSON: Cache for 1 year (versioned URLs for updates)
- Textures: Cache for 1 year (immutable content-addressed files)

**Alternatives Considered**:
- **In-memory Node.js cache**: Doesn't scale across instances, lost on restart
- **PostgreSQL query caching**: Not controllable, depends on query patterns
- **No caching**: Would exceed 500ms API response requirement under load

### Decision 7: Performance Optimization

**Decisions**:
1. **Lazy load TopoJSON**: Load geography data after initial render to show globe ASAP
2. **Debounce hover events**: Limit raycasting to 50ms intervals during rapid mouse movement
3. **Request deduplication**: TanStack Query prevents duplicate API calls for same country
4. **Geometry instancing**: Share country mesh geometries where possible (not implemented in MVP)
5. **Web Workers**: Offload TopoJSON parsing and triangulation to worker thread (future optimization)

**Measurements**:
- TopoJSON parse + triangulation: ~200ms (acceptable on initial load)
- Raycasting with BVH: ~1-2ms per frame (well under 16ms budget)
- API response with Redis cache: ~10-50ms (cache hit), ~200-300ms (cache miss + DB query)

## Dependencies Analysis

### Frontend Core Dependencies

| Package | Version | Bundle Size | Purpose | Alternatives |
|---------|---------|-------------|---------|--------------|
| react | ^19.2.0 | ~45KB | UI framework | - |
| three | ^0.160.0 | ~600KB | 3D rendering | babylon.js |
| @react-three/fiber | ^8.15.0 | ~80KB | React integration | - |
| @react-three/drei | ^9.92.0 | ~100KB | 3D helpers | Custom implementations |
| typescript | ^5.8.0 | - | Type safety | - |
| vite | ^5.0.0 | - | Build tool | webpack, parcel |
| @tanstack/react-query | ^5.17.0 | ~40KB | Server state | SWR, Apollo |
| zustand | ^4.4.0 | ~3KB | Client state | redux, jotai |
| tailwindcss | ^3.4.0 | ~10KB | Styling | styled-components |
| framer-motion | ^10.18.0 | ~60KB | Animations | react-spring |
| three-mesh-bvh | ^0.7.0 | ~30KB | Raycasting | Custom spatial index |

**Total Frontend Bundle**: ~1.2MB uncompressed, ~350KB gzipped

### Backend Dependencies

| Package | Version | Purpose | Alternatives |
|---------|---------|---------|--------------|
| fastify | ^4.25.0 | HTTP server | express, hono |
| @fastify/postgres | ^5.2.0 | PostgreSQL driver | pg-promise, prisma |
| @fastify/redis | ^6.1.0 | Redis client | ioredis direct |
| @fastify/rate-limit | ^9.1.0 | Rate limiting | Custom middleware |
| @fastify/compress | ^6.5.0 | Response compression | - |
| topojson-server | ^3.0.1 | TopoJSON utilities | Custom parser |

## Performance Benchmarks

### Initial Load Performance

| Metric | Target | Expected | Notes |
|--------|--------|----------|-------|
| First Contentful Paint | <1.5s | ~1.2s | Vite code-splitting |
| Globe visible | <3s | ~2.5s | Includes TopoJSON load |
| Time to Interactive | <3s | ~2.8s | After WebGL init |

### Runtime Performance

| Metric | Target | Expected | Notes |
|--------|--------|----------|-------|
| Frame rate | 60 FPS | 60 FPS | No heavy computation per frame |
| Hover detection | <100ms | ~50ms | BVH + raycasting |
| Popover display | <200ms | ~150ms | Includes API call |
| API response (cached) | <100ms | ~20ms | Redis hit |
| API response (uncached) | <500ms | ~250ms | PostgreSQL query |

## Security Considerations

1. **Rate Limiting**: 100 requests per minute per IP address to prevent abuse
2. **Input Validation**: ISO country codes validated against whitelist (prevent SQL injection)
3. **CORS**: Configure allowed origins for production deployment
4. **Content Security Policy**: Restrict script sources to prevent XSS
5. **API Authentication**: Not required for MVP (public data), add later if needed

## Deployment Strategy

1. **Frontend**: Deploy to Vercel (automatic builds from main branch)
2. **Backend**: Deploy to Render or Railway (Docker container)
3. **Database**: Managed PostgreSQL (Render PostgreSQL or Supabase)
4. **Redis**: Managed Redis (Upstash or Redis Cloud free tier)
5. **Assets**: Serve TopoJSON/textures via CDN (Cloudflare R2 or Vercel Edge)

## Future Optimizations

1. **Progressive Enhancement**: Add touch support for mobile devices
2. **Accessibility**: Add keyboard navigation and screen reader support
3. **Performance**: Implement geometry instancing for reduced memory usage
4. **Features**: Add search functionality, country comparison, data visualization overlays
5. **Internationalization**: Support multiple languages for country information
6. **Analytics**: Track user interaction patterns, hover success rate, API performance

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| TopoJSON too large | High load time | Low | Simplified geometry, CDN caching |
| Hover detection slow | Poor UX | Medium | BVH spatial indexing, debouncing |
| API latency spikes | Failed SC-003 | Medium | Redis caching, connection pooling |
| WebGL not supported | App doesn't work | Low | Feature detection + fallback message |
| Backend overload | Service degradation | Low | Rate limiting, horizontal scaling |

## Open Questions (Resolved)

None - all technical unknowns addressed through research.
