import { Injectable, inject } from '@angular/core';
import { ProfileService } from '@features/user/services/profile';

// Mirror of backend RolePermissions. Keep in sync or fetch from API in the future.
const RolePermissions: Record<string, string[]> = {
  ADMIN: ['*'],
  MEMBER: [
    'profile:read',
    'profile:update',
    'item:read',
    'item:create',
    'item:update',
    'item:delete',
    'room:read',
    'room:create',
    'room:update',
    'room:delete',
    'house:read',
    'house:create',
    'house:update',
    'house:delete',
    'category:read',
  ],
};

function roleHasPermission(role: string | undefined | null, required: string) {
  if (!role) return false;
  const perms = RolePermissions[String(role).toUpperCase()] ?? [];
  if (perms.includes('*')) return true;
  return perms.includes(required);
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly profile = inject(ProfileService);

  private get role() {
    return this.profile.getProfile()?.role as string | undefined;
  }

  can(permission: string): boolean {
    return roleHasPermission(this.role, permission);
  }

  anyOf(perms: string[]): boolean {
    return perms.some((p) => this.can(p));
  }

  allOf(perms: string[]): boolean {
    return perms.every((p) => this.can(p));
  }
}
