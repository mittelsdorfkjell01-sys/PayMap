'use client';

/**
 * Slider (Spec §6). 2px-Track in --line, Füllung --accent links vom Thumb,
 * 16px-Thumb (--surface + 1px --line-strong). API unverändert (label/value/onChange).
 */
interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ label, value, min = 0, max = 100, onChange, className }: SliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-2">{label}</span>
        <span className="text-data-sm tabular text-text w-7 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className="slider-token"
        style={{
          background: `linear-gradient(to right, var(--accent) ${pct}%, var(--line) ${pct}%)`,
        }}
      />
    </div>
  );
}
