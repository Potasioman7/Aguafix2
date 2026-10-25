# ---------- Etapa de build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Se copian primero los manifiestos para aprovechar el cache de capas de Docker
COPY package*.json ./
RUN npm install

# Se copia el resto del codigo fuente (lo que no entra por .dockerignore)
COPY . .

# Compila TypeScript -> dist/
RUN npm run build


# ---------- Etapa de produccion ----------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de produccion (sin devDependencies)
COPY package*.json ./
RUN npm install --omit=dev

# Se copia unicamente el resultado compilado de la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Las credenciales y configuracion (DB, AWS, SMTP) se inyectan en runtime
# via variables de entorno (docker run -e / --env-file, o compose.yaml),
# nunca quedan incluidas en la imagen.
CMD ["node", "dist/main"]
