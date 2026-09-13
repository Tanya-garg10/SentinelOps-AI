import React from 'react';
import {
  ShieldAlert,
  X,
  AlertOctagon,
  Ban,
  CheckCircle2,
  Lock,
  FileCheck2,
  Radio,
} from 'lucide-react';

interface DangerousActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const DangerousActionModal: React.FC<DangerousActionModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  const gov = result.governance_result || {};
  const proposal = result.proposal || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl shadow-red-950/50 space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  SAFE AI GOVERNANCE SHIELD
                </span>
                <span className="text-xs font-mono text-slate-400">Rule 5 &amp; Rule 3 Enforced</span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                Destructive Operation Containment Test
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Block Banner */}
        <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-4 flex items-center gap-3.5">
          <Ban className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <div className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
              POLICY DECISION: BLOCKED (0% EXECUTION)
            </div>
            <p className="text-xs text-red-200 font-semibold mt-0.5">
              &ldquo;{gov.reason || 'Destructive production database operation is not permitted by autonomous agents.'}&rdquo;
            </p>
          </div>
        </div>

        {/* Attempted Action vs Target */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Prohibited Action</span>
            <div className="text-red-400 font-bold mt-0.5">{proposal.action || 'DROP_DATABASE'}</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Target</span>
            <div className="text-slate-200 font-bold mt-0.5">{proposal.target || 'checkout_prod'}</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Environment</span>
            <div className="text-amber-300 font-bold mt-0.5">PRODUCTION</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Risk Rating</span>
            <div className="text-red-400 font-bold mt-0.5">DESTRUCTIVE</div>
          </div>
        </div>

        {/* Deterministic Policy Checks Evaluated */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
            Deterministic Rule Assertions:
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            {gov.policy_checks?.map((chk: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{chk.rule}</span>
                </div>
                <span className="text-[10px] text-red-400 font-bold bg-red-950/50 px-2 py-0.5 rounded border border-red-900/40">
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SRE Invariant Tagline */}
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <span>AIMS Audit Event Logged with tamper-evident signature</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Zero Side-Effects</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 italic">
            &ldquo;SentinelOps can investigate autonomously, but it cannot become the incident.&rdquo;
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Dismiss Verification
          </button>
        </div>
      </div>
    </div>
  );
};
