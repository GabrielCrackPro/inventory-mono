import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormValidators } from '@lib/utils';
import { ZardButtonComponent } from '@ui/button';
import { ZardFormModule } from '@ui/form';
import { ZardInputDirective } from '@ui/input';

export interface LoginFormData {
  email: string;
  password: string;
}

@Component({
  selector: 'hia-login-form',
  imports: [ReactiveFormsModule, ZardFormModule, ZardInputDirective, ZardButtonComponent],
  templateUrl: './login-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly _fb = inject(FormBuilder);

  // Outputs
  readonly formSubmit = output<LoginFormData>();
  readonly forgotPasswordClick = output<void>();

  // Form state signals
  readonly isLoading = signal(false);

  readonly loginForm = this._fb.group({
    email: ['', FormValidators.email()],
    password: ['', FormValidators.simplePassword()], // Simple validation for login
  });

  // Public methods for parent component
  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  resetForm(): void {
    this.loginForm.reset();
  }

  // Computed properties
  get disabled(): boolean {
    return this.loginForm.invalid || this.isLoading();
  }

  // Form control getters
  private get emailControl() {
    return this.loginForm.get('email')!;
  }

  private get passwordControl() {
    return this.loginForm.get('password')!;
  }

  // Validation state getters
  get emailValid(): boolean {
    return !this.emailControl.dirty || this.emailControl.valid;
  }

  get passwordValid(): boolean {
    return !this.passwordControl.dirty || this.passwordControl.valid;
  }

  // Error message getters
  get emailErrorMessage(): string {
    const control = this.emailControl;
    if (!control.dirty || control.valid) return '';

    if (control.hasError('required')) return 'Email address is required';
    if (control.hasError('invalidEmail')) return 'Please enter a valid email address';
    if (control.hasError('maxLength')) return 'Email address is too long';

    return '';
  }

  get passwordErrorMessage(): string {
    const control = this.passwordControl;
    if (!control.dirty || control.valid) return '';

    if (control.hasError('required')) return 'Password is required';
    if (control.hasError('minLength')) {
      const error = control.getError('minLength');
      return `Password must be at least ${error.requiredLength} character${
        error.requiredLength > 1 ? 's' : ''
      }`;
    }

    return '';
  }

  // Event handlers
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.loginForm.value;

    this.formSubmit.emit({
      email: formValue.email!.trim().toLowerCase(),
      password: formValue.password!,
    });
  }

  onForgotPasswordClick(): void {
    this.forgotPasswordClick.emit();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
