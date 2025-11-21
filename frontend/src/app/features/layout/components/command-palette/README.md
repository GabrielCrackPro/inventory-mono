# Command Palette Component

A standalone command palette component that displays navigation options and quick actions using the app's dialog system.

## Overview

The Command Palette is a modal dialog component that provides quick access to navigation and actions. It's opened by the Quick Search component and uses the app's `DialogService` for consistent modal behavior.

## Features

### 1. Dialog System Integration

- Uses `DialogService` for modal management
- Consistent with other modals in the app
- Proper overlay and backdrop handling
- ESC key support built-in
- Click outside to close

### 2. Command Interface

- Built with `z-command` components
- Fuzzy search and filtering
- Keyboard navigation (↑↓↵)
- Visual keyboard shortcuts display

### 3. Pre-configured Options

#### Navigation

- **Dashboard** (⌘D) → `/dashboard`
- **Items** (⌘I) → `/dashboard/items/list`
- **Rooms** (⌘R) → `/dashboard/rooms`
- **Settings** (⌘,) → `/dashboard/settings`

#### Actions

- **Add Item** (⌘N) → `/dashboard/items/new`
- **Add Room** → `/dashboard/rooms/new`

### 4. Rich Empty State

- Large search icon
- Helpful message
- Suggestion text

### 5. Keyboard Shortcuts Footer

- Visual guide for navigation
- Shows available shortcuts
- Consistent styling

## Usage

### Opened via DialogService

```typescript
import { DialogService } from '@shared/services';
import { CommandPaletteComponent } from '@features/layout';

// In your component
private readonly dialogService = inject(DialogService);

openCommandPalette(): void {
  const dialogRef = this.dialogService.create({
    zContent: CommandPaletteComponent,
    zSize: 'lg',
    zHideFooter: true,
    zClosable: true,
    zMaskClosable: true,
  });

  dialogRef.afterClosed()?.subscribe((result) => {
    if (result) {
      console.log('Selected:', result);
    }
  });
}
```

### Dialog Configuration

```typescript
{
  zContent: CommandPaletteComponent,  // The component to display
  zSize: 'lg',                        // Dialog size
  zHideFooter: true,                  // No OK/Cancel buttons
  zClosable: true,                    // Show close button
  zMaskClosable: true,                // Click outside to close
}
```

## Component Structure

### Template

```html
<z-command (zOnSelect)="onSelectOption($event)">
  <z-command-input placeholder="..." />

  <z-command-list>
    <!-- Navigation Group -->
    <div>Navigation</div>
    <z-command-option ... />

    <!-- Actions Group -->
    <div>Actions</div>
    <z-command-option ... />

    <!-- Empty State -->
    <z-command-empty>...</z-command-empty>
  </z-command-list>

  <!-- Footer with shortcuts -->
  <div>...</div>
</z-command>
```

### Dependencies

- `ZardCommandComponent` - Main command container
- `ZardCommandInputComponent` - Search input
- `ZardCommandListComponent` - Options list
- `ZardCommandOptionComponent` - Individual options
- `ZardCommandEmptyComponent` - Empty state
- `ZardDialogRef` - Dialog reference for closing
- `Router` - Navigation

## Methods

### `onSelectOption(option: ZardCommandOption)`

Handles option selection:

1. Routes to the selected page
2. Closes the dialog
3. Returns the selected option to the caller

## Integration with Quick Search

The Command Palette is opened by the Quick Search component:

```typescript
// quick-search.ts
openSearch(): void {
  const dialogRef = this.dialogService.create({
    zContent: CommandPaletteComponent,
    // ... config
  });

  dialogRef.afterClosed()?.subscribe((result) => {
    if (result) {
      this.onSearch.emit(result.label);
    }
  });
}
```

## Styling

All styling uses Tailwind CSS:

### Command List

```css
max-h-[60vh] overflow-y-auto p-2
```

### Group Headers

```css
px-2 py-2 text-xs font-semibold
text-muted-foreground uppercase tracking-wider
```

### Empty State

```css
py-12 text-center
```

### Footer

```css
border-t border-border px-4 py-3
text-xs text-muted-foreground bg-muted/30
flex items-center justify-between
```

## Extending

### Add New Navigation Options

```html
<z-command-option
  [zValue]="'custom-page'"
  [zLabel]="'Custom Page'"
  [zCommand]="'Navigate to custom page'"
  [zIcon]="'lucideIcon'"
  [zShortcut]="'⌘X'"
/>
```

### Add New Actions

```html
<z-command-option
  [zValue]="'custom-action'"
  [zLabel]="'Custom Action'"
  [zCommand]="'Perform custom action'"
  [zIcon]="'lucidePlus'"
/>
```

### Handle Custom Routes

```typescript
onSelectOption(option: ZardCommandOption): void {
  const value = option.value as string;

  switch (value) {
    case 'custom-page':
      this.router.navigate(['/custom']);
      break;
    // ... other cases
  }

  this.dialogRef.close(option);
}
```

## Benefits of Dialog System Integration

### 1. Consistency

- Same modal behavior as other dialogs
- Consistent overlay and backdrop
- Unified close behavior

### 2. Accessibility

- Built-in focus trap
- ESC key handling
- ARIA attributes
- Keyboard navigation

### 3. Maintainability

- Uses existing dialog infrastructure
- No custom modal code
- Easier to update and maintain

### 4. Features

- Click outside to close
- Scroll blocking
- Proper z-index management
- Animation support

## Comparison with Previous Implementation

### Before (Custom Modal)

- Custom backdrop and overlay
- Manual body scroll lock
- Custom click-outside handling
- Custom ESC key handling
- More code to maintain

### After (Dialog System)

- Uses `DialogService`
- Built-in scroll blocking
- Built-in click-outside
- Built-in ESC handling
- Less code, more consistent

## Performance

- **OnPush Change Detection**: Optimized re-renders
- **Lazy Loading**: Only loaded when opened
- **Dialog System**: Efficient overlay management
- **Command Components**: Debounced search

## Accessibility

- ✅ Focus trap within dialog
- ✅ ESC key to close
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast support

## Future Enhancements

- Recent searches
- Search history
- API integration for searching items/rooms
- Custom keyboard shortcuts
- Search analytics
- Category grouping
- Fuzzy matching improvements
