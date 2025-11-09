import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterService } from '@core/services';
import { AuthService } from '@features/auth/services';
import { ProfileService } from '@features/user/services/profile';
import { ToastService } from '@shared/services';
import { ZardAlertComponent } from '@ui/alert';
import { ZardButtonComponent } from '@ui/button';

@Component({
  selector: 'hia-dashboard-alerts',
  imports: [ZardAlertComponent, ZardButtonComponent],
  templateUrl: './dashboard-alerts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAlertsComponent {
  private readonly _profile = inject(ProfileService);
  private readonly _auth = inject(AuthService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(RouterService);

  readonly profile = computed(() => this._profile.getProfile());

  readonly showEmailNotVerified = computed(() => {
    const p = this.profile();
    if (!p) return false;
    return p.emailVerified === false;
  });

  readonly isResending = signal(false);

  onResend() {
    const email = this.profile()?.email;
    if (!email) return;
    this.isResending.set(true);
    this._auth.resendVerification(email).subscribe({
      next: () => {
        this._toast.success({
          title: 'Code sent',
          message: 'A new code has been sent to your email.',
        });
        this.goToVerify();
      },
      error: (err) =>
        this._toast.error({
          title: 'Resend failed',
          message: err?.message || 'Please try again later.',
        }),
      complete: () => this.isResending.set(false),
    });
  }

  goToVerify() {
    const email = this.profile()?.email;
    this._router.goToVerifyEmail(email ?? undefined, '/dashboard');
  }
}
