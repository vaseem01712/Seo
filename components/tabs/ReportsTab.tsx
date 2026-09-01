"use client";

import type { AuditResult } from "@/lib/types";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsTab({ result }: { result: AuditResult }) {
  const domainSlug = result.domain.replace(/^https?:\/\//, "").replace(/[^a-z0-9.-]/gi, "_");

  const exportJson = () => {
    download(`signal-audit-${domainSlug}.json`, JSON.stringify(result, null, 2), "application/json");
  };

  const exportCsv = () => {
    const header = ["Severity", "Category", "Title", "Description", "URL"];
    const rows = result.issues.map((i) => [i.severity, i.category, i.title, i.description, i.url]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    download(`signal-issues-${domainSlug}.csv`, csv, "text/csv");
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-1">Export this audit</h3>
        <p className="text-[12px] text-muted mb-4">
          Download the full crawl result for {result.domain}, captured {new Date(result.crawledAt).toLocaleString()}.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportJson}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink-100 border border-border text-[13px] hover:border-signal/40 transition-colors"
          >
            <FileJson size={15} className="text-signal" /> Download full JSON
            <Download size={13} className="text-muted" />
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink-100 border border-border text-[13px] hover:border-signal/40 transition-colors"
          >
            <FileSpreadsheet size={15} className="text-signal" /> Download issues CSV
            <Download size={13} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-3">Summary</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <dt className="text-muted text-[11px] uppercase tracking-wide mb-1">Overall score</dt>
            <dd className="tabular-mono text-lg font-semibold">{result.score.overall}/100</dd>
          </div>
          <div>
            <dt className="text-muted text-[11px] uppercase tracking-wide mb-1">Pages crawled</dt>
            <dd className="tabular-mono text-lg font-semibold">{result.summary.totalPages}</dd>
          </div>
          <div>
            <dt className="text-muted text-[11px] uppercase tracking-wide mb-1">Total issues</dt>
            <dd className="tabular-mono text-lg font-semibold">{result.issues.length}</dd>
          </div>
          <div>
            <dt className="text-muted text-[11px] uppercase tracking-wide mb-1">Crawl time</dt>
            <dd className="tabular-mono text-lg font-semibold">{(result.crawlDurationMs / 1000).toFixed(1)}s</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
