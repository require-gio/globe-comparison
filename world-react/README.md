# 🌍 Interactive Globe - 3D Country Explorer

An interactive 3D globe web application where users can rotate the globe, hover over countries to see them highlight, and view country information in a popover retrieved from the backend.

## 📋 Project Overview

- **Frontend**: React 19 + TypeScript + three.js + react-three-fiber
- **Backend**: Node.js 20 + Fastify + PostgreSQL + Redis
- **Features**: 3D globe rotation, country hover effects, real-time country data

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd world
   ```

2. **Setup environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

4. **Or run locally:**

   **Backend:**
   ```bash
   cd backend
   npm install
   npm run migrate    # Run database migrations
   npm run seed       # Seed with sample data
   npm run dev        # Start development server
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev        # Start development server
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 📁 Project Structure

```
world/
├── backend/                  # Node.js Fastify backend
│   ├── src/
│   │   ├── api/             # API routes and middleware
│   │   │   ├── middleware/  # Error handlers, logging, rate limiting
│   │   │   ├── routes/      # Country and globe endpoints
│   │   │   └── server.ts    # Fastify server configuration
│   │   ├── db/              # Database configuration
│   │   │   ├── migrations/  # SQL migration files
│   │   │   ├── connection.ts # PostgreSQL connection pool
│   │   │   ├── redis.ts     # Redis client
│   │   │   └── seed.ts      # Sample data seeding
│   │   ├── models/          # TypeScript data models
│   │   ├── services/        # Business logic (Country, Cache)
│   │   └── index.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React + three.js frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Globe/       # 3D globe components (to be implemented)
│   │   │   ├── Layout/      # App layout
│   │   │   └── Popover/     # Country popover (to be implemented)
│   │   ├── services/        # API clients and utilities (to be implemented)
│   │   ├── store/           # Zustand state management (to be implemented)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Application entry with providers
│   │   └── index.css        # Global styles with Tailwind
│   ├── public/
│   │   └── data/            # TopoJSON geography data (to be added)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker/                   # Docker configuration
│   ├── docker-compose.yml   # Multi-container setup
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
└── specs/                    # Feature specifications
    └── 001-3d-interactive-globe/
        ├── spec.md          # Feature specification
        ├── plan.md          # Implementation plan
        ├── tasks.md         # Task breakdown
        ├── research.md      # Technical decisions
        ├── data-model.md    # Data entities
        ├── contracts/       # OpenAPI specifications
        └── quickstart.md    # Testing guide
```

## 🛠️ Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server (with hot reload)
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check service health

### Countries
- `GET /api/countries` - Get all countries
- `GET /api/countries/:iso` - Get country by ISO code (e.g., USA, FRA)

### Globe Data
- `GET /api/globe/topojson` - Get TopoJSON geography data for globe rendering

## 🗄️ Database Schema

### Countries Table
```sql
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  iso_code VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  official_name VARCHAR(255),
  capital VARCHAR(255),
  population BIGINT,
  area_km2 DECIMAL(15, 2),
  continent VARCHAR(50),
  currency_code VARCHAR(3),
  currency_name VARCHAR(100),
  languages TEXT[],
  flag_emoji VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

Refer to `specs/001-3d-interactive-globe/quickstart.md` for detailed testing instructions for each user story.

## 📝 Implementation Status

### ✅ Completed

- [x] Phase 1: Project Setup
  - Backend project structure with TypeScript
  - Frontend project with React 19 + Vite
  - Docker Compose configuration
  - GitHub Actions CI/CD workflows

- [x] Phase 2: Foundational Infrastructure
  - PostgreSQL database schema and migrations
  - Redis caching setup
  - Fastify API server with middleware
  - Country service and cache service
  - Sample data seeding (20 countries)
  - React app with TanStack Query
  - TypeScript types and interfaces

### 🚧 In Progress / To Do

- [ ] Phase 3: User Story 1 - Globe Rotation (MVP)
  - 3D globe rendering with three.js
  - Mouse drag rotation controls
  - Country boundaries visualization
  - TopoJSON data loading

- [ ] Phase 4: User Story 2 - Country Hover & Info
  - Hover detection with BVH raycasting
  - Country highlighting effects
  - Popover component with Radix UI
  - API integration for country data

- [ ] Phase 5: User Story 3 - Visual Polish
  - High-quality Earth textures
  - Realistic lighting effects
  - Smooth animations with Framer Motion
  - Sleek UI design

- [ ] Phase 6: Polish & Documentation
  - Performance optimization
  - Comprehensive documentation
  - Production deployment configuration

## 🎯 Features

### User Story 1: Globe Rotation (P1 - MVP)
Users can freely explore the 3D globe by rotating it with mouse drag interactions.

**Acceptance Criteria:**
- Click and drag to rotate globe in any direction
- Smooth rotation with momentum physics
- 60 FPS performance target
- Country boundaries visible on globe

### User Story 2: Country Hover & Information (P2)
Users can hover over countries to see highlights and information popovers.

**Acceptance Criteria:**
- Hovering highlights the country (<100ms response)
- Popover displays country information
- Data retrieved from backend API (<500ms)
- Graceful handling of API failures

### User Story 3: Visual Design Polish (P3)
Application has sleek, modern visual design.

**Acceptance Criteria:**
- Realistic Earth textures with lighting
- Smooth fade-in/fade-out animations
- Dark/space-themed background
- Minimal UI chrome, focus on globe

## 🏗️ Technology Stack

### Frontend
- **React 19**: UI framework
- **TypeScript 5.x**: Type safety
- **three.js**: 3D WebGL rendering
- **react-three-fiber**: React renderer for three.js
- **@react-three/drei**: three.js helpers
- **three-mesh-bvh**: Spatial indexing for raycasting
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible components
- **Framer Motion**: Animations
- **Vite**: Build tool

### Backend
- **Node.js 20.x**: Runtime
- **Fastify 4.x**: HTTP framework
- **PostgreSQL 15+**: Relational database
- **Redis 7.x**: Caching layer
- **TypeScript 5.x**: Type safety
- **Pino**: Logging

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **GitHub Actions**: CI/CD

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
DATABASE_URL=postgresql://globe_user:globe_password@localhost:5432/globe_db
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
LOG_LEVEL=info
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:4000
VITE_APP_TITLE=Interactive Globe
```

## 📚 Additional Documentation

- **Feature Specification**: `specs/001-3d-interactive-globe/spec.md`
- **Implementation Plan**: `specs/001-3d-interactive-globe/plan.md`
- **Task Breakdown**: `specs/001-3d-interactive-globe/tasks.md`
- **Technical Decisions**: `specs/001-3d-interactive-globe/research.md`
- **Data Model**: `specs/001-3d-interactive-globe/data-model.md`
- **API Contracts**: `specs/001-3d-interactive-globe/contracts/`
- **Testing Guide**: `specs/001-3d-interactive-globe/quickstart.md`

## 🤝 Contributing

1. Follow the existing code style
2. Run linters before committing (`npm run lint`)
3. Format code with Prettier (`npm run format`)
4. Write meaningful commit messages
5. Test your changes locally

## 📄 License

[Add your license here]

## 👥 Authors

[Add authors/contributors here]
