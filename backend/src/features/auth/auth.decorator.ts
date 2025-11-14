import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../shared';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    const value = data ? user && user[data] : user;
    return (value ?? undefined) as unknown;
  },
);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Permission decorators
export const PermissionsAny = (...permissions: string[]) =>
  SetMetadata('permissionsAny', permissions);

export const PermissionsAll = (...permissions: string[]) =>
  SetMetadata('permissionsAll', permissions);

// Convenience decorator to apply auth + permissions in one place
export function AuthZ(options?: { any?: string[]; all?: string[] }) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    ...(options?.any && options.any.length
      ? [SetMetadata('permissionsAny', options.any)]
      : []),
    ...(options?.all && options.all.length
      ? [SetMetadata('permissionsAll', options.all)]
      : []),
  );
}
