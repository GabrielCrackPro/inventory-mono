import { Injectable, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ItemFormData } from '../models/item';
import { FormValidators } from '@lib/utils/form-validators';

export interface FormProgress {
  overall: number;
  byTab: {
    general: number;
    storage: number;
    purchase: number;
    details: number;
    sharing: number;
  };
  completedTabs: number;
  totalTabs: number;
  isMinimumComplete: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ItemFormService {
  private readonly fb = new FormBuilder();

  readonly itemForm: FormGroup;

  private readonly formState = signal<any>({});

  private readonly fieldGroups = {
    general: {
      weight: 40,
      requiredFields: ['name', 'category'],
      optionalFields: ['description', 'brand', 'model', 'serialNumber', 'condition'],
    },
    storage: {
      weight: 30,
      requiredFields: ['room', 'quantity', 'unit'],
      optionalFields: ['location', 'minStock'],
    },
    purchase: {
      weight: 15,
      requiredFields: [],
      optionalFields: ['purchaseDate', 'purchasePrice', 'supplier', 'warranty'],
    },
    details: {
      weight: 10,
      requiredFields: [],
      optionalFields: ['tags', 'notes'],
    },
    sharing: {
      weight: 5,
      requiredFields: [],
      optionalFields: ['visibility', 'isShared', 'sharedWith'],
    },
  };

  private dateRangeValidator = (control: AbstractControl) => {
    if (!control.value) return null;

    const date = new Date(control.value);
    const today = new Date();
    const fiftyYearsAgo = new Date(today.getFullYear() - 50, 0, 1);

    if (date > today) {
      return { futureDate: { message: 'Purchase date cannot be in the future' } };
    }

    if (date < fiftyYearsAgo) {
      return { tooOld: { message: 'Purchase date cannot be more than 50 years ago' } };
    }

    return null;
  };

  readonly progress = computed<FormProgress>(() => {
    this.formState();

    const tabProgress = {
      general: this.calculateGroupProgress('general'),
      storage: this.calculateGroupProgress('storage'),
      purchase: this.calculateGroupProgress('purchase'),
      details: this.calculateGroupProgress('details'),
      sharing: this.calculateGroupProgress('sharing'),
    };

    let overallProgress = 0;
    Object.entries(this.fieldGroups).forEach(([groupName, group]) => {
      const groupProgress = tabProgress[groupName as keyof typeof tabProgress];
      overallProgress += (groupProgress * group.weight) / 100;
    });

    const completedTabs = Object.values(tabProgress).filter((progress) => progress >= 100).length;
    const isMinimumComplete = this.isTabValid('general') && this.isTabValid('storage');

    return {
      overall: Math.round(overallProgress),
      byTab: tabProgress,
      completedTabs,
      totalTabs: Object.keys(this.fieldGroups).length,
      isMinimumComplete,
    };
  });

  constructor() {
    // Define valid units for validation
    const validUnits = [
      'unit',
      'pieces',
      'kg',
      'g',
      'lbs',
      'oz',
      'liters',
      'ml',
      'gallons',
      'meters',
      'cm',
      'inches',
      'feet',
      'boxes',
      'bottles',
      'cans',
    ];

    // Create form with enhanced validation
    this.itemForm = this.fb.group(
      {
        // General Info
        name: ['', FormValidators.itemName()],
        description: [''],
        category: ['', Validators.required],
        brand: [''],
        model: [''],
        serialNumber: [''],
        condition: ['NEW'],

        // Storage & Location
        room: ['', FormValidators.room()],
        location: ['', FormValidators.location()],
        quantity: [1, FormValidators.quantity()],
        unit: ['pieces', FormValidators.unit(validUnits)],
        minStock: [null, FormValidators.minStock()],

        // Purchase Info
        purchaseDate: ['', [this.dateRangeValidator]],
        price: ['', FormValidators.price()],
        supplier: [''],
        warranty: [''],

        // Additional Details
        tags: [''],
        notes: [''],

        // Sharing & Access
        isShared: [false],
        sharedWith: [''],
        visibility: ['private'],
      },
      {
        validators: [FormValidators.minStockLessThanQuantity()],
      }
    );

    // Set up form tracking
    this.setupFormTracking();
  }

  private setupFormTracking(): void {
    // Update state signal when form changes
    this.itemForm.valueChanges.subscribe(() => {
      this.formState.set({ ...this.itemForm.value, _timestamp: Date.now() });
    });

    this.itemForm.statusChanges.subscribe(() => {
      this.formState.set({ ...this.itemForm.value, _timestamp: Date.now() });
    });

    // Initial state
    this.formState.set({ ...this.itemForm.value, _timestamp: Date.now() });
  }

  private calculateGroupProgress(groupName: string): number {
    const group = this.fieldGroups[groupName as keyof typeof this.fieldGroups];
    if (!group) return 0;

    let groupScore = 0;
    let maxGroupScore = 0;

    // Required fields worth 3 points each
    group.requiredFields.forEach((fieldName) => {
      const control = this.itemForm.get(fieldName);
      maxGroupScore += 3;

      if (control?.value && control.value !== '' && control.value !== 0) {
        if (control.valid) {
          groupScore += 3;
        } else {
          groupScore += 1;
        }
      }
    });

    // Optional fields worth 1 point each
    group.optionalFields.forEach((fieldName) => {
      const control = this.itemForm.get(fieldName);
      maxGroupScore += 1;

      if (control?.value && control.value !== '' && control.value !== 0) {
        groupScore += 1;
      }
    });

    if (maxGroupScore === 0) return 100;
    return Math.round((groupScore / maxGroupScore) * 100);
  }

  isTabValid(tabName: string): boolean {
    const group = this.fieldGroups[tabName as keyof typeof this.fieldGroups];
    if (!group) return false;

    return group.requiredFields.every((fieldName) => {
      const control = this.itemForm.get(fieldName);
      return control?.valid && control.value && control.value !== '';
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.itemForm.get(fieldName);
    if (field?.errors && field.touched) {
      const errors = field.errors;

      // Common validation errors
      if (errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;

      // Item name specific errors
      if (errors['invalidItemName']) return 'Item name contains invalid characters';

      // Quantity specific errors
      if (errors['invalidNumber']) return 'Please enter a valid number';
      if (errors['zeroQuantity']) return 'Quantity must be greater than zero';
      if (errors['maxDecimalPlaces']) {
        const { max } = errors['maxDecimalPlaces'];
        return `Maximum ${max} decimal places allowed`;
      }

      // Min/Max errors with specific values
      if (errors['min']) {
        const { min, actual } = errors['min'];
        return `${this.getFieldDisplayName(fieldName)} must be at least ${min}`;
      }
      if (errors['max']) {
        const { max, actual } = errors['max'];
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${max}`;
      }

      // Length errors
      if (errors['minLength']) {
        const { requiredLength } = errors['minLength'];
        return `${this.getFieldDisplayName(
          fieldName
        )} must be at least ${requiredLength} characters`;
      }
      if (errors['maxLength']) {
        const { requiredLength } = errors['maxLength'];
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${requiredLength} characters`;
      }

      // Unit validation
      if (errors['invalidUnit']) {
        return 'Please select a valid unit';
      }

      // Location validation
      if (errors['invalidLocation']) {
        return 'Location contains invalid characters';
      }

      // Date validation
      if (errors['futureDate']) return errors['futureDate'].message;
      if (errors['tooOld']) return errors['tooOld'].message;
    }

    // Form-level validation errors - only show for relevant fields
    if (this.itemForm.errors && this.itemForm.touched) {
      if (this.itemForm.errors['minStockTooHigh']) {
        // Only show this error on the minStock field
        if (fieldName === 'minStock') {
          return 'Minimum stock level cannot be greater than or equal to current quantity';
        }
      }
    }

    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Item name',
      description: 'Description',
      category: 'Category',
      brand: 'Brand',
      model: 'Model',
      serialNumber: 'Serial number',
      condition: 'Condition',
      room: 'Room',
      location: 'Location',
      quantity: 'Quantity',
      unit: 'Unit',
      minStock: 'Minimum stock',
      purchaseDate: 'Purchase date',
      price: 'Purchase price',
      supplier: 'Supplier',
      warranty: 'Warranty',
      tags: 'Tags',
      notes: 'Notes',
      visibility: 'Visibility',
      sharedWith: 'Shared with',
    };

    return displayNames[fieldName] || fieldName;
  }

  getTabLabel(baseLabel: string, tabName: string): string {
    const progress = this.calculateGroupProgress(tabName);

    if (progress >= 100) return `✓ ${baseLabel}`;
    if (progress > 0) return `${baseLabel} (${progress}%)`;

    const group = this.fieldGroups[tabName as keyof typeof this.fieldGroups];
    const hasRequired = group?.requiredFields.length > 0;
    return hasRequired ? `${baseLabel} *` : baseLabel;
  }

  resetForm(): void {
    this.itemForm.reset();
    this.itemForm.patchValue({
      quantity: 1,
      unit: 'pieces',
      minStock: 0,
      price: 0,
      condition: 'NEW',
      isShared: false,
      visibility: 'private',
    });
  }

  markAllAsTouched(): void {
    this.itemForm.markAllAsTouched();
  }

  getFormData(): ItemFormData {
    return this.itemForm.value as ItemFormData;
  }

  isFormValid(): boolean {
    return this.itemForm.valid;
  }

  onTabChange(): void {
    // Trigger progress recalculation
    this.formState.set({ ...this.itemForm.value, _timestamp: Date.now() });
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.itemForm.errors) {
      if (this.itemForm.errors['minStockTooHigh']) {
        errors.push('Minimum stock level cannot be greater than or equal to current quantity');
      }
    }

    return errors;
  }

  hasFormErrors(): boolean {
    return this.getFormErrors().length > 0;
  }
}
