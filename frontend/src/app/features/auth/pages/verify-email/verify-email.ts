import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthLayoutComponent, AuthLayoutConfig } from '@features/auth/components';
import { ProfileService } from '@features/user/services/profile';
import { AuthService } from '@features/auth/services';
import { ToastService } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardFormModule } from '@ui/form';
import { IconComponent } from '@ui/icon';

@Component({
  selector: 'hia-verify-email',
  imports: [
    AuthLayoutComponent,
    ReactiveFormsModule,
    ZardFormModule,
    ZardButtonComponent,
    IconComponent,
  ],
  templateUrl: './verify-email.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(AuthService);
  private readonly _toast = inject(ToastService);
  private readonly _profileService = inject(ProfileService);

  readonly email = signal<string>('');
  readonly isLoading = signal(false);
  readonly isResending = signal(false);
  private _returnUrl?: string;

  readonly layoutConfig: AuthLayoutConfig = {
    title: 'Verify your email',
    subtitle: 'Enter the 6-digit code we sent to your email address',
    icon: 'lucideMailCheck',
    alternateAction: {
      text: 'Already verified?',
      linkText: 'Go to login',
      route: '/auth/login',
    },
    footer: {
      text: "Didn't receive the code? Check your spam folder or resend it.",
    },
  };

  readonly form = this._fb.group({
    digits: this._fb.array(
      Array.from({ length: 6 }).map(() =>
        this._fb.control('', [Validators.required, Validators.pattern(/^\d$/)])
      ),
      [this.otpCompleteValidator()]
    ),
  });

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  get digitsArray(): FormArray {
    return this.form.get('digits') as FormArray;
  }

  private combinedCode(): string {
    return this.digitsArray.controls.map((c) => (c.value as string) || '').join('');
  }

  private otpCompleteValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const arr = control as FormArray;
      if (!arr || arr.length !== 6) return { otpIncomplete: true };
      const code = arr.controls.map((c) => ((c.value ?? '') as string).toString()).join('');
      return /^\d{6}$/.test(code) ? null : { otpIncomplete: true };
    };
  }

  constructor() {
    const qpEmail = this._route.snapshot.queryParamMap.get('email') || '';
    this.email.set(qpEmail);
    const qpReturn = this._route.snapshot.queryParamMap.get('returnUrl');
    this._returnUrl = typeof qpReturn === 'string' && qpReturn.startsWith('/') ? qpReturn : undefined;
  }

  get disabled(): boolean {
    return this.form.invalid || this.isLoading();
  }

  onSubmit() {
    const email = this.email();
    const code = this.combinedCode();
    if (!email) {
      this._toast.error({ title: 'Missing email', message: 'Email parameter is required.' });
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      this._toast.error({ title: 'Invalid code', message: 'Please enter the 6-digit code.' });
      return;
    }
    this.isLoading.set(true);
    this._auth.verifyEmail(email, code).subscribe({
      next: () => {
        const current = this._profileService.getProfile();
        if (current && current.email === email && current.emailVerified === false) {
          this._profileService.updateProfile({ ...current, emailVerified: true } as any);
        }
        const refresh$ = this._profileService.refreshProfileFromServer?.();
        if (refresh$ && typeof (refresh$ as any).subscribe === 'function') {
          (refresh$ as any).subscribe({
            next: () => undefined,
            error: () => undefined,
            complete: () => {
              this._toast.success({ title: 'Email verified', message: 'You can now sign in.' });
              if (this._returnUrl) {
                this._router.navigateByUrl(this._returnUrl);
              } else {
                this._router.navigate(['/auth/login']);
              }
            },
          });
        } else {
          this._toast.success({ title: 'Email verified', message: 'You can now sign in.' });
          if (this._returnUrl) {
            this._router.navigateByUrl(this._returnUrl);
          } else {
            this._router.navigate(['/auth/login']);
          }
        }
      },
      error: (err) => {
        this._toast.error({
          title: 'Verification failed',
          message: 'Invalid or expired code. Please try again.',
        });
      },
      complete: () => this.isLoading.set(false),
    });
  }

  onResend() {
    const email = this.email();
    if (!email) {
      this._toast.error({ title: 'Missing email', message: 'Email parameter is required.' });
      return;
    }
    this.isResending.set(true);
    this._auth.resendVerification(email).subscribe({
      next: () => {
        this._toast.success({
          title: 'Code sent',
          message: 'A new code has been sent to your email.',
        });
      },
      error: (err) => {
        this._toast.error({
          title: 'Resend failed',
          message: 'Please try again later.',
        });
      },
      complete: () => this.isResending.set(false),
    });
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const v = (input.value || '').replace(/\D/g, '');
    const val = v.slice(-1); // keep last digit only
    this.digitsArray.at(index).setValue(val);
    input.value = val;
    if (val && index < 5) {
      this.focusIndex(index + 1);
    }
    this.digitsArray.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    const key = event.key;
    if (key === 'Backspace') {
      const ctrl = this.digitsArray.at(index);
      if (!ctrl.value && index > 0) {
        this.focusIndex(index - 1);
      }
      return;
    }
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusIndex(index - 1);
    }
    if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusIndex(index + 1);
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    const data = event.clipboardData?.getData('text') || '';
    const digits = data.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length) {
      event.preventDefault();
      for (let i = 0; i < 6; i++) {
        const d = digits[i] || '';
        this.digitsArray.at(i).setValue(d);
        const el = this.otpInputs?.get(i)?.nativeElement;
        if (el) el.value = d;
      }
      this.focusIndex(Math.min(digits.length, 5));
      this.digitsArray.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }

  private focusIndex(index: number) {
    const el = this.otpInputs?.get(index)?.nativeElement;
    el?.focus();
    el?.select();
  }
}
