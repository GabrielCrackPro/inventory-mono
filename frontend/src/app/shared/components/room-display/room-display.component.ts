import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@ui/icon';
import { IconName } from '@core/config';

export interface RoomDisplayData {
  name: string;
  type: string;
  description?: string | null;
}

@Component({
  selector: 'hia-room-display',
  imports: [IconComponent],
  template: `
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center" [class]="iconBackground()">
        <hia-icon [name]="icon()" class="h-4 w-4" [class]="iconColor()" />
      </div>
      <div class="flex flex-col">
        <span class="font-medium">{{ room().name }}</span>
        @if (room().description) {
        <span class="text-xs text-muted-foreground">{{ room().description }}</span>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDisplayComponent {
  room = input.required<RoomDisplayData>();
  size = input<'sm' | 'md' | 'lg'>('md');

  icon = (): IconName => {
    const roomType = this.room().type;
    const icons: Record<string, IconName> = {
      kitchen: 'House',
      bedroom: 'House',
      bathroom: 'House',
      living: 'House',
      garage: 'Warehouse',
      basement: 'ChevronDown',
      attic: 'ChevronUp',
      office: 'House',
      dining: 'House',
      storage: 'Box',
      laundry: 'House',
      closet: 'House',
      general: 'House',
    };
    return icons[roomType] || 'House';
  };

  iconBackground = (): string => {
    const roomType = this.room().type;
    const backgrounds: Record<string, string> = {
      kitchen: 'bg-orange-100',
      bedroom: 'bg-blue-100',
      bathroom: 'bg-cyan-100',
      living: 'bg-green-100',
      garage: 'bg-gray-100',
      basement: 'bg-stone-100',
      attic: 'bg-amber-100',
      office: 'bg-purple-100',
      dining: 'bg-red-100',
      storage: 'bg-yellow-100',
      laundry: 'bg-indigo-100',
      closet: 'bg-pink-100',
      general: 'bg-slate-100',
    };
    return backgrounds[roomType] || 'bg-slate-100';
  };

  iconColor = (): string => {
    const roomType = this.room().type;
    const colors: Record<string, string> = {
      kitchen: 'text-orange-600',
      bedroom: 'text-blue-600',
      bathroom: 'text-cyan-600',
      living: 'text-green-600',
      garage: 'text-gray-600',
      basement: 'text-stone-600',
      attic: 'text-amber-600',
      office: 'text-purple-600',
      dining: 'text-red-600',
      storage: 'text-yellow-600',
      laundry: 'text-indigo-600',
      closet: 'text-pink-600',
      general: 'text-slate-600',
    };
    return colors[roomType] || 'text-slate-600';
  };
}
