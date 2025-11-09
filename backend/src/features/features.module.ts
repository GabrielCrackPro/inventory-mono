import { Module } from '@nestjs/common';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { HouseModule } from './house/house.module';
import { ItemModule } from './item/item.module';
import { RoomModule } from './room/room.module';
import { UsersModule } from './user/user.module';
import { MaintenanceModule } from './maintenance/maintenance.module';

@Module({
  imports: [
    ItemModule,
    RoomModule,
    UsersModule,
    AuthModule,
    HouseModule,
    ActivityModule,
    MaintenanceModule,
  ],
})
export class FeaturesModule {}
