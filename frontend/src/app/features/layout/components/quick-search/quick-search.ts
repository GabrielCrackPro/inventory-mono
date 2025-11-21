import { ChangeDetectionStrategy, Component, HostListener, inject, output } from '@angular/core';
import { DialogService } from '@shared/services';
import { ZardCommandOption } from '@ui/command';
import { CommandPaletteComponent } from '../command-palette';

@Component({
  selector: 'hia-quick-search',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Full-width Search Bar -->
    <div class="flex-1 max-w-2xl">
      <button
        type="button"
        (click)="openSearch()"
        class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm bg-muted/50 hover:bg-muted transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
        [attr.aria-label]="'Open search'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground group-hover:text-foreground transition-colors duration-200"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span
          class="flex-1 text-left text-muted-foreground group-hover:text-foreground transition-colors duration-200"
        >
          Search items, rooms, or navigate...
        </span>
        <kbd
          class="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-background rounded border border-border text-muted-foreground"
        >
          <span class="text-[10px]">⌘</span>K
        </kbd>
      </button>
    </div>
  `,
})
export class QuickSearchComponent {
  private readonly dialogService = inject(DialogService);

  readonly onSearch = output<string>();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  openSearch(): void {
    const dialogRef = this.dialogService.create({
      zContent: CommandPaletteComponent,
      zSize: 'lg',
      zHideFooter: true,
      zClosable: false,
      zMaskClosable: true,
    });

    dialogRef.afterClosed()?.subscribe((result: ZardCommandOption) => {
      if (result) {
        this.onSearch.emit(result.label);
      }
    });
  }
}
