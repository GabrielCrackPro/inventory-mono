import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user';
import { ActivityModule } from '../activity/activity.module';
import { PrismaModule } from 'src/prisma';

@Module({
  imports: [UsersModule, forwardRef(() => ActivityModule), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
