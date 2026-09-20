#!/bin/sh
set -e
cd /app/backend
npx prisma migrate deploy --schema /app/prisma/schema.prisma
exec node dist/index.js
