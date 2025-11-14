import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardFormModule } from '@ui/form';
import { FormValidators } from '@lib/utils';
import { AccessService } from '@core/services/access';
import { PermissionService } from '@core/services/permission';
import { HouseService } from '@features/house/services/house';
import {
  HouseAccessEntry,
  HouseAccessService,
  ShareHouseBody,
} from '@features/house/services/house-access';
import { ToastService } from '@shared/services';
import { ZardCardComponent } from '@ui/card';
import { ZardInputDirective } from '@ui/input';
import { ZardSelectComponent, ZardSelectItemComponent } from '@ui/select';
import {
  ZardTableBodyComponent,
  ZardTableCaptionComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
} from '@ui/table';

@Component({
  selector: 'hia-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ReactiveFormsModule,
    ZardFormModule,
  ],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly houseService = inject(HouseService);
  private readonly houseAccess = inject(HouseAccessService);
  private readonly access = inject(AccessService);
  private readonly perms = inject(PermissionService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly houseId = signal<number | null>(null);
  readonly members = signal<HouseAccessEntry[]>([]);
  readonly houseAccessLevel = signal<'VIEW' | 'EDIT' | 'ADMIN' | null>(null);
  readonly inviteForm = this.fb.group({
    email: ['', FormValidators.email()],
    permission: ['VIEW', Validators.required],
  });

  readonly isAdmin = computed(() => this.houseAccessLevel() === 'ADMIN');

  ngOnInit() {
    const sel$ = this.houseService.getSelectedHouse();
    if (!sel$) return;
    this.isLoading.set(true);
    sel$.subscribe({
      next: (house) => {
        const id = (house as any)?.id as number;
        this.houseId.set(id);
        // Load effective access for this house
        this.access.getHouseAccess(id).subscribe({
          next: (acc) => {
            this.houseAccessLevel.set(acc.level);
            this.loadMembers();
          },
          error: () => {
            this.houseAccessLevel.set(null);
            this.loadMembers();
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error({ title: 'Failed to load house', message: 'Please select a house' });
      },
    });
  }

  onInviteSubmit() {
    if (this.inviteForm.invalid || this.isSaving()) {
      Object.keys(this.inviteForm.controls).forEach((k) => {
        const c = this.inviteForm.get(k);
        c?.markAsTouched();
        c?.markAsDirty();
      });
      return;
    }

    const houseId = this.houseId();
    if (!houseId) return;

    const rawEmail = this.inviteForm.value.email ?? '';
    const email = rawEmail.trim().toLowerCase();
    const permission = (this.inviteForm.value.permission as 'VIEW' | 'EDIT' | 'ADMIN') ?? 'VIEW';
    this.isSaving.set(true);
    this.houseAccess.invite(houseId, { email, permission }).subscribe({
      next: () => {
        this.toast.success({ title: 'Invite sent', message: `Invitation sent to ${email}.` });
        this.inviteForm.reset({ email: '', permission: 'VIEW' });
        this.isSaving.set(false);
      },
      error: (err: any) => {
        this.toast.error({ title: 'Invite failed', message: err?.message || 'Please try again.' });
        this.isSaving.set(false);
      },
    });
  }

  inviteMember() {
    this.onInviteSubmit();
  }

  onInvitePermissionChange(value: string) {
    this.inviteForm.get('permission')?.setValue((value as 'VIEW' | 'EDIT' | 'ADMIN') ?? 'VIEW');
  }

  private loadMembers() {
    const id = this.houseId();
    if (!id) {
      this.isLoading.set(false);
      return;
    }
    this.houseAccess.list(id).subscribe({
      next: (entries) => {
        this.members.set(entries);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error({ title: 'Failed to load members', message: 'Please try again.' });
        this.isLoading.set(false);
      },
    });
  }

  onPermissionChange(targetUserId: number, nextPermission: string) {
    this.isSaving.set(true);
    const id = this.houseId();
    if (!id) return;
    const body: ShareHouseBody = { userId: targetUserId, permission: nextPermission as any };
    this.houseAccess.upsert(id, body).subscribe({
      next: () => {
        const updated = this.members().map((m) =>
          m.userId === targetUserId ? { ...m, permission: body.permission } : m
        );
        this.members.set(updated);
        this.toast.success({
          title: 'Permission updated',
          message: 'House member access changed.',
        });
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toast.error({ title: 'Update failed', message: err?.message || 'Please try again.' });
        this.isSaving.set(false);
      },
    });
  }

  onRevoke(targetUserId: number) {
    const id = this.houseId();
    if (!id) return;
    this.isSaving.set(true);
    this.houseAccess.revoke(id, targetUserId).subscribe({
      next: () => {
        this.members.set(this.members().filter((m) => m.userId !== targetUserId));
        this.toast.success({ title: 'Access revoked' });
        this.isSaving.set(false);
      },
      error: () => {
        this.toast.error({ title: 'Revoke failed', message: 'Please try again.' });
        this.isSaving.set(false);
      },
    });
  }
}
