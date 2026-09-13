import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Zap,
  RotateCcw,
  CheckCircle2,
  Server,
  Layers,
} from 'lucide-react';

interface TopBarProps {
  systemStatus: string;
  onSimulateIncident: () => void;
  onTestDangerousAction: () => void;
  onReset: () => void;
  isSimulating: boolean;
  isEvaluatingDangerous: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  systemStatus,
  onSimulateIncident,
  onTestDangerousAction,
  onReset,
  isSimulating,
  isEvaluatingDangerous,
}) => {
  const isDegraded = systemStatus !== 'OPERATIONAL';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      {/* Left: Environment & Health Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-300 font-medium">prod-useast-01.k8s.internal</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
            isDegraded
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isDegraded ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isDegraded ? 'SYSTEM DEGRADED (P1 INCIDENT)' : 'CLUSTER HEALTHY (ALL NOMINAL)'}</span>
        </div>
      </div>

      {/* Right: Quick Action CTAs */}
      <div className="flex items-center gap-3">
        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset Simulation State"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Test Dangerous Action CTA */}
        <button
          onClick={onTestDangerousAction}
          disabled={isEvaluatingDangerous}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-300 border border-red-500/40 hover:bg-red-900/40 hover:border-red-500 transition-all shadow-sm group"
        >
          <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          <span>{isEvaluatingDangerous ? 'Evaluating Policy...' : 'Test Dangerous Action'}</span>
        </button>

        {/* Simulate P1 Incident CTA */}
        <button
          onClick={onSimulateIncident}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>{isSimulating ? 'Simulating Storm...' : 'Simulate P1 Incident'}</span>
        </button>
      </div>
    </header>
  );
};
