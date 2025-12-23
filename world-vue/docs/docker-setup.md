# Docker Setup Guide

This guide explains how to run the 3D Interactive Globe application using Docker and Docker Compose.

## Prerequisites

- Docker 20.x or higher
- Docker Compose 2.x or higher
- 4GB RAM available for containers
- 10GB disk space

## Quick Start

### Option 1: Use the Quick Start Script (Recommended)

```bash
./start.sh
```

Follow the prompts to choose between development or production mode.

### Option 2: Manual Docker Compose Commands

#### Development Mode (with hot-reload)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Container Architecture

### Services

1. **PostgreSQL** (`postgres`)
   - Port: 5432
   - Database: `world_vue`
   - User: `postgres`
   - Password: `postgres` (change in production!)
   - Volume: `postgres_data` (persistent)

2. **Redis** (`redis`)
   - Port: 6379
   - Persistence: AOF enabled
   - Volume: `redis_data` (persistent)

3. **Backend API** (`backend`)
   - Port: 3000
   - Framework: Fastify + Prisma
   - Auto-runs migrations on startup
   - Auto-seeds database on first run
   - Health check: `http://localhost:3000/health`

4. **Frontend** (`frontend`)
   - Development Port: 5173
   - Production Port: 8080
   - Framework: Vue 3 + Vite (dev) or Nginx (prod)
   - Health check: `http://localhost:8080/health` (prod)

### Network

All services run in a bridged network named `world-vue-network`, allowing inter-container communication.

## Environment Configuration

### Development Mode

The development Docker Compose uses volume mounts for hot-reloading:

- Backend: `./backend/src` → `/app/src` (read-only)
- Frontend: `./frontend/src` → `/app/src` (read-only)
- Node modules are stored in Docker volumes for better performance

### Production Mode

Production builds are multi-stage:

1. **Backend**: TypeScript compilation → Node.js production image
2. **Frontend**: Vite build → Nginx static file server

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/world_vue

# Redis
REDIS_URL=redis://redis:6379

# Backend
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_HOVER=true
VITE_ENABLE_ROTATION=true
```

**Note**: In Docker, use service names (e.g., `postgres`, `redis`) for inter-container communication, not `localhost`.

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Check Service Status

```bash
docker-compose ps
```

### Restart a Service

```bash
# Restart backend
docker-compose restart backend

# Restart all services
docker-compose restart
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose exec backend sh

# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev

# View database with Prisma Studio
docker-compose exec backend npx prisma studio

# Frontend shell
docker-compose exec frontend sh

# Redis CLI
docker-compose exec redis redis-cli
```

### Access Databases

#### PostgreSQL

```bash
# Using docker-compose
docker-compose exec postgres psql -U postgres -d world_vue

# Using local psql client
psql -h localhost -p 5432 -U postgres -d world_vue
```

#### Redis

```bash
# Using docker-compose
docker-compose exec redis redis-cli

# Using local redis-cli
redis-cli -h localhost -p 6379
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, and delete volumes (⚠️ deletes data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Full cleanup
docker-compose down -v --rmi all
```

### Rebuild Images

```bash
# Rebuild all images
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Port Already in Use

If you get "port already allocated" errors:

```bash
# Find what's using the port
lsof -i :3000
lsof -i :5173
lsof -i :8080
lsof -i :5432
lsof -i :6379

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs backend

# Check all containers
docker-compose ps

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Verify connection from backend
docker-compose exec backend sh -c 'npx prisma db push'

# Reset database
docker-compose down -v
docker-compose up -d
```

### Frontend Can't Connect to Backend

1. Check CORS settings in backend `.env`:
   ```
   CORS_ORIGIN=http://localhost:5173  # Dev
   CORS_ORIGIN=http://localhost:8080  # Prod
   ```

2. Check frontend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Verify backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

### Hot-Reload Not Working (Development)

Development mode uses Docker volumes for code:

```bash
# Ensure you're using the dev compose file
docker-compose -f docker-compose.dev.yml up -d

# Check volume mounts
docker-compose -f docker-compose.dev.yml config

# Restart with fresh volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Out of Memory

Increase Docker memory allocation:

- **Docker Desktop**: Settings → Resources → Memory (recommend 4GB+)
- **Linux**: Check Docker daemon settings

### Slow Performance on macOS

Use Docker volumes instead of bind mounts for `node_modules`:

```yaml
volumes:
  - ./backend/src:/app/src:ro
  - backend_node_modules:/app/node_modules  # Use volume
```

This is already configured in `docker-compose.dev.yml`.

## Performance Optimization

### Production

1. **Enable BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Use image caching**:
   - Push images to a registry
   - Pull before building locally

3. **Prune unused resources**:
   ```bash
   docker system prune -a
   ```

### Development

1. **Exclude node_modules** from bind mounts (already done)
2. **Use polling** if file watch doesn't work:
   ```bash
   # Backend: tsx watch uses polling by default
   # Frontend: Vite uses chokidar with polling fallback
   ```

## Security Considerations

### Production Deployment

⚠️ **Do not use default credentials in production!**

1. Change database password:
   ```yaml
   environment:
     POSTGRES_PASSWORD: <strong-password>
   ```

2. Use secrets management:
   ```bash
   docker secret create postgres_password password.txt
   ```

3. Enable Redis authentication:
   ```yaml
   redis:
     command: redis-server --requirepass <redis-password>
   ```

4. Use HTTPS:
   - Add SSL certificates to Nginx
   - Use reverse proxy (Traefik, Nginx Proxy Manager)

5. Limit container resources:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 512M
   ```

6. Run as non-root user (already configured in Dockerfiles)

## Health Checks

All services have health checks configured:

```bash
# Check health status
docker-compose ps

# Backend health endpoint
curl http://localhost:3000/health

# Frontend health (production)
curl http://localhost:8080/health
```

Health check statuses:
- `starting`: Container is starting up
- `healthy`: Service is operational
- `unhealthy`: Service has failed health checks

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Docker Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: docker-compose build
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for health
        run: sleep 30
      
      - name: Test backend
        run: curl -f http://localhost:3000/health
      
      - name: Run tests
        run: docker-compose exec -T backend npm test
```

## Deployment

### Docker Hub

```bash
# Tag images
docker tag world-vue-backend:latest username/world-vue-backend:latest
docker tag world-vue-frontend:latest username/world-vue-frontend:latest

# Push to registry
docker push username/world-vue-backend:latest
docker push username/world-vue-frontend:latest
```

### Production Server

```bash
# SSH to server
ssh user@server

# Clone repository
git clone <repo-url>
cd world-vue

# Configure environment
cp .env.example .env
nano .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Resource Requirements

### Minimum

- CPU: 2 cores
- RAM: 2GB
- Disk: 5GB

### Recommended

- CPU: 4 cores
- RAM: 4GB
- Disk: 10GB

### Container Resource Usage

| Service  | CPU    | Memory | Disk  |
|----------|--------|--------|-------|
| Postgres | 0.5    | 256MB  | 1GB   |
| Redis    | 0.1    | 128MB  | 100MB |
| Backend  | 0.5    | 512MB  | 500MB |
| Frontend | 0.1    | 128MB  | 100MB |

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices for Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Project README](../README.md)
- [Quick Start Guide](./quickstart.md)

---

For questions or issues, see the main [README.md](../README.md) or open an issue.
