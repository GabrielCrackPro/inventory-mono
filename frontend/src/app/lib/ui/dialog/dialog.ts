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

import { commonIcons } from '@core/config/icon.config';
import { mergeClasses } from '@lib/utils/merge-classes';
import { OnClickCallback } from '@shared/models';
import { DialogService } from '@shared/services';
import { ZardButtonComponent } from '../button/button';
import { IconComponent } from '../icon';
import { ZardDialogRef } from './dialog-ref';
import {
  dialogVariants,
  dialogContainerVariants,
  dialogHeaderVariants,
  dialogTitleVariants,
  dialogDescriptionVariants,
  dialogContentVariants,
  dialogFooterVariants,
  dialogCloseButtonVariants,
  ZardDialogVariants,
} from './dialog-variants';
import { IconName } from '@core/config';

const noopFun = () => void 0;
export class ZardDialogOptions<T, U> {
  zCancelIcon?: 'lucideX' | IconName;
  zCancelText?: string | null;
  zClosable?: boolean;
  zContent?: string | TemplateRef<T> | Type<T>;
  zCustomClasses?: string;
  zData?: U;
  zDescription?: string;
  zHideFooter?: boolean;
  zMaskClosable?: boolean;
  zOkDestructive?: boolean;
  zOkDisabled?: boolean;
  zOkIcon?: 'lucideCheck' | IconName;
  zOkText?: string | null;
  zOnCancel?: EventEmitter<T> | OnClickCallback<T> = noopFun;
  zOnOk?: EventEmitter<T> | OnClickCallback<T> = noopFun;
  zTitle?: string | TemplateRef<T>;
  zViewContainerRef?: ViewContainerRef;
  zWidth?: string;
  zSize?: ZardDialogVariants['size'];
}

@Component({
  selector: 'z-dialog',
  exportAs: 'zDialog',
  standalone: true,
  imports: [OverlayModule, PortalModule, ZardButtonComponent, IconComponent, A11yModule],
  template: `
    <div [class]="containerClasses()" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
      <div [class]="dialogContentClasses()">
        <!-- Close Button -->
        @if (config.zClosable || config.zClosable === undefined) {
        <button
          type="button"
          [class]="closeButtonClasses()"
          (click)="onCloseClick()"
          aria-label="Close dialog"
        >
          <hia-icon [name]="commonIcons['close']" [size]="16" />
        </button>
        }

        <!-- Header -->
        @if (config.zTitle || config.zDescription) {
        <header [class]="headerClasses()">
          @if (config.zTitle) {
          <h2 data-testid="z-title" [class]="titleClasses()" [id]="titleId()">
            {{ config.zTitle }}
          </h2>
          } @if (config.zDescription) {
          <p data-testid="z-description" [class]="descriptionClasses()" [id]="descriptionId()">
            {{ config.zDescription }}
          </p>
          }
        </header>
        }

        <!-- Content -->
        <main [class]="contentClasses()">
          <ng-template cdkPortalOutlet></ng-template>

          @if (isStringContent) {
          <div data-testid="z-content" [innerHTML]="config.zContent"></div>
          }
        </main>

        <!-- Footer -->
        @if (!config.zHideFooter) {
        <footer [class]="footerClasses()">
          @if (config.zCancelText !== null) {
          <z-button
            zType="outline"
            [iconName]="config.zCancelIcon"
            [label]="config.zCancelText || 'Cancel'"
            (click)="onCloseClick()"
          />
          } @if (config.zOkText !== null) {
          <z-button
            [zType]="config.zOkDestructive ? 'destructive' : 'default'"
            [disabled]="config.zOkDisabled || false"
            [iconName]="config.zOkIcon"
            [label]="config.zOkText || 'OK'"
            (click)="onOkClick()"
          />
          }
        </footer>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[@dialogAnimation]': 'state()',
    '[style.width]': 'config.zWidth ? config.zWidth : null',
    role: 'dialog',
    '[attr.aria-modal]': 'true',
    '[attr.aria-labelledby]': 'titleId()',
    '[attr.aria-describedby]': 'descriptionId()',
  },
  animations: [
    trigger('dialogAnimation', [
      state('close', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('open', style({ opacity: 1, transform: 'scale(1)' })),
      transition('close => open', animate('200ms cubic-bezier(0.16, 1, 0.3, 1)')),
      transition('open => close', animate('150ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class ZardDialogComponent<T, U> extends BasePortalOutlet {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly config = inject(ZardDialogOptions<T, U>);
  
  readonly commonIcons = commonIcons;

  protected readonly classes = computed(() =>
    mergeClasses(dialogVariants({ size: this.config.zSize }), this.config.zCustomClasses)
  );

  protected readonly containerClasses = computed(() => dialogContainerVariants());
  protected readonly dialogContentClasses = computed(() => 'p-6');
  protected readonly headerClasses = computed(() => dialogHeaderVariants());
  protected readonly titleClasses = computed(() => dialogTitleVariants());
  protected readonly descriptionClasses = computed(() => dialogDescriptionVariants());
  protected readonly contentClasses = computed(() => dialogContentVariants());
  protected readonly footerClasses = computed(() => dialogFooterVariants());
  protected readonly closeButtonClasses = computed(() => dialogCloseButtonVariants());

  private readonly dialogId = `dialog-${Math.random().toString(36).substr(2, 9)}`;
  protected readonly titleId = computed(() =>
    this.config.zTitle ? `${this.dialogId}-title` : null
  );
  protected readonly descriptionId = computed(() =>
    this.config.zDescription ? `${this.dialogId}-description` : null
  );

  public dialogRef?: ZardDialogRef<T>;

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

  // @ts-ignore
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this.portalOutlet()?.hasAttached()) {
      throw Error('Attempting to attach modal content after content is already attached');
    }
    // @ts-ignore
    return this.portalOutlet()?.attachComponentPortal(portal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this.portalOutlet()?.hasAttached()) {
      throw Error('Attempting to attach modal content after content is already attached');
    }

    return this.portalOutlet()?.attachTemplatePortal(portal);
  }

  onOkClick() {
    this.okTriggered.emit();
  }

  onCloseClick() {
    this.cancelTriggered.emit();
  }
}

@NgModule({
  imports: [
    ZardButtonComponent,
    ZardDialogComponent,
    OverlayModule,
    PortalModule,
    IconComponent,
    A11yModule,
  ],
  providers: [DialogService],
})
export class ZardDialogModule {}
