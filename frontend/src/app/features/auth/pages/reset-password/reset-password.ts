import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthLayoutComponent,
  AuthLayoutConfig,
  ResetRequestFormComponent,
  ResetRequestFormData,
  ResetPasswordFormComponent,
  ResetPasswordFormData,
} from '@features/auth/components';
import { AuthService } from '@features/auth/services';
import { ToastService } from '@shared/services';

@Component({
  selector: 'hia-reset-password',
  imports: [AuthLayoutComponent, ResetRequestFormComponent, ResetPasswordFormComponent],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);

  readonly token = signal<string | null>(null);

  readonly isResetMode = computed(() => !!this.token());

  readonly layoutConfig: AuthLayoutConfig = {
    title: 'Reset your password',
    subtitle: 'Enter your email to get a reset link or set a new password',
    icon: 'lucideKeyRound',
    alternateAction: {
      text: 'Remembered your password?',
      linkText: 'Back to login',
      route: '/auth/login',
    },
    footer: {
      text: 'If you did not request a password reset, you can safely ignore this message.',
    },
  };

  constructor() {
    const qpToken = this._route.snapshot.queryParamMap.get('token');
    this.token.set(qpToken);
  }

  onRequestSubmit({ email }: ResetRequestFormData) {
    this._authService.forgotPassword(email).subscribe({
      next: () => {
        this._toastService.success({
          title: 'Email Sent',
          message: 'If that email exists, a reset link has been sent.',
        });
      },
      error: (err) => {
        this._toastService.error({
          title: 'Request Failed',
          message: err?.message || 'Unable to process your request. Please try again.',
        });
      },
    });
  }

  onResetSubmit({ password }: ResetPasswordFormData) {
    const t = this.token();
    if (!t) return;
    this._authService.resetPassword(t, password).subscribe({
      next: () => {
        this._toastService.success({ title: 'Password Updated', message: 'You can now log in.' });
        this._router.navigate(['/auth/login']);
      },
      error: (err) => {
        this._toastService.error({
          title: 'Reset Failed',
          message: err?.message || 'Invalid or expired link. Request a new one.',
        });
      },
    });
  }
}
