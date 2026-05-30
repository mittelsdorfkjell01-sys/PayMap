import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button (Spec §6). Near-black Akzent als Primary, kein Grün, kein Shadow,
 * keine Hover-Bewegung — nur Farb-/Border-Wechsel. Fokus: 3px --focus-Ring.
 */
const buttonVariants = cva(
  'focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-normal transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        // Primary — near-black ink
        default: 'bg-accent text-accent-fg hover:opacity-90',
        // Secondary — Surface + Hairline
        outline: 'bg-surface text-text border border-line hover:border-line-strong',
        secondary: 'bg-surface text-text border border-line hover:border-line-strong',
        // Ghost
        ghost: 'text-text-2 hover:text-text',
        // Destruktiv — gedämpftes Semantik-Rot, nur als Text/Border
        destructive: 'bg-surface text-neg border border-line hover:border-line-strong',
        // Link — die einzige Blau-Verwendung neben dem Fokusring
        link: 'text-focus underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-body',
        lg: 'h-12 px-5 text-body',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
