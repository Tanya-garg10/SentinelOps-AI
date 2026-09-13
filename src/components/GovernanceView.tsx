import React from 'react';
import { Lock, ShieldCheck, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GOVERNANCE_POLICIES } from '../data/mockData';

export const GovernanceView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Safe AI &amp; Deterministic Policy Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic governance operates outside LLM inference to guarantee boundary containment, prevent unauthorized modifications, and enforce Human-in-the-Loop oversight.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>10 SRE Invariants Active</span>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOVERNANCE_POLICIES.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  {p.id}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    p.action_on_breach === 'BLOCK'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  BREACH ACTION: {p.action_on_breach}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
              <div className="text-[11px] font-mono text-cyan-300 mt-0.5">{p.rule}</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Severity Tier: <span className="text-slate-200">{p.severity_tier}</span></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Invariant
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
