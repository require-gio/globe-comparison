# Research & Technology Decisions

**Feature**: 3D Interactive Globe  
**Date**: 2025-10-13  
**Phase**: 0 - Research

## Overview

This document consolidates research findings, technology choices, and best practices for implementing the 3D interactive globe application using Angular 20, Three.js, and Node.js.

---

## 1. Angular 20 & Three.js Integration

### Decision
Use Three.js (v0.168) directly within Angular 20 components, with `three-globe` as a helper library for country polygon rendering and interaction detection.

### Rationale
- **Three.js Stability**: Version 0.168 is mature, well-documented, and widely used for WebGL-based 3D rendering
- **three-globe Helper**: Provides out-of-the-box support for:
  - GeoJSON country polygon rendering
  - Hover detection on 3D globe surface
  - Automatic coordinate conversion (lat/long to 3D space)
- **Angular Integration**: Three.js can be integrated cleanly using:
  - Component lifecycle hooks (`ngOnInit`, `ngAfterViewInit`, `ngOnDestroy`)
  - `@ViewChild` for canvas element reference
  - Zone.js considerations for animation loops
- **TypeScript Support**: `@types/three` provides excellent type definitions

### Implementation Pattern
```typescript
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';

@Component({
  selector: 'app-globe',
  template: '<canvas #globeCanvas></canvas>'
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globeCanvas', { static: false }) canvasRef!: ElementRef;
  
  private globe: ThreeGlobe;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  ngAfterViewInit() {
    // Initialize Three.js scene outside Angular zone for performance
    this.zone.runOutsideAngular(() => {
      this.initScene();
      this.animate();
    });
  }
  
  ngOnDestroy() {
    // Clean up WebGL resources
    this.renderer.dispose();
    this.globe.dispose();
  }
}
```

### Alternatives Considered
- **Cesium.js**: More powerful but heavier (2.5MB+ bundle), overkill for this use case
- **Deck.gl**: Excellent for data visualization but less flexible for custom 3D interaction
- **Custom WebGL**: Too time-consuming, Three.js provides needed abstractions

### Best Practices
1. **Zone.js Management**: Run animation loop outside Angular zone to prevent change detection overhead
2. **Memory Management**: Properly dispose of geometries, materials, and textures in `ngOnDestroy`
3. **Asset Loading**: Use Three.js TextureLoader with async/await pattern
4. **Responsive Sizing**: Handle window resize events and update camera aspect ratio
5. **Performance**: Use `requestAnimationFrame` for smooth 60 FPS rendering

---

## 2. Country Data & GeoJSON

### Decision
Use Natural Earth GeoJSON data (110m resolution) for country polygons, stored locally in the frontend, with backend serving metadata (population, capital, region).

### Rationale
- **Natural Earth Data**: Public domain, high-quality geographic data at multiple resolutions
- **110m Resolution**: Balances visual quality with file size (~1.5MB compressed)
- **Separation of Concerns**:
  - Frontend: Polygon geometries (static, rarely changes)
  - Backend: Country metadata (can be updated independently)
- **Performance**: Parsing GeoJSON once at startup is faster than fetching per-country

### Data Sources
- **GeoJSON Polygons**: Natural Earth 110m Cultural Vectors (countries)
  - URL: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
- **Country Metadata**: REST Countries API or custom JSON file
  - Population, capital, region, currency, languages
- **Earth Texture**: NASA Blue Marble (8K resolution for high quality)
  - URL: https://visibleearth.nasa.gov/images/73909/december-blue-marble-next-generation-w-topography-and-bathymetry

### Implementation
```typescript
// Frontend: Load GeoJSON at application startup
import countriesGeoJSON from '@assets/countries-110m.geojson';

this.globe
  .polygonsData(countriesGeoJSON.features)
  .polygonCapColor(() => 'rgba(0, 100, 200, 0.15)')
  .polygonSideColor(() => 'rgba(0, 100, 200, 0.05)')
  .polygonStrokeColor(() => '#111')
  .polygonAltitude(0.01)
  .onPolygonHover(polygon => {
    if (polygon) {
      const countryCode = polygon.properties.ISO_A2;
      this.fetchCountryInfo(countryCode);
    }
  });
```

### Alternatives Considered
- **Fetch GeoJSON from Backend**: Adds network latency, no benefit since data is static
- **TopoJSON**: Smaller file size but requires additional parsing library
- **Vector Tiles**: Overkill for globe visualization, better for 2D maps

### Best Practices
1. **Compression**: Serve GeoJSON with gzip compression (reduces 1.5MB to ~400KB)
2. **Simplification**: Use Natural Earth 110m (simplified) rather than 10m (detailed) for performance
3. **ISO Codes**: Use ISO 3166-1 alpha-2 codes as keys for backend API
4. **Fallback**: Handle countries with disputed/missing ISO codes gracefully

---

## 3. Angular Material & CDK for Popovers

### Decision
Use Angular CDK Overlay for positioning country information popovers, with Material components for styling.

### Rationale
- **Native Integration**: Part of Angular ecosystem, no additional dependencies
- **Overlay Service**: Provides flexible positioning strategies:
  - Connected position (anchor to mouse/element)
  - Global position (fixed viewport coordinates)
  - Scroll strategies (reposition, block, close)
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Lightweight**: CDK Overlay is tree-shakeable, only ~20KB

### Implementation Pattern
```typescript
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

export class GlobeComponent {
  private overlayRef: OverlayRef | null = null;
  
  constructor(private overlay: Overlay) {}
  
  showCountryInfo(event: MouseEvent, countryData: Country) {
    const positionStrategy = this.overlay
      .position()
      .global()
      .left(`${event.clientX + 10}px`)
      .top(`${event.clientY + 10}px`);
    
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
    
    const portal = new ComponentPortal(CountryInfoComponent);
    const componentRef = this.overlayRef.attach(portal);
    componentRef.instance.data = countryData;
  }
  
  hideCountryInfo() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
```

### Alternatives Considered
- **Custom Popover**: More control but reinvents the wheel
- **Tippy.js / Popper.js**: External dependencies, harder to integrate with Angular's change detection
- **Material Tooltip**: Too limited for custom content and styling

### Best Practices
1. **Dispose Properly**: Always dispose overlays to prevent memory leaks
2. **Position Strategy**: Use global positioning for mouse-follow popovers
3. **Animation**: Use Angular animations or CSS transitions for smooth fade-in
4. **Responsive**: Add viewport boundary detection to prevent overflow
5. **Debounce**: Use RxJS `debounceTime(200)` to avoid rapid API calls on hover

---

## 4. State Management with RxJS

### Decision
Use RxJS BehaviorSubjects and Angular services for state management (no NgRx).

### Rationale
- **Simplicity**: This application has minimal state:
  - Current hovered country (temporary UI state)
  - Country info cache (simple key-value)
  - Loading status (boolean)
- **RxJS Sufficiency**: BehaviorSubjects provide:
  - Observable streams for reactive updates
  - Initial value for synchronous access
  - Multicast for multiple subscribers
- **Angular Idiomatic**: Services with BehaviorSubjects are standard Angular pattern
- **Performance**: No Redux-like overhead for simple state

### Implementation Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class CountryStateService {
  private hoveredCountrySubject = new BehaviorSubject<string | null>(null);
  public hoveredCountry$ = this.hoveredCountrySubject.asObservable();
  
  private countryCache = new Map<string, Country>();
  
  setHoveredCountry(code: string | null) {
    this.hoveredCountrySubject.next(code);
  }
  
  getCachedCountry(code: string): Country | undefined {
    return this.countryCache.get(code);
  }
  
  setCachedCountry(code: string, data: Country) {
    this.countryCache.set(code, data);
  }
}
```

### Alternatives Considered
- **NgRx**: Overkill for this scale, adds 50KB+ bundle size and boilerplate
- **Akita**: Simpler than NgRx but still unnecessary
- **Signals (Angular 17+)**: Could be used, but BehaviorSubjects are well-established

### Best Practices
1. **Immutability**: Use readonly observables to prevent external mutation
2. **Unsubscribe**: Use `takeUntil` or AsyncPipe to prevent memory leaks
3. **Caching**: Implement simple Map-based cache for API responses
4. **Error Handling**: Use `catchError` operator for graceful degradation
5. **Debouncing**: Apply `debounceTime` for hover events

---

## 5. Node.js 22 + Express 5 Backend

### Decision
Use Node.js 22 LTS with Express 5 for REST API, TypeScript for type safety, and static JSON file for country data.

### Rationale
- **Node.js 22**: Latest LTS version (as of October 2025), stable and performant
- **Express 5**: Lightweight, battle-tested, sufficient for simple REST endpoints
- **TypeScript**: Type safety, better DX, aligns with frontend
- **Static JSON**: Simpler than database for read-only reference data
- **File-Based Data**: Easy to version control and deploy

### Implementation Pattern
```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import countryRouter from './routes/country';

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/country', countryRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// src/routes/country.ts
import { Router } from 'express';
import countries from '../data/countries.json';

const router = Router();

router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries[code];
  
  if (!country) {
    return res.status(404).json({ message: 'Information unavailable' });
  }
  
  res.json(country);
});

export default router;
```

### Alternatives Considered
- **Fastify**: Faster but less ecosystem support than Express
- **NestJS**: Full framework, overkill for single endpoint API
- **Database (PostgreSQL)**: Overengineered for static reference data
- **REST Countries API**: External dependency, potential reliability issues

### Best Practices
1. **CORS Configuration**: Restrict to frontend origin in production
2. **Error Handling**: Global error middleware for consistent responses
3. **Logging**: Use morgan for request logging, Winston for application logs
4. **Validation**: Use Zod or Joi for request validation (optional for this simple case)
5. **Health Check**: Add `/health` endpoint for container orchestration
6. **Environment Variables**: Use dotenv for configuration

---

## 6. Docker & Local Development

### Decision
Use Docker Compose for local development with separate frontend and backend containers, multi-stage builds for optimization.

### Rationale
- **Consistency**: Same environment across all developer machines
- **Isolation**: Each service runs independently with its own dependencies
- **Multi-Stage Builds**: Reduces final image size (Angular: build in Node, serve with Nginx)
- **Docker Compose**: Simple orchestration for local development
- **Hot Reload**: Mount volumes for development, use production builds for staging/prod

### Implementation
```yaml
# docker-compose.yml
version: '3.9'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend/src:/app/src
    environment:
      - NODE_ENV=development
    command: npm run dev
  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "4200:4200"
    volumes:
      - ./frontend/src:/app/src
    depends_on:
      - backend
    environment:
      - API_URL=http://localhost:3000
    command: npm start
```

### Development vs Production
- **Development**: Volume mounts, hot reload, source maps
- **Production**: Multi-stage builds, minified bundles, Nginx for frontend

### Alternatives Considered
- **Kubernetes**: Overkill for local development
- **Docker Swarm**: Unnecessary for single-machine setup
- **Native Installation**: Loses environment consistency

### Best Practices
1. **Layer Caching**: Copy package.json before source code to cache dependencies
2. **Alpine Images**: Use node:22-alpine for smaller image size
3. **Health Checks**: Add HEALTHCHECK in Dockerfile for container monitoring
4. **.dockerignore**: Exclude node_modules, .git, dist from build context
5. **Named Volumes**: Use volumes for persistent data if needed

---

## 7. Performance Optimization

### Decision
Implement progressive loading, LOD (Level of Detail), and efficient render loop for 60 FPS target.

### Rationale
- **Target**: Smooth 60 FPS during rotation and interaction
- **Bottlenecks**: Texture loading, polygon rendering, DOM updates
- **Optimization Strategies**:
  - Lazy load high-res textures
  - Use instanced rendering for repeated geometries
  - Run render loop outside Angular zone
  - Debounce API calls and state updates

### Implementation Strategies

#### 1. Texture Optimization
```typescript
const textureLoader = new THREE.TextureLoader();

// Low-res placeholder
const placeholderTexture = textureLoader.load('earth-1k.jpg', () => {
  // Once loaded, swap to high-res
  textureLoader.load('earth-8k.jpg', (highResTexture) => {
    globe.material.map = highResTexture;
    globe.material.needsUpdate = true;
  });
});
```

#### 2. Render Loop Optimization
```typescript
ngAfterViewInit() {
  this.zone.runOutsideAngular(() => {
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Only render if something changed
      if (this.needsRender) {
        this.renderer.render(this.scene, this.camera);
        this.needsRender = false;
      }
    };
    animate();
  });
}
```

#### 3. API Call Debouncing
```typescript
private hoverSubject = new Subject<string>();

ngOnInit() {
  this.hoverSubject.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    switchMap(code => this.apiService.getCountry(code))
  ).subscribe(country => {
    this.zone.run(() => this.showPopover(country));
  });
}
```

### Performance Metrics
- **Initial Load**: < 3 seconds (including 1.5MB GeoJSON)
- **Frame Rate**: 60 FPS during rotation
- **API Response**: < 100ms (local backend)
- **Memory**: < 200MB for scene + textures

### Best Practices
1. **Measure First**: Use Chrome DevTools Performance tab
2. **Progressive Enhancement**: Start with basic rendering, add effects incrementally
3. **Lazy Loading**: Load high-res assets after initial render
4. **Frustum Culling**: Three.js handles this automatically
5. **Object Pooling**: Reuse geometries and materials

---

## 8. Accessibility & UX

### Decision
Implement keyboard navigation, ARIA attributes, and graceful error handling for inclusive user experience.

### Rationale
- **Accessibility**: Globe should be navigable without mouse
- **Error Handling**: Backend failures should not break frontend
- **Loading States**: Clear feedback during data fetching
- **Responsive**: Adapt to different screen sizes

### Implementation Guidelines

#### Keyboard Navigation
```typescript
@HostListener('window:keydown', ['$event'])
handleKeyboard(event: KeyboardEvent) {
  switch(event.key) {
    case 'ArrowLeft':
      this.rotateGlobe(-0.05, 0);
      break;
    case 'ArrowRight':
      this.rotateGlobe(0.05, 0);
      break;
    case 'ArrowUp':
      this.rotateGlobe(0, 0.05);
      break;
    case 'ArrowDown':
      this.rotateGlobe(0, -0.05);
      break;
  }
}
```

#### Error Handling
```typescript
getCountryInfo(code: string): Observable<Country> {
  return this.http.get<Country>(`${API_URL}/api/country/${code}`).pipe(
    retry(2),
    timeout(5000),
    catchError(error => {
      console.error('Failed to fetch country info:', error);
      return of({ message: 'Information unavailable' } as Country);
    })
  );
}
```

### Best Practices
1. **ARIA Labels**: Add descriptive labels for screen readers
2. **Focus Management**: Maintain logical focus order
3. **Color Contrast**: Ensure text is readable against background
4. **Responsive Design**: Test on mobile, tablet, desktop
5. **Loading Indicators**: Show spinner during API calls

---

## 9. Testing Strategy

### Decision
Implement unit tests for services, component tests for Angular components, and integration tests for API endpoints.

### Rationale
- **Unit Tests**: Fast, isolate business logic
- **Component Tests**: Verify Angular component behavior
- **Integration Tests**: Ensure frontend-backend communication works
- **E2E Tests**: Optional for this scope, could use Playwright

### Test Structure

#### Frontend Tests
```typescript
// api.service.spec.ts
describe('ApiService', () => {
  it('should fetch country data', async () => {
    const service = TestBed.inject(ApiService);
    const httpMock = TestBed.inject(HttpTestingController);
    
    service.getCountry('US').subscribe(country => {
      expect(country.name).toBe('United States');
    });
    
    const req = httpMock.expectOne(`${API_URL}/api/country/US`);
    req.flush({ name: 'United States', ... });
  });
});
```

#### Backend Tests
```typescript
// country.route.spec.ts
describe('GET /api/country/:code', () => {
  it('should return country data', async () => {
    const response = await request(app).get('/api/country/US');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('United States');
  });
  
  it('should return 404 for invalid code', async () => {
    const response = await request(app).get('/api/country/INVALID');
    expect(response.status).toBe(404);
  });
});
```

### Best Practices
1. **Test Coverage**: Aim for 80%+ on services and routes
2. **Mock External Deps**: Use HttpTestingController for HTTP calls
3. **Snapshot Tests**: For UI components (optional)
4. **CI Integration**: Run tests on every commit
5. **Test Data**: Use fixtures for consistent test data

---

## 10. Deployment & DevOps

### Decision
Use production-ready Docker images with Nginx for frontend and optimized Node.js for backend.

### Rationale
- **Nginx**: Efficient static file serving, reverse proxy capabilities
- **Multi-Stage Builds**: Separate build and runtime environments
- **Environment Variables**: Configure API URLs, ports via env vars
- **Health Checks**: Container orchestration compatibility

### Production Dockerfiles

#### Frontend
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK CMD wget -q --spider http://localhost/ || exit 1
```

#### Backend
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
HEALTHCHECK CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

### Best Practices
1. **Security**: Run as non-root user in containers
2. **Logging**: Aggregate logs to stdout for container orchestration
3. **Secrets**: Use environment variables, never commit credentials
4. **Monitoring**: Add health check endpoints
5. **Versioning**: Tag Docker images with Git commit SHA

---

## Summary

All technology choices have been finalized with no remaining NEEDS CLARIFICATION items:

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Frontend Framework | Angular | 20 | Hard requirement, modern SPA |
| 3D Rendering | Three.js | 0.168 | Battle-tested WebGL library |
| Globe Helper | three-globe | latest | Simplifies country polygons |
| UI Components | Angular Material + CDK | 17+ | Native overlay support |
| State Management | RxJS BehaviorSubjects | built-in | Lightweight, sufficient |
| CSS Framework | Tailwind CSS | latest | Rapid styling |
| Backend Runtime | Node.js | 22 LTS | Hard requirement, modern |
| Backend Framework | Express | 5 | Simple REST API |
| Language | TypeScript | 5.x | Type safety across stack |
| Containerization | Docker + Compose | latest | Development parity |
| Web Server | Nginx | alpine | Production static serving |

## Next Steps

Proceed to Phase 1:
1. Generate `data-model.md` with Country entity definition
2. Generate API contracts in `/contracts/` directory
3. Generate `quickstart.md` for local development setup
4. Update agent context with technology stack
