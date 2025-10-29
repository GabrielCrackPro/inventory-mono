import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZardSkeletonComponent } from '@ui/skeleton';

@Component({
  selector: 'hia-home-skeleton',
  imports: [ZardSkeletonComponent],
  templateUrl: './home-skeleton.html',
  styleUrl: './home-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeSkeleton {}
