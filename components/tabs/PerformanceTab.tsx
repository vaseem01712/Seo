import type { AuditResult } from "@/lib/types";
import StatCard from "../StatCard";

export default function PerformanceTab({ result }: { result: AuditResult }) {
  const pages = result.pages;
  const avgTime = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.responseTimeMs, 0) / pages.length)
    : 0;
  const avgSize = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.sizeBytes, 0) / pages.length / 1024)
    : 0;
  const slowest = [...pages].sort((a, b) => b.responseTimeMs - a.responseTimeMs).slice(0, 10);

  return (
    <div className="space-y-6 animate-rise">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Avg response time" value={`${avgTime}ms`} tone={avgTime > 1000 ? "warn" : "good"} />
        <StatCard label="Avg page weight" value={`${avgSize}KB`} tone={avgSize > 800 ? "warn" : "good"} />
        <StatCard label="Score" value={result.score.performance} />
        <StatCard
          label="Pages over 1.5s"
          value={pages.filter((p) => p.responseTimeMs > 1500).length}
        />
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-3">Response time by page</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11px] uppercase tracking-wide border-b border-border">
                <th className="py-2 pr-4 font-medium">URL</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 pr-4 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {slowest.map((p) => (
                <tr key={p.url} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 tabular-mono text-signal/80 truncate max-w-[280px]">
                    {pathOf(p.url)}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={p.ok ? "text-good" : "text-crit"}>{p.statusCode || "—"}</span>
                  </td>
                  <td className={`py-2.5 pr-4 tabular-mono ${p.responseTimeMs > 1500 ? "text-warn" : "text-white"}`}>
                    {p.responseTimeMs}ms
                  </td>
                  <td className="py-2.5 pr-4 tabular-mono text-muted">
                    {(p.sizeBytes / 1024).toFixed(0)}KB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function pathOf(url: string) {
  try {
    const u = new URL(url);
    return u.pathname === "" ? "/" : u.pathname;
  } catch {
    return url;
  }
}
