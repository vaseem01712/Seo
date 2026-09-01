"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/types";
import { Plus, Loader2, X } from "lucide-react";

interface CompetitorEntry {
  url: string;
  loading: boolean;
  error?: string;
  result?: AuditResult;
}

export default function CompetitorsTab({ result }: { result: AuditResult }) {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<CompetitorEntry[]>([]);

  const addCompetitor = async () => {
    const url = input.trim();
    if (!url) return;
    setInput("");
    setEntries((prev) => [...prev, { url, loading: true }]);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setEntries((prev) =>
        prev.map((e) => (e.url === url ? { ...e, loading: false, result: data } : e))
      );
    } catch (err: any) {
      setEntries((prev) =>
        prev.map((e) => (e.url === url ? { ...e, loading: false, error: err.message } : e))
      );
    }
  };

  const remove = (url: string) => setEntries((prev) => prev.filter((e) => e.url !== url));

  const rows = [
    { label: result.domain, score: result.score, isYou: true },
    ...entries
      .filter((e) => e.result)
      .map((e) => ({ label: e.result!.domain, score: e.result!.score, isYou: false })),
  ];

  return (
    <div className="space-y-6 animate-rise">
      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-1">Compare against competitors</h3>
        <p className="text-[12px] text-muted mb-3">
          Add a competitor's homepage to run a quick single-page scan and compare scores.
        </p>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
            placeholder="competitor.com"
            className="flex-1 bg-ink-200 border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] tabular-mono outline-none focus:border-signal/50"
          />
          <button
            onClick={addCompetitor}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-signal text-ink font-semibold text-[13px] hover:brightness-110"
          >
            <Plus size={15} /> Add
          </button>
        </div>

        {entries.some((e) => e.loading || e.error) && (
          <div className="mt-3 space-y-1.5">
            {entries
              .filter((e) => e.loading || e.error)
              .map((e) => (
                <div key={e.url} className="flex items-center gap-2 text-[12.5px]">
                  {e.loading ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-signal" />
                      <span className="text-muted tabular-mono">{e.url}</span>
                    </>
                  ) : (
                    <>
                      <X size={13} className="text-crit" />
                      <span className="text-crit tabular-mono">{e.url}</span>
                      <span className="text-muted">— {e.error}</span>
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-semibold mb-3">Score comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11px] uppercase tracking-wide border-b border-border">
                <th className="py-2 pr-4 font-medium">Domain</th>
                <th className="py-2 pr-4 font-medium">Overall</th>
                <th className="py-2 pr-4 font-medium">Technical</th>
                <th className="py-2 pr-4 font-medium">On-Page</th>
                <th className="py-2 pr-4 font-medium">Performance</th>
                <th className="py-2 pr-4 font-medium">AI Visibility</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 tabular-mono">
                    {r.label} {r.isYou && <span className="text-signal text-[11px] ml-1">(you)</span>}
                  </td>
                  <td className="py-2.5 pr-4 font-semibold tabular-mono">{r.score.overall}</td>
                  <td className="py-2.5 pr-4 tabular-mono text-muted">{r.score.technical}</td>
                  <td className="py-2.5 pr-4 tabular-mono text-muted">{r.score.onpage}</td>
                  <td className="py-2.5 pr-4 tabular-mono text-muted">{r.score.performance}</td>
                  <td className="py-2.5 pr-4 tabular-mono text-muted">{r.score.ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
