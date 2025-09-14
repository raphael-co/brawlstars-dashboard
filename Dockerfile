FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install; \
    else npm install; fi

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# crée un dossier public vide s'il n'existe pas pour éviter l'erreur de COPY plus tard
RUN mkdir -p public && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

# Next.js standalone + assets
COPY --from=builder /app/.next/standalone ./
# copie OK même si 'public' est vide (on l'a créé dans la phase builder)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
