import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidators, PasswordUtils } from '@lib/utils';
import { ZardButtonComponent } from '@ui/button';
import { ZardFormModule } from '@ui/form';
import { ZardInputDirective } from '@ui/input';
import { IconComponent } from '@ui/icon';
import { ZardCheckboxComponent } from '@ui/checkbox';

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'hia-register-form',
  imports: [
    ReactiveFormsModule,
    ZardFormModule,
    ZardInputDirective,
    ZardButtonComponent,
    ZardCheckboxComponent,
    IconComponent,
  ],
  templateUrl: './register-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  private readonly _fb = inject(FormBuilder);

  // Outputs
  readonly formSubmit = output<RegisterFormData>();

  // Form state signals
  readonly showPasswordRequirements = signal(false);
  readonly isLoading = signal(false);

  readonly registerForm = this._fb.group(
    {
      name: ['', FormValidators.name()],
      email: ['', FormValidators.email()],
      password: ['', FormValidators.password()],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    {
      validators: FormValidators.passwordMatch(),
    }
  );

  // Public methods for parent component
  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  resetForm(): void {
    this.registerForm.reset();
    this.showPasswordRequirements.set(false);
  }

  // Computed properties
  get disabled(): boolean {
    return this.registerForm.invalid || this.isLoading();
  }

  // Form control getters
  private get nameControl() {
    return this.registerForm.get('name')!;
  }

  private get emailControl() {
    return this.registerForm.get('email')!;
  }

  private get passwordControl() {
    return this.registerForm.get('password')!;
  }

  private get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword')!;
  }

  private get termsControl() {
    return this.registerForm.get('terms')!;
  }

  // Validation state getters
  get nameValid(): boolean {
    return !this.nameControl.dirty || this.nameControl.valid;
  }

  get emailValid(): boolean {
    return !this.emailControl.dirty || this.emailControl.valid;
  }

  get passwordValid(): boolean {
    return !this.passwordControl.dirty || this.passwordControl.valid;
  }

  get confirmPasswordValid(): boolean {
    return (
      !this.confirmPasswordControl.dirty ||
      (this.confirmPasswordControl.valid && !this.registerForm.hasError('passwordMismatch'))
    );
  }

  get termsValid(): boolean {
    return !this.termsControl.dirty || this.termsControl.valid;
  }

  // Error message getters
  get nameErrorMessage(): string {
    const control = this.nameControl;
    if (!control.dirty || control.valid) return '';

    if (control.hasError('required')) return 'Full name is required';
    if (control.hasError('minLength')) return 'Name must be at least 2 characters';
    if (control.hasError('maxLength')) return 'Name cannot exceed 50 characters';
    if (control.hasError('invalidName'))
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';

    return '';
  }

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

    const missingRequirements = PasswordUtils.getMissingRequirements(control.value || '');
    if (missingRequirements.length > 0) {
      return `Password must contain ${missingRequirements.join(', ')}`;
    }

    return '';
  }

  get confirmPasswordErrorMessage(): string {
    const control = this.confirmPasswordControl;
    if (!control.dirty) return '';

    if (control.hasError('required')) return 'Please confirm your password';
    if (this.registerForm.hasError('passwordMismatch')) return 'Passwords do not match';

    return '';
  }

  get passwordRequirements() {
    const control = this.passwordControl;
    const value = control.value || '';
    return PasswordUtils.checkRequirements(value);
  }

  // Event handlers
  onPasswordFocus(): void {
    this.showPasswordRequirements.set(true);
  }

  onPasswordBlur(): void {
    this.showPasswordRequirements.set(false);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.registerForm.value;

    this.formSubmit.emit({
      name: formValue.name!.trim(),
      email: formValue.email!.trim().toLowerCase(),
      password: formValue.password!,
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
