# syntax = docker/dockerfile:1

ARG NODE_VERSION=24.14.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"

# Build stage
FROM base as build

COPY --link .npmrc package-lock.json package.json ./
RUN npm ci --include=dev

COPY --link . .

RUN mkdir /data && npm run build

RUN npm prune --omit=dev

# Final stage
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y sqlite3 procps curl nano less ca-certificates && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app /app

# Copy .sqliterc for convenient sqlite3 CLI usage
COPY --from=build /app/.sqliterc /root/.sqliterc

RUN mkdir -p /data
VOLUME /data

EXPOSE 3000

CMD ["node", "/app/scripts/start-app.js"]