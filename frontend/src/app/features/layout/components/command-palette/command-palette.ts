import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { commonIcons } from '@core/config';
import { ZardDialogRef } from '@ui/dialog';
import {
  ZardCommandComponent,
  ZardCommandEmptyComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandOption,
  ZardCommandOptionComponent,
} from '@ui/command';

@Component({
  selector: 'hia-command-palette',
  standalone: true,
  imports: [
    ZardCommandComponent,
    ZardCommandInputComponent,
    ZardCommandListComponent,
    ZardCommandOptionComponent,
    ZardCommandEmptyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .command-group:not(:has(z-command-option:not([style*="display: none"]))) {
      display: none;
    }
  `,
  template: `
    <z-command (zOnSelect)="onSelectOption($event)" class="border-0 bg-transparent">
      <z-command-input [placeholder]="'Type a command or search...'" />

      <z-command-list class="max-h-[60vh] overflow-y-auto p-2 bg-transparent">
        <!-- Navigation Group -->
        <div class="command-group">
          <div
            class="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Navigation
          </div>
          <z-command-option
            [zValue]="'dashboard'"
            [zLabel]="'Dashboard'"
            [zCommand]="'Go to dashboard overview'"
            [zIcon]="commonIcons['dashboard']"
            [zShortcut]="'⌘D'"
          />
          <z-command-option
            [zValue]="'items'"
            [zLabel]="'Items'"
            [zCommand]="'View all items in your inventory'"
            [zIcon]="commonIcons['item']"
            [zShortcut]="'⌘I'"
          />
          <z-command-option
            [zValue]="'rooms'"
            [zLabel]="'Rooms'"
            [zCommand]="'View all rooms in your house'"
            [zIcon]="commonIcons['room']"
            [zShortcut]="'⌘R'"
          />
          <z-command-option
            [zValue]="'settings'"
            [zLabel]="'Settings'"
            [zCommand]="'Open application settings'"
            [zIcon]="commonIcons['settings']"
            [zShortcut]="'⌘,'"
          />
        </div>

        <!-- Actions Group -->
        <div class="command-group">
          <div
            class="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3"
          >
            Actions
          </div>
          <z-command-option
            [zValue]="'add-item'"
            [zLabel]="'Add Item'"
            [zCommand]="'Create a new item in your inventory'"
            [zIcon]="'lucidePlus'"
            [zShortcut]="'⌘N'"
          />
          <z-command-option
            [zValue]="'add-room'"
            [zLabel]="'Add Room'"
            [zCommand]="'Create a new room in your house'"
            [zIcon]="'lucidePlus'"
          />
        </div>

        <!-- Empty State -->
        <z-command-empty>
          <div class="py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mx-auto mb-4 text-muted-foreground/50"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p class="text-sm text-muted-foreground">No results found.</p>
            <p class="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
          </div>
        </z-command-empty>
      </z-command-list>

      <div
        class="border-t border-border/50 px-4 py-3 text-xs text-muted-foreground bg-transparent flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-background rounded border border-border">↑↓</kbd>
            Navigate
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-background rounded border border-border">↵</kbd>
            Select
          </span>
        </div>
        <span class="flex items-center gap-1.5">
          <kbd class="px-1.5 py-0.5 bg-background rounded border border-border">ESC</kbd>
          Close
        </span>
      </div>
    </z-command>
  `,
})
export class CommandPaletteComponent {
  private readonly router = inject(Router);
  private readonly dialogRef = inject(ZardDialogRef<CommandPaletteComponent>);

  protected readonly commonIcons = commonIcons;

  onSelectOption(option: ZardCommandOption): void {
    const value = option.value as string;

    // Navigate based on selection
    switch (value) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'items':
        this.router.navigate(['/dashboard/items/list']);
        break;
      case 'rooms':
        this.router.navigate(['/dashboard/rooms']);
        break;
      case 'settings':
        this.router.navigate(['/dashboard/settings']);
        break;
      case 'add-item':
        this.router.navigate(['/dashboard/items/new']);
        break;
      case 'add-room':
        this.router.navigate(['/dashboard/rooms/new']);
        break;
    }

    // Close the dialog
    this.dialogRef.close(option);
  }
}
