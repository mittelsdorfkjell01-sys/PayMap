import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge / Pill (Spec §6). Flach, keine Farbflächen — bg-surface-sub + text-2.
 * Semantik-Varianten färben nur den Text, nie die Fläche.
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-1 text-caption transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-sub text-text-2',
        secondary: 'bg-surface-sub text-text-2',
        outline: 'border border-line text-text-2',
        pos: 'bg-surface-sub text-pos',
        warn: 'bg-surface-sub text-warn',
        neg: 'bg-surface-sub text-neg',
        // Rückwärtskompatibilität: alter destructive-Key -> neg
        destructive: 'bg-surface-sub text-neg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
