"use client";

import { useState } from "react";
import Sidebar, { TabKey } from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import type { AuditResult } from "@/lib/types";
import { RadioTower, AlertCircle } from "lucide-react";

import OverviewTab from "@/components/tabs/OverviewTab";
import PerformanceTab from "@/components/tabs/PerformanceTab";
import TechnicalSeoTab from "@/components/tabs/TechnicalSeoTab";
import OnPageSeoTab from "@/components/tabs/OnPageSeoTab";
import OpportunitiesTab from "@/components/tabs/OpportunitiesTab";
import AiVisibilityTab from "@/components/tabs/AiVisibilityTab";
import CompetitorsTab from "@/components/tabs/CompetitorsTab";
import ReportsTab from "@/components/tabs/ReportsTab";

const TAB_LABEL: Record<TabKey, string> = {
  overview: "Overview",
  performance: "Performance",
  technical: "Technical SEO",
  onpage: "On-Page SEO",
  opportunities: "Opportunities",
  ai: "AI Visibility",
  competitors: "Competitors",
  reports: "Reports",
};

export default function Home() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const startAudit = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The audit failed unexpectedly.");
      setResult(data);
      setTab("overview");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={tab} onChange={setTab} />

      <div className="content-shell flex-1 min-w-0 relative">
        <TopBar
          url={url}
          setUrl={setUrl}
          maxPages={maxPages}
          setMaxPages={setMaxPages}
          loading={loading}
          onStart={startAudit}
        />

        <main className="jurassic-main px-8 py-6 relative">
          <div className="mb-5 relative z-10">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted mb-1">
              SEO Dashboard
            </div>
            <h1 className="font-display text-2xl font-semibold">{TAB_LABEL[tab]}</h1>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-crit/30 bg-crit/10 text-crit text-[13.5px]">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!result ? (
            <div className="relative z-10">
              <EmptyState loading={loading} />
            </div>
          ) : (
            <div className="relative z-10">
              {tab === "overview" && <OverviewTab result={result} />}
              {tab === "performance" && <PerformanceTab result={result} />}
              {tab === "technical" && <TechnicalSeoTab result={result} />}
              {tab === "onpage" && <OnPageSeoTab result={result} />}
              {tab === "opportunities" && <OpportunitiesTab result={result} />}
              {tab === "ai" && <AiVisibilityTab result={result} />}
              {tab === "competitors" && <CompetitorsTab result={result} />}
              {tab === "reports" && <ReportsTab result={result} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="relative w-14 h-14 flex items-center justify-center mb-5">
        <span className={`absolute w-14 h-14 rounded-full border border-signal/30 ${loading ? "animate-pulseDot" : ""}`} />
        <RadioTower size={22} className="text-signal" />
      </div>
      <h2 className="font-display text-lg font-semibold mb-2">
        {loading ? "Reading the signal…" : "Run your first SEO audit"}
      </h2>
      <p className="text-[13.5px] text-muted max-w-md leading-relaxed">
        {loading
          ? "Rapid crawl in progress — pages are fetched in parallel so results arrive much faster."
          : "Enter a URL above and start an audit. The crawler scans your internal pages and surfaces every SEO issue, with the exact page it lives on."}
      </p>
    </div>
  );
}
