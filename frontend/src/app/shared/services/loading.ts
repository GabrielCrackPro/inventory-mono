import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _isLoading = signal<boolean>(false);

  get isLoading() {
    return this._isLoading.asReadonly();
  }

  beginLoad(): void {
    this._isLoading.set(true);
  }

  endLoad(): void {
    this._isLoading.set(false);
  }
}
