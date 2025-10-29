import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StorageService, TokenService } from '@core/services';
import { AuthService } from '@features/auth';
import { NotificationCenterComponent, ProfileMenuComponent } from '@features/dashboard';
import { HouseSelectorComponent, HouseSwitcherComponent, UserHouse } from '@features/house';
import { ProfileService } from '@features/user';
import { AuthUser } from '@shared/models';
import { AlertDialogService, DialogService } from '@shared/services';
import { ZHeaderComponent } from '@ui/layout';
import { ZardMenuModule } from '@ui/menu';
import { ThemeSwitcherComponent } from '../theme-switcher';

@Component({
  selector: 'hia-header',
  imports: [
    ZHeaderComponent,
    ThemeSwitcherComponent,
    HouseSwitcherComponent,
    ProfileMenuComponent,
    NotificationCenterComponent,
    ZardMenuModule,
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly _authService = inject(AuthService);
  private readonly _tokenService = inject(TokenService);
  private readonly _storageService = inject(StorageService);
  private readonly _alertDialogService = inject(AlertDialogService);
  private readonly _profileService = inject(ProfileService);
  private readonly _dialogService = inject(DialogService);

  userProfile = computed(() => this._profileService.getProfile());

  onOpenHouseDialog() {
    const dialogRef = this._dialogService.create({
      zSize: 'md',
      zHideFooter: true,
      zMaskClosable: true,
      zContent: HouseSelectorComponent,
    });

    dialogRef.afterClosed()?.subscribe((selected: UserHouse) => {
      if (selected) {
        this._profileService.updateProfile({ ...this.userProfile(), selectedHouseId: selected.id });
      }
    });
  }

  logout() {
    this._alertDialogService.confirm({
      zTitle: 'Sign Out',
      zDescription: 'Are you sure you want to sign out of your account?',
      zIcon: 'LogOut',
      zType: 'destructive',
      zOkText: 'Sign Out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => this._handleLogout(),
    });
  }

  private _handleLogout() {
    this._authService
      .logout({
        id: this._storageService.getItem<AuthUser>('user')?.id ?? 0,
        jti: this._tokenService.getJti() ?? '',
        exp: 0,
      })
      .subscribe(() => {
        this._authService.logoutLocal();
      });
  }
}
