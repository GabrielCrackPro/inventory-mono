import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { UpdateUserData, User } from '@shared/models';
import { Observable } from 'rxjs';

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);

  updateUser(id: number, data: UpdateUserData): Observable<User> {
    return this.api.patch<User, UpdateUserData>('users', id, data);
  }

  changePassword(userId: number, data: ChangePasswordData): Observable<{ message: string }> {
    // TODO: Backend endpoint needs to be created at POST /api/users/:id/change-password
    // This should verify the current password and update to the new one
    // For now, this will return an error until the backend endpoint is implemented
    return this.api.postTo<{ message: string }, ChangePasswordData>(
      'users',
      `${userId}/change-password`,
      data
    );
  }
}
