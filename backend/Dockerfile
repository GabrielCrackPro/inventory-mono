# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files only
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (without node_modules)
COPY . .

# Build NestJS
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS prod
WORKDIR /app

# Copy built code and production dependencies
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma

RUN npm install --only=production

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/main.js"]
