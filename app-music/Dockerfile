# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar OpenSSL (necesario para Prisma)
RUN apk add --no-cache openssl

# Copiar package.json
COPY package*.json ./

# Copiar prisma schema PRIMERO (antes de instalar)
COPY prisma ./prisma

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Generar Prisma Client (ahora el schema existe)
RUN npx prisma generate

# Copiar código compilado del stage anterior
COPY --from=builder /app/dist ./dist

# Crear directorios
RUN mkdir -p uploads logs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar
CMD ["node", "dist/server.js"]
