import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TableCol } from '@features/dashboard';
import { ProfileService } from '@features/user';
import { Z_MODAL_DATA } from '@shared/services';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';

@Component({
  selector: 'hia-items-table-settings',
  imports: [ZardButtonComponent, DragDropModule, IconComponent],
  templateUrl: './items-table-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsTableSettingsComponent {
  private readonly _profileService = inject(ProfileService);

  data = inject(Z_MODAL_DATA);
  columns = computed<TableCol[]>(() => this.data.columns as TableCol[]);

  private visibility = signal<Record<string, boolean>>({});
  order = signal<string[]>([]);

  orderedColumns = computed<TableCol[]>(() => {
    const map = new Map(this.columns().map((c) => [c.key, c] as const));
    return this.order()
      .map((k) => map.get(k))
      .filter((c): c is TableCol => !!c);
  });

  constructor() {
    const initial: Record<string, boolean> = {};
    const cols = (this.data.columns as TableCol[]).filter(Boolean);
    cols.forEach((c: TableCol) => {
      if (!c) return;
      initial[c.key] = c.visible ?? true;
    });
    this.visibility.set(initial);
    this.order.set(cols.filter((c) => c.key !== 'select').map((c) => c.key));
  }

  isVisible(key: string): boolean {
    return this.visibility()[key] ?? true;
  }

  toggle(key: string, next: boolean): void {
    this.visibility.update((prev) => ({ ...prev, [key]: next }));
  }

  getHiddenKeys(): string[] {
    const v = this.visibility();
    return Object.keys(v).filter((k) => v[k] === false);
  }

  reset(): void {
    const next: Record<string, boolean> = {};
    this.columns().forEach((c) => {
      if (!c) return;
      next[c.key] = true;
    });
    this.visibility.set(next);
    const providedDefault: string[] | undefined = (this.data as any)?.defaultOrder;

    if (Array.isArray(providedDefault) && providedDefault.length) {
      this.order.set([...providedDefault]);
    } else {
      this.order.set(
        this.columns()
          .filter((c) => c.key !== 'select')
          .map((c) => c.key)
      );
    }
    const current = (this._profileService.getProfile() as any) ?? {};
    const prefs = { ...(current.preferences ?? {}) } as any;
    delete prefs.itemsColsOrder;
    this._profileService.updateProfile({ ...current, preferences: prefs });
  }

  drop(event: CdkDragDrop<string[]>): void {
    const arr = [...this.order()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.order.set(arr);
  }

  getOrder(): string[] {
    return this.order();
  }

  private getDefaultOrder(): string[] {
    const providedDefault: string[] | undefined = (this.data as any)?.defaultOrder;
    if (Array.isArray(providedDefault) && providedDefault.length) {
      return [...providedDefault];
    }
    return this.columns()
      .filter((c) => c.key !== 'select')
      .map((c) => c.key);
  }

  isOrderDefault(): boolean {
    const current = this.order();
    const baseline = this.getDefaultOrder();
    if (current.length !== baseline.length) return false;
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== baseline[i]) return false;
    }
    return true;
  }
}
