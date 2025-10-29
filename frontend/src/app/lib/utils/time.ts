/**
 * Time formatting utilities for consistent date and time display across the application
 */

/**
 * Formats a date as a relative time string (e.g., "2m ago", "3h ago", "5d ago")
 * @param date - The date to format (string, number, or Date object)
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: string | number | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return then.toLocaleDateString();
}

/**
 * Formats a date for grouping purposes (e.g., "Today", "Yesterday", "2 days ago")
 * @param date - The date to format (string, number, or Date object)
 * @returns Formatted date string for grouping
 */
export function formatDateForGrouping(date: string | number | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== then.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formats a timestamp for notification display (e.g., "2:30 PM", "3h ago")
 * @param timestamp - The timestamp to format
 * @returns Formatted time string
 */
export function formatNotificationTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date as a full date string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export function formatFullDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Formats a date as a short date string
 * @param date - The date to format
 * @returns Short formatted date string (e.g., "Jan 15, 2024")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a time as a 12-hour time string
 * @param date - The date/time to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime12Hour(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a time as a 24-hour time string
 * @param date - The date/time to format
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTime24Hour(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday
 * @param date - The date to check
 * @returns True if the date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Gets the number of days between two dates
 * @param date1 - First date
 * @param date2 - Second date (defaults to now)
 * @returns Number of days between the dates
 */
export function getDaysDifference(date1: Date, date2: Date = new Date()): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
