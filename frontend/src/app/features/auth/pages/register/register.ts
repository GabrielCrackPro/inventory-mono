import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@features/auth/services';
import {
  AuthLayoutComponent,
  AuthLayoutConfig,
  RegisterFormComponent,
  RegisterFormData,
} from '@features/auth/components';
import { ToastService } from '@shared/services';

@Component({
  selector: 'hia-register',
  imports: [AuthLayoutComponent, RegisterFormComponent],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly layoutConfig: AuthLayoutConfig = {
    title: 'Create your account',
    subtitle: 'Join us and start managing your inventory',
    icon: 'lucideHousePlus',
    alternateAction: {
      text: 'Already have an account?',
      linkText: 'Sign in instead',
      route: '/auth/login',
    },
    footer: {
      text: 'By creating an account, you agree to our <a href="#" class="text-primary hover:underline">Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Policy</a>',
    },
  };

  // Event handlers
  onFormSubmit(formData: RegisterFormData): void {
    this._authService.register(formData).subscribe({
      next: () => {
        this._toastService.success({
          title: 'Account Created',
          message: 'Welcome! Your account has been created successfully.',
        });
        this._router.navigate(['/auth/login']);
      },
      error: (error) => {
        this._toastService.error({
          title: 'Registration Failed',
          message: error.message || 'An error occurred during registration. Please try again.',
        });
      },
    });
  }
}
