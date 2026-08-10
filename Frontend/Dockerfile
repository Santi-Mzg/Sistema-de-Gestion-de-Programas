# 1. BUILD STAGE (Compilación de Assets)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. RUNNER STAGE (Contenedor final, solo lo necesario para servir)
FROM node:20-alpine
WORKDIR /app

# Copia solo los archivos de producción
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Asume que Next.js correrá en 3000 por defecto
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

RUN addgroup --system nextjs && adduser --system nextjs --ingroup nextjs
USER nextjs:nextjs

# Comando para iniciar el servidor de Next.js
CMD ["npm", "start"]