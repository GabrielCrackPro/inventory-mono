import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { FeaturesModule } from './features/features.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthSharedModule, MailModule, CustomCacheInterceptor } from './shared';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 30,
      max: 1000,
    }),
    PrismaModule,
    AuthSharedModule,
    MailModule,
    ScheduleModule.forRoot(),
    FeaturesModule,
  ],
  providers: [CustomCacheInterceptor],
})
export class AppModule {}
