import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ZardButtonComponent } from '@ui/button';
import { ZardCheckboxComponent } from '@ui/checkbox/checkbox.component';
import { IconComponent } from '@ui/icon';
import { DashboardLayoutService, DashboardWidgetConfig } from '../../services/dashboard-layout';

@Component({
  selector: 'hia-customize-dashboard-modal',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, ZardCheckboxComponent, IconComponent],
  templateUrl: './customize-dashboard-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizeDashboardModalComponent implements OnInit {
  private readonly layoutService = inject(DashboardLayoutService);

  private readonly _widgets = signal<DashboardWidgetConfig[]>([]);
  widgets = computed(() => this._widgets());
  zones: Array<'main' | 'side'> = ['main', 'side'];

  private dragIndex: number | null = null;
  // Exposed to template for visual cues
  dragOverIndex: number | null = null;
  dragOverZone: 'main' | 'side' | null = null;
  isDragging = false;

  mainList = computed(() =>
    (this._widgets() || [])
      .map((w, index) => ({ w, index }))
      .filter((x) => (x.w.zone ?? 'main') === 'main')
  );
  sideList = computed(() =>
    (this._widgets() || [])
      .map((w, index) => ({ w, index }))
      .filter((x) => (x.w.zone ?? 'main') === 'side')
  );
  visibleCount = computed(() => this._widgets().filter((w) => w.visible).length);

  ngOnInit(): void {
    const current = this.layoutService.load();
    this._widgets.set([...current.widgets]);
  }

  toggleVisible(index: number, visible: boolean) {
    this._widgets.update((list) => {
      const next = [...list];
      next[index] = { ...next[index], visible };
      return next;
    });
  }

  moveUp(index: number) {
    if (index <= 0) return;
    this._widgets.update((list) => {
      const next = [...list];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  moveDown(index: number) {
    this._widgets.update((list) => {
      if (index >= list.length - 1) return list;
      const next = [...list];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }

  reset() {
    this.layoutService.reset();
    const fresh = this.layoutService.load();
    this._widgets.set([...fresh.widgets]);
  }

  getLayout() {
    return { widgets: this._widgets() };
  }

  changeZone(index: number, zone: 'main' | 'side') {
    this._widgets.update((list) => {
      const next = [...list];
      next[index] = { ...next[index], zone };
      return next;
    });
  }

  onZoneChange(index: number, event: Event) {
    const target = event.target as HTMLSelectElement | null;
    const value = (target?.value as 'main' | 'side') ?? 'main';
    this.changeZone(index, value);
  }

  // Drag and drop (HTML5) within list; supports reordering across different items
  onDragStart(index: number) {
    this.dragIndex = index;
    this.isDragging = true;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(overIndex: number) {
    if (this.dragIndex === null || this.dragIndex === overIndex) return;
    const from = this.dragIndex;
    this._widgets.update((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(overIndex, 0, moved);
      return next;
    });
    this.onDragEnd();
  }

  onDropZone(zone: 'main' | 'side') {
    if (this.dragIndex === null) return;
    const from = this.dragIndex;
    this._widgets.update((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      const z = zone;
      const withZone = { ...moved, zone: z } as DashboardWidgetConfig;
      const lastIndexInZone = (() => {
        let last = -1;
        next.forEach((it, idx) => {
          const iz = (it.zone ?? 'main') as 'main' | 'side';
          if (iz === z) last = idx;
        });
        return last;
      })();
      const insertAt = lastIndexInZone >= 0 ? lastIndexInZone + 1 : next.length;
      next.splice(insertAt, 0, withZone);
      return next;
    });
    this.onDragEnd();
  }

  onDropOverCard(zone: 'main' | 'side', overGlobalIndex: number) {
    if (this.dragIndex === null) return;
    const from = this.dragIndex;
    if (from === overGlobalIndex) return;
    this._widgets.update((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      const withZone = { ...moved, zone } as DashboardWidgetConfig;
      // Recompute target index if removal affected it
      let target = overGlobalIndex;
      if (from < overGlobalIndex) target = Math.max(0, target - 1);
      next.splice(target, 0, withZone);
      return next;
    });
    this.onDragEnd();
  }

  onDragEnterZone(zone: 'main' | 'side') {
    this.dragOverZone = zone;
    this.dragOverIndex = null;
  }

  onDragLeaveZone(zone: 'main' | 'side') {
    if (this.dragOverZone === zone) {
      this.dragOverZone = null;
    }
  }

  onDragEnterCard(zone: 'main' | 'side', overGlobalIndex: number) {
    this.dragOverZone = zone;
    this.dragOverIndex = overGlobalIndex;
  }

  onDragLeaveCard(zone: 'main' | 'side', overGlobalIndex: number) {
    if (this.dragOverZone === zone && this.dragOverIndex === overGlobalIndex) {
      this.dragOverIndex = null;
    }
  }

  onDragEnd() {
    this.dragIndex = null;
    this.dragOverIndex = null;
    this.dragOverZone = null;
    this.isDragging = false;
  }
}
