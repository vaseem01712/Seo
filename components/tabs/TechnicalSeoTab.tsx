import type { AuditResult } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

function CheckRow({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/60 last:border-0">
      {ok ? <CheckCircle2 size={16} className="text-good mt-0.5" /> : <XCircle size={16} className="text-crit mt-0.5" />}
      <div>
        <div className="text-[13.5px] text-white">{label}</div>
        {detail && <div className="text-[12px] text-muted mt-0.5">{detail}</div>}
      </div>
    </div>
  );
}

export default function TechnicalSeoTab({ result }: { result: AuditResult }) {
  const { domainChecks: d, pages } = result;

  return (
    <div className="space-y-6 animate-rise">
      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-1">Domain-level checks</h3>
        <p className="text-[12px] text-muted mb-2">Checked once for {result.domain}</p>
        <CheckRow ok={d.https} label="Served over HTTPS" />
        <CheckRow
          ok={d.robotsTxt.exists}
          label="robots.txt present"
          detail={d.robotsTxt.exists ? (d.robotsTxt.disallowsAll ? "Warning: disallows all crawlers" : "Readable and not blocking everything") : "No robots.txt found at the domain root"}
        />
        <CheckRow
          ok={d.sitemapXml.exists}
          label="sitemap.xml present"
          detail={d.sitemapXml.exists ? `${d.sitemapXml.urlCount} URLs listed` : "No sitemap.xml found at the domain root"}
        />
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-3">Per-page technical status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11px] uppercase tracking-wide border-b border-border">
                <th className="py-2 pr-4 font-medium">URL</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Canonical</th>
                <th className="py-2 pr-4 font-medium">Robots</th>
                <th className="py-2 pr-4 font-medium">Lang</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.url} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 tabular-mono text-signal/80 truncate max-w-[240px]">
                    {pathOf(p.url)}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={p.ok ? "text-good" : "text-crit"}>{p.statusCode || "—"}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-muted">{p.canonical ? "Yes" : "—"}</td>
                  <td className="py-2.5 pr-4 text-muted">{p.metaRobots || "default"}</td>
                  <td className="py-2.5 pr-4 text-muted">{p.lang || "—"}</td>
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
