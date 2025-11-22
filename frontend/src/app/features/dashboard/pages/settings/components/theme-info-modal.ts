import { Component, inject } from '@angular/core';
import { ZardDialogRef } from '@ui/dialog';
import { ZardButtonComponent } from '@ui/button';
import { IconComponent } from '@ui/icon';

interface ThemeVariable {
  name: string;
  description: string;
  usage: string;
  category: string;
  example?: string;
}

@Component({
  selector: 'hia-theme-info-modal',
  standalone: true,
  imports: [ZardButtonComponent, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-3">
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          <hia-icon name="lucideBookOpen" [size]="24" />
          Theme Variables Guide
        </h2>
        <p class="text-sm text-muted-foreground">
          Understanding the CSS variables that control your app's appearance and how to use them
        </p>
        <div class="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p class="text-xs text-foreground">
            <strong>Tip:</strong> All variables use OKLCH color space for perceptually uniform
            colors and better color manipulation
          </p>
        </div>
      </div>

      <!-- Variables by Category -->
      <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
        @for(category of categories; track category) {
        <div class="space-y-3">
          <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <hia-icon [name]="getCategoryIcon(category)" [size]="20" />
            {{ category }}
          </h3>
          <div class="space-y-2">
            @for(variable of getVariablesByCategory(category); track variable.name) {
            <div
              class="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 rounded-md border-2 border-border shrink-0"
                  [style.background]="'var(' + variable.name + ')'"
                ></div>
                <div class="flex-1 space-y-2">
                  <div class="flex items-center gap-2">
                    <code
                      class="text-sm font-mono bg-muted px-2 py-1 rounded text-primary font-semibold"
                    >
                      {{ variable.name }}
                    </code>
                    @if(variable.example) {
                    <span class="text-xs text-muted-foreground">{{ variable.example }}</span>
                    }
                  </div>
                  <p class="text-sm text-foreground">{{ variable.description }}</p>
                  <div class="flex items-start gap-2">
                    <hia-icon
                      name="lucideSparkles"
                      [size]="14"
                      class="text-muted-foreground mt-0.5"
                    />
                    <p class="text-xs text-muted-foreground">{{ variable.usage }}</p>
                  </div>
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 pt-4 border-t border-border">
        <z-button zType="outline" label="Close" (click)="close()" />
      </div>
    </div>
  `,
})
export class ThemeInfoModalComponent {
  private readonly dialogRef = inject(ZardDialogRef);

  readonly categories = ['Core Colors', 'Interactive', 'Charts', 'Sidebar'];

  readonly variables: ThemeVariable[] = [
    {
      name: '--primary',
      description: 'Primary brand color used for main actions and highlights',
      usage: 'Primary buttons, links, active navigation items, brand elements',
      category: 'Core Colors',
      example: 'oklch(0.50 0.24 255)',
    },
    {
      name: '--primary-foreground',
      description: 'Text color that appears on primary colored backgrounds',
      usage: 'Button text, text on primary backgrounds',
      category: 'Core Colors',
    },
    {
      name: '--secondary',
      description: 'Secondary background color for less prominent elements',
      usage: 'Secondary buttons, subtle backgrounds',
      category: 'Core Colors',
    },
    {
      name: '--secondary-foreground',
      description: 'Text color for secondary backgrounds',
      usage: 'Text on secondary buttons and backgrounds',
      category: 'Core Colors',
    },
    {
      name: '--accent',
      description: 'Accent color for highlighting and emphasis',
      usage: 'Hover states, highlighted items, badges',
      category: 'Core Colors',
    },
    {
      name: '--accent-foreground',
      description: 'Text color for accent backgrounds',
      usage: 'Text on accent colored elements',
      category: 'Core Colors',
    },
    {
      name: '--ring',
      description: 'Focus ring color for keyboard navigation',
      usage: 'Focus indicators, accessibility outlines',
      category: 'Interactive',
    },
    {
      name: '--chart-1',
      description: 'Primary chart color for data visualization',
      usage: 'First data series in charts and graphs',
      category: 'Charts',
    },
    {
      name: '--chart-2',
      description: 'Secondary chart color',
      usage: 'Second data series in charts',
      category: 'Charts',
    },
    {
      name: '--chart-3',
      description: 'Tertiary chart color',
      usage: 'Third data series in charts',
      category: 'Charts',
    },
    {
      name: '--chart-4',
      description: 'Quaternary chart color',
      usage: 'Fourth data series in charts',
      category: 'Charts',
    },
    {
      name: '--chart-5',
      description: 'Quinary chart color',
      usage: 'Fifth data series in charts',
      category: 'Charts',
    },
    {
      name: '--sidebar-primary',
      description: 'Primary color for sidebar elements',
      usage: 'Active sidebar items, sidebar highlights',
      category: 'Sidebar',
    },
    {
      name: '--sidebar-accent',
      description: 'Accent color for sidebar backgrounds',
      usage: 'Sidebar hover states, secondary elements',
      category: 'Sidebar',
    },
    {
      name: '--sidebar-ring',
      description: 'Focus ring color for sidebar elements',
      usage: 'Sidebar focus indicators',
      category: 'Sidebar',
    },
  ];

  getVariablesByCategory(category: string): ThemeVariable[] {
    return this.variables.filter((v) => v.category === category);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Core Colors': 'lucidePalette',
      Interactive: 'lucideMousePointerClick',
      Charts: 'lucideBarChart3',
      Sidebar: 'lucidePanelLeft',
    };
    return icons[category] || 'lucideInfo';
  }

  close(): void {
    this.dialogRef.close();
  }
}
