# Inventory Dashboard - Monorepo

A comprehensive inventory management system built with a modern monorepo architecture, featuring backend API, web frontend, and mobile app with shared TypeScript types.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    @inventory/shared                     │
│  Types, Models, DTOs, Constants, Validation Utilities   │
└─────────────────────────────────────────────────────────┘
           ↓                ↓                ↓
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ Backend  │     │ Frontend │     │  Mobile  │
    │ (NestJS) │     │ (Angular)│     │  (Expo)  │
    └──────────┘     └──────────┘     └──────────┘
```

## 📦 Packages

### [`shared/`](./shared) - Shared Package

TypeScript types, models, DTOs, and utilities shared across all applications.

**Key Features:**

- Domain models (User, Item, House, Room, etc.)
- DTOs for API communication
- Enums and constants
- Validation utilities
- API endpoint definitions

### [`backend/`](./backend) - Backend API

NestJS REST API with PostgreSQL database.

**Tech Stack:**

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

**Features:**

- User authentication & authorization
- Multi-house inventory management
- Room-based organization
- Item tracking with categories
- Activity logging
- Email verification
- Password reset
- Invitation system

### [`frontend/`](./frontend) - Web Frontend

Modern Angular application with standalone components.

**Tech Stack:**

- Angular 20
- Tailwind CSS
- Chart.js
- RxJS
- Standalone Components

**Features:**

- Responsive dashboard
- Item management
- House & room organization
- User management
- Activity tracking
- Analytics & charts

### [`mobile/`](./mobile) - Mobile App

Cross-platform mobile app built with React Native and Expo.

**Tech Stack:**

- React Native 0.76
- Expo 52
- Expo Router
- Zustand (state management)
- Axios

**Features:**

- iOS, Android, and Web support
- File-based routing
- Shared types from monorepo
- Native performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Docker (optional)
- Expo CLI (for mobile)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd inventory-dashboard-monorepo

# Install all dependencies
npm install

# Or use the convenience script
npm run install:all
```

### Setup

1. **Configure Backend**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Setup Database**

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Build Shared Package** (Required first!)
   ```bash
   npm run build:shared
   ```

### Development

```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:4200
npm run dev:mobile     # Expo dev server
```

### Building

```bash
# Build all packages
npm run build

# Build individually
npm run build:shared
npm run build:backend
npm run build:frontend
npm run build:mobile
```

## 🐳 Docker

### Development

```bash
npm run docker:dev
```

### Production

```bash
npm run docker:prod
```

## 📚 Documentation

- [Monorepo Structure](./MONOREPO_STRUCTURE.md) - Detailed project structure
- [Migration Guide](./MIGRATION_GUIDE.md) - How to use shared package
- [Shared Package](./shared/README.md) - Shared types documentation
- [Backend API](./backend/README.md) - API documentation
- [Frontend](./frontend/README.md) - Frontend documentation
- [Mobile App](./mobile/README.md) - Mobile app documentation

## 🔧 Available Scripts

### Root Level

```bash
npm run build              # Build all packages
npm run dev                # Start all in development mode
npm run clean              # Clean all build artifacts
npm run install:all        # Install all dependencies
npm run lint               # Lint all packages
npm run test               # Test all packages
npm run docker:dev         # Start with Docker (dev)
npm run docker:prod        # Start with Docker (prod)
npm run docker:down        # Stop Docker containers
```

### Package-Specific

```bash
npm run build:shared       # Build shared package
npm run build:backend      # Build backend
npm run build:frontend     # Build frontend
npm run build:mobile       # Build mobile

npm run dev:shared         # Watch mode for shared
npm run dev:backend        # Start backend dev server
npm run dev:frontend       # Start frontend dev server
npm run dev:mobile         # Start Expo dev server
```

## 🏛️ Project Structure

```
inventory-dashboard-monorepo/
├── shared/                 # Shared TypeScript package
│   ├── src/
│   │   ├── models/        # Domain models
│   │   ├── dtos/          # Data Transfer Objects
│   │   ├── types/         # TypeScript types
│   │   ├── constants/     # Constants & validation rules
│   │   └── utils/         # Utility functions
│   └── dist/              # Compiled output
│
├── backend/               # NestJS API
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── shared/        # Backend utilities
│   │   ├── config/        # Configuration
│   │   └── prisma/        # Database client
│   └── prisma/
│       └── schema.prisma  # Database schema
│
├── frontend/              # Angular web app
│   └── src/
│       └── app/
│           ├── features/  # Feature modules
│           ├── core/      # Core services
│           ├── shared/    # Shared components
│           └── lib/       # UI library
│
├── mobile/                # React Native app
│   ├── app/              # Expo Router pages
│   ├── services/         # API services
│   ├── components/       # React components
│   └── stores/           # State management
│
├── docker-compose.yml     # Production Docker
├── docker-compose.dev.yml # Development Docker
└── package.json          # Workspace configuration
```

## 🔑 Key Features

### Shared Package Benefits

- ✅ **Type Safety**: Single source of truth for types
- ✅ **Consistency**: Same validation rules everywhere
- ✅ **DRY**: No duplicate type definitions
- ✅ **API Contract**: Ensures backend/frontend agreement
- ✅ **Maintainability**: Update once, apply everywhere

### Backend Features

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-house support with permissions
- Room-based item organization
- Category management
- Activity logging & audit trail
- Email verification & password reset
- Invitation system
- Swagger API documentation

### Frontend Features

- Modern standalone components
- Responsive design with Tailwind CSS
- Real-time dashboard with charts
- Item management with advanced filtering
- House & room organization
- User administration
- Activity timeline
- Toast notifications

### Mobile Features

- Cross-platform (iOS, Android, Web)
- File-based routing with Expo Router
- Native performance
- Shared types from monorepo
- Offline-ready architecture
- Push notifications (coming soon)

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific package
npm run test --workspace=backend
npm run test --workspace=frontend
npm run test --workspace=mobile
```

## 📝 Code Quality

```bash
# Lint all packages
npm run lint

# Format code (if configured)
npm run format
```

## 🔄 Workflow

### Adding New Features

1. **Define types in shared package**

   ```bash
   cd shared/src/models
   # Add your model
   # Export from index.ts
   npm run build
   ```

2. **Implement in backend**

   ```bash
   cd backend
   # Create feature module
   # Use types from @inventory/shared
   ```

3. **Implement in frontend**

   ```bash
   cd frontend
   # Create components/services
   # Use types from @inventory/shared
   ```

4. **Implement in mobile**
   ```bash
   cd mobile
   # Create screens/components
   # Use types from @inventory/shared
   ```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Update types in `shared` if needed
4. Test in all affected packages
5. Submit a pull request

## 📄 License

MIT

## 🆘 Support

For issues and questions:

- Check the [Migration Guide](./MIGRATION_GUIDE.md)
- Review [Monorepo Structure](./MONOREPO_STRUCTURE.md)
- Check package-specific READMEs

## 🎯 Roadmap

- [ ] GraphQL API option
- [ ] Real-time updates with WebSockets
- [ ] Mobile push notifications
- [ ] Barcode scanning
- [ ] Image upload & storage
- [ ] Export/import functionality
- [ ] Advanced analytics
- [ ] Multi-language support
