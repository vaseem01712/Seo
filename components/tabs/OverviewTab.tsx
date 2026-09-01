import type { AuditResult } from "@/lib/types";
import SignalGauge from "../SignalGauge";
import StatCard from "../StatCard";
import IssueRow from "../IssueRow";
import { ArrowRight, CheckCircle2, Gauge, Globe2, ShieldCheck, Zap } from "lucide-react";

export default function OverviewTab({ result }: { result: AuditResult }) {
  const topIssues = [...result.issues].sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity)).slice(0, 6);
  return (
    <div className="space-y-5 animate-rise">
      <section className="dino-hero-card">
        <div className="dino-hero-copy">
          <div className="dino-eyebrow">DISCOVER · ANALYZE · DOMINATE</div>
          <h2>LIFE FINDS<br /><em>A WAY.</em></h2>
          <p>Explore every SEO signal hiding inside <strong>{result.domain}</strong>. Fast crawling, clear diagnostics and actionable opportunities.</p>
          <div className="dino-hero-meta"><span><Zap size={14}/> {result.summary.totalPages} pages scanned</span><span><Gauge size={14}/> {result.crawlDurationMs < 3000 ? "Ultra fast" : "Deep crawl"}</span></div>
        </div>
        <div className="dino-hero-dino" aria-hidden="true"><div className="dino-hero-glow" /></div>
        <div className="dino-hero-score"><SignalGauge score={result.score.overall} size={160} /></div>
      </section>

      <div className="dino-stat-grid">
        <StatCard label="Critical issues" value={result.summary.critical} tone={result.summary.critical > 0 ? "crit" : "good"} />
        <StatCard label="Warnings" value={result.summary.warning} tone={result.summary.warning > 0 ? "warn" : "good"} />
        <StatCard label="Pages scanned" value={result.summary.totalPages} />
        <StatCard label="Audit speed" value={`${(result.crawlDurationMs / 1000).toFixed(1)}s`} tone={result.crawlDurationMs < 5000 ? "good" : "warn"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5">
        <section className="card p-5 dino-panel">
          <div className="dino-panel-head"><div><h3>SEO Health Expedition</h3><span>Core signals from this crawl</span></div><div className="dino-health-badge"><ShieldCheck size={15}/> {result.score.overall}/100</div></div>
          <div className="dino-health-grid">
            <Health label="Technical SEO" score={result.score.technical} icon={<ShieldCheck size={16}/>} />
            <Health label="On-Page SEO" score={result.score.onpage} icon={<Globe2 size={16}/>} />
            <Health label="Performance" score={result.score.performance} icon={<Zap size={16}/>} />
            <Health label="AI Visibility" score={result.score.ai} icon={<Gauge size={16}/>} />
          </div>
        </section>
        <section className="card p-5 dino-panel dino-quick">
          <div className="dino-panel-head"><div><h3>Quick Actions</h3><span>Keep exploring the site</span></div></div>
          <div className="dino-quick-row"><span><Zap size={16}/></span><div><b>Run New Audit</b><small>Analyze another domain</small></div><ArrowRight size={15}/></div>
          <div className="dino-quick-row"><span><ShieldCheck size={16}/></span><div><b>Fix Critical Issues</b><small>{result.summary.critical} high-priority findings</small></div><ArrowRight size={15}/></div>
          <div className="dino-quick-row"><span><Globe2 size={16}/></span><div><b>Explore Pages</b><small>{result.summary.totalPages} pages discovered</small></div><ArrowRight size={15}/></div>
        </section>
      </div>

      <section className="card p-5 dino-panel">
        <div className="dino-panel-head"><div><h3>Highest-impact discoveries</h3><span>Sorted by severity</span></div></div>
        {topIssues.length === 0 ? <div className="text-[13px] text-muted py-8 text-center">No issues found — this expedition came back clean.</div> : topIssues.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
      </section>
    </div>
  );
}

function severityWeight(s: string) { return s === "critical" ? 3 : s === "warning" ? 2 : 1; }
function Health({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const state = score >= 80 ? "Excellent" : score >= 50 ? "Needs work" : "Critical";
  return <div className="dino-health-item"><span className="dino-health-icon">{icon}</span><div className="flex-1 min-w-0"><div className="flex justify-between gap-2"><span className="text-[12px] text-white/80 truncate">{label}</span><b className="tabular-mono text-[13px]">{score}</b></div><div className="dino-progress"><i style={{ width: `${score}%` }} /></div><small>{state}</small></div></div>;
}
