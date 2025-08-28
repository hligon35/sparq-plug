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
# Optional build metadata for version endpoint
ARG COMMIT
ARG BUILD_TIME
ENV BUILD_COMMIT=${COMMIT} \
	BUILD_TIME=${BUILD_TIME}
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG COMMIT
ARG BUILD_TIME
# Default upload dir (mounted as volume externally)
ENV UPLOAD_DIR=/app/uploads
ENV DATA_DIR=/app/data
# Next.js recommends non-root user
RUN addgroup -g 1001 nodejs && adduser -S -G nodejs -u 1001 nextjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Propagate build metadata to runtime (also exposed as NEXT_PUBLIC_* for client-side visibility if needed)
ENV BUILD_COMMIT=${COMMIT} \
	BUILD_TIME=${BUILD_TIME} \
	NEXT_PUBLIC_BUILD_COMMIT=${COMMIT} \
	NEXT_PUBLIC_BUILD_TIME=${BUILD_TIME}
# Ensure uploads directory exists and is writable by runtime user
RUN mkdir -p /app/uploads /app/data && chown -R nextjs:nodejs /app/uploads /app/data
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
