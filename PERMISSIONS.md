# Role & Permission System

This project uses a role-based permission system with fine-grained, string-based permissions that are enforced in the backend and reflected in the frontend UI.

## Backend

- Roles are stored on the `User` model (Prisma) and propagated into JWT tokens at login/refresh.
- Fine-grained permissions are defined centrally:
  - File: `backend/src/shared/auth/permissions.config.ts`
  - Exports `RolePermissions` and helper `roleHasPermission(role, permission)`
  - Default mapping:
    - `ADMIN`: `['*']` (all permissions)
    - `MEMBER`: `profile:read`, `profile:update`, `item:*`, `room:*`, `house:*`, `category:read`
- Guards and decorators:
  - `PermissionsGuard` reads metadata and checks required permissions against the requesting user's role.
  - Decorators (file: `backend/src/features/auth/auth.decorator.ts`):
    - `PermissionsAny(...perms: string[])`: at least one permission must match
    - `PermissionsAll(...perms: string[])`: all permissions must match
    - `AuthZ({ any?: string[]; all?: string[] })`: convenience to apply JWT auth + permission metadata in one decorator
- Module wiring:
  - File: `backend/src/shared/auth/auth-shared.module.ts`
  - `PermissionsGuard` is provided and exported alongside `JwtAuthGuard` and `RolesGuard`.

### Example usage in a controller

```ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthZ, PermissionsAny, PermissionsAll } from '../auth/auth.decorator';
import { JwtAuthGuard, PermissionsGuard } from '../../shared';

@Controller('api/items')
export class ItemsController {
  // Using the convenience decorator (any)
  @AuthZ({ any: ['item:read'] })
  @Get()
  list() {}

  // Manual composition
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @PermissionsAll('item:create')
  @Post()
  create() {}
}
```

### Changing role permissions
Edit the central mapping in `backend/src/shared/auth/permissions.config.ts`:
```ts
export const RolePermissions = {
  ADMIN: ['*'],
  MEMBER: ['profile:read','profile:update','item:read','item:create','item:update','item:delete','room:read','room:create','room:update','room:delete','house:read','house:create','house:update','house:delete','category:read'],
};
```

## Frontend

- The UI reflects permissions to guide the user (e.g., show alerts, disable actions) using existing UI components.
- Permission checking is encapsulated in `PermissionService`:
  - File: `frontend/src/app/core/services/permission.ts`
  - It reads the current `profile.role` and checks strings against a frontend `RolePermissions` mirror.
  - Methods:
    - `can(permission: string): boolean`
    - `anyOf(perms: string[]): boolean`
    - `allOf(perms: string[]): boolean`

### Example UI usage

- Add Item page shows a warning alert and disables form/submit when the user lacks `item:create`:
  - Files touched: `frontend/src/app/features/dashboard/pages/add-item/add-item.ts` and `.html`
  - Displays a `<z-alert zType="warning" ...>` using the UI library and disables the submit button.

### Keeping backend and frontend in sync
- If you change backend permissions, update `frontend/src/app/core/services/permission.ts` accordingly.
- Optionally, expose an API to fetch the role→permission mapping from the server to avoid duplication.

## Quick Reference
- Decorators: `AuthZ`, `PermissionsAny`, `PermissionsAll`
- Guard: `PermissionsGuard`
- Config: `RolePermissions` (backend) and `PermissionService` (frontend)
- Typical permissions: `profile:read`, `profile:update`, `item:read|create|update|delete`, `room:*`, `house:*`, `category:read`
