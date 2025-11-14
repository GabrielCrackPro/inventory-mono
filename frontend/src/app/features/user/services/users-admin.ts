import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { UserRole } from '@inventory/shared';

export interface AdminUserListItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string | Date;
  updatedAt: string | Date;
}

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly api = inject(ApiService);

  listUsers() {
    return this.api.get<AdminUserListItem[]>('users');
  }

  updateUserRole(id: number, role: UserRole) {
    return this.api.patch<AdminUserListItem, { role: UserRole }>('users', id, { role });
  }
}
