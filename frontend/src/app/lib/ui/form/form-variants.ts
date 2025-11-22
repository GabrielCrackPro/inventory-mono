import { cva, VariantProps } from 'class-variance-authority';

export const formFieldVariants = cva('grid gap-2');

export const formLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      zRequired: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      },
    },
  }
);

export const formControlVariants = cva('');

export const formMessageVariants = cva('text-sm', {
  variants: {
    zType: {
      default: 'text-muted-foreground',
      error: 'text-destructive',
      success: '[color:var(--chart-2)]',
      warning: '[color:var(--chart-3)]',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export type ZardFormFieldVariants = VariantProps<typeof formFieldVariants>;
export type ZardFormLabelVariants = VariantProps<typeof formLabelVariants>;
export type ZardFormControlVariants = VariantProps<typeof formControlVariants>;
export type ZardFormMessageVariants = VariantProps<typeof formMessageVariants>;
