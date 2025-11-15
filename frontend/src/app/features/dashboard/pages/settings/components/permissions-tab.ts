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
        <div class="mb-4">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border shadow-sm"
            [class.bg-green-100]="isAdmin()"
            [class.text-green-800]="isAdmin()"
            [class.border-green-200/60]="isAdmin()"
            [class.dark:bg-green-900/30]="isAdmin()"
            [class.dark:text-green-300]="isAdmin()"
            [class.dark:border-green-800/40]="isAdmin()"
            [class.bg-amber-100]="!isAdmin() && accessLevel()==='EDIT'"
            [class.text-amber-800]="!isAdmin() && accessLevel()==='EDIT'"
            [class.border-amber-200/60]="!isAdmin() && accessLevel()==='EDIT'"
            [class.bg-slate-100]="accessLevel()==='VIEW'"
            [class.text-slate-800]="accessLevel()==='VIEW'"
            [class.border-slate-200/60]="accessLevel()==='VIEW'"
          >
            <span>Your access:</span>
            <span class="uppercase">{{ accessLevel() || 'NONE' }}</span>
          </span>
        </div>

        <div class="text-sm text-muted-foreground" *ngIf="!isAdmin()">
          You do not have access to manage roles.
        </div>

        <ng-container *ngIf="isAdmin()">
          <!-- Invite form -->
          <form class="flex flex-wrap items-end gap-3 mb-4" [formGroup]="inviteForm()" (ngSubmit)="inviteSubmit.emit()">
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
                <td z-table-cell>{{ m.user.id }}</td>
                <td z-table-cell>{{ m.user.name }}</td>
                <td z-table-cell>{{ m.user.email }}</td>
                <td z-table-cell>
                  <div class="max-w-44">
                    <z-select
                      [zPlaceholder]="'Select permission'"
                      [zValue]="m.permission"
                      (zSelectionChange)="permissionChange.emit({ userId: m.userId, permission: $event })"
                      [class]="'w-full'"
                      [zDisabled]="!isAdmin() || isSelf()(m.userId)"
                    >
                      <z-select-item [zValue]="'VIEW'">View</z-select-item>
                      <z-select-item [zValue]="'EDIT'">Edit</z-select-item>
                      <z-select-item [zValue]="'ADMIN'">Admin</z-select-item>
                    </z-select>
                  </div>
                </td>
                <td z-table-cell>
                  <z-button
                    zType="destructive"
                    [label]="'Revoke'"
                    [iconName]="commonIcons['delete']"
                    (click)="revoke.emit(m.userId)"
                    [disabled]="!isAdmin() || isSelf()(m.userId)"
                  />
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

  trackByUserId = (_: number, m: any) => m.userId;
  readonly commonIcons = commonIcons;
}
