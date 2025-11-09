import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';
import { ActivityModule } from '../activity/activity.module';
import { UsersModule } from '../user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, forwardRef(() => ActivityModule), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
