# Quickstart Guide: 3D Interactive Globe Development

**Feature**: 3D Interactive Globe with Country Information  
**Last Updated**: 2025-10-12  
**Estimated Setup Time**: 30-45 minutes

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v18.x or higher ([download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **PostgreSQL**: v14.x or higher ([download](https://www.postgresql.org/download/))
- **Redis**: v6.x or higher ([download](https://redis.io/download))
- **Docker** (optional): For containerized development ([download](https://www.docker.com/))
- **Git**: For version control

Check versions:
```bash
node --version   # Should be v18.x or higher
npm --version    # Should be v9.x or higher
psql --version   # Should be v14.x or higher
redis-cli --version  # Should be v6.x or higher
```

## Project Structure Overview

```
world-vue/
├── backend/          # Node.js + Fastify API server
├── frontend/         # Vue 3 + Three.js application
└── specs/           # Feature specifications and contracts
```

## Quick Setup (5 minutes)

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <repository-url> world-vue
cd world-vue

# Checkout feature branch
git checkout 001-3d-interactive-globe

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend** - Create `backend/.env`:
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/world_vue"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Cache
CACHE_TTL=21600  # 6 hours in seconds
```

**Frontend** - Create `frontend/.env`:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Feature Flags
VITE_ENABLE_POSTPROCESSING=true
VITE_ENABLE_DEVICE_DETECTION=true
```

### 3. Database Setup

```bash
cd backend

# Run database migrations
npx prisma migrate dev

# Seed database with country data
npx prisma db seed

# Verify setup
npx prisma studio  # Opens database GUI at http://localhost:5555
```

### 4. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Server running at http://localhost:3000
```

**Terminal 2 - Redis** (if not running as service):
```bash
redis-server
# Redis running at localhost:6379
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:5173
```

### 5. Verify Setup

Open browser to http://localhost:5173 - you should see:
- ✅ 3D globe rendering
- ✅ Smooth rotation on mouse drag
- ✅ Country hover highlighting
- ✅ Popover with country information

API health check:
```bash
curl http://localhost:3000/api/v1/health
# Should return: {"status":"ok","version":"1.0.0",...}
```

---

## Detailed Development Setup

### Backend Setup (15 minutes)

#### Install Dependencies

```bash
cd backend
npm install

# Key packages installed:
# - fastify: Web framework
# - prisma: Database ORM
# - ioredis: Redis client
# - zod: Schema validation
# - pino: Logging
```

#### Database Configuration

1. **Create PostgreSQL database**:
```bash
createdb world_vue
# Or via psql:
psql -U postgres
CREATE DATABASE world_vue;
\q
```

2. **Update connection string** in `backend/.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/world_vue"
```

3. **Run migrations**:
```bash
npx prisma migrate dev --name init
# Creates tables: countries, request_logs
```

4. **Seed data**:
```bash
npx prisma db seed
# Imports ~195 countries with metadata
```

#### Redis Configuration

**Option 1: Local Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Verify
redis-cli ping
# Should return: PONG
```

**Option 2: Docker Redis**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

#### Start Backend Server

```bash
npm run dev
# Runs with hot reload on http://localhost:3000

# Or production mode:
npm run build
npm start
```

**Verify backend**:
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Test country endpoint
curl http://localhost:3000/api/v1/countries/FRA
```

### Frontend Setup (15 minutes)

#### Install Dependencies

```bash
cd frontend
npm install

# Key packages installed:
# - vue: Framework
# - three: 3D rendering
# - three-globe: Globe library
# - @tanstack/vue-query: Data fetching
# - pinia: State management
# - floating-ui: Popovers
# - tailwindcss: Styling
```

#### Build Configuration

The project uses Vite with optimized configuration. No changes needed for basic setup.

**Frontend .env variables**:
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENABLE_POSTPROCESSING=true  # Enable bloom effects
VITE_ENABLE_DEVICE_DETECTION=true  # Auto-adjust quality
```

#### Download Globe Assets

```bash
cd frontend/src/assets

# Download country boundaries (TopoJSON)
curl -o data/countries.topo.json \
  https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json

# Download earth texture (optional, use color fallback if unavailable)
# Place any HDR environment map in textures/ directory
```

#### Start Frontend Development Server

```bash
npm run dev
# Vite dev server at http://localhost:5173
```

**Build for production**:
```bash
npm run build
# Outputs to frontend/dist/

# Preview production build
npm run preview
```

---

## Development Workflow

### Making Changes

1. **Start all services**:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Redis (if not running as service)
redis-server
```

2. **Edit code** - Changes hot-reload automatically

3. **Run tests**:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e
```

### Common Tasks

#### Add New Country Field

1. Update Prisma schema (`backend/prisma/schema.prisma`)
2. Create migration: `npx prisma migrate dev --name add_field`
3. Update TypeScript types in `backend/src/types/`
4. Update API response in `backend/src/api/routes/countries.ts`
5. Update frontend types in `frontend/src/types/api.ts`
6. Update popover component to display new field

#### Debug Backend Issues

```bash
# View logs
npm run dev  # Logs to console with pino pretty-print

# Check database
npx prisma studio

# Test Redis
redis-cli
> KEYS country:*
> GET country:FRA

# Check API directly
curl -v http://localhost:3000/api/v1/countries/USA
```

#### Debug Frontend Issues

```bash
# Enable Three.js stats
# Add to frontend/src/main.ts:
import Stats from 'three/examples/jsm/libs/stats.module.js'
const stats = new Stats()
document.body.appendChild(stats.dom)

# Check API calls in browser DevTools Network tab
# Check Vue DevTools for component state
# Check console for Three.js warnings
```

#### Reset Database

```bash
cd backend
npx prisma migrate reset  # Drops DB, runs migrations, seeds data
```

---

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Unit tests (Vitest)
npm run test

# E2E tests (Cypress)
npm run test:e2e

# E2E headless
npm run test:e2e:headless

# Component tests
npm run test:unit
```

### Manual Testing Checklist

- [ ] Globe renders on page load
- [ ] Click and drag rotates globe smoothly
- [ ] Release maintains momentum with decay
- [ ] Hover over country highlights within 100ms
- [ ] Popover appears after 200ms hover
- [ ] Popover displays country name, capital, population, region
- [ ] Hover different country updates popover
- [ ] Move mouse away removes highlight and popover
- [ ] Backend unavailable shows "Information unavailable"
- [ ] Small countries (Monaco, Vatican) are clickable
- [ ] Performance maintains 60 FPS during rotation
- [ ] Page loads in <3 seconds

---

## Troubleshooting

### Database Connection Fails

**Error**: `Can't reach database server`

**Solutions**:
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
systemctl status postgresql  # Linux

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Redis Connection Fails

**Error**: `Redis connection refused`

**Solutions**:
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
docker start redis  # Docker

# Check port
lsof -i :6379
```

### Frontend Can't Connect to Backend

**Error**: `Network Error` or CORS error

**Solutions**:
```bash
# Verify backend is running
curl http://localhost:3000/api/v1/health

# Check CORS_ORIGIN in backend/.env matches frontend URL
CORS_ORIGIN=http://localhost:5173

# Check VITE_API_BASE_URL in frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Three.js Rendering Issues

**Error**: Black screen or WebGL errors

**Solutions**:
- Check browser supports WebGL: https://get.webgl.org/
- Update graphics drivers
- Try different browser (Chrome recommended for development)
- Check console for Three.js errors
- Disable post-processing: Set `VITE_ENABLE_POSTPROCESSING=false`

### Slow Performance

**Symptoms**: FPS drops below 60, laggy interactions

**Solutions**:
```bash
# Enable device detection
VITE_ENABLE_DEVICE_DETECTION=true

# Reduce post-processing
VITE_ENABLE_POSTPROCESSING=false

# Check for console warnings
# Simplify country meshes in globe/geometry.ts
# Disable bloom effects temporarily
```

---

## Docker Development (Alternative Setup)

For isolated environment setup:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

**docker-compose.yml** (create in project root):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: world_vue
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/world_vue
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:3000/api/v1
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

---

## Next Steps

1. **Review architecture**: Read `specs/001-3d-interactive-globe/plan.md`
2. **Understand data flow**: Review `specs/001-3d-interactive-globe/data-model.md`
3. **API contracts**: Study `specs/001-3d-interactive-globe/contracts/api.md`
4. **Start implementing**: Follow tasks in `specs/001-3d-interactive-globe/tasks.md`

## Resources

- **Vue 3 Documentation**: https://vuejs.org/guide/
- **Three.js Documentation**: https://threejs.org/docs/
- **three-globe Library**: https://github.com/vasturiano/three-globe
- **Fastify Documentation**: https://www.fastify.io/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **TanStack Query**: https://tanstack.com/query/latest

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review spec documents in `specs/001-3d-interactive-globe/`
3. Check console logs for error details
4. Verify all prerequisites are correctly installed

Happy coding! 🌍✨