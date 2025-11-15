import { Injectable, computed, inject, signal } from '@angular/core';
import { HouseContextService } from '@features/house/services/house-context';

export type DashboardWidgetId = 'stats' | 'recent' | 'stock' | 'activity' | 'graph';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  visible: boolean;
  zone?: 'main' | 'side';
}

export interface DashboardLayoutConfig {
  widgets: DashboardWidgetConfig[];
}

@Injectable({ providedIn: 'root' })
export class DashboardLayoutService {
  private readonly houseContext = inject(HouseContextService);
  private readonly _layout = signal<DashboardLayoutConfig | null>(null);

  readonly layout = computed(() => this._layout());

  private key(houseId: number) {
    return `house:${houseId}:dashboard_layout`;
  }

  private defaultLayout(): DashboardLayoutConfig {
    return {
      widgets: [
        { id: 'stats', label: 'Stats', visible: true, zone: 'main' },
        { id: 'recent', label: 'Recent Items', visible: true, zone: 'main' },
        { id: 'graph', label: 'Activity Graph', visible: true, zone: 'main' },
        { id: 'stock', label: 'Stock Alerts', visible: true, zone: 'side' },
        { id: 'activity', label: 'Recent Activity', visible: true, zone: 'side' },
      ],
    };
  }

  load(): DashboardLayoutConfig {
    const id = this.houseContext.currentSelectedHouseId();
    if (!id) {
      const def = this.defaultLayout();
      this._layout.set(def);
      return def;
    }
    try {
      const raw = localStorage.getItem(this.key(id));
      const parsed = raw ? (JSON.parse(raw) as DashboardLayoutConfig) : null;
      const allowed = new Set<DashboardWidgetId>(['stats', 'recent', 'stock', 'activity', 'graph']);
      const sanitized = parsed
        ? {
            widgets: (parsed.widgets || [])
              .filter((w: any) => allowed.has(w.id))
              .map((w: any) => ({
                id: w.id as DashboardWidgetId,
                label: String(w.label ?? w.id),
                visible: Boolean(w.visible),
                zone: (w.zone === 'side' ? 'side' : 'main') as 'main' | 'side',
              })),
          }
        : null;
      // Merge with defaults to include any missing widgets (e.g., newly added ones like 'graph')
      const defaults = this.defaultLayout();
      const ensureAll = (base: DashboardLayoutConfig): DashboardLayoutConfig => {
        const existingIds = new Set(base.widgets.map((w) => w.id));
        const missing = defaults.widgets.filter((d) => !existingIds.has(d.id));
        // append missing widgets at the end of their zones
        return { widgets: [...base.widgets, ...missing] };
      };
      const value = ensureAll(sanitized ?? defaults);
      this._layout.set(value);
      return value;
    } catch {
      const def = this.defaultLayout();
      this._layout.set(def);
      return def;
    }
  }

  save(next: DashboardLayoutConfig) {
    const id = this.houseContext.currentSelectedHouseId();
    this._layout.set(next);
    if (!id) return;
    try {
      localStorage.setItem(this.key(id), JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  reset() {
    const next = this.defaultLayout();
    this.save(next);
  }
}
