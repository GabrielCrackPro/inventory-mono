import { Module } from '@nestjs/common';
import { FeaturesModule } from './features/features.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthSharedModule, MailModule } from './shared';

@Module({
  imports: [PrismaModule, AuthSharedModule, MailModule, FeaturesModule],
})
export class AppModule {}
