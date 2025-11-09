import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidators, PasswordUtils } from '@lib/utils';
import { ZardButtonComponent } from '@ui/button';
import { ZardFormModule } from '@ui/form';
import { ZardInputDirective } from '@ui/input';
import { IconComponent } from '@ui/icon';

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'hia-reset-password-form',
  imports: [ReactiveFormsModule, ZardFormModule, ZardInputDirective, ZardButtonComponent, IconComponent],
  templateUrl: './reset-password-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordFormComponent {
  private readonly _fb = inject(FormBuilder);

  readonly formSubmit = output<ResetPasswordFormData>();
  readonly isLoading = signal(false);
  readonly showPasswordRequirements = signal(false);

  readonly form = this._fb.group(
    {
      password: ['', FormValidators.password()],
      confirmPassword: ['', Validators.required],
    },
    { validators: FormValidators.passwordMatch() }
  );

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  get passwordRequirements() {
    const control = this.passwordControl;
    const value = control.value || '';
    return PasswordUtils.checkRequirements(value);
  }

  resetForm(): void {
    this.form.reset();
    this.showPasswordRequirements.set(false);
  }

  get disabled(): boolean {
    return this.form.invalid || this.isLoading();
  }

  private get passwordControl() {
    return this.form.get('password')!;
  }

  private get confirmPasswordControl() {
    return this.form.get('confirmPassword')!;
  }

  get passwordValid(): boolean {
    return !this.passwordControl.dirty || this.passwordControl.valid;
  }

  get confirmPasswordValid(): boolean {
    return (
      !this.confirmPasswordControl.dirty ||
      (this.confirmPasswordControl.valid && !this.form.hasError('passwordMismatch'))
    );
  }

  get passwordErrorMessage(): string {
    const control = this.passwordControl;
    if (!control.dirty || control.valid) return '';

    const missingRequirements = PasswordUtils.getMissingRequirements(control.value || '');
    if (missingRequirements.length > 0) return `Password must contain ${missingRequirements.join(', ')}`;
    return '';
  }

  get confirmPasswordErrorMessage(): string {
    const control = this.confirmPasswordControl;
    if (!control.dirty) return '';
    if (control.hasError('required')) return 'Please confirm your password';
    if (this.form.hasError('passwordMismatch')) return 'Passwords do not match';
    return '';
  }

  onPasswordFocus(): void {
    this.showPasswordRequirements.set(true);
  }

  onPasswordBlur(): void {
    this.showPasswordRequirements.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    const { password, confirmPassword } = this.form.value;
    this.formSubmit.emit({ password: password!, confirmPassword: confirmPassword! });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
