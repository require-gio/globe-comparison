# Production build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Use npm install when no package-lock.json exists
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production nginx image
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose standard http port
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# Development stage (default)
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
# Use npm install when no package-lock.json exists
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
