import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterService } from '@core/services';
import { commonIcons } from '@core/config/icon.config';
import { ProfileService, UserService } from '@features/user';
import { ToastService } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardCardComponent } from '@ui/card';
import { ZardInputDirective } from '@ui/input';
import { ZardFormModule } from '@ui/form';
import { IconComponent } from '@ui/icon';

@Component({
  selector: 'hia-account-settings',
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardFormModule,
    IconComponent,
  ],
  templateUrl: './account-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(RouterService);

  readonly commonIcons = commonIcons;
  readonly isSubmitting = signal(false);
  readonly isChangingPassword = signal(false);
  readonly isUploadingPicture = signal(false);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly profilePicturePreview = signal<string | null>(null);

  readonly profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const profile = this.profileService.getProfile();
    if (profile) {
      this.profileForm.patchValue({
        name: profile.name,
        email: profile.email,
      });
      this.profilePicturePreview.set(profile.profilePicture || null);
    }

    // Add password match validation
    this.passwordForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
  }

  private validatePasswordMatch(): void {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
    const confirmControl = this.passwordForm.get('confirmPassword');

    if (confirmPassword && newPassword !== confirmPassword) {
      confirmControl?.setErrors({ passwordMismatch: true });
    } else if (confirmControl?.hasError('passwordMismatch')) {
      confirmControl?.setErrors(null);
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const profile = this.profileService.getProfile();
    if (!profile) {
      this.toastService.error({
        title: 'Error',
        message: 'User profile not found',
      });
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.profileForm.value;

    this.userService
      .updateUser(profile.id, {
        name: formData.name!,
        email: formData.email!,
      })
      .subscribe({
        next: (updatedUser) => {
          // Update local profile immediately
          this.profileService.updateProfile({
            ...profile,
            name: updatedUser.name,
            email: updatedUser.email,
          });

          // Refresh from server to ensure consistency
          this.profileService.refreshProfileFromServer()?.subscribe();

          // Mark form as pristine to reflect saved state
          this.profileForm.markAsPristine();

          this.toastService.success({
            title: 'Profile updated',
            message: 'Your profile has been updated successfully',
          });
          this.isSubmitting.set(false);
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.toastService.error({
            title: 'Update failed',
            message: error?.error?.message || 'Could not update profile. Please try again.',
          });
          this.isSubmitting.set(false);
        },
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const profile = this.profileService.getProfile();
    if (!profile) {
      this.toastService.error({
        title: 'Error',
        message: 'User profile not found',
      });
      return;
    }

    this.isChangingPassword.set(true);
    const formData = this.passwordForm.value;

    this.userService
      .changePassword(profile.id, {
        currentPassword: formData.currentPassword!,
        newPassword: formData.newPassword!,
      })
      .subscribe({
        next: () => {
          this.toastService.success({
            title: 'Password changed',
            message: 'Your password has been changed successfully',
          });
          this.passwordForm.reset();
          this.isChangingPassword.set(false);
        },
        error: (error) => {
          console.error('Failed to change password:', error);
          this.toastService.error({
            title: 'Password change failed',
            message: error?.error?.message || 'Could not change password. Please try again.',
          });
          this.isChangingPassword.set(false);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toastService.error({
        title: 'Invalid file type',
        message: 'Please select an image file',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error({
        title: 'File too large',
        message: 'Please select an image smaller than 5MB',
      });
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.uploadProfilePicture(base64String);
    };
    reader.onerror = () => {
      this.toastService.error({
        title: 'Upload failed',
        message: 'Could not read the image file',
      });
    };
    reader.readAsDataURL(file);
  }

  uploadProfilePicture(base64Image: string): void {
    const profile = this.profileService.getProfile();
    if (!profile) {
      return;
    }

    this.isUploadingPicture.set(true);

    this.userService
      .updateUser(profile.id, {
        profilePicture: base64Image,
      })
      .subscribe({
        next: (updatedUser) => {
          this.profilePicturePreview.set(base64Image);
          this.profileService.updateProfile({
            ...profile,
            profilePicture: updatedUser.profilePicture,
          });
          this.profileService.refreshProfileFromServer()?.subscribe();
          this.toastService.success({
            title: 'Profile picture updated',
            message: 'Your profile picture has been updated successfully',
          });
          this.isUploadingPicture.set(false);
        },
        error: (error) => {
          console.error('Failed to upload profile picture:', error);
          this.toastService.error({
            title: 'Upload failed',
            message: error?.error?.message || 'Could not upload profile picture. Please try again.',
          });
          this.isUploadingPicture.set(false);
        },
      });
  }

  removeProfilePicture(): void {
    const profile = this.profileService.getProfile();
    if (!profile) {
      return;
    }

    this.isUploadingPicture.set(true);

    this.userService
      .updateUser(profile.id, {
        profilePicture: null,
      })
      .subscribe({
        next: () => {
          this.profilePicturePreview.set(null);
          this.profileService.updateProfile({
            ...profile,
            profilePicture: null,
          });
          this.profileService.refreshProfileFromServer()?.subscribe();
          this.toastService.success({
            title: 'Profile picture removed',
            message: 'Your profile picture has been removed',
          });
          this.isUploadingPicture.set(false);
        },
        error: (error) => {
          console.error('Failed to remove profile picture:', error);
          this.toastService.error({
            title: 'Remove failed',
            message: 'Could not remove profile picture. Please try again.',
          });
          this.isUploadingPicture.set(false);
        },
      });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  goBack(): void {
    this.router.goBack();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword.update((v) => !v);
    } else if (field === 'new') {
      this.showNewPassword.update((v) => !v);
    } else {
      this.showConfirmPassword.update((v) => !v);
    }
  }

  getFieldError(formName: 'profile' | 'password', fieldName: string): string | null {
    let field;
    if (formName === 'profile') {
      field = this.profileForm.get(fieldName);
    } else {
      field = this.passwordForm.get(fieldName);
    }

    if (!field || !field.touched || !field.errors) {
      return null;
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (field.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return null;
  }
}
