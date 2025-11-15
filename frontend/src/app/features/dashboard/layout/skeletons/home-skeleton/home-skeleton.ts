import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ZardSkeletonComponent } from '@ui/skeleton';
import { DashboardLayoutService } from '../../../services/dashboard-layout';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hia-home-skeleton',
  imports: [ZardSkeletonComponent, CommonModule],
  templateUrl: './home-skeleton.html',
  styleUrl: './home-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeSkeleton implements OnInit {
  private readonly _layout = inject(DashboardLayoutService);

  ngOnInit(): void {
    // Ensure layout is loaded when skeleton is shown
    if (!this._layout.layout()) {
      this._layout.load();
    }
  }

  // Get visible widgets from layout
  readonly widgets = computed(() => this._layout.layout()?.widgets ?? []);

  // Helper to check if a widget is visible
  show(widgetId: 'stats' | 'recent' | 'stock' | 'activity' | 'graph') {
    const w = this.widgets().find((x) => x.id === widgetId);
    return !!w?.visible;
  }

  // Get widgets by zone
  readonly mainWidgets = computed(() =>
    this.widgets().filter((w) => w.visible && w.zone === 'main')
  );

  readonly sideWidgets = computed(() =>
    this.widgets().filter((w) => w.visible && w.zone === 'side')
  );
}
