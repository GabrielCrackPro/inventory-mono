import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MaintenanceController } from './maintenance.controller';
import { PurgeService } from './purge.service';

@Module({
  imports: [PrismaModule],
  controllers: [MaintenanceController],
  providers: [PurgeService],
  exports: [PurgeService],
})
export class MaintenanceModule {}
