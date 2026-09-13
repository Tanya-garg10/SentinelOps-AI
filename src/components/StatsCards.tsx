import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  BrainCircuit,
  CheckCircle2,
} from 'lucide-react';
import { Incident } from '../types';

interface StatsCardsProps {
  incident: Incident;
  alertsCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ incident, alertsCount }) => {
  const isResolved = incident.status === 'RESOLVED';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Incident Status</span>
          <Activity className={`w-4 h-4 ${isResolved ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isResolved ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className="font-bold text-sm text-slate-100 tracking-tight">
              {isResolved ? 'RESOLVED' : 'ACTIVE P1'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {isResolved ? 'Stable on v2.8.0' : 'Degraded v2.8.1'}
          </span>
        </div>
      </div>

      {/* 2. Target Service */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Primary Service</span>
          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">PROD</span>
        </div>
        <div className="mt-2">
          <div className="font-bold text-sm text-cyan-300 font-mono truncate">checkout-api</div>
          <span className="text-[11px] text-slate-400 font-mono">ecommerce ns</span>
        </div>
      </div>

      {/* 3. Correlated Alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Correlated Alerts</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="font-bold text-sm text-slate-100 font-mono">
            {incident.correlated_alerts.length} <span className="text-xs font-normal text-slate-400">signals</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">Deduplicated</span>
        </div>
      </div>

      {/* 4. MTTR / Speed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Diagnosis Speed</span>
          <Clock className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="font-bold text-sm text-slate-100 font-mono">18s</div>
          <span className="text-[11px] text-slate-400 font-mono">Autonomous</span>
        </div>
      </div>

      {/* 5. Agent Confidence */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Agent Confidence</span>
          <BrainCircuit className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2">
          <div className="font-bold text-sm text-purple-300 font-mono">
            {Math.round(incident.confidence * 100)}%
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">&gt; 90% Gate Cleared</span>
        </div>
      </div>

      {/* 6. Governance Safety Check */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Policy Governance</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="font-bold text-xs text-emerald-300 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HITL ENFORCED</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Rule 4 &amp; Safe AI</span>
        </div>
      </div>
    </div>
  );
};
