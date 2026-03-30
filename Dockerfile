# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner (standalone output)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone server bundle
COPY --from=builder /app/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=builder /app/.next/static ./.next/static
# Copy public assets (favicon, etc.)
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
