import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { commonIcons } from '@core/config/icon.config';
import { IconComponent } from '@ui/icon';
import { ZardButtonComponent } from '@ui/button';
import { ZardCardComponent } from '@ui/card';
import { Location } from '@angular/common';

@Component({
  selector: 'hia-not-found',
  imports: [IconComponent, ZardButtonComponent, ZardCardComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly _router = inject(Router);
  
  readonly commonIcons = commonIcons;

  quickActions = [
    {
      label: 'Dashboard',
      description: 'Go back to your main dashboard',
      icon: 'LayoutDashboard' as const,
      route: '/dashboard',
      primary: true,
    },
    {
      label: 'Items',
      description: 'Manage your inventory items',
      icon: 'Box' as const,
      route: '/dashboard/items',
      primary: false,
    },
    {
      label: 'Rooms',
      description: 'Organize your rooms',
      icon: 'Warehouse' as const,
      route: '/dashboard/rooms',
      primary: false,
    },
    {
      label: 'Settings',
      description: 'Configure your preferences',
      icon: 'Settings' as const,
      route: '/dashboard/settings',
      primary: false,
    },
  ];

  navigateTo(route: string): void {
    this._router.navigate([route]);
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this._router.navigate(['/dashboard']);
  }

  refresh() {
    window.location.reload();
  }
}
