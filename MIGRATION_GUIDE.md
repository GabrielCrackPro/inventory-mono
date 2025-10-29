# Migration Guide: Monorepo with Shared Models

This guide explains the changes made to transform the project into a monorepo with shared TypeScript models and DTOs.

## 🏗️ What Changed

### 1. **New Monorepo Structure**

```
inventory-dashboard/
├── shared/                 # 🆕 Shared TypeScript models and DTOs
├── backend/               # Updated to use shared models
├── frontend/              # Updated to use shared models
├── package.json           # 🆕 Root workspace configuration
└── docker-compose.*.yml   # Updated for monorepo
```

### 2. **Shared Package (`@inventory/shared`)**

- **Location**: `shared/` directory
- **Purpose**: Centralized TypeScript definitions
- **Content**:
  - Domain models (User, House, Room, Item, etc.)
  - DTOs for API communication
  - Common utility types
  - Enums and constants

### 3. **Backend Changes**

- **Package.json**: Added `@inventory/shared` dependency
- **TSConfig**: Added path mapping for shared package
- **Models**: Now re-export from shared package
- **DTOs**: Implement shared interfaces while keeping validation decorators

### 4. **Frontend Changes**

- **Package.json**: Added `@inventory/shared` dependency
- **TSConfig**: Added path mapping for shared package
- **Models**: Now re-export from shared package

## 🔧 Technical Implementation

### Shared Models Structure

```typescript
// shared/src/models/user.ts
export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  // ...
}
```

### Backend DTO Implementation

```typescript
// backend/src/features/user/user.dto.ts
import { UserRole } from "@inventory/shared";
import type { CreateUserDto as ICreateUserDto } from "@inventory/shared";

export class CreateUserDto implements ICreateUserDto {
  @IsString()
  @ApiProperty({ example: "John Doe" })
  name: string;

  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole;
  // ... validation decorators
}
```

### Frontend Usage

```typescript
// frontend/src/app/services/user.service.ts
import { User, CreateUserDto, UserRole } from "@inventory/shared";

@Injectable()
export class UserService {
  createUser(data: CreateUserDto): Observable<User> {
    // Full type safety with shared models
  }
}
```

## 🚀 Benefits Achieved

### 1. **Type Safety**

- ✅ Consistent types across frontend and backend
- ✅ Compile-time error checking
- ✅ IntelliSense and auto-completion

### 2. **Maintainability**

- ✅ Single source of truth for models
- ✅ Changes propagate automatically
- ✅ Reduced code duplication

### 3. **Developer Experience**

- ✅ Better IDE support
- ✅ Easier refactoring
- ✅ Consistent API contracts

## 📦 Package Management

### Workspace Commands

```bash
# Install all dependencies
npm run install:all

# Build all packages
npm run build

# Development mode
npm run dev

# Docker development
npm run docker:dev
```

### Shared Package Commands

```bash
# Build shared package
npm run build:shared

# Watch mode for development
npm run dev:shared
```

## 🔄 Migration Process

### 1. **Backward Compatibility**

All existing imports continue to work because we set up re-exports:

```typescript
// backend/src/features/user/user.model.ts
export {
  User,
  UserRole,
  CreateUserData,
  UpdateUserData,
} from "@inventory/shared";
```

### 2. **Gradual Migration**

You can gradually migrate to direct imports from shared:

```typescript
// Old way (still works)
import { User } from "./user.model";

// New way (recommended)
import { User } from "@inventory/shared";
```

## 🐳 Docker Integration

### Development Environment

- Shared package is built automatically in containers
- Hot reload works for all packages
- Volume mounting preserves development workflow

### Production Environment

- Multi-stage builds for optimized images
- Shared package compiled once and reused

## 🧪 Testing

### Running Tests

```bash
# All tests
npm run test

# Backend tests
npm run test --workspace=backend

# Frontend tests
npm run test --workspace=frontend
```

## 📝 Available Models

### Core Domain Models

- **User**: User management and authentication
- **House**: Property/home management
- **Room**: Room organization within houses
- **Item**: Inventory item management
- **Category**: Item categorization
- **Activity**: Audit trail and logging

### DTOs (Data Transfer Objects)

- **Create/Update DTOs**: For API requests
- **Response DTOs**: For API responses
- **Search/Filter DTOs**: For query parameters
- **List DTOs**: For paginated responses

### Utility Types

- **API Types**: Standard response formats
- **Auth Types**: Authentication and authorization
- **Notification Types**: Toast and notification system
- **Common Types**: Utility types and helpers

## 🔧 Development Workflow

### Adding New Models

1. Create model in `shared/src/models/`
2. Add DTOs in `shared/src/dtos/`
3. Export from `shared/src/index.ts`
4. Build shared package: `npm run build:shared`
5. Use in frontend and backend

### Making Changes

1. Update shared model
2. Build shared package
3. Fix any compilation errors in frontend/backend
4. Test both applications

## 🚨 Common Issues

### 1. **Enum Import Errors**

**Problem**: Cannot use enum as value in decorators
**Solution**: Enums are exported as values, not types:

```typescript
export { UserRole } from "@inventory/shared"; // ✅ Correct
export type { UserRole } from "@inventory/shared"; // ❌ Wrong
```

### 2. **Path Resolution**

**Problem**: Module not found errors
**Solution**: Ensure path mapping is correct in tsconfig.json:

```json
{
  "paths": {
    "@inventory/shared": ["../shared/src"],
    "@inventory/shared/*": ["../shared/src/*"]
  }
}
```

### 3. **Build Order**

**Problem**: Shared package not built
**Solution**: Always build shared package first:

```bash
npm run build:shared
npm run build:backend
npm run build:frontend
```

## 📈 Next Steps

### Recommended Improvements

1. **Add validation**: Use shared validation schemas
2. **API documentation**: Generate OpenAPI specs from shared DTOs
3. **Testing**: Create shared test utilities
4. **CI/CD**: Set up automated builds for monorepo

### Future Enhancements

- **Code generation**: Generate DTOs from database schema
- **Versioning**: Implement semantic versioning for shared package
- **Documentation**: Auto-generate documentation from shared models
- **Linting**: Shared ESLint rules across packages

## 🎯 Conclusion

The monorepo structure with shared models provides:

- **Type safety** across the entire stack
- **Better maintainability** with single source of truth
- **Improved developer experience** with consistent APIs
- **Easier refactoring** and feature development

The migration is complete and backward compatible, allowing for gradual adoption of the new shared models while maintaining existing functionality.
