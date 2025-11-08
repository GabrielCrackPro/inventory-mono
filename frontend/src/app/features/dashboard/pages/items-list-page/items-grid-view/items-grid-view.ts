import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { commonIcons } from '@core/config/icon.config';
import { Item } from '@features/item';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ZardCheckboxComponent } from '@ui/checkbox';

@Component({
  selector: 'hia-items-grid-view',
  imports: [CommonModule, RouterLink, ZardCardComponent, IconComponent, ZardCheckboxComponent, TitleCasePipe],
  templateUrl: './items-grid-view.html',
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsGridViewComponent {
  @Input() items: Item[] = [];
  @Input() selectedIds: string[] = [];
  @Input() selectMode = false;
  @Output() toggleSelect = new EventEmitter<{ id: string; selected: boolean }>();
  @Output() toggleSelectAll = new EventEmitter<boolean>();
  
  readonly commonIcons = commonIcons;

  onCardClick(item: Item, evt: MouseEvent) {
    if (!this.selectMode) return;
    evt.preventDefault();
    evt.stopPropagation();
    const selected = !this.selectedIds.includes(item.id);
    this.toggleSelect.emit({ id: item.id, selected });
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    
    // Handle future dates
    if (diffMs < 0) return 'Just now';
    
    const diffInMinutes = Math.floor(diffMs / (1000 * 60));
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Less than 1 minute
    if (diffInMinutes < 1) return 'Just now';
    
    // Less than 1 hour
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    // Less than 24 hours
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    // Yesterday
    if (diffInDays === 1) return 'Yesterday';
    
    // Less than 7 days
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // Less than 30 days
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1w ago' : `${weeks}w ago`;
    }
    
    // More than 30 days - show actual date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
