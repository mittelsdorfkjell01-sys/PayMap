import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ScoreBar (Spec §6). 4px-Track in --line, Füllung monochrom in --text (nicht bunt),
 * Breite = Score%. Wert daneben als data-sm, optional Confidence-Punkt rechts.
 */
export interface ScoreBarProps {
  /** Score 0..max */
  value: number;
  max?: number;
  /** Sichtbarer Zahlenwert rechts (default: gerundeter value) */
  display?: React.ReactNode;
  /** Optionaler Slot rechts, z.B. <StatusDot/> */
  trailing?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function ScoreBar({
  value,
  max = 100,
  display,
  trailing,
  className,
  'aria-label': ariaLabel,
}: ScoreBarProps) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel}
      >
        <div className="h-full rounded-full bg-text" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-data-sm tabular text-text w-8 shrink-0 text-right">
        {display ?? Math.round(value)}
      </span>
      {trailing}
    </div>
  );
}
