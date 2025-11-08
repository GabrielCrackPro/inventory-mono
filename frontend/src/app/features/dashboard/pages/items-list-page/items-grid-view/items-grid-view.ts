import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { commonIcons } from '@core/config/icon.config';
import { Item } from '@features/item';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { ZardCheckboxComponent } from '@ui/checkbox';

@Component({
  selector: 'hia-items-grid-view',
  imports: [CommonModule, RouterLink, ZardCardComponent, IconComponent, ZardCheckboxComponent],
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
}
