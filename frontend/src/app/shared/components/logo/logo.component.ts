import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '@lib/utils/merge-classes';

@Component({
  selector: 'hia-logo',
  standalone: true,
  template: `
    <div [class]="containerClasses()">
      <svg 
        [attr.width]="size()" 
        [attr.height]="size()" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        [class]="logoClasses()"
      >
        <defs>
          <!-- Theme-aware gradient for light mode -->
          <linearGradient [id]="'logoGradientLight-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#2563EB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
          </linearGradient>
          
          <!-- Theme-aware gradient for dark mode -->
          <linearGradient [id]="'logoGradientDark-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2563EB;stop-opacity:1" />
          </linearGradient>
          
          <!-- Light theme inner gradient -->
          <linearGradient [id]="'innerGradientLight-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0.05" />
          </linearGradient>
          
          <!-- Dark theme inner gradient -->
          <linearGradient [id]="'innerGradientDark-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.1" />
          </linearGradient>
          
          <!-- Light theme box gradient -->
          <linearGradient [id]="'boxGradientLight-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
            <stop offset="100%" style="stop-color:#F8FAFC;stop-opacity:0.85" />
          </linearGradient>
          
          <!-- Dark theme box gradient -->
          <linearGradient [id]="'boxGradientDark-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F1F5F9;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#E2E8F0;stop-opacity:0.8" />
          </linearGradient>
          
          <!-- Light theme shadow -->
          <filter [id]="'shadowLight-' + componentId" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
          </filter>
          
          <!-- Dark theme shadow -->
          <filter [id]="'shadowDark-' + componentId" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Main container with theme-aware styling -->
        <rect 
          x="2" y="2" width="36" height="36" rx="8" 
          class="fill-primary dark:fill-primary/90"
          [attr.filter]="'url(#shadowLight-' + componentId + ')'"
        />
        <rect 
          x="2" y="2" width="36" height="36" rx="8" 
          class="hidden dark:block"
          [attr.fill]="'url(#logoGradientDark-' + componentId + ')'"
          [attr.filter]="'url(#shadowDark-' + componentId + ')'"
        />
        <rect 
          x="2" y="2" width="36" height="36" rx="8" 
          class="dark:hidden"
          [attr.fill]="'url(#logoGradientLight-' + componentId + ')'"
          [attr.filter]="'url(#shadowLight-' + componentId + ')'"
        />
        
        <!-- Inner highlight for depth - theme aware -->
        <rect 
          x="3" y="3" width="34" height="34" rx="7" 
          class="dark:hidden"
          [attr.fill]="'url(#innerGradientLight-' + componentId + ')'" 
        />
        <rect 
          x="3" y="3" width="34" height="34" rx="7" 
          class="hidden dark:block"
          [attr.fill]="'url(#innerGradientDark-' + componentId + ')'" 
        />
        
        <!-- Modern inventory boxes with theme awareness -->
        <!-- Back box (subtle) -->
        <rect 
          x="11" y="13" width="9" height="7" rx="2" 
          class="dark:hidden"
          [attr.fill]="'url(#boxGradientLight-' + componentId + ')'" 
          opacity="0.4" 
          transform="rotate(-3 15.5 16.5)" 
        />
        <rect 
          x="11" y="13" width="9" height="7" rx="2" 
          class="hidden dark:block"
          [attr.fill]="'url(#boxGradientDark-' + componentId + ')'" 
          opacity="0.4" 
          transform="rotate(-3 15.5 16.5)" 
        />
        
        <!-- Middle box -->
        <rect 
          x="13" y="15" width="9" height="7" rx="2" 
          class="dark:hidden"
          [attr.fill]="'url(#boxGradientLight-' + componentId + ')'" 
          opacity="0.7" 
        />
        <rect 
          x="13" y="15" width="9" height="7" rx="2" 
          class="hidden dark:block"
          [attr.fill]="'url(#boxGradientDark-' + componentId + ')'" 
          opacity="0.7" 
        />
        
        <!-- Front box (main focus) -->
        <rect 
          x="15" y="17" width="9" height="7" rx="2" 
          class="dark:hidden"
          [attr.fill]="'url(#boxGradientLight-' + componentId + ')'" 
        />
        <rect 
          x="15" y="17" width="9" height="7" rx="2" 
          class="hidden dark:block"
          [attr.fill]="'url(#boxGradientDark-' + componentId + ')'" 
        />
        
        <!-- Modern box details with theme-aware colors -->
        <rect x="17" y="19" width="5" height="0.8" rx="0.4" class="fill-primary dark:fill-blue-400" opacity="0.7" />
        <rect x="17" y="21" width="3" height="0.8" rx="0.4" class="fill-primary dark:fill-blue-400" opacity="0.7" />
        <rect x="17" y="23" width="4" height="0.8" rx="0.4" class="fill-primary dark:fill-blue-400" opacity="0.7" />
        
        <!-- Dashboard indicator - theme-aware grid -->
        <circle cx="28" cy="12" r="3" class="fill-white dark:fill-slate-200" opacity="0.15" />
        <rect x="26.5" y="10.5" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="28" y="10.5" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="29.5" y="10.5" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="26.5" y="12" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="28" y="12" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="29.5" y="12" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="26.5" y="13.5" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="28" y="13.5" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
        <rect x="29.5" y="13.5" width="1" height="1" rx="0.2" class="fill-white dark:fill-slate-100" opacity="0.9" />
      </svg>
      
      @if (showText()) {
        <div [class]="textClasses()">
          <span class="font-bold text-foreground">Inventory</span>
          <span class="text-muted-foreground">Hub</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  readonly size = input<number>(40);
  readonly showText = input<boolean>(true);
  readonly variant = input<'default' | 'compact' | 'icon-only'>('default');
  readonly class = input<string>('');
  
  // Generate unique ID to avoid SVG conflicts when multiple logos are on the same page
  readonly componentId = Math.random().toString(36).substr(2, 9);

  readonly containerClasses = computed(() => {
    const variant = this.variant();
    const baseClasses = 'flex items-center';
    
    const variantClasses = {
      'default': 'gap-3',
      'compact': 'gap-2',
      'icon-only': 'justify-center'
    };

    return mergeClasses(
      baseClasses,
      variantClasses[variant],
      this.class()
    );
  });

  readonly logoClasses = computed(() => {
    return mergeClasses(
      'shrink-0 transition-transform hover:scale-105',
      'drop-shadow-sm'
    );
  });

  readonly textClasses = computed(() => {
    const variant = this.variant();
    
    const sizeClasses = {
      'default': 'text-lg',
      'compact': 'text-base',
      'icon-only': 'hidden'
    };

    return mergeClasses(
      'flex flex-col leading-tight',
      sizeClasses[variant]
    );
  });
}
