import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';
import { ActivityModule } from '../activity/activity.module';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
