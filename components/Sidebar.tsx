"use client";

import { RadioTower, TrendingUp, Cpu, FileText, Sparkles, BrainCircuit, Users, ClipboardList, Footprints } from "lucide-react";

export type TabKey = "overview" | "performance" | "technical" | "onpage" | "opportunities" | "ai" | "competitors" | "reports";

const NAV: { key: TabKey; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: RadioTower },
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "technical", label: "Technical SEO", icon: Cpu },
  { key: "onpage", label: "On-Page SEO", icon: FileText },
  { key: "opportunities", label: "Opportunities", icon: Sparkles },
  { key: "ai", label: "AI Visibility", icon: BrainCircuit },
  { key: "competitors", label: "Competitors", icon: Users },
  { key: "reports", label: "Reports", icon: ClipboardList },
];

export default function Sidebar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <aside className="dino-sidebar">
      <div className="dino-brand">
        <div className="dino-brand-art"><img src="/dino-logo.svg" alt="Dino Explorer" /></div>
        <div className="dino-brand-copy"><strong>DINO</strong><span>EXPLORER</span></div>
      </div>

      <div className="dino-side-caption"><Footprints size={12} /> SEO INTELLIGENCE</div>
      <nav className="dino-nav">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <button key={key} onClick={() => onChange(key)} className={`dino-nav-item ${isActive ? "active" : ""}`}>
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
              {isActive && <i />}
            </button>
          );
        })}
      </nav>

      <div className="dino-side-tip">
        <div className="dino-tip-label">JURASSIC TIP</div>
        <p>Just like dinosaurs adapted to survive, your website must evolve to rank.</p>
      </div>
      <div className="dino-side-foot">Same-origin crawl · robots.txt aware</div>
    </aside>
  );
}
