import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthLayoutComponent,
  AuthLayoutConfig,
  LoginFormComponent,
  LoginFormData,
} from '@features/auth/components';
import { LoginResponse } from '@features/auth/models';
import { AuthService } from '@features/auth/services';
import { ProfileService } from '@features/user';
import { AuthUser } from '@shared/models';
import { ToastService } from '@shared/services';

@Component({
  selector: 'hia-login',
  imports: [AuthLayoutComponent, LoginFormComponent],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _profileService = inject(ProfileService);

  readonly layoutConfig: AuthLayoutConfig = {
    title: 'Welcome back',
    subtitle: 'Sign in to your inventory dashboard',
    icon: 'lucideHouse',
    alternateAction: {
      text: "Don't have an account?",
      linkText: 'Create new account',
      route: '/auth/register',
    },
    footer: {
      text: 'By signing in, you agree to our <a href="#" class="text-primary hover:underline">Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Policy</a>',
    },
  };

  // Event handlers
  onFormSubmit(formData: LoginFormData): void {
    this._authService.login(formData).subscribe({
      next: (data) => this._handleLogin(data),
      error: (error) => {
        this._toastService.error({
          title: 'Login Failed',
          message: error.message || 'Invalid email or password. Please try again.',
        });
      },
    });
  }

  onForgotPassword(): void {
    // TODO: Implement forgot password functionality
    this._toastService.info({
      title: 'Forgot Password',
      message: 'Forgot password functionality will be implemented soon.',
    });
  }

  private _handleLogin(response: LoginResponse) {
    const profile: AuthUser = {
      ...response.user,
      selectedHouseId: response.user.houseIds[0],
    };
    this._profileService.updateProfile(profile);
    this._toastService.success({
      title: 'Logged in',
      message: 'Welcome back',
      closable: false,
    });

    const params = this._route.snapshot.queryParams;
    const returnUrl = typeof params['returnUrl'] === 'string' ? params['returnUrl'] : undefined;

    if (returnUrl && returnUrl.startsWith('/')) {
      this._router.navigateByUrl(returnUrl);
    } else {
      this._router.navigate(['/dashboard']);
    }
  }
}
