import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared';

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
