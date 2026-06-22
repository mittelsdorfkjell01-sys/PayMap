interface Segment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  /** Big label rendered in the center (e.g. "38.9%") */
  centerLabel?: string;
  size?: number;
  thickness?: number;
  /** Gap between segments, in degrees. */
  gapDeg?: number;
}

export default function DonutChart({
  segments,
  centerLabel,
  size = 104,
  thickness = 15,
  gapDeg = 6,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const gap = (gapDeg / 360) * circumference;

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#eef0f4" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const dash = Math.max(0, fraction * circumference - gap);
          const circle = (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-(offset + gap / 2)}
              strokeLinecap="round"
            />
          );
          offset += fraction * circumference;
          return circle;
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-light text-navy">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
