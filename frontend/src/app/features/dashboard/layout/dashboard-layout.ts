import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { commonIcons, IconName } from '@core/config';
import { StorageService } from '@core/services';
import { HeaderComponent } from '@features/layout';
import { ProfileService } from '@features/user';
import { LogoComponent } from '@shared/components';
import { LayoutModule, SidebarGroupComponent, SidebarGroupLabelComponent } from '@ui/layout';
import { ZardMenuModule } from '@ui/menu';
import { NavItemComponent } from '@ui/navigation';
import { DashboardAlertsComponent } from '../components';

interface MenuItem {
  icon: IconName;
  label: string;
  to: string;
}

@Component({
  selector: 'hia-dashboard',
  imports: [
    LayoutModule,
    ZardMenuModule,
    RouterOutlet,
    HeaderComponent,
    LogoComponent,
    NavItemComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    DashboardAlertsComponent,
    RouterLinkWithHref,
  ],
  templateUrl: './dashboard-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent implements OnInit {
  @ViewChild('sidebarNav', { static: true }) private readonly _navRef!: ElementRef<HTMLElement>;

  private readonly _storageService = inject(StorageService);
  private readonly _router = inject(Router);
  private readonly _profileService = inject(ProfileService);

  private readonly _sidebarCollapsedKey = 'sidebar-collapsed';

  sidebarCollapsed = signal<boolean>(
    this._storageService.getItem(this._sidebarCollapsedKey) || false
  );

  // Track header pin state
  isHeaderPinned = signal<boolean>(true);

  hoverEffect = signal({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 1,
  });

  leaveHover() {
    this._positionToActive();
  }

  items: MenuItem[] = [
    { icon: commonIcons['dashboard'], label: 'Overview', to: '/' },
    { icon: commonIcons['item'], label: 'Items', to: 'items/list' },
    { icon: commonIcons['room'], label: 'Rooms', to: 'rooms' },
    { icon: commonIcons['settings'], label: 'Settings', to: 'settings' },
  ];

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
    this._storageService.setItem(this._sidebarCollapsedKey, collapsed);
  }

  onCollapsedChangeAndReposition(collapsed: boolean) {
    this.onCollapsedChange(collapsed);
    this._positionToActive();
  }

  ngOnInit(): void {
    // Load header pin state from profile or localStorage
    this._loadHeaderPinState();

    // Listen for storage changes to sync header pin state
    window.addEventListener('storage', (e) => {
      if (e.key === 'headerPinned' && e.newValue !== null) {
        this.isHeaderPinned.set(JSON.parse(e.newValue));
      }
    });
  }

  private _loadHeaderPinState(): void {
    // Try to load from user profile first
    const profile = this._profileService?.getProfile();
    const profilePinned = profile?.preferences?.['headerPinned'] as boolean | undefined;

    if (profilePinned !== undefined) {
      this.isHeaderPinned.set(profilePinned);
    } else {
      // Fallback to localStorage
      const pinned = this._storageService.getItem<boolean>('headerPinned');
      if (pinned !== null) {
        this.isHeaderPinned.set(pinned);
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this._positionToActive(), 0);
    // Reposition on route changes to reflect active link accurately
    this._router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        setTimeout(() => this._positionToActive(), 0);
      }
    });
  }

  moveHover(_: Event, el: HTMLElement) {
    if (this.sidebarCollapsed()) return;
    if (!el) return;

    const nav = this._navRef.nativeElement;
    const elRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    // Compute coords relative to nav
    const top = elRect.top - navRect.top + nav.scrollTop;
    const left = elRect.left - navRect.left;
    const width = elRect.width;
    const height = elRect.height;

    this.hoverEffect.set({
      visible: true,
      top,
      left,
      width,
      height,
      opacity: 1,
    });
  }

  private _positionToActive() {
    const nav = this._navRef?.nativeElement;

    if (!nav) return;

    if (this.sidebarCollapsed()) {
      this.hoverEffect.update((state) => ({ ...state, visible: false }));
      return;
    }

    // Find the active router link and then its container within a nav item
    const activeLink = nav.querySelector('a.active') as HTMLElement | null;
    const activeContainer = activeLink?.closest('[data-route]') as HTMLElement | null;

    const target = activeContainer ?? activeLink;
    if (!target) {
      this.hoverEffect.update((state) => ({ ...state, visible: false }));
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const top = rect.top - navRect.top + nav.scrollTop;
    const left = rect.left - navRect.left;
    const width = rect.width;
    const height = rect.height;

    this.hoverEffect.set({ visible: true, top, left, width, height, opacity: 1 });
  }
}
