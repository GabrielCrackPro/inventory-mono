# Home Inventory Management System - Monorepo

A comprehensive home inventory management system built with modern technologies and a monorepo architecture for better code sharing and maintainability.

## 🏗️ Architecture

This project uses a monorepo structure with shared TypeScript models to ensure type safety and consistency across all applications.

```
inventory-dashboard/
├── shared/                 # Shared TypeScript models and types
│   ├── src/
│   │   ├── models/        # Domain models (User, House, Room, Item, etc.)
│   │   ├── types/         # Common utility types
│   │   └── index.ts       # Main exports
│   └── package.json
├── backend/               # NestJS API server
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── shared/        # Shared backend utilities
│   │   └── prisma/        # Database schema and migrations
│   └── package.json
├── frontend/              # Angular web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Core services and guards
│   │   │   ├── features/  # Feature modules
│   │   │   ├── shared/    # Shared components and services
│   │   │   └── lib/       # UI component library
│   │   └── environments/
│   └── package.json
├── docker-compose.yml     # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
└── package.json           # Root workspace configuration
```

## 🚀 Technologies

### Backend

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Robust relational database
- **JWT** - Authentication and authorization
- **Swagger** - API documentation

### Frontend

- **Angular 20** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library
- **RxJS** - Reactive programming

### Shared

- **TypeScript** - Shared type definitions
- **Monorepo** - Workspace-based architecture

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **npm Workspaces** - Monorepo management

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd inventory-dashboard
   ```

2. **Start development environment**

   ```bash
   npm run docker:dev
   ```

   This will start:

   - PostgreSQL database on port 5432
   - Backend API on port 3000
   - Frontend app on port 4200

3. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api

### Manual Development Setup

1. **Install dependencies**

   ```bash
   npm run install:all
   ```

2. **Build shared package**

   ```bash
   npm run build:shared
   ```

3. **Start PostgreSQL** (using Docker)

   ```bash
   docker run -d \
     --name postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=home_inventory \
     -p 5432:5432 \
     postgres:16
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 📦 Available Scripts

### Root Level Commands

```bash
# Install all dependencies
npm run install:all

# Build all packages
npm run build

# Start all services in development mode
npm run dev

# Docker commands
npm run docker:dev    # Start development environment
npm run docker:prod   # Start production environment
npm run docker:down   # Stop all containers

# Maintenance
npm run clean         # Clean all build artifacts
npm run lint          # Lint all packages
npm run test          # Run all tests
```

### Package-Specific Commands

```bash
# Shared package
npm run build:shared
npm run dev:shared

# Backend
npm run dev:backend
npm run build:backend

# Frontend
npm run dev:frontend
npm run build:frontend
```

## 🗄️ Database

The application uses PostgreSQL with Prisma ORM. Database migrations are automatically applied when the backend starts.

### Database Schema

- **Users** - User accounts and authentication
- **Houses** - Properties/homes management
- **Rooms** - Room organization within houses
- **Items** - Inventory items with details
- **Categories** - Item categorization
- **Activities** - Audit trail and activity logging
- **HouseAccess** - House sharing and permissions

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective directories:

**Backend (.env)**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/home_inventory?schema=public"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
NODE_ENV="development"
```

**Frontend (environment files)**

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
};
```

## 🐳 Docker Development

The project includes optimized Docker configurations for both development and production:

### Development Features

- **Hot Reload** - Both frontend and backend reload on code changes
- **Volume Mounting** - Source code changes reflected immediately
- **Database Persistence** - Data persists between container restarts
- **Health Checks** - Ensures services start in correct order

### Production Features

- **Multi-stage Builds** - Optimized image sizes
- **nginx** - Serves frontend with API proxy
- **Security** - Production-ready configurations

## 🔄 Shared Models

The monorepo architecture includes a shared package (`@inventory/shared`) that provides:

- **Type Safety** - Consistent types across frontend and backend
- **Single Source of Truth** - Models defined once, used everywhere
- **Better Maintainability** - Changes propagate automatically
- **Development Experience** - IntelliSense and auto-completion

### Using Shared Types

**Backend Example:**

```typescript
import { CreateUserData, UserRole } from "@inventory/shared";

@Injectable()
export class UserService {
  async createUser(data: CreateUserData): Promise<User> {
    // Implementation with full type safety
  }
}
```

**Frontend Example:**

```typescript
import { AuthUser, LoginRequest } from "@inventory/shared";

@Injectable()
export class AuthService {
  login(credentials: LoginRequest): Observable<AuthUser> {
    // Implementation with full type safety
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests
npm run test --workspace=backend

# Frontend tests
npm run test --workspace=frontend
```

## 📝 API Documentation

The backend automatically generates Swagger documentation available at:

- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run docker:prod
```

### Environment Setup

1. Configure production environment variables
2. Set up SSL certificates (for HTTPS)
3. Configure reverse proxy (nginx/Traefik)
4. Set up database backups
5. Configure monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use shared types from `@inventory/shared`
- Write tests for new features
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Port conflicts:**

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :4200
lsof -i :5432
```

**Docker issues:**

```bash
# Reset Docker environment
npm run docker:down
docker system prune -f
npm run docker:dev
```

**Shared package not updating:**

```bash
# Rebuild shared package
npm run build:shared
# Restart development servers
npm run dev
```

**Database connection issues:**

```bash
# Check database status
docker-compose logs db
# Reset database
docker-compose down -v
docker-compose up -d
```

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in each package
- Review the troubleshooting section above
