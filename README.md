# Globe Comparison — Claude Sonnet 4.5 Output Comparison

## ✨ Project Overview
**Purpose:** An experiment to compare the **output of Claude Sonnet 4.5** on the exact same web app implemented in different frontend frameworks (Vue, React, Angular). Each implementation showcases strengths and weaknesses — this repo documents differences, bugs, UX deviations, and performance sensitivities.

**In short:** Three full-stack examples, identical functionality (3D Globe + country API), different frontends. The goal is reproducible comparisons of model outputs on identical UI/UX flows.

---

## 🔧 Repository Structure (Overview)
- `world-vue/` — Vue 3 + Vite frontend & Fastify backend
- `world-react/` — React + Vite frontend & Express/Fastify backend
- `world-angular/` — Angular frontend & Node backend
- `docker-compose.yml` — Root compose to start all services
- `.env` — Local ports/credentials (host-based)
- `DOCKER-COMPOSE-ALL.md` — Notes on compose/builds

---

## ▶️ Quick Start (via Docker Compose)
The root compose starts databases, backends, and frontends for all three apps and maps host ports:
- Vue frontend → http://localhost:3001 (backend 4001)
- React frontend → http://localhost:3002 (backend 4002)
- Angular frontend → http://localhost:3003 (backend 4003)

1. In the repo root: if not already present, copy `.env-example` to `.env` and adjust values (ports, DB creds).
   - Unix/macOS: `cp .env-example .env`
   - Windows PowerShell: `Copy-Item .env-example .env`
2. Build & start:

```bash
# Build and start all services (recommended for testing)
docker compose up --build

# Or only specific services
docker compose up --build world-react-frontend world-react-backend
```

3. Open browser and check:
- Vue: http://localhost:3001
- React: http://localhost:3002
- Angular: http://localhost:3003

---

## 🛠️ Local Development / Building (per App)
Tip: Each app has its own README in its subdirectory — here are the quick commands.

### React (frontend)
- Dev:
  - cd `world-react/frontend`
  - `npm install`
  - `npm run dev` (opens dev server on the port configured in `.env`)
- Prod build (static):
  - `docker compose build --no-cache --progress=plain --build-arg VITE_API_URL=http://localhost:4002 --target production world-react-frontend`
  - `docker compose up world-react-frontend`

> Note: The app reads `VITE_API_URL` (or falls back to `http://localhost:4002`) — make sure it points to the backend host/port.

### Vue (frontend)
- Dev:
  - cd `world-vue/frontend`
  - `npm install`
  - `npm run dev`
- Prod build:
  - Build with `VITE_API_BASE_URL` as a build arg if desired.

### Angular (frontend)
- Dev:
  - cd `world-angular/frontend`
  - `npm install`
  - `npm start` or `ng serve --host 0.0.0.0` (config in `angular.json`)
- Prod build (Docker):
  - The production stage generates `dist/world-globe-frontend/browser` and an `env.js` (for `API_URL`). The Dockerfile now correctly copies to the Nginx web root.

---

## ✅ Checks / Quick Sanity Tests
- Backend reachable? `curl http://localhost:4002/api/countries` → 200
- Frontend loads and calls backend? Open DevTools → Network → `/api/countries/ISO`
- Angular: `http://localhost:3003/` shows the app (not the default nginx page)

---

## 💡 Notes / Best Practices
- In Docker Compose, host ports are configured in `.env`; for internal container communication, you can use service names (e.g., `http://world-react-backend:4000`).
- For reproducible model comparisons: use the same input flows, screenshots, and automated tests if possible to make deviations measurable.

Questions or improvements? Feel free to open an issue or PR.