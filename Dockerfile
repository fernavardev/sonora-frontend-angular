# ---- Etapa 1: compilar Angular ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: ejecutar Angular SSR ----
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/dist/sonora-frontend-angular ./dist/sonora-frontend-angular
COPY --from=build /app/package*.json ./

RUN npm ci --omit=dev

USER node

EXPOSE 4000

CMD ["node", "dist/sonora-frontend-angular/server/server.mjs"]
