import type { AuditResult, Issue } from "@/lib/types";
import { SeverityBadge } from "../IssueRow";

interface Group {
  title: string;
  description: string;
  severity: Issue["severity"];
  category: Issue["category"];
  urls: string[];
}

function severityWeight(s: Issue["severity"]) {
  return s === "critical" ? 3 : s === "warning" ? 2 : 1;
}

export default function OpportunitiesTab({ result }: { result: AuditResult }) {
  const groups = new Map<string, Group>();
  for (const issue of result.issues) {
    const existing = groups.get(issue.title);
    if (existing) {
      existing.urls.push(issue.url);
    } else {
      groups.set(issue.title, {
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        category: issue.category,
        urls: [issue.url],
      });
    }
  }

  const sorted = Array.from(groups.values()).sort(
    (a, b) => severityWeight(b.severity) * b.urls.length - severityWeight(a.severity) * a.urls.length
  );

  return (
    <div className="space-y-4 animate-rise">
      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-1">Prioritized opportunities</h3>
        <p className="text-[12px] text-muted mb-2">
          Issues grouped by type and ranked by severity × how many pages they affect.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-8 text-center text-[13px] text-muted">
          No opportunities found — every checked signal came back clean.
        </div>
      ) : (
        sorted.map((g) => (
          <div key={g.title} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <SeverityBadge severity={g.severity} />
                  <span className="text-[11px] uppercase tracking-wide text-muted">{g.category}</span>
                </div>
                <div className="text-[14.5px] text-white font-medium">{g.title}</div>
                <div className="text-[12.5px] text-muted mt-1 max-w-2xl leading-relaxed">{g.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-xl font-semibold tabular-mono">{g.urls.length}</div>
                <div className="text-[11px] text-muted">page{g.urls.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
