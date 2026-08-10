# Image du site Namasté, destinée au NAS.
#
# Trois étapes pour garder l'image finale petite : les dépendances et le build
# restent dans les étapes intermédiaires, seule la sortie autonome de Next est
# recopiée à la fin.

# ── 1. Dépendances ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
# Prisma a besoin d'OpenSSL, absent de l'image Alpine de base.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# postinstall lance `prisma generate`, qui a besoin du schéma : d'où la copie
# de prisma/ juste au-dessus.
RUN npm ci

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Le client Prisma est généré dans src/generated/prisma (sortie personnalisée
# du schéma) : il doit exister avant la compilation.
RUN npx prisma generate
# DATABASE_URL est nécessaire au build même si aucune requête n'est exécutée ;
# la vraie valeur est fournie à l'exécution par docker-compose.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── 3. Exécution ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Écoute sur toutes les interfaces, sinon le port publié par Docker ne répond pas.
ENV HOSTNAME=0.0.0.0

# Utilisateur sans privilèges : rien ici n'a besoin de root.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Les migrations ne sont pas appliquées ici : le CLI Prisma dépend de paquets
# absents de la sortie autonome (effect, entre autres), et les copier un à un
# serait sans fin. C'est le service « migrate » de docker-compose, construit sur
# l'étape builder qui possède toutes les dépendances, qui s'en charge avant le
# démarrage du site.

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
