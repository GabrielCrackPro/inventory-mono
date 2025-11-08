import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { commonIcons } from '@core/config/icon.config';
import { Item } from '@features/item';
import { ItemHelpers } from '@features/item/models/item';
import { ItemService } from '@features/item/services/item';
import { ZardInputDirective } from '@lib/ui/input/input';
import { ToastService, Z_MODAL_DATA } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { ZardCheckboxComponent } from '@ui/checkbox';
import { ZardDialogRef } from '@ui/dialog';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@ui/form';
import { ZardRadioComponent } from '@ui/radio';
import { ZardTabComponent, ZardTabGroupComponent } from '@ui/tabs/tabs.component';

@Component({
  selector: 'hia-share-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardCheckboxComponent,
    ZardRadioComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
  ],
  templateUrl: './share-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareModalComponent {
  private readonly _toastService = inject(ToastService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _fb = inject(FormBuilder);
  private readonly _itemService = inject(ItemService);

  readonly commonIcons = commonIcons;
  readonly data = inject(Z_MODAL_DATA) as { item: Item };

  readonly shareUrl = computed(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/dashboard/items/${this.data.item.id}`;
  });

  form = this._fb.group({
    visibility: [this.data.item.visibility, Validators.required],
    isShared: [this.data.item.isShared],
    sharedWith: [this.data.item.sharedWith?.join(', ') ?? ''],
  });

  isSaving = false;
  readonly isCopied = signal(false);

  copyLink(): void {
    const url = this.shareUrl();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.isCopied.set(true);
          setTimeout(() => this.isCopied.set(false), 1500);
          this._toastService.success({
            title: 'Link copied',
            message: 'Item link copied to clipboard',
          });
        })
        .catch(() => this._toastService.error({ title: 'Failed to copy link' }));
      return;
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 1500);
      this._toastService.success({
        title: 'Link copied',
        message: 'Item link copied to clipboard',
      });
    } catch {
      this._toastService.error({ title: 'Failed to copy link' });
    }
  }

  nativeShare(): void {
    const url = this.shareUrl();
    const item = this.data.item;
    const nav: any = navigator as any;
    if (nav && typeof nav.share === 'function') {
      nav
        .share({ title: item.name, text: 'Check out this item', url })
        .then(() => this._dialogRef.close())
        .catch(() => this._toastService.error({ title: 'Unable to share' }));
    } else {
      this.copyLink();
    }
  }

  onOk(): boolean | void {
    if (this.isSaving) return false as any;
    const raw = this.form.getRawValue();
    const sharedWith = (raw.sharedWith || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);

    const item = this.data.item;
    const noChange =
      item.visibility === raw.visibility &&
      item.isShared === !!raw.isShared &&
      JSON.stringify(item.sharedWith || []) === JSON.stringify(sharedWith);
    if (noChange) return;

    this.isSaving = true;
    const formData = ItemHelpers.itemToFormData(item);
    formData.visibility = raw.visibility as any;
    formData.isShared = !!raw.isShared;
    formData.sharedWith = sharedWith.join(', ');

    this._itemService.updateItem(String(item.id), formData).subscribe({
      next: () => {
        this.isSaving = false;
        this._toastService.success({ title: 'Sharing updated' });
        this._dialogRef.close({ success: true });
      },
      error: () => {
        this.isSaving = false;
        this._toastService.error({ title: 'Failed to update sharing' });
      },
    });
    return false as any;
  }
}
