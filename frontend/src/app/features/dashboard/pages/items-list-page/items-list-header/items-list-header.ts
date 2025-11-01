import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@ui/button';
import { ZardSegmentedComponent } from '@ui/segmented';

@Component({
  selector: 'hia-items-list-header',
  imports: [CommonModule, ZardButtonComponent, ZardSegmentedComponent],
  templateUrl: './items-list-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListHeaderComponent {
  itemsCount = input<number>(0);
  selectedCount = input<number>(0);
  selectMode = input<boolean>(false);
  viewOptions = input<any[]>([]);
  defaultView = input<'grid' | 'table'>('grid');
  tableActions = input<any[]>([]);
  showSettings = input<boolean>(false);

  readonly toggleSelectMode = output<void>();
  readonly changeViewMode = output<string>();
  readonly settingsClick = output<void>();

  onToggleSelectMode(): void {
    this.toggleSelectMode.emit();
  }

  onChangeViewMode(mode: string): void {
    this.changeViewMode.emit(mode);
  }

  onSettingsClick(): void {
    this.settingsClick.emit();
  }
}
