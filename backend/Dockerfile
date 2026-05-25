# Base node environment
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client and build code
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

# Run migrations and start NestJS
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
