import { Injectable, signal } from '@angular/core';
import {
  PromiseToastOptions,
  ToastConfig,
  ToastDefaultOptions,
  ToastOptionsWithoutType,
} from '@shared/models';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  config = signal<ToastConfig>({
    maxVisibleToasts: 5,
    useRichColors: true,
    expand: true,
  });

  info(options: ToastOptionsWithoutType): void {
    this._show({
      ...options,
      type: 'default',
    });
  }

  success(options: ToastOptionsWithoutType): void {
    this._show({
      ...options,
      type: 'success',
    });
  }

  warning(options: ToastOptionsWithoutType): void {
    this._show({
      ...options,
      type: 'warning',
    });
  }

  error(options: ToastOptionsWithoutType): void {
    this._show({
      ...options,
      type: 'error',
    });
  }

  loading(options: ToastOptionsWithoutType): void {
    this._show({
      ...options,
      type: 'loading',
    });
  }

  custom(component: any, options: ToastOptionsWithoutType) {
    toast.custom(component, options);
  }

  promise(promise: Promise<any>, options: PromiseToastOptions): void {
    toast.promise(promise, {
      ...options,
      success: (data) => options.onSuccess(data),
      error: (error) => options.onError(error),
    });
  }

  updateConfig(config: ToastConfig): void {
    this.config.set(config);
  }

  dismiss(id: string): void {
    toast.dismiss(id);
  }

  dismissAll(): void {
    toast.dismiss();
  }

  private _show(options: ToastDefaultOptions): void {
    const {
      type = 'default',
      title,
      message,
      position = 'top-right',
      action,
      dismissible = true,
      duration = 3000,
      closable = true,
    } = options;

    const tosatFnMap = {
      default: toast,
      success: toast.success,
      warning: toast.warning,
      error: toast.error,
      loading: toast.loading,
    };
    const toastFn = tosatFnMap[type] || tosatFnMap.default;

    toastFn(title!, {
      description: message,
      position,
      action,
      dismissible,
      duration,
      closeButton: closable,
    });
  }
}
