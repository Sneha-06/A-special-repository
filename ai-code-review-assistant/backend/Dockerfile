FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
COPY prisma ./prisma
WORKDIR /app/backend
RUN npm ci
COPY backend .
RUN npm run prisma:generate && npm run build

FROM node:20-alpine
WORKDIR /app/backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json .
COPY --from=builder /app/prisma /app/prisma
COPY backend/docker-entrypoint.sh /app/backend/docker-entrypoint.sh
RUN chmod +x /app/backend/docker-entrypoint.sh
ENV NODE_ENV=production
EXPOSE 4002
CMD ["/app/backend/docker-entrypoint.sh"]
