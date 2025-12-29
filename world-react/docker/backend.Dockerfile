FROM node:20-alpine

WORKDIR /app

# Copy backend package files from the build context root
COPY backend/package*.json ./

# Use npm install when no package-lock.json exists
RUN npm install

# Copy backend source
COPY backend/. .

EXPOSE 4000

CMD ["npm", "run", "dev"]
