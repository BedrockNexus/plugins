FROM oven/bun:1.3.6-alpine AS dependencies

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Lint, typecheck and unit tests. CI builds this stage first (test-target:
# test) and only builds, pushes and deploys the image when it passes. Vitest
# runs on Node; Bun is copied in only to run the package scripts.
FROM node:24-alpine AS test

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
# Public, non-production placeholders used by tests and static checks.
ENV NEXT_PUBLIC_CONVEX_URL=https://ci-placeholder.convex.cloud
ENV NEXT_PUBLIC_CONVEX_SITE_URL=https://ci-placeholder.convex.site

COPY --from=dependencies /usr/local/bin/bun /usr/local/bin/bun
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN bun run format:check && bun run lint && bun run typecheck && bun run test

FROM node:24-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CONVEX_SITE_URL
ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL
ENV NEXT_PUBLIC_CONVEX_SITE_URL=$NEXT_PUBLIC_CONVEX_SITE_URL

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Bun remains the package manager, but Next.js builds under its supported Node.js
# runtime. Running `next build` through Bun 1.3.6 crashes while collecting route
# data for /api/github/install.
RUN node node_modules/next/dist/bin/next build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
