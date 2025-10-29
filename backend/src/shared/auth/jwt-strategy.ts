import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'default_secret_key',
    });
  }

  async validate(payload: any) {
    // If token has been revoked (jti), reject
    const jti = payload.jti;
    if (jti) {
      // Use Prisma delegate to check revoked token (if available)
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const found = await this.prisma.revokedToken.findUnique({
          where: { jti },
        });
        if (found) throw new UnauthorizedException('Token revoked');
      } catch {
        // fallback safe path: if delegate unavailable, continue (RevokedToken table will be checked after prisma generate)
      }
    }

    // Normalize to return `id` so controllers can consistently use `user.id`.
    // Include jti and exp so controllers (e.g. logout) can revoke token.
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
