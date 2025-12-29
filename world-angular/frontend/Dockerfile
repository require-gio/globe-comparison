# Development stage
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]

# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG API_URL
ENV API_URL=$API_URL
RUN npm run build -- --configuration production && \
    printf "window.__APP_ENV__ = {\"API_URL\": \"%s\"};" "$API_URL" > dist/world-globe-frontend/env.js

# Production stage
FROM nginx:alpine AS production

# Copy nginx configuration
# Place our server block into conf.d as default.conf (nginx base config will include it)
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application (copy the browser output contents into web root to replace default nginx index)
COPY --from=build /app/dist/world-globe-frontend/browser/ /usr/share/nginx/html/
# Copy env.js (runtime app config) into web root
COPY --from=build /app/dist/world-globe-frontend/env.js /usr/share/nginx/html/env.js
# Ensure default welcome page is removed (if any) and content is correctly in web root
RUN rm -rf /usr/share/nginx/html/50x.html || true && \
    rm -rf /usr/share/nginx/html/*default* || true

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

USER nginx-user

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
