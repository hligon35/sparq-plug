## Multi-stage production build for SparQ Plug (Next.js + Gateway)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Copy only necessary runtime files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/gateway ./gateway
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
# Expose Next on 3000; run gateway separately or in another container if desired
CMD ["npm","run","start"]
# Multi-stage Dockerfile for self-hosting Next.js (app dir)
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Use npm install to be tolerant of minor lockfile drift in self-hosted builds
RUN npm install --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Allow overriding basePath at build time
ARG APP_BASE_PATH=/app
ENV APP_BASE_PATH=$APP_BASE_PATH
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Default upload dir (mounted as volume externally)
ENV UPLOAD_DIR=/app/uploads
ENV DATA_DIR=/app/data
# Next.js recommends non-root user
RUN addgroup -g 1001 nodejs && adduser -S -G nodejs -u 1001 nextjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Ensure uploads directory exists and is writable by runtime user
RUN mkdir -p /app/uploads /app/data && chown -R nextjs:nodejs /app/uploads /app/data
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
