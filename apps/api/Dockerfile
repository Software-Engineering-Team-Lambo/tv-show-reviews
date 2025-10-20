# Multi-stage build for production
# This Dockerfile is designed to be built from the monorepo root
# Build command: docker build -f apps/api/Dockerfile .

# Stage 1: Build TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files (for workspace support)
COPY package*.json ./
COPY apps/api/package.json ./apps/api/

# Install dependencies for the entire workspace
RUN npm ci

# Copy API source code and Prisma schema
COPY apps/api ./apps/api/

# Generate Prisma Client BEFORE building TypeScript (code imports it)
WORKDIR /app/apps/api
RUN npx prisma generate

# Build TypeScript
RUN npm run build:ts

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy Prisma schema for runtime
COPY apps/api/prisma ./apps/api/prisma/

# Copy built code from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated

# Expose Fastify port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the app using workspace-aware npm command from root
WORKDIR /app
CMD ["npm", "run", "start:prod", "-w", "api"]
