import type { Issue } from "@/lib/types";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export function SeverityBadge({ severity }: { severity: Issue["severity"] }) {
  const map = {
    critical: { icon: AlertTriangle, cls: "text-crit bg-crit/10 border-crit/30", label: "Critical" },
    warning: { icon: AlertCircle, cls: "text-warn bg-warn/10 border-warn/30", label: "Warning" },
    info: { icon: Info, cls: "text-info bg-info/10 border-info/30", label: "Info" },
  } as const;
  const { icon: Icon, cls, label } = map[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

export default function IssueRow({ issue }: { issue: Issue }) {
  let path = issue.url;
  try {
    const u = new URL(issue.url);
    path = u.pathname === "" ? "/" : u.pathname;
  } catch {
    // keep raw
  }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/70 last:border-0">
      <SeverityBadge severity={issue.severity} />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] text-white">{issue.title}</div>
        <div className="text-[12px] text-muted mt-0.5 leading-relaxed">{issue.description}</div>
        <div className="text-[11px] text-signal/80 mt-1 tabular-mono truncate">{path}</div>
      </div>
    </div>
  );
}
