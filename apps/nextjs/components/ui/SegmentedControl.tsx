'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * SegmentedControl (Spec §6). Aktives Feld bg-accent text-accent-fg, Rest ruhig.
 * Tastatur: Pfeiltasten wechseln die Auswahl (ARIA radiogroup-Pattern).
 */
export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label'?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  function handleKey(e: React.KeyboardEvent, idx: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (idx + dir + options.length) % options.length;
    onChange(options[next].value);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-md border border-line bg-surface p-0.5',
        className
      )}
    >
      {options.map((opt, idx) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={cn(
              'focus-ring rounded-[6px] px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
              active ? 'bg-accent text-accent-fg' : 'text-text-2 hover:text-text'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
