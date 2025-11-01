import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardSkeletonComponent } from '@ui/skeleton';

@Component({
  selector: 'hia-item-list-page-skeleton',
  imports: [CommonModule, ZardSkeletonComponent],
  templateUrl: './item-list-page-skeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListPageSkeletonComponent {
  // 'grid' | 'table'
  variant = input<'grid' | 'table'>('grid');
}
