# syntax=docker/dockerfile:1

# ---- Build: compile the React app (dist/) and bundle the Express server (dist-server/) ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# Resilient install for slow or flaky networks: fewer parallel sockets, more retries,
# IPv4 first, and a BuildKit cache so a retried build reuses downloaded packages.
RUN --mount=type=cache,target=/root/.npm \
    NODE_OPTIONS=--dns-result-order=ipv4first \
    npm ci --no-audit --no-fund --prefer-offline \
      --maxsockets=6 --fetch-retries=5 \
      --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

COPY . .
RUN npm run build

# ---- Runtime: the server bundle includes its dependencies, so no node_modules are needed ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/dist-server ./dist-server

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1

CMD ["node", "dist-server/index.cjs"]
