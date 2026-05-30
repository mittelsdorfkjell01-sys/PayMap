'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tabs (Spec §6). Aktiver Tab: text-text + 2px untere Border in --text.
 * Inaktiv: text-2. Hairline-Unterkante über die volle Breite. ARIA tablist.
 */
export interface TabItem<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label'?: string;
  className?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
}: TabsProps<T>) {
  function handleKey(e: React.KeyboardEvent, idx: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (idx + dir + items.length) % items.length;
    onChange(items[next].value);
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex items-center gap-6 border-b border-line', className)}
    >
      {items.map((item, idx) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={cn(
              'focus-ring -mb-px border-b-2 py-2.5 text-sm transition-colors duration-150 ease-out',
              active
                ? 'border-text text-text'
                : 'border-transparent text-text-2 hover:text-text'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
