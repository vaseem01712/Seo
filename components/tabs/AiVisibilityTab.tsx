import type { AuditResult } from "@/lib/types";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import StatCard from "../StatCard";

export default function AiVisibilityTab({ result }: { result: AuditResult }) {
  const { domainChecks: d, pages } = result;
  const withSchema = pages.filter((p) => p.hasJsonLd).length;
  const withOg = pages.filter((p) => p.hasOpenGraph).length;
  const schemaTypes = Array.from(new Set(pages.flatMap((p) => p.jsonLdTypes)));

  return (
    <div className="space-y-6 animate-rise">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="AI Visibility score" value={result.score.ai} />
        <StatCard
          label="Structured data coverage"
          value={pages.length ? `${Math.round((withSchema / pages.length) * 100)}%` : "0%"}
        />
        <StatCard
          label="Open Graph coverage"
          value={pages.length ? `${Math.round((withOg / pages.length) * 100)}%` : "0%"}
        />
        <StatCard label="llms.txt" value={d.llmsTxt.exists ? "Found" : "Missing"} tone={d.llmsTxt.exists ? "good" : "warn"} />
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-3">AI crawler access</h3>
        {d.robotsTxt.blocksAiBots.length === 0 ? (
          <div className="flex items-center gap-2 text-[13.5px] text-good">
            <CheckCircle2 size={16} /> No major AI bots are blocked in robots.txt
          </div>
        ) : (
          <div className="flex items-start gap-2 text-[13.5px] text-warn">
            <AlertTriangle size={16} className="mt-0.5" />
            <span>
              robots.txt blocks: <span className="tabular-mono">{d.robotsTxt.blocksAiBots.join(", ")}</span>. These
              crawlers won't be able to read this site to answer questions about it.
            </span>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-1">Structured data found</h3>
        <p className="text-[12px] text-muted mb-3">
          Schema types help AI systems and search engines summarize this content accurately.
        </p>
        {schemaTypes.length === 0 ? (
          <div className="flex items-center gap-2 text-[13.5px] text-crit">
            <XCircle size={16} /> No JSON-LD structured data detected on any crawled page
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {schemaTypes.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-md bg-ink-100 border border-border text-[12px] tabular-mono text-white"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
