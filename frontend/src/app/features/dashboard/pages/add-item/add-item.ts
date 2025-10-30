import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AddDetailsTabComponent,
  AddGeneralTabComponent,
  AddPurchaseTabComponent,
  AddSharingTabComponent,
  AddStorageTabComponent,
  ItemFormService,
  ItemService,
} from '@features/item';
import { ProfileService } from '@features/user';
import { AlertDialogService, ToastService } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardTabComponent, ZardTabGroupComponent } from '@ui/tabs';

@Component({
  selector: 'hia-add-item',
  imports: [
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardButtonComponent,
    ReactiveFormsModule,
    AddGeneralTabComponent,
    AddStorageTabComponent,
    AddPurchaseTabComponent,
    AddDetailsTabComponent,
    AddSharingTabComponent,
  ],
  templateUrl: './add-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemComponent {
  private readonly itemService = inject(ItemService);
  private readonly toastService = inject(ToastService);
  private readonly alertDialogService = inject(AlertDialogService);
  private readonly profileService = inject(ProfileService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  readonly formService = inject(ItemFormService);

  readonly isSubmitting = signal(false);
  readonly currentStep = signal(0);

  get itemForm() {
    return this.formService.itemForm;
  }

  get profile() {
    return this.profileService.getProfile();
  }

  readonly formProgress = computed(() => this.formService.progress().overall);
  readonly completionSummary = computed(() => this.formService.progress());

  constructor() {
    this.formService.itemForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  onSubmit(): void {
    const currentItems = this.profile?.stats.items || 0;

    if (this.formService.isFormValid()) {
      this.isSubmitting.set(true);

      const formData = this.formService.getFormData();

      this.itemService.addItem(formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.formService.resetForm();
          this.profileService.updateProfile({
            ...this.profile,
            stats: {
              items: currentItems + 1,
              rooms: this.profile?.stats?.rooms || 0,
              categories: this.profile?.stats?.categories || 0,
              lowStockItems: this.profile?.stats?.lowStockItems || 0,
            },
          });
          this.toastService.success({
            title: 'Add item',
            message: 'Item added successfully',
          });
          this.router.navigate(['/']);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.formService.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.itemForm.dirty) {
      this.alertDialogService.confirm({
        zType: 'destructive',
        zIcon: 'TriangleAlert',
        zTitle: 'Add Item',
        zDescription: "You've unsaved progress, are you sure do you want to exit?",
        zCancelText: 'No',
        zOkText: 'Yes',
        zOkDestructive: true,
        zOnOk: () => {
          this.itemForm.reset();
          this.goBack();
        },
      });
    } else {
      this.itemForm.reset();
      this.goBack();
    }
  }

  onTabChange(event: { index: number; label: string }): void {
    this.currentStep.set(event.index);
    this.formService.onTabChange();
  }

  goBack(): void {
    history.back();
  }

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }

  getTabLabel(baseLabel: string, tabName: string): string {
    return this.formService.getTabLabel(baseLabel, tabName);
  }
}
