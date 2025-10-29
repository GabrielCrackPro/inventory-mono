import { cva, VariantProps } from 'class-variance-authority';

export const alertDialogVariants = cva('fixed inset-0 z-50 flex items-center justify-center p-4', {
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
});

export const alertDialogContainerVariants = cva(
  'relative w-full max-w-[calc(100%-2rem)] border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 shadow-2xl rounded-xl sm:max-w-lg transition-all duration-200',
  {
    variants: {
      zType: {
        default: 'border-border',
        destructive:
          'border-destructive/50 [&_[data-alert-title]]:text-destructive [&_[data-alert-icon]]:text-destructive',
        warning:
          'border-amber-500/50 [&_[data-alert-title]]:text-amber-600 [&_[data-alert-icon]]:text-amber-500',
        info: 'border-blue-500/50 [&_[data-alert-title]]:text-blue-600 [&_[data-alert-icon]]:text-blue-500',
        success:
          'border-green-500/50 [&_[data-alert-title]]:text-green-600 [&_[data-alert-icon]]:text-green-500',
      },
    },
    defaultVariants: {
      zType: 'default',
    },
  }
);

export const alertDialogOverlayVariants = cva(
  'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200'
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
        warning: 'bg-amber-100 dark:bg-amber-900/20',
        info: 'bg-blue-100 dark:bg-blue-900/20',
        success: 'bg-green-100 dark:bg-green-900/20',
      },
    },
    defaultVariants: {
      zType: 'default',
    },
  }
);

export type ZardAlertDialogVariants = VariantProps<typeof alertDialogVariants>;
