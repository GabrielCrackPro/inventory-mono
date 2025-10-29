import { inject, Injectable } from '@angular/core';
import { ToastService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private _toastService = inject(ToastService);

  showError(message: string): void {
    this._toastService.error({
      title: 'Error',
      message,
      closable: false,
    });
  }
}
