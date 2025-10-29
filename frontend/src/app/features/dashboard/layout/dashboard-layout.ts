import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { IconName } from '@core/config';
import { StorageService } from '@core/services';
import { HeaderComponent } from '@features/layout';

import { LayoutModule, SidebarGroupComponent, SidebarGroupLabelComponent } from '@ui/layout';
import { ZardMenuModule } from '@ui/menu';
import { NavItemComponent } from '@ui/navigation';

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
    NavItemComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    RouterLinkWithHref,
  ],
  templateUrl: './dashboard-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  @ViewChild('sidebarNav', { static: true }) private readonly _navRef!: ElementRef<HTMLElement>;

  private readonly _storageService = inject(StorageService);

  private readonly _sidebarCollapsedKey = 'sidebar-collapsed';

  sidebarCollapsed = signal<boolean>(
    this._storageService.getItem(this._sidebarCollapsedKey) || false
  );

  hoverEffect = signal({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  leaveHover() {
    this._positionToActive();
  }

  items: MenuItem[] = [
    { icon: 'LayoutDashboard', label: 'Overview', to: '/' },
    { icon: 'Box', label: 'Items', to: 'items' },
    { icon: 'Warehouse', label: 'Rooms', to: 'rooms' },
    { icon: 'Settings', label: 'Settings', to: 'settings' },
  ];

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
    this._storageService.setItem(this._sidebarCollapsedKey, collapsed);
  }

  onCollapsedChangeAndReposition(collapsed: boolean) {
    this.onCollapsedChange(collapsed);
    this._positionToActive();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this._positionToActive(), 0);
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
    });
  }

  private _positionToActive() {
    const nav = this._navRef?.nativeElement;

    if (!nav) return;

    if (this.sidebarCollapsed()) {
      this.hoverEffect.update((state) => ({ ...state, visible: false }));
      return;
    }

    const active = nav.querySelector('[data-to] .active') as HTMLElement | null;

    if (active) {
      this.moveHover(new Event('hover'), active);
    } else {
      this.hoverEffect.update((state) => ({ ...state, visible: false }));
    }
  }
}
