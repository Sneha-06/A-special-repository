FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY prisma ./prisma

WORKDIR /app/backend
RUN npm ci

COPY backend ./

RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS production

WORKDIR /app/backend

ENV NODE_ENV=production

COPY --from=build /app/backend/package.json /app/backend/package-lock.json ./
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/prisma /app/prisma
COPY backend/prisma/seed.ts ./prisma/seed.ts

EXPOSE 4001

CMD ["sh", "-c", "npx prisma migrate deploy --schema /app/prisma/schema.prisma && node dist/index.js"]
