export default function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "good" | "warn" | "crit";
}) {
  const toneColor =
    tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : tone === "crit" ? "text-crit" : "text-white";

  return (
    <div className="card px-5 py-4 animate-rise">
      <div className="text-[11px] uppercase tracking-wide text-muted mb-2">{label}</div>
      <div className={`font-display text-2xl font-semibold tabular-mono ${toneColor}`}>{value}</div>
      {sub && <div className="text-[11.5px] text-muted mt-1">{sub}</div>}
    </div>
  );
}
