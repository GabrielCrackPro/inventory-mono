import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterService } from '@core/services';
import { commonIcons } from '@core/config/icon.config';
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
export class AddItemComponent implements OnInit {
  private readonly itemService = inject(ItemService);
  private readonly toastService = inject(ToastService);
  private readonly alertDialogService = inject(AlertDialogService);
  private readonly profileService = inject(ProfileService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(RouterService);
  private readonly route = inject(ActivatedRoute);

  readonly formService = inject(ItemFormService);
  readonly commonIcons = commonIcons;

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly currentStep = signal(0);
  readonly itemId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.itemId());

  get itemForm() {
    return this.formService.itemForm;
  }

  get profile() {
    return this.profileService.getProfile();
  }

  readonly formProgress = computed(() => this.formService.progress().overall);
  readonly completionSummary = computed(() => this.formService.progress());

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Edit Item' : 'Add New Item'));
  readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? 'Update item information and details'
      : 'Add items to your inventory with detailed information'
  );
  readonly submitButtonText = computed(() => (this.isEditMode() ? 'Update Item' : 'Add Item'));

  constructor() {
    this.formService.itemForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID in the route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId.set(id);
      this.loadItemForEdit(id);
    }
  }

  private loadItemForEdit(id: string): void {
    this.isLoading.set(true);
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        this.formService.itemForm.patchValue({
          name: item.name,
          description: item.description,
          category: item.category?.id || item.category,
          brand: item.brand,
          model: item.model,
          serialNumber: item.serialNumber,
          condition: item.condition,
          room: item.room?.id || item.room,
          location: item.location,
          quantity: item.quantity,
          unit: item.unit,
          minStock: item.minStock,
          purchaseDate: item.purchaseDate,
          price: item.purchasePrice,
          supplier: item.supplier,
          warranty: item.warranty,
          tags: item.tags?.join(', ') || '',
          notes: item.notes,
          isShared: item.isShared,
          sharedWith: item.sharedWith?.join(', ') || '',
          visibility: item.visibility,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load item:', error);
        this.toastService.error({
          title: 'Failed to load item',
          message: 'Could not load item data for editing',
        });
        this.isLoading.set(false);
        this.router.navigate(['/dashboard/items/list']);
      },
    });
  }

  onSubmit(): void {
    if (this.formService.isFormValid()) {
      this.isSubmitting.set(true);
      const formData = this.formService.getFormData();

      if (this.isEditMode()) {
        const itemId = this.itemId()!;
        this.itemService.updateItem(itemId, formData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toastService.success({
              title: 'Item updated',
              message: 'Item updated successfully',
            });
            this.router.navigate(['/dashboard/items/detail', itemId]);
          },
          error: (error) => {
            console.error('Failed to update item:', error);
            this.toastService.error({
              title: 'Failed to update item',
              message: 'Could not update item. Please try again.',
            });
            this.isSubmitting.set(false);
          },
        });
      } else {
        // Add new item
        const currentItems = this.profile?.stats?.items || 0;
        this.itemService.addItem(formData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.formService.resetForm();
            const currentProfile = this.profileService.getProfile();
            this.profileService.updateProfile({
              ...(currentProfile ? currentProfile : {}),
              stats: {
                items: currentItems + 1,
                rooms: currentProfile?.stats?.rooms || 0,
                categories: currentProfile?.stats?.categories || 0,
                lowStockItems: currentProfile?.stats?.lowStockItems || 0,
              },
            });
            this.toastService.success({
              title: 'Item added',
              message: 'Item added successfully',
            });
            this.router.navigate(['/dashboard/items/list']);
          },
          error: (error) => {
            console.error('Failed to add item:', error);
            this.toastService.error({
              title: 'Failed to add item',
              message: 'Could not add item. Please try again.',
            });
            this.isSubmitting.set(false);
          },
        });
      }
    } else {
      this.formService.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.itemForm.dirty) {
      this.alertDialogService.confirm({
        zType: 'destructive',
        zIcon: 'lucideTriangleAlert',
        zTitle: this.isEditMode() ? 'Cancel Edit' : 'Cancel Add Item',
        zDescription: 'You have unsaved changes. Are you sure you want to exit?',
        zCancelText: 'No',
        zOkText: 'Yes',
        zOkDestructive: true,
        zOnOk: () => {
          if (!this.isEditMode()) {
            this.itemForm.reset();
          }
          this.goBack();
        },
      });
    } else {
      if (!this.isEditMode()) {
        this.itemForm.reset();
      }
      this.goBack();
    }
  }

  onTabChange(event: { index: number; label: string }): void {
    this.currentStep.set(event.index);
    this.formService.onTabChange();
  }

  goBack(): void {
    this.router.goBack();
  }

  getFieldError(fieldName: string): string | null {
    return this.formService.getFieldError(fieldName);
  }

  getTabLabel(baseLabel: string, tabName: string): string {
    return this.formService.getTabLabel(baseLabel, tabName);
  }
}
