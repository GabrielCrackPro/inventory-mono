import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { StorageService, TokenService } from '@core/services';
import { AuthService } from '@features/auth';
import { ProfileMenuComponent } from '@features/dashboard';
import { HouseSelectorComponent, HouseSwitcherComponent, UserHouse } from '@features/house';
import { ProfileService } from '@features/user';
import { AuthUser } from '@shared/models';
import { AlertDialogService, DialogService } from '@shared/services';
import { LogoComponent } from '@shared/components';
import { ZHeaderComponent } from '@ui/layout';
import { ZardMenuModule } from '@ui/menu';
import { ThemeSwitcherComponent } from '../theme-switcher';
import { HouseContextService } from '@features/house/services/house-context';

@Component({
  selector: 'hia-header',
  imports: [
    ZHeaderComponent,
    ThemeSwitcherComponent,
    HouseSwitcherComponent,
    ProfileMenuComponent,
    LogoComponent,
    ZardMenuModule,
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _tokenService = inject(TokenService);
  private readonly _storageService = inject(StorageService);
  private readonly _alertDialogService = inject(AlertDialogService);
  private readonly _profileService = inject(ProfileService);
  private readonly _dialogService = inject(DialogService);
  private readonly _houseContext = inject(HouseContextService);

  userProfile = computed(() => this._profileService.getProfile());

  ngOnInit(): void {
    // Initialize house context from profile on app start
    const id = this._profileService.getProfile()?.selectedHouseId ?? null;
    if (id) {
      this._houseContext.notifySelectedHouseChange(id);
    }
  }

  onOpenHouseDialog() {
    const dialogRef = this._dialogService.create({
      zSize: 'md',
      zHideFooter: true,
      zMaskClosable: true,
      zCancelIcon: 'lucideX',
      zOkIcon: 'lucideCheck',
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
      zIcon: 'lucideLogOut',
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
