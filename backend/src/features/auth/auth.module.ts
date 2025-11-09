import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user';
import { ActivityModule } from '../activity/activity.module';
import { PrismaModule } from 'src/prisma';
import { PurgeService } from './purge.service';
import { MaintenanceController } from './maintenance.controller';

@Module({
  imports: [UsersModule, forwardRef(() => ActivityModule), PrismaModule],
  controllers: [AuthController, MaintenanceController],
  providers: [AuthService, PurgeService],
  exports: [AuthService],
})
export class AuthModule {}
