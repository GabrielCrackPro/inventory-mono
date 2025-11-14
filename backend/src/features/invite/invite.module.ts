import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma';
import { AuthSharedModule } from '../../shared';
import { MailModule } from '../../shared/mail/mail.module';
import { InviteService } from './invite.service';
import { InvitesController } from './invite.controller';

@Module({
  imports: [PrismaModule, AuthSharedModule, MailModule],
  providers: [InviteService],
  controllers: [InvitesController],
  exports: [InviteService],
})
export class InviteModule {}
