import { animate, state, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  inject,
  NgModule,
  output,
  signal,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { ClassValue } from 'clsx';

import { generateId, mergeClasses } from '@lib/utils/merge-classes';
import { OnClickCallback } from '@shared/models';
import { AlertDialogService } from '@shared/services';
import { ZardButtonComponent } from '../button/button';
import { IconComponent } from '../icon';
import { ZardAlertDialogRef } from './alert-dialog-ref';
import {
  alertDialogVariants,
  alertDialogContainerVariants,
  alertDialogContentVariants,
  alertDialogHeaderVariants,
  alertDialogTitleVariants,
  alertDialogDescriptionVariants,
  alertDialogFooterVariants,
  alertDialogIconVariants,
  ZardAlertDialogVariants,
} from './alert-dialog-variants';
import { IconName } from '@core/config';
const noopFun = () => void 0;

export class ZardAlertDialogOptions<T> {
  zCancelText?: string | null;
  zClosable?: boolean;
  zContent?: string | TemplateRef<T> | Type<T>;
  zCustomClasses?: ClassValue;
  zData?: object;
  zDescription?: string;
  zIcon?: IconName;
  zMaskClosable?: boolean;
  zOkDestructive?: boolean;
  zOkDisabled?: boolean;
  zOkText?: string | null;
  zOnCancel?: EventEmitter<T> | OnClickCallback<T> = noopFun;
  zOnOk?: EventEmitter<T> | OnClickCallback<T> = noopFun;
  zTitle?: string | TemplateRef<T>;
  zType?: ZardAlertDialogVariants['zType'];
  zViewContainerRef?: ViewContainerRef;
  zWidth?: string;
}

@Component({
  selector: 'z-alert-dialog',
  exportAs: 'zAlertDialog',
  standalone: true,
  imports: [OverlayModule, PortalModule, ZardButtonComponent, A11yModule, IconComponent],
  template: `
    <div [class]="containerClasses()" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
      <div [class]="contentClasses()">
        <!-- Header with Icon and Text -->
        @if (config.zTitle || config.zDescription || config.zIcon) {
        <header [class]="headerClasses()">
          <div class="flex items-start gap-4 sm:items-center">
            @if (config.zIcon) {
            <div [class]="iconClasses()" data-alert-icon>
              <hia-icon [name]="config.zIcon" [size]="20" />
            </div>
            }
            <div class="flex-1">
              @if (config.zTitle) {
              <h2
                data-testid="z-alert-title"
                [id]="titleId()"
                [class]="titleClasses()"
                data-alert-title
              >
                {{ config.zTitle }}
              </h2>
              } @if (config.zDescription) {
              <p
                data-testid="z-alert-description"
                [id]="descriptionId()"
                [class]="descriptionClasses()"
              >
                {{ config.zDescription }}
              </p>
              }
            </div>
          </div>
        </header>
        }

        <!-- Content -->
        <main>
          <ng-template cdkPortalOutlet></ng-template>

          @if (isStringContent) {
          <div data-testid="z-alert-content" [innerHTML]="config.zContent"></div>
          }
        </main>

        <!-- Footer -->
        <footer [class]="footerClasses()">
          @if (config.zCancelText !== null) {
          <z-button
            zType="outline"
            [label]="config.zCancelText || 'Cancel'"
            (click)="onCancelClick()"
          />
          } @if (config.zOkText !== null) {
          <z-button
            [zType]="config.zOkDestructive ? 'destructive' : 'default'"
            [disabled]="config.zOkDisabled || false"
            [label]="config.zOkText || 'Continue'"
            (click)="onOkClick()"
          />
          }
        </footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[@alertDialogAnimation]': 'state()',
    '[style.width]': 'config.zWidth ? config.zWidth : null',
    role: 'alertdialog',
    '[attr.aria-modal]': 'true',
    '[attr.aria-labelledby]': 'titleId()',
    '[attr.aria-describedby]': 'descriptionId()',
  },
  animations: [
    trigger('alertDialogAnimation', [
      state('close', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('open', style({ opacity: 1, transform: 'scale(1)' })),
      transition('close => open', animate('200ms cubic-bezier(0.16, 1, 0.3, 1)')),
      transition('open => close', animate('150ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class ZardAlertDialogComponent<T> extends BasePortalOutlet {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly config = inject(ZardAlertDialogOptions<T>);

  protected readonly classes = computed(() =>
    mergeClasses(
      alertDialogVariants({
        zType: this.config.zType,
      }),
      this.config.zCustomClasses
    )
  );

  protected readonly containerClasses = computed(() =>
    alertDialogContainerVariants({ zType: this.config.zType })
  );
  protected readonly contentClasses = computed(() => alertDialogContentVariants());
  protected readonly headerClasses = computed(() => alertDialogHeaderVariants());
  protected readonly titleClasses = computed(() => alertDialogTitleVariants());
  protected readonly descriptionClasses = computed(() => alertDialogDescriptionVariants());
  protected readonly footerClasses = computed(() => alertDialogFooterVariants());
  protected readonly iconClasses = computed(() =>
    alertDialogIconVariants({ zType: this.config.zType })
  );

  private alertDialogId = generateId('alert-dialog');
  protected readonly titleId = computed(() =>
    this.config.zTitle ? `${this.alertDialogId}-title` : null
  );
  protected readonly descriptionId = computed(() =>
    this.config.zDescription ? `${this.alertDialogId}-description` : null
  );

  public alertDialogRef?: ZardAlertDialogRef<T>;

  protected readonly isStringContent = typeof this.config.zContent === 'string';

  readonly portalOutlet = viewChild.required(CdkPortalOutlet);

  okTriggered = output<void>();
  cancelTriggered = output<void>();
  state = signal<'close' | 'open'>('close');

  constructor() {
    super();
  }

  getNativeElement(): HTMLElement {
    return this.host.nativeElement;
  }

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this.portalOutlet()?.hasAttached()) {
      throw Error('Attempting to attach alert dialog content after content is already attached');
    }
    return this.portalOutlet()?.attachComponentPortal(portal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this.portalOutlet()?.hasAttached()) {
      throw Error('Attempting to attach alert dialog content after content is already attached');
    }

    return this.portalOutlet()?.attachTemplatePortal(portal);
  }

  onOkClick() {
    this.okTriggered.emit();
  }

  onCancelClick() {
    this.cancelTriggered.emit();
  }
}

@NgModule({
  imports: [
    ZardButtonComponent,
    ZardAlertDialogComponent,
    OverlayModule,
    PortalModule,
    A11yModule,
    IconComponent,
  ],
  providers: [AlertDialogService],
})
export class ZardAlertDialogModule {}
