# @inventory/shared

Shared models, types, and interfaces for the Inventory Management System monorepo.

## Overview

This package contains all the shared TypeScript definitions used across the frontend (Angular) and backend (NestJS) applications. By centralizing these definitions, we ensure type safety and consistency across the entire application.

## Structure

```
shared/
├── src/
│   ├── models/           # Domain models and interfaces
│   │   ├── user.ts       # User-related types
│   │   ├── house.ts      # House-related types
│   │   ├── room.ts       # Room-related types
│   │   ├── item.ts       # Item-related types
│   │   ├── activity.ts   # Activity/audit types
│   │   ├── auth.ts       # Authentication types
│   │   ├── api.ts        # API response types
│   │   ├── notification.ts # Notification types
│   │   └── category.ts   # Category types
│   ├── types/
│   │   └── common.ts     # Common utility types
│   └── index.ts          # Main export file
├── dist/                 # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### In Backend (NestJS)

```typescript
import {
  User,
  CreateUserData,
  UserRole,
  ActivityType,
  HousePermission,
} from "@inventory/shared";

// Use in services, controllers, DTOs, etc.
@Injectable()
export class UserService {
  async createUser(data: CreateUserData): Promise<User> {
    // Implementation
  }
}
```

### In Frontend (Angular)

```typescript
import {
  AuthUser,
  LoginRequest,
  ApiResponse,
  ToastType,
} from "@inventory/shared";

// Use in services, components, etc.
@Injectable()
export class AuthService {
  login(credentials: LoginRequest): Observable<ApiResponse<AuthUser>> {
    // Implementation
  }
}
```

## Available Models

### Core Domain Models

- **User**: User management and authentication
- **House**: House/property management
- **Room**: Room organization within houses
- **Item**: Inventory item management
- **Category**: Item categorization
- **Activity**: Audit trail and activity logging

### Supporting Types

- **Auth**: Authentication and authorization
- **API**: Standard API responses and errors
- **Notification**: Toast and notification system
- **Common**: Utility types and helpers

## Development

### Building the Package

```bash
# Build once
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

### Adding New Types

1. Create or update the appropriate model file in `src/models/`
2. Export the new types from `src/index.ts`
3. Build the package: `npm run build`
4. The types will be available in both frontend and backend

### Type Safety

All models include:

- **Interfaces**: For data structures
- **Enums**: For controlled vocabularies
- **Type unions**: For flexible but controlled options
- **Utility types**: For common patterns (Create, Update, etc.)

## Integration

This package is automatically linked to both the frontend and backend applications through the monorepo workspace configuration. Changes to shared types are immediately available in both applications after building.

### Monorepo Commands

From the root directory:

```bash
# Build all packages including shared
npm run build

# Start development mode for all packages
npm run dev

# Build only shared package
npm run build:shared
```

## Best Practices

1. **Consistency**: Keep naming conventions consistent across all models
2. **Documentation**: Add JSDoc comments for complex types
3. **Versioning**: Consider semantic versioning for breaking changes
4. **Validation**: Ensure types match database schemas and API contracts
5. **Reusability**: Create generic types that can be reused across models

## Migration Guide

When migrating existing types to the shared package:

1. Move the type definition to the appropriate model file
2. Update imports in both frontend and backend
3. Remove duplicate type definitions
4. Test both applications to ensure no type errors
5. Update any related documentation

## Contributing

When adding new shared types:

1. Follow existing naming conventions
2. Add appropriate JSDoc documentation
3. Export from the main index file
4. Update this README if adding new model categories
5. Test in both frontend and backend applications
