# Multi-stage build for production-ready frontend

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Allow build-time API URL (Vite reads VITE_ prefixed vars at build time)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure nginx can serve files (ignore errors if group/user already exist)
RUN chown -R nginx:nginx /usr/share/nginx/html || true && \
    chown -R nginx:nginx /var/cache/nginx || true && \
    chown -R nginx:nginx /var/log/nginx || true && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid || true

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
