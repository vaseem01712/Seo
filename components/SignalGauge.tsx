"use client";

interface Props {
  score: number;
  label?: string;
  size?: number;
}

function bandColor(score: number) {
  if (score >= 80) return "#3DDC97";
  if (score >= 50) return "#F2B84B";
  return "#FF5C6C";
}

export default function SignalGauge({ score, label = "Signal Strength", size = 220 }: Props) {
  const radius = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 180;
  const endAngle = 0;
  const clamped = Math.max(0, Math.min(100, score));
  const sweep = (clamped / 100) * 180;
  const color = bandColor(clamped);

  const polarToCartesian = (angleDeg: number) => {
    const rad = (Math.PI / 180) * angleDeg;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const arcPath = (a0: number, a1: number) => {
    const p0 = polarToCartesian(a0);
    const p1 = polarToCartesian(a1);
    const largeArc = a0 - a1 > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="#1E2330"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={arcPath(startAngle, startAngle - sweep)}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease, d 0.6s ease" }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="tabular-mono"
          fontSize={size * 0.22}
          fontWeight={600}
          fill="#E7E9EE"
        >
          {clamped}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize={12} fill="#8A93A6">
          / 100
        </text>
      </svg>
      <span className="text-xs uppercase tracking-[0.18em] text-muted mt-1">{label}</span>
    </div>
  );
}
