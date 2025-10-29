import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';
import { ActivityModule } from '../activity/activity.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
