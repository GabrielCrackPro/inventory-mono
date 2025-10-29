# Multi-service Dockerfile for development
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Create app directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both services
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build backend
RUN cd backend && npm run build

# Build frontend
RUN cd frontend && npm run build

# Expose ports
EXPOSE 3000 4200

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]