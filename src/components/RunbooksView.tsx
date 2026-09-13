import React from 'react';
import { BookOpen, ShieldCheck, AlertOctagon, Terminal } from 'lucide-react';
import { INITIAL_RUNBOOKS } from '../data/mockData';

export const RunbooksView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Approved Operational Runbook Catalog</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Agents may only propose actions from this strict allowlist. Arbitrary shell commands and unapproved operations are deterministically blocked.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Rule 1 &amp; Rule 8 Enforced</span>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_RUNBOOKS.map((rb) => (
          <div key={rb.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  {rb.id}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    rb.risk === 'READ_ONLY'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : rb.risk === 'LOW_RISK'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : rb.risk === 'MEDIUM_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {rb.risk}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 font-mono">{rb.name}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{rb.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Target:</span>
                <span className="text-slate-200">{rb.target_type}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Prod Human Gate:</span>
                <span className={rb.requires_approval_in_prod ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                  {rb.requires_approval_in_prod ? 'REQUIRED (Rule 4)' : 'Autonomous Allowed'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {rb.allowed_parameters.map((p) => (
                  <span key={p} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prohibited Actions Banner */}
      <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-red-400 uppercase font-mono">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span>Permanently Prohibited Operations (Zero-Tolerance Block)</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          The following destructive actions are permanently classified as DESTRUCTIVE and will be automatically BLOCKED by the deterministic PolicyEngine:
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {['DROP_DATABASE', 'DELETE_NAMESPACE', 'DELETE_PRODUCTION_DATA', 'REBOOT_PRODUCTION_NODE', 'TRUNCATE_TABLE', 'DISABLE_AUTH'].map((op) => (
            <span key={op} className="px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-800/50">
              🔴 {op}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
