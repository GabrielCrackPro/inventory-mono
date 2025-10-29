import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';
import { ActivityModule } from '../activity/activity.module';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';

@Module({
  imports: [PrismaModule, ActivityModule],
  providers: [HouseService],
  controllers: [HouseController],
  exports: [HouseService],
})
export class HouseModule {}
