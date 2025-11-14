import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roleHasPermission } from './permissions.config';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const any =
      this.reflector.get<string[]>('permissionsAny', context.getHandler()) ||
      this.reflector.get<string[]>('permissionsAny', context.getClass());

    const all =
      this.reflector.get<string[]>('permissionsAll', context.getHandler()) ||
      this.reflector.get<string[]>('permissionsAll', context.getClass());

    // If nothing specified, allow (other guards like JwtAuthGuard still apply)
    if ((!any || any.length === 0) && (!all || all.length === 0)) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { role?: string } | undefined;
    const role = user?.role;

    if (!role) throw new ForbiddenException('Missing role');

    if (any && any.length > 0) {
      const okAny = any.some((p) => roleHasPermission(role, p));
      if (!okAny) throw new ForbiddenException('Insufficient permissions');
    }

    if (all && all.length > 0) {
      const okAll = all.every((p) => roleHasPermission(role, p));
      if (!okAll) throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
