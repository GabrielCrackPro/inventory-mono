import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
}
