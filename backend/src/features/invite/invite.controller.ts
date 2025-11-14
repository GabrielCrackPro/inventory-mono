import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared';
import { InviteService } from './invite.service';
import { GetUser } from '../auth/auth.decorator';

@Controller('api/invites')
export class InvitesController {
  constructor(private readonly invites: InviteService) {}

  @Get(':token')
  getInvite(@Param('token') token: string) {
    return this.invites.getInviteByToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept')
  accept(@Body('token') token: string, @GetUser('id') userId: number) {
    return this.invites.acceptInvite(token, userId);
  }
}
