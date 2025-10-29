import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeService } from '@shared/services/dark-mode';
import { ToastService } from '@shared/services/toast';
import { ZardToastComponent } from '@ui/toast';

@Component({
  selector: 'hia-root',
  imports: [RouterOutlet, ZardToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly _darkModeService = inject(DarkModeService);
  private readonly _toastService = inject(ToastService);

  toastConfig = this._toastService.config;

  ngOnInit(): void {
    this._darkModeService.initTheme();
  }
}
