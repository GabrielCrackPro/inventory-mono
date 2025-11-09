import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma';

@Injectable()
export class PurgeService {
  private readonly logger = new Logger(PurgeService.name);

  constructor(private prismaService: PrismaService) {}

  private async doPurge() {
    const now = new Date();

    // Password reset tokens
    const usedBefore = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); // 30 days

    // Refresh tokens
    const refreshCreatedBefore = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 60,
    ); // 60 days

    // Password reset tokens cleanup
    const expiredReset = await this.prismaService.passwordResetToken.deleteMany(
      {
        where: { expiresAt: { lt: now } },
      },
    );
    const usedReset = await this.prismaService.passwordResetToken.deleteMany({
      where: { usedAt: { lt: usedBefore } },
    });

    // Refresh tokens cleanup
    const expiredRefresh = await this.prismaService.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    const oldRefresh = await this.prismaService.refreshToken.deleteMany({
      where: { expiresAt: null, createdAt: { lt: refreshCreatedBefore } },
    });

    const result = {
      reset: {
        expired: expiredReset?.count ?? 0,
        used: usedReset?.count ?? 0,
      },
      refresh: {
        expired: expiredRefresh?.count ?? 0,
        old: oldRefresh?.count ?? 0,
      },
    } as const;

    return {
      ...result,
      total:
        result.reset.expired +
        result.reset.used +
        result.refresh.expired +
        result.refresh.old,
    };
  }

  // Runs hourly to purge expired and stale tokens
  @Cron(CronExpression.EVERY_HOUR)
  async purgeTokens() {
    try {
      const res = await this.doPurge();
      if (res.total > 0) {
        this.logger.log(
          `Pruned tokens — reset(expired:${res.reset.expired}, used:${res.reset.used}), refresh(expired:${res.refresh.expired}, old:${res.refresh.old})`,
        );
      } else {
        this.logger.log('Purge ran — nothing to prune');
      }
    } catch (e) {
      this.logger.warn(
        `Purge job failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // Manual trigger that returns detailed counts
  async runManual() {
    try {
      const res = await this.doPurge();
      return { ok: true, ...res };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      } as const;
    }
  }
}
