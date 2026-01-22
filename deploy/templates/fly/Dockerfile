# Dockerfile for Fly.io deployment
# Docs: https://fly.io/docs/languages-and-frameworks/dockerfile/

FROM node:22-slim
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application and scripts
COPY build ./build
COPY scripts ./scripts

# Create data directory for SQLite volume
RUN mkdir -p /data

EXPOSE 3000
CMD ["node", "scripts/start.js"]
