import type { AuditResult } from "@/lib/types";

export default function OnPageSeoTab({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-6 animate-rise">
      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-3">On-page elements by URL</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11px] uppercase tracking-wide border-b border-border">
                <th className="py-2 pr-4 font-medium">URL</th>
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Meta desc.</th>
                <th className="py-2 pr-4 font-medium">H1s</th>
                <th className="py-2 pr-4 font-medium">Words</th>
                <th className="py-2 pr-4 font-medium">Alt missing</th>
              </tr>
            </thead>
            <tbody>
              {result.pages.map((p) => (
                <tr key={p.url} className="border-b border-border/60 last:border-0 align-top">
                  <td className="py-2.5 pr-4 tabular-mono text-signal/80 truncate max-w-[200px]">
                    {pathOf(p.url)}
                  </td>
                  <td className="py-2.5 pr-4 max-w-[220px]">
                    <div className="text-white truncate">{p.title || <span className="text-crit">Missing</span>}</div>
                    <div className="text-[11px] text-muted">{p.titleLength} chars</div>
                  </td>
                  <td className="py-2.5 pr-4 max-w-[220px]">
                    <div className="text-white truncate">
                      {p.metaDescription || <span className="text-crit">Missing</span>}
                    </div>
                    <div className="text-[11px] text-muted">{p.metaDescriptionLength} chars</div>
                  </td>
                  <td className="py-2.5 pr-4 text-muted">
                    <span className={p.h1.length === 1 ? "text-good" : "text-warn"}>{p.h1.length}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-muted">{p.wordCount}</td>
                  <td className="py-2.5 pr-4">
                    <span className={p.imagesMissingAlt > 0 ? "text-warn" : "text-muted"}>
                      {p.imagesMissingAlt}/{p.imagesTotal}
                    </span>
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
