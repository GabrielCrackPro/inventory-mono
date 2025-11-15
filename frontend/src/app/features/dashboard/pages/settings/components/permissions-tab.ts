import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ZardCardComponent } from '@ui/card';
import {
  ZardTableBodyComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
  ZardTableCellComponent,
  ZardTableComponent,
} from '@ui/table';
import { ZardSelectComponent, ZardSelectItemComponent } from '@ui/select';
import { ZardButtonComponent } from '@ui/button';
import { commonIcons } from '@core/config/icon.config';
import { ZardInputDirective } from '@ui/input';

@Component({
  selector: 'hia-settings-permissions-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardCardComponent,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardButtonComponent,
    ZardInputDirective,
  ],
  template: `
    <z-card zTitle="Permissions" zDescription="Admins can manage user roles for this workspace.">
      <div class="space-y-8">
        <div class="text-sm text-muted-foreground" *ngIf="!isAdmin()">
          You do not have access to manage roles.
        </div>

        <ng-container *ngIf="isAdmin()">
          <!-- Invite form -->
          <form
            class="flex flex-wrap items-end gap-3 mb-4"
            [formGroup]="inviteForm()"
            (ngSubmit)="inviteSubmit.emit()"
          >
            <div class="flex-1 min-w-64">
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                z-input
                type="email"
                class="w-full px-3 py-2 rounded-md border bg-transparent"
                formControlName="email"
                placeholder="user@example.com"
              />
            </div>

            <div class="w-44">
              <label class="block text-sm font-medium mb-1">Permission</label>
              <z-select
                [zPlaceholder]="'Select permission'"
                [zValue]="inviteForm().get('permission')?.value || 'VIEW'"
                (zSelectionChange)="invitePermissionChange.emit($event)"
                [class]="'w-full'"
              >
                <z-select-item [zValue]="'VIEW'">View</z-select-item>
                <z-select-item [zValue]="'EDIT'">Edit</z-select-item>
                <z-select-item [zValue]="'ADMIN'">Admin</z-select-item>
              </z-select>
            </div>

            <div>
              <z-button
                [label]="'Invite'"
                [iconName]="commonIcons['add']"
                type="submit"
                [disabled]="isSaving() || inviteForm().invalid || !inviteForm().dirty"
              />
            </div>
          </form>

          <table z-table class="w-full">
            <thead z-table-header>
              <tr z-table-row>
                <th z-table-head class="w-16">ID</th>
                <th z-table-head>Name</th>
                <th z-table-head>Email</th>
                <th z-table-head class="w-48">Permission</th>
                <th z-table-head class="w-28">Actions</th>
              </tr>
            </thead>
            <tbody z-table-body>
              <tr z-table-row *ngFor="let m of members(); trackBy: trackByUserId">
                <td z-table-cell>{{ m.user?.id || '-' }}</td>
                <td z-table-cell>
                  {{ m.user?.name || 'Invited User' }}
                  @if (m.pending) {
                  <span
                    class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40"
                    >Pending</span
                  >
                  }
                </td>
                <td z-table-cell>{{ m.user?.email || m.email }}</td>
                <td z-table-cell>
                  <div class="max-w-44">
                    @if (!m.pending) {
                    <z-select
                      [zPlaceholder]="'Select permission'"
                      [zValue]="m.permission"
                      (zSelectionChange)="
                        permissionChange.emit({ userId: m.userId, permission: $event })
                      "
                      [class]="'w-full'"
                      [zDisabled]="!isAdmin() || isSelf()(m.userId)"
                    >
                      <z-select-item [zValue]="'VIEW'">View</z-select-item>
                      <z-select-item [zValue]="'EDIT'">Edit</z-select-item>
                      <z-select-item [zValue]="'ADMIN'">Admin</z-select-item>
                    </z-select>
                    } @else {
                    <span class="text-xs text-muted-foreground uppercase">{{ m.permission }}</span>
                    }
                  </div>
                </td>
                <td z-table-cell>
                  @if (!m.pending) {
                  <z-button
                    zType="destructive"
                    [label]="'Revoke'"
                    [iconName]="commonIcons['delete']"
                    (click)="revoke.emit(m.userId)"
                    [disabled]="!isAdmin() || isSelf()(m.userId)"
                  />
                  } @else {
                  <z-button
                    zType="text"
                    iconClasses="text-destructive"
                    [iconName]="commonIcons['delete']"
                    (click)="cancelInvite.emit(m.email)"
                    [disabled]="!isAdmin()"
                  />
                  }
                </td>
              </tr>
              <tr z-table-row *ngIf="members().length === 0">
                <td z-table-cell colspan="5" class="text-center text-muted-foreground">
                  No members found
                </td>
              </tr>
            </tbody>
          </table>
        </ng-container>
      </div>
    </z-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPermissionsTabComponent {
  isAdmin = input.required<boolean>();
  accessLevel = input.required<'VIEW' | 'EDIT' | 'ADMIN' | null>();
  inviteForm = input.required<FormGroup>();
  members = input.required<any[]>();
  isSaving = input.required<boolean>();
  isSelf = input.required<(userId: number) => boolean>();

  // Events
  inviteSubmit = output<void>();
  invitePermissionChange = output<string>();
  permissionChange = output<{ userId: number; permission: string }>();
  revoke = output<number>();
  cancelInvite = output<string>();

  trackByUserId = (_: number, m: any) => m.userId;
  readonly commonIcons = commonIcons;
}
