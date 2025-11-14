import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma';
import { AuthSharedModule } from '../../shared';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';

@Module({
  imports: [PrismaModule, AuthSharedModule],
  providers: [AccessService],
  controllers: [AccessController],
  exports: [AccessService],
})
export class AccessModule {}
