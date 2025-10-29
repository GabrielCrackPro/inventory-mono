import { IconName } from '@core/config';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  icon?: IconName;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export type NotificationFilter = 'all' | 'unread' | 'read';
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}
