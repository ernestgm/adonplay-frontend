# ----------------------------------------------------------------
# ETAPA 1: BUILDER (Compila artefactos de PRODUCCIÓN)
# ----------------------------------------------------------------
FROM node:24-alpine AS builder

ARG NEXT_PUBLIC_NAME_PAGE
ARG NEXT_PUBLIC_RAILS_ACTION_CABLE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_UPLOAD_BASE_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_UPLOAD_ENV

ENV NEXT_PUBLIC_NAME_PAGE=$NEXT_PUBLIC_NAME_PAGE
ENV NEXT_PUBLIC_RAILS_ACTION_CABLE_URL=$NEXT_PUBLIC_RAILS_ACTION_CABLE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_UPLOAD_BASE_URL=$NEXT_PUBLIC_UPLOAD_BASE_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_UPLOAD_ENV=$NEXT_PUBLIC_UPLOAD_ENV

WORKDIR /app

# Establece ENV para el BUILD


# Copia e instala dependencias completas (incluye devDeps para el build)
COPY package.json yarn.lock* ./
RUN npm install

# Copia el código fuente y ejecuta el build
COPY . .



RUN npm run build 
# El build debe ejecutarse siempre, ya que esta etapa está dedicada a producir los artefactos.

# ----------------------------------------------------------------
# ETAPA 2: RUNNER (IMAGEN FINAL DE PRODUCCIÓN OPTIMIZADA)
# ----------------------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /app

# Variables de ejecución
ENV NODE_ENV production
ENV PORT 3000

# Copia los artefactos de Next.js (sin standalone)
# 🚨 Copia la carpeta .next completa
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.next/prerender-manifest.json ./.next/prerender-manifest.json
# 🚨 Copia la carpeta public
COPY --from=builder /app/public ./public
# Copia archivos esenciales (ej: next.config.js, package.json)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules


EXPOSE 3000

# CMD para PRODUCCIÓN (npm run start usa los artefactos .next)
CMD ["npm", "run", "start"]

# ----------------------------------------------------------------
# ETAPA 3: DEVELOPMENT (IMAGEN BASE para DESARROLLO con Volumes)
# ----------------------------------------------------------------
FROM node:24-alpine AS development

WORKDIR /app

# Instala dependencias para que el Hot Reload sea rápido
COPY package.json yarn.lock* ./
RUN npm install 

# CMD para DESARROLLO (Ejecutará npm run dev, el código se monta con volumen)
CMD ["npm", "run", "dev"]