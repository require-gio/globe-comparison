# Quickstart Guide: 3D Interactive Globe

**Feature**: 3D Interactive Globe  
**Date**: 2025-10-13  
**Estimated Setup Time**: 15-20 minutes

## Overview

This guide will help you set up and run the 3D interactive globe application on your local machine using Docker Compose. The application consists of two containers:

1. **Frontend**: Angular 20 SPA with Three.js globe
2. **Backend**: Node.js + Express REST API

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose | Download Link |
|----------|----------------|---------|---------------|
| Docker | 20.10+ | Container runtime | https://docs.docker.com/get-docker/ |
| Docker Compose | 2.0+ | Multi-container orchestration | Included with Docker Desktop |
| Git | 2.30+ | Version control | https://git-scm.com/downloads |
| Node.js | 22+ LTS | Local development (optional) | https://nodejs.org/ |

### Verify Installation

```bash
# Check Docker
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose
docker-compose --version
# Expected: Docker Compose version 2.0.0 or higher

# Check Git
git --version
# Expected: git version 2.30.0 or higher

# Check Node.js (optional for local development)
node --version
# Expected: v22.0.0 or higher
```

---

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd world-angular
```

### 2. Start with Docker Compose

```bash
docker-compose up --build
```

This command will:
- Build the frontend and backend Docker images
- Start both containers
- Set up networking between them

**Expected Output**:
```
[+] Building 45.2s (23/23) FINISHED
[+] Running 2/2
 ✔ Container world-angular-backend-1   Started
 ✔ Container world-angular-frontend-1  Started
```

### 3. Access the Application

Open your browser and navigate to:

**Frontend**: http://localhost:4200

**Backend API**: http://localhost:3000/api/country/US

**Health Check**: http://localhost:3000/health

### 4. Test the Application

1. The 3D globe should load within 3 seconds
2. Rotate the globe by clicking and dragging
3. Hover over any country to see information popover
4. Verify country data appears (name, population, capital, region)

---

## Directory Structure

```
world-angular/
├── frontend/                    # Angular 20 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── globe/      # Globe component with Three.js
│   │   │   ├── services/       # API and state services
│   │   │   └── app.component.ts
│   │   ├── assets/
│   │   │   ├── earth-texture.jpg
│   │   │   └── countries-110m.geojson
│   │   └── styles.css
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development with hot reload
│   ├── package.json
│   └── angular.json
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── server.ts           # Main server file
│   │   ├── routes/
│   │   │   └── country.ts      # Country API route
│   │   └── data/
│   │       └── countries.json  # Country metadata
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development with hot reload
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml           # Development orchestration
├── docker-compose.prod.yml      # Production orchestration
└── README.md
```

---

## Development Setup (Optional)

If you want to develop without Docker for faster iteration:

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Backend will run on http://localhost:3000
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Frontend will run on http://localhost:4200
```

**Note**: Ensure backend is running before starting frontend.

---

## Docker Commands Reference

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes
docker-compose down -v

# Stop, remove containers, volumes, and images
docker-compose down --rmi all -v
```

### View Logs

```bash
# View logs from all services
docker-compose logs

# View logs from specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f

# View last 50 lines
docker-compose logs --tail=50
```

### Check Status

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Inspect network
docker network inspect world-angular_default
```

---

## Configuration

### Environment Variables

#### Frontend (frontend/.env)

```env
# API base URL
API_URL=http://localhost:3000/api

# Enable debug mode
DEBUG=false

# Three.js performance settings
ENABLE_STATS=false
MAX_FPS=60
```

#### Backend (backend/.env)

```env
# Server port
PORT=3000

# Node environment
NODE_ENV=development

# CORS allowed origins
CORS_ORIGIN=http://localhost:4200

# Logging level
LOG_LEVEL=info
```

### Docker Compose Configuration

Edit `docker-compose.yml` to customize:

- **Ports**: Change host ports if 3000 or 4200 are already in use
- **Volumes**: Add volume mounts for live code reloading
- **Environment**: Override environment variables

Example:
```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Change host port to 3001
    environment:
      - PORT=3000
      - NODE_ENV=development
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `Bind for 0.0.0.0:4200 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
lsof -i :4200

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### Issue: Cannot Connect to Backend

**Error**: `Failed to fetch country: net::ERR_CONNECTION_REFUSED`

**Solution**:
```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Issue: Globe Not Rendering

**Error**: Blank screen or WebGL error

**Solution**:
1. Check browser console for errors
2. Verify WebGL support: https://get.webgl.org/
3. Update graphics drivers
4. Try a different browser (Chrome recommended)

### Issue: Docker Build Fails

**Error**: `ERROR [build 5/10] RUN npm install`

**Solution**:
```bash
# Clear Docker cache
docker-compose build --no-cache

# Remove old images
docker system prune -a

# Rebuild
docker-compose up --build
```

### Issue: Slow Performance

**Symptoms**: < 30 FPS, laggy rotation

**Solution**:
1. Check browser DevTools Performance tab
2. Reduce texture resolution in `globe.component.ts`
3. Disable postprocessing effects
4. Close other browser tabs
5. Allocate more Docker resources (Settings > Resources)

---

## Testing

### Backend Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test

# E2E tests
npm run e2e
```

### API Testing

Using curl:
```bash
# Test country endpoint
curl http://localhost:3000/api/country/US

# Test health endpoint
curl http://localhost:3000/health

# Test invalid country code
curl http://localhost:3000/api/country/XX
# Expected: 404 Not Found
```

Using HTTPie:
```bash
# Install HTTPie
brew install httpie  # macOS
apt install httpie   # Ubuntu

# Test API
http GET http://localhost:3000/api/country/FR
```

---

## Data Setup

### Country Data

The application uses two data sources:

1. **GeoJSON Polygons** (`frontend/src/assets/countries-110m.geojson`)
   - Natural Earth 110m Cultural Vectors
   - Download: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
   - Place in `frontend/src/assets/`

2. **Country Metadata** (`backend/src/data/countries.json`)
   - Format:
   ```json
   {
     "US": {
       "code": "US",
       "name": "United States",
       "population": 331002651,
       "capital": "Washington, D.C.",
       "region": "Americas"
     }
   }
   ```

### Adding New Countries

1. Update `backend/src/data/countries.json` with new country data
2. Ensure ISO code matches GeoJSON `ISO_A2` property
3. Restart backend: `docker-compose restart backend`
4. Test: `curl http://localhost:3000/api/country/<CODE>`

---

## Performance Optimization

### Development Mode

- Hot module reloading enabled
- Source maps included
- No minification
- Detailed error messages

### Production Mode

```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up
```

**Optimizations**:
- Minified JavaScript bundles
- Tree-shaking for unused code
- Gzip compression
- Nginx for static file serving
- No source maps

---

## Browser Compatibility

| Browser | Minimum Version | WebGL Support | Recommended |
|---------|----------------|---------------|-------------|
| Chrome | 90+ | ✅ | ✅ Yes |
| Firefox | 88+ | ✅ | ✅ Yes |
| Safari | 14+ | ✅ | ⚠️ Limited |
| Edge | 90+ | ✅ | ✅ Yes |
| Opera | 76+ | ✅ | ✅ Yes |

**Note**: WebGL 2.0 required. Mobile browsers may have reduced performance.

---

## Next Steps

### Development

1. **Customize Globe Appearance**
   - Edit `frontend/src/app/components/globe/globe.component.ts`
   - Modify materials, lighting, and textures

2. **Add More API Endpoints**
   - Create new routes in `backend/src/routes/`
   - Update OpenAPI spec in `specs/001-3d-interactive-globe/contracts/`

3. **Enhance UI**
   - Add Angular Material components
   - Implement Tailwind CSS styling
   - Add animations with GSAP

### Deployment

1. **Prepare for Production**
   - Set up environment variables
   - Configure CORS for production domain
   - Enable HTTPS
   - Set up monitoring and logging

2. **Deploy to Cloud**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

---

## Resources

### Documentation

- **Feature Spec**: `specs/001-3d-interactive-globe/spec.md`
- **Data Model**: `specs/001-3d-interactive-globe/data-model.md`
- **API Contracts**: `specs/001-3d-interactive-globe/contracts/README.md`
- **Research**: `specs/001-3d-interactive-globe/research.md`

### External Links

- **Three.js Docs**: https://threejs.org/docs/
- **three-globe**: https://github.com/vasturiano/three-globe
- **Angular Docs**: https://angular.dev/
- **Express Docs**: https://expressjs.com/
- **Docker Docs**: https://docs.docker.com/

### Support

For issues or questions:
1. Check troubleshooting section above
2. Review application logs
3. Search closed issues in repository
4. Open new issue with details

---

## Summary

✅ **Prerequisites installed** → Docker, Docker Compose, Git  
✅ **Repository cloned** → Code on local machine  
✅ **Services started** → `docker-compose up --build`  
✅ **Application accessible** → http://localhost:4200  
✅ **Globe interactive** → Rotate and hover over countries  
✅ **API responding** → http://localhost:3000/api/country/US  

**Congratulations!** Your 3D interactive globe is now running locally.

For production deployment, see the deployment section of the main README.

---

**Last Updated**: 2025-10-13  
**Version**: 1.0.0  
**Maintainer**: World Globe Team
