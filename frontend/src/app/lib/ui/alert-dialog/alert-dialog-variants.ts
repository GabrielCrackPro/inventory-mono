import { cva, VariantProps } from 'class-variance-authority';

export const alertDialogVariants = cva(
  'fixed inset-0 z-[10000] flex items-center justify-center p-4',
  {
    variants: {
      zType: {
        default: '',
        destructive: '',
        warning: '',
        info: '',
        success: '',
      },
    },
    defaultVariants: {
      zType: 'default',
    },
  }
);

export const alertDialogContainerVariants = cva(
  'relative w-full max-w-[calc(100%-2rem)] border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 shadow-2xl rounded-xl sm:max-w-lg transition-all duration-200',
  {
    variants: {
      zType: {
        default: 'border-border',
        destructive:
          'border-destructive/50 [&_[data-alert-title]]:text-destructive [&_[data-alert-icon]]:text-destructive',
        warning:
          '[border-color:color-mix(in_srgb,var(--chart-3)_50%,transparent)] [&_[data-alert-title]]:[color:var(--chart-3)] [&_[data-alert-icon]]:[color:var(--chart-3)]',
        info: '[border-color:color-mix(in_srgb,var(--chart-1)_50%,transparent)] [&_[data-alert-title]]:[color:var(--chart-1)] [&_[data-alert-icon]]:[color:var(--chart-1)]',
        success:
          '[border-color:color-mix(in_srgb,var(--chart-2)_50%,transparent)] [&_[data-alert-title]]:[color:var(--chart-2)] [&_[data-alert-icon]]:[color:var(--chart-2)]',
      },
    },
    defaultVariants: {
      zType: 'default',
    },
  }
);

export const alertDialogOverlayVariants = cva(
  'fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-200'
);

export const alertDialogContentVariants = cva('flex flex-col gap-6 p-6');

export const alertDialogHeaderVariants = cva('flex flex-col gap-3 text-center sm:text-left');

export const alertDialogTitleVariants = cva('text-lg font-semibold leading-tight');

export const alertDialogDescriptionVariants = cva('text-sm text-muted-foreground leading-relaxed');

export const alertDialogFooterVariants = cva(
  'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2'
);

export const alertDialogIconVariants = cva(
  'mx-auto flex h-12 w-12 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10',
  {
    variants: {
      zType: {
        default: 'bg-muted',
        destructive: 'bg-destructive/10',
        warning: '[background:color-mix(in_srgb,var(--chart-3)_15%,transparent)]',
        info: '[background:color-mix(in_srgb,var(--chart-1)_15%,transparent)]',
        success: '[background:color-mix(in_srgb,var(--chart-2)_15%,transparent)]',
      },
    },
    defaultVariants: {
      zType: 'default',
    },
  }
);

export type ZardAlertDialogVariants = VariantProps<typeof alertDialogVariants>;
