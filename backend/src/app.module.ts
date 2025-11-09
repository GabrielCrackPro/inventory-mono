import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FeaturesModule } from './features/features.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthSharedModule, MailModule } from './shared';

@Module({
  imports: [
    PrismaModule,
    AuthSharedModule,
    MailModule,
    ScheduleModule.forRoot(),
    FeaturesModule,
  ],
})
export class AppModule {}
