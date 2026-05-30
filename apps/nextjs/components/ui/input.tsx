import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input (Spec §6). Surface + Hairline, 44px Höhe, Fokus: Border --focus + 3px-Ring.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-md border border-line bg-surface px-[14px] text-body text-text transition-colors duration-150 ease-out',
          'placeholder:text-text-3',
          'focus:outline-none focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_25%,transparent)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
