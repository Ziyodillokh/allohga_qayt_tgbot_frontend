# Bilimdon Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for sharp
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Build argument - API URL ni build vaqtida olish
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build (bu yerda NEXT_PUBLIC_API_URL bundle'ga kiritiladi)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install sharp dependencies
RUN apk add --no-cache libc6-compat

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Start standalone server
CMD ["node", "server.js"]
