import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusDot (Spec §3.3). Confidence & Risiko werden NUR als 6px-Punkt + Caption
 * dargestellt — niemals als farbige Fläche. Tone steuert nur die Punktfarbe.
 */
type Tone = 'pos' | 'neutral' | 'warn' | 'neg';

const toneToColor: Record<Tone, string> = {
  pos: 'bg-pos',
  neutral: 'bg-text-2',
  warn: 'bg-warn',
  neg: 'bg-neg',
};

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  label?: React.ReactNode;
}

export function StatusDot({ tone = 'neutral', label, className, ...props }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} {...props}>
      <span
        aria-hidden
        className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', toneToColor[tone])}
      />
      {label != null && <span className="text-caption text-text-2">{label}</span>}
    </span>
  );
}

/** Confidence-Score → Tone + Label (Spec §3.3). */
export function confidenceTone(score: number): { tone: Tone; label: string } {
  if (score >= 90) return { tone: 'pos', label: 'verifiziert' };
  if (score >= 75) return { tone: 'neutral', label: 'berechnet' };
  if (score >= 50) return { tone: 'warn', label: 'geschätzt' };
  return { tone: 'neg', label: 'ungenau' };
}

/** Risiko-Level → Tone (Spec §3.3): low=pos, medium=warn, high=neg. */
export function riskTone(level: 'low' | 'medium' | 'high'): Tone {
  return level === 'low' ? 'pos' : level === 'medium' ? 'warn' : 'neg';
}
