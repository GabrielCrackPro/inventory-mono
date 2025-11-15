import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardFormModule } from '@ui/form';
import { FormValidators } from '@lib/utils';
import { AccessService } from '@core/services/access';
import { ProfileService } from '@features/user';
import { PermissionService } from '@core/services/permission';
import { HouseService } from '@features/house/services/house';
import { HouseContextService } from '@features/house/services/house-context';
import {
  HouseAccessEntry,
  HouseAccessService,
  ShareHouseBody,
} from '@features/house/services/house-access';
import { ToastService } from '@shared/services';
import { ZardTabComponent, ZardTabGroupComponent } from '@ui/tabs';
import { SettingsGeneralTabComponent } from './components/general-tab';
import { SettingsInventoryTabComponent } from './components/inventory-tab';
import { SettingsPermissionsTabComponent } from './components/permissions-tab';

@Component({
  selector: 'hia-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ZardTabGroupComponent,
    ZardTabComponent,
    ReactiveFormsModule,
    ZardFormModule,
    SettingsGeneralTabComponent,
    SettingsInventoryTabComponent,
    SettingsPermissionsTabComponent,
  ],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly houseService = inject(HouseService);
  private readonly houseContext = inject(HouseContextService);
  private readonly houseAccess = inject(HouseAccessService);
  private readonly access = inject(AccessService);
  private readonly perms = inject(PermissionService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly profile = inject(ProfileService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isSavingGeneral = signal(false);
  readonly houseId = signal<number | null>(null);
  readonly members = signal<any[]>([]);
  readonly houseAccessLevel = signal<'VIEW' | 'EDIT' | 'ADMIN' | null>(null);
  readonly currentUserId = signal<number | null>(null);
  readonly rooms = signal<{ id: number; name: string }[]>([]);
  readonly inviteForm = this.fb.group({
    email: ['', FormValidators.email()],
    permission: ['VIEW', Validators.required],
  });
  readonly generalForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    address: [''],
  });
  readonly inventoryForm = this.fb.group({
    defaultVisibility: ['shared' as 'private' | 'shared' | 'public'],
    lowStockThreshold: [2, [Validators.min(0)]],
    defaultRoomId: ['' as string],
  });

  readonly isAdmin = computed(() => this.houseAccessLevel() === 'ADMIN');
  readonly canManage = computed(() => this.isAdmin());

  readonly onGeneralSubmitFn = () => this.onGeneralSubmit();
  readonly onInventorySubmitFn = () => this.onInventorySubmit();
  readonly isSelfFn = (userId: number) => this.isSelf(userId);
  readonly onInviteSubmitFn = () => this.onInviteSubmit();
  readonly onInvitePermissionChangeFn = (value: string) => this.onInvitePermissionChange(value);
  readonly onPermissionChangeFn = (userId: number, nextPermission: string) =>
    this.onPermissionChange(userId, nextPermission);
  readonly onRevokeFn = (userId: number) => this.onRevoke(userId);
  readonly onCancelInviteFn = (email: string) => this.onCancelInvite(email);

  ngOnInit() {
    const sel$ = this.houseService.getSelectedHouse();
    if (!sel$) return;
    this.isLoading.set(true);
    this.currentUserId.set(this.profile.getProfile()?.id ?? null);
    sel$.subscribe({
      next: (house) => {
        const id = (house as any)?.id as number;
        this.houseId.set(id);
        this.generalForm.patchValue({
          name: (house as any)?.name ?? '',
          address: (house as any)?.address ?? '',
        });

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

        this.houseService.getActiveHouseRooms().subscribe({
          next: (list: any[]) => {
            const simple = (list || []).map((r: any) => ({ id: r.id, name: r.name }));
            this.rooms.set(simple);
          },
          error: () => this.rooms.set([]),
        });

        this.loadInventoryPrefs(id);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error({ title: 'Failed to load house', message: 'Please select a house' });
      },
    });
  }

  visibilityOptions = [
    { label: 'Private', value: 'private' },
    { label: 'Household', value: 'shared' },
    { label: 'Public', value: 'public' },
  ];

  roomOptions = () => [
    { label: 'None', value: '' },
    ...this.rooms().map((r: { id: number; name: string }) => ({
      label: r.name,
      value: String(r.id),
    })),
  ];

  private inventoryKey(houseId: number) {
    return `house:${houseId}:inventory_prefs`;
  }

  private loadInventoryPrefs(houseId: number) {
    try {
      const raw = localStorage.getItem(this.inventoryKey(houseId));
      if (!raw) return;
      const prefs = JSON.parse(raw) as {
        defaultVisibility?: 'private' | 'shared' | 'public';
        lowStockThreshold?: number;
        defaultRoomId?: number | null;
      };
      this.inventoryForm.patchValue({
        defaultVisibility: prefs.defaultVisibility ?? 'shared',
        lowStockThreshold: prefs.lowStockThreshold ?? 2,
        defaultRoomId:
          prefs.defaultRoomId === null || prefs.defaultRoomId === undefined
            ? ''
            : String(prefs.defaultRoomId),
      });
    } catch {
      // ignore
    }
  }

  onInventorySubmit() {
    if (this.inventoryForm.invalid) {
      Object.values(this.inventoryForm.controls).forEach((c) => {
        c.markAsTouched();
        c.markAsDirty();
      });
      return;
    }
    const id = this.houseId();
    if (!id) return;
    const raw = this.inventoryForm.value as {
      defaultVisibility: 'private' | 'shared' | 'public';
      lowStockThreshold: number;
      defaultRoomId: string; // '' | numeric string
    };
    const toSave = {
      defaultVisibility: raw.defaultVisibility,
      lowStockThreshold: raw.lowStockThreshold,
      defaultRoomId: raw.defaultRoomId === '' ? null : Number(raw.defaultRoomId),
    } as {
      defaultVisibility: 'private' | 'shared' | 'public';
      lowStockThreshold: number;
      defaultRoomId: number | null;
    };
    try {
      localStorage.setItem(this.inventoryKey(id), JSON.stringify(toSave));
      this.toast.success({ title: 'Saved', message: 'Inventory preferences saved (local).' });
      // Notify the app so any views depending on inventory prefs (e.g., low-stock threshold) recompute
      this.houseContext.notifySelectedHouseChange(id);
    } catch (e) {
      this.toast.error({ title: 'Save failed', message: 'Could not persist preferences locally.' });
    }
  }

  onGeneralSubmit() {
    if (this.generalForm.invalid || this.isSavingGeneral()) {
      Object.values(this.generalForm.controls).forEach((c) => {
        c.markAsTouched();
        c.markAsDirty();
      });
      return;
    }
    const id = this.houseId();
    if (!id) return;
    const { name, address } = this.generalForm.value as { name: string; address?: string };
    this.isSavingGeneral.set(true);
    this.houseService
      .updateHouse(id, { name: name.trim(), address: address?.trim() || '' })
      .subscribe({
        next: () => {
          this.toast.success({ title: 'Saved', message: 'House settings updated.' });
          // Notify the app so any views depending on the active house refetch immediately
          this.houseContext.notifySelectedHouseChange(id);
          this.isSavingGeneral.set(false);
        },
        error: (err: any) => {
          this.toast.error({ title: 'Save failed', message: err?.message || 'Please try again.' });
          this.isSavingGeneral.set(false);
        },
      });
  }

  isSelf(targetUserId: number) {
    return this.currentUserId() != null && this.currentUserId() === targetUserId;
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
        // Optimistically add a pending row to the members table
        const pendingRow = {
          userId: -Date.now(),
          permission,
          user: undefined,
          email,
          pending: true,
        } as any;
        this.members.update((list) => [pendingRow, ...list]);
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

  onCancelInvite(email: string) {
    const houseId = this.houseId();
    if (!houseId) return;
    this.isSaving.set(true);
    this.houseAccess.cancelInvite(houseId, email).subscribe({
      next: () => {
        const list = this.members();
        const after = list.filter(
          (m: any) =>
            !(m.pending && (m.email ?? m.user?.email)?.toLowerCase?.() === email.toLowerCase())
        );
        this.members.set(after);
        this.toast.success({
          title: 'Invite canceled',
          message: `Invitation to ${email} was canceled.`,
        });
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toast.error({ title: 'Cancel failed', message: err?.message || 'Please try again.' });
        this.isSaving.set(false);
      },
    });
  }

  private loadMembers() {
    const id = this.houseId();
    if (!id) {
      this.isLoading.set(false);
      return;
    }
    this.houseAccess.list(id).subscribe({
      next: (entries) => {
        const sorted = [...entries].sort((a, b) => {
          const order = { ADMIN: 0, EDIT: 1, VIEW: 2 } as const;
          const pa = order[a.permission] ?? 99;
          const pb = order[b.permission] ?? 99;
          if (pa !== pb) return pa - pb;
          return (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email);
        });
        this.members.set(sorted);
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
