import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserHouse } from '@features/house/models';
import { HouseService } from '@features/house/services';
import { FormValidators } from '@lib/utils';
import { ZardButtonComponent } from '@ui/button';
import { ZardDialogRef } from '@ui/dialog';
import { ZardFormModule } from '@ui/form';
import { ZardInputDirective } from '@ui/input';

@Component({
  selector: 'hia-house-selector-add',
  imports: [ReactiveFormsModule, ZardFormModule, ZardInputDirective, ZardButtonComponent],
  templateUrl: './house-selector-add.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseSelectorAddComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _houseService = inject(HouseService);
  private readonly _dialogRef = inject(ZardDialogRef) as ZardDialogRef<
    HouseSelectorAddComponent,
    UserHouse
  >;

  isLoading = signal<boolean>(false);

  readonly form = this._fb.group({
    name: ['', FormValidators.itemName()],
    address: ['', FormValidators.location()],
  });

  get disabled() {
    return this.form.invalid || this.isLoading();
  }

  get validName() {
    return this.form.get('name')?.dirty && this.form.get('name')?.valid;
  }

  get validAddress() {
    return this.form.get('address')?.dirty && this.form.get('address')?.valid;
  }

  get errors() {
    return {
      name: 'Please enter a valid name',
      address: 'Please enter a valid address',
    };
  }

  private markAllTouched() {
    Object.values(this.form.controls).forEach((c) => {
      c.markAsTouched();
      c.markAsDirty();
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markAllTouched();
      return;
    }

    const { name, address } = this.form.value;
    this.isLoading.set(true);
    this._houseService
      .createHouse({ name: name?.trim() || '', address: address?.trim() })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this._dialogRef.close();
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onCancel() {
    this._dialogRef.close();
  }
}
