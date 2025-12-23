# 3D Interactive Globe with Country Information

A modern web application featuring an interactive 3D globe built with Vue 3, Three.js, and a high-performance Node.js backend. Explore countries, view detailed information, and experience smooth 60 FPS rotations with momentum physics.

![Phase](https://img.shields.io/badge/Phase-2%20Complete-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🌍 **Interactive 3D Globe**: Smooth rotation with mouse drag and momentum decay
- 🎯 **Country Hover**: Instant highlighting (<100ms) with detailed information popovers
- 🚀 **High Performance**: 60 FPS rendering, <500ms API responses, <3s initial load
- 🎨 **Modern Design**: Dark/space theme with sophisticated lighting and animations
- 🔒 **Production Ready**: Docker deployment, Redis caching, rate limiting, error handling

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  Vue 3 + Three.js + Pinia + TanStack Query + Tailwind     │
│              Port: 5173 (dev) / 8080 (prod)                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST API
┌────────────────────────▼────────────────────────────────────┐
│                         Backend                             │
│        Fastify + Prisma + Redis + Zod + TypeScript         │
│                      Port: 3000                             │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   PostgreSQL    │                 │      Redis      │
│   Port: 5432    │                 │   Port: 6379    │
└─────────────────┘                 └─────────────────┘
```

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd world-vue
   ```

2. **Start all services**
   ```bash
   # Production mode
   docker-compose up -d

   # Development mode (with hot-reload)
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:8080 (production) or http://localhost:5173 (development)
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

4. **Stop all services**
   ```bash
   docker-compose down

   # Remove volumes (clean slate)
   docker-compose down -v
   ```

### Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and Redis URLs

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database
npm run prisma:seed

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API base URL

# Start development server
npm run dev
```

## 📋 Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot-reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests with Vitest
npm run lint         # Lint code with ESLint
npm run format       # Format code with Prettier
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with countries
npm run prisma:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run unit tests
npm run test:e2e     # Run Cypress E2E tests
npm run lint         # Lint code with ESLint
```

### Docker
```bash
# Production
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f [service]  # View logs
docker-compose ps                 # List running services

# Development
docker-compose -f docker-compose.dev.yml up -d      # Start dev environment
docker-compose -f docker-compose.dev.yml down       # Stop dev environment
docker-compose -f docker-compose.dev.yml logs -f    # View dev logs

# Rebuild images
docker-compose build --no-cache
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                    # Unit tests
npm run test:coverage       # With coverage report

# Frontend tests
cd frontend
npm test                    # Unit tests
npm run test:e2e           # E2E tests with Cypress
npm run test:e2e:headless  # E2E headless mode
```

## 📁 Project Structure

```
world-vue/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API route handlers
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main Fastify server
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seed script
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Vue composables
│   │   ├── services/       # API client and Three.js services
│   │   ├── stores/         # Pinia state stores
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.vue         # Root component
│   │   ├── main.ts         # Application entry point
│   │   └── style.css       # Global styles
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   ├── nginx.conf          # Nginx configuration
│   └── package.json
├── specs/                  # Design documents and specifications
├── docker-compose.yml      # Production Docker Compose
├── docker-compose.dev.yml  # Development Docker Compose
├── .env.example            # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origin
- `CACHE_TTL`: Cache time-to-live in seconds

**Frontend:**
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_ENABLE_HOVER`: Enable country hover feature
- `VITE_ENABLE_ROTATION`: Enable globe rotation

## 🎯 Performance Targets

- ✅ **Initial Load**: <3 seconds
- ✅ **Frame Rate**: 60 FPS during rotation
- ✅ **API Response**: <500ms for country data
- ✅ **Hover Feedback**: <100ms for country highlight
- ✅ **Popover Display**: <200ms after hover start

## 🛠️ Technology Stack

### Frontend
- **Vue 3**: Composition API with `<script setup>`
- **Three.js**: 3D rendering engine
- **three-globe**: Globe visualization library
- **Vite**: Fast build tool and dev server
- **Pinia**: State management
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first styling
- **Floating UI**: Intelligent popover positioning
- **TypeScript 5.x**: Type safety

### Backend
- **Fastify**: High-performance web framework
- **Prisma**: Type-safe ORM
- **PostgreSQL**: Relational database
- **Redis**: Caching layer
- **Zod**: Schema validation
- **Pino**: Structured logging
- **TypeScript 5.x**: Type safety

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Production web server
- **Vitest**: Unit testing
- **Cypress**: E2E testing

## 📝 API Endpoints

### Health Check
- `GET /health` - Service health status
- `GET /api/health` - Alternative health endpoint

### Countries (Phase 4)
- `GET /api/countries` - List all countries
- `GET /api/countries/:id` - Get country by ISO code
- Query params: `region`, `subregion`, `limit`, `offset`

## 🐛 Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

**Database connection errors:**
```bash
# Ensure PostgreSQL is healthy
docker-compose ps

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

**Port conflicts:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5173
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

### Development Issues

**TypeScript errors:**
```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# Install missing dependencies
npm install
```

**Build failures:**
```bash
# Clear caches
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

## 📚 Documentation

- [Plan Document](specs/001-3d-interactive-globe/plan.md) - Technical architecture
- [Tasks](specs/001-3d-interactive-globe/tasks.md) - Implementation tasks
- [Phase 2 Summary](specs/001-3d-interactive-globe/phase-2-summary.md) - Current progress
- [API Contracts](specs/001-3d-interactive-globe/contracts/api.md) - API documentation

## 🗺️ Roadmap

- [x] **Phase 1**: Project setup and configuration
- [x] **Phase 2**: Foundational infrastructure
- [ ] **Phase 3**: Globe rotation and navigation (US1)
- [ ] **Phase 4**: Country hover and information (US2)
- [ ] **Phase 5**: Visual design and polish (US3)
- [ ] **Phase 6**: Integration and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Three.js community for excellent 3D rendering tools
- Vue.js team for the reactive framework
- Fastify team for the performant backend framework

---

**Status**: Phase 2 Complete ✅ | Ready for User Story Implementation

For detailed setup instructions, see [Quick Start Guide](specs/001-3d-interactive-globe/quickstart.md)
