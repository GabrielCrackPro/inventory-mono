import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, TokenService } from '@core/services';
import { AuthService } from '@features/auth';
import { ProfileMenuComponent } from '@features/dashboard';
import { HouseSelectorComponent, HouseSwitcherComponent, UserHouse } from '@features/house';
import { ProfileService } from '@features/user';
import { AuthUser } from '@shared/models';
import { AlertDialogService, DialogService, ToastService } from '@shared/services';
import { LogoComponent } from '@shared/components';
import { ZHeaderComponent } from '@ui/layout';
import { ZardMenuModule } from '@ui/menu';
import { ThemeSwitcherComponent } from '../theme-switcher';
import { QuickSearchComponent } from '../quick-search';
import { HouseContextService } from '@features/house/services/house-context';

@Component({
  selector: 'hia-header',
  imports: [
    ZHeaderComponent,
    ThemeSwitcherComponent,
    QuickSearchComponent,
    HouseSwitcherComponent,
    ProfileMenuComponent,
    LogoComponent,
    ZardMenuModule,
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host(.header-pinned) z-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
    }
    
    :host(.header-unpinned) z-header {
      position: relative;
      z-index: 50;
    }
  `,
  host: {
    '[class.header-pinned]': 'isHeaderPinned()',
    '[class.header-unpinned]': '!isHeaderPinned()',
  },
})
export class HeaderComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _tokenService = inject(TokenService);
  private readonly _storageService = inject(StorageService);
  private readonly _alertDialogService = inject(AlertDialogService);
  private readonly _profileService = inject(ProfileService);
  private readonly _dialogService = inject(DialogService);
  private readonly _houseContext = inject(HouseContextService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);

  protected readonly isHouseDialogOpen = signal(false);
  protected readonly userProfile = computed(() => this._profileService.getProfile());
  protected readonly isHeaderPinned = signal(true);

  ngOnInit(): void {
    this._initializeHouseContext();
    this._loadHeaderPinState();
  }

  /**
   * Load header pin state from storage and database
   */
  private _loadHeaderPinState(): void {
    // Try to load from user profile first
    const profile = this.userProfile();
    const profilePinned = profile?.preferences?.['headerPinned'] as boolean | undefined;

    if (profilePinned !== undefined) {
      this.isHeaderPinned.set(profilePinned);
      // Sync to localStorage
      this._storageService.setItem('headerPinned', profilePinned);
    } else {
      // Fallback to localStorage
      const pinned = this._storageService.getItem<boolean>('headerPinned');
      if (pinned !== null) {
        this.isHeaderPinned.set(pinned);
      }
    }
  }

  /**
   * Toggle header pin state
   */
  toggleHeaderPin(): void {
    const newState = !this.isHeaderPinned();
    this.isHeaderPinned.set(newState);
    this._storageService.setItem('headerPinned', newState);

    // Save to database
    this._profileService.savePreferences({ headerPinned: newState }).subscribe({
      next: () => {
        console.log('Header pin state saved to database');
      },
      error: (error: any) => {
        console.error('Failed to save header pin state:', error);
      },
    });

    // Trigger storage event for same-window sync
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'headerPinned',
        newValue: JSON.stringify(newState),
        storageArea: localStorage,
      })
    );

    this._toastService.info({
      title: newState ? 'Header Pinned' : 'Header Unpinned',
      message: newState
        ? 'Header will stay visible when scrolling'
        : 'Header will scroll with content',
    });
  }

  /**
   * Initialize house context from user profile on app start
   */
  private _initializeHouseContext(): void {
    const selectedHouseId = this.userProfile()?.selectedHouseId;
    if (selectedHouseId) {
      this._houseContext.notifySelectedHouseChange(selectedHouseId);
    }
  }

  /**
   * Open house selector dialog
   */
  onOpenHouseDialog(): void {
    if (this.isHouseDialogOpen()) return;

    this.isHouseDialogOpen.set(true);

    const dialogRef = this._dialogService.create({
      zSize: 'md',
      zHideFooter: true,
      zMaskClosable: true,
      zCancelIcon: 'lucideX',
      zOkIcon: 'lucideCheck',
      zContent: HouseSelectorComponent,
    });

    dialogRef.afterClosed()?.subscribe({
      next: (selected: UserHouse) => {
        if (selected && this.userProfile()) {
          this._updateSelectedHouse(selected.id);
        }
        this.isHouseDialogOpen.set(false);
      },
      error: () => {
        this.isHouseDialogOpen.set(false);
      },
    });
  }

  /**
   * Update selected house in user profile
   */
  private _updateSelectedHouse(houseId: number): void {
    const currentProfile = this.userProfile();
    if (currentProfile) {
      this._profileService.updateProfile({
        ...currentProfile,
        selectedHouseId: houseId,
      });
    }
  }

  /**
   * Handle user logout with confirmation
   */
  logout(): void {
    this._alertDialogService.confirm({
      zTitle: 'Sign Out',
      zDescription: 'Are you sure you want to sign out of your account?',
      zIcon: 'lucideLogOut',
      zType: 'destructive',
      zOkText: 'Sign Out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => this._performLogout(),
    });
  }

  /**
   * Perform the actual logout operation
   */
  private _performLogout(): void {
    const user = this._storageService.getItem<AuthUser>('user');
    const jti = this._tokenService.getJti();

    if (!user?.id || !jti) {
      this._authService.logoutLocal();
      return;
    }

    this._authService
      .logout({
        id: user.id,
        jti,
        exp: 0,
      })
      .subscribe({
        next: () => {
          this._authService.logoutLocal();
        },
        error: () => {
          this._authService.logoutLocal();
        },
      });
  }

  /**
   * Handle search query from quick search component
   */
  handleSearch(query: string): void {
    if (!query.trim()) return;

    // Show search feedback
    this._toastService.info({
      title: 'Search',
      message: `Searching for: ${query}`,
    });

    // TODO: Implement actual search functionality
    // Example: Navigate to search results page
    // this._router.navigate(['/dashboard/search'], { queryParams: { q: query } });
  }

  /**
   * Open search on mobile devices
   */
  openMobileSearch(): void {
    // Trigger keyboard shortcut to open search modal
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }
}
