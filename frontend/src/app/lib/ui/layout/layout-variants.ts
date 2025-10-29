import { cva, VariantProps } from 'class-variance-authority';

// Layout Variants
export const layoutVariants = cva('flex w-full min-h-0', {
  variants: {
    zDirection: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
      auto: 'flex-col',
    },
  },
  defaultVariants: {
    zDirection: 'auto',
  },
});
export type LayoutVariants = VariantProps<typeof layoutVariants>;

// Header Variants
export const headerVariants = cva(
  'sticky top-0 z-50 flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shrink-0 transition-all duration-200',
  {
    variants: {},
  }
);
export type HeaderVariants = VariantProps<typeof headerVariants>;

// Footer Variants
export const footerVariants = cva(
  'flex items-center px-6 bg-background border-t border-border shrink-0',
  {
    variants: {},
  }
);
export type FooterVariants = VariantProps<typeof footerVariants>;

// Content Variants
export const contentVariants = cva('flex-1 flex flex-col overflow-auto bg-background p-6');
export type ContentVariants = VariantProps<typeof contentVariants>;

// Sidebar Variants
export const sidebarVariants = cva(
  'relative flex flex-col h-full transition-all duration-300 ease-in-out border-r shrink-0 bg-card/50 backdrop-blur-sm text-card-foreground border-border/50 shadow-sm',
  {
    variants: {
      collapsed: {
        true: 'items-center',
        false: '',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

export const sidebarTriggerVariants = cva(
  'absolute -right-3 top-6 z-20 flex items-center justify-center cursor-pointer rounded-full border border-border bg-background hover:bg-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-6 h-6 shadow-md hover:shadow-lg hover:scale-105'
);

// Sidebar Group Variants
export const sidebarGroupVariants = cva('flex flex-col gap-1 mb-6');

export const sidebarGroupLabelVariants = cva(
  'flex h-8 shrink-0 items-center rounded-md px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider outline-hidden transition-all duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4 [&>svg]:shrink-0 mb-2',
  {
    variants: {
      collapsed: {
        true: 'opacity-0 h-0 mb-0 overflow-hidden',
        false: 'opacity-100',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

// Sidebar Header Variants
export const sidebarHeaderVariants = cva(
  'flex items-center gap-3 px-4 py-6 border-b border-border/50 mb-4',
  {
    variants: {
      collapsed: {
        true: 'justify-center px-2',
        false: 'justify-start',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

// Sidebar Footer Variants
export const sidebarFooterVariants = cva('mt-auto border-t border-border/50 pt-4 px-4 pb-6', {
  variants: {
    collapsed: {
      true: 'px-2',
      false: '',
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});
