export type Permission = string;

export type RolePermissionsMap = Record<string, Permission[]>;

// Central mapping from roles to allowed permissions.
// Use '*' to allow everything for a role.
export const RolePermissions: RolePermissionsMap = {
  ADMIN: ['*'],
  MEMBER: [
    // User
    'profile:read',
    'profile:update',
    // Items
    'item:read',
    'item:create',
    'item:update',
    'item:delete',
    // Rooms
    'room:read',
    'room:create',
    'room:update',
    'room:delete',
    // Houses
    'house:read',
    'house:create',
    'house:update',
    'house:delete',
    // Categories
    'category:read',
  ],
};

export function roleHasPermission(
  role: string | undefined | null,
  required: Permission,
) {
  if (!role) return false;
  const perms = RolePermissions[String(role).toUpperCase()] ?? [];
  if (perms.includes('*')) return true;
  return perms.includes(required);
}
