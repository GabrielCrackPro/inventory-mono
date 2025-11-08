import { cva, VariantProps } from 'class-variance-authority';

export const quantityInputVariants = cva(
  'inline-flex items-center border rounded-md bg-background',
  {
    variants: {
      zSize: {
        sm: 'h-8',
        default: 'h-10',
        lg: 'h-12',
      },
      zStatus: {
        error: 'border-destructive focus-within:ring-destructive',
        warning: 'border-yellow-500 focus-within:ring-yellow-500',
        success: 'border-green-500 focus-within:ring-green-500',
      },
      zDisabled: {
        true: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      zSize: 'default',
    },
  }
);

export const quantityInputButtonVariants = cva(
  'inline-flex items-center justify-center border-0 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      zSize: {
        sm: 'h-8 w-8',
        default: 'h-10 w-8',
        lg: 'h-12 w-10',
      },
      zPosition: {
        left: 'rounded-l-md border-r',
        right: 'rounded-r-md border-l',
      },
    },
    defaultVariants: {
      zSize: 'default',
    },
  }
);

export const quantityInputFieldVariants = cva(
  'flex-1 text-center border-0 bg-transparent text-foreground font-medium focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
  {
    variants: {
      zSize: {
        sm: 'h-8 text-sm min-w-[3rem]',
        default: 'h-10 text-base min-w-[4rem]',
        lg: 'h-12 text-lg min-w-[5rem]',
      },
    },
    defaultVariants: {
      zSize: 'default',
    },
  }
);

export type ZardQuantityInputVariants = VariantProps<typeof quantityInputVariants>;
export type ZardQuantityInputButtonVariants = VariantProps<typeof quantityInputButtonVariants>;
export type ZardQuantityInputFieldVariants = VariantProps<typeof quantityInputFieldVariants>;
