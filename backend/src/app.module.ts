import { Module } from '@nestjs/common';
import { FeaturesModule } from './features/features.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthSharedModule } from './shared';

@Module({
  imports: [PrismaModule, AuthSharedModule, FeaturesModule],
})
export class AppModule {}
