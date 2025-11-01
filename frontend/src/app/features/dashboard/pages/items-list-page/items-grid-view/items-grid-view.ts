import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Item } from '@features/item';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';

@Component({
  selector: 'hia-items-grid-view',
  imports: [CommonModule, RouterLink, ZardCardComponent, IconComponent],
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

  onCardClick(item: Item, evt: MouseEvent) {
    if (!this.selectMode) return;
    evt.preventDefault();
    evt.stopPropagation();
    const selected = !this.selectedIds.includes(item.id);
    this.toggleSelect.emit({ id: item.id, selected });
  }
}
