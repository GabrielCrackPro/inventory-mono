import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ZardButtonComponent } from '@ui/button';
import { ZardPopoverComponent, ZardPopoverDirective } from '@ui/popover';
import { Notification, NotificationFilter, NotificationType } from '@shared/models/notification';
import { Router } from '@angular/router';
import { IconComponent } from '@ui/icon';
import { IconName } from '@core/config';
import { NotificationService } from '@shared/services';
import { formatNotificationTime } from '@lib/utils/time';

@Component({
  selector: 'hia-notification-center',
  imports: [ZardPopoverComponent, ZardPopoverDirective, ZardButtonComponent, IconComponent],
  templateUrl: './notification-center.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent {
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);

  readonly notifications = computed(() => this._notificationService.groupedNotifications());
  readonly unreadCount = computed(() => this._notificationService.unreadCount());
  readonly filter = computed(() => this._notificationService.filter());
  readonly hasNotifications = computed(
    () => this._notificationService.filteredNotifications().length > 0
  );

  setFilter(filter: NotificationFilter) {
    this._notificationService.setFilter(filter);
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this._notificationService.markAsRead(notification.id);
    }
  }

  markAllAsRead() {
    this._notificationService.markAllAsRead();
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    this._notificationService.deleteNotification(notification.id);
  }

  clearAll() {
    this._notificationService.clearAll();
  }

  onNotificationClick(notification: Notification) {
    this.markAsRead(notification);

    if (notification.actionUrl) {
      this._router.navigate([notification.actionUrl]);
    }
  }

  getNotificationIcon(notification: Notification): IconName {
    if (notification.icon) {
      return notification.icon;
    }

    const notificationTypeMap: Record<NotificationType, IconName> = {
      [NotificationType.INFO]: 'Info',
      [NotificationType.SUCCESS]: 'CircleCheck',
      [NotificationType.WARNING]: 'TriangleAlert',
      [NotificationType.ERROR]: 'X',
    };

    return (notificationTypeMap[notification.type] as unknown as IconName) || 'Bell';
  }

  getNotificationColor(notification: Notification): string {
    const notificationTypeMap: Record<NotificationType, string> = {
      [NotificationType.INFO]: 'text-blue-600',
      [NotificationType.SUCCESS]: 'text-green-600',
      [NotificationType.WARNING]: 'text-amber-600',
      [NotificationType.ERROR]: 'text-red-600',
    };

    return notificationTypeMap[notification.type] || 'text-blue-600';
  }

  getNotificationBgColor(notification: Notification): string {
    const notificationTypeMap: Record<NotificationType, string> = {
      [NotificationType.INFO]: 'bg-blue-50 dark:bg-blue-950',
      [NotificationType.SUCCESS]: 'bg-geen-50 dark:bg-green-950',
      [NotificationType.WARNING]: 'bg-amber-50 dark:bg-amber-950',
      [NotificationType.ERROR]: 'bg-red-50 dark:bg-red-950',
    };

    return notificationTypeMap[notification.type];
  }

  formatTime(timestamp: Date): string {
    return formatNotificationTime(timestamp);
  }
}
