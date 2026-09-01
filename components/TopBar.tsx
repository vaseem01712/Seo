"use client";

import { Search, Loader2, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function TopBar({ url, setUrl, maxPages, setMaxPages, loading, onStart }: {
  url: string; setUrl: (v: string) => void; maxPages: number; setMaxPages: (v: number) => void; loading: boolean; onStart: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <header className="dino-topbar">
      <div className={`dino-search ${loading ? "scan-border" : ""}`}>
        <Search size={16} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && onStart()} placeholder="Search website, audit, report..." disabled={loading} />
        <span className="dino-kbd">⌘</span>
      </div>
      <div className="dino-top-actions">
        <div className="relative">
          <button onClick={() => setShowSettings((s) => !s)} className="dino-pages-btn"><Settings2 size={15} /> {maxPages} pages</button>
          {showSettings && <div className="dino-settings card p-4 z-30 animate-rise">
            <div className="text-[11px] uppercase tracking-[.14em] text-muted mb-3">Crawl settings</div>
            <label className="flex justify-between text-[13px] mb-2"><span>Maximum pages</span><b className="text-signal tabular-mono">{maxPages}</b></label>
            <input type="range" min={1} max={50} value={maxPages} onChange={(e) => setMaxPages(Number(e.target.value))} className="w-full accent-[#d8a64f]" />
            <div className="flex justify-between text-[10px] text-muted mt-1"><span>1</span><span>50</span></div>
          </div>}
        </div>
        <button onClick={onStart} disabled={loading || !url.trim()} className="dino-audit-btn">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Scanning...</> : <><Sparkles size={15} /> Run Audit</>}
        </button>
      </div>
    </header>
  );
}
