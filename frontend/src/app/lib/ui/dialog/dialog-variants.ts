import { cva, VariantProps } from 'class-variance-authority';

export const dialogVariants = cva('fixed inset-0 z-50 flex items-center justify-center p-4', {
  variants: {
    size: {
      sm: '[&>div]:w-full [&>div]:max-w-[400px]',
      md: '[&>div]:w-full [&>div]:max-w-[500px]',
      lg: '[&>div]:w-full [&>div]:max-w-[600px]',
      xl: '[&>div]:w-full [&>div]:max-w-[800px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const dialogContainerVariants = cva(
  'relative grid w-full max-w-[calc(100%-2rem)] gap-6 border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 shadow-2xl rounded-xl transition-all duration-200 sm:max-w-[500px]'
);

export const dialogOverlayVariants = cva(
  'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200'
);

export const dialogHeaderVariants = cva(
  'flex flex-col space-y-2 text-center sm:text-left pb-4 border-b border-border/50'
);

export const dialogTitleVariants = cva(
  'text-xl font-semibold leading-none tracking-tight text-foreground'
);

export const dialogDescriptionVariants = cva('text-sm text-muted-foreground leading-relaxed');

export const dialogContentVariants = cva('flex flex-col space-y-4 py-4');

export const dialogFooterVariants = cva(
  'flex flex-col-reverse gap-3 pt-4 border-t border-border/50 sm:flex-row sm:justify-end sm:gap-2'
);

export const dialogCloseButtonVariants = cva(
  'absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
);

export type ZardDialogVariants = VariantProps<typeof dialogVariants>;
