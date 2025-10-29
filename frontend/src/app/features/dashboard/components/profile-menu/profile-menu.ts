import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconName } from '@core/config';
import { AuthUser } from '@shared/models';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';
import { ZardMenuModule } from '@ui/menu';

interface MenuItem {
  icon?: IconName;
  label: string;
  to?: string;
}

@Component({
  selector: 'hia-profile-menu',
  imports: [ZardMenuModule, IconComponent, ZardButtonComponent, RouterLink],
  templateUrl: './profile-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  profile = input.required<AuthUser | null>();

  switchHouse = output<void>();
  logout = output<void>();

  menuItems = signal<MenuItem[]>([
    {
      label: 'Acount Settings',
      icon: 'User',
      to: 'settings/account',
    },
    {
      label: 'Prefrences',
      icon: 'Settings',
      to: 'settings',
    },
  ]);

  onSwitchHouse() {
    this.switchHouse.emit();
  }

  onLogout() {
    this.logout.emit();
  }
}
