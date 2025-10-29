/**
 * Notification types
 */
export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

/**
 * Toast types
 */
export type ToastType = "default" | "success" | "warning" | "error" | "loading";

/**
 * Toast positions
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Base notification interface
 */
export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

/**
 * Notification group for display
 */
export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

/**
 * Notification filter types
 */
export type NotificationFilter = "all" | "unread" | "read";

/**
 * Toast action interface
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

/**
 * Toast configuration
 */
export interface ToastConfig {
  maxVisibleToasts: number;
  useRichColors: boolean;
  position: ToastPosition;
}

/**
 * Toast options
 */
export interface ToastOptions {
  id?: string;
  title?: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
}

/**
 * Promise toast options
 */
export interface PromiseToastOptions extends Omit<ToastOptions, "type"> {
  loading?: string;
  onSuccess: (data: any) => any;
  onError: (error: any) => any;
}
