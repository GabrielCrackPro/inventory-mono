import { Injectable, signal, computed } from '@angular/core';
import { NotificationFilter, Notification, NotificationType } from '@shared/models';
import { formatDateForGrouping } from '@lib/utils/time';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  private readonly _filter = signal<NotificationFilter>('all');

  readonly notifications = computed(() => this._notifications());
  readonly filter = computed(() => this._filter());

  readonly filteredNotifications = computed(() => {
    const notifications = this._notifications();
    const filter = this._filter();

    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'read':
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  });

  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);

  readonly groupedNotifications = computed(() => {
    const notifications = this.filteredNotifications();
    const groups = new Map<string, Notification[]>();

    notifications.forEach((notification) => {
      const date = this._formatDate(notification.timestamp);
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(notification);
    });

    return Array.from(groups.entries())
      .map(([date, notifications]) => ({
        date,
        notifications: notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      }))
      .sort((a, b) => {
        if (a.date === 'Today') return -1;
        if (b.date === 'Today') return 1;
        if (a.date === 'Yesterday') return -1;
        if (b.date === 'Yesterday') return 1;
        return a.date.localeCompare(b.date);
      });
  });

  constructor() {
    // Load mock notifications
    this._loadMockNotifications();
  }

  setFilter(filter: NotificationFilter) {
    this._filter.set(filter);
  }

  markAsRead(notificationId: string) {
    this._notifications.update((notifications) =>
      notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }

  markAllAsRead() {
    this._notifications.update((notifications) => notifications.map((n) => ({ ...n, read: true })));
  }

  deleteNotification(notificationId: string) {
    this._notifications.update((notifications) =>
      notifications.filter((n) => n.id !== notificationId)
    );
  }

  clearAll() {
    this._notifications.set([]);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: this._generateId(),
      timestamp: new Date(),
    };

    this._notifications.update((notifications) => [newNotification, ...notifications]);
  }

  private _formatDate(date: Date): string {
    return formatDateForGrouping(date);
  }

  private _generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private _loadMockNotifications() {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Low Stock Alert',
        message: 'Toilet Paper is running low (2 left)',
        type: NotificationType.WARNING,
        icon: 'TriangleAlert',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionUrl: '/dashboard/items',
        actionLabel: 'Restock',
      },
      {
        id: '2',
        title: 'Item Added',
        message: 'Wireless Headphones added to Living Room',
        type: NotificationType.SUCCESS,
        icon: 'CircleCheck',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
      },
      {
        id: '3',
        title: 'Room Shared',
        message: 'Kitchen has been shared with john@example.com',
        type: NotificationType.INFO,
        icon: 'ArrowRight',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
      },
      {
        id: '4',
        title: 'Backup Complete',
        message: 'Your inventory data has been backed up successfully',
        type: NotificationType.SUCCESS,
        icon: 'CircleCheck',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
      },
      {
        id: '5',
        title: 'Multiple Items Low',
        message: 'Milk and Batteries are running low',
        type: NotificationType.WARNING,
        icon: 'TriangleAlert',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: false,
        actionUrl: '/dashboard/items',
        actionLabel: 'View Items',
      },
    ];

    this._notifications.set(mockNotifications);
  }
}
