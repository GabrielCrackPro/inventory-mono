import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconName } from '@core/config';
import { DarkModeService } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';

@Component({
  selector: 'hia-theme-switcher',
  imports: [ZardButtonComponent],
  templateUrl: './theme-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  private _darkModeService = inject(DarkModeService);

  get currentTheme(): 'light' | 'dark' {
    return this._darkModeService.getCurrentTheme();
  }

  get themeIcon(): IconName {
    return this.currentTheme === 'dark' ? 'Sun' : 'Moon';
  }

  toggleTheme(): void {
    this._darkModeService.toggleTheme();
  }
}
