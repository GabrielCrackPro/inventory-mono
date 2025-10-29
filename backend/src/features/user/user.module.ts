import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
