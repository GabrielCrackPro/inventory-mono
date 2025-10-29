import { inject, Injectable } from '@angular/core';
import { StorageService } from '@core/services';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private readonly storageKey = 'hia-theme';

  private _storageService = inject(StorageService);

  initTheme(): void {
    const savedTheme = this._storageService.getItem(this.storageKey);
    const isDark =
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.applyTheme(isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    this.applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this._storageService.getItem(this.storageKey) || 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const html = document.documentElement;
    const isDark = theme === 'dark';

    html.classList.toggle('dark', isDark);
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;

    this._storageService.setItem(this.storageKey, theme);
  }
}
