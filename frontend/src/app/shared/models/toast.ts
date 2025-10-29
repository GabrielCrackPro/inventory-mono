export type ToastType = 'default' | 'success' | 'warning' | 'error' | 'loading';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastConfig {
  maxVisibleToasts: number;
  useRichColors: boolean;
  expand: boolean;
}

export interface ToastDefaultOptions {
  title?: string;
  message?: string;
  position?: ToastPosition;
  action?: ToastAction;
  dismissible?: boolean;
  duration?: number;
  closable?: boolean;
  type?: ToastType;
}

export interface PromiseToastOptions extends ToastDefaultOptions {
  onSuccess: (data: any) => any;
  onError: (error: any) => any;
}

export type ToastOptions = Partial<ToastDefaultOptions>;
export type ToastOptionsWithoutType = Omit<ToastOptions, 'type'>;
