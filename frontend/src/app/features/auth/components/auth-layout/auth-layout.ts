import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@ui/button';
import { ZardCardComponent } from '@ui/card';
import { IconComponent } from '@ui/icon';
import { IconName } from '@core/config/icon.config';

export interface AuthLayoutConfig {
  title: string;
  subtitle: string;
  icon: IconName;
  alternateAction: {
    text: string;
    linkText: string;
    route: string;
  };
  footer?: {
    text: string;
  };
}

@Component({
  selector: 'hia-auth-layout',
  imports: [ZardCardComponent, ZardButtonComponent, IconComponent, RouterLink],
  templateUrl: './auth-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  readonly config = input.required<AuthLayoutConfig>();
}
