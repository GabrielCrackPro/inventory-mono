import { Component, OnChanges, SimpleChanges, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconName } from '@core/config/icon.config';
import { IconComponent as HiaIconComponent } from '@ui/icon';

type IconSet = 'lucide' | 'mat' | 'tabler' | 'mat-outline' | 'svg';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule, HiaIconComponent],
  template: `
    <hia-icon
      [name]="name()"
      [family]="iconSet()"
      [size]="size()"
      [color]="color() ?? 'var(--color-primary)'"
      [strokeWidth]="strokeWidth()"
      [class]="iconClass"
    />
  `,
  host: {
    class: 'inline-flex items-center justify-center',
    '[class.text-primary]': 'color() === "primary"',
    '[class.text-destructive]': 'color() === "destructive"',
    '[class.text-muted-foreground]': 'color() === "muted"',
  },
})
export class IconComponent implements OnChanges {
  readonly name = input<IconName | string>('');
  readonly size = input<number>(14);
  readonly color = input<'primary' | 'destructive' | 'muted' | string>();
  readonly class = input<string>();
  readonly strokeWidth = input<number | string>(2);
  readonly opacity70 = input<boolean>(false);
  readonly opacity80 = input<boolean>(false);
  readonly opacity90 = input<boolean>(false);
  readonly iconSet = input<IconSet>('lucide');

  iconClass = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['class']) {
      this.iconClass = this.class() || '';
    }
  }
}
