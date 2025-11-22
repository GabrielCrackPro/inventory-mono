import { cva, VariantProps } from 'class-variance-authority';

export const alertVariants = cva('relative flex gap-2 w-full rounded-lg p-4', {
  variants: {
    zType: {
      default: 'dark:data-[appearance="soft"]:text-zinc-800 data-[appearance="fill"]:text-white',
      info: '[color:var(--chart-1)] data-[appearance="fill"]:text-white',
      success: '[color:var(--chart-2)] data-[appearance="fill"]:text-white',
      warning: '[color:var(--chart-3)] data-[appearance="fill"]:text-white',
      error: 'text-destructive data-[appearance="fill"]:text-white',
    },
    zAppearance: {
      outline:
        'border data-[type="info"]:[border-color:var(--chart-1)] data-[type="success"]:[border-color:var(--chart-2)] data-[type="warning"]:[border-color:var(--chart-3)] data-[type="error"]:border-destructive',
      soft: 'bg-zinc-100 data-[type="info"]:[background:color-mix(in_srgb,var(--chart-1)_10%,transparent)] data-[type="success"]:[background:color-mix(in_srgb,var(--chart-2)_10%,transparent)] data-[type="warning"]:[background:color-mix(in_srgb,var(--chart-3)_10%,transparent)] data-[type="error"]:bg-destructive/10',
      fill: 'bg-zinc-500 data-[type="info"]:[background:var(--chart-1)] data-[type="success"]:[background:var(--chart-2)] data-[type="warning"]:[background:var(--chart-3)] data-[type="error"]:bg-destructive',
    },
  },
  defaultVariants: {
    zType: 'default',
    zAppearance: 'outline',
  },
});
export type ZardAlertVariants = VariantProps<typeof alertVariants>;
