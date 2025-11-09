import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiDocs, JwtAuthGuard } from '../../shared';
import { GetUser } from './auth.decorator';
import {
  AuthResponseDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RefreshResponseDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@ApiDocs({ tags: ['auth'], bearer: true })
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiDocs({
    summary: 'Register a new user',
    responses: [{ status: 201, description: 'User registered' }],
  })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  @ApiDocs({
    summary: 'Login a user',
    bodyType: LoginDto,
    responses: [
      { status: 200, description: 'Login successful', type: AuthResponseDto },
    ],
  })
  async login(@Body() body: LoginDto, @Request() req: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.login(user, ipAddress, userAgent);
  }

  @Post('refresh')
  @ApiDocs({
    summary: 'Rotate refresh token and get new access token',
    bodyType: RefreshDto,
    responses: [
      { status: 200, description: 'Tokens rotated', type: RefreshResponseDto },
    ],
  })
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.userId, body.refreshToken);
  }

  @Post('forgot-password')
  @ApiDocs({
    summary: 'Request a password reset email',
    bodyType: ForgotPasswordDto,
    responses: [
      {
        status: 200,
        description: 'If the email exists, a reset email will be sent',
      },
    ],
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @ApiDocs({
    summary: 'Reset password using token sent by email',
    bodyType: ResetPasswordDto,
    responses: [{ status: 200, description: 'Password reset successful' }],
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('verify-email')
  @ApiDocs({
    summary: 'Verify user email using 6-digit code sent via email',
    bodyType: VerifyEmailDto,
    responses: [{ status: 200, description: 'Email verified' }],
  })
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification')
  @ApiDocs({
    summary: 'Resend email verification code',
    bodyType: ResendVerificationDto,
    responses: [
      { status: 200, description: 'Verification code sent if email exists' },
    ],
  })
  async resendVerification(@Body() body: ResendVerificationDto) {
    return this.authService.resendVerification(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiDocs({
    summary: 'Logout the authenticated user',
    responses: [{ status: 200, description: 'Logout successful' }],
    bearer: true,
  })
  async logout(
    @GetUser() user: { id: number; jti?: string; exp?: number },
    @Request() req: any,
  ) {
    if (user.jti) {
      const expiresAt = user.exp ? new Date(user.exp * 1000) : undefined;
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const userAgent = req.get('User-Agent');
      await this.authService.logout(
        user.jti,
        user.id,
        expiresAt,
        ipAddress,
        userAgent,
      );
    }
    return { message: 'Logged out', userId: user.id };
  }
}
