import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { IconName } from '@core/config/icon.config';

@Component({
  selector: 'hia-icon',
  standalone: true,
  imports: [NgIconComponent],
  template: `
    <ng-icon 
      [name]="resolvedName" 
      [size]="size + 'px'"
      [color]="color"
      [strokeWidth]="strokeWidth"
      [class]="className"
    ></ng-icon>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  /** The name of the icon to display */
  @Input() name!: IconName | string | undefined;
  /** Icon family to use when name is unprefixed */
  @Input() family: 'lucide' | 'mat' | 'tabler' | 'mat-outline' | 'svg' = 'lucide';
  
  /** Size of the icon in pixels */
  @Input() size: number = 24;
  
  /** Color of the icon (can be any valid CSS color value) */
  @Input() color: string = 'currentColor';
  
  /** Stroke width of the icon */
  @Input() strokeWidth: number | string = 2;
  
  /** Additional CSS classes to apply */
  @Input() className: string = '';
  
  /** Resolved icon name sent to NgIcon */
  get resolvedName(): string {
    const name = this.name as string;
    if (!name) return '';

    if (
      name.startsWith('lucide') ||
      name.startsWith('mat') ||
      name.startsWith('tabler') ||
      name.startsWith('svg')
    ) {
      return name;
    }

    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    switch (this.family) {
      case 'mat':
        return `mat${cap(name)}`;
      case 'tabler':
        return `tabler${cap(name)}`;
      case 'mat-outline':
        return `mat${cap(name)}Outline`;
      case 'svg':
        return `svg${cap(name)}`;
      case 'lucide':
      default:
        return `lucide${cap(name)}`;
    }
  }

  // For backward compatibility with the directive
  set iconName(value: IconName) { this.name = value; }
  set iconSize(value: number) { this.size = value; }
  set iconColor(value: string) { this.color = value; }
  set iconStrokeWidth(value: number | string) { this.strokeWidth = value; }
  set iconClass(value: string) { this.className = value; }
}
