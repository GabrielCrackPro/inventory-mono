import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormValidators } from '@lib/utils';
import { ZardButtonComponent } from '@ui/button';
import { ZardFormModule } from '@ui/form';
import { ZardInputDirective } from '@ui/input';

export interface ResetRequestFormData {
  email: string;
}

@Component({
  selector: 'hia-reset-request-form',
  imports: [ReactiveFormsModule, ZardFormModule, ZardInputDirective, ZardButtonComponent],
  templateUrl: './reset-request-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetRequestFormComponent {
  private readonly _fb = inject(FormBuilder);

  readonly formSubmit = output<ResetRequestFormData>();

  readonly isLoading = signal(false);

  readonly form = this._fb.group({
    email: ['', FormValidators.email()],
  });

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  resetForm(): void {
    this.form.reset();
  }

  get disabled(): boolean {
    return this.form.invalid || this.isLoading();
  }

  private get emailControl() {
    return this.form.get('email')!;
  }

  get emailValid(): boolean {
    return !this.emailControl.dirty || this.emailControl.valid;
  }

  get emailErrorMessage(): string {
    const control = this.emailControl;
    if (!control.dirty || control.valid) return '';
    if (control.hasError('required')) return 'Email address is required';
    if (control.hasError('invalidEmail')) return 'Please enter a valid email address';
    if (control.hasError('maxLength')) return 'Email address is too long';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    const { email } = this.form.value;
    this.formSubmit.emit({ email: email!.trim().toLowerCase() });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
