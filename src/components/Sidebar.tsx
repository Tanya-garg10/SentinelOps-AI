import React from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Bot,
  BookOpen,
  FileCheck2,
  FileText,
  Lock,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeIncidentsCount: number;
  alertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeIncidentsCount,
  alertsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Incident Console', icon: Activity, badge: activeIncidentsCount > 0 ? 'P1' : undefined, badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { id: 'alerts', label: 'Alert Triage Feed', icon: AlertTriangle, badge: String(alertsCount), badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'agents', label: 'SRE Agent Swarm', icon: Bot, badge: '4 Active', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'runbooks', label: 'Approved Runbooks', icon: BookOpen },
    { id: 'governance', label: 'Safe AI & Policies', icon: Lock, badge: '10 Rules', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'audit', label: 'AIMS Audit Ledger', icon: FileCheck2 },
    { id: 'rca', label: 'Postmortem Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 tracking-tight text-base">SentinelOps</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Governed SRE Platform</p>
          </div>
        </div>
      </div>

      {/* Primary Tagline */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80">
        <p className="text-[11px] text-slate-400 font-mono leading-tight">
          &ldquo;Investigate autonomously. Remediate safely. Prove everything.&rdquo;
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Operational Views
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cluster & Engine Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Lyzr Agent SDK
          </span>
          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Cluster</span>
          <span className="text-slate-300">prod-useast-01</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Safe AI Mode</span>
          <span className="text-cyan-400">DETERMINISTIC</span>
        </div>
      </div>
    </aside>
  );
};
