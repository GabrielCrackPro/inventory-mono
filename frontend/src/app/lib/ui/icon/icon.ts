import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { IconName } from '@core/config';
import { ClassValue } from 'clsx';
import { LucideAngularModule, LucideIconConfig } from 'lucide-angular';

@Component({
  selector: 'hia-icon',
  imports: [LucideAngularModule],
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnInit {
  name = input<IconName>();
  size = input<number>(24);
  color = input<string>('var(--color-primary)');
  strokeWidth = input<number>(2);
  absoluteStrokeWidth = input<boolean>(false);
  classNames = input<string>();

  private _lucideIconConfig = inject(LucideIconConfig);

  ngOnInit(): void {
    this._lucideIconConfig = {
      ...this._lucideIconConfig,
      strokeWidth: this.strokeWidth(),
      absoluteStrokeWidth: this.absoluteStrokeWidth(),
      size: this.size(),
      color: this.color(),
    };
  }
}
