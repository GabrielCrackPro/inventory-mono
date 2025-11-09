import { Controller, Post, HttpCode, ForbiddenException } from '@nestjs/common';
import { PurgeService } from './purge.service';

@Controller('admin')
export class MaintenanceController {
  constructor(private readonly purge: PurgeService) {}

  @Post('purge-tokens')
  @HttpCode(200)
  async purgeTokens() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Manual purge is disabled in production');
    }
    return this.purge.runManual();
  }
}
