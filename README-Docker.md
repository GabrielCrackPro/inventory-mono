# Docker Setup for Home Inventory System

This setup provides a complete containerized environment for the Home Inventory System, including the backend API, frontend web application, and PostgreSQL database.

## Quick Start

### Option 1: Production Setup (Recommended)

Run all services with optimized builds:

```bash
docker-compose up -d
```

This will start:

- **Database**: PostgreSQL on port 5432
- **Backend**: NestJS API on port 3000
- **Frontend**: Angular app served by nginx on port 4200

### Option 2: Development Setup

For development with a single container:

```bash
docker build -t inventory-app .
docker run -p 3000:3000 -p 4200:4200 inventory-app
```

## Services

### Database (PostgreSQL)

- **Port**: 5432
- **Database**: home_inventory
- **Username**: postgres
- **Password**: password

### Backend API (NestJS)

- **Port**: 3000
- **Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api

### Frontend (Angular + nginx)

- **Port**: 4200
- **URL**: http://localhost:4200
- **API Proxy**: Requests to `/api/*` are proxied to the backend

## Commands

### Start all services

```bash
docker-compose up -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop all services

```bash
docker-compose down
```

### Rebuild and restart

```bash
docker-compose down
docker-compose up --build -d
```

### Reset database (removes all data)

```bash
docker-compose down -v
docker-compose up -d
```

## Environment Variables

You can customize the setup by creating a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=home_inventory

# Backend
NODE_ENV=production
PORT=3000

# Frontend
API_URL=http://backend:3000
```

## Development

### Making Changes

1. **Backend changes**: Modify files in `./backend/`, then rebuild:

   ```bash
   docker-compose up --build backend
   ```

2. **Frontend changes**: Modify files in `./frontend/`, then rebuild:
   ```bash
   docker-compose up --build frontend
   ```

### Database Migrations

Migrations run automatically when the backend starts. To run manually:

```bash
docker-compose exec backend npx prisma migrate deploy
```

### Accessing Services

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432 (use any PostgreSQL client)

## Troubleshooting

### Services won't start

1. Check if ports are already in use:

   ```bash
   lsof -i :3000
   lsof -i :4200
   lsof -i :5432
   ```

2. View service logs:
   ```bash
   docker-compose logs [service-name]
   ```

### Database connection issues

1. Ensure database is healthy:

   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

### Frontend can't reach backend

1. Check if backend is running:

   ```bash
   curl http://localhost:3000/health
   ```

2. Verify nginx proxy configuration in `frontend/nginx.conf`

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use secure passwords and proper environment configuration
2. **SSL/TLS**: Add SSL certificates and configure nginx for HTTPS
3. **Reverse Proxy**: Use a reverse proxy like nginx or Traefik in front of the services
4. **Monitoring**: Add health checks and monitoring solutions
5. **Backups**: Implement database backup strategies

## File Structure

```
.
├── docker-compose.yml          # Main orchestration file
├── Dockerfile                  # Development single-container build
├── .dockerignore              # Files to exclude from Docker context
├── start.sh                   # Development startup script
├── backend/
│   ├── Dockerfile             # Backend production build
│   └── ...
├── frontend/
│   ├── Dockerfile             # Frontend production build
│   ├── nginx.conf             # nginx configuration
│   └── ...
└── README-Docker.md           # This file
```
