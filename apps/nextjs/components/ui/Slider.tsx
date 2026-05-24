'use client';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ label, value, min = 0, max = 100, onChange, className }: SliderProps) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-on-surface-variant">{label}</span>
        <span className="text-xs font-bold text-on-surface tabular-nums w-7 text-right">{value}</span>
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
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
        style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
      />
    </div>
  );
}
